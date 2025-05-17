import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Check, X, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './DataEntryPage.css';

// Toast Component
const Toast = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`data-entry-toast data-entry-toast-${type}`}>
      <div className="flex items-center space-x-2">
        {type === 'success' ? (
          <Check className="w-5 h-5 text-cyan-400" />
        ) : (
          <X className="w-5 h-5 text-red-400" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Validation Utility
const validateDataEntry = (data) => {
  const errors = {};
  const requiredFields = ['date', 'shift', 'lineNumber', 'machineName', 'productId', 'totalProductTarget', 'priority', 'workerId'];
  requiredFields.forEach((field) => {
    if (!data[field]?.toString().trim()) {
      errors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
    }
  });
  if (data.totalProductTarget && (isNaN(data.totalProductTarget) || data.totalProductTarget < 0)) {
    errors.totalProductTarget = 'Total Product Target must be a positive number';
  }
  if (data.priority && (isNaN(data.priority) || data.priority < 0 || data.priority > 1)) {
    errors.priority = 'Priority must be a number between 0 and 1';
  }
  return errors;
};

const DataEntryPage = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [file, setFile] = useState(null);
  const [attendanceFile, setAttendanceFile] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    lineNumber: '',
    machineName: '',
    productId: '',
    shift: '',
    totalProductTarget: '',
    priority: '',
    workerId: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [dragActive, setDragActive] = useState(false);
  const [attendanceDragActive, setAttendanceDragActive] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeAllocations, setActiveAllocations] = useState({}); // Track active allocations
  const rowsPerPage = 10;

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      date: '',
      shift: '',
      lineNumber: '',
      machineName: '',
      productId: '',
      totalProductTarget: '',
      priority: '',
      workerId: '', // Added for worker assignment
      hoursWorked: '', // For tracking previous hours
    },
  });

  // Fetch data from backend
  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/shift-reports`, {
        headers: {
          Authorization: `Bearer ${token || localStorage.getItem('token')}`,
        },
      });
      setData(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching shift reports:', error);
      setToast({ show: true, message: 'Failed to fetch data.', type: 'error' });
    }
  }, [token, API_BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle row selection
  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.length === filteredData.length ? [] : filteredData.map((row) => row.id)
    );
  };

  // Handle delete
  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setToast({ show: true, message: 'Please select at least one entry to delete.', type: 'error' });
      return;
    }

    if (window.confirm('Are you sure you want to delete the selected entries?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/shift-reports`, {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem('token')}`,
          },
          data: { ids: selectedRows },
        });
        setData(data.filter((row) => !selectedRows.includes(row.id)));
        setSelectedRows([]);
        setToast({ show: true, message: 'Deleted successfully!', type: 'success' });
      } catch (error) {
        console.error('Error deleting shift reports:', error);
        setToast({ show: true, message: 'Failed to delete entries.', type: 'error' });
      }
    }
  };

  // Handle edit with worker change
  const handleEdit = (row) => {
    if (!row) {
      setToast({ show: true, message: 'Please select exactly one entry to edit.', type: 'error' });
      return;
    }
    setEditRow(row.id);
    setValue('date', row.date);
    setValue('shift', row.shift);
    setValue('lineNumber', row.lineNumber);
    setValue('machineName', row.machineName);
    setValue('productId', row.productId);
    setValue('totalProductTarget', row.totalProductTarget?.toString() || '');
    setValue('priority', row.priority?.toString() || '');
    setValue('workerId', row.workerId || ''); // Set current worker
    setValue('hoursWorked', row.hoursWorked || ''); // Show previous hours
    setIsModalOpen(true);
  };

  // Start allocation
  const handleStartAllocation = async (rowId) => {
    if (window.confirm('Are you sure you want to start this allocation?')) {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/shift-reports/start`, { id: rowId }, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
        });
        setActiveAllocations((prev) => ({ ...prev, [rowId]: true }));
        setToast({ show: true, message: 'Allocation started successfully!', type: 'success' });
      } catch (error) {
        console.error('Error starting allocation:', error);
        setToast({ show: true, message: 'Failed to start allocation.', type: 'error' });
      }
    }
  };

  // Handle form submission (add/edit with worker change)
  const onSubmit = async (formData) => {
    const validationErrors = validateDataEntry(formData);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([_, value]) => {
        setToast({ show: true, message: value, type: 'error' });
      });
      return;
    }

    const isDuplicate = data.some(
      (row) =>
        row.date === formData.date &&
        row.lineNumber === formData.lineNumber &&
        row.machineName === formData.machineName &&
        row.productId === formData.productId &&
        row.id !== editRow
    );

    if (isDuplicate) {
      setToast({
        show: true,
        message: 'An entry for this date, line number, machine, and product ID already exists.',
        type: 'error',
      });
      return;
    }

    if (window.confirm(`Are you sure you want to ${editRow ? 'save the changes' : 'add this entry'}?`)) {
      try {
        const payload = {
          date: formData.date,
          shift: formData.shift,
          line_number: formData.lineNumber,
          machine_name: formData.machineName,
          product_id: formData.productId,
          total_product_target: parseInt(formData.totalProductTarget) || 0,
          priority: parseFloat(formData.priority) || 0,
          worker_id: formData.workerId, // Include worker ID
          hours_worked: parseFloat(formData.hoursWorked) || 0, // Include previous hours
        };

        if (editRow) {
          await axios.put(`${API_BASE_URL}/api/shift-reports/${editRow}`, payload, {
            headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
          });
          setData((prevData) =>
            prevData.map((row) => (row.id === editRow ? { ...row, ...formData, totalProductTarget: parseInt(formData.totalProductTarget) || 0, priority: parseFloat(formData.priority) || 0, workerId: formData.workerId, hoursWorked: parseFloat(formData.hoursWorked) || 0 } : row))
          );
          setToast({ show: true, message: 'Changes saved successfully!', type: 'success' });
        } else {
          const response = await axios.post(`${API_BASE_URL}/api/shift-reports`, payload, {
            headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
          });
          setData((prevData) => [
            ...prevData,
            { id: response.data.id, ...formData, totalProductTarget: parseInt(formData.totalProductTarget) || 0, priority: parseFloat(formData.priority) || 0, workerId: formData.workerId, hoursWorked: parseFloat(formData.hoursWorked) || 0 },
          ]);
          setToast({ show: true, message: 'Entry added successfully!', type: 'success' });
        }
        setIsModalOpen(false);
        setEditRow(null);
        reset();
      } catch (error) {
        console.error('Error saving shift report:', error);
        setToast({ show: true, message: 'Failed to save entry.', type: 'error' });
      }
    }
  };

  // Handle CSV upload
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'text/csv') {
        setToast({ show: true, message: 'Please upload a valid CSV file.', type: 'error' });
        return;
      }

      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1);
        const newDataRows = rows
          .map((row) => {
            const [date, shift, lineNumber, machineName, productId, totalProductTarget, priority, workerId] = row.split(',').map((item) => item.trim());
            if (!date || !shift || !lineNumber || !machineName || !productId || !totalProductTarget || !priority || !workerId) return null;
            return {
              date,
              shift,
              lineNumber,
              machineName,
              productId,
              totalProductTarget: parseInt(totalProductTarget),
              priority: parseFloat(priority),
              workerId,
            };
          })
          .filter((row) => row);

        if (newDataRows.length === 0) {
          setToast({ show: true, message: 'No valid data found in the CSV.', type: 'error' });
          return;
        }

        try {
          const response = await axios.post(`${API_BASE_URL}/api/shift-reports/bulk`, {
            reports: newDataRows.map((row) => ({
              date: row.date,
              shift: row.shift,
              line_number: row.lineNumber,
              machine_name: row.machineName,
              product_id: row.productId,
              total_product_target: row.totalProductTarget,
              priority: row.priority,
              worker_id: row.workerId,
            })),
          }, {
            headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
          });

          setData((prevData) => [
            ...prevData,
            ...response.data.reports.map((report) => ({
              id: report.id,
              date: report.date,
              shift: report.shift,
              lineNumber: report.line_number,
              machineName: report.machine_name,
              productId: report.product_id,
              totalProductTarget: report.total_product_target,
              priority: report.priority,
              workerId: report.worker_id,
            })),
          ]);
          setToast({ show: true, message: 'CSV uploaded successfully!', type: 'success' });
        } catch (error) {
          console.error('Error uploading CSV:', error);
          setToast({ show: true, message: 'Failed to upload CSV.', type: 'error' });
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  // Handle attendance upload
  const handleAttendanceUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      if (uploadedFile.type !== 'text/csv') {
        setToast({ show: true, message: 'Please upload a valid CSV file for attendance.', type: 'error' });
        return;
      }

      setAttendanceFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').slice(1);
        const newAttendanceRows = rows
          .map((row) => {
            const [workerId, date, timeIn, timeOut] = row.split(',').map((item) => item.trim());
            if (!workerId || !date || !timeIn || !timeOut) return null;
            return { worker_id: workerId, date, time_in: timeIn, time_out: timeOut };
          })
          .filter((row) => row);

        if (newAttendanceRows.length === 0) {
          setToast({ show: true, message: 'No valid attendance data found in the CSV.', type: 'error' });
          return;
        }

        try {
          await axios.post(`${API_BASE_URL}/api/attendance/bulk`, { attendance: newAttendanceRows }, {
            headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
          });
          setToast({ show: true, message: 'Attendance uploaded successfully!', type: 'success' });
          // Optionally fetch updated data or worker list
        } catch (error) {
          console.error('Error uploading attendance:', error);
          setToast({ show: true, message: 'Failed to upload attendance.', type: 'error' });
        }
      };
      reader.readAsText(uploadedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventPropagation();
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  const handleAttendanceDrag = (e) => {
    e.preventPropagation();
    e.preventDefault();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setAttendanceDragActive(true);
    } else if (e.type === 'dragleave') {
      setAttendanceDragActive(false);
    }
  };

  const handleAttendanceDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAttendanceDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAttendanceUpload({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  // Filter and sort data
  const getUniqueValues = (key) => [...new Set(data.map((item) => item[key]))].sort();

  const filteredData = data.filter((row) => {
    return (
      (!filters.date || row.date === filters.date) &&
      (!filters.lineNumber || row.lineNumber === filters.lineNumber) &&
      (!filters.machineName || row.machineName === filters.machineName) &&
      (!filters.productId || row.productId === filters.productId) &&
      (!filters.shift || row.shift === filters.shift) &&
      (!filters.totalProductTarget || row.totalProductTarget?.toString() === filters.totalProductTarget) &&
      (!filters.priority || row.priority?.toString() === filters.priority) &&
      (!filters.workerId || row.workerId?.toString() === filters.workerId) // Added workerId filter
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const valueA = a[sortConfig.key] || '';
    const valueB = b[sortConfig.key] || '';
    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      lineNumber: '',
      machineName: '',
      productId: '',
      shift: '',
      totalProductTarget: '',
      priority: '',
      workerId: '', // Added workerId
    });
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="data-entry">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <header className="mb-6">
        <h1 className="data-entry-title">Data Entry Management</h1>
        <p className="data-entry-subtitle">Manage and monitor hourly planner entries</p>
      </header>

      {/* Filters */}
      <div className="data-entry-filter-container mb-6">
        <div className="data-entry-filter-row">
          <select
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Date"
          >
            <option value="">All Dates</option>
            {getUniqueValues('date').map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
          <select
            name="lineNumber"
            value={filters.lineNumber}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Line Number"
          >
            <option value="">All Line Numbers</option>
            {getUniqueValues('lineNumber').map((line) => (
              <option key={line} value={line}>
                {line}
              </option>
            ))}
          </select>
          <select
            name="machineName"
            value={filters.machineName}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Machine Name"
          >
            <option value="">All Machines</option>
            {getUniqueValues('machineName').map((machine) => (
              <option key={machine} value={machine}>
                {machine}
              </option>
            ))}
          </select>
          <select
            name="productId"
            value={filters.productId}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Product ID"
          >
            <option value="">All Product IDs</option>
            {getUniqueValues('productId').map((product) => (
              <option key={product} value={product}>
                {product}
              </option>
            ))}
          </select>
          <select
            name="shift"
            value={filters.shift}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Shift"
          >
            <option value="">All Shifts</option>
            {getUniqueValues('shift').map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
          <select
            name="totalProductTarget"
            value={filters.totalProductTarget}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Total Product Target"
          >
            <option value="">All Targets</option>
            {getUniqueValues('totalProductTarget').map((target) => (
              <option key={target} value={target}>
                {target}
              </option>
            ))}
          </select>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Priority"
          >
            <option value="">All Priorities</option>
            {getUniqueValues('priority').map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            name="workerId"
            value={filters.workerId}
            onChange={handleFilterChange}
            className="data-entry-filter-dropdown"
            aria-label="Filter by Worker ID"
          >
            <option value="">All Workers</option>
            {getUniqueValues('workerId').map((worker) => (
              <option key={worker} value={worker}>
                {worker}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="data-entry-clear-filter-button"
            aria-label="Clear all filters"
          >
            <X size={16} className="mr-2" /> Clear Filters
          </button>
        </div>
      </div>

      {/* CSV Upload, Attendance Upload, and Actions */}
      <div className="data-entry-action-container mb-6">
        <div className="data-entry-upload-section">
          <div
            className={`data-entry-csv-upload ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <label className="data-entry-csv-label">Upload Shift Data CSV</label>
            <label className="data-entry-csv-button">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="Upload shift data CSV file"
              />
            </label>
            <span className="data-entry-csv-file-name">
              {file ? file.name : 'or drag and drop here'}
            </span>
          </div>
          <div
            className={`data-entry-csv-upload ${attendanceDragActive ? 'drag-active' : ''}`}
            onDragEnter={handleAttendanceDrag}
            onDragLeave={handleAttendanceDrag}
            onDragOver={handleAttendanceDrag}
            onDrop={handleAttendanceDrop}
          >
            <label className="data-entry-csv-label">Upload Attendance CSV</label>
            <label className="data-entry-csv-button">
              Choose File
              <input
                type="file"
                accept=".csv"
                onChange={handleAttendanceUpload}
                className="hidden"
                aria-label="Upload attendance CSV file"
              />
            </label>
            <span className="data-entry-csv-file-name">
              {attendanceFile ? attendanceFile.name : 'or drag and drop here'}
            </span>
          </div>
        </div>
        <div className="data-entry-action-buttons">
          <button
            onClick={() => setIsModalOpen(true)}
            className="data-entry-action-button data-entry-add-button group relative"
            aria-label="Add new entry"
          >
            <Plus size={18} className="mr-2" /> Add Entry
            <span className="data-entry-tooltip">Add a new data entry</span>
          </button>
          <button
            onClick={() => handleEdit(data.find((row) => row.id === selectedRows[0]))}
            className="data-entry-action-button data-entry-edit-button group relative"
            disabled={selectedRows.length !== 1 || editRow !== null}
            aria-label="Edit selected entry"
          >
            <Edit2 size={18} className="mr-2" /> Edit
            <span className="data-entry-tooltip">Edit the selected entry</span>
          </button>
          <button
            onClick={handleDelete}
            className="data-entry-action-button data-entry-delete-button group relative"
            aria-label="Delete selected entries"
          >
            <Trash2 size={18} className="mr-2" /> Delete
            <span className="data-entry-tooltip">Delete selected entries</span>
          </button>
          <button
            onClick={() => handleStartAllocation(selectedRows[0])}
            className="data-entry-action-button data-entry-start-button group relative"
            disabled={selectedRows.length !== 1 || activeAllocations[selectedRows[0]]}
            aria-label="Start allocation"
          >
            <Play size={18} className="mr-2" /> Start Allocation
            <span className="data-entry-tooltip">Start the selected allocation</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="data-entry-table-container">
        <table className="data-entry-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                  onChange={handleSelectAll}
                  className="data-entry-checkbox"
                  aria-label="Select all entries"
                />
              </th>
              <th onClick={() => handleSort('date')}>
                Date {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('shift')}>
                Shift {sortConfig.key === 'shift' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>ID</th>
              <th onClick={() => handleSort('lineNumber')}>
                Line Number {sortConfig.key === 'lineNumber' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('machineName')}>
                Machine Name {sortConfig.key === 'machineName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('productId')}>
                Product ID {sortConfig.key === 'productId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('totalProductTarget')}>
                Total Product Target {sortConfig.key === 'totalProductTarget' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('priority')}>
                Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('workerId')}>
                Worker ID {sortConfig.key === 'workerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th>Hours Worked</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <tr key={row.id} className={index % 2 === 0 ? 'data-entry-row-even' : 'data-entry-row-odd'}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id)}
                      onChange={() => handleSelectRow(row.id)}
                      className="data-entry-checkbox"
                      disabled={editRow === row.id}
                      aria-label={`Select entry ${row.id}`}
                    />
                  </td>
                  <td>{row.date}</td>
                  <td>{row.shift}</td>
                  <td>{row.id}</td>
                  <td>{row.lineNumber}</td>
                  <td>{row.machineName}</td>
                  <td>{row.productId}</td>
                  <td>{row.totalProductTarget || 0}</td>
                  <td>{row.priority || 0}</td>
                  <td>{row.workerId || 'N/A'}</td>
                  <td>{row.hoursWorked || 0}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="data-entry-text-center">
                  No data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > rowsPerPage && (
        <div className="data-entry-pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="data-entry-pagination-button"
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="data-entry-pagination-info">
            Page {currentPage} of {Math.ceil(filteredData.length / rowsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredData.length / rowsPerPage)))}
            disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
            className="data-entry-pagination-button"
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="data-entry-modal-overlay" role="dialog" aria-labelledby="modal-title">
          <div className="data-entry-modal-content">
            <div className="data-entry-modal-header">
              <h2 id="modal-title" className="data-entry-modal-title">
                {editRow ? 'Edit Entry' : 'Add Entry'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditRow(null);
                  reset();
                }}
                className="data-entry-modal-close-button"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className={`data-entry-modal-input ${errors.date ? 'input-error' : ''}`}
                  aria-label="Date input"
                />
                {errors.date && <p className="data-entry-field-error">{errors.date.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Shift</label>
                <input
                  type="text"
                  {...register('shift')}
                  className={`data-entry-modal-input ${errors.shift ? 'input-error' : ''}`}
                  aria-label="Shift input"
                />
                {errors.shift && <p className="data-entry-field-error">{errors.shift.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Line Number</label>
                <input
                  type="text"
                  {...register('lineNumber')}
                  className={`data-entry-modal-input ${errors.lineNumber ? 'input-error' : ''}`}
                  aria-label="Line Number input"
                />
                {errors.lineNumber && <p className="data-entry-field-error">{errors.lineNumber.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Machine Name</label>
                <input
                  type="text"
                  {...register('machineName')}
                  className={`data-entry-modal-input ${errors.machineName ? 'input-error' : ''}`}
                  aria-label="Machine Name input"
                />
                {errors.machineName && <p className="data-entry-field-error">{errors.machineName.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Product ID</label>
                <input
                  type="text"
                  {...register('productId')}
                  className={`data-entry-modal-input ${errors.productId ? 'input-error' : ''}`}
                  aria-label="Product ID input"
                />
                {errors.productId && <p className="data-entry-field-error">{errors.productId.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Total Product Target</label>
                <input
                  type="number"
                  {...register('totalProductTarget')}
                  className={`data-entry-modal-input ${errors.totalProductTarget ? 'input-error' : ''}`}
                  aria-label="Total Product Target input"
                />
                {errors.totalProductTarget && <p className="data-entry-field-error">{errors.totalProductTarget.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Priority</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  {...register('priority')}
                  className={`data-entry-modal-input ${errors.priority ? 'input-error' : ''}`}
                  aria-label="Priority input"
                />
                {errors.priority && <p className="data-entry-field-error">{errors.priority.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Worker ID</label>
                <input
                  type="text"
                  {...register('workerId')}
                  className={`data-entry-modal-input ${errors.workerId ? 'input-error' : ''}`}
                  aria-label="Worker ID input"
                />
                {errors.workerId && <p className="data-entry-field-error">{errors.workerId.message}</p>}
              </div>
              <div className="data-entry-modal-field">
                <label className="data-entry-modal-label">Hours Worked (Previous)</label>
                <input
                  type="number"
                  step="0.1"
                  {...register('hoursWorked')}
                  className="data-entry-modal-input"
                  readOnly
                  aria-label="Hours Worked input"
                />
              </div>
              <div className="data-entry-modal-actions">
                <button
                  type="submit"
                  className="data-entry-modal-button data-entry-save-button"
                  aria-label={editRow ? 'Save changes' : 'Add entry'}
                >
                  <Check size={18} className="mr-2" /> {editRow ? 'Save' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditRow(null);
                    reset();
                  }}
                  className="data-entry-modal-button data-entry-cancel-button"
                  aria-label="Cancel"
                >
                  <X size={18} className="mr-2" /> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntryPage;
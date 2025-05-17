import React, { useState, useEffect, useContext } from 'react';
import { Search, X, Save, XCircle, Plus, ChevronDown, ChevronUp, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './AllocationReportPage.css';

// Mock data for the allocation table with worker change dummy data
const mockAllocationData = [
  {
    id: 1,
    name: 'John Doe',
    line_number: 'Line 1',
    machine_number: 'M1',
    product_id: 'P001',
    shift: 'Shift 1',
    datetime: '2025-04-16T13:00:00', // Recent date for active status
    start_time: '2025-04-16T13:00:00',
    total_hours_worked: 8,
    products_made: 100,
    rework_count: 5,
    downtime_minutes: 30,
    downtime_reason: 'Machine',
    machine_issue: 'Motor Overheat',
    men_issue: '',
    material_issue: '',
    manufacturing_issue: '',
    hourly_updates: [
      { time: '1 PM', products_made: 25, rework_count: 2, downtime_minutes: 10, downtime_reason: 'Machine' },
      { time: '2 PM', products_made: 30, rework_count: 1, downtime_minutes: 5, downtime_reason: 'Material' },
    ],
    worker_changes: [
      { original: 'John Doe', replacement: 'Mike Brown', hours_original: 4, hours_replacement: 4, reason: 'Shift Swap' },
    ],
    attendance: { time_in: '2025-04-16T08:00:00', time_out: '2025-04-16T16:00:00' },
    efficiency_impact: 85,
  },
  {
    id: 2,
    name: 'Jane Smith',
    line_number: 'Line 2',
    machine_number: 'M2',
    product_id: 'P002',
    shift: 'Shift 2',
    datetime: '2025-04-16T14:00:00', // Recent date for active status
    start_time: null,
    total_hours_worked: 6,
    products_made: 80,
    rework_count: 3,
    downtime_minutes: 15,
    downtime_reason: 'Material',
    machine_issue: '',
    men_issue: '',
    material_issue: 'Supply Delay',
    manufacturing_issue: '',
    hourly_updates: [
      { time: '2 PM', products_made: 40, rework_count: 2, downtime_minutes: 10, downtime_reason: 'Material' },
      { time: '3 PM', products_made: 20, rework_count: 1, downtime_minutes: 5, downtime_reason: 'Machine' },
    ],
    worker_changes: [
      { original: 'Jane Smith', replacement: 'Sarah Lee', hours_original: 2, hours_replacement: 4, reason: 'Emergency' },
    ],
    attendance: { time_in: '2025-04-16T14:00:00', time_out: '2025-04-16T20:00:00' },
    efficiency_impact: 78,
  },
  {
    id: 3,
    name: 'Mike Brown',
    line_number: 'Line 1',
    machine_number: 'M1',
    product_id: 'P001',
    shift: 'Shift 1',
    datetime: '2025-04-16T17:00:00', // Recent date for active status
    start_time: '2025-04-16T17:00:00',
    total_hours_worked: 4,
    products_made: 50,
    rework_count: 1,
    downtime_minutes: 10,
    downtime_reason: 'Machine',
    machine_issue: '',
    men_issue: '',
    material_issue: '',
    manufacturing_issue: '',
    hourly_updates: [
      { time: '5 PM', products_made: 25, rework_count: 0, downtime_minutes: 5, downtime_reason: 'Machine' },
    ],
    worker_changes: [],
    attendance: { time_in: '2025-04-16T08:00:00', time_out: '2025-04-16T16:00:00' },
    efficiency_impact: 90,
  },
];

const AllocationReportPage = () => {
  const { user } = useContext(AuthContext);
  const [allocationData, setAllocationData] = useState(mockAllocationData);
  const [allocationFilters, setAllocationFilters] = useState({
    id: '',
    name: '',
    line_number: '',
    machine_number: '',
    product_id: '',
    shift: '',
    datetime: '',
    downtime_reason: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingWorker, setEditingWorker] = useState(null);
  const [addingHourly, setAddingHourly] = useState(null);
  const [changingWorker, setChangingWorker] = useState(null);
  const [workerChangeInput, setWorkerChangeInput] = useState({
    replacement: '',
    hours_original: '',
    hours_replacement: '',
    reason: '',
  });
  const [hourlyInput, setHourlyInput] = useState({
    time: '1 AM',
    products_made: '',
    rework_count: '',
    downtime_minutes: '',
    downtime_reason: '',
  });
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }));
  const [showChanges, setShowChanges] = useState({});
  const itemsPerPage = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }));
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const getUniqueValues = (key) =>
    ['', ...new Set(allocationData.map((item) => item[key]))].sort();

  const calculateEfficiencyImpact = (worker) => {
    const targetRate = 20; // Mock target products per hour
    const reworkPenalty = 2;
    const downtimeCost = 0.5;
    const baseEfficiency = (worker.products_made / (worker.total_hours_worked * targetRate)) * 100;
    const penalty = (worker.rework_count * reworkPenalty) + (worker.downtime_minutes * downtimeCost);
    return Math.max(0, Math.round(baseEfficiency - penalty));
  };

  const handleAllocationFilterChange = (e) => {
    const { name, value } = e.target;
    setAllocationFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setAllocationFilters({
      id: '',
      name: '',
      line_number: '',
      machine_number: '',
      product_id: '',
      shift: '',
      datetime: '',
      downtime_reason: '',
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handleEditWorker = (worker) => {
    setEditingWorker({ ...worker });
  };

  const handleSaveWorker = () => {
    setAllocationData((prev) =>
      prev.map((worker) =>
        worker.id === editingWorker.id ? { ...worker, ...editingWorker } : worker
      )
    );
    setEditingWorker(null);
  };

  const handleCancelEdit = () => {
    setEditingWorker(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (changingWorker) {
      setWorkerChangeInput((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else if (addingHourly) {
      setHourlyInput((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setEditingWorker((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddHourly = (worker) => {
    setAddingHourly(worker.id);
  };

  const handleSaveHourly = () => {
    if (
      !hourlyInput.products_made ||
      !hourlyInput.rework_count ||
      !hourlyInput.downtime_minutes ||
      !['Machine', 'Men', 'Material', 'Manufacturing'].includes(hourlyInput.downtime_reason)
    ) {
      alert('Please fill all fields with valid data. Downtime reason must be Machine, Men, Material, or Manufacturing.');
      return;
    }

    setAllocationData((prev) =>
      prev.map((worker) =>
        worker.id === addingHourly
          ? {
              ...worker,
              hourly_updates: [
                ...(worker.hourly_updates || []),
                {
                  time: hourlyInput.time,
                  products_made: parseInt(hourlyInput.products_made),
                  rework_count: parseInt(hourlyInput.rework_count),
                  downtime_minutes: parseInt(hourlyInput.downtime_minutes),
                  downtime_reason: hourlyInput.downtime_reason,
                },
              ],
            }
          : worker
      )
    );
    setAddingHourly(null);
    setHourlyInput({
      time: '1 AM',
      products_made: '',
      rework_count: '',
      downtime_minutes: '',
      downtime_reason: '',
    });
  };

  const handleCancelHourly = () => {
    setAddingHourly(null);
    setHourlyInput({
      time: '1 AM',
      products_made: '',
      rework_count: '',
      downtime_minutes: '',
      downtime_reason: '',
    });
  };

  const handleChangeWorker = (worker) => {
    setChangingWorker(worker.id);
    setWorkerChangeInput({
      replacement: '',
      hours_original: worker.total_hours_worked || '',
      hours_replacement: '',
      reason: '',
    });
  };

  const handleSaveWorkerChange = () => {
    if (!workerChangeInput.replacement || !workerChangeInput.hours_original || !workerChangeInput.hours_replacement || !workerChangeInput.reason) {
      alert('Please fill all fields for worker change.');
      return;
    }

    setAllocationData((prev) =>
      prev.map((worker) =>
        worker.id === changingWorker
          ? {
              ...worker,
              name: workerChangeInput.replacement, // Update name for simplicity; in reality, link to new worker ID
              total_hours_worked: parseInt(workerChangeInput.hours_replacement),
              worker_changes: [
                ...(worker.worker_changes || []),
                {
                  original: worker.name,
                  replacement: workerChangeInput.replacement,
                  hours_original: parseInt(workerChangeInput.hours_original),
                  hours_replacement: parseInt(workerChangeInput.hours_replacement),
                  reason: workerChangeInput.reason,
                },
              ],
              efficiency_impact: calculateEfficiencyImpact({
                ...worker,
                total_hours_worked: parseInt(workerChangeInput.hours_replacement),
                products_made: worker.products_made, // Adjust based on new hours if needed
                rework_count: worker.rework_count,
                downtime_minutes: worker.downtime_minutes,
              }),
            }
          : worker
      )
    );
    setChangingWorker(null);
    setWorkerChangeInput({
      replacement: '',
      hours_original: '',
      hours_replacement: '',
      reason: '',
    });
  };

  const handleCancelWorkerChange = () => {
    setChangingWorker(null);
    setWorkerChangeInput({
      replacement: '',
      hours_original: '',
      hours_replacement: '',
      reason: '',
    });
  };

  const toggleChanges = (id) => {
    setShowChanges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredAllocationData = allocationData.filter((worker) => {
    const matchesFilters =
      (!allocationFilters.id || worker.id.toString() === allocationFilters.id) &&
      (!allocationFilters.name || worker.name === allocationFilters.name) &&
      (!allocationFilters.line_number ||
        worker.line_number === allocationFilters.line_number) &&
      (!allocationFilters.machine_number ||
        worker.machine_number === allocationFilters.machine_number) &&
      (!allocationFilters.product_id ||
        worker.product_id === allocationFilters.product_id) &&
      (!allocationFilters.shift || worker.shift === allocationFilters.shift) &&
      (!allocationFilters.datetime ||
        new Date(worker.datetime).toISOString().slice(0, 16) ===
          allocationFilters.datetime) &&
      (!allocationFilters.downtime_reason ||
        worker.downtime_reason === allocationFilters.downtime_reason);

    const matchesSearch =
      !searchQuery ||
      Object.values(worker).some((value) =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

    return matchesFilters && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAllocationData.length / itemsPerPage);
  const paginatedData = filteredAllocationData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Generate time options in 12-hour format
  const timeOptions = [];
  for (let h = 1; h <= 12; h++) {
    timeOptions.push(`${h} AM`, `${h} PM`);
  }

  const workerOptions = ['', ...new Set(allocationData.map((w) => w.name))].sort();

  return (
    <div className="allocation-report">
      {user ? (
        <>
          <div className="allocation-column">
            <div className="allocation-header flex justify-between items-center mb-3">
              <h3 className="section-title text-lg font-bold text-cyan-400">
                Allocation Report
              </h3>
              <div className="header-actions flex items-center gap-2">
                <div className="search-container relative">
                  <Search
                    size={14}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search across all columns..."
                    className="search-input"
                    aria-label="Search allocation data"
                  />
                </div>
                <button
                  onClick={clearFilters}
                  className="clear-button flex items-center gap-1"
                >
                  <X size={14} /> Clear Filters
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-cyan-400">Last Updated: {lastUpdated}</p>
            <div className="filter-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-8 gap-3 mb-3">
              <div className="dropdown">
                <label htmlFor="filterId" className="filter-label">
                  Worker ID
                </label>
                <select
                  id="filterId"
                  name="id"
                  value={allocationFilters.id}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('id').map((id, index) => (
                    <option key={index} value={id}>
                      {id || 'All IDs'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterName" className="filter-label">
                  Name
                </label>
                <select
                  id="filterName"
                  name="name"
                  value={allocationFilters.name}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('name').map((name, index) => (
                    <option key={index} value={name}>
                      {name || 'All Names'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterLineNumber" className="filter-label">
                  Line Number
                </label>
                <select
                  id="filterLineNumber"
                  name="line_number"
                  value={allocationFilters.line_number}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('line_number').map((line_number, index) => (
                    <option key={index} value={line_number}>
                      {line_number || 'All Line Numbers'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterMachineNumber" className="filter-label">
                  Machine Number
                </label>
                <select
                  id="filterMachineNumber"
                  name="machine_number"
                  value={allocationFilters.machine_number}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('machine_number').map((machine_number, index) => (
                    <option key={index} value={machine_number}>
                      {machine_number || 'All Machine Numbers'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterProductId" className="filter-label">
                  Product ID
                </label>
                <select
                  id="filterProductId"
                  name="product_id"
                  value={allocationFilters.product_id}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('product_id').map((product_id, index) => (
                    <option key={index} value={product_id}>
                      {product_id || 'All Product IDs'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterShift" className="filter-label">
                  Shift
                </label>
                <select
                  id="filterShift"
                  name="shift"
                  value={allocationFilters.shift}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {getUniqueValues('shift').map((shift, index) => (
                    <option key={index} value={shift}>
                      {shift || 'All Shifts'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dropdown">
                <label htmlFor="filterDateTime" className="filter-label">
                  DateTime
                </label>
                <input
                  type="datetime-local"
                  id="filterDateTime"
                  name="datetime"
                  value={allocationFilters.datetime}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                />
              </div>
              <div className="dropdown">
                <label htmlFor="filterDowntimeReason" className="filter-label">
                  Downtime Reason
                </label>
                <select
                  id="filterDowntimeReason"
                  name="downtime_reason"
                  value={allocationFilters.downtime_reason}
                  onChange={handleAllocationFilterChange}
                  className="filter-dropdown"
                >
                  {['', 'Machine', 'Men', 'Material', 'Manufacturing'].map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason || 'All Reasons'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="allocation-table-container">
              <table className="allocation-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Worker ID</th>
                    <th>Line Number</th>
                    <th>Machine Number</th>
                    <th>Product ID</th>
                    <th>Shift</th>
                    <th>DateTime</th>
                    <th>Total Hours Worked</th>
                    <th>Products Made</th>
                    <th>Rework Count</th>
                    <th>Downtime (min)</th>
                    <th>Downtime Reason</th>
                    <th>Hourly Updates</th>
                    <th>Status</th>
                    <th>Worker Changes</th>
                    <th>Attendance</th>
                    <th>Efficiency Impact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((worker, index) => {
                      const isActive = worker.start_time && new Date(worker.datetime) > new Date(Date.now() - 24 * 60 * 60 * 1000);
                      const status = isActive ? `Active (Started: ${new Date(worker.start_time).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })})` : worker.start_time ? 'Completed' : 'Not Started';
                      const attendanceMatch = worker.attendance && new Date(worker.datetime).getTime() >= new Date(worker.attendance.time_in).getTime() && new Date(worker.datetime).getTime() <= new Date(worker.attendance.time_out).getTime();
                      const efficiency = worker.efficiency_impact || calculateEfficiencyImpact(worker);

                      return (
                        <tr
                          key={worker.id}
                          className={index % 2 === 0 ? 'row-even' : 'row-odd'}
                        >
                          <td>{worker.name}</td>
                          <td>{worker.id}</td>
                          <td>{worker.line_number}</td>
                          <td>{worker.machine_number}</td>
                          <td>{worker.product_id}</td>
                          <td>{worker.shift}</td>
                          <td>{new Date(worker.datetime).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                          <td>{worker.total_hours_worked}</td>
                          <td>{worker.products_made}</td>
                          <td>{worker.rework_count}</td>
                          <td>{worker.downtime_minutes}</td>
                          <td>{worker.downtime_reason}</td>
                          <td>
                            {worker.hourly_updates &&
                              worker.hourly_updates.map((update, i) => (
                                <div key={i}>{update.time} - Products: {update.products_made}, Rework: {update.rework_count}, Downtime: {update.downtime_minutes}min ({update.downtime_reason})</div>
                              ))}
                          </td>
                          <td>{status}</td>
                          <td>
                            <button
                              onClick={() => toggleChanges(worker.id)}
                              className="edit-button bg-cyan-500 text-white px-1 py-0.5 rounded text-sm"
                            >
                              {showChanges[worker.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />} Changes
                            </button>
                            {showChanges[worker.id] && worker.worker_changes.length > 0 && (
                              <div className="mt-1 p-1 bg-gray-800 rounded text-sm">
                                {worker.worker_changes.map((change, i) => (
                                  <div key={i}>
                                    Original: {change.original}, Replacement: {change.replacement}, Hours (Original): {change.hours_original}, Hours (Replacement): {change.hours_replacement}, Reason: {change.reason}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className={attendanceMatch ? '' : 'text-red-500'}>
                            {worker.attendance ? `In: ${new Date(worker.attendance.time_in).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}, Out: ${new Date(worker.attendance.time_out).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : 'N/A'}
                          </td>
                          <td>{efficiency}%</td>
                          <td>
                            <button
                              onClick={() => handleEditWorker(worker)}
                              className="edit-button bg-cyan-500 text-white px-2 py-1 rounded mr-1"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleAddHourly(worker)}
                              className="edit-button bg-green-500 text-white px-2 py-1 rounded mr-1"
                            >
                              <Plus size={14} /> Add Hourly
                            </button>
                            <button
                              onClick={() => handleChangeWorker(worker)}
                              className="edit-button bg-yellow-500 text-white px-2 py-1 rounded"
                            >
                              <User size={14} /> Change Worker
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="18" className="text-center">
                        No Allocated Workers.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {changingWorker && (
                <div className="hourly-input-overlay p-2 glassmorphic flex flex-col gap-1 mt-1">
                  <h4 className="text-lg font-bold text-cyan-400">Change Worker</h4>
                  <div className="grid grid-cols-2 gap-1 items-center">
                    <div>
                      <label className="filter-label text-xs">Replacement Worker</label>
                      <select
                        name="replacement"
                        value={workerChangeInput.replacement}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                      >
                        {workerOptions.map((name, index) => (
                          <option key={index} value={name}>
                            {name || 'Select Worker'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="filter-label text-xs">Hours (Original)</label>
                      <input
                        type="number"
                        name="hours_original"
                        value={workerChangeInput.hours_original}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="filter-label text-xs">Hours (Replacement)</label>
                      <input
                        type="number"
                        name="hours_replacement"
                        value={workerChangeInput.hours_replacement}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="filter-label text-xs">Reason</label>
                      <select
                        name="reason"
                        value={workerChangeInput.reason}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                      >
                        <option value="">Select Reason</option>
                        <option value="Shift Swap">Shift Swap</option>
                        <option value="Emergency">Emergency</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 mt-1">
                    <button
                      onClick={handleSaveWorkerChange}
                      className="save-button bg-cyan-500 text-white px-1 py-0.5 rounded text-sm"
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      onClick={handleCancelWorkerChange}
                      className="cancel-button bg-gray-500 text-white px-1 py-0.5 rounded text-sm"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </div>
                </div>
              )}
              {addingHourly && (
                <div className="hourly-input-overlay p-2 glassmorphic flex flex-col gap-1 mt-1">
                  <h4 className="text-lg font-bold text-cyan-400">Add Hourly Update</h4>
                  <div className="grid grid-cols-5 gap-1 items-center">
                    <div>
                      <label className="filter-label text-xs">Time</label>
                      <select
                        name="time"
                        value={hourlyInput.time}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm"
                      >
                        {timeOptions.map((time, index) => (
                          <option key={index} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="filter-label text-xs">Products</label>
                      <input
                        type="number"
                        name="products_made"
                        value={hourlyInput.products_made}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="filter-label text-xs">Rework</label>
                      <input
                        type="number"
                        name="rework_count"
                        value={hourlyInput.rework_count}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="filter-label text-xs">Downtime (min)</label>
                      <input
                        type="number"
                        name="downtime_minutes"
                        value={hourlyInput.downtime_minutes}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="filter-label text-xs">Reason</label>
                      <select
                        name="downtime_reason"
                        value={hourlyInput.downtime_reason}
                        onChange={handleInputChange}
                        className="filter-dropdown text-sm w-full"
                      >
                        <option value="">Select</option>
                        <option value="Machine">Machine</option>
                        <option value="Men">Men</option>
                        <option value="Material">Material</option>
                        <option value="Manufacturing">Manufacturing</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-1 mt-1">
                    <button
                      onClick={handleSaveHourly}
                      className="save-button bg-cyan-500 text-white px-1 py-0.5 rounded text-sm"
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      onClick={handleCancelHourly}
                      className="cancel-button bg-gray-500 text-white px-1 py-0.5 rounded text-sm"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <div className="pagination mt-3 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="allocation-report min-h-screen flex items-center justify-center">
          Loading...
        </div>
      )}
    </div>
  );
};

export default AllocationReportPage;





// 🔍 1. GET /api/allocation-report
// 🧠 Description:
// Fetch all allocation data with optional filters and search.

// 🔧 Query Parameters:
// Param	Type	Optional	Description
// name	string	✅	Filter by worker name
// line_number	string	✅	Filter by line number
// machine_number	string	✅	Filter by machine number
// product_id	string	✅	Filter by product ID
// shift	string	✅	Filter by shift
// datetime	string	✅	Filter by ISO datetime
// downtime_reason	string	✅	Filter by downtime reason
// search	string	✅	Fuzzy search across all fields

// ✅ Response:
// Returns a list of allocation records (full JSON like your mock data).

// ✏️ 2. PUT /api/allocation-report/:id
// 🧠 Description:
// Update the full record of one worker allocation (e.g., edit rework, downtime, total hours, etc.)

// 📥 Body Example:
// json
// Copy
// Edit
// {
//   "total_hours_worked": 7,
//   "products_made": 95,
//   "rework_count": 3,
//   "downtime_minutes": 20,
//   "downtime_reason": "Men",
//   "machine_issue": "",
//   "men_issue": "Break",
//   "material_issue": "",
//   "manufacturing_issue": "",
//   "efficiency_impact": 87
// }
// ➕ 3. POST /api/allocation-report/:id/hourly-update
// 🧠 Description:
// Add a new hourly update to a specific worker allocation.

// 📥 Body:
// json
// Copy
// Edit
// {
//   "time": "4 PM",
//   "products_made": 28,
//   "rework_count": 2,
//   "downtime_minutes": 5,
//   "downtime_reason": "Material"
// }
// 🔄 4. POST /api/allocation-report/:id/worker-change
// 🧠 Description:
// Submit a worker change for an allocation.

// 📥 Body:
// json
// Copy
// Edit
// {
//   "original": "John Doe",
//   "replacement": "Mike Brown",
//   "hours_original": 4,
//   "hours_replacement": 4,
//   "reason": "Emergency"
// }
// 🕒 5. GET /api/worker-options
// 🧠 Description:
// Fetch all worker names for replacement dropdown.

// ✅ Response:
// json
// Copy
// Edit
// ["John Doe", "Jane Smith", "Mike Brown", "Sarah Lee"]
// 📦 Optional: GET /api/allocation-report/:id
// For fetching a single allocation detail if needed in modals (not strictly necessary if the full list is paginated).

// ✅ Summary Table
// API	Method	Use
// /api/allocation-report	GET	Fetch all filtered data
// /api/allocation-report/:id	PUT	Save full edits
// /api/allocation-report/:id/hourly-update	POST	Add hourly entry
// /api/allocation-report/:id/worker-change	POST	Submit worker change
// /api/worker-options	GET	List worker names for replacement dropdown





// updated code

// import React, { useState, useEffect, useContext } from 'react';
// import { Search, X, Save, XCircle, Plus, ChevronDown, ChevronUp, User } from 'lucide-react';
// import { AuthContext } from '../../context/AuthContext';
// import './AllocationReportPage.css';

// const AllocationReportPage = () => {
//   const { user } = useContext(AuthContext);
//   const [allocationData, setAllocationData] = useState([]);
//   const [allocationFilters, setAllocationFilters] = useState({
//     id: '', name: '', line_number: '', machine_number: '', product_id: '', shift: '', datetime: '', downtime_reason: ''
//   });
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [editingWorker, setEditingWorker] = useState(null);
//   const [addingHourly, setAddingHourly] = useState(null);
//   const [changingWorker, setChangingWorker] = useState(null);
//   const [workerChangeInput, setWorkerChangeInput] = useState({ replacement: '', hours_original: '', hours_replacement: '', reason: '' });
//   const [hourlyInput, setHourlyInput] = useState({ time: '1 AM', products_made: '', rework_count: '', downtime_minutes: '', downtime_reason: '' });
//   const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }));
//   const [showChanges, setShowChanges] = useState({});
//   const itemsPerPage = 5;

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setLastUpdated(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Los_Angeles' }));
//     }, 60000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const fetchAllocationData = async () => {
//       try {
//         const params = new URLSearchParams({ ...allocationFilters, search: searchQuery });
//         const res = await fetch(`/api/allocation-report?${params}`);
//         const data = await res.json();
//         setAllocationData(data);
//       } catch (err) {
//         console.error('Failed to fetch allocation data', err);
//       }
//     };
//     fetchAllocationData();
//   }, [allocationFilters, searchQuery]);

//   const calculateEfficiencyImpact = (worker) => {
//     const targetRate = 20;
//     const reworkPenalty = 2;
//     const downtimeCost = 0.5;
//     const baseEfficiency = (worker.products_made / (worker.total_hours_worked * targetRate)) * 100;
//     const penalty = (worker.rework_count * reworkPenalty) + (worker.downtime_minutes * downtimeCost);
//     return Math.max(0, Math.round(baseEfficiency - penalty));
//   };

//   const handleSaveWorker = async () => {
//     try {
//       const response = await fetch(`/api/allocation-report/${editingWorker.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(editingWorker)
//       });
//       if (response.ok) {
//         setAllocationData(prev => prev.map(worker => worker.id === editingWorker.id ? editingWorker : worker));
//         setEditingWorker(null);
//       } else {
//         console.error('Failed to save worker');
//       }
//     } catch (err) {
//       console.error('Error updating worker:', err);
//     }
//   };

//   const handleSaveHourly = async () => {
//     try {
//       const response = await fetch(`/api/allocation-report/${addingHourly}/hourly-update`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(hourlyInput)
//       });
//       if (response.ok) {
//         setAddingHourly(null);
//         setHourlyInput({ time: '1 AM', products_made: '', rework_count: '', downtime_minutes: '', downtime_reason: '' });
//       } else {
//         console.error('Failed to add hourly update');
//       }
//     } catch (err) {
//       console.error('Error adding hourly update:', err);
//     }
//   };

//   const handleSaveWorkerChange = async () => {
//     try {
//       const response = await fetch(`/api/allocation-report/${changingWorker}/worker-change`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(workerChangeInput)
//       });
//       if (response.ok) {
//         setChangingWorker(null);
//         setWorkerChangeInput({ replacement: '', hours_original: '', hours_replacement: '', reason: '' });
//       } else {
//         console.error('Failed to change worker');
//       }
//     } catch (err) {
//       console.error('Error changing worker:', err);
//     }
//   };

//   const handleEditWorker = (worker) => setEditingWorker({ ...worker });
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     if (editingWorker) {
//       setEditingWorker(prev => ({ ...prev, [name]: value }));
//     } else if (addingHourly) {
//       setHourlyInput(prev => ({ ...prev, [name]: value }));
//     } else if (changingWorker) {
//       setWorkerChangeInput(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   return (
//     <div className="allocation-report">
//       <h1>Allocation Report Page</h1>
//       <table>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Line</th>
//             <th>Machine</th>
//             <th>Product</th>
//             <th>Shift</th>
//             <th>Products Made</th>
//             <th>Rework</th>
//             <th>Downtime</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {allocationData.map(worker => (
//             <tr key={worker.id}>
//               <td>{worker.name}</td>
//               <td>{worker.line_number}</td>
//               <td>{worker.machine_number}</td>
//               <td>{worker.product_id}</td>
//               <td>{worker.shift}</td>
//               <td>{worker.products_made}</td>
//               <td>{worker.rework_count}</td>
//               <td>{worker.downtime_minutes} min</td>
//               <td>
//                 <button onClick={() => handleEditWorker(worker)}>Edit</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default AllocationReportPage;

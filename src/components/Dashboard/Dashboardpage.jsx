import React, { useState, useCallback, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  X,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  User,
  Save,
  XCircle,
} from 'lucide-react';
import CountUp from 'react-countup';
import DashboardHeader from './DashboardHeader';
import './DashboardPage.css';

// Mock data with worker change dummy data
const mockData = {
  workers: [
    { worker_id: 1, name: 'John Doe', skill_level: 3, status: 'Active' },
    { worker_id: 2, name: 'Jane Smith', skill_level: 2, status: 'Active' },
    { worker_id: 3, name: 'Mike Brown', skill_level: 4, status: 'Active' },
    { worker_id: 4, name: 'Sarah Lee', skill_level: 3, status: 'Active' },
  ],
  lines: [
    { line_id: 1, line_name: 'Line 1' },
    { line_id: 2, line_name: 'Line 2' },
  ],
  cells: [
    { cell_id: 1, line_id: 1, cell_name: 'Cell A', max_worker_required: 2, is_active: true },
    { cell_id: 2, line_id: 1, cell_name: 'Cell B', max_worker_required: 1, is_active: true },
    { cell_id: 3, line_id: 2, cell_name: 'Cell C', max_worker_required: 3, is_active: true },
  ],
  products: [
    { product_id: 'P101', cell_id: 1, name: 'Product X', standard_output: 100, target: 500 },
    { product_id: 'P102', cell_id: 2, name: 'Product Y', standard_output: 80, target: 500 },
  ],
  allocations: [
    { id: 1, worker_id: 1, cell_id: 1, product_id: 'P101', line_id: 1, efficiency: 90, total_products_made: 250, worker_changes: [{ original: 'John Doe', replacement: 'Mike Brown', hours_original: 4, hours_replacement: 4, reason: 'Shift Swap', timestamp: '2025-04-16T13:00:00' }] },
    { id: 2, worker_id: 2, cell_id: 2, product_id: 'P102', line_id: 1, efficiency: 85, total_products_made: 200, worker_changes: [{ original: 'Jane Smith', replacement: 'Sarah Lee', hours_original: 2, hours_replacement: 4, reason: 'Emergency', timestamp: '2025-04-16T14:00:00' }] },
    { id: 3, worker_id: 3, cell_id: 1, product_id: 'P101', line_id: 1, efficiency: 88, total_products_made: 300, worker_changes: [] },
  ],
  attendance: [
    { worker_id: 1, date: '2025-04-16', time_in: '2025-04-16T08:00:00', time_out: '2025-04-16T16:00:00', status: 'Present' },
    { worker_id: 2, date: '2025-04-16', time_in: '2025-04-16T14:00:00', time_out: '2025-04-16T20:00:00', status: 'Present' },
    { worker_id: 3, date: '2025-04-16', time_in: null, time_out: null, status: 'Absent' },
  ],
  shiftReports: [
    { hour: 0, line_id: 1, cell_id: 1, product_id: 'P101', output: 500 },
    { hour: 1, line_id: 1, cell_id: 1, product_id: 'P101', output: 480 },
    { hour: 2, line_id: 1, cell_id: 2, product_id: 'P102', output: 510 },
    { hour: 3, line_id: 2, cell_id: 3, product_id: 'P101', output: 490 },
  ],
  trends: [
    { date: '2025-04-06', efficiency: 85 },
    { date: '2025-04-07', efficiency: 87 },
    { date: '2025-04-08', efficiency: 88 },
    { date: '2025-04-09', efficiency: 86 },
    { date: '2025-04-10', efficiency: 89 },
    { date: '2025-04-11', efficiency: 90 },
    { date: '2025-04-12', efficiency: 87 },
  ],
};

const COLORS = ['#00ddeb', '#ff4d4d', '#4ECDC4', '#FFBB28', '#FF8042', '#22c55e'];

const Allocation = React.memo(({ metrics, onLineClick }) => {
  return (
    <motion.div 
      className="allocation-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {[
        { title: 'Shift Progress', value: 75, suffix: '%', trend: 5, color: 'cyan-purple', onClick: null },
        { title: 'Total Line Active', value: 2, trend: 0, color: 'green-teal', onClick: onLineClick },
        { title: 'Total Product in Production', value: 2, trend: 1, color: 'blue-indigo', onClick: null },
        { title: 'Total Cell Active', value: 5, trend: 2, color: 'orange-red', onClick: null },
      ].map((item, index) => (
        <motion.div
          key={index}
          className={`allocation-card allocation-${item.color}`}
          whileHover={{ y: -3, cursor: item.onClick ? 'pointer' : 'default' }}
          onClick={item.onClick}
          transition={{ duration: 0.2 }}
        >
          <div className="card-header">
            <h4>{item.title}</h4>
          </div>
          <div className="card-content">
            <div className="flex items-center gap-2">
              <motion.p 
                className="card-value"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <CountUp end={item.value} duration={1} suffix={item.suffix || ''} />
              </motion.p>
              {item.trend !== 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={item.trend > 0 ? 'text-green-400' : 'text-red-400'}
                >
                  {item.trend > 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(item.trend)}{item.suffix || ''}
                </motion.span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
});

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-time">{`Time: ${label}:00`}</p>
        <div className="tooltip-grid">
          {payload.map((entry, index) => (
            <div key={index} className="tooltip-item">
              <div className="tooltip-color" style={{ backgroundColor: entry.color }} />
              <p>{entry.name}: <strong>{entry.value}{entry.name === 'Efficiency' ? '%' : ''}</strong></p>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const WorkerCard = ({ worker, index, toggleCard, expandedCard, openModal, changeWorker }) => {
  return (
    <motion.div
      className={`worker-card ${worker.efficiency > 90 ? 'high-efficiency' : worker.efficiency < 75 ? 'low-efficiency' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      <div 
        className="card-header"
        onClick={() => toggleCard(worker.id)}
      >
        <div className="worker-avatar">
          {worker.name.charAt(0).toUpperCase()}
          <div className="efficiency-badge">{worker.efficiency}%</div>
        </div>
        <div className="worker-info">
          <h4>{worker.name}</h4>
          <p>Line {worker.line_id} • {worker.cell_name} • Product {worker.product_id}</p>
        </div>
        <motion.div 
          animate={{ rotate: expandedCard === worker.id ? 180 : 0 }}
          className="expand-icon"
        >
          <ChevronDown size={18} />
        </motion.div>
      </div>

      <AnimatePresence>
        {expandedCard === worker.id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="card-details"
          >
            <div className="detail-grid">
              <div className="detail-item">
                <span>Worker ID</span>
                <strong>{worker.worker_id}</strong>
              </div>
              <div className="detail-item">
                <span>Line</span>
                <strong>Line {worker.line_id}</strong>
              </div>
              <div className="detail-item">
                <span>Cell</span>
                <strong>{worker.cell_name}</strong>
              </div>
              <div className="detail-item">
                <span>Product</span>
                <strong>{worker.product_id}</strong>
              </div>
              <div className="detail-item">
                <span>Output</span>
                <strong>{worker.total_products_made}</strong>
              </div>
              {worker.worker_changes && worker.worker_changes.length > 0 && (
                <div className="detail-item">
                  <span>Worker Changes</span>
                  <strong>
                    {worker.worker_changes.map((change, idx) => (
                      <p key={idx}>From: {change.original}, To: {change.replacement}, Hours (Orig): {change.hours_original}, Hours (New): {change.hours_replacement}, Reason: {change.reason}</p>
                    ))}
                  </strong>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="action-btn reassign" onClick={() => changeWorker(worker)}>Change Worker</button>
              <button className="action-btn details" onClick={() => openModal(worker)}>View Details</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(mockData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    line: '',
    cell: '',
    product: '',
    efficiency: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState(null);
  const [toastState, setToastState] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedLineForChart, setSelectedLineForChart] = useState('');
  const [machineModal, setMachineModal] = useState(false);
  const [changingWorker, setChangingWorker] = useState(null);
  const [workerChangeInput, setWorkerChangeInput] = useState({
    replacement: '',
    hours_original: '',
    hours_replacement: '',
    reason: '',
  });
  const itemsPerPage = 10;

  const showToast = useCallback((message, type) => {
    const id = Math.random().toString(36).slice(2);
    setToastState(prev => [...prev, { id, message, type }]);
    if (message.includes('completed')) {
      setTimeout(() => setToastState(prev => prev.filter(t => t.id !== id)), 5000);
    }
  }, []);

  useEffect(() => {
    const timers = toastState.map(toast => 
      setTimeout(() => {
        setToastState(prev => prev.filter(t => t.id !== toast.id));
      }, 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toastState]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(prev => [
        ...prev.filter(a => Date.now() - a.timestamp < 30000),
        { id: Date.now(), message: `Efficiency dropped to ${Math.random() * 50 + 50}% on Line ${Math.floor(Math.random() * 2) + 1}`, timestamp: Date.now() },
      ].slice(-3));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dashboardData.allocations.forEach(alloc => {
      const product = dashboardData.products.find(p => p.product_id === alloc.product_id);
      if (product && alloc.total_products_made >= product.target) {
        showToast(`${alloc.name} completed ${product.name} in Line ${alloc.line_id}, Cell ${dashboardData.cells.find(c => c.cell_id === alloc.cell_id).cell_name}`, 'success');
      }
    });
  }, [dashboardData.allocations]);

  const handleExport = (type) => {
    const dataToExport = dashboardData.allocations.map(alloc => ({
      Worker: dashboardData.workers.find(w => w.worker_id === alloc.worker_id)?.name,
      Cell: dashboardData.cells.find(c => c.cell_id === alloc.cell_id)?.cell_name,
      Product: alloc.product_id,
      Efficiency: alloc.efficiency,
      Output: alloc.total_products_made,
    }));

    if (type === 'csv') {
      const csv = [
        'Worker,Cell,Product,Efficiency,Output',
        ...dataToExport.map(row => `${row.Worker},${row.Cell},${row.Product},${row.Efficiency},${row.Output}`),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'allocations.csv';
      link.click();
      URL.revokeObjectURL(url);
      showToast('Exported as CSV', 'success');
    } else if (type === 'excel') {
      const XLSX = require('xlsx');
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Allocations');
      XLSX.writeFile(wb, 'allocations.xlsx');
      showToast('Exported as Excel', 'success');
    } else if (type === 'pdf') {
      const { jsPDF } = require('jspdf');
      const doc = new jsPDF();
      doc.text('Allocations Report', 10, 10);
      doc.autoTable({
        head: [['Worker', 'Cell', 'Product', 'Efficiency', 'Output']],
        body: dataToExport.map(row => [row.Worker, row.Cell, row.Product, row.Efficiency, row.Output]),
      });
      doc.save('allocations.pdf');
      showToast('Exported as PDF', 'success');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ line: '', cell: '', product: '', efficiency: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const openModal = (data) => {
    setModalData(data);
  };

  const closeModal = () => {
    setModalData(null);
  };

  const openMachineModal = (e) => {
    const line = e.currentTarget.getAttribute('data-line');
    setSelectedLineForChart(line);
    setMachineModal(true);
  };

  const closeMachineModal = () => {
    setMachineModal(false);
    setSelectedLineForChart('');
  };

  const openFeedbackModal = () => {
    setFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setFeedbackModal(false);
    setFeedback('');
  };

  const submitFeedback = () => {
    console.log('Feedback submitted:', feedback);
    showToast('Feedback submitted successfully', 'success');
    closeFeedbackModal();
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setDashboardData(mockData);
      setIsLoading(false);
      showToast('Data refreshed successfully', 'success');
    }, 500);
  };

  const handleChangeWorker = (worker) => {
    setChangingWorker(worker.id);
    setWorkerChangeInput({
      replacement: '',
      hours_original: worker.total_products_made > 0 ? Math.floor(worker.total_products_made / (worker.efficiency / 100)) : '',
      hours_replacement: '',
      reason: '',
    });
  };

  const handleSaveWorkerChange = () => {
    if (!workerChangeInput.replacement || !workerChangeInput.hours_original || !workerChangeInput.hours_replacement || !workerChangeInput.reason) {
      showToast('Please fill all fields for worker change.', 'error');
      return;
    }

    const originalWorker = dashboardData.workers.find(w => w.worker_id === changingWorker);
    const replacementWorker = dashboardData.workers.find(w => w.name === workerChangeInput.replacement);
    if (!replacementWorker) {
      showToast('Replacement worker not found.', 'error');
      return;
    }

    setDashboardData(prev => ({
      ...prev,
      allocations: prev.allocations.map(alloc =>
        alloc.id === changingWorker
          ? {
              ...alloc,
              worker_id: replacementWorker.worker_id,
              name: replacementWorker.name,
              total_products_made: Math.round((parseInt(workerChangeInput.hours_replacement) * (alloc.efficiency / 100))),
              worker_changes: [
                ...(alloc.worker_changes || []),
                {
                  original: originalWorker.name,
                  replacement: replacementWorker.name,
                  hours_original: parseInt(workerChangeInput.hours_original),
                  hours_replacement: parseInt(workerChangeInput.hours_replacement),
                  reason: workerChangeInput.reason,
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : alloc
      ),
    }));
    setChangingWorker(null);
    setWorkerChangeInput({
      replacement: '',
      hours_original: '',
      hours_replacement: '',
      reason: '',
    });
    showToast('Worker changed successfully.', 'success');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWorkerChangeInput(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredAllocations = dashboardData.allocations.filter(alloc => {
    const worker = dashboardData.workers.find(w => w.worker_id === alloc.worker_id);
    const cell = dashboardData.cells.find(c => c.cell_id === alloc.cell_id);
    return (
      (!filters.line || alloc.line_id === parseInt(filters.line)) &&
      (!filters.cell || alloc.cell_id === parseInt(filters.cell)) &&
      (!filters.product || alloc.product_id === filters.product) &&
      (!filters.efficiency ||
        (filters.efficiency === 'high' && alloc.efficiency >= 90) ||
        (filters.efficiency === 'medium' && alloc.efficiency >= 75 && alloc.efficiency < 90) ||
        (filters.efficiency === 'low' && alloc.efficiency < 75)) &&
      (!searchQuery ||
        worker?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cell?.cell_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alloc.product_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }).map(alloc => ({
    ...alloc,
    name: dashboardData.workers.find(w => w.worker_id === alloc.worker_id)?.name,
    cell_name: dashboardData.cells.find(c => c.cell_id === alloc.cell_id)?.cell_name,
  }));

  const totalPages = Math.ceil(filteredAllocations.length / itemsPerPage);
  const paginatedAllocations = filteredAllocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const hourlyProductionData = dashboardData.shiftReports
    .filter(sr => !selectedLineForChart || sr.line_id === parseInt(selectedLineForChart))
    .map(sr => ({
      hour: sr.hour,
      cell: dashboardData.cells.find(c => c.cell_id === sr.cell_id)?.cell_name,
      output: sr.output,
    }));

  const productionByLinesData = dashboardData.cells
    .filter(cell => !filters.line || cell.line_id === parseInt(filters.line))
    .map(cell => {
      const totalProduced = dashboardData.allocations
        .filter(a => a.cell_id === cell.cell_id)
        .reduce((sum, a) => sum + a.total_products_made, 0);
      const target = dashboardData.products.find(p => p.cell_id === cell.cell_id)?.target || 500;
      return {
        line_id: cell.line_id,
        cell_name: cell.cell_name,
        totalProduced,
        remaining: Math.max(0, target - totalProduced),
      };
    });

  const attendanceChartData = [
    { name: 'Present', value: dashboardData.attendance.filter(a => a.status === 'Present').length },
    { name: 'Absent', value: dashboardData.attendance.filter(a => a.status === 'Absent').length },
  ];

  const productionTargets = dashboardData.lines.map(line => ({
    line_id: line.line_id,
    current: dashboardData.allocations.filter(a => a.line_id === line.line_id).reduce((sum, a) => sum + a.total_products_made, 0),
    target: 500,
  }));

  return (
    <div className="dashboard">
      <DashboardHeader user={{ name: 'Admin User', role: 'admin' }} />

      <div className="toast-container">
        <AnimatePresence>
          {toastState.map(toast => (
            <motion.div
              key={toast.id}
              className={`toast toast-${toast.type}`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="toast-content">
                {toast.type === 'success' ? (
                  <CheckCircle size={18} className="toast-icon" />
                ) : (
                  <AlertTriangle size={18} className="toast-icon" />
                )}
                <p>{toast.message}</p>
              </div>
              <button 
                onClick={() => setToastState(prev => prev.filter(t => t.id !== toast.id))} 
                className="toast-close"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="alert-panel">
        <h4>Alerts</h4>
        <AnimatePresence>
          {alerts.map(alert => (
            <motion.div
              key={alert.id}
              className="alert"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
            >
              <AlertTriangle size={16} className="alert-icon" />
              <p>{alert.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <select
            name="line"
            value={filters.line}
            onChange={handleFilterChange}
            className="line-filter"
          >
            <option value="">All Lines</option>
            {dashboardData.lines.map(line => (
              <option key={line.line_id} value={line.line_id}>Line {line.line_id}</option>
            ))}
          </select>
          <button
            onClick={refreshData}
            className="refresh-btn"
            disabled={isLoading}
          >
            <RefreshCw className={`refresh-icon ${isLoading ? 'spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search workers, cells, products..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="loading-skeleton">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : error ? (
          <motion.div 
            className="error-message"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <AlertTriangle className="error-icon" />
            <p>{error}</p>
            <button onClick={refreshData}>Retry</button>
          </motion.div>
        ) : (
          <>
            <section className="metrics-section">
              <h2 className="section-title">Production Overview</h2>
              <Allocation
                metrics={{}}
                onLineClick={openMachineModal}
              />
            </section>

            <div className="dashboard-grid">
              <section className="charts-section">
                <div className="chart-container">
                  <h3>Hourly Production by Lines</h3>
                  <select
                    value={selectedLineForChart}
                    onChange={(e) => setSelectedLineForChart(e.target.value)}
                    className="line-filter"
                  >
                    <option value="">Select Line</option>
                    {dashboardData.lines.map(line => (
                      <option key={line.line_id} value={line.line_id}>Line {line.line_id}</option>
                    ))}
                  </select>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={hourlyProductionData}>
                      <XAxis dataKey="hour" tickFormatter={h => `${String(h).padStart(2, '0')}:00`} label={{ value: 'Time (Hours)', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Units', angle: -90, position: 'insideLeft', offset: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="output" fill={COLORS[0]} name="Output" />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="production-details">
                    {hourlyProductionData.map((data, index) => (
                      <p key={index}>{`Line: ${selectedLineForChart || 'All'}, Cell: ${data.cell}, Output: ${data.output}`}</p>
                    ))}
                  </div>
                </div>

                <div className="chart-container">
                  <h3>Production by Lines</h3>
                  <select
                    value={filters.line}
                    onChange={handleFilterChange}
                    name="line"
                    className="line-filter"
                  >
                    <option value="">Select Line</option>
                    {dashboardData.lines.map(line => (
                      <option key={line.line_id} value={line.line_id}>Line {line.line_id}</option>
                    ))}
                  </select>
                  <div className="production-details">
                    {productionByLinesData.map((data, index) => (
                      <p key={index}>
                        {`Line: ${data.line_id}, Cell: ${data.cell_name}, Built: ${data.totalProduced}, Remaining to Target: ${data.remaining}`}
                      </p>
                    ))}
                  </div>
                </div>
              </section>

              <section className="allocations-section">
                <div className="section-header">
                  <h2 className="section-title">Worker Allocations</h2>
                  <div className="section-actions">
                    <button className="action-btn" onClick={clearFilters}>
                      <X size={16} /> Clear Filters
                    </button>
                    <button className="action-btn" onClick={() => handleExport('csv')}>
                      <Download size={16} /> Export CSV
                    </button>
                    <button className="action-btn" onClick={() => handleExport('excel')}>
                      <Download size={16} /> Export Excel
                    </button>
                    <button className="action-btn" onClick={() => handleExport('pdf')}>
                      <Download size={16} /> Export PDF
                    </button>
                  </div>
                </div>

                <div className="filters-grid">
                  <div className="filter-group">
                    <label>Cell</label>
                    <select name="cell" value={filters.cell} onChange={handleFilterChange}>
                      <option value="">All Cells</option>
                      {dashboardData.cells.filter(c => !filters.line || c.line_id === parseInt(filters.line)).map(cell => (
                        <option key={cell.cell_id} value={cell.cell_id}>{cell.cell_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Product</label>
                    <select name="product" value={filters.product} onChange={handleFilterChange}>
                      <option value="">All Products</option>
                      {dashboardData.products.map(product => (
                        <option key={product.product_id} value={product.product_id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Efficiency</label>
                    <select name="efficiency" value={filters.efficiency} onChange={handleFilterChange}>
                      <option value="">All Levels</option>
                      <option value="high">High (90%+)</option>
                      <option value="medium">Medium (75-89%)</option>
                      <option value="low">Low (74%)</option>
                    </select>
                  </div>
                </div>

                <div className="allocations-list" style={{ maxHeight: '300px' }}>
                  {paginatedAllocations.length > 0 ? (
                    paginatedAllocations.map((alloc, index) => (
                      <WorkerCard
                        key={`${alloc.id}-${index}`}
                        worker={alloc}
                        index={index}
                        toggleCard={toggleCard}
                        expandedCard={expandedCard}
                        openModal={openModal}
                        changeWorker={handleChangeWorker}
                      />
                    ))
                  ) : (
                    <div className="no-results">
                      <p>No matching allocations found</p>
                      <button className="action-btn" onClick={clearFilters}>Clear all filters</button>
                    </div>
                  )}
                </div>

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
                          {mockData.workers.filter(w => w.worker_id !== changingWorker).map((worker, idx) => (
                            <option key={idx} value={worker.name}>{worker.name}</option>
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

                {totalPages > 1 && (
                  <div className="pagination-controls">
                    <button
                      className="action-btn"
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      className="action-btn"
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </section>

              <section className="production-targets-section">
                <h2 className="section-title">Production Targets</h2>
                {productionTargets.map(target => (
                  <div key={target.line_id} className="target-card">
                    <h3>Line {target.line_id}</h3>
                    <p>Current: {target.current}</p>
                    <p>Target: {target.target}</p>
                    <div className="progress-bar" style={{ '--progress': `${(target.current / target.target) * 100}%` }}></div>
                  </div>
                ))}
              </section>

              <section className="attendance-section">
                <div className="section-header">
                  <h2 className="section-title">Attendance Status</h2>
                  <div className="section-actions">
                    <button className="action-btn" onClick={openFeedbackModal}>
                      Submit Feedback
                    </button>
                  </div>
                </div>
                <div className="attendance-grid">
                  <div className="attendance-table">
                    <div className="table-header">
                      <div>Worker</div>
                      <div>Status</div>
                      <div>Time In</div>
                      <div>Actions</div>
                    </div>
                    {dashboardData.attendance.map((att, index) => (
                      <div key={index} className="table-row">
                        <div>{dashboardData.workers.find(w => w.worker_id === att.worker_id)?.name}</div>
                        <div className={att.status === 'Present' ? 'text-green-400' : 'text-red-400'}>
                          {att.status}
                        </div>
                        <div>{att.time_in || '-'}</div>
                        <div>
                          <button
                            className="action-btn"
                            onClick={() => openModal({ ...att, name: dashboardData.workers.find(w => w.worker_id === att.worker_id)?.name })}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-container">
                    <h3>Attendance Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={attendanceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {modalData && (
        <motion.div 
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2>{modalData.name || modalData.cell_name || modalData.product_id || 'Details'}</h2>
            <div className="modal-body">
              {modalData.worker_id && modalData.cell_id ? (
                <>
                  <p><strong>Worker ID:</strong> {modalData.worker_id}</p>
                  <p><strong>Cell:</strong> {modalData.cell_name}</p>
                  <p><strong>Product:</strong> {modalData.product_id}</p>
                  <p><strong>Efficiency:</strong> {modalData.efficiency}%</p>
                  <p><strong>Output:</strong> {modalData.total_products_made}</p>
                  {modalData.worker_changes && modalData.worker_changes.length > 0 && (
                    <p><strong>Worker Changes:</strong> {modalData.worker_changes.map((change, idx) => (
                      <span key={idx}>From: {change.original}, To: {change.replacement}, Hours (Orig): {change.hours_original}, Hours (New): {change.hours_replacement}, Reason: {change.reason}</span>
                    ))}</p>
                  )}
                </>
              ) : modalData.status ? (
                <>
                  <p><strong>Worker:</strong> {modalData.name}</p>
                  <p><strong>Status:</strong> {modalData.status}</p>
                  <p><strong>Date:</strong> {modalData.date}</p>
                  <p><strong>Time In:</strong> {modalData.time_in || '-'}</p>
                  <p><strong>Time Out:</strong> {modalData.time_out || '-'}</p>
                </>
              ) : null}
            </div>
            <button className="action-btn" onClick={closeModal}>Close</button>
          </motion.div>
        </motion.div>
      )}

      {machineModal && (
        <motion.div 
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2>Cell Status</h2>
            {!selectedLineForChart ? (
              <>
                <h3>Select Line</h3>
                {[...new Set(dashboardData.cells.map(c => c.line_id))].map(line => (
                  <button key={line} className="action-btn" data-line={line} onClick={openMachineModal}>
                    Line {line}
                  </button>
                ))}
              </>
            ) : (
              <>
                <div className="modal-body">
                  <h3>Line {selectedLineForChart} Status</h3>
                  <p><strong>Active Cells:</strong> {dashboardData.cells.filter(c => c.line_id === parseInt(selectedLineForChart) && c.is_active).length} / {dashboardData.cells.filter(c => c.line_id === parseInt(selectedLineForChart)).length}</p>
                  <ul>
                    {dashboardData.cells.filter(c => c.line_id === parseInt(selectedLineForChart)).map((cell, index) => (
                      <li key={index} className={cell.is_active ? 'text-green-400' : 'text-red-400'}>
                        {cell.cell_name}: {cell.is_active ? 'Active' : 'Inactive'}
                      </li>
                    ))}
                  </ul>
                </div>
                <button className="action-btn" onClick={closeMachineModal}>Close</button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {feedbackModal && (
        <motion.div 
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h2>Submit Feedback</h2>
            <div className="modal-body">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Enter your feedback..."
                className="feedback-input"
              />
            </div>
            <div className="modal-actions">
              <button className="action-btn" onClick={submitFeedback}>Submit</button>
              <button className="action-btn" onClick={closeFeedbackModal}>Cancel</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardPage;




// // after api
// {
//   "info": {
//     "name": "Dashboard API Collection",
//     "_postman_id": "dashboard-api-collection",
//     "description": "API collection for the Metalman Dashboard frontend",
//     "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
//   },
//   "item": [
//     {
//       "name": "Get All Workers",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/workers",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "workers"
//           ],
//           "query": [
//             {
//               "key": "name",
//               "value": ""
//             },
//             {
//               "key": "status",
//               "value": ""
//             }
//           ]
//         }
//       }
//     },
//     {
//       "name": "Submit Worker Change",
//       "request": {
//         "method": "POST",
//         "header": [
//           {
//             "key": "Content-Type",
//             "value": "application/json"
//           }
//         ],
//         "body": {
//           "mode": "raw",
//           "raw": "{\"original_worker_id\": 1, \"replacement_worker_id\": 3, \"hours_original\": 4, \"hours_replacement\": 4, \"reason\": \"Shift Swap\"}"
//         },
//         "url": {
//           "raw": "{{base_url}}/api/worker-change",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "worker-change"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Lines",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/lines",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "lines"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Cells",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/cells",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "cells"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Products",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/products",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "products"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Allocations (Filtered)",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/allocations",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "allocations"
//           ],
//           "query": [
//             {
//               "key": "line_id",
//               "value": ""
//             },
//             {
//               "key": "cell_id",
//               "value": ""
//             },
//             {
//               "key": "product_id",
//               "value": ""
//             },
//             {
//               "key": "efficiency",
//               "value": ""
//             },
//             {
//               "key": "search",
//               "value": ""
//             }
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Attendance (Filtered)",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/attendance",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "attendance"
//           ],
//           "query": [
//             {
//               "key": "date",
//               "value": ""
//             },
//             {
//               "key": "status",
//               "value": ""
//             }
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Shift Reports",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/shift-reports",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "shift-reports"
//           ],
//           "query": [
//             {
//               "key": "line_id",
//               "value": ""
//             }
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Trends",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/trends",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "trends"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Submit Feedback",
//       "request": {
//         "method": "POST",
//         "header": [
//           {
//             "key": "Content-Type",
//             "value": "application/json"
//           }
//         ],
//         "body": {
//           "mode": "raw",
//           "raw": "{\"feedback\": \"This is feedback.\"}"
//         },
//         "url": {
//           "raw": "{{base_url}}/api/feedback",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "feedback"
//           ]
//         }
//       }
//     },
//     {
//       "name": "Get Alerts (Optional)",
//       "request": {
//         "method": "GET",
//         "header": [],
//         "url": {
//           "raw": "{{base_url}}/api/alerts",
//           "host": [
//             "{{base_url}}"
//           ],
//           "path": [
//             "api",
//             "alerts"
//           ]
//         }
//       }
//     }
//   ]
// }

// // DashboardPage.js (API-integrated, no mock data)
// import React, { useState, useCallback, useEffect } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
//   PieChart, Pie, Cell, LineChart, Line,
// } from 'recharts';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//   Search, RefreshCw, X, ChevronDown, CheckCircle, AlertTriangle, Download,
//   Upload, ArrowUp, ArrowDown, User, Save, XCircle
// } from 'lucide-react';
// import CountUp from 'react-countup';
// import DashboardHeader from './DashboardHeader';
// import './DashboardPage.css';

// const DashboardPage = () => {
//   const [dashboardData, setDashboardData] = useState({
//     workers: [], lines: [], cells: [], products: [], allocations: [],
//     attendance: [], shiftReports: [], trends: []
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [filters, setFilters] = useState({ line: '', cell: '', product: '', efficiency: '' });
//   const [searchQuery, setSearchQuery] = useState('');

//   const fetchDashboardData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const [workers, lines, cells, products, allocations, attendance, shiftReports, trends] = await Promise.all([
//         fetch('/api/workers').then(res => res.json()),
//         fetch('/api/lines').then(res => res.json()),
//         fetch('/api/cells').then(res => res.json()),
//         fetch('/api/products').then(res => res.json()),
//         fetch(`/api/allocations?line_id=${filters.line}&cell_id=${filters.cell}&product_id=${filters.product}&efficiency=${filters.efficiency}&search=${searchQuery}`).then(res => res.json()),
//         fetch('/api/attendance').then(res => res.json()),
//         fetch('/api/shift-reports').then(res => res.json()),
//         fetch('/api/trends').then(res => res.json()),
//       ]);
//       setDashboardData({ workers, lines, cells, products, allocations, attendance, shiftReports, trends });
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load dashboard data');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [filters, searchQuery]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSearchChange = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const refreshData = () => {
//     fetchDashboardData();
//   };

//   return (
//     <div className="dashboard">
//       <DashboardHeader user={{ name: 'Admin User', role: 'admin' }} />

//       <div className="dashboard-actions">
//         <select name="line" value={filters.line} onChange={handleFilterChange}>
//           <option value="">All Lines</option>
//           {dashboardData.lines.map(line => (
//             <option key={line.line_id} value={line.line_id}>Line {line.line_id}</option>
//           ))}
//         </select>

//         <div className="search-container">
//           <Search className="search-icon" />
//           <input type="text" placeholder="Search workers, cells, products..." value={searchQuery} onChange={handleSearchChange} />
//         </div>

//         <button onClick={refreshData} className="refresh-btn">
//           <RefreshCw /> Refresh
//         </button>
//       </div>

//       {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> : (
//         <div>
//           {/* RENDER METRICS, CHARTS, TABLES BASED ON dashboardData */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardPage;

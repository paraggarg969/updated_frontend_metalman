import React, { useState } from 'react';
import './DailyReportPage.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const DailyReportPage = () => {
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('');

  // Overview Metrics
  const overviewKPIs = {
    totalProducts: '1,340',
    rejectedProducts: '62',
    overallEfficiency: '91.2%',
    activeWorkers: '28',
    activeCells: '12',
    downtimeHours: '02:15 hrs',
  };

  // Line-Cell Hierarchy Data
  const lineData = {
    'Line 1': {
      cells: [
        { name: 'Cell A', productsMade: 450, rejectionRate: '4.4%', utilization: '90%', workers: ['John', 'Alice'], rejections: 20 },
        { name: 'Cell B', productsMade: 390, rejectionRate: '5.1%', utilization: '85%', workers: ['Bob', 'Emma'], rejections: 25 },
      ],
      output: 840,
      efficiency: '91.0%',
      activeCells: 2,
    },
    'Line 2': {
      cells: [
        { name: 'Cell C', productsMade: 500, rejectionRate: '3.8%', utilization: '95%', workers: ['Mike', 'Sarah'], rejections: 17 },
      ],
      output: 500,
      efficiency: '92.5%',
      activeCells: 1,
    },
  };

  // Shift Breakdown
  const shiftData = [
    { shift: 'Shift 1', output: 720, rejections: 30, efficiency: '92.5%', workers: 15, hours: '120.5' },
    { shift: 'Shift 2', output: 620, rejections: 32, efficiency: '89.8%', workers: 13, hours: '104.0' },
  ];

  // Worker Performance
  const workerData = [
    { worker: 'John', cells: 'Cell A', products: 220, efficiency: '93.0%', rejections: 8, hours: '8.0' },
    { worker: 'Alice', cells: 'Cell A, Cell B', products: 180, efficiency: '90.5%', rejections: 10, hours: '7.5' },
    { worker: 'Bob', cells: 'Cell B', products: 200, efficiency: '88.0%', rejections: 12, hours: '8.0' },
  ];

  // Chart Data with Labels and Line Info
  const outputLineChart = {
    labels: ['08:00', '09:00', '10:00', '11:00', '12:00'],
    datasets: [{ label: 'Hourly Output', borderColor: '#00c9a7', data: [150, 180, 200, 190, 170], fill: false }],
    options: {
      scales: { x: { title: { display: true, text: 'Time (Hours)', font: { size: 14 } } }, y: { title: { display: true, text: 'Units Produced', font: { size: 14 } } } },
      plugins: { title: { display: true, text: 'Output Timeline Across All Lines', font: { size: 16 } } },
      maintainAspectRatio: false,
      responsive: true,
      height: 300,
    },
  };

  const rejectionBarChart = {
    labels: ['Cell A - Line 1', 'Cell B - Line 1', 'Cell C - Line 2'],
    datasets: [{ label: 'Rejections', backgroundColor: '#ff4757', data: [20, 25, 17] }],
    options: {
      scales: { x: { title: { display: true, text: 'Cells by Line', font: { size: 14 } } }, y: { title: { display: true, text: 'Number of Rejections', font: { size: 14 } } } },
      plugins: { title: { display: true, text: 'Rejection Trends by Cell and Line', font: { size: 16 } } },
      maintainAspectRatio: false,
      responsive: true,
      height: 300,
    },
  };

  const efficiencyBarChart = {
    labels: ['John', 'Alice', 'Bob'],
    datasets: [{ label: 'Efficiency (%)', backgroundColor: '#1dd1a1', data: [93.0, 90.5, 88.0] }],
    options: {
      scales: { x: { title: { display: true, text: 'Workers', font: { size: 14 } } }, y: { title: { display: true, text: 'Efficiency (%)', font: { size: 14 } } } },
      plugins: { title: { display: true, text: 'Efficiency by Worker', font: { size: 16 } } },
      maintainAspectRatio: false,
      responsive: true,
      height: 300,
    },
  };

  const downtimePieChart = {
    labels: ['Machine', 'Material', 'Men'],
    datasets: [{ data: [60, 45, 30], backgroundColor: ['#ff4757', '#1dd1a1', '#576574'] }],
    options: {
      plugins: { title: { display: true, text: 'Downtime Reasons', font: { size: 16 } } },
      maintainAspectRatio: false,
      responsive: true,
      height: 300,
    },
  };

  // Alerts
  const alerts = [
    'High rejection rate (5.1%) in Cell B - Line 1.',
    'Bob’s efficiency (88.0%) below average.',
    'Cell A - Line 1 operating at 90% capacity—consider reallocating workers.',
  ];

  return (
    <div className="daily-report-page">
      <h2>📊 Daily Performance Report</h2>
      <p className="subtitle">Monitor and analyze daily production performance</p>
      <p className="timestamp">11:12 AM PDT, Sunday, April 13, 2025, SHIFT 2</p>

      {/* Filters with Line as Primary */}
      <div className="filters">
        <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="dropdown">
          <option value="">All Lines</option>
          <option value="Line 1">Line 1</option>
          <option value="Line 2">Line 2</option>
        </select>
        <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} className="dropdown" disabled={!selectedLine}>
          <option value="">All Machines</option>
          {selectedLine && lineData[selectedLine]?.cells.map((cell) => (
            <option key={cell.name} value={cell.name}>{cell.name}</option>
          ))}
        </select>
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="dropdown">
          <option value={new Date().toISOString().split('T')[0]}>Today</option>
          <option value={new Date(Date.now() - 86400000).toISOString().split('T')[0]}>Yesterday</option>
        </select>
        <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="dropdown">
          <option value="">All Shifts</option>
          <option value="Shift 1">Shift 1</option>
          <option value="Shift 2">Shift 2</option>
        </select>
        <button className="clear-filters">✖ Clear Filters</button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {Object.entries(overviewKPIs).map(([key, val]) => (
          <div className="kpi-card" key={key}>
            <h4>{key.replace(/([A-Z])/g, ' $1')}</h4>
            <p>{val}</p>
          </div>
        ))}
      </div>

      {/* Graphs Section with Flexbox */}
      <div className="graphs-section">
        <div className="chart-card">
          <Line data={outputLineChart} options={outputLineChart.options} />
        </div>
        <div className="chart-card">
          <Bar data={rejectionBarChart} options={rejectionBarChart.options} />
        </div>
        <div className="chart-card">
          <Bar data={efficiencyBarChart} options={efficiencyBarChart.options} />
        </div>
        <div className="chart-card">
          <Pie data={downtimePieChart} options={downtimePieChart.options} />
        </div>
      </div>

      {/* Shift Breakdown */}
      <div className="table-section">
        <h4>🔄 Shift Breakdown</h4>
        <table>
          <thead>
            <tr>
              <th>Shift</th>
              <th>Output</th>
              <th>Rejections</th>
              <th>Efficiency</th>
              <th>Workers</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {shiftData.map((row, i) => (
              <tr key={i}>
                <td>{row.shift}</td>
                <td>{row.output}</td>
                <td>{row.rejections}</td>
                <td>{row.efficiency}</td>
                <td>{row.workers}</td>
                <td>{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Line and Cell Performance */}
      {selectedLine && (
        <div className="table-section">
          <h4>🏭 {selectedLine} Performance</h4>
          <table>
            <thead>
              <tr>
                <th>Cell</th>
                <th>Line</th>
                <th>Products Made</th>
                <th>Rejection Rate</th>
                <th>Utilization</th>
                <th>Workers</th>
              </tr>
            </thead>
            <tbody>
              {lineData[selectedLine]?.cells.map((cell, i) => (
                <tr key={i}>
                  <td>{cell.name}</td>
                  <td>{selectedLine.split(' ')[1]}</td>
                  <td>{cell.productsMade}</td>
                  <td>{cell.rejectionRate}</td>
                  <td>{cell.utilization}</td>
                  <td>{cell.workers.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="line-summary">
            <p>Output: {lineData[selectedLine]?.output}</p>
            <p>Efficiency: {lineData[selectedLine]?.efficiency}</p>
            <p>Active Cells: {lineData[selectedLine]?.activeCells}</p>
          </div>
        </div>
      )}

      {/* Worker Performance */}
      <div className="table-section">
        <h4>👷 Worker Performance</h4>
        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th>Cells</th>
              <th>Products</th>
              <th>Efficiency</th>
              <th>Rejections</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {workerData.map((row, i) => (
              <tr key={i}>
                <td>{row.worker}</td>
                <td>{row.cells}</td>
                <td>{row.products}</td>
                <td>{row.efficiency}</td>
                <td>{row.rejections}</td>
                <td>{row.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      <div className="alerts-section">
        <h4>⚠️ Performance Alerts</h4>
        <ul>
          {alerts.map((alert, i) => (
            <li key={i}>{alert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DailyReportPage;



///////////////////////////////API/////////////////////////////////////

// 1. GET /api/reports/overview
// Purpose: Fetch daily summary KPIs for the selected date and shift.

// Query Params:

// date: YYYY-MM-DD (optional, defaults to today)

// shift: Shift 1 | Shift 2 (optional)

// Response:

// json
// Copy
// Edit
// {
//   "totalProducts": 1340,
//   "rejectedProducts": 62,
//   "overallEfficiency": 91.2,
//   "activeWorkers": 28,
//   "activeCells": 12,
//   "downtimeHours": "02:15"
// }
// ✅ 2. GET /api/reports/line-details
// Purpose: Fetch performance of each line and their associated cells.

// Query Params:

// date: YYYY-MM-DD

// shift: optional (Shift 1, Shift 2)

// line: optional (e.g., Line 1)

// Response:

// json
// Copy
// Edit
// {
//   "lines": [
//     {
//       "line": "Line 1",
//       "output": 840,
//       "efficiency": 91.0,
//       "activeCells": 2,
//       "cells": [
//         {
//           "name": "Cell A",
//           "productsMade": 450,
//           "rejectionRate": 4.4,
//           "utilization": 90,
//           "workers": ["John", "Alice"],
//           "rejections": 20
//         },
//         ...
//       ]
//     }
//   ]
// }
// ✅ 3. GET /api/reports/shift-breakdown
// Purpose: Return per-shift output, rejections, and worker statistics.

// Query Params:

// date: required (YYYY-MM-DD)

// Response:

// json
// Copy
// Edit
// [
//   {
//     "shift": "Shift 1",
//     "output": 720,
//     "rejections": 30,
//     "efficiency": 92.5,
//     "workers": 15,
//     "hours": 120.5
//   },
//   ...
// ]
// ✅ 4. GET /api/reports/worker-performance
// Purpose: List top-performing workers and their stats.

// Query Params:

// date: required (YYYY-MM-DD)

// line: optional

// shift: optional

// Response:

// json
// Copy
// Edit
// [
//   {
//     "worker": "John",
//     "cells": "Cell A",
//     "products": 220,
//     "efficiency": 93.0,
//     "rejections": 8,
//     "hours": 8.0
//   },
//   ...
// ]
// ✅ 5. GET /api/reports/graphs
// Purpose: Get data for all graphs (line chart, bar chart, pie chart).

// Query Params:

// date: YYYY-MM-DD

// shift: optional

// Response:

// json
// Copy
// Edit
// {
//   "outputTrend": {
//     "labels": ["08:00", "09:00", ...],
//     "values": [150, 180, 200, ...]
//   },
//   "rejectionsByCell": {
//     "labels": ["Cell A - Line 1", "Cell B - Line 1", ...],
//     "values": [20, 25, ...]
//   },
//   "efficiencyByWorker": {
//     "labels": ["John", "Alice", "Bob"],
//     "values": [93.0, 90.5, 88.0]
//   },
//   "downtimeReasons": {
//     "labels": ["Machine", "Material", "Men"],
//     "values": [60, 45, 30]
//   }
// }
// ✅ 6. GET /api/reports/alerts
// Purpose: Provide suggestions and issues detected from the data.

// Query Params:

// date: YYYY-MM-DD

// shift: optional

// Response:

// json
// Copy
// Edit
// [
//   "High rejection rate (5.1%) in Cell B - Line 1.",
//   "Bob’s efficiency (88.0%) below average.",
//   ...
// ]



////////////////// CODE ////////////////////////////


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Line, Bar, Pie } from 'react-chartjs-2';
// import { Chart, registerables } from 'chart.js';
// import './DailyReportPage.css';

// Chart.register(...registerables);

// const DailyReportPage = () => {
//   const [selectedLine, setSelectedLine] = useState('');
//   const [selectedCell, setSelectedCell] = useState('');
//   const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
//   const [selectedShift, setSelectedShift] = useState('');
//   const [overviewKPIs, setOverviewKPIs] = useState({});
//   const [lineData, setLineData] = useState({});
//   const [shiftData, setShiftData] = useState([]);
//   const [workerData, setWorkerData] = useState([]);
//   const [chartData, setChartData] = useState({});
//   const [alerts, setAlerts] = useState([]);

//   const fetchAllData = async () => {
//     try {
//       const [overviewRes, linesRes, shiftsRes, workersRes, chartsRes, alertsRes] = await Promise.all([
//         axios.get(`/api/reports/overview`, { params: { date: selectedDate, shift: selectedShift } }),
//         axios.get(`/api/reports/line-details`, { params: { date: selectedDate, shift: selectedShift, line: selectedLine } }),
//         axios.get(`/api/reports/shift-breakdown`, { params: { date: selectedDate } }),
//         axios.get(`/api/reports/worker-performance`, { params: { date: selectedDate, shift: selectedShift, line: selectedLine } }),
//         axios.get(`/api/reports/graphs`, { params: { date: selectedDate, shift: selectedShift } }),
//         axios.get(`/api/reports/alerts`, { params: { date: selectedDate, shift: selectedShift } })
//       ]);

//       setOverviewKPIs(overviewRes.data);
//       setLineData(
//         (linesRes.data.lines || []).reduce((acc, line) => {
//           acc[line.line] = line;
//           return acc;
//         }, {})
//       );
//       setShiftData(shiftsRes.data);
//       setWorkerData(workersRes.data);
//       setChartData(chartsRes.data);
//       setAlerts(alertsRes.data);
//     } catch (err) {
//       console.error('Failed to fetch report data:', err);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [selectedDate, selectedShift, selectedLine]);

//   const clearFilters = () => {
//     setSelectedLine('');
//     setSelectedCell('');
//     setSelectedShift('');
//   };

//   return (
//     <div className="daily-report-page">
//       <h2>📊 Daily Performance Report</h2>
//       <p className="subtitle">Monitor and analyze daily production performance</p>
//       <p className="timestamp">{new Date().toLocaleString()}</p>

//       <div className="filters">
//         <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="dropdown">
//           <option value="">All Lines</option>
//           {Object.keys(lineData).map(line => (
//             <option key={line} value={line}>{line}</option>
//           ))}
//         </select>
//         <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} className="dropdown" disabled={!selectedLine}>
//           <option value="">All Machines</option>
//           {selectedLine && lineData[selectedLine]?.cells.map(cell => (
//             <option key={cell.name} value={cell.name}>{cell.name}</option>
//           ))}
//         </select>
//         <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="dropdown" />
//         <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="dropdown">
//           <option value="">All Shifts</option>
//           <option value="Shift 1">Shift 1</option>
//           <option value="Shift 2">Shift 2</option>
//         </select>
//         <button className="clear-filters" onClick={clearFilters}>✖ Clear Filters</button>
//       </div>

//       <div className="kpi-grid">
//         {Object.entries(overviewKPIs).map(([key, val]) => (
//           <div className="kpi-card" key={key}>
//             <h4>{key.replace(/([A-Z])/g, ' $1')}</h4>
//             <p>{val}</p>
//           </div>
//         ))}
//       </div>

//       <div className="graphs-section">
//         {chartData.outputTrend && <div className="chart-card"><Line data={{ labels: chartData.outputTrend.labels, datasets: [{ label: 'Output', borderColor: '#00c9a7', data: chartData.outputTrend.values, fill: false }] }} /></div>}
//         {chartData.rejectionsByCell && <div className="chart-card"><Bar data={{ labels: chartData.rejectionsByCell.labels, datasets: [{ label: 'Rejections', backgroundColor: '#ff4757', data: chartData.rejectionsByCell.values }] }} /></div>}
//         {chartData.efficiencyByWorker && <div className="chart-card"><Bar data={{ labels: chartData.efficiencyByWorker.labels, datasets: [{ label: 'Efficiency (%)', backgroundColor: '#1dd1a1', data: chartData.efficiencyByWorker.values }] }} /></div>}
//         {chartData.downtimeReasons && <div className="chart-card"><Pie data={{ labels: chartData.downtimeReasons.labels, datasets: [{ data: chartData.downtimeReasons.values, backgroundColor: ['#ff4757', '#1dd1a1', '#576574'] }] }} /></div>}
//       </div>

//       <div className="table-section">
//         <h4>🔄 Shift Breakdown</h4>
//         <table><thead><tr><th>Shift</th><th>Output</th><th>Rejections</th><th>Efficiency</th><th>Workers</th><th>Hours</th></tr></thead><tbody>
//           {shiftData.map((row, i) => (
//             <tr key={i}><td>{row.shift}</td><td>{row.output}</td><td>{row.rejections}</td><td>{row.efficiency}</td><td>{row.workers}</td><td>{row.hours}</td></tr>
//           ))}
//         </tbody></table>
//       </div>

//       {selectedLine && lineData[selectedLine] && (
//         <div className="table-section">
//           <h4>🏭 {selectedLine} Performance</h4>
//           <table><thead><tr><th>Cell</th><th>Line</th><th>Products Made</th><th>Rejection Rate</th><th>Utilization</th><th>Workers</th></tr></thead><tbody>
//             {lineData[selectedLine].cells.map((cell, i) => (
//               <tr key={i}><td>{cell.name}</td><td>{selectedLine.split(' ')[1]}</td><td>{cell.productsMade}</td><td>{cell.rejectionRate}%</td><td>{cell.utilization}%</td><td>{cell.workers.join(', ')}</td></tr>
//             ))}
//           </tbody></table>
//           <div className="line-summary">
//             <p>Output: {lineData[selectedLine].output}</p>
//             <p>Efficiency: {lineData[selectedLine].efficiency}</p>
//             <p>Active Cells: {lineData[selectedLine].activeCells}</p>
//           </div>
//         </div>
//       )}

//       <div className="table-section">
//         <h4>👷 Worker Performance</h4>
//         <table><thead><tr><th>Worker</th><th>Cells</th><th>Products</th><th>Efficiency</th><th>Rejections</th><th>Hours</th></tr></thead><tbody>
//           {workerData.map((row, i) => (
//             <tr key={i}><td>{row.worker}</td><td>{row.cells}</td><td>{row.products}</td><td>{row.efficiency}%</td><td>{row.rejections}</td><td>{row.hours}</td></tr>
//           ))}
//         </tbody></table>
//       </div>

//       <div className="alerts-section">
//         <h4>⚠️ Performance Alerts</h4>
//         <ul>
//           {alerts.map((alert, i) => <li key={i}>{alert}</li>)}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default DailyReportPage;

import React, { useState } from 'react';
import './MonthlyYearlyReportPage.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables, Tooltip, Legend } from 'chart.js';
ChartJS.register(...registerables, Tooltip, Legend);

const MonthlyYearlyReportPage = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');

  const dummyKPIs = timeframe === 'monthly'
    ? {
        totalOutput: 13400,
        efficiency: '91.2%',
        reworkPercentage: '4.6%',
        downtime: '15:45 hrs',
        attendance: '98%',
      }
    : {
        totalOutput: 160800,
        efficiency: '90.5%',
        reworkPercentage: '4.8%',
        downtime: '189:30 hrs',
        attendance: '97.5%',
      };

  const dummyTableData = timeframe === 'monthly'
    ? [
        { date: '2025-04-01', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 220, rework: 8, downtime: '0:12' },
        { date: '2025-04-02', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 240, rework: 10, downtime: '0:09' },
        { date: '2025-04-03', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 210, rework: 5, downtime: '0:14' },
      ]
    : [
        { date: '2024-01-01', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 2500, rework: 90, downtime: '1:30' },
        { date: '2024-02-01', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 2600, rework: 95, downtime: '1:45' },
        { date: '2024-03-01', product: 'AX100', line: '1', cell: 'A', shift: 'Morning', output: 2700, rework: 100, downtime: '1:20' },
      ];

  const dummyWorkerData = [
    { name: 'John', output: 220, efficiency: '93%' },
    { name: 'Alice', output: 200, efficiency: '90%' },
    { name: 'Bob', output: 180, efficiency: '88%' },
  ];

  const dummyShiftData = timeframe === 'monthly'
    ? [
        { shift: 'Morning', output: 720, downtime: '8:00 hrs' },
        { shift: 'Evening', output: 620, downtime: '7:45 hrs' },
      ]
    : [
        { shift: 'Morning', output: 8000, downtime: '90:00 hrs' },
        { shift: 'Evening', output: 80800, downtime: '99:30 hrs' },
      ];

  const dummyUtilization = timeframe === 'monthly'
    ? { uptime: 85, downtime: 15 }
    : { uptime: 82, downtime: 18 };

  const dummyTrendAlerts = [
    { metric: 'Downtime', trend: '+10% last week', severity: 'high' },
    { metric: 'Rework', trend: '+5% this month', severity: 'medium' },
  ];

  const barChartData = timeframe === 'monthly'
    ? {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{ 
          label: 'Output (Units)', 
          backgroundColor: '#00c9a7', 
          data: [800, 950, 1150, 1100], 
          borderWidth: 1,
          datalabels: { display: true }
        }],
      }
    : {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{ 
          label: 'Output (Units)', 
          backgroundColor: '#00c9a7', 
          data: [40000, 41000, 39000, 40800], 
          borderWidth: 1,
          datalabels: { display: true }
        }],
      };

  const pieChartData = {
    labels: ['Rework', 'Passed'],
    datasets: [{ 
      data: [230, 2300], 
      backgroundColor: ['#ff4757', '#1dd1a1'], 
      borderWidth: 1 
    }],
  };

  const lineChartData = timeframe === 'monthly'
    ? {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{ 
          label: 'Downtime (hrs)', 
          borderColor: '#ff4757', 
          data: [3, 4, 3.5, 5], 
          fill: false, 
          borderWidth: 2,
          pointRadius: 5,
          datalabels: { display: true }
        }],
      }
    : {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{ 
          label: 'Downtime (hrs)', 
          borderColor: '#ff4757', 
          data: [45, 48, 47, 49.5], 
          fill: false, 
          borderWidth: 2,
          pointRadius: 5,
          datalabels: { display: true }
        }],
      };

  const shiftChartData = {
    labels: ['Morning', 'Evening'],
    datasets: [{ 
      label: 'Output (Units)', 
      backgroundColor: '#00c9a7', 
      data: [dummyShiftData[0].output, dummyShiftData[1].output], 
      borderWidth: 1,
      datalabels: { display: true }
    }],
  };

  const utilizationChartData = {
    labels: ['Uptime', 'Downtime'],
    datasets: [{ 
      data: [dummyUtilization.uptime, dummyUtilization.downtime], 
      backgroundColor: ['#1dd1a1', '#ff4757'], 
      borderWidth: 1 
    }],
  };

  const chartOptions = {
    scales: {
      x: { title: { display: true, text: timeframe === 'monthly' ? 'Weeks' : 'Quarters', font: { size: 14, weight: 'bold' } } },
      y: { title: { display: true, text: timeframe === 'monthly' ? 'Units Produced' : 'Total Units Produced', font: { size: 14, weight: 'bold' } } },
    },
    plugins: {
      title: { display: true, text: timeframe === 'monthly' ? 'Monthly Output' : 'Yearly Output', font: { size: 16, weight: 'bold' } },
      legend: { labels: { font: { size: 12 } } },
      tooltip: { enabled: true, mode: 'index', intersect: false },
      datalabels: { color: '#fff', font: { size: 12 }, anchor: 'end', align: 'top' },
    },
    maintainAspectRatio: false,
    responsive: true,
    height: 200,
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const chart = elements[0].chart;
        const datasetIndex = elements[0].datasetIndex;
        const index = elements[0].index;
        alert(`Clicked on ${chart.data.labels[index]}: ${chart.data.datasets[datasetIndex].data[index]} ${chart.data.datasets[datasetIndex].label}`);
      }
    },
  };

  const shiftChartOptions = {
    ...chartOptions,
    plugins: { title: { text: 'Shift Output Comparison', font: { size: 16, weight: 'bold' } } },
  };

  const utilizationChartOptions = {
    ...chartOptions,
    plugins: { title: { text: 'Machine Utilization', font: { size: 16, weight: 'bold' } } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  return (
    <div className="monthly-yearly-report-page">
      <header className="report-header">
        <h2><span className="header-icon">📊</span> Monthly & Yearly Performance Report</h2>
        <p className="subtitle">Monitor and analyze production performance over time</p>
        <p className="timestamp">11:25 AM PDT, Sunday, April 13, 2025, SHIFT 2</p>
      </header>

      <div className="controls">
        <div className="timeframe-toggle">
          <button onClick={() => setTimeframe('monthly')} className={timeframe === 'monthly' ? 'active' : ''}>Monthly</button>
          <button onClick={() => setTimeframe('yearly')} className={timeframe === 'yearly' ? 'active' : ''}>Yearly</button>
        </div>
        <div className="filters">
          <DatePicker
            selected={selectedDate}
            onChange={setSelectedDate}
            dateFormat={timeframe === 'monthly' ? 'MM/yyyy' : 'yyyy'}
            showMonthYearPicker={timeframe === 'monthly'}
            showYearPicker={timeframe === 'yearly'}
            className="datepicker"
          />
          <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)} className="dropdown">
            <option value="">All Lines</option>
            <option value="1">Line 1</option>
            <option value="2">Line 2</option>
          </select>
          <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} className="dropdown" disabled={!selectedLine}>
            <option value="">All Machines</option>
            {selectedLine && ['A', 'B'].map((cell) => <option key={cell} value={cell}>Cell {cell}</option>)}
          </select>
          <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)} className="dropdown">
            <option value="">All Shifts</option>
            <option value="Morning">Morning</option>
            <option value="Evening">Evening</option>
          </select>
          <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="dropdown">
            <option value="">All Products</option>
            <option value="AX100">AX100</option>
            <option value="BX200">BX200</option>
          </select>
          <button className="clear-filters">✖ Clear Filters</button>
        </div>
      </div>

      <div className="kpi-grid">
        {Object.entries(dummyKPIs).map(([key, val], index) => (
          <div className="kpi-card" key={key}>
            <h4>{key.replace(/([A-Z])/g, ' $1')}</h4>
            <p>{val}</p>
          </div>
        ))}
      </div>

      <div className="graphs-section">
        <div className="chart-card">
          <Bar data={barChartData} options={chartOptions} />
        </div>
        <div className="chart-card">
          <Pie data={pieChartData} options={{ ...chartOptions, plugins: { title: { text: 'Rework Distribution', font: { size: 16, weight: 'bold' } } } }} />
        </div>
        <div className="chart-card">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      <div className="graphs-section">
        <div className="chart-card">
          <Bar data={shiftChartData} options={shiftChartOptions} />
        </div>
        <div className="chart-card">
          <Pie data={utilizationChartData} options={utilizationChartOptions} />
        </div>
      </div>

      <div className="worker-table-section">
        <h4>Top Workers</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Output</th>
              <th>Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {dummyWorkerData.map((worker, i) => (
              <tr key={i}>
                <td>{worker.name}</td>
                <td>{worker.output}</td>
                <td>{worker.efficiency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="trend-alerts-section">
        <h4>Trend Alerts</h4>
        <ul>
          {dummyTrendAlerts.map((alert, i) => (
            <li key={i} className={alert.severity}>{alert.metric}: {alert.trend}</li>
          ))}
        </ul>
      </div>

      <div className="export-section">
        <button className="export-button">Export as PDF</button>
        <button className="export-button">Export as CSV</button>
      </div>

      <div className="data-table-section">
        <h4>Production Summary Table</h4>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Line</th>
              <th>Cell</th>
              <th>Shift</th>
              <th>Output</th>
              <th>Rework</th>
              <th>Downtime</th>
            </tr>
          </thead>
          <tbody>
            {dummyTableData.map((row, i) => (
              <tr key={i}>
                <td>{row.date}</td>
                <td>{row.product}</td>
                <td>{row.line}</td>
                <td>{row.cell}</td>
                <td>{row.shift}</td>
                <td>{row.output}</td>
                <td>{row.rework}</td>
                <td>{row.downtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyYearlyReportPage;





// ////////////////////////// api///////////////////////

// Monthly/Yearly KPI Summary
// Method	Endpoint	Description
// GET	/api/reports/summary	Get overall KPIs for selected month/year

// Query Params:

// ts
// Copy
// Edit
// {
//   type: 'monthly' | 'yearly',  // required
//   date: '2025-04' or '2025',   // format depends on type
//   line?: string,
//   cell?: string,
//   shift?: string,
//   product?: string
// }
// Response:

// json
// Copy
// Edit
// {
//   "totalOutput": 13400,
//   "efficiency": "91.2%",
//   "reworkPercentage": "4.6%",
//   "downtime": "15:45 hrs",
//   "attendance": "98%"
// }
// 📊 Output Trend Chart
// Method	Endpoint	Description
// GET	/api/reports/output-trend	Get bar/line chart data (weekly/monthly or quarterly)

// Query Params: Same as above

// Response:

// json
// Copy
// Edit
// {
//   "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
//   "output": [800, 950, 1150, 1100],
//   "downtime": [3, 4, 3.5, 5]
// }
// 📊 Rework Distribution (Pie Chart)
// Method	Endpoint	Description
// GET	/api/reports/rework-summary	Get rework vs passed units

// Response:

// json
// Copy
// Edit
// {
//   "rework": 230,
//   "passed": 2300
// }
// ⚙️ Shift Output Comparison
// Method	Endpoint	Description
// GET	/api/reports/shift-summary	Output and downtime per shift

// Response:

// json
// Copy
// Edit
// [
//   { "shift": "Morning", "output": 720, "downtime": "8:00 hrs" },
//   { "shift": "Evening", "output": 620, "downtime": "7:45 hrs" }
// ]
// ⚡ Machine Utilization
// Method	Endpoint	Description
// GET	/api/reports/utilization	Get machine uptime/downtime %

// Response:

// json
// Copy
// Edit
// {
//   "uptime": 85,
//   "downtime": 15
// }
// 👷 Top Workers
// Method	Endpoint	Description
// GET	/api/reports/top-workers	Get top 3 workers by efficiency/output

// Response:

// json
// Copy
// Edit
// [
//   { "name": "John", "output": 220, "efficiency": "93%" },
//   { "name": "Alice", "output": 200, "efficiency": "90%" },
//   { "name": "Bob", "output": 180, "efficiency": "88%" }
// ]
// 📈 Trend Alerts
// Method	Endpoint	Description
// GET	/api/reports/trend-alerts	Rework/downtime anomalies

// Response:

// json
// Copy
// Edit
// [
//   { "metric": "Downtime", "trend": "+10% last week", "severity": "high" },
//   { "metric": "Rework", "trend": "+5% this month", "severity": "medium" }
// ]
// 📋 Production Summary Table
// Method	Endpoint	Description
// GET	/api/reports/summary-table	Raw table with all production entries

// Query Params: Same as first endpoint

// Response:

// json
// Copy
// Edit
// [
//   {
//     "date": "2025-04-01",
//     "product": "AX100",
//     "line": "1",
//     "cell": "A",
//     "shift": "Morning",
//     "output": 220,
//     "rework": 8,
//     "downtime": "0:12"
//   },
//   ...
// ]
// 🧾 Report Export (PDF/CSV)
// Method	Endpoint	Description
// POST	/api/reports/export	Export current report as PDF/CSV

// Request Body:

// json
// Copy
// Edit
// {
//   "type": "monthly",
//   "date": "2025-04",
//   "filters": {
//     "line": "1",
//     "cell": "A",
//     "shift": "Morning",
//     "product": "AX100"
//   },
//   "format": "pdf"  // or "csv"
// }



// /////////////////////////////codr //////////////////
// // Fully updated MonthlyYearlyReportPage with real API integration + export
// import React, { useState, useEffect } from 'react';
// import './MonthlyYearlyReportPage.css';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import axios from 'axios';
// import { Bar, Pie, Line } from 'react-chartjs-2';
// import { Chart as ChartJS, registerables, Tooltip, Legend } from 'chart.js';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import { CSVLink } from 'react-csv';
// ChartJS.register(...registerables, Tooltip, Legend);

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const MonthlyYearlyReportPage = () => {
//   const [timeframe, setTimeframe] = useState('monthly');
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [selectedLine, setSelectedLine] = useState('');
//   const [selectedCell, setSelectedCell] = useState('');
//   const [selectedShift, setSelectedShift] = useState('');
//   const [selectedProduct, setSelectedProduct] = useState('');

//   const [kpis, setKpis] = useState({});
//   const [trendData, setTrendData] = useState({});
//   const [reworkSummary, setReworkSummary] = useState({});
//   const [shiftData, setShiftData] = useState([]);
//   const [utilization, setUtilization] = useState({});
//   const [topWorkers, setTopWorkers] = useState([]);
//   const [alerts, setAlerts] = useState([]);
//   const [tableData, setTableData] = useState([]);

//   const fetchData = async () => {
//     const params = {
//       type: timeframe,
//       date: timeframe === 'monthly' ? selectedDate.toISOString().slice(0, 7) : selectedDate.getFullYear(),
//       line: selectedLine,
//       cell: selectedCell,
//       shift: selectedShift,
//       product: selectedProduct
//     };
//     try {
//       const [kpiRes, trendRes, reworkRes, shiftRes, utilRes, workersRes, alertRes, tableRes] = await Promise.all([
//         axios.get(`${API_BASE_URL}/api/reports/summary`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/output-trend`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/rework-summary`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/shift-summary`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/utilization`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/top-workers`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/trend-alerts`, { params }),
//         axios.get(`${API_BASE_URL}/api/reports/summary-table`, { params })
//       ]);
//       setKpis(kpiRes.data);
//       setTrendData(trendRes.data);
//       setReworkSummary(reworkRes.data);
//       setShiftData(shiftRes.data);
//       setUtilization(utilRes.data);
//       setTopWorkers(workersRes.data);
//       setAlerts(alertRes.data);
//       setTableData(tableRes.data);
//     } catch (error) {
//       console.error('Failed to fetch report data:', error);
//     }
//   };

//   useEffect(() => { fetchData(); }, [timeframe, selectedDate, selectedLine, selectedCell, selectedShift, selectedProduct]);

//   const clearFilters = () => {
//     setSelectedLine('');
//     setSelectedCell('');
//     setSelectedShift('');
//     setSelectedProduct('');
//   };

//   const exportPDF = () => {
//     const doc = new jsPDF();
//     doc.text('Production Summary Report', 14, 16);
//     doc.autoTable({
//       head: [['Date', 'Product', 'Line', 'Cell', 'Shift', 'Output', 'Rework', 'Downtime']],
//       body: tableData.map(row => [row.date, row.product, row.line, row.cell, row.shift, row.output, row.rework, row.downtime])
//     });
//     doc.save('report.pdf');
//   };

//   const csvHeaders = [
//     { label: 'Date', key: 'date' },
//     { label: 'Product', key: 'product' },
//     { label: 'Line', key: 'line' },
//     { label: 'Cell', key: 'cell' },
//     { label: 'Shift', key: 'shift' },
//     { label: 'Output', key: 'output' },
//     { label: 'Rework', key: 'rework' },
//     { label: 'Downtime', key: 'downtime' }
//   ];

//   const barChartData = {
//     labels: trendData.labels || [],
//     datasets: [{ label: 'Output (Units)', backgroundColor: '#00c9a7', data: trendData.output || [], borderWidth: 1 }]
//   };

//   const pieChartData = {
//     labels: ['Rework', 'Passed'],
//     datasets: [{ data: [reworkSummary.rework || 0, reworkSummary.passed || 0], backgroundColor: ['#ff4757', '#1dd1a1'], borderWidth: 1 }]
//   };

//   const lineChartData = {
//     labels: trendData.labels || [],
//     datasets: [{ label: 'Downtime (hrs)', borderColor: '#ff4757', data: trendData.downtime || [], fill: false, borderWidth: 2, pointRadius: 5 }]
//   };

//   const shiftChartData = {
//     labels: shiftData.map(s => s.shift),
//     datasets: [{ label: 'Output (Units)', backgroundColor: '#00c9a7', data: shiftData.map(s => s.output), borderWidth: 1 }]
//   };

//   const utilizationChartData = {
//     labels: ['Uptime', 'Downtime'],
//     datasets: [{ data: [utilization.uptime || 0, utilization.downtime || 0], backgroundColor: ['#1dd1a1', '#ff4757'], borderWidth: 1 }]
//   };

//   return (
//     <div className="monthly-yearly-report-page">
//       <header className="report-header">
//         <h2><span className="header-icon">📊</span> Monthly & Yearly Performance Report</h2>
//       </header>

//       <div className="controls">
//         <div className="timeframe-toggle">
//           <button onClick={() => setTimeframe('monthly')} className={timeframe === 'monthly' ? 'active' : ''}>Monthly</button>
//           <button onClick={() => setTimeframe('yearly')} className={timeframe === 'yearly' ? 'active' : ''}>Yearly</button>
//         </div>
//         <div className="filters">
//           <DatePicker selected={selectedDate} onChange={setSelectedDate} dateFormat={timeframe === 'monthly' ? 'MM/yyyy' : 'yyyy'} showMonthYearPicker={timeframe === 'monthly'} showYearPicker={timeframe === 'yearly'} className="datepicker" />
//           <select value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}><option value="">All Lines</option><option value="1">Line 1</option><option value="2">Line 2</option></select>
//           <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} disabled={!selectedLine}><option value="">All Machines</option>{['A', 'B'].map((c) => <option key={c} value={c}>Cell {c}</option>)}</select>
//           <select value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}><option value="">All Shifts</option><option value="Morning">Morning</option><option value="Evening">Evening</option></select>
//           <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}><option value="">All Products</option><option value="AX100">AX100</option><option value="BX200">BX200</option></select>
//           <button className="clear-filters" onClick={clearFilters}>✖ Clear Filters</button>
//         </div>
//       </div>

//       <div className="kpi-grid">
//         {Object.entries(kpis).map(([key, val]) => (
//           <div className="kpi-card" key={key}><h4>{key.replace(/([A-Z])/g, ' $1')}</h4><p>{val}</p></div>
//         ))}
//       </div>

//       <div className="graphs-section">
//         <div className="chart-card"><Bar data={barChartData} /></div>
//         <div className="chart-card"><Pie data={pieChartData} /></div>
//         <div className="chart-card"><Line data={lineChartData} /></div>
//       </div>

//       <div className="graphs-section">
//         <div className="chart-card"><Bar data={shiftChartData} /></div>
//         <div className="chart-card"><Pie data={utilizationChartData} /></div>
//       </div>

//       <div className="worker-table-section">
//         <h4>Top Workers</h4>
//         <table><thead><tr><th>Name</th><th>Output</th><th>Efficiency</th></tr></thead>
//         <tbody>{topWorkers.map((w, i) => (<tr key={i}><td>{w.name}</td><td>{w.output}</td><td>{w.efficiency}</td></tr>))}</tbody></table>
//       </div>

//       <div className="trend-alerts-section">
//         <h4>Trend Alerts</h4>
//         <ul>{alerts.map((alert, i) => (<li key={i} className={alert.severity}>{alert.metric}: {alert.trend}</li>))}</ul>
//       </div>

//       <div className="export-section">
//         <button className="export-button" onClick={exportPDF}>Export as PDF</button>
//         <CSVLink data={tableData} headers={csvHeaders} filename="report.csv" className="export-button">Export as CSV</CSVLink>
//       </div>

//       <div className="data-table-section">
//         <h4>Production Summary Table</h4>
//         <table><thead><tr><th>Date</th><th>Product</th><th>Line</th><th>Cell</th><th>Shift</th><th>Output</th><th>Rework</th><th>Downtime</th></tr></thead>
//         <tbody>{tableData.map((row, i) => (<tr key={i}><td>{row.date}</td><td>{row.product}</td><td>{row.line}</td><td>{row.cell}</td><td>{row.shift}</td><td>{row.output}</td><td>{row.rework}</td><td>{row.downtime}</td></tr>))}</tbody></table>
//       </div>
//     </div>
//   );
// };

// export default MonthlyYearlyReportPage;

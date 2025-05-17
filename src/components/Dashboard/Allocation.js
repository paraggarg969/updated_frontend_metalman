import React, { useState, useEffect } from "react";
import "../Dashboard/Allocation.css";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Allocation = ({
  shiftProgress,
  machinesActive,
  totalMachines,
  downtime,
  totalEmployees,
  activeLines,
}) => {
  const [workerData, setWorkerData] = useState([]);
  const [showGraph, setShowGraph] = useState(false);

  // Fetch worker data from API
  useEffect(() => {
    const fetchWorkerData = async () => {
      try {
        const response = await axios.get("https://metalman-project.vercel.app/api/workers/details");
        console.log("API Response:", response.data); // Debug: Verify API data
        setWorkerData(response.data.workers);
      } catch (error) {
        console.error("Error fetching worker data:", error);
      }
    };

    fetchWorkerData();
  }, []);

  // Generate last 7 days
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split("T")[0]);
    }
    return days;
  };

  // Simulate daily attendance data
  const dailyWorkerCounts = getLast7Days().map((date) => ({
    date,
    count: workerData.length ? Math.floor(Math.random() * (workerData.length - 10)) + 10 : 0,
  }));

  // Chart Configuration
  const chartData = {
    labels: dailyWorkerCounts.map((entry) => entry.date),
    datasets: [
      {
        label: "Workers Present",
        data: dailyWorkerCounts.map((entry) => entry.count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(...dailyWorkerCounts.map((entry) => entry.count)) + 10,
      },
    },
  };

  return (
    <div className="allocation-container">
      {/* KPI Box - Total Employees */}
      <div className="kpi-box" onClick={() => setShowGraph(true)}>
        <div className="kpi-header">
          <div className="icon users">👤</div>
          <p className="kpi-title">Total Employees</p>
        </div>
        <p className="kpi-value">{totalEmployees}</p>
      </div>

      {/* KPI Box - Machines Active */}
      <div className="kpi-box">
        <div className="kpi-header">
          <div className="icon machines">⚙️</div>
          <p className="kpi-title">Machines Active</p>
        </div>
        <p className="kpi-value">
          {machinesActive}/{totalMachines}
        </p>
      </div>

      {/* KPI Box - Downtime */}
      <div className="kpi-box">
        <div className="kpi-header">
          <div className="icon downtime">⏳</div>
          <p className="kpi-title">Downtime Today</p>
        </div>
        <p className="kpi-value">{downtime} hours</p>
      </div>

      {/* KPI Box - Shift Progress */}
      <div className="kpi-box">
        <div className="kpi-header">
          <div className="icon progress">📈</div>
          <p className="kpi-title">Shift Progress</p>
        </div>
        <p className="kpi-value">{shiftProgress}%</p>
      </div>

      {/* KPI Box - Active Lines */}
      <div className="kpi-box">
        <div className="kpi-header">
          <div className="icon lines">🟢</div>
          <p className="kpi-title">Lines Active</p>
        </div>
        <p className="kpi-value">{activeLines}</p>
      </div>

      {/* Full-Screen Graph Popup */}
      {showGraph && (
        <div className="graph-overlay active">
          <div className="graph-popup">
            <button className="close-btn" onClick={() => setShowGraph(false)}>
              ✖
            </button>
            <h3>Employee Attendance (Last 7 Days)</h3>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Allocation;












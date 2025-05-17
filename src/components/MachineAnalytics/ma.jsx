import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, Area, AreaChart, Cell
} from "recharts";
import { FaMale, FaFemale, FaUser } from "react-icons/fa";

const EmployeeAnalytics = () => {
  const [workers, setWorkers] = useState([]);
  const [allocatedWorkers, setAllocatedWorkers] = useState([]);
  const [mergedWorkers, setMergedWorkers] = useState([]);
  const [pendingAllocations, setPendingAllocations] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadError, setUploadError] = useState("");
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      const [workersRes, allocatedRes] = await Promise.all([
        fetch('https://metalman-project.vercel.app/api/workers/details'),
        fetch('https://metalman-project.vercel.app/api/allocation/allocated-workers')
      ]);
      
      const workersData = await workersRes.json();
      const allocatedData = await allocatedRes.json();
      
      setWorkers(workersData.workers);
      setAllocatedWorkers(allocatedData.workers);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const merged = workers.filter(worker => 
      allocatedWorkers.some(allocated => allocated.worker_id === worker.worker_id)
    ).map(worker => {
      const allocation = allocatedWorkers.find(a => a.worker_id === worker.worker_id);
      return {
        ...worker,
        allocated_machine: allocation ? allocation.allocated_machine : null,
        pending_machine: pendingAllocations[worker.worker_id] || allocation?.allocated_machine
      };
    });
    setMergedWorkers(merged);
  }, [workers, allocatedWorkers, pendingAllocations]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setUploadError("Please upload a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://metalman-project.vercel.app/api/workers/upload-csv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      await fetchData();
      setUploadError("");
    } catch (error) {
      setUploadError("Failed to upload CSV. Please try again.");
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('hours') ? 'h' : '%'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getEfficiencyData = (worker) => [
    { name: "Machine A", efficiency: worker.efficiency_a, color: "#FF6B6B" },
    { name: "Machine B", efficiency: worker.efficiency_b, color: "#4ECDC4" },
    { name: "Machine C", efficiency: worker.efficiency_c, color: "#45B7D1" },
  ];

  const getPilotHoursData = (worker) => {
    const data = [];
    const machines = ['A', 'B', 'C'];
    machines.forEach((machine, index) => {
      data.push({
        name: `Machine ${machine}`,
        hours: worker[`pilot_hours_${machine.toLowerCase()}`],
        efficiency: worker[`efficiency_${machine.toLowerCase()}`],
      });
    });
    return data;
  };

  const handleAllocationChange = (workerId, machine) => {
    setPendingAllocations(prev => ({
      ...prev,
      [workerId]: machine
    }));
  };

  const handleFreeze = async () => {
    const updates = Object.entries(pendingAllocations).map(([workerId, machine]) => ({
      worker_id: parseInt(workerId),
      allocated_machine: machine
    }));

    if (updates.length === 0) return;

    try {
      await Promise.all(updates.map(update => 
        fetch('https://metalman-project.vercel.app/api/allocation/update-allocation', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update)
        })
      ));

      setPendingAllocations({});
      fetchData();
    } catch (error) {
      console.error('Error updating allocations:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="sticky top-0 bg-white shadow-md p-6 z-10">
        <div className="flex flex-wrap gap-4 justify-between items-center max-w-7xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search by Employee"
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 text-gray-400">🔍</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              Upload CSV
            </label>
            <button 
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              onClick={handleFreeze}
            >
              Freeze
            </button>
            <button
              onClick={() => navigate("/machines")}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              View Machines
            </button>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="max-w-7xl mx-auto mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {uploadError}
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <div className={`grid gap-6 ${
          selectedEmployee ? "lg:grid-cols-[1.5fr_1fr]" : "grid-cols-1"
        } transition-all`}>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className={`grid gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto ${
              !selectedEmployee ? 'md:grid-cols-2' : 'grid-cols-1'
            }`}>
              {mergedWorkers
                .filter(worker => worker.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((worker) => (
                <div
                  key={worker.worker_id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => setSelectedEmployee(worker)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex-shrink-0 flex items-center justify-center">
                      {worker.gender === "Male" ? (
                        <FaMale size={35} className="text-white" />
                      ) : worker.gender === "Female" ? (
                        <FaFemale size={35} className="text-white" />
                      ) : (
                        <FaUser size={35} className="text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{worker.name}</p>
                      <p className="text-gray-500 text-sm">ID-{worker.worker_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      className="px-3 py-1 border rounded-lg bg-white"
                      value={worker.pending_machine || worker.allocated_machine}
                      onChange={(e) => handleAllocationChange(worker.worker_id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {["A", "B", "C", "NO"].map((machine) => (
                        <option key={machine} value={machine}>
                          Machine {machine}
                        </option>
                      ))}
                    </select>
                    {pendingAllocations[worker.worker_id] && (
                      <span className="text-yellow-600 text-sm">Pending</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedEmployee && (
            <div className="bg-white rounded-xl shadow-lg p-6 relative lg:sticky lg:top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute right-4 top-4 p-1 hover:bg-gray-200 rounded-full"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                  {selectedEmployee.gender === "Male" ? (
                    <FaMale size={50} className="text-white" />
                  ) : selectedEmployee.gender === "Female" ? (
                    <FaFemale size={50} className="text-white" />
                  ) : (
                    <FaUser size={50} className="text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{selectedEmployee.name}</h2>
                  <p className="text-gray-500">ID-{selectedEmployee.worker_id}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender:</span>
                  <span>{selectedEmployee.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Machine:</span>
                  <span>Machine {selectedEmployee.allocated_machine}</span>
                </div>
                {pendingAllocations[selectedEmployee.worker_id] && (
                  <div className="flex justify-between text-yellow-600">
                    <span>Pending Machine:</span>
                    <span>Machine {pendingAllocations[selectedEmployee.worker_id]}</span>
                  </div>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Efficiency Across Machines
                  </h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer>
                      <BarChart data={getEfficiencyData(selectedEmployee)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="efficiency"
                          radius={[4, 4, 0, 0]}
                          animationDuration={1000}
                        >
                          {getEfficiencyData(selectedEmployee).map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Performance Overview</h3>
                  <div className="w-full h-64">
                    <ResponsiveContainer>
                      <AreaChart data={getPilotHoursData(selectedEmployee)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="hours"
                          stroke="#FF6B6B"
                          fill="#FF6B6B"
                          fillOpacity={0.3}
                          name="Pilot Hours"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="efficiency"
                          stroke="#4ECDC4"
                          name="Efficiency"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-red-600 text-white py-2 rounded-lg mt-6 hover:bg-red-700 transition-colors"
                onClick={() => navigate(`/profile?workerId=${selectedEmployee.worker_id}`)}
              >
                View Full Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnalytics;
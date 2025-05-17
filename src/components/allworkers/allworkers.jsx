import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaMale, FaFemale } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Search, X, Plus, User, Upload, Users, Trash2 } from "lucide-react";

const Alert = ({ children, variant = "default" }) => {
  const bgColor = variant === "destructive" ? "bg-red-100" : "bg-blue-100";
  const textColor = variant === "destructive" ? "text-red-800" : "text-blue-800";

  return (
    <div className={`p-4 ${bgColor} ${textColor} rounded-lg animate-fadeIn`}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children }) => {
  return <div className="text-sm">{children}</div>;
};

const UserDetails = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [compareWorker, setCompareWorker] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeChart, setActiveChart] = useState("bar");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [newWorker, setNewWorker] = useState({
    worker_id: "",
    name: "",
    gender: "",
    machineData: [
      {
        line_number: "", // Added line_number field
        machine_id: "",
        product_id: "",
        efficiency: 0,
        total_pilot_hours: 0,
      },
    ],
  });

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = useCallback(() => {
    fetch("https://metalman-project.vercel.app/api/workers/details")
      .then((response) => response.json())
      .then((data) => setWorkers(data.workers))
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    const validationErrors = validateWorkerData(newWorker);
    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join("\n"));
      return;
    }
    try {
      if (!newWorker.worker_id || !newWorker.name || !newWorker.gender) {
        setUploadError("Please fill in all required fields");
        return;
      }

      const existingWorker = workers.find((w) => w.worker_id === newWorker.worker_id);
      const endpoint = existingWorker
        ? "https://metalman-project.vercel.app/api/workers/details-edit"
        : "https://metalman-project.vercel.app/api/workers/add-new-worker";
      const method = existingWorker ? "PUT" : "POST";

      const transformedData = {
        worker_id: String(newWorker.worker_id),
        name: newWorker.name,
        gender: newWorker.gender,
        efficiency_a: 0,
        efficiency_b: 0,
        efficiency_c: 0,
        pilot_hours_a: 0,
        pilot_hours_b: 0,
        pilot_hours_c: 0,
        // Note: Backend does not seem to expect line_number, so it's not included in transformedData
        // If the backend needs line_number, you would need to add it here, e.g., line_number_a, line_number_b, etc.
      };

      newWorker.machineData.forEach((data, index) => {
        const machineKey = String.fromCharCode(97 + index);
        transformedData[`efficiency_${machineKey}`] = Number(data.efficiency);
        transformedData[`pilot_hours_${machineKey}`] = Number(data.total_pilot_hours);
        // If backend expects line_number, add it like this:
        // transformedData[`line_number_${machineKey}`] = data.line_number;
      });

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to save worker");
      }

      await response.json();
      setIsAddModalOpen(false);
      fetchWorkers();
      setNewWorker({
        worker_id: "",
        name: "",
        gender: "",
        machineData: [
          {
            line_number: "",
            machine_id: "",
            product_id: "",
            efficiency: 0,
            total_pilot_hours: 0,
          },
        ],
      });
      setUploadError("");
    } catch (error) {
      console.error("Error saving worker:", error);
      setUploadError(error.message || "Failed to save worker. Please try again.");
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setUploadError("Please upload a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("https://metalman-project.vercel.app/api/workers/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        fetchWorkers();
        setUploadError("");
        event.target.value = null;
      } else {
        const error = await response.text();
        setUploadError(error);
      }
    } catch (error) {
      setUploadError("Error uploading CSV file");
    }
  };

  const validateWorkerData = (worker) => {
    const errors = [];
    if (!worker.worker_id) errors.push("Worker ID is required");
    if (!worker.name) errors.push("Name is required");
    if (!worker.gender) errors.push("Gender is required");

    worker.machineData.forEach((data, index) => {
      if (!data.line_number) errors.push(`Line Number is required for entry ${index + 1}`);
      if (!data.machine_id) errors.push(`Machine ID is required for entry ${index + 1}`);
      if (!data.product_id) errors.push(`Product ID is required for entry ${index + 1}`);
      if (data.efficiency < 0 || data.efficiency > 100) {
        errors.push(`Efficiency for entry ${index + 1} must be between 0 and 100`);
      }
      if (data.total_pilot_hours < 0) {
        errors.push(`Total Pilot Hours for entry ${index + 1} cannot be negative`);
      }
    });

    return errors;
  };

  const handleInputChange = useCallback((field, value) => {
    setNewWorker((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleMachineDataChange = (index, field, value) => {
    setNewWorker((prev) => {
      const updatedMachineData = [...prev.machineData];
      updatedMachineData[index] = {
        ...updatedMachineData[index],
        [field]: value,
      };
      return { ...prev, machineData: updatedMachineData };
    });
  };

  const addMachineDataRow = () => {
    setNewWorker((prev) => ({
      ...prev,
      machineData: [
        ...prev.machineData,
        {
          line_number: "",
          machine_id: "",
          product_id: "",
          efficiency: 0,
          total_pilot_hours: 0,
        },
      ],
    }));
  };

  const removeMachineDataRow = (index) => {
    setNewWorker((prev) => {
      const updatedMachineData = prev.machineData.filter((_, i) => i !== index);
      return { ...prev, machineData: updatedMachineData };
    });
  };

  const getEfficiencyData = useCallback(
    (worker) => [
      { name: "Machine A", efficiency: worker.efficiency_a, hours: worker.pilot_hours_a },
      { name: "Machine B", efficiency: worker.efficiency_b, hours: worker.pilot_hours_b },
      { name: "Machine C", efficiency: worker.efficiency_c, hours: worker.pilot_hours_c },
    ],
    []
  );

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.worker_id.toString().includes(searchQuery)
  );

  const COLORS = ["#00ddeb", "#ff00ff", "#feca57"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-4 border border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-cyan-400">Efficiency: {payload[0].value}%</p>
          {payload[1] && <p className="text-magenta-400">Hours: {payload[1].value}h</p>}
        </div>
      );
    }
    return null;
  };

  const Modal = useCallback(({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto glassmorphic animate-scaleIn">
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 hover:bg-gray-700 rounded-full"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
            {children}
          </div>
        </div>
      </div>
    );
  }, []);

  const ChartSelector = ({ activeChart, setActiveChart }) => (
    <div className="flex gap-2 mb-4">
      {["bar", "line", "pie"].map((type) => (
        <button
          key={type}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            activeChart === type
              ? "bg-gradient-to-r from-cyan-500 to-magenta-500 text-white shadow-glow"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          onClick={() => setActiveChart(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );

  const renderChart = (data) => {
    switch (activeChart) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#e0e0e0" />
              <YAxis yAxisId="left" stroke="#e0e0e0" />
              <YAxis yAxisId="right" orientation="right" stroke="#e0e0e0" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                stroke="#00ddeb"
                strokeWidth={2}
                dot={{ fill: "#00ddeb", r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hours"
                stroke="#ff00ff"
                strokeWidth={2}
                dot={{ fill: "#ff00ff", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="efficiency"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="efficiency" fill="#00ddeb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hours" fill="#ff00ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getAverageEfficiency = (worker) =>
    (worker.efficiency_a + worker.efficiency_b + worker.efficiency_c) / 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="sticky top-0 bg-gray-900 shadow-lg p-6 z-10">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by Employee"
              className="pl-10 pr-4 py-2 border border-gray-700 rounded-lg w-64 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search workers"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleCSVUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center gap-2"
              aria-label="Upload CSV"
            >
              <Upload className="h-5 w-5" />
              Upload CSV
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-magenta-500 text-white px-6 py-2 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center gap-2"
              aria-label="Add new worker"
            >
              <Plus className="h-5 w-5" />
              Add Worker
            </button>
          </div>
        </div>
        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        <div
          className={`grid gap-6 ${
            selectedWorker ? "lg:grid-cols-[1.5fr_1fr]" : "grid-cols-1"
          }`}
        >
          <div className="glassmorphic rounded-xl p-6">
            <div
              className={`grid gap-4 max-h-[calc(100vh-12rem)] overflow-y-auto ${
                !selectedWorker ? "md:grid-cols-2" : "grid-cols-1"
              } custom-scrollbar`}
            >
              {filteredWorkers.map((worker, index) => (
                <div
                  key={worker.worker_id}
                  className="flex items-center justify-between glassmorphic p-4 rounded-lg cursor-pointer hover:shadow-glow transition-all duration-300 animate-slideIn"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, #00ddeb, #ff00ff)`,
                      }}
                    >
                      {worker.gender === "Male" ? (
                        <FaMale size={24} className="text-white" />
                      ) : worker.gender === "Female" ? (
                        <FaFemale size={24} className="text-white" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{worker.name}</p>
                      <p className="text-gray-400 text-sm">ID-{worker.worker_id}</p>
                      <p className="text-cyan-400 text-sm">
                        Avg Efficiency: {getAverageEfficiency(worker).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  {selectedWorker?.worker_id !== worker.worker_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareWorker(worker);
                      }}
                      className="text-cyan-400 hover:text-magenta-400 transition-colors"
                      aria-label={`Compare with ${worker.name}`}
                    >
                      <Users size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {selectedWorker && (
            <div className="glassmorphic rounded-xl p-6 relative lg:sticky lg:top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              <button
                onClick={() => {
                  setSelectedWorker(null);
                  setCompareWorker(null);
                }}
                className="absolute right-4 top-4 p-1 hover:bg-gray-700 rounded-full"
                aria-label="Close worker details"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, #00ddeb, #ff00ff)`,
                  }}
                >
                  {selectedWorker.gender === "Male" ? (
                    <FaMale size={35} className="text-white" />
                  ) : selectedWorker.gender === "Female" ? (
                    <FaFemale size={35} className="text-white" />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{selectedWorker.name}</h2>
                  <p className="text-gray-400">ID: {selectedWorker.worker_id}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-400">Gender:</span>
                  <span>{selectedWorker.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Efficiency:</span>
                  <span className="text-cyan-400">
                    {getAverageEfficiency(selectedWorker).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Performance Analytics</h3>
                    <ChartSelector activeChart={activeChart} setActiveChart={setActiveChart} />
                  </div>
                  <div className="animate-fadeIn">{renderChart(getEfficiencyData(selectedWorker))}</div>
                </div>
              </div>

              {compareWorker && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Comparison with {compareWorker.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">Avg Efficiency:</p>
                      <p className="text-cyan-400">
                        {getAverageEfficiency(selectedWorker).toFixed(1)}% (Selected)
                      </p>
                      <p className="text-magenta-400">
                        {getAverageEfficiency(compareWorker).toFixed(1)}% (Comparison)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Pilot Hours:</p>
                      <p className="text-cyan-400">
                        {selectedWorker.pilot_hours_a +
                          selectedWorker.pilot_hours_b +
                          selectedWorker.pilot_hours_c}
                        h (Selected)
                      </p>
                      <p className="text-magenta-400">
                        {compareWorker.pilot_hours_a +
                          compareWorker.pilot_hours_b +
                          compareWorker.pilot_hours_c}
                        h (Comparison)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 text-white py-2 rounded-lg mt-6 hover:shadow-glow transition-all duration-300"
                onClick={() => navigate(`/profile?workerId=${selectedWorker.worker_id}`)}
                aria-label={`Visit ${selectedWorker.name}'s profile`}
              >
                Visit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="p-6 text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center">Add New Worker</h2>
          <form onSubmit={handleAddWorker} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 peer"
                  value={newWorker.worker_id}
                  onChange={(e) => handleInputChange("worker_id", e.target.value)}
                  required
                  placeholder=" "
                />
                <label className="absolute top-3 left-3 text-gray-400 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-cyan-500 -top-5 text-sm text-cyan-500">
                  Worker ID
                </label>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 peer"
                  value={newWorker.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder=" "
                />
                <label className="absolute top-3 left-3 text-gray-400 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-5 peer-focus:text-sm peer-focus:text-cyan-500 -top-5 text-sm text-cyan-500">
                  Name
                </label>
              </div>
              <div className="relative">
                <select
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 peer appearance-none"
                  value={newWorker.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  required
                >
                  <option value="" disabled hidden></option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <label className="absolute top-3 left-3 text-gray-400 transition-all duration-300 pointer-events-none peer-focus:-top-5 peer-focus:text-sm peer-focus:text-cyan-500 peer-[&:not(:placeholder-shown)]:-top-5 peer-[&:not(:placeholder-shown)]:text-sm peer-[&:not(:placeholder-shown)]:text-cyan-500">
                  Gender
                </label>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Machine Data</h4>
                <button
                  type="button"
                  onClick={addMachineDataRow}
                  className="bg-gradient-to-r from-cyan-500 to-magenta-500 text-white p-2 rounded-full hover:shadow-glow transition-all duration-300"
                  aria-label="Add machine data row"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="p-3 text-left">Line Number</th>
                      <th className="p-3 text-left">Machine ID</th>
                      <th className="p-3 text-left">Product ID</th>
                      <th className="p-3 text-left">Efficiency (%)</th>
                      <th className="p-3 text-left">Total Pilot Hours</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newWorker.machineData.map((data, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-700 animate-slideIn"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={data.line_number}
                            onChange={(e) =>
                              handleMachineDataChange(index, "line_number", e.target.value)
                            }
                            required
                            placeholder="Line Number"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={data.machine_id}
                            onChange={(e) =>
                              handleMachineDataChange(index, "machine_id", e.target.value)
                            }
                            required
                            placeholder="Machine ID"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={data.product_id}
                            onChange={(e) =>
                              handleMachineDataChange(index, "product_id", e.target.value)
                            }
                            required
                            placeholder="Product ID"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={data.efficiency}
                            onChange={(e) =>
                              handleMachineDataChange(index, "efficiency", parseFloat(e.target.value) || 0)
                            }
                            required
                            placeholder="Efficiency (%)"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            value={data.total_pilot_hours}
                            onChange={(e) =>
                              handleMachineDataChange(index, "total_pilot_hours", parseFloat(e.target.value) || 0)
                            }
                            required
                            placeholder="Total Pilot Hours"
                          />
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => removeMachineDataRow(index)}
                            className="p-2 text-red-500 hover:text-red-400 transition-colors"
                            aria-label={`Remove machine data row ${index + 1}`}
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-glow transition-all duration-300"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-magenta-500 text-white rounded-lg hover:shadow-glow transition-all duration-300"
              >
                Save Worker
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserDetails;


// //GET /api/workers/efficiency-summary
// This endpoint returns daily worker efficiency data, supporting multiple line-cell-product combinations per worker.

// 📥 Request Parameters:
// None (in the future, you can add ?date=YYYY-MM-DD to filter by day).

// 📤 JSON Response Format:
// json
// Copy
// Edit
// {
//   "workers": [
//     {
//       "worker_id": "W001",
//       "name": "John Doe",
//       "gender": "Male",
//       "assignments": [
//         {
//           "line_number": "Line 1",
//           "cell_number": "Cell A",
//           "product_id": "P001",
//           "efficiency": 88
//         },
//         {
//           "line_number": "Line 2",
//           "cell_number": "Cell B",
//           "product_id": "P002",
//           "efficiency": 76
//         }
//       ]
//     },
//     {
//       "worker_id": "W002",
//       "name": "Jane Smith",
//       "gender": "Female",
//       "assignments": [
//         {
//           "line_number": "Line 3",
//           "cell_number": "Cell D",
//           "product_id": "P004",
//           "efficiency": 91
//         }
//       ]
//     }
//   ]
// }
// 📘 Field Descriptions:
// Field	Type	Description
// worker_id	string	Unique ID of the worker
// name	string	Name of the worker
// gender	string	"Male", "Female", or "Other"
// assignments	array	List of assigned product/line/cell/efficiency per day
// └ line_number	string	Production line where the worker was assigned
// └ cell_number	string	Cell/station within the line
// └ product_id	string	Product ID being worked on
// └ efficiency	number	Efficiency percentage (0–100)

// 🧠 Notes:
// This endpoint should be auto-refreshed daily via cron/scheduler.

// If a worker works on 2 lines/products in a day, assignments will contain 2 entries.

// This format gives you clean structure to support charts, filtering, and dynamic analytics.

// import React, { useState, useEffect, useCallback } from 'react';
// import { Search, X, User, Users } from 'lucide-react';
// import { FaMale, FaFemale } from 'react-icons/fa';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   Legend,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import './UserDetails.css';

// const UserDetails = () => {
//   const [workers, setWorkers] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedWorker, setSelectedWorker] = useState(null);
//   const [activeChart, setActiveChart] = useState('bar');

//   useEffect(() => {
//     fetch('/api/workers/efficiency-summary')
//       .then(res => res.json())
//       .then(data => setWorkers(data.workers))
//       .catch(err => console.error('Failed to fetch workers:', err));
//   }, []);

//   const getEfficiencyData = (worker) => {
//     return worker.assignments.map(assign => ({
//       name: `${assign.product_id} (${assign.line_number})`,
//       efficiency: assign.efficiency
//     }));
//   };

//   const getAverageEfficiency = (worker) => {
//     const total = worker.assignments.reduce((sum, a) => sum + a.efficiency, 0);
//     return (total / worker.assignments.length).toFixed(1);
//   };

//   const COLORS = ['#00ddeb', '#ff00ff', '#feca57'];

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-gray-900 text-white p-2 rounded shadow">
//           <p>{label}</p>
//           <p>Efficiency: {payload[0].value}%</p>
//         </div>
//       );
//     }
//     return null;
//   };

//   const renderChart = (data) => {
//     switch (activeChart) {
//       case 'line':
//         return (
//           <ResponsiveContainer width="100%" height={250}>
//             <LineChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Line type="monotone" dataKey="efficiency" stroke="#00ddeb" />
//             </LineChart>
//           </ResponsiveContainer>
//         );
//       case 'pie':
//         return (
//           <ResponsiveContainer width="100%" height={250}>
//             <PieChart>
//               <Pie
//                 data={data}
//                 dataKey="efficiency"
//                 nameKey="name"
//                 outerRadius={100}
//                 label={({ name, value }) => `${name}: ${value}%`}
//               >
//                 {data.map((entry, index) => (
//                   <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                 ))}
//               </Pie>
//               <Tooltip content={<CustomTooltip />} />
//             </PieChart>
//           </ResponsiveContainer>
//         );
//       default:
//         return (
//           <ResponsiveContainer width="100%" height={250}>
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip content={<CustomTooltip />} />
//               <Legend />
//               <Bar dataKey="efficiency" fill="#00ddeb" />
//             </BarChart>
//           </ResponsiveContainer>
//         );
//     }
//   };

//   const filteredWorkers = workers.filter(worker =>
//     worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     worker.worker_id.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="user-details-container p-4">
//       <div className="search-bar flex items-center gap-4 mb-6">
//         <Search size={18} />
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search by name or ID"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredWorkers.map((worker, index) => (
//           <div
//             key={worker.worker_id}
//             className="worker-card p-4 rounded-lg shadow-md bg-gray-900 text-white"
//             onClick={() => setSelectedWorker(worker)}
//           >
//             <div className="flex items-center gap-4">
//               {worker.gender === 'Male' ? <FaMale /> : worker.gender === 'Female' ? <FaFemale /> : <User />}
//               <div>
//                 <h3 className="text-lg font-bold">{worker.name}</h3>
//                 <p className="text-sm text-gray-400">ID: {worker.worker_id}</p>
//                 <p className="text-sm text-cyan-400">Avg Efficiency: {getAverageEfficiency(worker)}%</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {selectedWorker && (
//         <div className="selected-worker-panel p-6 mt-8 rounded-lg bg-gray-800 text-white">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">{selectedWorker.name} - Performance Summary</h2>
//             <button onClick={() => setSelectedWorker(null)} className="text-red-400"><X /></button>
//           </div>
//           <div className="chart-toggle flex gap-2 mb-4">
//             {['bar', 'line', 'pie'].map(type => (
//               <button
//                 key={type}
//                 className={`px-3 py-1 rounded ${activeChart === type ? 'bg-cyan-500 text-white' : 'bg-gray-600'}`}
//                 onClick={() => setActiveChart(type)}
//               >
//                 {type.toUpperCase()}
//               </button>
//             ))}
//           </div>
//           {renderChart(getEfficiencyData(selectedWorker))}

//           <div className="assignments mt-6">
//             <h3 className="text-lg font-semibold mb-2">Assignments</h3>
//             <ul className="list-disc pl-6">
//               {selectedWorker.assignments.map((assign, idx) => (
//                 <li key={idx}>
//                   Line: {assign.line_number}, Cell: {assign.cell_number}, Product: {assign.product_id}, Efficiency: {assign.efficiency}%
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserDetails;

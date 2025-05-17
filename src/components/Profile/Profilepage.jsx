import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Plus, TrendingUp, Clock, Package, Layers } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Profile Component
function Profile() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const workerId = queryParams.get("workerId");
  const [isEditing, setIsEditing] = useState(false);
  const [workerData, setWorkerData] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [addingHourly, setAddingHourly] = useState(false);
  const [hourlyInput, setHourlyInput] = useState({
    time: "1 AM",
    products_made: "",
    rework_count: "",
    downtime_minutes: "",
    downtime_reason: "",
  });

  const fetchWorkerDetails = async () => {
    try {
      const response = await axios.get("/user.json");
      const data = response.data;
      if (data && data.workers) {
        const worker = data.workers.find(
          (w) => w.worker_id === parseInt(workerId, 10)
        );
        if (worker) {
          const dummyWorker = {
            worker_id: parseInt(workerId, 10),
            name: worker.name || "John Doe",
            line_number: worker.line_number || "Line 1",
            machine_number: worker.machine_number || "M1",
            shift: worker.shift || "Shift 1",
            efficiency_m1: worker.efficiency_m1 || 90,
            efficiency_m2: worker.efficiency_m2 || 80,
            pilot_hours_m1: worker.pilot_hours_m1 || 5,
            pilot_hours_m2: worker.pilot_hours_m2 || 3,
            cells: {
              m1: { efficiency: [90, 85, 88], pilot_hours: [5, 4, 6] },
              m2: { efficiency: [80, 82, 79], pilot_hours: [3, 2, 4] },
            },
            hourly_updates: worker.hourly_updates || [
              { time: "1 PM", products_made: 25, rework_count: 2, downtime_minutes: 10, downtime_reason: "Machine" },
              { time: "2 PM", products_made: 30, rework_count: 1, downtime_minutes: 5, downtime_reason: "Material" },
            ],
            total_hours_worked: worker.total_hours_worked || 8,
            products_made: worker.products_made || 100,
            rework_count: worker.rework_count || 5,
            downtime_minutes: worker.downtime_minutes || 30,
            downtime_reason: worker.downtime_reason || "Machine",
            skill_rejection: worker.skill_rejection || "Not skilled for M2",
            avgEfficiency: worker.avgEfficiency || 85,
            totalWorkingHours: worker.totalWorkingHours || 40,
            bestMachine: worker.bestMachine || "M1",
            bestLine: worker.bestLine || "Line 1",
          };
          console.log("Worker Data:", dummyWorker);
          setWorkerData(dummyWorker);
        }
      }
    } catch (err) {
      console.error("Error fetching worker details:", err);
    }
  };

  const fetchMachineAllocationData = () => {
    const data = [
      { workerId: parseInt(workerId, 10), day: "Mon", line: 1 },
      { workerId: parseInt(workerId, 10), day: "Tue", line: 2 },
      { workerId: parseInt(workerId, 10), day: "Wed", line: 1 },
      { workerId: parseInt(workerId, 10), day: "Thu", line: 3 },
      { workerId: parseInt(workerId, 10), day: "Fri", line: 2 },
    ];
    console.log("Machine Allocation Data:", data);
    return data;
  };

  const handleDeleteWorker = async () => {
    try {
      await axios.delete(
        `https://metalman-project.vercel.app/api/workers/delete-profile/${workerId}`
      );
      alert("Worker profile deleted successfully.");
      navigate("/allworkers");
    } catch (err) {
      console.error("Error deleting worker profile:", err);
      alert("Failed to delete the worker profile.");
    }
  };

  useEffect(() => {
    if (workerId) {
      fetchWorkerDetails();
    }
  }, [workerId]);

  const handleWorkerUpdate = async (updatedData) => {
    try {
      setWorkerData((prevData) => ({
        ...prevData,
        ...updatedData,
      }));
      await fetchWorkerDetails();
      setIsEditing(false);
    } catch (error) {
      console.error("Error handling worker update:", error);
    }
  };

  const navigate = useNavigate();
  const handleMachineClick = (machine) => {
    setSelectedMachine(machine);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setHourlyInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveHourly = () => {
    if (
      !hourlyInput.products_made ||
      !hourlyInput.rework_count ||
      !hourlyInput.downtime_minutes ||
      !["Machine", "Men", "Material", "Manufacturing"].includes(
        hourlyInput.downtime_reason
      )
    ) {
      alert(
        "Please fill all fields with valid data. Downtime reason must be Machine, Men, Material, or Manufacturing."
      );
      return;
    }

    setWorkerData((prev) => ({
      ...prev,
      hourly_updates: [
        ...(prev.hourly_updates || []),
        {
          time: hourlyInput.time,
          products_made: parseInt(hourlyInput.products_made),
          rework_count: parseInt(hourlyInput.rework_count),
          downtime_minutes: parseInt(hourlyInput.downtime_minutes),
          downtime_reason: hourlyInput.downtime_reason,
        },
      ],
    }));
    setAddingHourly(false);
    setHourlyInput({
      time: "1 AM",
      products_made: "",
      rework_count: "",
      downtime_minutes: "",
      downtime_reason: "",
    });
  };

  const handleCancelHourly = () => {
    setAddingHourly(false);
    setHourlyInput({
      time: "1 AM",
      products_made: "",
      rework_count: "",
      downtime_minutes: "",
      downtime_reason: "",
    });
  };

  const timeOptions = [];
  for (let h = 1; h <= 12; h++) {
    timeOptions.push(`${h} AM`, `${h} PM`);
  }

  if (!workerId) {
    return <div className="text-white">Error: workerId is missing in the URL.</div>;
  }

  const statsData = workerData
    ? {
        avgEfficiency: workerData.avgEfficiency,
        totalWorkingHours: workerData.total_hours_worked,
        bestMachine: workerData.bestMachine,
        bestLine: workerData.bestLine,
      }
    : null;

  const efficiencyData = workerData
    ? [
        { line_number: "Line 1", value1: workerData.efficiency_m1 },
        { line_number: "Line 2", value1: workerData.efficiency_m2 },
      ]
    : [];

  const machineAllocationData = fetchMachineAllocationData();

  // ProfileInfo Component
  const ProfileInfo = () => (
    <div className="p-6 bg-gray-900 rounded-xl glassmorphic shadow-glow animate-slideIn">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2 text-white">
        Profile
      </h2>
      {workerData ? (
        <div>
          <p><strong>Name:</strong> {workerData.name}</p>
          <p><strong>Worker ID:</strong> {workerData.worker_id}</p>
          <p><strong>Line Number:</strong> {workerData.line_number}</p>
          <p><strong>Machine Number:</strong> {workerData.machine_number}</p>
          <p><strong>Shift:</strong> {workerData.shift}</p>
          <p><strong>Efficiency:</strong> {workerData.avgEfficiency}%</p>
          <p><strong>Skill Rejection:</strong> {workerData.skill_rejection}</p>
          <h3 className="mt-4 text-lg font-semibold text-cyan-400">Hourly Updates</h3>
          <ul className="list-disc pl-5">
            {workerData.hourly_updates.map((update, index) => (
              <li key={index}>
                {update.time}: {update.products_made} products, {update.rework_count} rework, {update.downtime_minutes} min ({update.downtime_reason})
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-400 text-center">No user data available.</p>
      )}
    </div>
  );

  // HeaderStats Component
  const HeaderStats = () => (
    <div className="p-6 bg-gray-900 rounded-xl glassmorphic animate-slideIn">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2 text-white">
        Header Stats
      </h2>
      {statsData ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400">{statsData.avgEfficiency}%</h3>
              <p className="text-sm text-gray-400">Avg Efficiency</p>
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400">{statsData.totalWorkingHours} hrs</h3>
              <p className="text-sm text-gray-400">Total Hours</p>
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2">
            <Package className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400">{statsData.bestMachine}</h3>
              <p className="text-sm text-gray-400">Best Machine</p>
            </div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <div>
              <h3 className="text-xl font-bold text-cyan-400">{statsData.bestLine}</h3>
              <p className="text-sm text-gray-400">Best Line</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center">No stats available.</p>
      )}
    </div>
  );

  // GraphComponent Component
  const GraphComponent = ({ graphTitle, efficiencyData, selectedMachine, isCellDisplay }) => {
    if (!workerData) {
      return (
        <div className="p-6 bg-gray-900 rounded-xl glassmorphic shadow-md animate-slideIn">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">{graphTitle}</h3>
          <p className="text-gray-400 text-center py-4 bg-gray-800 rounded-lg">
            No data available.
          </p>
        </div>
      );
    }

    const isEfficiency = graphTitle.toLowerCase().includes("efficiency");
    const isCellView = graphTitle.toLowerCase().includes("cells");

    const getChartData = () => {
      if (!isCellView || (isCellView && !selectedMachine)) {
        if (efficiencyData && efficiencyData.length > 0) {
          return efficiencyData.map((entry) => ({
            name: entry.line_number,
            value: entry.value1,
          }));
        }
        const metrics = Object.entries(workerData)
          .filter(([key]) =>
            isEfficiency ? key.startsWith("efficiency_") : key.startsWith("pilot_hours_")
          )
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
        return metrics.map(([key, value]) => ({
          name: `Machine ${key.split("_")[1].toUpperCase()}`,
          value,
        }));
      }
      const machineData = workerData.cells?.[selectedMachine.toLowerCase()];
      if (!machineData) return [];
      const dataKey = isEfficiency ? "efficiency" : "pilot_hours";
      return machineData[dataKey].map((value, index) => ({
        name: `Cell ${index + 1}`,
        value,
      }));
    };

    const handleClick = (data) => {
      if (isCellDisplay || !data) return;
      const machine = data.name.split(" ")[1];
      if (workerData.cells?.[machine.toLowerCase()]) {
        setSelectedMachine(machine);
      } else {
        alert("No cell data available for this machine.");
      }
    };

    const chartData = getChartData();
    if (!chartData || chartData.length === 0) {
      return (
        <div className="p-6 bg-gray-900 rounded-xl glassmorphic shadow-md animate-slideIn">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">{graphTitle}</h3>
          <p className="text-gray-400 text-center py-4 bg-gray-800 rounded-lg">
            No data available.
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gray-900 rounded-xl glassmorphic shadow-md animate-slideIn">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">{graphTitle}</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#e0e0e0" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
              <YAxis
                stroke="#e0e0e0"
                tick={{ fill: "#a0a0a0", fontSize: 12 }}
                label={{
                  value: isEfficiency ? "Efficiency (%)" : "Pilot Hours",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#a0a0a0",
                  fontSize: 12,
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #444",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value) => (isEfficiency ? `${value}%` : `${value} hrs`)}
              />
              <Bar
                dataKey="value"
                fill={isEfficiency ? "#00ddeb" : "#ff00ff"}
                onClick={handleClick}
                cursor={isCellDisplay ? "default" : "pointer"}
              />
            </BarChart>
          </ResponsiveContainer>
          {!isCellDisplay && !selectedMachine && !isCellView && (
            <div className="text-sm text-gray-400 mt-4 text-center bg-gray-800 p-3 rounded-lg">
              Click on a machine bar to view its cell-level data
            </div>
          )}
        </div>
        {selectedMachine && isCellDisplay && (
          <div className="px-6 pb-6">
            <button
              onClick={() => setSelectedMachine(null)}
              className="w-full px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-300"
            >
              Back to Machines View
            </button>
          </div>
        )}
      </div>
    );
  };

  // DayWiseMachineAllocationChart Component
  const DayWiseMachineAllocationChart = () => {
    const [filteredData, setFilteredData] = useState([]);
    useEffect(() => {
      if (!machineAllocationData || !Array.isArray(machineAllocationData)) {
        console.warn("machineAllocationData is undefined or not an array:", machineAllocationData);
        setFilteredData([]);
        return;
      }
      const newFilteredData = machineAllocationData
        .filter((entry) => entry.workerId === parseInt(workerId, 10))
        .map((entry) => ({
          day: entry.day,
          line: entry.line,
        }));
      console.log("Filtered Data:", newFilteredData);
      setFilteredData(newFilteredData);
    }, [machineAllocationData, workerId]);

    const yAxisLabels = {
      1: "Line 1",
      2: "Line 2",
      3: "Line 3",
      4: "Line 4",
      5: "Line 5",
    };

    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-gray-900 text-white p-3 border border-gray-700 rounded-lg shadow-lg">
            <p className="font-medium">{`Day: ${label}`}</p>
            <p className="text-cyan-400">{`Line: ${yAxisLabels[payload[0].value]}`}</p>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="p-6 bg-gray-900 rounded-xl glassmorphic shadow-md animate-slideIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-cyan-400">
            Day-wise Machine Allocation
          </h2>
        </div>
        {filteredData.length === 0 ? (
          <div className="text-gray-400 text-center py-4 bg-gray-800 rounded-lg">
            No allocation data available for this worker.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="day" stroke="#e0e0e0" tick={{ fill: "#a0a0a0", fontSize: 12 }} />
              <YAxis
                tickFormatter={(tick) => yAxisLabels[tick]}
                type="number"
                domain={[1, 5]}
                interval={0}
                stroke="#e0e0e0"
                tick={{ fill: "#a0a0a0", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: "#e0e0e0", fontSize: 12 }} iconType="circle" />
              <Line
                type="monotone"
                dataKey="line"
                name="Machine Line"
                stroke="#00ddeb"
                strokeWidth={2}
                activeDot={{ r: 8, fill: "#ff00ff", stroke: "#00ddeb", strokeWidth: 2 }}
                dot={{ fill: "#00ddeb", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  // EditWorker Component (Simplified placeholder)
  const EditWorker = () => (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Worker</h2>
      {workerData ? (
        <div>
          <p><strong>Name:</strong> <input defaultValue={workerData.name} className="border p-1" /></p>
          <button
            onClick={() => handleWorkerUpdate({ name: "Updated Name" })}
            className="mt-4 bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600"
          >
            Save
          </button>
        </div>
      ) : (
        <p>No data to edit.</p>
      )}
      <button
        onClick={() => setIsEditing(false)}
        className="mt-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-end gap-4 mb-6">
        <button
          className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600"
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          onClick={handleDeleteWorker}
        >
          Delete Profile
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          onClick={() => setAddingHourly(true)}
        >
          <Plus size={16} /> Add Hourly
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 lg:row-span-4">
          <ProfileInfo />
        </div>
        <div className="lg:col-span-3">
          <HeaderStats />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GraphComponent
            graphTitle="Worker Efficiency in All Lines"
            efficiencyData={efficiencyData}
            selectedMachine={selectedMachine}
            isCellDisplay={false}
          />
          <GraphComponent
            graphTitle="Worker Pilot Hours in All Lines"
            efficiencyData={efficiencyData}
            selectedMachine={selectedMachine}
            isCellDisplay={false}
          />
          {selectedMachine && workerData?.cells?.[selectedMachine.toLowerCase()] && (
            <GraphComponent
              graphTitle={`Efficiency in Cells of Machine ${selectedMachine.toUpperCase()}`}
              efficiencyData={efficiencyData}
              selectedMachine={selectedMachine}
              isCellDisplay={true}
            />
          )}
          {selectedMachine && workerData?.cells?.[selectedMachine.toLowerCase()] && (
            <GraphComponent
              graphTitle={`Pilot Hours in Cells of Machine ${selectedMachine.toUpperCase()}`}
              efficiencyData={efficiencyData}
              selectedMachine={selectedMachine}
              isCellDisplay={true}
            />
          )}
        </div>
        <div className="lg:col-span-2">
          <DayWiseMachineAllocationChart />
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <EditWorker />
        </div>
      )}

      {addingHourly && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="hourly-input-overlay">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">Add Hourly Update</h4>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <select
                  name="time"
                  value={hourlyInput.time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  {timeOptions.map((time, index) => (
                    <option key={index} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Products Made
                </label>
                <input
                  type="number"
                  name="products_made"
                  value={hourlyInput.products_made}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rework</label>
                <input
                  type="number"
                  name="rework_count"
                  value={hourlyInput.rework_count}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Downtime (min)
                </label>
                <input
                  type="number"
                  name="downtime_minutes"
                  value={hourlyInput.downtime_minutes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  min="0"
                  placeholder="0"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Downtime Reason
                </label>
                <select
                  name="downtime_reason"
                  value={hourlyInput.downtime_reason}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select Reason</option>
                  <option value="Machine">Machine</option>
                  <option value="Men">Men</option>
                  <option value="Material">Material</option>
                  <option value="Manufacturing">Manufacturing</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleSaveHourly}
                className="bg-cyan-500 text-white px-3 py-1 rounded-md text-sm hover:bg-cyan-600"
              >
                Save
              </button>
              <button
                onClick={handleCancelHourly}
                className="bg-gray-500 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile; // Explicitly at top levelC
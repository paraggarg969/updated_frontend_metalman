import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function GraphComponent({
  graphTitle,
  chartType,
  workerData,
  efficiencyData,
  selectedMachine,
  onMachineSelect,
  isCellDisplay,
}) {
  if (!workerData) {
    return (
      <div className="bg-gray-900 rounded-xl glassmorphic shadow-md p-6 animate-slideIn">
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
    const cellData = machineData[dataKey] || [];

    return cellData.map((value, index) => ({
      name: `Cell ${index + 1}`,
      value,
    }));
  };

  const handleClick = (data) => {
    if (isCellDisplay || !data) return;
    const machine = data.name.split(" ")[1];
    if (workerData.cells?.[machine.toLowerCase()]) {
      onMachineSelect(machine);
    } else {
      alert("No cell data available for this machine.");
    }
  };

  const chartData = getChartData();
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl glassmorphic shadow-md p-6 animate-slideIn">
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
            <XAxis
              dataKey="name"
              stroke="#e0e0e0"
              tick={{ fill: "#a0a0a0", fontSize: 12 }}
            />
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
            onClick={() => onMachineSelect(null)}
            className="w-full px-4 py-2 text-sm bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all duration-300"
          >
            Back to Machines View
          </button>
        </div>
      )}
    </div>
  );
}

export default GraphComponent;
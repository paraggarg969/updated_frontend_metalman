import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const DayWiseMachineAllocationChart = ({ workerId, machineAllocationData }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Add a safeguard to check if machineAllocationData is defined
    if (!machineAllocationData || !Array.isArray(machineAllocationData)) {
      console.warn("machineAllocationData is undefined or not an array:", machineAllocationData);
      setFilteredData([]);
      return;
    }

    console.log("workerId:", workerId);
    console.log("machineAllocationData:", machineAllocationData);

    const newFilteredData = machineAllocationData
      .filter((entry) => entry.workerId === workerId)
      .map((entry) => ({
        day: entry.day,
        line: entry.line,
      }));
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
            <XAxis
              dataKey="day"
              stroke="#e0e0e0"
              tick={{ fill: "#a0a0a0", fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(tick) => yAxisLabels[tick]}
              type="number"
              domain={[1, 5]}
              interval={0}
              stroke="#e0e0e0"
              tick={{ fill: "#a0a0a0", fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: "#e0e0e0", fontSize: 12 }}
              iconType="circle"
            />
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

export default DayWiseMachineAllocationChart;
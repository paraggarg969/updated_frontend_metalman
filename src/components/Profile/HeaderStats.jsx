import React from "react";
import { TrendingUp, Clock, Package, Layers } from "lucide-react";

const HeaderStats = ({ statsData }) => {
  if (!statsData) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl glassmorphic animate-slideIn">
        <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2 text-white">
          Header Stats
        </h2>
        <p className="text-gray-400 text-center">No stats available.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-6 rounded-xl glassmorphic animate-slideIn">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-gray-700 pb-2 text-white">
        Header Stats
      </h2>
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
    </div>
  );
};

export default HeaderStats;
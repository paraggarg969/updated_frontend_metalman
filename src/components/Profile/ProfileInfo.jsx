import React from "react";
import { FaMale, FaFemale } from "react-icons/fa";
import { User, Clock, Gauge } from "lucide-react";

const ProfileInfo = ({ workerData }) => {
  if (!workerData) {
    return (
      <div className="bg-gray-900 p-6 rounded-xl glassmorphic animate-slideIn">
        <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-700 pb-2 text-white">
          Profile
        </h2>
        <p className="text-gray-400 text-center">No user data available.</p>
      </div>
    );
  }

  const normalizedGender = workerData.gender?.toLowerCase();
  const efficiencyMetrics = Object.entries(workerData)
    .filter(([key]) => key.startsWith("efficiency_"))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => ({
      letter: key.split("_")[1].toUpperCase(),
      value,
    }));

  const pilotHoursMetrics = Object.entries(workerData)
    .filter(([key]) => key.startsWith("pilot_hours_"))
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => ({
      letter: key.replace("pilot_hours_", "").toUpperCase(),
      value,
    }));

  return (
    <div className="bg-gray-900 p-6 rounded-xl glassmorphic animate-slideIn">
      <h2 className="text-3xl font-bold mb-6 border-b-2 border-gray-700 pb-2 text-white">
        Profile
      </h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4">General Info</h3>
        <div className="flex items-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mr-4 border-4 border-gradient-to-r from-cyan-500 to-magenta-500 shadow-glow"
            style={{
              background: `linear-gradient(135deg, #00ddeb, #ff00ff)`,
            }}
          >
            {normalizedGender === "male" ? (
              <FaMale className="text-3xl text-white" />
            ) : normalizedGender === "female" ? (
              <FaFemale className="text-3xl text-white" />
            ) : (
              <User className="text-3xl text-white" />
            )}
          </div>
          <div>
            <p className="font-bold text-2xl text-white">{workerData.name}</p>
            <p className="text-sm text-gray-400">Worker ID: {workerData.worker_id}</p>
            <p className="text-sm text-gray-400">Gender: {workerData.gender}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Gauge className="h-5 w-5" /> Efficiency Ratings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {efficiencyMetrics.map(({ letter, value }) => (
            <div
              key={`efficiency-${letter}`}
              className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-magenta-500 flex items-center justify-center">
                <span className="text-white font-bold">{letter}</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Efficiency {letter}</p>
                <p className="text-lg font-semibold text-white">{value}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" /> Pilot Hours
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pilotHoursMetrics.map(({ letter, value }) => (
            <div
              key={`hours-${letter}`}
              className="p-4 bg-gray-800 rounded-lg hover:shadow-glow transition-all duration-300 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-magenta-500 flex items-center justify-center">
                <span className="text-white font-bold">{letter}</span>
              </div>
              <div>
                <p className="text-sm text-gray-400">Pilot Hours {letter}</p>
                <p className="text-lg font-semibold text-white">{value} hrs</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
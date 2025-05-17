import React, { useContext, useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const DashboardHeader = ({ adminEmail }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="dashboard-header glass-header bg-opacity-80 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center shadow-lg rounded-b-md">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-cyan-400 tracking-wide">Metalman Dashboard</h1>
        <div className="text-sm text-gray-300 hidden sm:block">
          <div>{formattedDate}</div>
          <div>{formattedTime}</div>
        </div>
      </div>
      <div className="header-user flex items-center gap-4 text-sm text-gray-200">
        <span className="font-medium text-cyan-300 hidden sm:inline">{adminEmail}</span>
        <button
          onClick={handleLogout}
          className="logout-button flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition-colors duration-300 text-gray-300 hover:text-white shadow-sm"
          aria-label="Logout"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;

  import React from 'react';
  import { LayoutGrid, Table, User, BookUser, LogOut, UserCog, Edit, FileText, BookCheck, Edit2 } from 'lucide-react';
  import { useNavigate, useLocation } from 'react-router-dom';


  const VerticalNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Define the paths where the navbar should NOT appear
    const hideNavbarPaths = ['/login', '/signup'];

    if (hideNavbarPaths.includes(location.pathname)) {
      return null;
    }

    const navItems = [
      { icon: <LayoutGrid size={20} />, label: 'Analytics', path: '/dashboard' },
      { icon: <Edit2 size={20} />, label: 'User Management', path: '/add-delete' },
      { icon: <Table size={20} />, label: 'Machines', path: '/machines' },  
      { icon: <BookUser size={20} />, label: 'Details', path: '/allworkers' },
      { icon: <UserCog size={20} />, label: 'Credentials', path: '/credentials' },
      { icon: <Edit size={20} />, label: 'Data Entry', path: '/data-entry' },
      { icon: <FileText size={20} />, label: 'Allocation Report', path: '/allocation-report' }, 
      { icon: <Edit size={20} />, label: 'Efficiency Parameters', path: '/formula_edit' },// New nav item
      { icon: <BookCheck size={20} />, label: 'DailyReport', path: '/daily-report' },
      { icon: <UserCog size={20} />, label: 'Monthly_Report', path: '/monthly-report' },
      // New nav item

    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
      localStorage.removeItem('authToken');
      sessionStorage.clear();
      navigate('/login');
    };

    const handleKeyDown = (e, path) => {
      if (e.key === 'Enter' || e.key === ' ') {
        navigate(path);
      }
    };

    return (
      <nav className="fixed top-0 left-0 flex flex-col h-screen w-16 bg-gray-900 border-r border-gray-700 z-50">
        {/* Logo Section */}
        <div
          className="p-3 cursor-pointer transition-transform duration-300 hover:scale-110"
          onClick={() => navigate('/')}
          onKeyDown={(e) => handleKeyDown(e, '/')}
          tabIndex={0}
          aria-label="Navigate to Home"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <span className="text-white text-lg font-bold">MM</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-2 py-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              onKeyDown={(e) => handleKeyDown(e, item.path)}
              tabIndex={0}
              className={`w-full p-3 transition-all duration-300 group relative
                ${isActive(item.path) ? 'bg-gray-800' : 'hover:bg-gray-800'}
              `}
              aria-label={`Navigate to ${item.label}`}
            >
              <div
                className={`flex justify-center transition-transform duration-300
                  ${isActive(item.path) ? 'text-white scale-110' : 'text-gray-400 group-hover:text-white group-hover:scale-110'}
                `}
              >
                {item.icon}
              </div>
              {isActive(item.path) && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 rounded-r animate-slide-in" />
              )}
              <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap flex items-center">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-800"></div>
                {item.label}
              </div>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <div className="py-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleLogout();
              }
            }}
            tabIndex={0}
            className="w-full p-3 transition-all duration-300 group relative hover:bg-gray-800"
            aria-label="Logout"
          >
            <div className="flex justify-center text-gray-400 group-hover:text-white transition-transform duration-300 group-hover:scale-110">
              <LogOut size={20} />
            </div>
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 whitespace-nowrap flex items-center">
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-800"></div>
              Logout
            </div>
          </button>
        </div>
      </nav>
    );
  };

  export default VerticalNavbar;
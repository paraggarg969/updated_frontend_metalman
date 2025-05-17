import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import VerticalNavbar from './components/Navbar/navbar';
import MachineAnalytics from './components/MachineAnalytics/ma';
import LineAndCellPage from './components/MachineTable/machinetable';
import Profile from './components/Profile/Profilepage';
import Dashboard from './components/Dashboard/Dashboardpage';
import LoginSignup from './components/LoginSignup/LoginSignup';
import Allworkers from './components/allworkers/allworkers';
import DataEntryPage from './components/Dataentry/DataEntryPage';
import Credentials from './components/Credentials/Credentials';
import AllocationReportPage from './components/AllocationReport/AllocationReportPage';
import FormulaEditPage from './components/Formula/FormulaEditPage';
import DailyReportPage from './components/DailyReport/DailyReportPage'; // Importing the DailyReport component
import MonthlyYearlyReportPage from './components/YearlyReport/MonthlyReportPage'; // Import Monthly Report Page
import UserManagementPage from './components/Workeradddetele/UserManagementPag';
// ✅ Toast imports
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// ProtectedRoute component to handle authentication and authorization logic
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = React.useContext(AuthContext);

  // If no user is authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user does not have permission, redirect to unauthorized page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  // Otherwise, render the requested element (component)
  return element;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthContext.Consumer>
          {({ user }) => (
            <div className="flex">
              {/* Show the navbar only if the user is authenticated */}
              {user && <VerticalNavbar />}

              <div className={user ? 'flex-1 pl-16' : ''}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginSignup />} />

                  {/* Protected Routes */}
                  <Route path="/" element={<ProtectedRoute element={<MachineAnalytics />} />} />
                  <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
                  <Route path="/machines" element={<ProtectedRoute element={<LineAndCellPage  />}/>}/>

                  {/* Admin, Manager, and Worker Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'worker']} element={<Dashboard />} />
                    }
                  />
                  <Route path="/allworkers" element={<ProtectedRoute element={<Allworkers />} />} />
                  <Route path="/credentials" element={<ProtectedRoute element={<Credentials />} />} />
                  <Route path="/data-entry" element={<ProtectedRoute element={<DataEntryPage />} />} />
                  <Route path="/allocation-report" element={<ProtectedRoute element={<AllocationReportPage />} />} />
                  <Route
                    path="/formula_edit"
                    element={<ProtectedRoute element={<FormulaEditPage />} />}
                  />

                  {/* Add Daily Report Route */}
                  <Route
                    path="/daily-report"
                    element={<ProtectedRoute element={<DailyReportPage />} />}
                  />

                  {/* Add Monthly Report Route */}
                  <Route
                    path="/monthly-report"
                    element={<ProtectedRoute element={<MonthlyYearlyReportPage />} />}
                  />
                     <Route
                    path="/add-delete"
                    element={<ProtectedRoute element={<UserManagementPage/>} />}
                  />


                  {/* Unauthorized Access Route */}
                  <Route path="/unauthorized" element={<h2>Unauthorized Access</h2>} />

                  {/* Catch-all route for invalid paths */}
                  <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
              </div>

              {/* Toast container for notifications */}
              <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
            </div>
          )}
        </AuthContext.Consumer>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
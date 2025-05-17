import React, { useState, useEffect } from "react";
import "../Dashboard/DashboardHeader.css";
import AdminAvatar from "../Dashboard/admin.png";
import LogoImage from "../Dashboard/logo.png";

const DashboardHeader = ({ adminAvatar, adminEmail }) => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [currentShift, setCurrentShift] = useState("");

  useEffect(() => {
    const updateDateTimeAndShift = () => {
      const now = new Date();

      // Format Time with leading zeros (e.g., 03:28:24 PM)
      const hours = now.getHours() % 12 || 12; // Convert to 12-hour format
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const ampm = now.getHours() >= 12 ? "PM" : "AM";
      const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

      // Format Date (e.g., Thursday, March 20, 2025)
      const formattedDate = now.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);

      // Determine Shift Based on Hours (0 - 23)
      const currentHour = now.getHours();
      const shift = currentHour < 12 ? "Shift 1" : "Shift 2";
      setCurrentShift(shift);
    };

    // Update every second
    const intervalId = setInterval(updateDateTimeAndShift, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="dashboard-header">
      {/* Left Section - Logo */}
      <div className="logo-container">
        <img src={LogoImage} alt="Company Logo" className="logo-image" />
      </div>

      {/* Center Section - Time and Shift Details */}
      <div className="time-shift">
        <div className="time">{currentTime}</div>
        <div className="shift-date">{currentDate}</div>
        <div className="shift">{currentShift}</div>
      </div>

      {/* Right Section - Admin Info */}
      <div className="admin-info">
        <img src={AdminAvatar} alt="Admin Avatar" className="admin-avatar" />
        <div className="admin-email">{adminEmail}</div>
      </div>
    </div>
  );
};

export default DashboardHeader;





// APi 
// GET /api/profile

// Returns info of the currently authenticated user (based on token/session)

// 📤 Example Response:
// json
// Copy
// Edit
// {
//   "user_id": 12,
//   "name": "Sarthak Jindal",
//   "email": "sarthak@metalman.com",
//   "role": "Supervisor",
//   "avatar_url": "/uploads/avatars/sarthak.png"
// }



// updated code 
// import React, { useState, useEffect } from "react";
// import "../Dashboard/DashboardHeader.css";
// import LogoImage from "../Dashboard/logo.png";

// const DashboardHeader = () => {
//   const [currentTime, setCurrentTime] = useState("");
//   const [currentDate, setCurrentDate] = useState("");
//   const [currentShift, setCurrentShift] = useState("");
//   const [user, setUser] = useState({
//     name: "Loading...",
//     email: "Loading...",
//     role: "User",
//     avatar_url: ""
//   });

//   useEffect(() => {
//     const updateDateTimeAndShift = () => {
//       const now = new Date();
//       const hours = now.getHours() % 12 || 12;
//       const minutes = String(now.getMinutes()).padStart(2, "0");
//       const seconds = String(now.getSeconds()).padStart(2, "0");
//       const ampm = now.getHours() >= 12 ? "PM" : "AM";
//       const formattedTime = `${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;

//       const formattedDate = now.toLocaleDateString([], {
//         weekday: "long",
//         year: "numeric",
//         month: "long",
//         day: "numeric",
//       });

//       setCurrentTime(formattedTime);
//       setCurrentDate(formattedDate);
//       setCurrentShift(now.getHours() < 12 ? "Shift 1" : "Shift 2");
//     };

//     const intervalId = setInterval(updateDateTimeAndShift, 1000);
//     return () => clearInterval(intervalId);
//   }, []);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const response = await fetch("/api/profile");
//         const data = await response.json();
//         setUser(data);
//       } catch (err) {
//         console.error("Error loading user profile:", err);
//       }
//     };

//     fetchUserProfile();
//   }, []);

//   return (
//     <div className="dashboard-header">
//       {/* Left: Company Logo */}
//       <div className="logo-container">
//         <img src={LogoImage} alt="Company Logo" className="logo-image" />
//       </div>

//       {/* Center: Date/Time/Shift */}
//       <div className="time-shift">
//         <div className="time">{currentTime}</div>
//         <div className="shift-date">{currentDate}</div>
//         <div className="shift">{currentShift}</div>
//       </div>

//       {/* Right: Dynamic User Info */}
//       <div className="admin-info">
//         <img
//           src={user.avatar_url || "/default-avatar.png"}
//           alt="User Avatar"
//           className="admin-avatar"
//         />
//         <div className="admin-email">
//           <strong>{user.name}</strong><br />
//           <small>{user.role}</small><br />
//           <span>{user.email}</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DashboardHeader;

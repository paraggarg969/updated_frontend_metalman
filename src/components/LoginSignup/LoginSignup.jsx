import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import './LoginSignup.css';
import Logo from './Logo.png';

// Dummy user data for demonstration
const dummyUsers = [
  { username: 'admin', password: 'Admin@123', role: 'admin' },
  { username: 'manager', password: 'Manager@123', role: 'manager' },
  { username: 'dataentry', password: 'Data@123', role: 'dataentry' },
];

const LoginSignup = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    setTimeout(() => {
      const user = dummyUsers.find(u => u.username === formData.username && u.password === formData.password);
      if (user) {
        console.log('Logged in as:', user.role);
        setTimeout(() => {
          setLoading(false);
          navigate('/dashboard', { state: { role: user.role } });
        }, 500);
      } else {
        setErrorMessage('Invalid username or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-container">
      {loading && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Loader2 className="loader" size={48} />
        </motion.div>
      )}
      <motion.div
        className="left-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
      >
        <span className="welcome-text">Welcome to Metalman</span>
        <p className="slogan">Optimize. Innovate. Succeed.</p>
      </motion.div>
      <motion.div
        className="right-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <form onSubmit={handleSubmit} className="login-form">
          <div className="logo-container">
            <img src={Logo} alt="Metalman Logo" className="logo" />
          </div>
          <h2 className="form-title">Login</h2>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`form-input ${errorMessage ? 'input-error' : ''}`}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-wrapper password-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errorMessage ? 'input-error' : ''}`}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="show-password-btn"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="form-options">
            <div className="form-group-remember">
              <input
                type="checkbox"
                id="remember-me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
          </div>

          {errorMessage && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {errorMessage}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginSignup;


// after api

// Endpoint: POST /api/auth/login
// Headers: Content-Type: application/json
// Request Body:

// json
// Copy
// Edit
// {
//   "username": "admin",
//   "password": "Admin@123"
// }
// Success Response:

// json
// Copy
// Edit
// {
//   "token": "JWT_TOKEN",
//   "user": {
//     "id": 1,
//     "username": "admin",
//     "role": "admin"
//   }
// }
// Error Response:

// json
// Copy
// Edit
// {
//   "message": "Invalid username or password"
// }


// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Eye, EyeOff, Loader2 } from 'lucide-react';
// import './LoginSignup.css';
// import Logo from './Logo.png';

// const LoginSignup = () => {
//   const [formData, setFormData] = useState({ username: '', password: '' });
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setErrorMessage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');
//     setLoading(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           username: formData.username,
//           password: formData.password,
//         }),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         // ✅ Store token (optional: in localStorage or context)
//         localStorage.setItem('token', data.token);

//         // ✅ Navigate to dashboard
//         navigate('/dashboard', { state: { role: data.user.role } });
//       } else {
//         setErrorMessage(data.message || 'Login failed');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setErrorMessage('Server error. Please try again later.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       {loading && (
//         <motion.div className="loading-overlay" initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}>
//           <Loader2 className="loader" size={48} />
//         </motion.div>
//       )}

//       <motion.div className="left-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }}>
//         <span className="welcome-text">Welcome to Metalman</span>
//         <p className="slogan">Optimize. Innovate. Succeed.</p>
//       </motion.div>

//       <motion.div className="right-section" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }}>
//         <form onSubmit={handleSubmit} className="login-form">
//           <div className="logo-container">
//             <img src={Logo} alt="Metalman Logo" className="logo" />
//           </div>
//           <h2 className="form-title">Login</h2>

//           <div className="form-group">
//             <label htmlFor="username" className="form-label">Username</label>
//             <div className="input-wrapper">
//               <input
//                 type="text"
//                 id="username"
//                 name="username"
//                 value={formData.username}
//                 onChange={handleChange}
//                 className={`form-input ${errorMessage ? 'input-error' : ''}`}
//                 placeholder="Enter your username"
//                 required
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label htmlFor="password" className="form-label">Password</label>
//             <div className="input-wrapper password-container">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 id="password"
//                 name="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 className={`form-input ${errorMessage ? 'input-error' : ''}`}
//                 placeholder="Enter your password"
//                 required
//               />
//               <button type="button" onClick={() => setShowPassword(!showPassword)} className="show-password-btn">
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <div className="form-options">
//             <div className="form-group-remember">
//               <input type="checkbox" id="remember-me" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
//               <label htmlFor="remember-me">Remember me</label>
//             </div>
//           </div>

//           {errorMessage && (
//             <motion.p className="error-message" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
//               {errorMessage}
//             </motion.p>
//           )}

//           <motion.button type="submit" className="login-btn" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
//             {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
//           </motion.button>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginSignup;

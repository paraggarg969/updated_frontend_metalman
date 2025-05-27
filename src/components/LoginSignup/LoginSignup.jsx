import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import './LoginSignup.css';
import Logo from './Logo.png';

// Mock API function to simulate backend authentication
const mockLoginApi = async (username, password) => {
  const dummyUsers = [
    { username: 'admin', password: 'Admin@123', role: 'admin' },
    { username: 'manager', password: 'Manager@123', role: 'manager' },
    { username: 'dataentry', password: 'Data@123', role: 'worker' },
  ];

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = dummyUsers.find(
        (u) => u.username === username && u.password === password
      );
      if (user) {
        resolve({
          user: { username: user.username, role: user.role },
          token: `mock-token-${user.username}`, // Simulate a JWT token
        });
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, 800);
  });
};

const LoginSignup = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const { user, token } = await mockLoginApi(formData.username, formData.password);
      login(user, token, rememberMe);
      setLoading(false);
      navigate('/dashboard', { state: { role: user.role } });
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {loading && (
        <motion.div
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Loader2 className="loader" size={48} />
        </motion.div>
      )}
      <motion.div
        className="left-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <span className="welcome-text">Welcome to Metalman</span>
        <p className="slogan">Optimize. Innovate. Succeed.</p>
      </motion.div>
      <motion.div
        className="right-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
      >
        <form onSubmit={handleSubmit} className="login-form">
          <div className="logo-container">
            <img src={Logo} alt="Metalman Logo" className="logo" />
          </div>
          <h2 className="form-title">Login</h2>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
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
                aria-label="Username"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
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
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="show-password-btn"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                aria-label="Remember me"
              />
              <label htmlFor="remember-me">Remember me</label>
            </div>
            <button type="button" className="link-button">Forgot Password?</button>
          </div>
          {errorMessage && (
            <motion.p
              className="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
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
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
          </motion.button>
          <p className="signup-link">
            <span>Don’t have an account?</span>
            <button type="button" className="link-button">Sign Up</button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginSignup;


// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Eye, EyeOff, Loader2 } from 'lucide-react';
// import { AuthContext } from '../../context/AuthContext';
// import './LoginSignup.css';
// import Logo from './Logo.png';

// const API_BASE_URL = 'https://metalman-project.vercel.app/api/auth';

// const LoginSignup = () => {
//   const [formData, setFormData] = useState({ email_id: '', password: '' });
//   const [rememberMe, setRememberMe] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const { login } = useContext(AuthContext);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrorMessage('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage('');
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email_id: formData.email_id,
//           password: formData.password,
//         }),
//       });

//       if (!response.ok) {
//       const errorData = await response.json().catch(() => null);
//       const msg = errorData?.message || 'Login failed. Please try again.';
//       throw new Error(msg);
//     }

//       const data = await response.json();
//       const { user, token } = data;

//       login(user, token, rememberMe);
//       setLoading(false);
//       navigate('/dashboard', { state: { role: user.role } });

//     } catch (error) {
//       setErrorMessage(error.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-container">
//       {loading && (
//         <motion.div
//           className="loading-overlay"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 0.7 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.3, ease: 'easeOut' }}
//         >
//           <Loader2 className="loader" size={48} />
//         </motion.div>
//       )}
//       <motion.div
//         className="left-section"
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1.5, ease: 'easeOut' }}
//       >
//         <span className="welcome-text">Welcome to Metalman</span>
//         <p className="slogan">Optimize. Innovate. Succeed.</p>
//       </motion.div>
//       <motion.div
//         className="right-section"
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
//       >
//         <form onSubmit={handleSubmit} className="login-form">
//           <div className="logo-container">
//             <img src={Logo} alt="Metalman Logo" className="logo" />
//           </div>
//           <h2 className="form-title">Login</h2>

//           <div className="form-group">
//             <label htmlFor="email_id" className="form-label">
//               Email ID
//             </label>
//             <div className="input-wrapper">
//               <input
//                 type="email"
//                 id="email_id"
//                 name="email_id"
//                 value={formData.email_id}
//                 onChange={handleChange}
//                 className={`form-input ${errorMessage ? 'input-error' : ''}`}
//                 placeholder="Enter your email"
//                 required
//                 autoComplete="email"
//                 aria-label="Email"
//               />
//             </div>
//           </div>

//           <div className="form-group">
//             <label htmlFor="password" className="form-label">
//               Password
//             </label>
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
//                 autoComplete="current-password"
//                 aria-label="Password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="show-password-btn"
//                 aria-label={showPassword ? 'Hide password' : 'Show password'}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </div>

//           <div className="form-options">
//             <div className="form-group-remember">
//               <input
//                 type="checkbox"
//                 id="remember-me"
//                 checked={rememberMe}
//                 onChange={(e) => setRememberMe(e.target.checked)}
//                 aria-label="Remember me"
//               />
//               <label htmlFor="remember-me">Remember me</label>
//             </div>
//             <button type="button" className="link-button">Forgot Password?</button>
//           </div>

//           {errorMessage && (
//             <motion.p
//               className="error-message"
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, ease: 'easeOut' }}
//             >
//               {errorMessage}
//             </motion.p>
//           )}

//           <motion.button
//             type="submit"
//             className="login-btn"
//             disabled={loading}
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             transition={{ duration: 0.2, ease: 'easeOut' }}
//           >
//             {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
//           </motion.button>

//           <p className="signup-link">
//             <span>Don’t have an account?</span>
//             <button type="button" className="link-button">Sign Up</button>
//           </p>
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginSignup;
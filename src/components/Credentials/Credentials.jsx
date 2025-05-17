import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2, Check, X, Copy, User, Edit2, Trash2 } from 'lucide-react';
import './Credentials.css';

// Toast Component
const Toast = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`credentials-toast credentials-toast-${type}`}>
      <div className="flex items-center space-x-2">
        {type === 'success' ? <Check className="w-5 h-5 text-cyan-400" /> : <X className="w-5 h-5 text-red-400" />}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Validation Utility
const validateCredentials = (data, isEditMode = false) => {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Name is required.';
  else if (!/^[A-Za-z\s]+$/.test(data.name)) errors.name = 'Name can only contain letters and spaces.';

  if (!data.gender) errors.gender = 'Please select a gender.';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email_id?.trim()) errors.email_id = 'Email is required.';
  else if (!emailRegex.test(data.email_id)) errors.email_id = 'Please enter a valid email address.';

  if (!isEditMode || (isEditMode && data.password?.trim())) {
    if (!data.password?.trim()) errors.password = 'Password is required.';
    else {
      const checks = {
        minLength: data.password.length >= 8,
        hasUpperCase: /[A-Z]/.test(data.password),
        hasNumber: /[0-9]/.test(data.password),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
      };
      if (!checks.minLength) errors.password = 'Password must be at least 8 characters long.';
      else if (!checks.hasUpperCase) errors.password = 'Password must contain at least one uppercase letter.';
      else if (!checks.hasNumber) errors.password = 'Password must contain at least one number.';
      else if (!checks.hasSpecialChar) errors.password = 'Password must contain at least one special character.';
    }
  }

  if (!data.role) errors.role = 'Please select a role.';

  return errors;
};

const Credentials = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const token = localStorage.getItem('token');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: { name: '', gender: '', email_id: '', password: '', role: '' },
  });

  const API_BASE_URL = 'https://metalman-project.vercel.app/api/auth';

  // Fetch current user details with error retry
  const fetchCurrentUser = useCallback(async () => {
    if (!token) {
      setToast({ show: true, message: 'No authentication token found.', type: 'error' });
      return;
    }
    setIsLoading(true);
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = response.data;
        setCurrentUser({
          name: userData.name,
          email_id: userData.email || userData.email_id,
          role: userData.role?.toLowerCase(),
        });
        break; // Exit loop on success
      } catch (error) {
        retryCount++;
        console.error(`Error fetching current user (Attempt ${retryCount}):`, error);
        if (retryCount === maxRetries) {
          setToast({ show: true, message: 'Failed to fetch current user after retries.', type: 'error' });
        } else {
          setToast({ show: true, message: `Failed to fetch current user. Retrying (${maxRetries - retryCount} attempts left)...`, type: 'error' });
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
        }
      }
    }
    setIsLoading(false);
  }, [token]);

  // Fetch all users with pagination support
  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/manager-details?page=${page}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let fetchedUsers = response.data.managers || [];
      fetchedUsers = fetchedUsers.map(user => ({
        ...user,
        role: user.role?.toLowerCase(),
      }));
      if (currentUser && !fetchedUsers.some(user => user.email_id === currentUser.email_id)) {
        fetchedUsers = [currentUser, ...fetchedUsers];
      }
      setUsers(prevUsers => [...prevUsers.filter(u => !fetchedUsers.some(fu => fu.email_id === u.email_id)), ...fetchedUsers]);
    } catch (error) {
      console.error('Error fetching users:', error);
      setToast({ show: true, message: 'Failed to fetch users.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [token, currentUser]);

  useEffect(() => {
    if (token) fetchCurrentUser();
  }, [token, fetchCurrentUser]);

  useEffect(() => {
    if (token) fetchUsers();
  }, [token, fetchUsers]);

  // Memoized sorted users for performance
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const valueA = a[sortConfig.key] || '';
      const valueB = b[sortConfig.key] || '';
      return sortConfig.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  }, [users, sortConfig]);

  // Handle form submission with debouncing
  const onSubmit = async (data) => {
    const validationErrors = validateCredentials(data, editMode);
    if (Object.keys(validationErrors).length > 0) {
      setToast({ show: true, message: Object.values(validationErrors)[0], type: 'error' });
      return;
    }

    setIsLoading(true);
    const url = editMode ? `${API_BASE_URL}/update-manager-profile` : `${API_BASE_URL}/add-manager`;
    const payload = {
      name: data.name.trim(),
      gender: data.gender.toLowerCase(),
      email: data.email_id.trim(),
      ...(data.password && { password: data.password }),
      role: data.role.toLowerCase(),
      ...(editMode && { manager_id: currentUserId }),
    };

    try {
      const response = await axios({
        method: editMode ? 'PUT' : 'POST',
        url,
        data: payload,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      const newUser = response.data;
      setUsers(prev => 
        editMode 
          ? prev.map(u => u.email_id === newUser.email_id ? { ...newUser, role: newUser.role?.toLowerCase() } : u)
          : [...prev, { ...newUser, role: newUser.role?.toLowerCase() }]
      );
      setToast({ show: true, message: `Credentials ${editMode ? 'updated' : 'added'} successfully!`, type: 'success' });
      resetForm();
    } catch (error) {
      console.error('Error adding/updating user:', error);
      setToast({ show: true, message: error.response?.data?.message || 'Failed to add/update credentials.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user with confirmation
  const handleDeleteUser = async (email_id) => {
    if (!window.confirm(`Are you sure you want to delete ${users.find(u => u.email_id === email_id)?.name || 'this user'}?`)) return;
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/delete-manager`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { email_id },
      });
      setUsers(prev => prev.filter(u => u.email_id !== email_id));
      setToast({ show: true, message: 'Credentials deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting user:', error);
      setToast({ show: true, message: 'Failed to delete user.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setToast({ show: true, message: 'Email copied to clipboard!', type: 'success' });
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Reset form
  const resetForm = () => {
    reset();
    setEditMode(false);
    setCurrentUserId(null);
    setShowPassword(false);
  };

  // Enable edit mode
  const handleEditUser = (user) => {
    setValue('name', user.name);
    setValue('gender', user.gender);
    setValue('email_id', user.email_id);
    setValue('password', ''); // Clear password for security
    setValue('role', user.role);
    setCurrentUserId(user.manager_id || user._id); // Handle potential ID variations
    setEditMode(true);
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="credentials-container">
      {isLoading && (
        <div className="credentials-loading-overlay">
          <Loader2 className="credentials-loader animate-spin" size={48} />
        </div>
      )}

      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      <div className="credentials-split">
        <div className="credentials-form-section">
          <h1 className="credentials-title">{editMode ? 'Update Credentials' : 'Add Credentials'}</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="credentials-form" autoComplete="off">
            <div className="credentials-field">
              <label htmlFor="name" className="credentials-label">Name</label>
              <input
                id="name"
                {...register('name')}
                className={`credentials-input ${errors.name ? 'input-error' : ''}`}
                autoComplete="new-name"
                aria-label="Name"
              />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            <div className="credentials-field">
              <label htmlFor="gender" className="credentials-label">Gender</label>
              <select
                id="gender"
                {...register('gender')}
                className={`credentials-input ${errors.gender ? 'input-error' : ''}`}
                autoComplete="new-gender"
                aria-label="Gender"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && <p className="field-error">{errors.gender.message}</p>}
            </div>

            <div className="credentials-field">
              <label htmlFor="email_id" className="credentials-label">Email</label>
              <input
                id="email_id"
                type="email"
                {...register('email_id')}
                className={`credentials-input ${errors.email_id ? 'input-error' : ''}`}
                autoComplete="new-email"
                aria-label="Email"
                disabled={editMode} // Prevent email edit in edit mode for security
              />
              {errors.email_id && <p className="field-error">{errors.email_id.message}</p>}
            </div>

            <div className="credentials-field">
              <label htmlFor="password" className="credentials-label">Password {editMode && '(Optional)'}</label>
              <div className="credentials-password-container">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`credentials-input ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="credentials-show-password-button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            <div className="credentials-field">
              <label htmlFor="role" className="credentials-label">Role</label>
              <select
                id="role"
                {...register('role')}
                className={`credentials-input ${errors.role ? 'input-error' : ''}`}
                autoComplete="new-role"
                aria-label="Role"
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="data_entry">Data Entry</option>
              </select>
              {errors.role && <p className="field-error">{errors.role.message}</p>}
            </div>

            <div className="credentials-form-actions">
              <button
                type="submit"
                className="credentials-button"
                disabled={isLoading}
                aria-label={editMode ? 'Update Credentials' : 'Add Credentials'}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : editMode ? 'Update Credentials' : 'Add Credentials'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="credentials-clear-button"
                aria-label="Clear form"
              >
                <X size={18} className="mr-2" /> Clear Form
              </button>
            </div>
          </form>
        </div>

        <div className="credentials-list-section">
          <h2 className="credentials-list-title">Credentials List</h2>
          {users.length > 0 ? (
            <>
              <div className="credentials-sort-controls">
                {['name', 'email_id', 'role'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className="credentials-sort-button"
                  >
                    Sort by {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortConfig.key === key && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ))}
              </div>
              <ul className="credentials-list">
                {sortedUsers.map((user) => (
                  <li key={user.email_id} className="credentials-item">
                    <div className="credentials-info">
                      <div className="credentials-user-header">
                        <User size={20} className="credentials-user-icon" />
                        <span className="credentials-user-name">{user.name}</span>
                        <span className={`credentials-role-badge role-${user.role}`}>
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="credentials-user-email">
                        <span>{user.email_id}</span>
                      </div>
                    </div>
                    <div className="credentials-actions">
                      <button
                        onClick={() => handleCopyEmail(user.email_id)}
                        className="credentials-copy-button group relative"
                        aria-label={`Copy email ${user.email_id}`}
                      >
                        {copiedEmail === user.email_id ? <Check size={16} /> : <Copy size={16} />}
                        <span className="credentials-tooltip">
                          {copiedEmail === user.email_id ? 'Copied!' : 'Copy Email'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="credentials-edit-button group relative"
                        aria-label={`Edit user ${user.name}`}
                      >
                        <Edit2 size={16} /> Edit
                        <span className="credentials-tooltip">Edit this user</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.email_id)}
                        className="credentials-delete-button group relative"
                        aria-label={`Delete user ${user.name}`}
                      >
                        <Trash2 size={16} /> Delete
                        <span className="credentials-tooltip">Delete this user</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="credentials-no-users">No users found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Credentials;





// //1. GET /api/auth/me
// Purpose: Fetch details of the currently logged-in user (used to identify current manager/admin).

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <token>
// Request Body: None

// Response Example:

// json
// Copy
// Edit
// {
//   "name": "Sarthak Jindal",
//   "email": "sarthak@metalman.com",
//   "role": "admin"
// }
// Notes:

// Token must be valid (usually stored in localStorage).

// Retry mechanism is used if it fails temporarily (you implemented it in the code).

// 👥 2. GET /api/auth/manager-details
// Purpose: Fetch list of all registered managers/users (used to populate credentials table).

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <token>
// Query Parameters (optional):

// http
// Copy
// Edit
// ?page=1&limit=10
// Response Example:

// json
// Copy
// Edit
// {
//   "managers": [
//     {
//       "manager_id": "abc123",
//       "name": "Amit Sharma",
//       "email_id": "amit@metalman.com",
//       "role": "manager",
//       "gender": "male"
//     },
//     ...
//   ]
// }
// ➕ 3. POST /api/auth/add-manager
// Purpose: Add a new manager or user credential.

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <token>
// Content-Type: application/json
// Request Body:

// json
// Copy
// Edit
// {
//   "name": "Amit Sharma",
//   "email": "amit@metalman.com",
//   "password": "Password@123",
//   "role": "manager",
//   "gender": "male"
// }
// Response Example:

// json
// Copy
// Edit
// {
//   "manager_id": "abc123",
//   "name": "Amit Sharma",
//   "email_id": "amit@metalman.com",
//   "role": "manager"
// }
// Validation:

// Password must be min 8 characters with upper-case, number, and special char.

// Role should be one of admin, manager, data_entry.

// 📝 4. PUT /api/auth/update-manager-profile
// Purpose: Update an existing manager/user’s credentials.

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <token>
// Content-Type: application/json
// Request Body:

// json
// Copy
// Edit
// {
//   "manager_id": "abc123",
//   "name": "Amit Sharma",
//   "email": "amit@metalman.com",
//   "password": "NewPassword@456",  // optional if not changing
//   "role": "admin",
//   "gender": "male"
// }
// Response Example:

// json
// Copy
// Edit
// {
//   "message": "User updated successfully"
// }
// Note: Email is not editable after creation (disabled in UI).

// ❌ 5. DELETE /api/auth/delete-manager
// Purpose: Delete a user credential from the system.

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <token>
// Content-Type: application/json
// Request Body:

// json
// Copy
// Edit
// {
//   "email_id": "amit@metalman.com"
// }
// Response Example:

// json
// Copy
// Edit
// {
//   "message": "Manager deleted successfully"
// }
// Note: Confirmation prompt should be used before calling this endpoint.

// code 


// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import axios from 'axios';
// import { useForm } from 'react-hook-form';
// import { Eye, EyeOff, Loader2, Check, X, Copy, User, Edit2, Trash2 } from 'lucide-react';
// import './Credentials.css';

// const Toast = ({ message, onClose, type = 'success' }) => {
//   useEffect(() => {
//     const timer = setTimeout(onClose, 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div className={`credentials-toast credentials-toast-${type}`}>
//       <div className="flex items-center space-x-2">
//         {type === 'success' ? <Check className="w-5 h-5 text-cyan-400" /> : <X className="w-5 h-5 text-red-400" />}
//         <span>{message}</span>
//       </div>
//     </div>
//   );
// };

// const validateCredentials = (data, isEditMode = false) => {
//   const errors = {};
//   if (!data.name?.trim()) errors.name = 'Name is required.';
//   else if (!/^[A-Za-z\s]+$/.test(data.name)) errors.name = 'Name can only contain letters and spaces.';
//   if (!data.gender) errors.gender = 'Please select a gender.';
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!data.email_id?.trim()) errors.email_id = 'Email is required.';
//   else if (!emailRegex.test(data.email_id)) errors.email_id = 'Please enter a valid email address.';
//   if (!isEditMode || (isEditMode && data.password?.trim())) {
//     if (!data.password?.trim()) errors.password = 'Password is required.';
//     else {
//       const checks = {
//         minLength: data.password.length >= 8,
//         hasUpperCase: /[A-Z]/.test(data.password),
//         hasNumber: /[0-9]/.test(data.password),
//         hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(data.password),
//       };
//       if (!checks.minLength) errors.password = 'Password must be at least 8 characters long.';
//       else if (!checks.hasUpperCase) errors.password = 'Password must contain at least one uppercase letter.';
//       else if (!checks.hasNumber) errors.password = 'Password must contain at least one number.';
//       else if (!checks.hasSpecialChar) errors.password = 'Password must contain at least one special character.';
//     }
//   }
//   if (!data.role) errors.role = 'Please select a role.';
//   return errors;
// };

// const Credentials = () => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
//   const [isLoading, setIsLoading] = useState(false);
//   const [copiedEmail, setCopiedEmail] = useState(null);
//   const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

//   const token = localStorage.getItem('token');

//   const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
//     defaultValues: { name: '', gender: '', email_id: '', password: '', role: '' },
//   });

//   const API_BASE_URL = 'https://metalman-project.vercel.app/api/auth';

//   const fetchCurrentUser = useCallback(async () => {
//     if (!token) {
//       setToast({ show: true, message: 'No authentication token found.', type: 'error' });
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const userData = response.data;
//       setCurrentUser({
//         name: userData.name,
//         email_id: userData.email || userData.email_id,
//         role: userData.role?.toLowerCase(),
//       });
//     } catch (error) {
//       console.error('Error fetching current user:', error);
//       setToast({ show: true, message: 'Failed to fetch current user.', type: 'error' });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [token]);

//   const fetchUsers = useCallback(async () => {
//     if (!token) return;
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/manager-details`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       let fetchedUsers = response.data.managers || [];
//       fetchedUsers = fetchedUsers.map(user => ({
//         ...user,
//         role: user.role?.toLowerCase(),
//       }));
//       setUsers(fetchedUsers);
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       setToast({ show: true, message: 'Failed to fetch users.', type: 'error' });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchCurrentUser();
//     fetchUsers();
//   }, [fetchCurrentUser, fetchUsers]);

//   const sortedUsers = useMemo(() => {
//     return [...users].sort((a, b) => {
//       const valueA = a[sortConfig.key] || '';
//       const valueB = b[sortConfig.key] || '';
//       return sortConfig.direction === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
//     });
//   }, [users, sortConfig]);

//   const onSubmit = async (data) => {
//     const validationErrors = validateCredentials(data, editMode);
//     if (Object.keys(validationErrors).length > 0) {
//       setToast({ show: true, message: Object.values(validationErrors)[0], type: 'error' });
//       return;
//     }
//     setIsLoading(true);
//     const url = editMode ? `${API_BASE_URL}/update-manager-profile` : `${API_BASE_URL}/add-manager`;
//     const payload = {
//       name: data.name.trim(),
//       gender: data.gender.toLowerCase(),
//       email: data.email_id.trim(),
//       ...(data.password && { password: data.password }),
//       role: data.role.toLowerCase(),
//       ...(editMode && { manager_id: currentUserId }),
//     };
//     try {
//       const response = await axios({
//         method: editMode ? 'PUT' : 'POST',
//         url,
//         data: payload,
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
//       });
//       setToast({ show: true, message: `Credentials ${editMode ? 'updated' : 'added'} successfully!`, type: 'success' });
//       fetchUsers();
//       resetForm();
//     } catch (error) {
//       console.error('Error adding/updating user:', error);
//       setToast({ show: true, message: error.response?.data?.message || 'Failed to add/update credentials.', type: 'error' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteUser = async (email_id) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) return;
//     setIsLoading(true);
//     try {
//       await axios.delete(`${API_BASE_URL}/delete-manager`, {
//         headers: { Authorization: `Bearer ${token}` },
//         data: { email_id },
//       });
//       setUsers(prev => prev.filter(u => u.email_id !== email_id));
//       setToast({ show: true, message: 'Credentials deleted successfully!', type: 'success' });
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       setToast({ show: true, message: 'Failed to delete user.', type: 'error' });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCopyEmail = (email) => {
//     navigator.clipboard.writeText(email);
//     setCopiedEmail(email);
//     setToast({ show: true, message: 'Email copied to clipboard!', type: 'success' });
//     setTimeout(() => setCopiedEmail(null), 2000);
//   };

//   const resetForm = () => {
//     reset();
//     setEditMode(false);
//     setCurrentUserId(null);
//     setShowPassword(false);
//   };

//   const handleEditUser = (user) => {
//     setValue('name', user.name);
//     setValue('gender', user.gender);
//     setValue('email_id', user.email_id);
//     setValue('password', '');
//     setValue('role', user.role);
//     setCurrentUserId(user.manager_id || user._id);
//     setEditMode(true);
//   };

//   const handleSort = (key) => {
//     setSortConfig(prev => ({
//       key,
//       direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
//     }));
//   };

//   return (
//     <div className="credentials-container">
//       {isLoading && <div className="credentials-loading-overlay"><Loader2 className="credentials-loader animate-spin" size={48} /></div>}
//       {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
//       {/* Form and List Sections remain unchanged */}
//     </div>
//   );
// };

// export default Credentials;

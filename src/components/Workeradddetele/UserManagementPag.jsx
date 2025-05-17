import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './UserManagementPage.css';

const UserManagementPage = () => {
  const [userId, setUserId] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => setUserId(e.target.value);

  const handleAction = (action) => {
    if (!userId) {
      setMessage('Please enter a User ID');
      return;
    }
    setConfirmAction(action);
  };

  const confirm = () => {
    setMessage(`${confirmAction === 'add' ? 'User added' : 'User deleted'} successfully.`);
    setConfirmAction(null);
    setUserId('');
  };

  const cancel = () => setConfirmAction(null);

  return (
    <div className="user-management">
      <h2 className="section-title">User Management</h2>
      <div className="input-group">
        <label htmlFor="userId">User ID</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={handleInputChange}
          placeholder="Enter User ID"
        />
      </div>
      <div className="button-group">
        <button className="action-btn add" onClick={() => handleAction('add')}>Add User</button>
        <button className="action-btn delete" onClick={() => handleAction('delete')}>Delete User</button>
      </div>
      {message && <p className="message-info">{message}</p>}

      <AnimatePresence>
        {confirmAction && (
          <motion.div
            className="confirmation-modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <p>Are you sure you want to {confirmAction === 'add' ? 'add' : 'delete'} this user?</p>
            <div className="modal-buttons">
              <button onClick={confirm}>Yes</button>
              <button onClick={cancel}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagementPage;

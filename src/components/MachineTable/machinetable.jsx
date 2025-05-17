import React, { useState, useEffect } from 'react';
import { MoreVertical, Search, ChevronLeft, ChevronRight, CheckCircle, Plus, Edit, Trash } from 'lucide-react';
import './LineAndCellPage.css';

// Dummy data for lines and cells (replace with API data later)
const dummyLines = [
  { id: 1, name: 'Line A', is_working: true },
  { id: 2, name: 'Line B', is_working: false },
];
const dummyCells = [
  { id: 1, line_id: 1, cell_name: 'Cell 1A', max_workers_allowed: 5, is_working: true },
  { id: 2, line_id: 1, cell_name: 'Cell 1B', max_workers_allowed: 3, is_working: false },
  { id: 3, line_id: 2, cell_name: 'Cell 2A', max_workers_allowed: 4, is_working: true },
];

// Toast Component
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="line-toast">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-cyan-400" />
        <span>{message}</span>
      </div>
    </div>
  );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="line-dialog-overlay">
      <div className="line-dialog">
        <h2 className="line-dialog-title">{title}</h2>
        <p className="line-dialog-message">{message}</p>
        <div className="line-dialog-buttons">
          <button onClick={onClose} className="line-dialog-button line-dialog-cancel" aria-label="Cancel action">
            Cancel
          </button>
          <button onClick={onConfirm} className="line-dialog-button line-dialog-confirm" aria-label="Confirm action">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const LineAndCellPage = () => {
  const [lines, setLines] = useState(dummyLines);
  const [cells, setCells] = useState(dummyCells);
  const [editingLine, setEditingLine] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [newLine, setNewLine] = useState({ name: '', is_working: false });
  const [newCell, setNewCell] = useState({ line_id: '', cell_name: '', max_workers_allowed: '', is_working: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState({ type: '', id: null, item: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showAddCellForm, setShowAddCellForm] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState('');

  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Toggle line working status
  const handleToggleLine = (id) => {
    setLines(prev => prev.map(line =>
      line.id === id ? { ...line, is_working: !line.is_working } : line
    ));
    showNotification(`Line ${lines.find(l => l.id === id).name} is now ${!lines.find(l => l.id === id).is_working ? 'on' : 'off'}`);
  };

  // Toggle cell working status
  const handleToggleCell = (id) => {
    setCells(prev => prev.map(cell =>
      cell.id === id ? { ...cell, is_working: !cell.is_working } : cell
    ));
    showNotification(`Cell ${cells.find(c => c.id === id).cell_name} is now ${!cells.find(c => c.id === id).is_working ? 'on' : 'off'}`);
  };

  // Handle edit line
  const handleEditLine = (line) => {
    setEditingLine(line.id);
    setNewLine({ ...line });
  };

  // Save edited line
  const handleSaveLine = (e) => {
    e.preventDefault();
    setLines(prev => prev.map(line => line.id === editingLine ? newLine : line));
    setEditingLine(null);
    showNotification('Line updated successfully');
  };

  // Handle edit cell
  const handleEditCell = (cell) => {
    setEditingCell(cell.id);
    setNewCell({ ...cell, max_workers_allowed: cell.max_workers_allowed.toString() });
    console.log('Editing cell:', cell);
  };

  // Save edited cell
  const handleSaveCell = (e) => {
    e.preventDefault();
    if (!newCell.cell_name || !newCell.max_workers_allowed) {
      showNotification('Please fill all fields');
      return;
    }
    setCells(prev => prev.map(cell =>
      cell.id === editingCell ? { ...cell, ...newCell, max_workers_allowed: Number(newCell.max_workers_allowed) } : cell
    ));
    setEditingCell(null);
    showNotification('Cell updated successfully');
    console.log('Saved cell:', newCell);
  };

  // Delete line
  const handleDeleteLine = (id) => {
    const line = lines.find(l => l.id === id);
    if (line) {
      setDialogAction({ type: 'deleteLine', id, item: line });
      setShowDialog(true);
      console.log('Delete requested for line:', line);
    }
  };

  // Delete cell
  const handleDeleteCell = (id) => {
    const cell = cells.find(c => c.id === id);
    if (cell) {
      setDialogAction({ type: 'deleteCell', id, item: cell });
      setShowDialog(true);
      console.log('Delete requested for cell:', cell);
    }
  };

  // Confirm delete
  const confirmAction = () => {
    if (dialogAction.type === 'deleteLine' && dialogAction.id) {
      setLines(prev => prev.filter(line => line.id !== dialogAction.id));
      showNotification(`Line ${dialogAction.item.name} deleted`);
      console.log('Line deleted:', dialogAction.item);
    } else if (dialogAction.type === 'deleteCell' && dialogAction.id) {
      setCells(prev => prev.filter(cell => cell.id !== dialogAction.id));
      showNotification(`Cell ${dialogAction.item.cell_name} deleted`);
      console.log('Cell deleted:', dialogAction.item);
    }
    setShowDialog(false);
  };

  // Add new line
  const handleAddLine = (e) => {
    e.preventDefault();
    const id = lines.length ? Math.max(...lines.map(l => l.id)) + 1 : 1;
    setLines(prev => [...prev, { id, ...newLine }]);
    setNewLine({ name: '', is_working: false });
    showNotification('New line added successfully');
  };

  // Add new cell
  const handleAddCell = (e) => {
    e.preventDefault();
    if (!newCell.line_id || !newCell.cell_name || !newCell.max_workers_allowed) {
      showNotification('Please fill all fields');
      return;
    }
    const id = cells.length ? Math.max(...cells.map(c => c.id)) + 1 : 1;
    const newCellData = {
      id,
      line_id: Number(newCell.line_id),
      cell_name: newCell.cell_name,
      max_workers_allowed: Number(newCell.max_workers_allowed),
      is_working: newCell.is_working === 'true',
    };
    setCells(prev => [...prev, newCellData]);
    setNewCell({ line_id: '', cell_name: '', max_workers_allowed: '', is_working: false });
    setShowAddCellForm(false);
    showNotification('New cell added successfully');
  };

  // Filter lines and cells
  const filteredLines = lines.filter(line =>
    line.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCells = cells.filter(cell =>
    cell.cell_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLines.length / rowsPerPage);
  const paginatedLines = filteredLines.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div className="line-container">
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      
      <div className="line-header">
        <div className="line-search">
          <Search className="line-search-icon" />
          <input
            type="text"
            placeholder="Search lines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="line-search-input"
            aria-label="Search lines"
          />
        </div>
        <button onClick={handleAddLine} className="line-add-btn" aria-label="Add new line">
          <Plus size={16} /> Add Line
        </button>
      </div>

      <div className="line-table-wrapper">
        <table className="line-table">
          <thead>
            <tr>
              <th className="line-th">ID</th>
              <th className="line-th">Line Name</th>
              <th className="line-th">Is Working</th>
              <th className="line-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLines.map(line => (
              <React.Fragment key={line.id}>
                <tr className="line-tr">
                  <td className="line-td">{line.id}</td>
                  <td className="line-td">
                    {editingLine === line.id ? (
                      <input
                        type="text"
                        value={newLine.name}
                        onChange={(e) => setNewLine({ ...newLine, name: e.target.value })}
                        onBlur={handleSaveLine}
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveLine(e)}
                        className="line-edit-input"
                        autoFocus
                      />
                    ) : line.name}
                  </td>
                  <td className="line-td">
                    <label className="line-toggle-switch">
                      <input
                        type="checkbox"
                        checked={line.is_working}
                        onChange={() => handleToggleLine(line.id)}
                        className="line-toggle-input"
                        aria-label={`Toggle working status for line ${line.name}`}
                      />
                      <span className="line-toggle-slider"></span>
                    </label>
                  </td>
                  <td className="line-td">
                    <div className="line-actions">
                      {editingLine === line.id ? (
                        <button onClick={handleSaveLine} className="line-action-btn" aria-label="Save line edit">
                          Save
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleEditLine(line)} className="line-action-btn" aria-label="Edit line">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleDeleteLine(line.id)} className="line-action-btn" aria-label="Delete line">
                            <Trash size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
                {line.is_working && (
                  <tr className="cell-row">
                    <td colSpan="4">
                      <div className="cell-section">
                        <button
                          onClick={() => {
                            setSelectedLineId(line.id);
                            setShowAddCellForm(true);
                          }}
                          className="cell-add-btn"
                          aria-label="Add new cell"
                        >
                          <Plus size={16} /> Add Cell
                        </button>
                        {showAddCellForm && selectedLineId === line.id && (
                          <form onSubmit={handleAddCell} className="cell-form">
                            <select
                              value={newCell.line_id}
                              onChange={(e) => setNewCell({ ...newCell, line_id: e.target.value })}
                              className="cell-input"
                              required
                            >
                              <option value="" disabled>Select Line</option>
                              {lines
                                .filter(l => l.is_working)
                                .map(l => (
                                  <option key={l.id} value={l.id}>
                                    {l.name}
                                  </option>
                                ))}
                            </select>
                            <input
                              type="text"
                              placeholder="Cell Name"
                              value={newCell.cell_name}
                              onChange={(e) => setNewCell({ ...newCell, cell_name: e.target.value })}
                              className="cell-input"
                              required
                            />
                            <input
                              type="number"
                              min="0"
                              placeholder="Max Workers"
                              value={newCell.max_workers_allowed}
                              onChange={(e) => setNewCell({ ...newCell, max_workers_allowed: e.target.value })}
                              className="cell-input"
                              required
                            />
                            <label>
                              <input
                                type="checkbox"
                                checked={newCell.is_working}
                                onChange={(e) => setNewCell({ ...newCell, is_working: e.target.checked })}
                                className="cell-toggle-input"
                              />
                              Is Working
                            </label>
                            <button type="submit" className="cell-submit-btn">
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddCellForm(false)}
                              className="cell-cancel-btn"
                            >
                              Cancel
                            </button>
                          </form>
                        )}
                        <table className="cell-table">
                          <thead>
                            <tr>
                              <th className="cell-th">ID</th>
                              <th className="cell-th">Cell Name</th>
                              <th className="cell-th">Max Workers Allowed</th>
                              <th className="cell-th">Is Working</th>
                              <th className="cell-th">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCells
                              .filter(cell => cell.line_id === line.id)
                              .map(cell => (
                                <tr key={cell.id} className="cell-tr">
                                  <td className="cell-td">{cell.id}</td>
                                  <td className="cell-td">
                                    {editingCell === cell.id ? (
                                      <form onSubmit={(e) => { e.preventDefault(); handleSaveCell(e); }}>
                                        <input
                                          type="text"
                                          value={newCell.cell_name || cell.cell_name}
                                          onChange={(e) => setNewCell({ ...newCell, cell_name: e.target.value })}
                                          onBlur={handleSaveCell}
                                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCell(e)}
                                          className="cell-edit-input"
                                          autoFocus
                                        />
                                      </form>
                                    ) : cell.cell_name}
                                  </td>
                                  <td className="cell-td">
                                    {editingCell === cell.id ? (
                                      <form onSubmit={(e) => { e.preventDefault(); handleSaveCell(e); }}>
                                        <input
                                          type="number"
                                          min="0"
                                          value={newCell.max_workers_allowed || cell.max_workers_allowed}
                                          onChange={(e) => setNewCell({ ...newCell, max_workers_allowed: e.target.value })}
                                          onBlur={handleSaveCell}
                                          onKeyPress={(e) => e.key === 'Enter' && handleSaveCell(e)}
                                          className="cell-edit-input"
                                          autoFocus
                                        />
                                      </form>
                                    ) : cell.max_workers_allowed}
                                  </td>
                                  <td className="cell-td">
                                    <label className="cell-toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={cell.is_working}
                                        onChange={() => handleToggleCell(cell.id)}
                                        className="cell-toggle-input"
                                        aria-label={`Toggle working status for cell ${cell.cell_name}`}
                                      />
                                      <span className="cell-toggle-slider"></span>
                                    </label>
                                  </td>
                                  <td className="cell-td">
                                    <div className="cell-actions">
                                      {editingCell === cell.id ? (
                                        <button onClick={handleSaveCell} className="cell-action-btn" aria-label="Save cell edit">
                                          Save
                                        </button>
                                      ) : (
                                        <>
                                          <button onClick={() => handleEditCell(cell)} className="cell-action-btn" aria-label="Edit cell">
                                            <Edit size={16} />
                                          </button>
                                          <button onClick={() => handleDeleteCell(cell.id)} className="cell-action-btn" aria-label="Delete cell">
                                            <Trash size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="line-pagination">
        <span className="line-pagination-info">
          {filteredLines.length === 0 ? '0-0' : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredLines.length)}`} of {filteredLines.length}
        </span>
        <div className="line-page-nav">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="line-page-button"
            aria-label="Previous page"
          >
            <ChevronLeft className="line-page-icon" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="line-page-button"
            aria-label="Next page"
          >
            <ChevronRight className="line-page-icon" />
          </button>
        </div>
      </div>

      {showDialog && (
        <ConfirmationDialog
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
          onConfirm={confirmAction}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${dialogAction.item?.name || dialogAction.item?.cell_name || 'this item'}?`}
        />
      )}
    </div>
  );
};

export default LineAndCellPage;


// //1. Get All Lines
// GET /api/lines

// Purpose: Fetch all manufacturing lines

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <JWT_TOKEN>
// Response:

// json
// Copy
// Edit
// [
//   {
//     "id": 1,
//     "name": "Line A",
//     "is_working": true
//   },
//   {
//     "id": 2,
//     "name": "Line B",
//     "is_working": false
//   }
// ]
// 📄 2. Create New Line
// POST /api/lines

// Purpose: Add a new line

// Headers:

// http
// Copy
// Edit
// Authorization: Bearer <JWT_TOKEN>
// Content-Type: application/json
// Body:

// json
// Copy
// Edit
// {
//   "name": "Line C",
//   "is_working": true
// }
// Response:

// json
// Copy
// Edit
// {
//   "id": 3,
//   "message": "Line created successfully"
// }
// ✏️ 3. Update Line
// PUT /api/lines/:id

// Purpose: Edit line details (e.g. name, is_working)

// URL Param: :id → line ID

// Body:

// json
// Copy
// Edit
// {
//   "name": "Line A",
//   "is_working": false
// }
// Response:

// json
// Copy
// Edit
// {
//   "message": "Line updated successfully"
// }
// 🗑️ 4. Delete Line
// DELETE /api/lines/:id

// Purpose: Delete a line by ID

// Response:

// json
// Copy
// Edit
// {
//   "message": "Line deleted successfully"
// }
// 📄 5. Get Cells for a Line
// GET /api/lines/:line_id/cells

// Purpose: Get all cells belonging to a specific line

// Response:

// json
// Copy
// Edit
// [
//   {
//     "id": 1,
//     "cell_name": "Cell 1A",
//     "line_id": 1,
//     "max_workers_allowed": 5,
//     "is_working": true
//   }
// ]
// ➕ 6. Create New Cell
// POST /api/cells

// Purpose: Add a new cell

// Body:

// json
// Copy
// Edit
// {
//   "line_id": 1,
//   "cell_name": "Cell 1C",
//   "max_workers_allowed": 6,
//   "is_working": true
// }
// Response:

// json
// Copy
// Edit
// {
//   "id": 4,
//   "message": "Cell added successfully"
// }
// ✏️ 7. Update Cell
// PUT /api/cells/:id

// Purpose: Update a cell’s information

// Body:

// json
// Copy
// Edit
// {
//   "cell_name": "Cell 1B",
//   "max_workers_allowed": 4,
//   "is_working": false
// }
// Response:

// json
// Copy
// Edit
// {
//   "message": "Cell updated successfully"
// }
// 🗑️ 8. Delete Cell
// DELETE /api/cells/:id

// Purpose: Delete a cell

// Response:

// json
// Copy
// Edit
// {
//   "message": "Cell deleted successfully"
// }
// 🔐 Authentication
// All endpoints require:
// Authorization: Bearer <JWT_TOKEN>
// Get it from: localStorage.getItem("token") or React context



// //// Fully integrated LineAndCellPage.jsx with API, complete UI, edit, delete, and toggles
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Search, ChevronLeft, ChevronRight, CheckCircle, Plus, Edit, Trash } from 'lucide-react';
// import './LineAndCellPage.css';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// const Toast = ({ message, onClose }) => {
//   useEffect(() => {
//     const timer = setTimeout(() => onClose(), 3000);
//     return () => clearTimeout(timer);
//   }, [onClose]);

//   return (
//     <div className="line-toast">
//       <div className="flex items-center space-x-2">
//         <CheckCircle className="w-5 h-5 text-cyan-400" />
//         <span>{message}</span>
//       </div>
//     </div>
//   );
// };

// const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
//   if (!isOpen) return null;
//   return (
//     <div className="line-dialog-overlay">
//       <div className="line-dialog">
//         <h2 className="line-dialog-title">{title}</h2>
//         <p className="line-dialog-message">{message}</p>
//         <div className="line-dialog-buttons">
//           <button onClick={onClose} className="line-dialog-button line-dialog-cancel">Cancel</button>
//           <button onClick={onConfirm} className="line-dialog-button line-dialog-confirm">Confirm</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const LineAndCellPage = () => {
//   const [lines, setLines] = useState([]);
//   const [cells, setCells] = useState([]);
//   const [editingLine, setEditingLine] = useState(null);
//   const [editingCell, setEditingCell] = useState(null);
//   const [newLine, setNewLine] = useState({ name: '', is_working: false });
//   const [newCell, setNewCell] = useState({ line_id: '', cell_name: '', max_workers_allowed: '', is_working: false });
//   const [searchQuery, setSearchQuery] = useState('');
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [rowsPerPage] = useState(5);
//   const [showDialog, setShowDialog] = useState(false);
//   const [dialogAction, setDialogAction] = useState({ type: '', id: null });

//   const token = localStorage.getItem('token');
//   const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

//   const showNotification = (msg) => {
//     setToastMessage(msg);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const fetchLines = async () => {
//     const res = await axios.get(`${API_BASE_URL}/api/lines`, authHeaders);
//     setLines(res.data);
//   };

//   const fetchCells = async () => {
//     const allCells = [];
//     for (const line of lines) {
//       const res = await axios.get(`${API_BASE_URL}/api/lines/${line.id}/cells`, authHeaders);
//       allCells.push(...res.data);
//     }
//     setCells(allCells);
//   };

//   useEffect(() => { fetchLines(); }, []);
//   useEffect(() => { if (lines.length > 0) fetchCells(); }, [lines]);

//   const addLine = async () => {
//     const res = await axios.post(`${API_BASE_URL}/api/lines`, newLine, authHeaders);
//     setLines([...lines, { id: res.data.id, ...newLine }]);
//     setNewLine({ name: '', is_working: false });
//     showNotification('Line added');
//   };

//   const updateLine = async (id) => {
//     await axios.put(`${API_BASE_URL}/api/lines/${id}`, newLine, authHeaders);
//     setLines(lines.map(line => line.id === id ? { ...line, ...newLine } : line));
//     setEditingLine(null);
//     showNotification('Line updated');
//   };

//   const deleteLine = async (id) => {
//     await axios.delete(`${API_BASE_URL}/api/lines/${id}`, authHeaders);
//     setLines(lines.filter(line => line.id !== id));
//     showNotification('Line deleted');
//   };

//   const addCell = async () => {
//     const payload = { ...newCell, line_id: +newCell.line_id, max_workers_allowed: +newCell.max_workers_allowed };
//     const res = await axios.post(`${API_BASE_URL}/api/cells`, payload, authHeaders);
//     setCells([...cells, { id: res.data.id, ...payload }]);
//     setNewCell({ line_id: '', cell_name: '', max_workers_allowed: '', is_working: false });
//     showNotification('Cell added');
//   };

//   const updateCell = async (id) => {
//     const formatted = { ...newCell, max_workers_allowed: +newCell.max_workers_allowed };
//     await axios.put(`${API_BASE_URL}/api/cells/${id}`, formatted, authHeaders);
//     setCells(cells.map(cell => cell.id === id ? { ...cell, ...formatted } : cell));
//     setEditingCell(null);
//     showNotification('Cell updated');
//   };

//   const deleteCell = async (id) => {
//     await axios.delete(`${API_BASE_URL}/api/cells/${id}`, authHeaders);
//     setCells(cells.filter(cell => cell.id !== id));
//     showNotification('Cell deleted');
//   };

//   const toggleLineStatus = async (line) => {
//     const updated = { ...line, is_working: !line.is_working };
//     await axios.put(`${API_BASE_URL}/api/lines/${line.id}`, updated, authHeaders);
//     setLines(lines.map(l => l.id === line.id ? updated : l));
//     showNotification('Line status toggled');
//   };

//   const toggleCellStatus = async (cell) => {
//     const updated = { ...cell, is_working: !cell.is_working };
//     await axios.put(`${API_BASE_URL}/api/cells/${cell.id}`, updated, authHeaders);
//     setCells(cells.map(c => c.id === cell.id ? updated : c));
//     showNotification('Cell status toggled');
//   };

//   const confirmDelete = () => {
//     if (dialogAction.type === 'line') deleteLine(dialogAction.id);
//     else deleteCell(dialogAction.id);
//     setShowDialog(false);
//   };

//   const filteredLines = lines.filter(line => line.name.toLowerCase().includes(searchQuery.toLowerCase()));
//   const paginatedLines = filteredLines.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

//   return (
//     <div className="line-container">
//       {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

//       <div className="line-header">
//         <div className="line-search">
//           <Search className="line-search-icon" />
//           <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search lines..." />
//         </div>
//         <button onClick={addLine} className="line-add-btn">
//           <Plus size={16} /> Add Line
//         </button>
//       </div>

//       <table className="line-table">
//         <thead>
//           <tr><th>ID</th><th>Name</th><th>Working</th><th>Actions</th></tr>
//         </thead>
//         <tbody>
//           {paginatedLines.map(line => (
//             <tr key={line.id}>
//               <td>{line.id}</td>
//               <td>{editingLine === line.id ? (
//                 <input value={newLine.name} onChange={e => setNewLine({ ...newLine, name: e.target.value })} onBlur={() => updateLine(line.id)} />
//               ) : line.name}</td>
//               <td>
//                 <input type="checkbox" checked={line.is_working} onChange={() => toggleLineStatus(line)} />
//               </td>
//               <td>
//                 <button onClick={() => { setEditingLine(line.id); setNewLine(line); }}><Edit size={16} /></button>
//                 <button onClick={() => { setDialogAction({ type: 'line', id: line.id }); setShowDialog(true); }}><Trash size={16} /></button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="cell-form">
//         <select value={newCell.line_id} onChange={(e) => setNewCell({ ...newCell, line_id: e.target.value })}>
//           <option value="">Select Line</option>
//           {lines.map(line => (<option key={line.id} value={line.id}>{line.name}</option>))}
//         </select>
//         <input value={newCell.cell_name} onChange={e => setNewCell({ ...newCell, cell_name: e.target.value })} placeholder="Cell Name" />
//         <input type="number" value={newCell.max_workers_allowed} onChange={e => setNewCell({ ...newCell, max_workers_allowed: e.target.value })} placeholder="Max Workers" />
//         <label>
//           <input type="checkbox" checked={newCell.is_working} onChange={e => setNewCell({ ...newCell, is_working: e.target.checked })} /> Is Working
//         </label>
//         <button onClick={addCell}>Add Cell</button>
//       </div>

//       <table className="cell-table">
//         <thead>
//           <tr><th>ID</th><th>Line</th><th>Name</th><th>Max</th><th>Working</th><th>Actions</th></tr>
//         </thead>
//         <tbody>
//           {cells.map(cell => (
//             <tr key={cell.id}>
//               <td>{cell.id}</td>
//               <td>{cell.line_id}</td>
//               <td>{editingCell === cell.id ? (
//                 <input value={newCell.cell_name} onChange={e => setNewCell({ ...newCell, cell_name: e.target.value })} onBlur={() => updateCell(cell.id)} />
//               ) : cell.cell_name}</td>
//               <td>{editingCell === cell.id ? (
//                 <input type="number" value={newCell.max_workers_allowed} onChange={e => setNewCell({ ...newCell, max_workers_allowed: e.target.value })} onBlur={() => updateCell(cell.id)} />
//               ) : cell.max_workers_allowed}</td>
//               <td><input type="checkbox" checked={cell.is_working} onChange={() => toggleCellStatus(cell)} /></td>
//               <td>
//                 <button onClick={() => { setEditingCell(cell.id); setNewCell(cell); }}><Edit size={16} /></button>
//                 <button onClick={() => { setDialogAction({ type: 'cell', id: cell.id }); setShowDialog(true); }}><Trash size={16} /></button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <div className="line-pagination">
//         <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}><ChevronLeft /></button>
//         <span>Page {currentPage}</span>
//         <button onClick={() => setCurrentPage(p => p + 1)}><ChevronRight /></button>
//       </div>

//       {showDialog && (
//         <ConfirmationDialog
//           isOpen={showDialog}
//           onClose={() => setShowDialog(false)}
//           onConfirm={confirmDelete}
//           title="Confirm Delete"
//           message={`Are you sure you want to delete this ${dialogAction.type}?`}
//         />
//       )}
//     </div>
//   );
// };

// export default LineAndCellPage;

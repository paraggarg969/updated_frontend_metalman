import React, { useState } from 'react';
import './FormulaEditPage.css'; // Import the updated CSS file

const FormulaComponent = () => {
  const [skill, setSkill] = useState('');
  const [formData, setFormData] = useState({
    totalHoursRequired: '',
    rejectedProducts: '',
    penaltyPercentage: '',
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const skills = ['Skill A', 'Skill B', 'Skill C']; // List of skills

  const handleSkillChange = (e) => {
    setSkill(e.target.value);
    // Reset form data when skill changes
    setFormData({
      totalHoursRequired: '',
      rejectedProducts: '',
      penaltyPercentage: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    // Here, you can handle saving the formula (e.g., update state, send data to server)
    alert('Formula Saved Successfully!');
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="formula-container">
      <h2>Efficiency Formula</h2>

      <div className="input-field">
        <label htmlFor="skill">Select Skill</label>
        <select
          id="skill"
          name="skill"
          value={skill}
          onChange={handleSkillChange}
        >
          <option value="">--Select a Skill--</option>
          {skills.map((skillOption, index) => (
            <option key={index} value={skillOption}>
              {skillOption}
            </option>
          ))}
        </select>
      </div>

      {skill && (
        <>
          <div className="input-field">
            <label htmlFor="totalHoursRequired">Total Hours Worked Required</label>
            <input
              type="number"
              id="totalHoursRequired"
              name="totalHoursRequired"
              value={formData.totalHoursRequired}
              onChange={handleChange}
              placeholder="Enter total hours required"
            />
          </div>

          <div className="input-field">
            <label htmlFor="rejectedProducts">No of Rejected/Reworked Products</label>
            <input
              type="number"
              id="rejectedProducts"
              name="rejectedProducts"
              value={formData.rejectedProducts}
              onChange={handleChange}
              placeholder="Enter number of rejected/reworked products"
            />
          </div>

          <div className="input-field">
            <label htmlFor="penaltyPercentage">Penalty Percentage</label>
            <input
              type="number"
              id="penaltyPercentage"
              name="penaltyPercentage"
              value={formData.penaltyPercentage}
              onChange={handleChange}
              placeholder="Enter penalty percentage"
            />
          </div>

          <div className="edit-fields">
            <button className="save-btn" onClick={handleSave}>
              Save Formula
            </button>
          </div>
        </>
      )}

      {showConfirmation && (
        <div className="confirmation-box">
          <h3>Confirm Your Action</h3>
          <p>Are you sure you want to save this formula?</p>
          <div>
            <button className="btn confirm" onClick={handleConfirm}>
              Confirm
            </button>
            <button className="btn cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulaComponent;

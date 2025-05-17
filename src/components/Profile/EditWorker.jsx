import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { CheckCircle, X, Plus, Trash2 } from 'lucide-react';
import './EditWorker.css';

// Toast Component
const Toast = ({ message, onClose, type = 'success' }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`edit-worker-toast edit-worker-toast-${type}`}>
      <div className="flex items-center space-x-2">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 text-cyan-400" />
        ) : (
          <X className="w-5 h-5 text-red-400" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};

// Success Animation Component
const SuccessAnimation = () => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#00ddeb', '#ff00ff', '#4ECDC4', '#45B7D1', '#96CEB4'];
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * 360,
      speed: Math.random() * 1.5 + 0.5,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), 2000);
    return () => {
      clearTimeout(timer);
      setParticles([]);
    };
  }, []);

  return (
    <div className="edit-worker-success-animation">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="edit-worker-particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.angle}deg)`,
            animation: `fall 2s linear forwards`,
          }}
        />
      ))}
    </div>
  );
};

// Validation Utility
const validateFormData = (data) => {
  const errors = {};

  if (!data.name?.trim()) {
    errors.name = 'Name is required.';
  } else if (!/^[A-Za-z\s]+$/.test(data.name)) {
    errors.name = 'Name can only contain letters and spaces.';
  }

  if (!data.gender) {
    errors.gender = 'Please select a gender.';
  }

  data.efficiencies?.forEach((eff, index) => {
    if (!eff.lineNumber?.trim()) {
      errors[`efficiencies[${index}].lineNumber`] = 'Line number is required.';
    }
    if (!eff.machineNumber?.trim()) {
      errors[`efficiencies[${index}].machineNumber`] = 'Machine number is required.';
    }
    if (!eff.productId?.trim()) {
      errors[`efficiencies[${index}].productId`] = 'Product ID is required.';
    }
    if (!eff.efficiency && eff.efficiency !== 0) {
      errors[`efficiencies[${index}].efficiency`] = 'Efficiency is required.';
    } else if (eff.efficiency < 0 || eff.efficiency > 100) {
      errors[`efficiencies[${index}].efficiency`] = 'Efficiency must be between 0 and 100.';
    }
  });

  data.pilotHours?.forEach((ph, index) => {
    if (!ph.lineNumber?.trim()) {
      errors[`pilotHours[${index}].lineNumber`] = 'Line number is required.';
    }
    if (!ph.machineNumber?.trim()) {
      errors[`pilotHours[${index}].machineNumber`] = 'Machine number is required.';
    }
    if (!ph.productId?.trim()) {
      errors[`pilotHours[${index}].productId`] = 'Product ID is required.';
    }
    if (!ph.pilotHour && ph.pilotHour !== 0) {
      errors[`pilotHours[${index}].pilotHour`] = 'Pilot hour is required.';
    } else if (ph.pilotHour < 0) {
      errors[`pilotHours[${index}].pilotHour`] = 'Pilot hour cannot be negative.';
    }
  });

  return errors;
};

function EditWorker({ workerId, initialData, onClose, onWorkerUpdate }) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      gender: '',
      efficiencies: [{ lineNumber: '', machineNumber: '', productId: '', efficiency: '' }],
      pilotHours: [{ lineNumber: '', machineNumber: '', productId: '', pilotHour: '' }],
    },
  });

  const { fields: efficiencyFields, append: appendEfficiency, remove: removeEfficiency } = useFieldArray({
    control,
    name: 'efficiencies',
  });

  const { fields: pilotHourFields, append: appendPilotHour, remove: removePilotHour } = useFieldArray({
    control,
    name: 'pilotHours',
  });

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name || '');
      setValue('gender', initialData.gender || '');

      // Map initial efficiencies (if they exist)
      const initialEfficiencies = [];
      if (initialData.efficiency_a) {
        initialEfficiencies.push({
          lineNumber: 'Line 1', // Placeholder, adjust based on actual data
          machineNumber: 'Machine A',
          productId: 'P001',
          efficiency: initialData.efficiency_a.toString(),
        });
      }
      if (initialData.efficiency_b) {
        initialEfficiencies.push({
          lineNumber: 'Line 2',
          machineNumber: 'Machine B',
          productId: 'P002',
          efficiency: initialData.efficiency_b.toString(),
        });
      }
      if (initialData.efficiency_c) {
        initialEfficiencies.push({
          lineNumber: 'Line 3',
          machineNumber: 'Machine C',
          productId: 'P003',
          efficiency: initialData.efficiency_c.toString(),
        });
      }
      setValue('efficiencies', initialEfficiencies.length > 0 ? initialEfficiencies : [{ lineNumber: '', machineNumber: '', productId: '', efficiency: '' }]);

      // Map initial pilot hours (if they exist)
      const initialPilotHours = [];
      if (initialData.pilot_hours_a) {
        initialPilotHours.push({
          lineNumber: 'Line 1',
          machineNumber: 'Machine A',
          productId: 'P001',
          pilotHour: initialData.pilot_hours_a.toString(),
        });
      }
      if (initialData.pilot_hours_b) {
        initialPilotHours.push({
          lineNumber: 'Line 2',
          machineNumber: 'Machine B',
          productId: 'P002',
          pilotHour: initialData.pilot_hours_b.toString(),
        });
      }
      if (initialData.pilot_hours_c) {
        initialPilotHours.push({
          lineNumber: 'Line 3',
          machineNumber: 'Machine C',
          productId: 'P003',
          pilotHour: initialData.pilot_hours_c.toString(),
        });
      }
      setValue('pilotHours', initialPilotHours.length > 0 ? initialPilotHours : [{ lineNumber: '', machineNumber: '', productId: '', pilotHour: '' }]);
    }
  }, [initialData, setValue]);

  const onSubmit = async (data) => {
    const validationErrors = validateFormData(data);
    if (Object.keys(validationErrors).length > 0) {
      Object.entries(validationErrors).forEach(([key, value]) => {
        setToast({ show: true, message: value, type: 'error' });
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const updateData = {
        worker_id: parseInt(workerId),
        name: data.name,
        gender: data.gender,
        efficiencies: data.efficiencies.map(eff => ({
          line_number: eff.lineNumber,
          machine_number: eff.machineNumber,
          product_id: eff.productId,
          efficiency: parseFloat(eff.efficiency),
        })),
        pilot_hours: data.pilotHours.map(ph => ({
          line_number: ph.lineNumber,
          machine_number: ph.machineNumber,
          product_id: ph.productId,
          pilot_hour: parseFloat(ph.pilotHour),
        })),
      };

      const response = await axios.put(
        'https://metalman-project.vercel.app/api/workers/details-edit',
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setShowSuccess(true);
        setToast({ show: true, message: 'Worker details updated successfully!', type: 'success' });
        onWorkerUpdate(updateData);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error('Error updating worker:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to update worker details. Please try again.';
      setToast({ show: true, message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-worker">
      {showSuccess && <SuccessAnimation />}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
        />
      )}

      <div className="edit-worker-container">
        <div className="edit-worker-header">
          <h2 className="edit-worker-title">Edit Worker</h2>
          <button
            onClick={onClose}
            className="edit-worker-close-button"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="edit-worker-form">
          {/* Name */}
          <div className="edit-worker-field">
            <label className="edit-worker-label">Name</label>
            <input
              {...register('name')}
              className={`edit-worker-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Name"
              aria-label="Worker name"
            />
            {errors.name && <p className="edit-worker-field-error">{errors.name.message}</p>}
          </div>

          {/* Gender */}
          <div className="edit-worker-field">
            <label className="edit-worker-label">Gender</label>
            <select
              {...register('gender')}
              className={`edit-worker-input ${errors.gender ? 'input-error' : ''}`}
              aria-label="Worker gender"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && <p className="edit-worker-field-error">{errors.gender.message}</p>}
          </div>

          {/* Efficiencies */}
          <div className="edit-worker-section">
            <h3 className="edit-worker-section-title">Efficiencies</h3>
            {efficiencyFields.map((field, index) => (
              <div key={field.id} className="edit-worker-entry">
                <div className="edit-worker-entry-row">
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Line Number</label>
                    <input
                      {...register(`efficiencies[${index}].lineNumber`)}
                      className={`edit-worker-input ${errors.efficiencies?.[index]?.lineNumber ? 'input-error' : ''}`}
                      placeholder="Line Number"
                      aria-label={`Efficiency ${index + 1} line number`}
                    />
                    {errors.efficiencies?.[index]?.lineNumber && (
                      <p className="edit-worker-field-error">{errors.efficiencies[index].lineNumber.message}</p>
                    )}
                  </div>
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Machine Number</label>
                    <input
                      {...register(`efficiencies[${index}].machineNumber`)}
                      className={`edit-worker-input ${errors.efficiencies?.[index]?.machineNumber ? 'input-error' : ''}`}
                      placeholder="Machine Number"
                      aria-label={`Efficiency ${index + 1} machine number`}
                    />
                    {errors.efficiencies?.[index]?.machineNumber && (
                      <p className="edit-worker-field-error">{errors.efficiencies[index].machineNumber.message}</p>
                    )}
                  </div>
                </div>
                <div className="edit-worker-entry-row">
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Product ID</label>
                    <input
                      {...register(`efficiencies[${index}].productId`)}
                      className={`edit-worker-input ${errors.efficiencies?.[index]?.productId ? 'input-error' : ''}`}
                      placeholder="Product ID"
                      aria-label={`Efficiency ${index + 1} product ID`}
                    />
                    {errors.efficiencies?.[index]?.productId && (
                      <p className="edit-worker-field-error">{errors.efficiencies[index].productId.message}</p>
                    )}
                  </div>
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Efficiency (%)</label>
                    <input
                      type="number"
                      {...register(`efficiencies[${index}].efficiency`)}
                      className={`edit-worker-input ${errors.efficiencies?.[index]?.efficiency ? 'input-error' : ''}`}
                      placeholder="Efficiency"
                      min="0"
                      max="100"
                      step="0.1"
                      aria-label={`Efficiency ${index + 1} value`}
                    />
                    {errors.efficiencies?.[index]?.efficiency && (
                      <p className="edit-worker-field-error">{errors.efficiencies[index].efficiency.message}</p>
                    )}
                  </div>
                </div>
                {efficiencyFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEfficiency(index)}
                    className="edit-worker-remove-button"
                    aria-label={`Remove efficiency ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendEfficiency({ lineNumber: '', machineNumber: '', productId: '', efficiency: '' })}
              className="edit-worker-add-button"
              aria-label="Add new efficiency entry"
            >
              <Plus size={16} className="mr-2" /> Add Efficiency
            </button>
          </div>

          {/* Pilot Hours */}
          <div className="edit-worker-section">
            <h3 className="edit-worker-section-title">Pilot Hours</h3>
            {pilotHourFields.map((field, index) => (
              <div key={field.id} className="edit-worker-entry">
                <div className="edit-worker-entry-row">
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Line Number</label>
                    <input
                      {...register(`pilotHours[${index}].lineNumber`)}
                      className={`edit-worker-input ${errors.pilotHours?.[index]?.lineNumber ? 'input-error' : ''}`}
                      placeholder="Line Number"
                      aria-label={`Pilot hour ${index + 1} line number`}
                    />
                    {errors.pilotHours?.[index]?.lineNumber && (
                      <p className="edit-worker-field-error">{errors.pilotHours[index].lineNumber.message}</p>
                    )}
                  </div>
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Machine Number</label>
                    <input
                      {...register(`pilotHours[${index}].machineNumber`)}
                      className={`edit-worker-input ${errors.pilotHours?.[index]?.machineNumber ? 'input-error' : ''}`}
                      placeholder="Machine Number"
                      aria-label={`Pilot hour ${index + 1} machine number`}
                    />
                    {errors.pilotHours?.[index]?.machineNumber && (
                      <p className="edit-worker-field-error">{errors.pilotHours[index].machineNumber.message}</p>
                    )}
                  </div>
                </div>
                <div className="edit-worker-entry-row">
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Product ID</label>
                    <input
                      {...register(`pilotHours[${index}].productId`)}
                      className={`edit-worker-input ${errors.pilotHours?.[index]?.productId ? 'input-error' : ''}`}
                      placeholder="Product ID"
                      aria-label={`Pilot hour ${index + 1} product ID`}
                    />
                    {errors.pilotHours?.[index]?.productId && (
                      <p className="edit-worker-field-error">{errors.pilotHours[index].productId.message}</p>
                    )}
                  </div>
                  <div className="edit-worker-field">
                    <label className="edit-worker-label">Pilot Hour</label>
                    <input
                      type="number"
                      {...register(`pilotHours[${index}].pilotHour`)}
                      className={`edit-worker-input ${errors.pilotHours?.[index]?.pilotHour ? 'input-error' : ''}`}
                      placeholder="Pilot Hour"
                      min="0"
                      step="0.1"
                      aria-label={`Pilot hour ${index + 1} value`}
                    />
                    {errors.pilotHours?.[index]?.pilotHour && (
                      <p className="edit-worker-field-error">{errors.pilotHours[index].pilotHour.message}</p>
                    )}
                  </div>
                </div>
                {pilotHourFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePilotHour(index)}
                    className="edit-worker-remove-button"
                    aria-label={`Remove pilot hour ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendPilotHour({ lineNumber: '', machineNumber: '', productId: '', pilotHour: '' })}
              className="edit-worker-add-button"
              aria-label="Add new pilot hour entry"
            >
              <Plus size={16} className="mr-2" /> Add Pilot Hour
            </button>
          </div>

          {/* Form Actions */}
          <div className="edit-worker-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="edit-worker-cancel-button"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="edit-worker-submit-button"
              disabled={loading}
              aria-label="Save changes"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditWorker;
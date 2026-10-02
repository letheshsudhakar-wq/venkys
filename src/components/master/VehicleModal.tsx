import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Vehicle, EntityStatus } from '../../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
}) => {
  const store = useStore();
  const transporters = store.getTransporters();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterId, setTransporterId] = useState(transporters[0]?.id || '');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [capacityTonnes, setCapacityTonnes] = useState<string>('6.0');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (vehicle) {
        setVehicleNumber(vehicle.vehicle_number);
        setTransporterId(vehicle.transporter_id);
        setDriverName(vehicle.driver_name);
        setDriverPhone(vehicle.driver_phone || '');
        setCapacityTonnes(vehicle.capacity_tonnes !== undefined ? String(vehicle.capacity_tonnes) : '6.0');
        setIsAvailable(vehicle.is_available);
        setStatus(vehicle.status);
      } else {
        setVehicleNumber('');
        if (transporters.length > 0) setTransporterId(transporters[0].id);
        setDriverName('');
        setDriverPhone('');
        setCapacityTonnes('6.0');
        setIsAvailable(true);
        setStatus('active');
      }
      setErrorMsg('');
    }
  }, [isOpen, vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!vehicleNumber.trim()) {
      setErrorMsg('Vehicle Number is required.');
      return;
    }

    if (!driverName.trim()) {
      setErrorMsg('Driver Name is required.');
      return;
    }

    if (!transporterId) {
      setErrorMsg('Please assign this vehicle to a valid transporter.');
      return;
    }

    try {
      if (vehicle) {
        store.updateVehicle(vehicle.id, {
          vehicle_number: vehicleNumber.trim().toUpperCase(),
          transporter_id: transporterId,
          driver_name: driverName.trim(),
          driver_phone: driverPhone.trim() || undefined,
          capacity_tonnes: parseFloat(capacityTonnes) || 6.0,
          is_available: isAvailable,
          status,
        });
      } else {
        store.createVehicle({
          vehicle_number: vehicleNumber.trim().toUpperCase(),
          transporter_id: transporterId,
          driver_name: driverName.trim(),
          driver_phone: driverPhone.trim() || undefined,
          capacity_tonnes: parseFloat(capacityTonnes) || 6.0,
          is_available: isAvailable,
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save vehicle.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={vehicle ? 'Edit Vehicle Master' : 'Add New Operational Vehicle'}
      subtitle="Fleet register: Vehicle Number is the primary operational identifier"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">
              Vehicle Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g. TN 38 XY 4567"
              className="form-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="form-label">
              Assigned Transporter <span className="text-red-500">*</span>
            </label>
            <select
              value={transporterId}
              onChange={(e) => setTransporterId(e.target.value)}
              className="form-select"
            >
              {transporters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.transporter_code} — {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">
              Assigned Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. K. Mani"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Driver Contact Phone</label>
            <input
              type="text"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="e.g. +91 98421 11111"
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="form-label">Capacity (Tonnes)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={capacityTonnes}
              onChange={(e) => setCapacityTonnes(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          <div>
            <label className="form-label">Readiness Status</label>
            <select
              value={isAvailable ? 'ready' : 'breakdown'}
              onChange={(e) => setIsAvailable(e.target.value === 'ready')}
              className="form-select"
            >
              <option value="ready">Ready / Available</option>
              <option value="breakdown">Breakdown / Maintenance</option>
            </select>
          </div>

          <div>
            <label className="form-label">Master Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatus)}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {vehicle ? 'Update Vehicle' : 'Save Vehicle'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

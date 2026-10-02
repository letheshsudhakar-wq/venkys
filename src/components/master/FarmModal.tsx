import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Farm, EntityStatus } from '../../types';

interface FarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm?: Farm | null;
}

export const FarmModal: React.FC<FarmModalProps> = ({
  isOpen,
  onClose,
  farm,
}) => {
  const store = useStore();
  const [farmCode, setFarmCode] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [districtArea, setDistrictArea] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (farm) {
        setFarmCode(farm.farm_code);
        setName(farm.name);
        setLocation(farm.location);
        setDistrictArea(farm.district_area);
        setLatitude(farm.latitude !== undefined ? String(farm.latitude) : '');
        setLongitude(farm.longitude !== undefined ? String(farm.longitude) : '');
        setContactPerson(farm.contact_person || '');
        setPhone(farm.phone || '');
        setStatus(farm.status);
      } else {
        const count = store.getFarms().length + 1;
        setFarmCode(`FRM-${String(count).padStart(3, '0')}`);
        setName('');
        setLocation('');
        setDistrictArea('');
        setLatitude('');
        setLongitude('');
        setContactPerson('');
        setPhone('');
        setStatus('active');
      }
      setErrorMsg('');
    }
  }, [isOpen, farm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!farmCode.trim() || !name.trim() || !location.trim()) {
      setErrorMsg('Farm Code, Name, and Location are required.');
      return;
    }

    const latVal = latitude.trim() ? parseFloat(latitude) : undefined;
    const lngVal = longitude.trim() ? parseFloat(longitude) : undefined;

    if (latVal !== undefined && isNaN(latVal)) {
      setErrorMsg('Latitude must be a valid numerical coordinate.');
      return;
    }
    if (lngVal !== undefined && isNaN(lngVal)) {
      setErrorMsg('Longitude must be a valid numerical coordinate.');
      return;
    }

    try {
      if (farm) {
        store.updateFarm(farm.id, {
          farm_code: farmCode.trim().toUpperCase(),
          name: name.trim(),
          location: location.trim(),
          district_area: districtArea.trim() || 'General District',
          latitude: latVal,
          longitude: lngVal,
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          status,
        });
      } else {
        store.createFarm({
          farm_code: farmCode.trim().toUpperCase(),
          name: name.trim(),
          location: location.trim(),
          district_area: districtArea.trim() || 'General District',
          latitude: latVal,
          longitude: lngVal,
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save farm.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={farm ? 'Edit Farm Master' : 'Add New Poultry Farm'}
      subtitle="Venky's Operational and Contract Hatchery Farms"
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
              Farm Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={farmCode}
              onChange={(e) => setFarmCode(e.target.value)}
              placeholder="e.g. FRM-SLM-06"
              className="form-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="form-label">
              Farm Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Salem Breeder Farm"
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">
              Location Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Omalur Highway Sector 3"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">District / Area</label>
            <input
              type="text"
              value={districtArea}
              onChange={(e) => setDistrictArea(e.target.value)}
              placeholder="e.g. Salem District"
              className="form-input"
            />
          </div>
        </div>

        {/* GPS Geographic Coordinates (Latitude & Longitude) */}
        <div className="border border-slate-200 bg-slate-50/60 rounded p-2.5 space-y-2">
          <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            GPS Geographic Coordinates (Lat / Long)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Latitude (°N/°S)</label>
              <input
                type="number"
                step="0.000001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 11.218900"
                className="form-input font-mono text-xs"
              />
            </div>
            <div>
              <label className="form-label">Longitude (°E/°W)</label>
              <input
                type="number"
                step="0.000001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 78.167400"
                className="form-input font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Farm Incharge / Contact</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. Dr. G. Senthil"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94441 55006"
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Operational Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EntityStatus)}
            className="form-select"
          >
            <option value="active">Active (Receives Dispatches)</option>
            <option value="inactive">Inactive (Deactivated)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {farm ? 'Update Farm' : 'Save Farm'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

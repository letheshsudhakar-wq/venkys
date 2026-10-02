import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Route, EntityStatus } from '../../types';

interface RouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route?: Route | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({
  isOpen,
  onClose,
  route,
}) => {
  const store = useStore();
  const farms = store.getFarms();

  const [routeCode, setRouteCode] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [destinationFarmId, setDestinationFarmId] = useState('');
  const [approxOneWayKm, setApproxOneWayKm] = useState<string>('100');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (route) {
        setRouteCode(route.route_code);
        setFromLocation(route.from_location);
        setToLocation(route.to_location);
        setDestinationFarmId(route.destination_farm_id || '');
        setApproxOneWayKm(String(route.approx_one_way_km));
        setStatus(route.status);
      } else {
        const count = store.getRoutes().length + 1;
        setRouteCode(`RT-NEW-${String(count).padStart(2, '0')}`);
        setFromLocation('Hosur Central Hatchery');
        setToLocation('');
        setDestinationFarmId(farms[0]?.id || '');
        setApproxOneWayKm('120');
        setStatus('active');
      }
      setErrorMsg('');
    }
  }, [isOpen, route]);

  const handleFarmSelect = (fId: string) => {
    setDestinationFarmId(fId);
    const f = farms.find(farm => farm.id === fId);
    if (f) {
      setToLocation(f.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const km = parseFloat(approxOneWayKm);
    if (isNaN(km) || km <= 0) {
      setErrorMsg('Please enter a valid positive approximate one-way kilometer distance.');
      return;
    }

    if (!fromLocation.trim() || !toLocation.trim()) {
      setErrorMsg('Origin and Destination locations are required.');
      return;
    }

    try {
      if (route) {
        store.updateRoute(route.id, {
          route_code: routeCode.trim().toUpperCase(),
          from_location: fromLocation.trim(),
          to_location: toLocation.trim(),
          destination_farm_id: destinationFarmId || undefined,
          approx_one_way_km: km,
          status,
        });
      } else {
        store.createRoute({
          route_code: routeCode.trim().toUpperCase(),
          from_location: fromLocation.trim(),
          to_location: toLocation.trim(),
          destination_farm_id: destinationFarmId || undefined,
          approx_one_way_km: km,
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save route.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={route ? 'Edit Route Master' : 'Add New Operational Route'}
      subtitle="Standardized delivery routes and approximate one-way benchmark distances"
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
              Route Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={routeCode}
              onChange={(e) => setRouteCode(e.target.value)}
              placeholder="e.g. RT-HSR-SLM"
              className="form-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="form-label">
              Approx. One-Way KM <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={approxOneWayKm}
                onChange={(e) => setApproxOneWayKm(e.target.value)}
                placeholder="e.g. 150"
                className="form-input font-mono font-bold pr-10"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                KM
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">
              Origin (From Location) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              placeholder="e.g. Hosur Central Hatchery"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Link Destination Farm</label>
            <select
              value={destinationFarmId}
              onChange={(e) => handleFarmSelect(e.target.value)}
              className="form-select"
            >
              <option value="">-- Direct Destination / Custom --</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district_area})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">
            Destination Location Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={toLocation}
            onChange={(e) => setToLocation(e.target.value)}
            placeholder="e.g. Salem Breeder Farm"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Operational Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EntityStatus)}
            className="form-select"
          >
            <option value="active">Active (Available in Schedule Wizard)</option>
            <option value="inactive">Inactive (Archived)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {route ? 'Update Route' : 'Save Route'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

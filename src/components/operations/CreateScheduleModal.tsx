import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { TripType } from '../../types';
import { RefreshCw, MapPin, Truck, AlertCircle, Calendar } from 'lucide-react';

interface CreateScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateScheduleModal: React.FC<CreateScheduleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const store = useStore();
  
  const routes = store.getRoutes().filter(r => r.status === 'active');
  const items = store.getItems().filter(i => i.status === 'active');
  const activeTransporters = store.getActiveTransporters();
  const nextTransporter = store.getNextEligibleTransporter();

  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || '');
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [tripType, setTripType] = useState<TripType>('round_trip');
  const [selectedTransporterId, setSelectedTransporterId] = useState(nextTransporter?.id || activeTransporters[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected route lookup
  const selectedRoute = store.getRouteById(selectedRouteId);
  const selectedFarm = selectedRoute?.destination_farm_id 
    ? store.getFarmById(selectedRoute.destination_farm_id) 
    : store.getFarms()[0];

  // Available vehicles for selected transporter
  const availableVehicles = selectedTransporterId 
    ? store.getVehiclesByTransporter(selectedTransporterId, true)
    : [];

  const selectedVehicle = store.getVehicleById(selectedVehicleId);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setScheduleDate(new Date().toISOString().split('T')[0]);
      if (routes.length > 0 && !selectedRouteId) setSelectedRouteId(routes[0].id);
      if (items.length > 0 && !selectedItemId) setSelectedItemId(items[0].id);
      
      const nextT = store.getNextEligibleTransporter();
      if (nextT) {
        setSelectedTransporterId(nextT.id);
        const vehs = store.getVehiclesByTransporter(nextT.id, true);
        setSelectedVehicleId(vehs[0]?.id || '');
      }
      setTripType('round_trip');
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen]);

  // When transporter changes, update default vehicle
  const handleTransporterChange = (tId: string) => {
    setSelectedTransporterId(tId);
    const vehs = store.getVehiclesByTransporter(tId, true);
    setSelectedVehicleId(vehs[0]?.id || '');
  };

  // When route changes, update farm
  const handleRouteChange = (rId: string) => {
    setSelectedRouteId(rId);
  };

  // Approx KM calculation
  const oneWayKm = selectedRoute?.approx_one_way_km || 0;
  const approxTotalKm = tripType === 'round_trip' ? oneWayKm * 2 : oneWayKm;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedRoute) {
      setErrorMsg('Please select a valid operational route.');
      return;
    }

    if (!selectedItemId) {
      setErrorMsg('Please select an item (Chicks, Feed, etc.).');
      return;
    }

    if (!selectedTransporterId) {
      setErrorMsg('Please select a transporter.');
      return;
    }

    if (!selectedVehicleId) {
      setErrorMsg('The selected transporter has no ready/available vehicles. Please ensure vehicle availability or record a skip.');
      return;
    }

    try {
      store.createSchedule({
        schedule_date: scheduleDate,
        item_id: selectedItemId,
        from_location: selectedRoute.from_location,
        destination_farm_id: selectedRoute.destination_farm_id || selectedFarm?.id || '',
        route_id: selectedRoute.id,
        trip_type: tripType,
        transporter_id: selectedTransporterId,
        vehicle_id: selectedVehicleId,
        notes: notes.trim(),
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create schedule.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Transport Schedule"
      subtitle="Operational Trip Dispatch & Rotation Allocation"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Top Info Strip: Rotation Preselection Indicator */}
        <div className="bg-amber-50 border border-amber-200 rounded p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <RefreshCw className="w-4 h-4 text-amber-700 animate-spin-slow" />
            <span>Rotation Engine Selected: <strong>{nextTransporter ? `${nextTransporter.transporter_code} — ${nextTransporter.name}` : 'Transporter'}</strong></span>
          </div>
          <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono font-bold px-1.5 py-0.5 rounded">
            Scheduled Turn
          </span>
        </div>

        {/* Schedule Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Date */}
          <div>
            <label className="form-label flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Schedule Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="form-input font-mono"
            />
          </div>

          {/* Item Type */}
          <div>
            <label className="form-label">Item / Consignment Type <span className="text-red-500">*</span></label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="form-select"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.unit_of_measure})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route & Destination */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50/60 space-y-3">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-venkys-700" />
            Route & Trip Configuration
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Select Route <span className="text-red-500">*</span></label>
              <select
                value={selectedRouteId}
                onChange={(e) => handleRouteChange(e.target.value)}
                className="form-select"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.from_location} → {r.to_location} ({r.approx_one_way_km} KM)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Trip Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setTripType('round_trip')}
                  className={`py-1 px-2 text-xs rounded border text-center font-medium transition ${
                    tripType === 'round_trip'
                      ? 'bg-venkys-700 text-white border-venkys-700 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Round Trip (x2 KM)
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('one_way')}
                  className={`py-1 px-2 text-xs rounded border text-center font-medium transition ${
                    tripType === 'one_way'
                      ? 'bg-venkys-700 text-white border-venkys-700 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  One Way
                </button>
              </div>
            </div>
          </div>

          {/* Route Summary Pill */}
          {selectedRoute && (
            <div className="bg-white border border-slate-200 rounded p-2.5 text-xs grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 text-[10px] block">ORIGIN:</span>
                <span className="font-semibold text-slate-800">{selectedRoute.from_location}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">DESTINATION:</span>
                <span className="font-semibold text-slate-800">{selectedRoute.to_location}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ESTIMATED APPROX KM:</span>
                <span className="font-mono font-bold text-venkys-800">{approxTotalKm} KM</span>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({oneWayKm} KM × {tripType === 'round_trip' ? 2 : 1})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Transporter & Vehicle Allocation */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50/60 space-y-3">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-venkys-700" />
            Transporter & Fleet Vehicle Assignment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">
                Assigned Transporter <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTransporterId}
                onChange={(e) => handleTransporterChange(e.target.value)}
                className="form-select"
              >
                {activeTransporters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.transporter_code} — {t.name} (Order #{t.rotation_order})
                    {t.id === nextTransporter?.id ? ' ★ (Next in Queue)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                Select Vehicle (Vehicle No. is Key) <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="form-select"
              >
                {availableVehicles.length === 0 ? (
                  <option value="">No ready vehicles under this transporter</option>
                ) : (
                  availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — Driver: {v.driver_name} ({v.capacity_tonnes}T)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Assigned Driver and Snapshot Details */}
          {selectedVehicle && (
            <div className="bg-white border border-slate-200 rounded p-2 text-xs flex items-center justify-between text-slate-700">
              <span>
                <strong>Assigned Driver:</strong> {selectedVehicle.driver_name} (Phone: {selectedVehicle.driver_phone || 'N/A'})
              </span>
              <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                Vehicle Available
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="form-label">Operational Notes / Special Hatchery Instructions</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Morning dispatch before 8:00 AM, maintain 24°C ventilation for chick transport crates"
            className="form-input"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Confirm & Dispatch Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
};

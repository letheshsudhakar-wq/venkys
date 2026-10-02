import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { ScheduleViewModel } from '../../types';
import { Gauge, Play, AlertCircle } from 'lucide-react';

interface EnterStartKmModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleViewModel | null;
  onSuccess?: () => void;
}

export const EnterStartKmModal: React.FC<EnterStartKmModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}) => {
  const store = useStore();
  const [startKm, setStartKm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  React.useEffect(() => {
    if (isOpen && schedule) {
      setStartKm(schedule.trip?.start_km !== undefined ? String(schedule.trip.start_km) : '');
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen, schedule]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const kmVal = parseFloat(startKm);
    if (isNaN(kmVal) || kmVal < 0) {
      setErrorMsg('Please enter a valid non-negative starting kilometer reading.');
      return;
    }

    if (!schedule) return;

    try {
      store.enterStartKm(schedule.id, kmVal, notes.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record Start KM.');
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Starting Kilometers (Dispatch Vehicle)"
      subtitle={`Schedule: ${schedule.schedule_number} • Vehicle: ${schedule.vehicle?.vehicle_number}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Operational Context Card */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-500">Transporter:</span>
            <span className="font-semibold text-slate-800">{schedule.final_transporter?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle Number:</span>
            <span className="font-mono font-bold text-slate-900">{schedule.vehicle?.vehicle_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned Driver:</span>
            <span className="text-slate-800">{schedule.driver_name_snapshot}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Route & Est. Distance:</span>
            <span className="font-mono font-medium text-slate-800">
              {schedule.route?.from_location} → {schedule.route?.to_location} ({schedule.approx_km} KM Approx)
            </span>
          </div>
        </div>

        {/* Starting KM input */}
        <div>
          <label className="form-label flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-venkys-700" />
              Starting Odometer Reading (KM) <span className="text-red-500">*</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Manual Odometer Inspection</span>
          </label>
          <div className="relative mt-1">
            <input
              type="number"
              step="0.1"
              min="0"
              required
              autoFocus
              value={startKm}
              onChange={(e) => setStartKm(e.target.value)}
              placeholder="e.g. 12450.0"
              className="form-input text-base font-mono font-bold text-slate-900 pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              KM
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Ensure physical odometer is verified before vehicle leaves the dispatch gate.
          </p>
        </div>

        <div>
          <label className="form-label">Gate Dispatch Remarks</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Dispatched on time with security seal verified"
            className="form-input"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <Play className="w-3.5 h-3.5 fill-current" />
            Record Start KM & Mark In-Progress
          </button>
        </div>
      </form>
    </Modal>
  );
};

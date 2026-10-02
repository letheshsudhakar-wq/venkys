import React, { useState, useMemo } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { ScheduleViewModel } from '../../types';
import { Gauge, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface EnterEndKmModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleViewModel | null;
  onSuccess?: () => void;
}

export const EnterEndKmModal: React.FC<EnterEndKmModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}) => {
  const store = useStore();
  const [endKm, setEndKm] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startKm = schedule?.trip?.start_km ?? 0;
  const approxKm = schedule?.approx_km ?? 0;

  React.useEffect(() => {
    if (isOpen && schedule) {
      setEndKm(schedule.trip?.end_km !== undefined ? String(schedule.trip.end_km) : '');
      setNotes('');
      setErrorMsg('');
    }
  }, [isOpen, schedule]);

  // Live Auto-Calculated Actual KM & Variance
  const { actualKm, variance, isValid } = useMemo(() => {
    const endVal = parseFloat(endKm);
    if (isNaN(endVal)) {
      return { actualKm: null, variance: null, isValid: false };
    }
    const diff = Number((endVal - startKm).toFixed(2));
    const varDiff = Number((diff - approxKm).toFixed(2));
    return {
      actualKm: diff,
      variance: varDiff,
      isValid: diff >= 0,
    };
  }, [endKm, startKm, approxKm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const endVal = parseFloat(endKm);
    if (isNaN(endVal)) {
      setErrorMsg('Please enter a valid ending kilometer reading.');
      return;
    }

    if (endVal < startKm) {
      setErrorMsg(`Ending KM (${endVal}) cannot be less than Starting KM (${startKm}).`);
      return;
    }

    if (!schedule) return;

    try {
      store.enterEndKm(schedule.id, endVal, notes.trim());
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete trip.');
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enter Ending Kilometers & Complete Trip"
      subtitle={`Schedule: ${schedule.schedule_number} • Vehicle: ${schedule.vehicle?.vehicle_number}`}
      maxWidth="lg"
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Transporter: </span>
              <span className="font-semibold text-slate-800">{schedule.final_transporter?.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Vehicle Number: </span>
              <span className="font-mono font-bold text-slate-900">{schedule.vehicle?.vehicle_number}</span>
            </div>
            <div>
              <span className="text-slate-500">Driver: </span>
              <span className="text-slate-800">{schedule.driver_name_snapshot}</span>
            </div>
            <div>
              <span className="text-slate-500">Trip Type: </span>
              <span className="font-semibold text-slate-800 capitalize">
                {schedule.trip_type.replace('_', ' ')} ({schedule.approx_km} KM Approx)
              </span>
            </div>
          </div>
        </div>

        {/* Odometer Inputs & Auto Calculation Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Starting KM (Read-Only) */}
          <div>
            <label className="form-label text-slate-600">Starting KM (Recorded at Gate)</label>
            <div className="relative">
              <input
                type="text"
                readOnly
                disabled
                value={`${startKm} KM`}
                className="form-input bg-slate-100 text-slate-700 font-mono font-bold text-base cursor-not-allowed"
              />
            </div>
          </div>

          {/* Ending KM (User Entry) */}
          <div>
            <label className="form-label flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-venkys-700" />
                Ending Odometer Reading (KM) <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Manual Entry</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min={startKm}
                required
                autoFocus
                value={endKm}
                onChange={(e) => setEndKm(e.target.value)}
                placeholder={`≥ ${startKm}`}
                className="form-input text-base font-mono font-bold text-slate-900 pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
                KM
              </span>
            </div>
          </div>
        </div>

        {/* AUTO-CALCULATED ACTUAL KM DISPLAY */}
        <div className="bg-slate-900 text-white rounded-md p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>System Automatic Calculation</span>
            <span className="text-[10px] font-normal text-slate-400 font-mono">Actual KM = Ending KM - Starting KM</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
              <div className="text-[10px] text-slate-400">EXPECTED APPROX</div>
              <div className="font-mono text-sm font-bold text-slate-200 mt-0.5">
                {approxKm} KM
              </div>
            </div>

            <div className="bg-venkys-900/80 p-2 rounded border border-venkys-700/60">
              <div className="text-[10px] text-red-200 font-semibold">ACTUAL TRIP KM</div>
              <div className="font-mono text-base font-extrabold text-amber-300 mt-0.5">
                {actualKm !== null && isValid ? `${actualKm} KM` : '—'}
              </div>
            </div>

            <div className="bg-slate-800/80 p-2 rounded border border-slate-700">
              <div className="text-[10px] text-slate-400">KM VARIANCE</div>
              <div className="font-mono text-sm font-bold mt-0.5 flex items-center justify-center gap-1">
                {variance !== null && isValid ? (
                  variance > 0 ? (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" /> +{variance} KM
                    </span>
                  ) : variance < 0 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" /> {variance} KM
                    </span>
                  ) : (
                    <span className="text-slate-300">0.0 KM (Exact)</span>
                  )
                ) : (
                  '—'
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="form-label">Return Completion Remarks</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Unloading completed without issues, return to yard verified"
            className="form-input"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || actualKm === null}
            className="btn-primary"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Complete Trip & Record Actual KM
          </button>
        </div>
      </form>
    </Modal>
  );
};

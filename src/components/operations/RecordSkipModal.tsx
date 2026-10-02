import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Schedule, SkipReasonType } from '../../types';
import { AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';

interface RecordSkipModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule;
  onSuccess?: () => void;
}

export const RecordSkipModal: React.FC<RecordSkipModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onSuccess,
}) => {
  const store = useStore();

  const currentTransporter = store.getTransporterById(schedule.final_transporter_id) || store.getTransporterById(schedule.original_transporter_id);
  const currentVehicle = store.getVehicleById(schedule.vehicle_id);

  // Determine the next eligible transporter after currentTransporter
  const activeTransporters = store.getActiveTransporters();
  const currentIndex = activeTransporters.findIndex(t => t.id === currentTransporter?.id);
  const nextTransporterIndex = currentIndex !== -1 ? (currentIndex + 1) % activeTransporters.length : 0;
  const suggestedNextTransporter = activeTransporters[nextTransporterIndex];

  const [reasonType, setReasonType] = useState<SkipReasonType>('vehicle_breakdown');
  const [reasonNotes, setReasonNotes] = useState('');
  const [selectedReplacementTransporterId, setSelectedReplacementTransporterId] = useState<string>(suggestedNextTransporter?.id || '');
  const [selectedReplacementVehicleId, setSelectedReplacementVehicleId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  // Update selected replacement vehicle when transporter changes
  const replacementVehicles = selectedReplacementTransporterId 
    ? store.getVehiclesByTransporter(selectedReplacementTransporterId, true) 
    : [];

  const handleTransporterChange = (transId: string) => {
    setSelectedReplacementTransporterId(transId);
    const availableVehs = store.getVehiclesByTransporter(transId, true);
    setSelectedReplacementVehicleId(availableVehs[0]?.id || '');
  };

  // Sync default replacement vehicle on open
  React.useEffect(() => {
    if (isOpen && suggestedNextTransporter) {
      setSelectedReplacementTransporterId(suggestedNextTransporter.id);
      const availableVehs = store.getVehiclesByTransporter(suggestedNextTransporter.id, true);
      setSelectedReplacementVehicleId(availableVehs[0]?.id || '');
      setReasonType('vehicle_breakdown');
      setReasonNotes('');
      setErrorMsg('');
    }
  }, [isOpen, suggestedNextTransporter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reasonNotes.trim()) {
      setErrorMsg('Please specify the detailed operational reason for skipping / breakdown.');
      return;
    }

    if (!selectedReplacementTransporterId) {
      setErrorMsg('Please select a replacement transporter.');
      return;
    }

    if (!selectedReplacementVehicleId) {
      setErrorMsg('The selected replacement transporter has no available vehicles ready. Please choose another vehicle or transporter.');
      return;
    }

    try {
      store.recordSkipAndReassign({
        schedule_id: schedule.id,
        skipped_transporter_id: currentTransporter?.id || schedule.final_transporter_id,
        skipped_vehicle_id: schedule.vehicle_id,
        reason_type: reasonType,
        reason_notes: reasonNotes.trim(),
        replacement_transporter_id: selectedReplacementTransporterId,
        replacement_vehicle_id: selectedReplacementVehicleId,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record skip.');
    }
  };

  if (!isOpen || !schedule) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Transporter Breakdown / Unavailability"
      subtitle={`Schedule: ${schedule.schedule_number}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Warning Banner */}
        <div className="bg-rose-50 border border-rose-200 rounded p-3 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-normal">
            <span className="font-bold">Enterprise Rotation Audit Rule: </span>
            This schedule was scheduled for{' '}
            <strong className="underline">{currentTransporter?.name}</strong>. Recording unavailability
            preserves the skipped record for historical reporting and immediately shifts the assignment to the next eligible transporter in sequence.
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-2.5 rounded">
            {errorMsg}
          </div>
        )}

        {/* Current Scheduled Assignment (To be skipped) */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1 text-xs">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
            Current Scheduled Transporter (To Be Skipped)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-500">Transporter: </span>
              <span className="font-semibold text-slate-900">{currentTransporter?.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Assigned Vehicle: </span>
              <span className="font-mono font-semibold text-slate-900">
                {currentVehicle?.vehicle_number || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Driver: </span>
              <span className="text-slate-800">{schedule.driver_name_snapshot}</span>
            </div>
            <div>
              <span className="text-slate-500">Approx KM: </span>
              <span className="font-mono text-slate-800">{schedule.approx_km} KM</span>
            </div>
          </div>
        </div>

        {/* Step 1: Breakdown / Unavailability Reason */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="form-label">
              Reason for Unavailability / Breakdown <span className="text-red-500">*</span>
            </label>
            <select
              value={reasonType}
              onChange={(e) => setReasonType(e.target.value as SkipReasonType)}
              className="form-select"
            >
              <option value="vehicle_breakdown">Vehicle Breakdown (Engine / Clutch / Tire failure)</option>
              <option value="driver_unavailable">Driver Unavailable / Absent</option>
              <option value="capacity_unavailable">Capacity / Crate Shortage</option>
              <option value="maintenance">Scheduled Workshop Maintenance</option>
              <option value="other">Other Operational Constraint</option>
            </select>
          </div>

          <div>
            <label className="form-label">
              Operational Breakdown Notes & Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reasonNotes}
              onChange={(e) => setReasonNotes(e.target.value)}
              placeholder="e.g., Vehicle KA 01 AB 1234 reported clutch failure during morning cold start at Hosur yard. Sent to authorized workshop."
              className="form-input"
            />
          </div>
        </div>

        {/* Step 2: Next Transporter Allocation */}
        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            <ArrowRight className="w-4 h-4 text-venkys-700" />
            Next Eligible Transporter in Rotation
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Replacement Transporter <span className="text-red-500">*</span></label>
              <select
                value={selectedReplacementTransporterId}
                onChange={(e) => handleTransporterChange(e.target.value)}
                className="form-select"
              >
                {activeTransporters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.transporter_code} — {t.name} (Order #{t.rotation_order})
                    {t.id === suggestedNextTransporter?.id ? ' (Next in Queue)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Available Vehicle & Driver <span className="text-red-500">*</span></label>
              <select
                value={selectedReplacementVehicleId}
                onChange={(e) => setSelectedReplacementVehicleId(e.target.value)}
                className="form-select"
              >
                {replacementVehicles.length === 0 ? (
                  <option value="">No available vehicles for this transporter</option>
                ) : (
                  replacementVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} — Driver: {v.driver_name} ({v.capacity_tonnes}T)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-danger">
            <AlertTriangle className="w-3.5 h-3.5" />
            Record Skip & Reassign Schedule
          </button>
        </div>
      </form>
    </Modal>
  );
};

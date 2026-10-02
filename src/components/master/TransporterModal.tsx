import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Transporter, EntityStatus } from '../../types';

interface TransporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  transporter?: Transporter | null;
}

export const TransporterModal: React.FC<TransporterModalProps> = ({
  isOpen,
  onClose,
  transporter,
}) => {
  const store = useStore();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [rotationOrder, setRotationOrder] = useState<number>(1);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (transporter) {
        setCode(transporter.transporter_code);
        setName(transporter.name);
        setContactPerson(transporter.contact_person || '');
        setPhone(transporter.phone || '');
        setEmail(transporter.email || '');
        setRotationOrder(transporter.rotation_order);
        setStatus(transporter.status);
      } else {
        const nextOrder = store.getTransporters().length + 1;
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nextCode = alphabet[(nextOrder - 1) % alphabet.length];
        setCode(nextCode);
        setName(`Transporter ${nextCode} Logistics`);
        setContactPerson('');
        setPhone('');
        setEmail('');
        setRotationOrder(nextOrder);
        setStatus('active');
      }
      setErrorMsg('');
    }
  }, [isOpen, transporter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!code.trim() || !name.trim()) {
      setErrorMsg('Transporter Code and Name are required.');
      return;
    }

    try {
      if (transporter) {
        store.updateTransporter(transporter.id, {
          transporter_code: code.trim().toUpperCase(),
          name: name.trim(),
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          rotation_order: Number(rotationOrder),
          status,
        });
      } else {
        store.createTransporter({
          transporter_code: code.trim().toUpperCase(),
          name: name.trim(),
          contact_person: contactPerson.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          rotation_order: Number(rotationOrder),
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save transporter.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transporter ? 'Edit Transporter Master' : 'Add New Transporter'}
      subtitle="Rotation-participating transport contractor registry"
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
              Transporter Identifier / Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. E"
              className="form-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="form-label">
              Rotation Sequence Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={rotationOrder}
              onChange={(e) => setRotationOrder(Number(e.target.value))}
              className="form-input font-mono"
            />
          </div>
        </div>

        <div>
          <label className="form-label">
            Transporter Full Commercial Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E - EverGreen Poultry Roadways"
            className="form-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Primary Contact Person</label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="e.g. R. Subramanian"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 94435 55005"
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. subramanian@evergreenlog.in"
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
              <option value="active">Active (Participates in Rotation)</option>
              <option value="inactive">Inactive (Deactivated)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {transporter ? 'Update Transporter' : 'Save Transporter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { Modal } from '../ui/Modal';
import type { Item, EntityStatus } from '../../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: Item | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const store = useStore();
  const [itemCode, setItemCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('Boxes');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setItemCode(item.item_code);
        setName(item.name);
        setDescription(item.description || '');
        setUnitOfMeasure(item.unit_of_measure);
        setStatus(item.status);
      } else {
        const count = store.getItems().length + 1;
        setItemCode(`ITM-${String(count).padStart(3, '0')}`);
        setName('');
        setDescription('');
        setUnitOfMeasure('Boxes');
        setStatus('active');
      }
      setErrorMsg('');
    }
  }, [isOpen, item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!itemCode.trim() || !name.trim()) {
      setErrorMsg('Item Code and Name are required.');
      return;
    }

    try {
      if (item) {
        store.updateItem(item.id, {
          item_code: itemCode.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          unit_of_measure: unitOfMeasure.trim() || 'Units',
          status,
        });
      } else {
        store.createItem({
          item_code: itemCode.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          unit_of_measure: unitOfMeasure.trim() || 'Units',
          status,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save item.');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Edit Item Master' : 'Add New Item / Consignment'}
      subtitle="Poultry products, feed batches, and logistical goods"
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
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              placeholder="e.g. ITM-EGG"
              className="form-input font-mono font-bold uppercase"
            />
          </div>

          <div>
            <label className="form-label">
              Unit of Measure <span className="text-red-500">*</span>
            </label>
            <select
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
              className="form-select"
            >
              <option value="Boxes">Boxes (Day-Old Chicks)</option>
              <option value="Bags">Bags (50kg Feed)</option>
              <option value="Crates">Crates (Eggs / Supplies)</option>
              <option value="Tonnes">Tonnes (Bulk Mash Feed)</option>
              <option value="Units">General Units</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">
            Item Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Broiler Hatching Eggs"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Description / Logistics Specification</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Climate regulated transport required at standard ambient range"
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
            <option value="active">Active (Enabled in Dispatches)</option>
            <option value="inactive">Inactive (Disabled)</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {item ? 'Update Item' : 'Save Item'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ItemModal } from '../../components/master/ItemModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Item } from '../../types';
import { Plus, Edit3, Power } from 'lucide-react';

export const ItemsPage: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const items = store.getItems();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Item | null>(null);

  const handleEdit = (i: Item) => {
    setSelectedItem(i);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (statusTarget) {
      store.toggleItemStatus(statusTarget.id);
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Item & Consignment Master"
        subtitle="Catalog of transportable poultry inventory: Chicks, Feed, Vaccines, and logistical goods"
        badgeText={`${items.length} Items`}
        action={
          isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Item
            </button>
          )
        }
      />

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Item Code</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Logistics Description</th>
                <th className="py-2.5 px-3">Unit of Measure</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="enterprise-table-row">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {i.item_code}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {i.name}
                  </td>

                  <td className="py-2.5 px-3 text-slate-600 max-w-sm">
                    {i.description || '—'}
                  </td>

                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {i.unit_of_measure}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={i.status} />
                  </td>

                  {isAdmin && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(i)}
                          className="btn-secondary text-[11px] py-1 px-2"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusTarget(i)}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
                            i.status === 'active'
                              ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3 inline mr-0.5" />
                          {i.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />

      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggle}
        title={statusTarget?.status === 'active' ? 'Deactivate Item' : 'Activate Item'}
        message={`Are you sure you want to ${
          statusTarget?.status === 'active' ? 'deactivate' : 'activate'
        } item ${statusTarget?.name}?`}
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={statusTarget?.status === 'active'}
      />
    </div>
  );
};

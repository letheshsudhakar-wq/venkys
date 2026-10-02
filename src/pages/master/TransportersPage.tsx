import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { TransporterModal } from '../../components/master/TransporterModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Transporter } from '../../types';
import { 
  Plus, 
  Edit3, 
  Power, 
  RefreshCw,
  Phone
} from 'lucide-react';

export const TransportersPage: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const transporters = store.getTransporters();
  const [selectedTransporter, setSelectedTransporter] = useState<Transporter | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<Transporter | null>(null);

  const handleEdit = (t: Transporter) => {
    setSelectedTransporter(t);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedTransporter(null);
    setIsModalOpen(true);
  };

  const handleConfirmToggleStatus = () => {
    if (deactivateTarget) {
      store.toggleTransporterStatus(deactivateTarget.id);
      setDeactivateTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transporter Master Directory"
        subtitle="Manage logistics contractors, dynamic database-driven rotation sequence, and operational status"
        badgeText={`${transporters.length} Registered`}
        action={
          isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Transporter
            </button>
          )
        }
      />

      {/* Rotation Info Banner */}
      <div className="bg-white border border-slate-200 rounded-md p-3 text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-venkys-700" />
          <span className="text-slate-700">
            Transporters are ordered strictly by <strong>Rotation Sequence Order</strong>. Active transporters take turns automatically during dispatch.
          </span>
        </div>
        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
          Database Driven
        </span>
      </div>

      {/* Transporters Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Rotation Order</th>
                <th className="py-2.5 px-3">Transporter Code</th>
                <th className="py-2.5 px-3">Commercial Name</th>
                <th className="py-2.5 px-3">Contact Person & Phone</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3 text-center">Vehicles Registered</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {transporters.map((t) => {
                const vehicles = store.getVehiclesByTransporter(t.id);
                const availableVehicles = vehicles.filter(v => v.status === 'active' && v.is_available);

                return (
                  <tr key={t.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                        #{t.rotation_order}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="w-6 h-6 rounded bg-slate-900 text-white font-mono font-bold text-xs inline-flex items-center justify-center">
                        {t.transporter_code}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {t.name}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700">
                      <div className="font-medium">{t.contact_person || '—'}</div>
                      {t.phone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {t.phone}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {t.email || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-semibold text-slate-800">
                        {vehicles.length} total
                      </span>
                      <span className="text-[10px] text-emerald-700 block font-medium">
                        ({availableVehicles.length} ready)
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={t.status} />
                    </td>

                    {isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(t)}
                            className="btn-secondary text-[11px] py-1 px-2"
                            title="Edit Transporter"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeactivateTarget(t)}
                            className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
                              t.status === 'active'
                                ? 'text-amber-700 hover:bg-amber-50 border-amber-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={t.status === 'active' ? 'Deactivate Transporter' : 'Activate Transporter'}
                          >
                            <Power className="w-3 h-3 inline mr-0.5" />
                            {t.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <TransporterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transporter={selectedTransporter}
      />

      {/* Confirmation Dialog for Deactivation */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleConfirmToggleStatus}
        title={deactivateTarget?.status === 'active' ? 'Deactivate Transporter' : 'Activate Transporter'}
        message={`Are you sure you want to ${
          deactivateTarget?.status === 'active' ? 'deactivate' : 'activate'
        } ${deactivateTarget?.name}? Deactivating will temporarily exclude them from new rotation schedules without altering historical records.`}
        confirmLabel={deactivateTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={deactivateTarget?.status === 'active'}
      />
    </div>
  );
};

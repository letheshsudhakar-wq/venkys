import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { FarmModal } from '../../components/master/FarmModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Farm } from '../../types';
import { Plus, Edit3, Power, Phone } from 'lucide-react';

export const FarmsPage: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const farms = store.getFarms();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Farm | null>(null);

  const handleEdit = (f: Farm) => {
    setSelectedFarm(f);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFarm(null);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (statusTarget) {
      store.toggleFarmStatus(statusTarget.id);
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Farm Master Directory"
        subtitle="Operational poultry farms, contract rearing units, and hatchery destination nodes"
        badgeText={`${farms.length} Farms`}
        action={
          isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Farm
            </button>
          )
        }
      />

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Farm Code</th>
                <th className="py-2.5 px-3">Farm Name</th>
                <th className="py-2.5 px-3">Location Address</th>
                <th className="py-2.5 px-3">District / Area</th>
                <th className="py-2.5 px-3">Coordinates (Lat, Long)</th>
                <th className="py-2.5 px-3">Incharge Contact</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {farms.map((f) => (
                <tr key={f.id} className="enterprise-table-row">
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                      {f.farm_code}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {f.name}
                  </td>

                  <td className="py-2.5 px-3 text-slate-700">
                    {f.location}
                  </td>

                  <td className="py-2.5 px-3 text-slate-700 font-medium">
                    {f.district_area}
                  </td>

                  <td className="py-2.5 px-3 font-mono text-xs">
                    {f.latitude !== undefined && f.longitude !== undefined ? (
                      <div className="flex items-center gap-1.5">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
                          {f.latitude.toFixed(4)}° N, {f.longitude.toFixed(4)}° E
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Not configured</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-medium">{f.contact_person || '—'}</div>
                    {f.phone && (
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {f.phone}
                      </div>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <StatusBadge status={f.status} />
                  </td>

                  {isAdmin && (
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(f)}
                          className="btn-secondary text-[11px] py-1 px-2"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatusTarget(f)}
                          className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
                            f.status === 'active'
                              ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                          }`}
                        >
                          <Power className="w-3 h-3 inline mr-0.5" />
                          {f.status === 'active' ? 'Deactivate' : 'Activate'}
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

      <FarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        farm={selectedFarm}
      />

      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggle}
        title={statusTarget?.status === 'active' ? 'Deactivate Farm' : 'Activate Farm'}
        message={`Are you sure you want to ${
          statusTarget?.status === 'active' ? 'deactivate' : 'activate'
        } ${statusTarget?.name}? Historical schedules will remain intact.`}
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={statusTarget?.status === 'active'}
      />
    </div>
  );
};

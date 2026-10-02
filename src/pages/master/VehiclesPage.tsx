import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { VehicleModal } from '../../components/master/VehicleModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Vehicle } from '../../types';
import { 
  Plus, 
  Edit3, 
  Power, 
  CheckCircle2, 
  Wrench, 
  Search
} from 'lucide-react';

export const VehiclesPage: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const vehicles = store.getVehicles();
  const transporters = store.getTransporters();

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransporterFilter, setSelectedTransporterFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTarget, setStatusTarget] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter(v => {
    if (selectedTransporterFilter && v.transporter_id !== selectedTransporterFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = v.vehicle_number.toLowerCase().includes(q);
      const matchDriver = v.driver_name.toLowerCase().includes(q);
      if (!matchNum && !matchDriver) return false;
    }
    return true;
  });

  const handleEdit = (v: Vehicle) => {
    setSelectedVehicle(v);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleToggleAvailability = (v: Vehicle) => {
    store.toggleVehicleAvailability(v.id);
  };

  const handleConfirmToggleStatus = () => {
    if (statusTarget) {
      store.toggleVehicleStatus(statusTarget.id);
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vehicle Master Register"
        subtitle="Fleet inventory: Vehicle Number is the primary operational identifier linked to drivers & transporters"
        badgeText={`${vehicles.length} Vehicles`}
        action={
          isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Vehicle
            </button>
          )
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={selectedTransporterFilter}
            onChange={(e) => setSelectedTransporterFilter(e.target.value)}
            className="form-select w-full sm:w-64"
          >
            <option value="">All Transporters</option>
            {transporters.map((t) => (
              <option key={t.id} value={t.id}>
                {t.transporter_code} — {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vehicle number or driver..."
            className="form-input pl-8 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Vehicle Number</th>
                <th className="py-2.5 px-3">Transporter</th>
                <th className="py-2.5 px-3">Assigned Driver</th>
                <th className="py-2.5 px-3">Driver Phone</th>
                <th className="py-2.5 px-3 text-right">Capacity (Tonnes)</th>
                <th className="py-2.5 px-3 text-center">Readiness Status</th>
                <th className="py-2.5 px-3 text-center">Master Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v) => {
                const transporter = store.getTransporterById(v.transporter_id);

                return (
                  <tr key={v.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded border border-slate-300 text-xs">
                        {v.vehicle_number}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{transporter?.name || '—'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Code: {transporter?.transporter_code}</div>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {v.driver_name}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {v.driver_phone || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {v.capacity_tonnes !== undefined ? `${v.capacity_tonnes} T` : '—'}
                    </td>

                    {/* Operational Readiness Toggle */}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(v)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium border transition inline-flex items-center gap-1 ${
                          v.is_available
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Click to toggle readiness (Available / Breakdown)"
                      >
                        {v.is_available ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Ready
                          </>
                        ) : (
                          <>
                            <Wrench className="w-3 h-3 text-rose-600" />
                            Breakdown
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={v.status} />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleEdit(v)}
                            className="btn-secondary text-[11px] py-1 px-2"
                            title="Edit Vehicle"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setStatusTarget(v)}
                            className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
                              v.status === 'active'
                                ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={v.status === 'active' ? 'Deactivate Vehicle' : 'Activate Vehicle'}
                          >
                            <Power className="w-3 h-3 inline mr-0.5" />
                            {v.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehicle={selectedVehicle}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggleStatus}
        title={statusTarget?.status === 'active' ? 'Deactivate Vehicle' : 'Activate Vehicle'}
        message={`Are you sure you want to ${
          statusTarget?.status === 'active' ? 'deactivate' : 'activate'
        } vehicle ${statusTarget?.vehicle_number}? Historical schedules using this vehicle will remain preserved.`}
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={statusTarget?.status === 'active'}
      />
    </div>
  );
};

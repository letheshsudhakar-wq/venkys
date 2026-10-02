import React, { useState } from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RouteModal } from '../../components/master/RouteModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Route } from '../../types';
import { Plus, Edit3, Power, MapPin } from 'lucide-react';

export const RoutesPage: React.FC = () => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser.role === 'admin';

  const routes = store.getRoutes();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Route | null>(null);

  const handleEdit = (r: Route) => {
    setSelectedRoute(r);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedRoute(null);
    setIsModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (statusTarget) {
      store.toggleRouteStatus(statusTarget.id);
      setStatusTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Route & Benchmark Distance Master"
        subtitle="Operational delivery corridors and approximate one-way benchmark kilometer calibration"
        badgeText={`${routes.length} Routes`}
        action={
          isAdmin && (
            <button
              type="button"
              onClick={handleAdd}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Add Route
            </button>
          )
        }
      />

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Route Code</th>
                <th className="py-2.5 px-3">Origin (From)</th>
                <th className="py-2.5 px-3">Destination (To)</th>
                <th className="py-2.5 px-3">Linked Farm</th>
                <th className="py-2.5 px-3 text-right">Approx. One-Way KM</th>
                <th className="py-2.5 px-3 text-right">Round-Trip Est. KM</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                {isAdmin && <th className="py-2.5 px-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => {
                const farm = r.destination_farm_id ? store.getFarmById(r.destination_farm_id) : null;

                return (
                  <tr key={r.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {r.route_code}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {r.from_location}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {r.to_location}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      {farm ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {farm.name}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {r.approx_one_way_km} KM
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-venkys-800">
                      {r.approx_one_way_km * 2} KM
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={r.status} />
                    </td>

                    {isAdmin && (
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(r)}
                            className="btn-secondary text-[11px] py-1 px-2"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusTarget(r)}
                            className={`px-2 py-1 text-[11px] font-medium rounded border transition ${
                              r.status === 'active'
                                ? 'text-slate-600 hover:bg-slate-100 border-slate-200'
                                : 'text-emerald-700 hover:bg-emerald-50 border-emerald-200'
                            }`}
                          >
                            <Power className="w-3 h-3 inline mr-0.5" />
                            {r.status === 'active' ? 'Deactivate' : 'Activate'}
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

      <RouteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        route={selectedRoute}
      />

      <ConfirmDialog
        isOpen={Boolean(statusTarget)}
        onClose={() => setStatusTarget(null)}
        onConfirm={handleConfirmToggle}
        title={statusTarget?.status === 'active' ? 'Deactivate Route' : 'Activate Route'}
        message={`Are you sure you want to ${
          statusTarget?.status === 'active' ? 'deactivate' : 'activate'
        } route ${statusTarget?.route_code}?`}
        confirmLabel={statusTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        isDestructive={statusTarget?.status === 'active'}
      />
    </div>
  );
};

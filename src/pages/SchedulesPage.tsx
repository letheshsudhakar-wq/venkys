import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import type { ScheduleViewModel } from '../types';
import { 
  CalendarRange, 
  Plus, 
  Search, 
  Play, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

interface SchedulesPageProps {
  onOpenCreateSchedule: () => void;
  onOpenStartKm: (schedule: ScheduleViewModel) => void;
  onOpenEndKm: (schedule: ScheduleViewModel) => void;
  onOpenSkipModal: (schedule: ScheduleViewModel) => void;
}

export const SchedulesPage: React.FC<SchedulesPageProps> = ({
  onOpenCreateSchedule,
  onOpenStartKm,
  onOpenEndKm,
  onOpenSkipModal,
}) => {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransporterFilter, setSelectedTransporterFilter] = useState('');

  const transporters = store.getTransporters();
  const allSchedules = store.getEnrichedSchedules();

  const filteredSchedules = useMemo(() => {
    return allSchedules.filter(sch => {
      // Tab status filter
      if (activeTab === 'scheduled' && sch.status !== 'scheduled') return false;
      if (activeTab === 'in_progress' && sch.status !== 'in_progress') return false;
      if (activeTab === 'completed' && sch.status !== 'completed') return false;
      if (activeTab === 'skipped' && !sch.was_skipped) return false;

      // Transporter filter
      if (selectedTransporterFilter && sch.final_transporter_id !== selectedTransporterFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = sch.schedule_number.toLowerCase().includes(q);
        const matchVeh = sch.vehicle?.vehicle_number.toLowerCase().includes(q);
        const matchDriver = sch.driver_name_snapshot.toLowerCase().includes(q);
        const matchTrans = sch.final_transporter?.name.toLowerCase().includes(q);
        const matchRoute = `${sch.route?.from_location} ${sch.route?.to_location}`.toLowerCase().includes(q);
        if (!matchNum && !matchVeh && !matchDriver && !matchTrans && !matchRoute) {
          return false;
        }
      }

      return true;
    });
  }, [allSchedules, activeTab, selectedTransporterFilter, searchQuery]);

  const counts = {
    all: allSchedules.length,
    scheduled: allSchedules.filter(s => s.status === 'scheduled').length,
    in_progress: allSchedules.filter(s => s.status === 'in_progress').length,
    completed: allSchedules.filter(s => s.status === 'completed').length,
    skipped: allSchedules.filter(s => s.was_skipped).length,
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Transport Schedules Roster"
        subtitle="Manage daily trip allocations, transporter rotations, and dispatch statuses"
        badgeText={`${allSchedules.length} Total`}
        action={
          <button
            type="button"
            onClick={onOpenCreateSchedule}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            Create Schedule
          </button>
        }
      />

      {/* Filter and Tab Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs space-y-3">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-100 pb-2.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Schedules ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scheduled')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'scheduled'
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pending Dispatch ({counts.scheduled})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('in_progress')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'in_progress'
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            In-Progress ({counts.in_progress})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'completed'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Completed ({counts.completed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skipped')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              activeTab === 'skipped'
                ? 'bg-rose-700 text-white font-bold'
                : 'bg-rose-50 text-rose-900 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Breakdowns / Skipped ({counts.skipped})
          </button>
        </div>

        {/* Search & Select Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by schedule ID, vehicle number, driver name, route..."
              className="form-input pl-8"
            />
          </div>

          <div>
            <select
              value={selectedTransporterFilter}
              onChange={(e) => setSelectedTransporterFilter(e.target.value)}
              className="form-select"
            >
              <option value="">All Transporters</option>
              {transporters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.transporter_code} — {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Schedules Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <EmptyState
            icon={CalendarRange}
            title="No schedules match the criteria"
            description="Adjust search filters or create a new schedule to allocate vehicles."
            action={
              <button
                type="button"
                onClick={onOpenCreateSchedule}
                className="btn-primary"
              >
                <Plus className="w-3.5 h-3.5" />
                Create New Schedule
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="enterprise-table-header">
                <tr>
                  <th className="py-2.5 px-3">Schedule No.</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Transporter</th>
                  <th className="py-2.5 px-3">Vehicle / Driver</th>
                  <th className="py-2.5 px-3">Route / Farm</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Trip Type</th>
                  <th className="py-2.5 px-3 text-right">Approx KM</th>
                  <th className="py-2.5 px-3 text-right font-bold text-slate-900">Actual KM</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((sch) => {
                  const trip = sch.trip;
                  const actualKm = trip?.actual_km;

                  return (
                    <tr key={sch.id} className="enterprise-table-row">
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-bold text-slate-900">
                          {sch.schedule_number}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {sch.schedule_date}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">
                          {sch.final_transporter?.name}
                        </div>
                        {sch.was_skipped && (
                          <div className="text-[10px] text-rose-700 bg-rose-50 px-1 py-0.2 rounded border border-rose-200 mt-0.5 inline-block" title={sch.skip_reason}>
                            Skipped from: <strong>{sch.original_transporter?.transporter_code}</strong>
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">
                          {sch.vehicle?.vehicle_number}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sch.driver_name_snapshot}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-medium text-slate-800">
                          {sch.route?.from_location} → {sch.route?.to_location}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Farm: {sch.farm?.name}
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="text-slate-800 font-medium">
                          {sch.item?.name}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <StatusBadge status={sch.trip_type} />
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {sch.approx_km} KM
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold text-venkys-800">
                        {actualKm !== undefined && actualKm > 0 ? `${actualKm} KM` : '—'}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <StatusBadge status={sch.status} />
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sch.status === 'scheduled' && (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenSkipModal(sch)}
                                className="px-2 py-1 text-[11px] text-rose-700 hover:bg-rose-50 border border-rose-200 rounded font-medium transition"
                                title="Record Breakdown / Skip to Next Transporter"
                              >
                                <AlertTriangle className="w-3 h-3 inline mr-1 text-rose-600" />
                                Skip
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenStartKm(sch)}
                                className="btn-primary text-[11px] py-1 px-2.5"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Start
                              </button>
                            </>
                          )}

                          {sch.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => onOpenEndKm(sch)}
                              className="btn-primary text-[11px] py-1 px-2.5 bg-blue-700 hover:bg-blue-800"
                            >
                              <Gauge className="w-3 h-3" />
                              End KM
                            </button>
                          )}

                          {sch.status === 'completed' && (
                            <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Done
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

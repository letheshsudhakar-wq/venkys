import React from 'react';
import { useStore } from '../hooks/useStore';
import { RotationWidget } from '../components/operations/RotationWidget';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { ScheduleViewModel } from '../types';
import { 
  Gauge, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Play, 
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';

interface DashboardPageProps {
  onOpenCreateSchedule: () => void;
  onOpenStartKm: (schedule: ScheduleViewModel) => void;
  onOpenEndKm: (schedule: ScheduleViewModel) => void;
  onOpenSkipModal: (schedule: ScheduleViewModel) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateSchedule,
  onOpenStartKm,
  onOpenEndKm,
  onOpenSkipModal,
  onNavigateToTab,
}) => {
  const store = useStore();
  const metrics = store.getOperationalMetrics();
  const enrichedSchedules = store.getEnrichedSchedules();

  const inProgressSchedules = enrichedSchedules.filter(s => s.status === 'in_progress');
  const scheduledQueue = enrichedSchedules.filter(s => s.status === 'scheduled');
  const completedRecent = enrichedSchedules.filter(s => s.status === 'completed').slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-md p-4 shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Operational Command Center — Today's Dispatch Overview
            </h1>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-200">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time poultry & feed transport rotation, active trip lifecycle, and odometer validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateToTab('reports')}
            className="btn-secondary"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
            Audit Reports
          </button>
          <button
            type="button"
            onClick={onOpenCreateSchedule}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            New Schedule
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards (Clean, restrained, enterprise) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Schedules */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Schedules
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            {metrics.totalSchedules}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dispatched & Active</div>
        </div>

        {/* In-Progress Trips */}
        <div className="bg-white border border-blue-200 rounded p-3 shadow-xs bg-blue-50/20">
          <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider flex items-center justify-between">
            <span>In-Progress</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-900 mt-1">
            {metrics.inProgressTrips}
          </div>
          <div className="text-[10px] text-blue-600 mt-0.5">On the Road / En Route</div>
        </div>

        {/* Scheduled Pending */}
        <div className="bg-white border border-amber-200 rounded p-3 shadow-xs bg-amber-50/20">
          <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
            Pending Dispatch
          </div>
          <div className="text-xl font-bold font-mono text-amber-900 mt-1">
            {metrics.scheduledPending}
          </div>
          <div className="text-[10px] text-amber-700 mt-0.5">Awaiting Start KM</div>
        </div>

        {/* Completed Trips */}
        <div className="bg-white border border-emerald-200 rounded p-3 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider">
            Completed Trips
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
            {metrics.completedTrips}
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Actual KM Verified</div>
        </div>

        {/* Skipped / Breakdown */}
        <div className="bg-white border border-rose-200 rounded p-3 shadow-xs bg-rose-50/20">
          <div className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider">
            Skipped / Audits
          </div>
          <div className="text-xl font-bold font-mono text-rose-900 mt-1">
            {metrics.totalSkips}
          </div>
          <div className="text-[10px] text-rose-700 mt-0.5">Breakdowns Logged</div>
        </div>

        {/* Total Actual KM */}
        <div className="bg-white border border-slate-200 rounded p-3 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Actual KM
          </div>
          <div className="text-xl font-bold font-mono text-venkys-800 mt-1">
            {metrics.totalActualKm.toLocaleString()} <span className="text-xs text-slate-500">KM</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
            Variance: 
            {metrics.kmVariance > 0 ? (
              <span className="text-amber-700 font-mono font-semibold">+{metrics.kmVariance} KM</span>
            ) : metrics.kmVariance < 0 ? (
              <span className="text-emerald-700 font-mono font-semibold">{metrics.kmVariance} KM</span>
            ) : (
              <span className="text-slate-600 font-mono">0.0 KM</span>
            )}
          </div>
        </div>
      </div>

      {/* CORE ROTATION TRACKER WIDGET */}
      <RotationWidget />

      {/* TWO-COLUMN OPERATIONAL QUEUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Active In-Progress Trips (Require End KM when returned) */}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                In-Progress Active Trips ({inProgressSchedules.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Require Ending KM upon return</span>
          </div>

          <div className="p-3 flex-1 overflow-x-auto">
            {inProgressSchedules.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active trips currently in-progress.
              </div>
            ) : (
              <div className="space-y-2.5">
                {inProgressSchedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="border border-blue-200 bg-blue-50/30 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {sch.schedule_number}
                        </span>
                        <StatusBadge status={sch.status} />
                        <span className="text-[10px] bg-slate-200 text-slate-800 font-mono font-semibold px-1.5 py-0.2 rounded">
                          {sch.item?.name}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 mt-1 font-medium">
                        {sch.route?.from_location} → {sch.route?.to_location}
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>
                          Transporter: <strong className="text-slate-800">{sch.final_transporter?.name}</strong>
                        </span>
                        <span>
                          Vehicle: <strong className="font-mono text-slate-900">{sch.vehicle?.vehicle_number}</strong>
                        </span>
                        <span>
                          Start KM: <strong className="font-mono text-blue-800">{sch.trip?.start_km} KM</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenEndKm(sch)}
                      className="btn-primary self-start sm:self-center flex-shrink-0 whitespace-nowrap bg-blue-700 hover:bg-blue-800 text-xs"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                      Enter End KM
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Dispatches (Require Start KM) */}
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Pending Dispatch Queue ({scheduledQueue.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">Awaiting Gate Start KM</span>
          </div>

          <div className="p-3 flex-1 overflow-x-auto">
            {scheduledQueue.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                All scheduled dispatches have been started.
              </div>
            ) : (
              <div className="space-y-2.5">
                {scheduledQueue.map((sch) => (
                  <div
                    key={sch.id}
                    className="border border-amber-200 bg-amber-50/30 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {sch.schedule_number}
                        </span>
                        <StatusBadge status={sch.trip_type} />
                        <span className="text-[10px] bg-slate-200 text-slate-800 font-mono font-semibold px-1.5 py-0.2 rounded">
                          {sch.item?.name}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 mt-1 font-medium">
                        {sch.route?.from_location} → {sch.route?.to_location} ({sch.approx_km} KM Est.)
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>
                          Transporter: <strong className="text-slate-800">{sch.final_transporter?.name}</strong>
                        </span>
                        <span>
                          Vehicle: <strong className="font-mono text-slate-900">{sch.vehicle?.vehicle_number}</strong>
                        </span>
                        <span>Driver: {sch.driver_name_snapshot}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenSkipModal(sch)}
                        className="btn-secondary text-[11px] text-rose-700 hover:text-rose-900 border-rose-200 hover:bg-rose-50"
                        title="Record transporter unavailability / breakdown"
                      >
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Skip / Breakdown
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenStartKm(sch)}
                        className="btn-primary text-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Start Trip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RECENT COMPLETED TRIPS TABLE */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Completed Trips & Actual KM Records
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('schedules')}
            className="text-xs text-venkys-700 hover:text-venkys-900 font-semibold flex items-center gap-1"
          >
            View All Schedules <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Date / ID</th>
                <th className="py-2.5 px-3">Transporter</th>
                <th className="py-2.5 px-3">Vehicle / Driver</th>
                <th className="py-2.5 px-3">Route / Item</th>
                <th className="py-2.5 px-3">Trip Type</th>
                <th className="py-2.5 px-3 text-right">Start KM</th>
                <th className="py-2.5 px-3 text-right">End KM</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">Actual KM</th>
                <th className="py-2.5 px-3 text-right">Expected KM</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {completedRecent.map((sch) => {
                const trip = sch.trip;
                const actual = trip?.actual_km ?? 0;
                const expected = sch.approx_km;

                return (
                  <tr key={sch.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{sch.schedule_number}</div>
                      <div className="text-[10px] text-slate-500">{sch.schedule_date}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-800">{sch.final_transporter?.name}</div>
                      {sch.was_skipped && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-1 rounded border border-rose-200">
                          Reassigned (Original: {sch.original_transporter?.transporter_code})
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{sch.vehicle?.vehicle_number}</div>
                      <div className="text-[11px] text-slate-500">{sch.driver_name_snapshot}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{sch.route?.from_location} → {sch.route?.to_location}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sch.item?.name}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <StatusBadge status={sch.trip_type} />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {trip?.start_km !== undefined ? `${trip.start_km}` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {trip?.end_km !== undefined ? `${trip.end_km}` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-venkys-800">
                      {actual > 0 ? `${actual} KM` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {expected} KM
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={sch.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

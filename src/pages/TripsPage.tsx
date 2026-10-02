import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { ScheduleViewModel } from '../types';
import { 
  Gauge, 
  Play, 
  CheckCircle2, 
  Search, 
  TrendingUp, 
  TrendingDown
} from 'lucide-react';

interface TripsPageProps {
  onOpenStartKm: (schedule: ScheduleViewModel) => void;
  onOpenEndKm: (schedule: ScheduleViewModel) => void;
}

export const TripsPage: React.FC<TripsPageProps> = ({
  onOpenStartKm,
  onOpenEndKm,
}) => {
  const store = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const enriched = store.getEnrichedSchedules();

  const filtered = enriched.filter(sch => {
    if (filterStatus === 'in_progress' && sch.status !== 'in_progress') return false;
    if (filterStatus === 'completed' && sch.status !== 'completed') return false;
    if (filterStatus === 'scheduled' && sch.status !== 'scheduled') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = sch.schedule_number.toLowerCase().includes(q);
      const matchVeh = sch.vehicle?.vehicle_number.toLowerCase().includes(q);
      const matchDriver = sch.driver_name_snapshot.toLowerCase().includes(q);
      const matchTrans = sch.final_transporter?.name.toLowerCase().includes(q);
      if (!matchNum && !matchVeh && !matchDriver && !matchTrans) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Trips & Kilometer Verification Hub"
        subtitle="Live odometer monitoring, trip dispatch timestamps, and actual distance reconciliation"
        badgeText="Odometer Audit"
      />

      {/* Filter and Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Trips
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_progress')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filterStatus === 'in_progress'
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            In-Progress
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filterStatus === 'completed'
                ? 'bg-emerald-700 text-white font-bold'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Completed
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('scheduled')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition ${
              filterStatus === 'scheduled'
                ? 'bg-amber-700 text-white font-bold'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Pending Start KM
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by vehicle or driver..."
            className="form-input pl-8 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Trip ID / Schedule</th>
                <th className="py-2.5 px-3">Vehicle / Transporter</th>
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Route / Destination</th>
                <th className="py-2.5 px-3">Trip Type</th>
                <th className="py-2.5 px-3 text-right">Start KM</th>
                <th className="py-2.5 px-3 text-right">End KM</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">Actual KM</th>
                <th className="py-2.5 px-3 text-right">Expected KM</th>
                <th className="py-2.5 px-3 text-center">Variance</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Odometer Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sch) => {
                const trip = sch.trip;
                const actual = trip?.actual_km;
                const expected = sch.approx_km;
                const variance = actual !== undefined ? Number((actual - expected).toFixed(2)) : null;

                return (
                  <tr key={sch.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">
                        {trip?.trip_number || `TRIP-${sch.schedule_number}`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Sch: {sch.schedule_number}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">
                        {sch.vehicle?.vehicle_number}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {sch.final_transporter?.name}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{sch.driver_name_snapshot}</div>
                      <div className="text-[10px] text-slate-500">{sch.vehicle?.driver_phone || '—'}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">
                        {sch.route?.from_location} → {sch.route?.to_location}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sch.item?.name}
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <StatusBadge status={sch.trip_type} />
                    </td>

                    {/* Start KM */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                      {trip?.start_km !== undefined ? (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {trip.start_km.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not set</span>
                      )}
                    </td>

                    {/* End KM */}
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                      {trip?.end_km !== undefined ? (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {trip.end_km.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending</span>
                      )}
                    </td>

                    {/* Actual KM = End - Start */}
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-venkys-800 text-xs">
                      {actual !== undefined && actual > 0 ? (
                        <span className="bg-red-50 text-venkys-900 px-2 py-0.5 rounded border border-red-200 font-bold">
                          {actual} KM
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Expected Approx KM */}
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {expected} KM
                    </td>

                    {/* Variance */}
                    <td className="py-2.5 px-3 text-center font-mono text-[11px]">
                      {variance !== null ? (
                        variance > 0 ? (
                          <span className="text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200 inline-flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +{variance}
                          </span>
                        ) : variance < 0 ? (
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {variance}
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                            Exact
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={sch.status} />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {sch.status === 'scheduled' && (
                        <button
                          type="button"
                          onClick={() => onOpenStartKm(sch)}
                          className="btn-primary text-[11px] py-1 px-2.5"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Record Start KM
                        </button>
                      )}

                      {sch.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => onOpenEndKm(sch)}
                          className="btn-primary text-[11px] py-1 px-2.5 bg-blue-700 hover:bg-blue-800"
                        >
                          <Gauge className="w-3 h-3" />
                          Record End KM
                        </button>
                      )}

                      {sch.status === 'completed' && (
                        <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
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

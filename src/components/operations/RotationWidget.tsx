import React from 'react';
import { useStore } from '../../hooks/useStore';
import { RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const RotationWidget: React.FC = () => {
  const store = useStore();
  const rotationOverview = store.getRotationOverview();
  const skipRecords = store.getSkipRecords();
  const recentSkip = skipRecords[0];

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-venkys-700" />
              Schedule-Based Transporter Rotation
            </h3>
            <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-amber-200">
              Active Cycle
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Strict deterministic rotation order. Transporters receive next schedule assignment in sequence.
          </p>
        </div>

        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
          <span>Active Order:</span>
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold text-slate-800">
            {rotationOverview.map((item, i) => (
              <span key={item.transporter.id} className="flex items-center">
                <span className={item.isNext ? 'text-venkys-700 underline font-bold' : ''}>
                  {item.transporter.transporter_code}
                </span>
                {i < rotationOverview.length - 1 && <span className="text-slate-400 mx-1">→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Rotation Queue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {rotationOverview.map((item) => {
          let cardBorder = 'border-slate-200 bg-slate-50/50';
          let statusBadge = <span className="text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">Waiting</span>;

          if (item.isNext) {
            cardBorder = 'border-venkys-600 bg-venkys-50/40 ring-1 ring-venkys-600';
            statusBadge = (
              <span className="text-[10px] text-white bg-venkys-700 font-bold px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                <Clock className="w-3 h-3" /> Next Assignment
              </span>
            );
          } else if (item.isLastAssigned) {
            cardBorder = 'border-emerald-300 bg-emerald-50/30';
            statusBadge = (
              <span className="text-[10px] text-emerald-800 bg-emerald-100 font-medium px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" /> Current Turn
              </span>
            );
          }

          return (
            <div
              key={item.transporter.id}
              className={`border rounded p-3 relative flex flex-col justify-between transition-all ${cardBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs font-bold font-mono flex items-center justify-center">
                      {item.transporter.transporter_code}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Order #{item.transporter.rotation_order}
                    </span>
                  </div>
                  {statusBadge}
                </div>

                <div className="text-xs font-semibold text-slate-900 line-clamp-1 mt-1">
                  {item.transporter.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Contact: {item.transporter.contact_person || 'N/A'}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Active Vehicles:</span>
                <span className={`font-mono font-semibold ${item.availableVehiclesCount > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {item.availableVehiclesCount} ready
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Skip / Breakdown Audit Alert Banner */}
      {recentSkip && (
        <div className="mt-3 bg-amber-50/70 border border-amber-200 rounded p-2.5 flex items-start justify-between text-xs text-amber-900 gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Recent Recorded Skip: </span>
              <span>
                Transporter was skipped for {recentSkip.reason_type.replace('_', ' ')}: "{recentSkip.reason_notes}".
                Schedule was seamlessly reassigned to next eligible transporter.
              </span>
            </div>
          </div>
          <span className="text-[10px] text-amber-800 font-mono flex-shrink-0 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
            {new Date(recentSkip.recorded_at).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

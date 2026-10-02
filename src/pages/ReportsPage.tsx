import React, { useState, useMemo } from 'react';
import { useStore } from '../hooks/useStore';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { ReportFilterCriteria } from '../types';
import { 
  Download, 
  Filter, 
  RotateCcw, 
  Search
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const store = useStore();

  const transporters = store.getTransporters();
  const vehicles = store.getVehicles();
  const items = store.getItems();
  const farms = store.getFarms();

  // Filters state
  const [filters, setFilters] = useState<ReportFilterCriteria>({
    startDate: '',
    endDate: '',
    transporterId: '',
    vehicleId: '',
    itemId: '',
    farmId: '',
    routeId: '',
    status: 'all',
    tripType: 'all',
    searchQuery: '',
  });

  const handleFilterChange = (key: keyof ReportFilterCriteria, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      transporterId: '',
      vehicleId: '',
      itemId: '',
      farmId: '',
      routeId: '',
      status: 'all',
      tripType: 'all',
      searchQuery: '',
    });
  };

  const reportData = useMemo(() => {
    return store.getEnrichedSchedules(filters);
  }, [filters, store]);

  // Aggregate Calculations
  const totals = useMemo(() => {
    let totalApproxKm = 0;
    let totalActualKm = 0;
    let completedCount = 0;
    let inProgressCount = 0;
    let skippedCount = 0;

    reportData.forEach(sch => {
      totalApproxKm += sch.approx_km || 0;
      if (sch.trip?.actual_km !== undefined) {
        totalActualKm += sch.trip.actual_km;
      }
      if (sch.status === 'completed') completedCount++;
      if (sch.status === 'in_progress') inProgressCount++;
      if (sch.was_skipped) skippedCount++;
    });

    const variance = totalActualKm > 0 ? Number((totalActualKm - totalApproxKm).toFixed(2)) : 0;

    return {
      count: reportData.length,
      completedCount,
      inProgressCount,
      skippedCount,
      totalApproxKm,
      totalActualKm,
      variance,
    };
  }, [reportData]);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Schedule No',
      'Date',
      'Original Transporter',
      'Final Transporter',
      'Was Skipped',
      'Skip Reason',
      'Vehicle Number',
      'Driver Name',
      'Item',
      'Origin',
      'Destination Farm',
      'Route Code',
      'Trip Type',
      'Approx KM',
      'Start KM',
      'End KM',
      'Actual KM',
      'KM Variance',
      'Status'
    ];

    const rows = reportData.map(sch => {
      const trip = sch.trip;
      const actual = trip?.actual_km !== undefined ? trip.actual_km : '';
      const variance = (actual !== '' && typeof actual === 'number') ? (actual - sch.approx_km).toFixed(2) : '';

      return [
        `"${sch.schedule_number}"`,
        `"${sch.schedule_date}"`,
        `"${sch.original_transporter?.name || ''}"`,
        `"${sch.final_transporter?.name || ''}"`,
        `"${sch.was_skipped ? 'YES' : 'NO'}"`,
        `"${(sch.skip_reason || '').replace(/"/g, '""')}"`,
        `"${sch.vehicle?.vehicle_number || ''}"`,
        `"${sch.driver_name_snapshot}"`,
        `"${sch.item?.name || ''}"`,
        `"${sch.from_location}"`,
        `"${sch.farm?.name || ''}"`,
        `"${sch.route?.route_code || ''}"`,
        `"${sch.trip_type}"`,
        sch.approx_km,
        trip?.start_km ?? '',
        trip?.end_km ?? '',
        actual,
        variance,
        `"${sch.status}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Venkys_TMS_Operational_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Enterprise Operational Logistics Reports"
        subtitle="Complete audit trail of transporter schedules, breakdown skips, and kilometer metrics"
        badgeText="Audit & Analytics"
        action={
          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-secondary"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            Export CSV Report
          </button>
        }
      />

      {/* COMPREHENSIVE FILTER MATRIX */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-venkys-700" />
            Operational Filter Criteria
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Date Range Start */}
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="form-input font-mono"
            />
          </div>

          {/* Date Range End */}
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="form-input font-mono"
            />
          </div>

          {/* Transporter */}
          <div>
            <label className="form-label">Transporter</label>
            <select
              value={filters.transporterId || ''}
              onChange={(e) => handleFilterChange('transporterId', e.target.value)}
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

          {/* Vehicle */}
          <div>
            <label className="form-label">Vehicle</label>
            <select
              value={filters.vehicleId || ''}
              onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
              className="form-select"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicle_number} ({v.driver_name})
                </option>
              ))}
            </select>
          </div>

          {/* Item */}
          <div>
            <label className="form-label">Item / Consignment</label>
            <select
              value={filters.itemId || ''}
              onChange={(e) => handleFilterChange('itemId', e.target.value)}
              className="form-select"
            >
              <option value="">All Items</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destination Farm */}
          <div>
            <label className="form-label">Destination Farm</label>
            <select
              value={filters.farmId || ''}
              onChange={(e) => handleFilterChange('farmId', e.target.value)}
              className="form-select"
            >
              <option value="">All Farms</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.district_area})
                </option>
              ))}
            </select>
          </div>

          {/* Trip Type */}
          <div>
            <label className="form-label">Trip Type</label>
            <select
              value={filters.tripType || 'all'}
              onChange={(e) => handleFilterChange('tripType', e.target.value)}
              className="form-select"
            >
              <option value="all">All Trip Types</option>
              <option value="round_trip">Round Trip</option>
              <option value="one_way">One Way</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="form-label">Schedule Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Global Search Box */}
        <div className="pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              placeholder="Search keyword across schedules, vehicles, drivers, skip reasons, routes..."
              className="form-input pl-8"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY TOTALS BAR (Restrained, clear numbers) */}
      <div className="bg-slate-900 text-white rounded-md p-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Total Filtered</div>
          <div className="font-mono text-lg font-bold text-white mt-0.5">{totals.count}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-400">Completed Trips</div>
          <div className="font-mono text-lg font-bold text-emerald-300 mt-0.5">{totals.completedCount}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-blue-400">In-Progress</div>
          <div className="font-mono text-lg font-bold text-blue-300 mt-0.5">{totals.inProgressCount}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-rose-400">Skipped Audits</div>
          <div className="font-mono text-lg font-bold text-rose-300 mt-0.5">{totals.skippedCount}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400">Expected Approx KM</div>
          <div className="font-mono text-lg font-bold text-slate-200 mt-0.5">{totals.totalApproxKm} KM</div>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-amber-400">Total Actual KM</div>
          <div className="font-mono text-lg font-bold text-amber-300 mt-0.5">
            {totals.totalActualKm} KM
            {totals.variance !== 0 && (
              <span className="text-[10px] text-slate-300 font-normal ml-1.5 font-sans">
                (Var: {totals.variance > 0 ? `+${totals.variance}` : totals.variance} KM)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* REPORT DATA TABLE */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Schedule ID</th>
                <th className="py-2.5 px-3">Transporter</th>
                <th className="py-2.5 px-3">Vehicle / Driver</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3">From → Destination</th>
                <th className="py-2.5 px-3">Trip Type</th>
                <th className="py-2.5 px-3 text-right">Approx KM</th>
                <th className="py-2.5 px-3 text-right">Start KM</th>
                <th className="py-2.5 px-3 text-right">End KM</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-900">Actual KM</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Skip / Audit Reason</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((sch) => {
                const trip = sch.trip;
                const actual = trip?.actual_km;
                const expected = sch.approx_km;

                return (
                  <tr key={sch.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {sch.schedule_date}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {sch.schedule_number}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{sch.final_transporter?.name}</div>
                      {sch.was_skipped && (
                        <div className="text-[10px] text-rose-700">
                          Orig: {sch.original_transporter?.transporter_code} → Reassigned: {sch.final_transporter?.transporter_code}
                        </div>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-slate-900">{sch.vehicle?.vehicle_number}</div>
                      <div className="text-[11px] text-slate-500">{sch.driver_name_snapshot}</div>
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {sch.item?.name}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{sch.from_location} → {sch.farm?.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Route: {sch.route?.route_code}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      <StatusBadge status={sch.trip_type} />
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {expected} KM
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {trip?.start_km !== undefined ? trip.start_km : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {trip?.end_km !== undefined ? trip.end_km : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono font-bold text-venkys-800">
                      {actual !== undefined && actual > 0 ? `${actual} KM` : '—'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={sch.status} />
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 text-[11px] max-w-xs">
                      {sch.was_skipped ? (
                        <span className="text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 inline-block font-mono text-[10px]">
                          {sch.skip_reason}
                        </span>
                      ) : (
                        <span className="text-slate-400">Regular Rotation</span>
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

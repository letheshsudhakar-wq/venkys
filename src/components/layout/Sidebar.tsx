import React from 'react';
import { useStore } from '../../hooks/useStore';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Gauge, 
  FileSpreadsheet, 
  Truck, 
  CarFront, 
  PackageCheck, 
  MapPin, 
  Route as RouteIcon, 
  Users, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard'
  | 'schedules'
  | 'trips'
  | 'reports'
  | 'transporters'
  | 'vehicles'
  | 'items'
  | 'farms'
  | 'routes'
  | 'users';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onResetData,
}) => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const metrics = store.getOperationalMetrics();

  const navItem = (tab: NavigationTab, label: string, icon: React.ReactNode, count?: number, badgeColor?: string) => {
    const isActive = currentTab === tab;
    return (
      <button
        key={tab}
        type="button"
        onClick={() => onSelectTab(tab)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
          isActive
            ? 'bg-venkys-50 text-venkys-900 font-semibold border-l-4 border-venkys-700 pl-2'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={isActive ? 'text-venkys-700' : 'text-slate-500'}>{icon}</span>
          <span>{label}</span>
        </div>
        {count !== undefined && (
          <span
            className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold ${
              badgeColor || (isActive ? 'bg-venkys-200 text-venkys-900' : 'bg-slate-200 text-slate-700')
            }`}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between h-[calc(100vh-69px)] sticky top-[69px] select-none">
      <div className="p-3 space-y-6 overflow-y-auto">
        {/* Section 1: OPERATIONS */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations Center
          </div>
          <div className="space-y-0.5">
            {navItem('dashboard', 'Operations Dashboard', <LayoutDashboard className="w-4 h-4" />)}
            {navItem('schedules', 'Schedules', <CalendarRange className="w-4 h-4" />, metrics.scheduledPending + metrics.inProgressTrips, 'bg-amber-100 text-amber-900')}
            {navItem('trips', 'Trips & Kilometers', <Gauge className="w-4 h-4" />, metrics.inProgressTrips, metrics.inProgressTrips > 0 ? 'bg-blue-100 text-blue-900' : undefined)}
            {navItem('reports', 'Operational Reports', <FileSpreadsheet className="w-4 h-4" />)}
          </div>
        </div>

        {/* Section 2: MASTER DATA */}
        <div>
          <div className="px-2 pb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Master Data</span>
            {currentUser.role === 'admin' ? (
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 font-semibold lowercase">admin</span>
            ) : (
              <span className="text-[9px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded lowercase">view only</span>
            )}
          </div>
          <div className="space-y-0.5">
            {navItem('transporters', 'Transporter Master', <Truck className="w-4 h-4" />, metrics.activeTransportersCount)}
            {navItem('vehicles', 'Vehicle Master', <CarFront className="w-4 h-4" />, metrics.availableVehiclesCount)}
            {navItem('items', 'Item Master', <PackageCheck className="w-4 h-4" />)}
            {navItem('farms', 'Farm Master', <MapPin className="w-4 h-4" />)}
            {navItem('routes', 'Route Master', <RouteIcon className="w-4 h-4" />)}
            {currentUser.role === 'admin' && navItem('users', 'Users & Permissions', <Users className="w-4 h-4" />)}
          </div>
        </div>

        {/* Quick Operations Pulse */}
        <div className="bg-slate-50 border border-slate-200 rounded p-2.5 space-y-1.5 text-[11px]">
          <div className="font-semibold text-slate-800 text-xs flex items-center justify-between">
            <span>Operational Pulse</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex justify-between text-slate-600">
            <span>In-Progress Trips:</span>
            <span className="font-mono font-semibold text-blue-700">{metrics.inProgressTrips}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Active Transporters:</span>
            <span className="font-mono font-semibold text-slate-800">{metrics.activeTransportersCount}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Vehicles Available:</span>
            <span className="font-mono font-semibold text-emerald-700">{metrics.availableVehiclesCount}</span>
          </div>
          {metrics.unavailableVehiclesCount > 0 && (
            <div className="flex justify-between text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded text-[10px]">
              <span className="flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> Breakdown / Offline:
              </span>
              <span className="font-mono font-bold">{metrics.unavailableVehiclesCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Reset Demo Data button */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <button
          type="button"
          onClick={onResetData}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded shadow-xs transition-colors"
          title="Reset back to standard initial demo records and rotation"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset Demo Data
        </button>
        <div className="text-[10px] text-slate-400 text-center mt-1.5">
          Venky's TMS Enterprise Demo
        </div>
      </div>
    </aside>
  );
};

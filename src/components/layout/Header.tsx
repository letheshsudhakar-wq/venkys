import React, { useState, useEffect } from 'react';
import { useStore } from '../../hooks/useStore';
import { ShieldCheck, UserCheck, Clock, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenCreateSchedule?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateSchedule }) => {
  const store = useStore();
  const currentUser = store.getCurrentUser();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleRole = () => {
    const newRole = currentUser.role === 'admin' ? 'transport_manager' : 'admin';
    store.setCurrentUserRole(newRole);
  };

  return (
    <header
      className="text-white shadow-md border-b border-[#7E191B] z-30 sticky top-0"
      style={{ backgroundColor: '#9B1B1E' }}
    >
      {/* Top micro status bar */}
      <div
        className="px-4 py-1 text-[11px] text-amber-100 flex items-center justify-between border-b border-[#7E191B]/60"
        style={{ backgroundColor: '#631517' }}
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE INTERNAL SYSTEM • VENKATESHWARA HATCHERIES GROUP
          </span>
          <span className="text-red-300">|</span>
          <span className="text-white/80 font-mono text-[10px]">TMS Core v1.2</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-amber-100 font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            {timeStr}
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Brand Identity with Logo in Top-Left Corner */}
        <div className="flex items-center gap-3.5">
          <div className="bg-white rounded-md shadow-md border-2 border-amber-300 flex items-center justify-center shrink-0 h-13 w-40 overflow-hidden relative">
            <img
              src="/logo.png"
              alt="Vencobb Venky's Logo"
              className="w-full h-full object-contain scale-[2.2] transition-transform"
              style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}
            />
          </div>

          <div className="border-l border-red-300/40 pl-3.5">
            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-2 drop-shadow-xs">
              VENKY'S Transport Management System
              <span className="text-[10px] uppercase font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded shadow-xs font-mono">
                OPERATIONS
              </span>
            </div>
            <div className="text-xs text-amber-100 font-medium">
              Poultry Logistics & Transporter Rotation Division
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Schedule Trigger */}
          {onOpenCreateSchedule && (
            <button
              type="button"
              onClick={onOpenCreateSchedule}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded text-xs inline-flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create Schedule
            </button>
          )}

          {/* Role Switcher Pill */}
          <div
            className="p-1 rounded-md border border-white/20 flex items-center gap-1 text-xs shadow-inner"
            style={{ backgroundColor: '#631517' }}
          >
            <button
              type="button"
              onClick={handleToggleRole}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${currentUser.role === 'transport_manager'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-amber-100 hover:text-white hover:bg-white/10'
                }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Transport Manager
            </button>
            <button
              type="button"
              onClick={handleToggleRole}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${currentUser.role === 'admin'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-amber-100 hover:text-white hover:bg-white/10'
                }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* User Info */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/20 text-right">
            <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center border-2 border-amber-200 shadow-xs">
              {currentUser.full_name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {currentUser.full_name}
              </div>
              <div className="text-[10px] text-amber-200 font-medium">
                {currentUser.employee_code} ({currentUser.role === 'admin' ? 'Administrator' : 'Manager'})
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

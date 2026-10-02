import React from 'react';
import type { ScheduleStatus, EntityStatus, SkipReasonType, TripType } from '../../types';

interface StatusBadgeProps {
  status: ScheduleStatus | EntityStatus | SkipReasonType | TripType | 'available' | 'unavailable' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'completed':
    case 'active':
    case 'available':
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium';
      break;
    case 'in_progress':
      colorClasses = 'bg-blue-50 text-blue-800 border-blue-200 font-medium animate-pulse';
      break;
    case 'scheduled':
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-200 font-medium';
      break;
    case 'skipped':
    case 'unavailable':
    case 'vehicle_breakdown':
    case 'inactive':
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200 font-medium';
      break;
    case 'cancelled':
      colorClasses = 'bg-slate-100 text-slate-500 border-slate-200';
      break;
    case 'round_trip':
      colorClasses = 'bg-purple-50 text-purple-800 border-purple-200';
      label = 'Round Trip';
      break;
    case 'one_way':
      colorClasses = 'bg-sky-50 text-sky-800 border-sky-200';
      label = 'One Way';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center rounded border capitalize font-sans ${sizeClasses} ${colorClasses}`}>
      {label}
    </span>
  );
};

import React from 'react';
import { useStore } from '../../hooks/useStore';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ShieldCheck, UserCheck } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const store = useStore();
  const users = store.getUsers();
  const currentUser = store.getCurrentUser();

  const handleRoleChange = (role: 'admin' | 'transport_manager') => {
    store.setCurrentUserRole(role);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="User Access & Role Matrix"
        subtitle="Role-based permissions governing master data authorization and transport dispatch execution"
        badgeText="Access Control"
      />

      {/* Role Matrix Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role 1: Admin */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-venkys-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Role 1 — Administrator
              </h4>
            </div>
            {currentUser.role === 'admin' && (
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                ACTIVE DEMO SESSION
              </span>
            )}
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Manage Master Data (Transporters, Vehicles, Items, Farms, Routes)</li>
            <li>Configure and re-order rotation sequence database order</li>
            <li>View all active & historical schedules, trips, and skip records</li>
            <li>Export comprehensive audit and operational reports</li>
            <li>Deactivate and activate operational entities</li>
          </ul>
        </div>

        {/* Role 2: Transport Manager */}
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Role 2 — Transport Manager
              </h4>
            </div>
            {currentUser.role === 'transport_manager' && (
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200">
                ACTIVE DEMO SESSION
              </span>
            )}
          </div>
          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
            <li>Access Operational Command Dashboard ("What is happening today")</li>
            <li>Create schedules with automatic rotation preselection</li>
            <li>Record breakdown reasons and skip to next eligible transporter</li>
            <li>Enter starting odometer KM and ending return KM with auto Actual KM computation</li>
            <li>View operational reports and monitor active fleet dispatches</li>
          </ul>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            System Operators Directory
          </h3>
          <span className="text-xs text-slate-500">Switch active role from the header bar</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="enterprise-table-header">
              <tr>
                <th className="py-2.5 px-3">Employee Code</th>
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Official Email</th>
                <th className="py-2.5 px-3">Contact Phone</th>
                <th className="py-2.5 px-3 text-center">Assigned Role</th>
                <th className="py-2.5 px-3 text-center">Account Status</th>
                <th className="py-2.5 px-3 text-right">Session Switch</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isCurrent = currentUser.id === u.id;

                return (
                  <tr key={u.id} className="enterprise-table-row">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {u.employee_code}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {u.full_name}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {u.email}
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px]">
                      {u.contact_number || '—'}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <StatusBadge status={u.status} />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRoleChange(u.role)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded border transition ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                        }`}
                      >
                        {isCurrent ? 'Active User' : `Act as ${u.role === 'admin' ? 'Admin' : 'Manager'}`}
                      </button>
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

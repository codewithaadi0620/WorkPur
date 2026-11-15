import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  FileText, 
  Briefcase, 
  Wallet, 
  Users, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  UserCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, isClient, isFreelancer, isAdmin } = useAuth();

  const clientLinks = [
    { to: '/client', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/client/projects', label: 'My Projects', icon: FolderKanban },
    { to: '/client/projects/new', label: 'Post a Project', icon: PlusCircle },
    { to: '/client/contracts', label: 'Contracts & Milestones', icon: FileText },
    { to: '/client/wallet', label: 'Billing & Wallet', icon: Wallet },
  ];

  const freelancerLinks = [
    { to: '/freelancer', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/projects', label: 'Browse Projects', icon: Briefcase },
    { to: '/freelancer/proposals', label: 'My Proposals', icon: FileText },
    { to: '/freelancer/contracts', label: 'Active Contracts', icon: FolderKanban },
    { to: '/freelancer/profile', label: 'Profile & Skills', icon: UserCheck },
    { to: '/freelancer/wallet', label: 'Earnings & Wallet', icon: Wallet },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Platform Analytics', icon: LayoutDashboard, end: true },
    { to: '/admin/projects', label: 'Manage Projects', icon: FolderKanban },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/categories', label: 'Categories & Skills', icon: Layers },
    { to: '/admin/audit-logs', label: 'Audit Trail Logs', icon: ShieldCheck },
  ];

  const links = isAdmin ? adminLinks : isClient ? clientLinks : freelancerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {user.role} Workspace
          </p>
          <p className="text-sm font-bold text-slate-800 mt-1 truncate">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {user.email}
          </p>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Wallet Summary */}
      <div className="p-3.5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">Available Funds</span>
          <Wallet className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="text-lg font-bold text-indigo-900 mt-1">
          ${parseFloat(user.wallet?.available_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {parseFloat(user.wallet?.reserved_balance || 0) > 0 && (
          <p className="text-[11px] text-indigo-600 mt-0.5">
            + ${parseFloat(user.wallet.reserved_balance).toFixed(2)} in Escrow
          </p>
        )}
      </div>
    </aside>
  );
}

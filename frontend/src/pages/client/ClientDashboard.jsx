import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, projectsApi, contractsApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { 
  FolderKanban, 
  PlusCircle, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function ClientDashboard() {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [statsRes, projectsRes, contractsRes] = await Promise.all([
          analyticsApi.getClientStats(),
          projectsApi.getClientProjects(),
          contractsApi.getUserContracts(),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (projectsRes.success) setProjects(projectsRes.data);
        if (contractsRes.success) setContracts(contractsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading client workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
        
        {/* Welcome & Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Executive Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your engineering projects, incoming proposals, and milestone escrow funding
            </p>
          </div>
          <Link
            to="/client/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Project</span>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Projects</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {stats?.total_projects || projects.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {stats?.open_projects || 0} currently open for proposals
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Proposals</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {stats?.pending_proposals_count || 0}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">Awaiting your hiring decision</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Contracts</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {contracts.filter((c) => c.status === 'ACTIVE').length}
            </div>
            <span className="text-[11px] text-blue-600 font-medium">In-progress milestone work</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Spend Disbursed</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              ${parseFloat(stats?.total_spent || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Escrow: ${parseFloat(stats?.reserved_balance || 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Two-Column Section: Projects & Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Projects Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Your Posted Projects</h3>
              <Link to="/client/projects/new" className="text-xs font-bold text-indigo-600 hover:underline">
                + New
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {projects.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No projects posted yet.</p>
              ) : (
                projects.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/projects/${p.id}`} className="text-xs font-bold text-slate-800 hover:text-indigo-600 truncate block">
                        {p.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="text-indigo-600 font-medium">{p.category_name}</span>
                        <span>•</span>
                        <span>{p.proposal_count} proposals</span>
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                        p.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700'
                          : p.status === 'IN_PROGRESS'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Contracts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Contracts & Escrow Status</h3>
              <Link to="/client/contracts" className="text-xs font-bold text-indigo-600 hover:underline">
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {contracts.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No contracts formed yet.</p>
              ) : (
                contracts.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <Link to={`/client/contracts/${c.id}`} className="text-xs font-bold text-slate-800 hover:text-indigo-600 truncate block">
                        {c.projects.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>Freelancer: <strong>{c.users_contracts_freelancer_idTousers.name}</strong></span>
                        <span>•</span>
                        <span className="font-bold text-slate-900">${parseFloat(c.agreed_amount).toFixed(2)}</span>
                      </div>
                    </div>
                    <Link
                      to={`/client/contracts/${c.id}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold shrink-0"
                    >
                      Milestones →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

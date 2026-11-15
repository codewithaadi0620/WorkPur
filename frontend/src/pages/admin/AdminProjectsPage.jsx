import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import {
  FolderKanban,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Users,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  // Moderation modal
  const [moderationProject, setModerationProject] = useState(null);
  const [newStatus, setNewStatus] = useState('CANCELLED');
  const [reason, setReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProjects({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  const handleModerationSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const res = await adminApi.updateProjectStatus(moderationProject.id, {
        status: newStatus,
        reason: reason || 'Administrative compliance action',
      });
      if (res.success) {
        toast.success(`Project status updated to ${newStatus}`);
        setModerationProject(null);
        setReason('');
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update project status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Project Governance & Moderation</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor all marketplace postings across clients, inspect proposal volume, and enforce terms of service.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FolderKanban className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-sm">No projects found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Budget</th>
                  <th className="py-3.5 px-4">Proposals</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => {
                  let statusBadge = 'bg-slate-100 text-slate-700';
                  if (p.status === 'OPEN') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                  if (p.status === 'IN_PROGRESS') statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
                  if (p.status === 'COMPLETED') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                  if (p.status === 'CANCELLED' || p.status === 'CLOSED')
                    statusBadge = 'bg-rose-50 text-rose-700 border border-rose-200';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 max-w-xs">
                        <Link
                          to={`/projects/${p.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 truncate block transition"
                        >
                          {p.title}
                        </Link>
                        <p className="text-xs text-slate-400">ID: {p.id.substring(0, 8)}...</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800 text-xs">{p.users?.name}</p>
                        <p className="text-[11px] text-slate-400">{p.users?.email}</p>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {p.categories?.name}
                      </td>

                      <td className="py-3.5 px-4 text-xs font-bold text-slate-800">
                        ${Number(p.min_budget).toLocaleString()} - ${Number(p.max_budget).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          <Users className="w-3 h-3 text-slate-500" />
                          {p._count?.proposals || 0}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusBadge}`}>
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setModerationProject(p);
                            setNewStatus(p.status === 'CANCELLED' ? 'OPEN' : 'CANCELLED');
                            setReason('');
                          }}
                          className="px-3 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Moderate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Moderation Modal */}
      {moderationProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Moderate Project: {moderationProject.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Admin status override. Any changes will be recorded in the PostgreSQL audit log.
            </p>

            <form onSubmit={handleModerationSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Change Project Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="OPEN">OPEN (Re-open project)</option>
                  <option value="CANCELLED">CANCELLED (Cancel for violations)</option>
                  <option value="CLOSED">CLOSED (Close bidding)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Administrative Reason
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Violates project guidelines, spam or requested outside payment..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModerationProject(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Confirm Status Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

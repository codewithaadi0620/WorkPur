import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { FileText, Search, ShieldAlert, Calendar, Filter, Code } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Selected JSON details inspection
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs({
        action: actionFilter || undefined,
      });
      if (res.success) {
        setLogs(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(s) ||
      log.entity.toLowerCase().includes(s) ||
      log.entity_id?.toLowerCase().includes(s) ||
      log.user_id?.toLowerCase().includes(s) ||
      JSON.stringify(log.details || {}).toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security & Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete system activity trail recording account administrative actions, status updates, and critical transactions.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search action, entity ID, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Audit Actions</option>
          <option value="USER_SUSPENDED">USER_SUSPENDED</option>
          <option value="USER_ACTIVATED">USER_ACTIVATED</option>
          <option value="USER_STATUS_CHANGE_TRIGGER">USER_STATUS_CHANGE_TRIGGER</option>
          <option value="PROPOSAL_ACCEPTED">PROPOSAL_ACCEPTED</option>
          <option value="ESCROW_RELEASED">ESCROW_RELEASED</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-500" />
            <p className="text-sm">No audit logs found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Entity ID</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filteredLogs.map((log) => {
                  let actionBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (log.action.includes('SUSPEND')) {
                    actionBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  } else if (log.action.includes('ACTIVATE') || log.action.includes('RELEASE')) {
                    actionBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  } else if (log.action.includes('TRIGGER')) {
                    actionBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-sans">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${actionBadge}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-800">
                        {log.entity}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {log.entity_id ? `${log.entity_id.substring(0, 8)}...` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-sans">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition flex items-center gap-1"
                        >
                          <Code className="w-3 h-3 text-indigo-600" /> Inspect JSON
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3.5 px-4 font-sans text-xs text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Audit Event Details: {selectedLog.action}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-mono">
              Event ID: {selectedLog.id}
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-72">
              <pre>{JSON.stringify(selectedLog.details, null, 2)}</pre>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../../services/api';
import { Briefcase, Calendar, DollarSign, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FreelancerContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await contractsApi.getUserContracts();
      if (res.success) {
        setContracts(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Contracts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your project milestones, submit deliverables, and track escrow payouts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status} ({contracts.filter((c) => (status === 'ALL' ? true : c.status === status)).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredContracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-700">No contracts found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {filter === 'ALL'
              ? 'When a client accepts your proposal, a binding contract is formed with milestones.'
              : `No contracts matching status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContracts.map((contract) => {
            const isCompleted = contract.status === 'COMPLETED';
            const isActive = contract.status === 'ACTIVE';

            return (
              <div
                key={contract.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isActive
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {contract.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Started {new Date(contract.start_date || contract.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                      {contract.projects?.title || 'Contract Project'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Client: <span className="font-semibold text-slate-800">{contract.client?.name}</span>
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Agreed Value</p>
                      <p className="text-xl font-black text-slate-900 mt-0.5">
                        ${Number(contract.agreed_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Milestones</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">
                        {contract.milestones ? contract.milestones.length : 0} defined
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    ID: {contract.id.substring(0, 8)}...
                  </span>
                  <Link
                    to={`/freelancer/contracts/${contract.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    Open Contract <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

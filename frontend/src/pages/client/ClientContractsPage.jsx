import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import { FileText, ArrowRight, Clock, CheckCircle2, User } from 'lucide-react';

export default function ClientContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractsApi.getUserContracts()
      .then((res) => {
        if (res.success) setContracts(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Contracts & Milestones</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track active engineering contracts, manage milestones, fund escrow, and release payments
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading contracts...</p>
          </div>
        ) : contracts.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Active Contracts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you accept a freelancer's proposal, a formal contract is created atomically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contracts.map((c) => (
              <div
                key={c.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'ACTIVE'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {c.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      ${parseFloat(c.agreed_amount).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">{c.projects.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Hired: <strong className="text-slate-800">{c.users_contracts_freelancer_idTousers.name}</strong></span>
                  </div>

                  {/* Milestones overview count */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Milestones Tracked:</span>
                    <span className="font-bold text-indigo-600">
                      {c.milestones?.filter((m) => m.status === 'PAID').length || 0} / {c.milestones?.length || 0} Paid
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Started {new Date(c.start_date).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/client/contracts/${c.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    <span>Manage Milestones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

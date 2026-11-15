import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi, contractsApi, proposalsApi } from '../../services/api';
import {
  FileText,
  Briefcase,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FreelancerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, contractsRes, proposalsRes] = await Promise.all([
        analyticsApi.getFreelancerStats(),
        contractsApi.getUserContracts(),
        proposalsApi.getFreelancerProposals(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (contractsRes.success) setContracts(contractsRes.data || []);
      if (proposalsRes.success) setProposals(proposalsRes.data || []);
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Active Contracts',
      value: stats?.active_contracts ?? contracts.filter((c) => c.status === 'ACTIVE').length,
      icon: Briefcase,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Proposals Submitted',
      value: stats?.proposals_count ?? proposals.length,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Total Earnings',
      value: `$${Number(stats?.total_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Average Rating',
      value: stats?.average_rating ? `${Number(stats.average_rating).toFixed(1)} / 5.0` : 'No reviews',
      icon: Star,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full text-xs font-semibold uppercase tracking-wider">
            Freelancer Workspace
          </span>
          <h1 className="text-3xl font-extrabold mt-3 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-indigo-200 mt-2 text-sm leading-relaxed">
            Track your proposals, fulfill client milestones, submit deliverables, and grow your freelance career on WorkPur.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="px-5 py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm shadow hover:bg-indigo-50 transition"
            >
              Explore New Projects
            </Link>
            <Link
              to="/freelancer/wallet"
              className="px-5 py-2.5 bg-indigo-600/60 hover:bg-indigo-600 border border-indigo-400/40 text-white font-medium rounded-xl text-sm transition flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              Wallet & Earnings
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-2">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Active Contracts & Recent Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Contracts */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Active Contracts</h2>
                <p className="text-xs text-slate-500">Milestones and work in progress</p>
              </div>
              <Link
                to="/freelancer/contracts"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {contracts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active contracts found.</p>
                <Link
                  to="/projects"
                  className="mt-3 inline-block text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Browse open projects to apply &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contracts.slice(0, 4).map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {contract.projects?.title || 'Contract Project'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Client: <span className="text-slate-700 font-medium">{contract.client?.name}</span> • Amount:{' '}
                        <span className="font-semibold text-emerald-600">
                          ${Number(contract.agreed_amount).toLocaleString()}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={`/freelancer/contracts/${contract.id}`}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                    >
                      Milestones
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Proposals */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Proposals</h2>
                <p className="text-xs text-slate-500">Track application statuses</p>
              </div>
              <Link
                to="/freelancer/proposals"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {proposals.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">You haven't submitted any proposals yet.</p>
                <Link
                  to="/projects"
                  className="mt-3 inline-block text-xs text-indigo-600 hover:underline font-semibold"
                >
                  Find projects matching your skills &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.slice(0, 4).map((p) => {
                  let badge = 'bg-amber-50 text-amber-700 border-amber-200';
                  if (p.status === 'ACCEPTED') badge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (p.status === 'REJECTED') badge = 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-center justify-between"
                    >
                      <div className="max-w-[70%]">
                        <Link
                          to={`/projects/${p.project_id}`}
                          className="font-semibold text-slate-900 text-sm hover:text-indigo-600 line-clamp-1"
                        >
                          {p.projects?.title || 'Project Proposal'}
                        </Link>
                        <p className="text-xs text-slate-500 mt-1">
                          Bid: <span className="font-semibold text-slate-800">${Number(p.proposed_amount).toLocaleString()}</span> • Est: {p.estimated_days} days
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${badge}`}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

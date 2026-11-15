import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import {
  Users,
  Briefcase,
  DollarSign,
  FileText,
  Activity,
  RefreshCw,
  TrendingUp,
  Star,
  Layers,
  Database,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAdminAnalytics();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshViews = async () => {
    try {
      setRefreshing(true);
      const res = await analyticsApi.refreshMaterializedViews();
      if (res.success) {
        toast.success(res.message || 'PostgreSQL Materialized Views refreshed successfully!');
        fetchAnalytics();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to refresh materialized views');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const monthly = data?.monthly || [];
  const categories = data?.categories || [];
  const topFreelancers = data?.topFreelancers || [];

  const statCards = [
    {
      title: 'Total Users',
      value: overview.totalUsers ?? 0,
      sub: `${overview.totalClients ?? 0} Clients • ${overview.totalFreelancers ?? 0} Freelancers`,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    },
    {
      title: 'Total Projects',
      value: overview.totalProjects ?? 0,
      sub: `${overview.openProjects ?? 0} Open • ${overview.completedProjects ?? 0} Completed`,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Gross Platform GMV',
      value: `$${Number(overview.totalEscrowReleased || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      sub: 'Total contract volume disbursed',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    },
    {
      title: 'Total Contracts',
      value: overview.totalContracts ?? 0,
      sub: `${overview.activeContracts ?? 0} Active • ${overview.completedContracts ?? 0} Completed`,
      icon: FileText,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Materialized View Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Real-Time Platform Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Platform Administrative Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor platform GMV, user acquisition, project completion velocity, and financial health.
          </p>
        </div>

        <button
          onClick={handleRefreshViews}
          disabled={refreshing}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Analytics Cache'}
        </button>
      </div>

      {/* Metric Cards Grid */}
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
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">{card.value}</h3>
                  <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                </div>
                <div className={`p-3 rounded-xl border ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Platform Revenue Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Volume & Spending</h3>
              <p className="text-xs text-slate-500">
                Data queried from <code>monthly_platform_analytics</code> materialized view
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-64 pt-4">
            {monthly.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly transactions recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Total Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total_spent"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpend)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Project Category Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Projects by Category</h3>
              <p className="text-xs text-slate-500">
                Aggregated from <code>project_category_statistics</code> materialized view
              </p>
            </div>
            <Layers className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-64 pt-4">
            {categories.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="category_name"
                    type="category"
                    tick={{ fontSize: 10 }}
                    width={110}
                  />
                  <Tooltip />
                  <Bar dataKey="total_projects" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Performing Freelancers (from top_freelancers_view) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Top Performing Freelancers</h3>
          <p className="text-xs text-slate-500">
            Real-time ranking calculated from <code>top_freelancers_view</code> based on ratings and completed contracts
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Freelancer</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Reviews</th>
                <th className="py-3 px-4">Total Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topFreelancers.slice(0, 5).map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                      {f.name?.[0] || 'F'}
                    </div>
                    {f.name}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                    {f.title || 'Freelancer'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {f.average_rating ? Number(f.average_rating).toFixed(1) : '5.0'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {f.total_reviews || 0} reviews
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600 text-xs">
                    ${Number(f.total_earnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

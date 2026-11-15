import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proposalsApi } from '../../services/api';
import { FileText, Calendar, DollarSign, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FreelancerProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await proposalsApi.getFreelancerProposals();
      if (res.success) {
        setProposals(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (filter === 'ALL') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Proposals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track and manage all your project applications and bids.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          Find New Projects
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              filter === status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status} ({proposals.filter((p) => (status === 'ALL' ? true : p.status === status)).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-700">No proposals found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {filter === 'ALL'
              ? "You haven't submitted any proposals yet. Check out open opportunities."
              : `No proposals with status "${filter}".`}
          </p>
          <Link
            to="/projects"
            className="mt-4 inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition"
          >
            Explore Projects
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((prop) => {
            let statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
            if (prop.status === 'ACCEPTED') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (prop.status === 'REJECTED') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${statusBadge}`}>
                        {prop.status}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Submitted on {new Date(prop.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      to={`/projects/${prop.project_id}`}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-600 mt-2 block transition"
                    >
                      {prop.projects?.title || 'Project'}
                    </Link>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Your Bid</p>
                      <p className="text-lg font-extrabold text-emerald-600">
                        ${Number(prop.proposed_amount).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Delivery</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {prop.estimated_days} days
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cover letter snippet */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Your Cover Letter
                  </p>
                  <p className="line-clamp-3 italic text-slate-600">"{prop.cover_letter}"</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Project Category:{' '}
                    <span className="font-semibold text-slate-700">
                      {prop.projects?.categories?.name || 'General'}
                    </span>
                  </div>
                  <Link
                    to={`/projects/${prop.project_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    View Project <ExternalLink className="w-3.5 h-3.5" />
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

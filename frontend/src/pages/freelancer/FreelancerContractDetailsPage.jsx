import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contractsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ReviewModal from '../../components/ReviewModal';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  FileCheck,
  Send,
  ArrowLeft,
  Star,
  Info,
  Github,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';

function renderSubmissionNotes(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      const isGitHub = part.includes('github.com');
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline font-semibold break-all inline-flex items-center gap-1 mx-0.5"
        >
          {isGitHub && <Github className="w-3.5 h-3.5 inline shrink-0" />}
          <span>{part}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }
    return part;
  });
}

export default function FreelancerContractDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submit deliverable modal state
  const [activeMilestone, setActiveMilestone] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Review modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await contractsApi.getById(id);
      if (res.success) {
        setContract(res.data);
      }
    } catch (err) {
      toast.error('Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSubmitModal = (milestone) => {
    setActiveMilestone(milestone);
    setSubmissionNotes('');
    setGithubUrl('');
  };

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault();
    const repo = githubUrl.trim();
    const notes = submissionNotes.trim();

    if (!repo && !notes) {
      toast.error('Please enter delivery notes or your GitHub repository URL.');
      return;
    }

    const combined = repo && notes ? `${notes}\n\nRepository: ${repo}` : (repo || notes);

    try {
      setIsSubmitting(true);
      const res = await contractsApi.submitWork(activeMilestone.id, {
        submissionNotes: combined,
        notes: combined,
        githubRepo: repo,
      });
      if (res.success) {
        toast.success('Work deliverable submitted to client successfully!');
        setActiveMilestone(null);
        setSubmissionNotes('');
        setGithubUrl('');
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit milestone work');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-800">Contract not found</h2>
        <Link to="/freelancer/contracts" className="text-indigo-600 mt-2 inline-block">
          &larr; Back to Contracts
        </Link>
      </div>
    );
  }

  const allMilestonesPaid =
    contract.milestones &&
    contract.milestones.length > 0 &&
    contract.milestones.every((m) => m.status === 'PAID');

  return (
    <div className="space-y-8">
      {/* Back & Header */}
      <div>
        <Link
          to="/freelancer/contracts"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Contracts
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold">
                Contract Status: {contract.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {contract.id.substring(0, 13)}...
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              {contract.projects?.title || 'Contract Agreement'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="px-4 py-2 border border-slate-300 hover:border-slate-400 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Review Client
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Agreed Total</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ${Number(contract.agreed_amount).toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Binding contract amount</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Client</p>
          <h3 className="text-lg font-bold text-slate-800 mt-1">{contract.client?.name}</h3>
          <p className="text-xs text-slate-500 mt-1">{contract.client?.email}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Started</p>
          <h3 className="text-base font-bold text-slate-800 mt-1">
            {new Date(contract.start_date || contract.created_at).toLocaleDateString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Creation timestamp</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed Milestones</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            {contract.milestones?.filter((m) => m.status === 'PAID').length} / {contract.milestones?.length || 0}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Funds released to wallet</p>
        </div>
      </div>

      {/* Milestones Deliverables Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Contract Milestones & Deliverables</h2>
          <p className="text-xs text-slate-500">
            Submit your work for each milestone. Once the client approves, the escrow payment will be credited directly to your available wallet balance.
          </p>
        </div>

        {contract.milestones?.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No milestones have been generated for this contract.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contract.milestones.map((m, idx) => {
              const isPaid = m.status === 'PAID';
              const isSubmitted = m.status === 'SUBMITTED';
              const isApproved = m.status === 'APPROVED';
              const isPending = m.status === 'PENDING';
              const isRejected = m.status === 'REJECTED';

              let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
              if (isPaid) badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (isApproved) badgeStyle = 'bg-indigo-50 text-indigo-700 border-indigo-200';
              if (isSubmitted) badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
              if (isRejected) badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeStyle}`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 max-w-2xl">{m.description}</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Milestone Value</p>
                        <p className="text-lg font-black text-slate-900">
                          ${Number(m.amount).toLocaleString()}
                        </p>
                      </div>

                      {/* Action Button for Freelancer */}
                      <div>
                        {(isPending || isRejected) && (
                          <button
                            onClick={() => handleOpenSubmitModal(m)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            {isRejected ? 'Resubmit Work' : 'Submit Work'}
                          </button>
                        )}
                        {isSubmitted && (
                          <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-medium border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Under Client Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium border border-indigo-200 flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            Approved (Pending Release)
                          </span>
                        )}
                        {isPaid && (
                          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Funds Released
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submission Details Note if present */}
                  {m.submission_notes && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <p className="font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Latest Submission Note
                      </p>
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {renderSubmissionNotes(m.submission_notes)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deliverable Submission Modal */}
      {activeMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              Submit Deliverable: {activeMilestone.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Describe the work completed, link your code/repositories, design artifacts, or deliverables for client inspection.
            </p>

            <form onSubmit={handleSubmitDeliverable} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-700" />
                  GitHub Repository / Deliverable URL (Optional)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Direct link to your Git repository, branch, PR, or deliverable.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Submission Notes & Deliverable Details
                </label>
                <textarea
                  rows={4}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Describe the completed work, testing results, or specific instructions for the client..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
                ></textarea>
                <p className="text-[11px] text-slate-400 mt-1">
                  Provide either a GitHub URL, submission notes, or both.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveMilestone(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit to Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          projectId={contract.project_id}
          revieweeId={contract.client_id}
          revieweeName={contract.client?.name}
          onSuccess={() => {
            fetchContract();
          }}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contractsApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import ReviewModal from '../../components/ReviewModal';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  DollarSign, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  Star,
  Send,
  Github,
  ExternalLink
} from 'lucide-react';

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

export default function ClientContractDetailsPage() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // New Milestone state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await contractsApi.getById(id);
      if (res.success) setContract(res.data);
    } catch (err) {
      toast.error('Failed to load contract details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!newAmount || parseFloat(newAmount) <= 0) {
      toast.error('Milestone amount must be positive.');
      return;
    }

    try {
      setProcessingId('create');
      const res = await contractsApi.createMilestone(contract.id, {
        title: newTitle,
        description: newDesc,
        amount: parseFloat(newAmount),
        dueDate: newDueDate || undefined,
      });
      if (res.success) {
        toast.success('Milestone created.');
        setShowAddMilestone(false);
        setNewTitle('');
        setNewDesc('');
        setNewAmount('');
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create milestone.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFundEscrow = async (milestoneId) => {
    try {
      setProcessingId(milestoneId);
      const res = await contractsApi.fundEscrow(milestoneId);
      if (res.success) {
        toast.success(res.message);
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Escrow funding failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (milestoneId) => {
    try {
      setProcessingId(milestoneId);
      const res = await contractsApi.approveMilestone(milestoneId);
      if (res.success) {
        toast.success('Milestone approved! You can now release payment.');
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Approval failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (milestoneId) => {
    const reason = prompt('Please specify the required revisions:');
    if (!reason) return;

    try {
      setProcessingId(milestoneId);
      const res = await contractsApi.rejectMilestone(milestoneId, { reason });
      if (res.success) {
        toast.success('Milestone sent back for revisions.');
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReleasePayment = async (milestoneId) => {
    if (!window.confirm('Release payment for this milestone? This executes the ADBMS release_milestone_payment() stored procedure.')) {
      return;
    }

    try {
      setProcessingId(milestoneId);
      const res = await contractsApi.releasePayment(milestoneId);
      if (res.success) {
        toast.success(res.message);
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Payment release failed.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteContract = async () => {
    if (!window.confirm('Mark this contract as completed? All milestones must be PAID.')) {
      return;
    }

    try {
      setProcessingId('complete');
      const res = await contractsApi.complete(contract.id);
      if (res.success) {
        toast.success(res.message);
        fetchContract();
      }
    } catch (err) {
      toast.error(err.message || 'Contract completion failed.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center py-24">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-medium">Loading contract workspace...</p>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  const allMilestonesPaid = contract.milestones?.length > 0 && contract.milestones.every((m) => m.status === 'PAID');
  const hasReviewed = contract.reviews?.some((r) => r.reviewer_id === contract.client_id);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-5xl overflow-y-auto">
        
        <div>
          <Link to="/client/contracts" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Contracts
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    contract.status === 'ACTIVE'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {contract.status}
                </span>
                <span className="text-xs text-slate-400">Contract #{contract.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{contract.projects.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {contract.status === 'ACTIVE' && allMilestonesPaid && (
                <button
                  disabled={processingId === 'complete'}
                  onClick={handleCompleteContract}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Complete Contract
                </button>
              )}

              {contract.status === 'COMPLETED' && !hasReviewed && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <Star className="w-4 h-4 fill-white" />
                  Leave Review
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contract Summary Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Hired Specialist:</span>
            <span className="font-bold text-slate-900 text-sm">
              {contract.users_contracts_freelancer_idTousers.name}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Agreed Budget:</span>
            <span className="font-bold text-indigo-700 text-sm">
              ${parseFloat(contract.agreed_amount).toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Started Date:</span>
            <span className="font-semibold text-slate-800">
              {new Date(contract.start_date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Escrow Security:</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Stored Procedure Protected
            </span>
          </div>
        </div>

        {/* Milestones Management Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Contract Milestones</h2>
              <p className="text-xs text-slate-500">Fund escrow, review submitted deliverables, and release payments</p>
            </div>
            {contract.status === 'ACTIVE' && (
              <button
                onClick={() => setShowAddMilestone(!showAddMilestone)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showAddMilestone ? 'Cancel' : 'Add Milestone'}</span>
              </button>
            )}
          </div>

          {/* Add Milestone Form */}
          {showAddMilestone && (
            <form onSubmit={handleCreateMilestone} className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">New Milestone Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Backend API Architecture & Database Indexes"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="500.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Description / Expected Deliverables</label>
                <textarea
                  rows="2"
                  placeholder="Outline acceptance criteria..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'create'}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          )}

          {/* Milestones List */}
          <div className="space-y-4">
            {contract.milestones?.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No milestones created for this contract yet.</p>
            ) : (
              contract.milestones?.map((m, index) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                        {m.description && <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-base font-extrabold text-slate-900">${parseFloat(m.amount).toFixed(2)}</span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : m.status === 'APPROVED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : m.status === 'SUBMITTED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : m.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>

                  {/* Submission Notes */}
                  {m.submission_notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-600 block mb-1">Freelancer Submission Notes & Deliverables:</span>
                      <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                        {renderSubmissionNotes(m.submission_notes)}
                      </div>
                    </div>
                  )}

                  {/* Milestone Actions for Client */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                    {/* Fund Escrow */}
                    {m.status === 'PENDING' && (
                      <button
                        disabled={processingId === m.id}
                        onClick={() => handleFundEscrow(m.id)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors"
                      >
                        {processingId === m.id ? 'Funding...' : 'Fund Escrow'}
                      </button>
                    )}

                    {/* Approve / Reject */}
                    {m.status === 'SUBMITTED' && (
                      <>
                        <button
                          disabled={processingId === m.id}
                          onClick={() => handleApprove(m.id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                        >
                          Approve Deliverables
                        </button>
                        <button
                          disabled={processingId === m.id}
                          onClick={() => handleReject(m.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg"
                        >
                          Request Revisions
                        </button>
                      </>
                    )}

                    {/* Release Payment (Calls Stored Procedure) */}
                    {m.status === 'APPROVED' && (
                      <button
                        disabled={processingId === m.id}
                        onClick={() => handleReleasePayment(m.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                      >
                        {processingId === m.id ? 'Releasing...' : 'Release Escrow Payment (Stored Proc)'}
                      </button>
                    )}

                    {m.status === 'PAID' && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Disbursed on {new Date(m.paid_at || m.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>

      {/* Review Modal */}
      <ReviewModal
        contract={contract}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSuccess={fetchContract}
      />
    </div>
  );
}

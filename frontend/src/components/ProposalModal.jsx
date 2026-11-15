import React, { useState } from 'react';
import { proposalsApi } from '../services/api';
import toast from 'react-hot-toast';
import { X, Send, DollarSign, Clock, FileText } from 'lucide-react';

export default function ProposalModal({ project, isOpen, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedAmount, setProposedAmount] = useState(project?.min_budget || 500);
  const [estimatedDays, setEstimatedDays] = useState(14);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (coverLetter.length < 30) {
      toast.error('Cover letter must be at least 30 characters.');
      return;
    }
    if (proposedAmount <= 0) {
      toast.error('Proposed amount must be positive.');
      return;
    }

    try {
      setSubmitting(true);
      await proposalsApi.submit({
        projectId: project.id,
        coverLetter,
        proposedAmount: parseFloat(proposedAmount),
        estimatedDays: parseInt(estimatedDays, 10),
      });
      toast.success('Proposal submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Submit Project Proposal</h3>
            <p className="text-xs text-slate-500 truncate max-w-sm">{project.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Project Budget Range:</span>
            <span className="font-bold text-indigo-700">
              ${parseFloat(project.min_budget).toFixed(2)} - ${parseFloat(project.max_budget).toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Proposed Bid ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Delivery (Days)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  min="1"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Letter & Proposal Details
            </label>
            <textarea
              required
              rows="5"
              placeholder="Explain why you are the ideal fit, your tech stack experience, and how you will tackle the milestones..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            ></textarea>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 30 characters</span>
              <span>{coverLetter.length} chars</span>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Submit Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

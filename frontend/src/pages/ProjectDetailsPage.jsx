import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projectsApi, proposalsApi, uploadApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProposalModal from '../components/ProposalModal';
import toast from 'react-hot-toast';
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  Briefcase, 
  User, 
  Star, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Sparkles, 
  ArrowLeft,
  Send,
  Building,
  Award,
  Paperclip,
  Upload,
  Download,
  FileText
} from 'lucide-react';


export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { user, isClient, isFreelancer } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [smartMatches, setSmartMatches] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'matching'
  const [loading, setLoading] = useState(true);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchProject();
    fetchAttachments();
  }, [id]);

  const fetchAttachments = async () => {
    try {
      const res = await uploadApi.getAttachments(id);
      if (res.success) {
        setAttachments(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load attachments:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingAttachment(true);
      const res = await uploadApi.uploadAttachment(id, formData);
      if (res.success) {
        toast.success('Document uploaded and attached successfully!');
        fetchAttachments();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload attachment');
    } finally {
      setUploadingAttachment(false);
    }
  };


  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.getById(id);
      if (res.success) {
        setProject(res.data);
        // If client owner, also fetch smart matches
        if (user && res.data.client_id === user.id) {
          fetchSmartMatches();
        }
      }
    } catch (err) {
      toast.error('Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartMatches = async () => {
    try {
      const res = await projectsApi.getSmartMatches(id);
      if (res.success) {
        setSmartMatches(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch smart matches:', err);
    }
  };

  const handleAcceptProposal = async (proposalId) => {
    if (!window.confirm('Accept this proposal? This executes the PostgreSQL stored procedure, rejecting other proposals and establishing a formal contract.')) {
      return;
    }

    try {
      setProcessingId(proposalId);
      const res = await proposalsApi.accept(proposalId);
      if (res.success) {
        toast.success(res.message);
        fetchProject();
        if (res.contract?.id) {
          navigate(`/client/contracts/${res.contract.id}`);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to accept proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectProposal = async (proposalId) => {
    try {
      setProcessingId(proposalId);
      await proposalsApi.reject(proposalId);
      toast.success('Proposal rejected.');
      fetchProject();
    } catch (err) {
      toast.error(err.message || 'Failed to reject proposal.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500 font-medium">Loading project specification...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Project Not Found</h2>
        <Link to="/projects" className="mt-4 text-xs font-semibold text-indigo-600 hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === project.client_id;
  const isClientOwner = isOwner;
  const hasApplied = !!project.myProposal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Main Project Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                {project.category_name}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  project.status === 'OPEN'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : project.status === 'IN_PROGRESS'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {project.status}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Tier: {project.experience_level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Action / Budget Highlights */}
          <div className="flex items-center gap-6 shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Budget Scope
              </span>
              <span className="text-xl font-extrabold text-slate-900">
                ${parseFloat(project.min_budget).toFixed(2)} - ${parseFloat(project.max_budget).toFixed(2)}
              </span>
            </div>

            {/* Freelancer Apply Button */}
            {isFreelancer && project.status === 'OPEN' && !hasApplied && (
              <button
                onClick={() => setProposalModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                <Send className="w-4 h-4" />
                Submit Proposal
              </button>
            )}

            {hasApplied && (
              <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                Proposal Submitted ({project.myProposal.status})
              </div>
            )}
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          
          {/* Left Column: Description & Skills */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Project Specification</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {project.required_skills?.map((s) => (
                  <span
                    key={s.id}
                    className="px-3 py-1 rounded-xl bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Project Attachments & Multer Upload */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-indigo-600" /> Project Attachments ({attachments.length})
                </h3>

                {isClientOwner && (
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingAttachment ? 'Uploading...' : 'Attach Document'}
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadingAttachment}
                    />
                  </label>
                )}
              </div>

              {attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files attached to this project.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {attachments.map((att) => (
                    <a
                      key={att.id}
                      href={`http://localhost:5000${att.file_path || att.file_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition group"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-700 truncate group-hover:text-indigo-600">
                          {att.file_name}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                        {(att.file_size / 1024).toFixed(0)} KB
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>


            {/* Project Deadlines & Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Delivery Deadline:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Pricing Model:</span>
                <span className="font-semibold text-slate-800">{project.project_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Proposal Activity:</span>
                <span className="font-semibold text-indigo-600">{project.proposal_count} received</span>
              </div>
            </div>
          </div>

          {/* Right Column: Client Profile Info */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 h-fit">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About the Client
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                {project.client_name?.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{project.client_name}</h4>
                <p className="text-xs text-slate-500">{project.company_name || 'Verified Business'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Spending:</span>
                <span className="font-bold text-slate-800">
                  ${parseFloat(project.total_spent || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Simulated Escrow Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CLIENT MANAGEMENT TABS (Visible to Project Owner) */}
      {/* ========================================================================= */}
      {isOwner && (
        <div className="space-y-6">
          <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
            <button
              onClick={() => setActiveTab('proposals')}
              className={`pb-3 transition-colors relative ${
                activeTab === 'proposals'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Proposals Received ({project.proposals?.length || 0})
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className={`pb-3 transition-colors flex items-center gap-1.5 relative ${
                activeTab === 'matching'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Smart Freelancer Matching (AI/ADBMS Algorithm)</span>
            </button>
          </div>

          {/* TAB 1: PROPOSALS RECEIVED */}
          {activeTab === 'proposals' && (
            <div className="space-y-4">
              {project.proposals?.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                  No proposals have been submitted for this project yet.
                </div>
              ) : (
                project.proposals?.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-base flex items-center justify-center shadow-xs">
                          {prop.freelancer_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{prop.freelancer_name}</h4>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {parseFloat(prop.average_rating || 5.0).toFixed(1)}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 font-medium">{prop.freelancer_title}</p>
                          <p className="text-[11px] text-slate-400">{prop.completed_projects_count} completed jobs • ${prop.hourly_rate}/hr</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Proposed Bid</span>
                          <span className="text-lg font-extrabold text-slate-900">${parseFloat(prop.proposed_amount).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Delivery</span>
                          <span className="text-xs font-bold text-slate-700">{prop.estimated_days} days</span>
                        </div>

                        {/* Proposal Actions */}
                        {prop.status === 'PENDING' && project.status === 'OPEN' && (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              disabled={processingId === prop.id}
                              onClick={() => handleAcceptProposal(prop.id)}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                            >
                              {processingId === prop.id ? 'Accepting...' : 'Accept & Hire'}
                            </button>
                            <button
                              disabled={processingId === prop.id}
                              onClick={() => handleRejectProposal(prop.id)}
                              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {prop.status !== 'PENDING' && (
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                              prop.status === 'ACCEPTED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {prop.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Cover Letter
                      </h5>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {prop.cover_letter}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SMART FREELANCER MATCHING */}
          {activeTab === 'matching' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-indigo-50 via-violet-50 to-white rounded-2xl border border-indigo-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Rule-Based Smart Matching Algorithm
                  </h4>
                  <p className="text-xs text-indigo-800/80 mt-0.5">
                    Scoring Weights: <strong>Skill Compatibility (50%)</strong> • <strong>Rating (20%)</strong> • <strong>Experience (15%)</strong> • <strong>Budget Compatibility (15%)</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartMatches.map((match) => (
                  <div
                    key={match.freelancerId}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {match.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{match.name}</h4>
                            <p className="text-xs text-indigo-600 font-medium">{match.title}</p>
                          </div>
                        </div>

                        {/* Overall Match Score Pill */}
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Score</span>
                          <span className="text-base font-extrabold text-indigo-700">
                            {match.matchScore}%
                          </span>
                        </div>
                      </div>

                      {/* 4-Factor Scoring Breakdown */}
                      <div className="mt-4 space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-slate-600">Skills ({match.matchingSkillsCount}/{match.totalRequiredSkills} matched):</span>
                            <span className="font-bold text-slate-800">{match.matchBreakdown.skillScore} / 50</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full rounded-full"
                              style={{ width: `${(match.matchBreakdown.skillScore / 50) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="text-slate-600">Rating ({match.averageRating}★):</span>
                            <span className="font-bold text-slate-800">{match.matchBreakdown.ratingScore} / 20</span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full"
                              style={{ width: `${(match.matchBreakdown.ratingScore / 20) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between text-[11px] pt-1">
                          <span className="text-slate-600">Experience ({match.experienceLevel}): <strong className="text-slate-800">{match.matchBreakdown.experienceScore} / 15</strong></span>
                          <span className="text-slate-600">Budget (${match.hourlyRate}/hr): <strong className="text-slate-800">{match.matchBreakdown.budgetScore} / 15</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <span className="text-slate-500">{match.completedProjectsCount} completed projects</span>
                      <span className="text-indigo-600 font-bold">Ranked #{smartMatches.indexOf(match) + 1} Candidate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Proposal Submission Modal */}
      <ProposalModal
        project={project}
        isOpen={proposalModalOpen}
        onClose={() => setProposalModalOpen(false)}
        onSuccess={fetchProject}
      />
    </div>
  );
}

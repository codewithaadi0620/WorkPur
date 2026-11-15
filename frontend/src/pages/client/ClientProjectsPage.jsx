import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import {
  Briefcase,
  Plus,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Trash2,
  Edit,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EditProjectModal from '../../components/EditProjectModal';

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectsApi.getClientProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseProject = async (id, title) => {
    if (!window.confirm(`Are you sure you want to close bidding on "${title}"?`)) return;
    try {
      const res = await projectsApi.update(id, { status: 'CLOSED' });
      if (res.success) {
        toast.success(`Project "${title}" closed successfully.`);
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to close project');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      const res = await projectsApi.delete(id);
      if (res.success) {
        toast.success('Project deleted successfully');
        fetchProjects();
      }
    } catch (err) {
      toast.error(err.message || 'Cannot delete project');
    }
  };


  const filteredProjects = projects.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your project postings, inspect received proposals, and hire freelancers.
          </p>
        </div>
        <Link
          to="/client/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Post New Project
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search my projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st} ({projects.filter((p) => (st === 'ALL' ? true : p.status === st)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-500" />
          <h3 className="text-base font-semibold text-slate-700">No projects found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {search || statusFilter !== 'ALL'
              ? 'No projects match your search and filter criteria.'
              : 'Post your first project to receive proposals and hire verified freelancers.'}
          </p>
          <Link
            to="/client/projects/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4" /> Post a Project
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
            if (project.status === 'OPEN') badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
            if (project.status === 'IN_PROGRESS') badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            if (project.status === 'COMPLETED') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const proposalCount = project._count?.proposals || project.proposals?.length || 0;

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${badgeStyle}`}>
                        {project.status}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Posted {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <Link
                      to={`/projects/${project.id}`}
                      className="text-lg font-bold text-slate-900 hover:text-indigo-600 mt-2 block transition"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-3xl">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Budget</p>
                      <p className="text-base font-extrabold text-slate-900">
                        ${Number(project.budget_min).toLocaleString()} - ${Number(project.budget_max).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400 font-medium">Proposals</p>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Users className="w-3.5 h-3.5" /> {proposalCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500">
                    Category:{' '}
                    <span className="font-semibold text-slate-700">
                      {project.categories?.name || 'General'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {project.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => setEditingProject(project)}
                          className="text-xs font-semibold text-slate-600 hover:text-indigo-600 p-1.5 transition flex items-center gap-1"
                          title="Edit Project"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleCloseProject(project.id, project.title)}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 p-1.5 transition flex items-center gap-1"
                          title="Close Bidding"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Close
                        </button>
                      </>
                    )}
                    {project.status === 'OPEN' && proposalCount === 0 && (
                      <button
                        onClick={() => handleDelete(project.id, project.title)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-700 p-1.5 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition"
                    >
                      View Details & Proposals <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onSuccess={fetchProjects}
        />
      )}
    </div>
  );
}

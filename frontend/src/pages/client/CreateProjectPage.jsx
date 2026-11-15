import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi, metaApi } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import toast from 'react-hot-toast';
import { 
  PlusCircle, 
  DollarSign, 
  Calendar, 
  Layers, 
  Sparkles, 
  Briefcase,
  CheckCircle,
  X
} from 'lucide-react';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [projectType, setProjectType] = useState('FIXED_PRICE');
  const [experienceLevel, setExperienceLevel] = useState('INTERMEDIATE');
  const [minBudget, setMinBudget] = useState(1000);
  const [maxBudget, setMaxBudget] = useState(2500);
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  useEffect(() => {
    Promise.all([metaApi.getCategories(), metaApi.getSkills()])
      .then(([catsRes, skillsRes]) => {
        if (catsRes.success) {
          setCategories(catsRes.data);
          if (catsRes.data[0]) setCategoryId(catsRes.data[0].id);
        }
        if (skillsRes.success) {
          setSkills(skillsRes.data);
          if (skillsRes.data[0]) setSelectedSkillIds([skillsRes.data[0].id]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const toggleSkill = (skillId) => {
    if (selectedSkillIds.includes(skillId)) {
      setSelectedSkillIds(selectedSkillIds.filter((id) => id !== skillId));
    } else {
      setSelectedSkillIds([...selectedSkillIds, skillId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (title.length < 5) {
      toast.error('Title must be at least 5 characters.');
      return;
    }
    if (description.length < 20) {
      toast.error('Description must be at least 20 characters.');
      return;
    }
    if (parseFloat(maxBudget) < parseFloat(minBudget)) {
      toast.error('Maximum budget must be greater than or equal to minimum budget.');
      return;
    }
    if (selectedSkillIds.length === 0) {
      toast.error('Please select at least one required skill.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await projectsApi.create({
        title,
        description,
        categoryId,
        projectType,
        experienceLevel,
        minBudget: parseFloat(minBudget),
        maxBudget: parseFloat(maxBudget),
        deadline,
        skillIds: selectedSkillIds,
      });

      if (res.success) {
        toast.success('Project created and published to marketplace!');
        navigate(`/projects/${res.data.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 sm:p-8 max-w-4xl space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Post a New Project</h1>
          <p className="text-xs text-slate-500 mt-1">
            Specify requirements, budget constraints, and skills for smart freelancer matching
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Project Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Project Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Senior Full-Stack Node.js & React Architect for Financial Analytics Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Category & Project Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Industry Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Project Billing Model
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="FIXED_PRICE">Fixed Price (Milestone Escrow)</option>
                <option value="HOURLY">Hourly Rate</option>
              </select>
            </div>
          </div>

          {/* Experience Level & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Required Experience Tier
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="ENTRY">Entry Level (Junior)</option>
                <option value="INTERMEDIATE">Intermediate (Mid-Level)</option>
                <option value="EXPERT">Expert Level (Senior / Lead Architect)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Completion Deadline
              </label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Minimum Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  required
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maximum Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="1"
                  required
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white font-bold"
                />
              </div>
            </div>
          </div>

          {/* Skills Multi-Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Required Skills (Used for Smart Matching)
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.includes(skill.id);
                return (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {skill.name} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Project Scope & Deliverables
            </label>
            <textarea
              required
              rows="6"
              placeholder="Outline project deliverables, architecture requirements, database expectations, expected milestones, and timeline constraints..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            ></textarea>
          </div>

          {/* Submit button */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/client')}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish Project'}</span>
            </button>
          </div>
        </form>

      </main>
    </div>
  );
}

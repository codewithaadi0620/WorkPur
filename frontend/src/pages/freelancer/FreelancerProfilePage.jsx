import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { metaApi, authApi, uploadApi } from '../../services/api';
import { User, Briefcase, DollarSign, Globe, Award, Check, Sparkles, Camera, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FreelancerProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [allSkills, setAllSkills] = useState([]);


  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    hourlyRate: '',
    experienceLevel: 'EXPERT',
    portfolioUrl: '',
    availability: 'AVAILABLE',
    skillIds: [],
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const skillsRes = await metaApi.getSkills();
      if (skillsRes.success) {
        setAllSkills(skillsRes.data || []);
      }

      if (user) {
        const fp = user.freelancer_profiles;
        const currentSkillIds = fp?.freelancer_skills?.map((fs) => fs.skill_id) || [];

        setFormData({
          name: user.name || '',
          title: fp?.title || '',
          bio: fp?.bio || '',
          hourlyRate: fp?.hourly_rate ? Number(fp.hourly_rate) : 50,
          experienceLevel: fp?.experience_level || 'EXPERT',
          portfolioUrl: fp?.portfolio_url || '',
          availability: fp?.availability || 'AVAILABLE',
          skillIds: currentSkillIds,
        });
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId) => {
    setFormData((prev) => {
      const exists = prev.skillIds.includes(skillId);
      if (exists) {
        return { ...prev, skillIds: prev.skillIds.filter((id) => id !== skillId) };
      } else {
        return { ...prev, skillIds: [...prev.skillIds, skillId] };
      }
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const res = await uploadApi.uploadAvatar(form);
      if (res.success) {
        toast.success('Profile avatar updated successfully!');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    try {
      setSaving(true);
      const res = await metaApi.updateProfile({
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        experienceLevel: formData.experienceLevel,
        portfolioUrl: formData.portfolioUrl,
        availability: formData.availability,
        skillIds: formData.skillIds,
      });

      if (res.success) {
        toast.success('Freelancer profile updated successfully!');
        if (refreshUser) refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Freelancer Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Your profile determines your smart matching score when clients search for experts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" /> General Information
          </h2>

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-5 pb-4 border-b border-slate-100">
            <div className="relative group">
              <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl overflow-hidden border border-slate-200">
                {user?.avatar_url ? (
                  <img
                    src={`http://localhost:5000${user.avatar_url}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  formData.name?.[0] || 'U'
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow cursor-pointer transition">
                <Camera className="w-3.5 h-3.5" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Profile Photo</p>
              <p className="text-[11px] text-slate-400">
                {uploadingAvatar ? 'Uploading image...' : 'JPG, PNG or WebP. Max 10MB.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Professional Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Full-Stack Engineer & Database Architect"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Biography & Summary
            </label>
            <textarea
              rows={4}
              required
              placeholder="Tell clients about your technical background, database optimization skills, architecture expertise..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            ></textarea>
          </div>
        </div>

        {/* Rate, Experience & Availability */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Rates & Availability
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Hourly Rate ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  min="5"
                  step="1"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="ENTRY">Entry Level (0-2 yrs)</option>
                <option value="INTERMEDIATE">Intermediate (2-5 yrs)</option>
                <option value="EXPERT">Expert (5+ yrs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Availability
              </label>
              <select
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="AVAILABLE">Available for Work</option>
                <option value="BUSY">Busy</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Portfolio / GitHub URL
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                placeholder="https://github.com/your-username"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Technical Skills
            </h2>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              {formData.skillIds.length} selected
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Click to toggle skills you specialize in. These are matched with project requirements using our Smart Matching Algorithm.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {allSkills.map((s) => {
              const selected = formData.skillIds.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition flex items-center gap-1.5 ${
                    selected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {selected && <Check className="w-3.5 h-3.5" />}
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

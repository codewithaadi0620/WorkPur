import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { metaApi, projectsApi, analyticsApi } from '../services/api';
import { 
  Briefcase, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  ShieldCheck, 
  Zap, 
  Users, 
  Layers, 
  DollarSign, 
  Database,
  Award
} from 'lucide-react';

export default function LandingPage() {
  const [categories, setCategories] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalProjects: 20,
    totalFreelancers: 10,
    totalVolume: 5700,
    satisfactionRate: 99,
  });
  const navigate = useNavigate();

  useEffect(() => {
    metaApi.getCategories()
      .then((res) => {
        if (res.success) setCategories(res.data);
      })
      .catch(() => {});

    analyticsApi.getAdminAnalytics()
      .then((res) => {
        if (res.success) {
          setTopFreelancers(res.data.topFreelancers || []);
          if (res.data.summary) {
            setStats({
              totalProjects: res.data.summary.total_projects,
              totalFreelancers: res.data.summary.total_freelancers,
              totalVolume: res.data.summary.total_volume_released,
              satisfactionRate: 99,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 pt-16 pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-semibold mb-6 shadow-xs border border-indigo-200">
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span>ADBMS Relational Architecture • PostgreSQL 18 Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Connect with World-Class Freelance Talent on{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              FreelanceHub
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Enterprise freelance marketplace featuring rule-based smart matching, atomic escrow transactions, and PostgreSQL stored procedures for rigorous contract lifecycle management.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-indigo-100 border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search projects (e.g., React, PostgreSQL, E-Commerce, Kubernetes)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm text-slate-800 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md transition-all shrink-0"
              >
                Search Projects
              </button>
            </div>
          </form>

          {/* Quick Category Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Trending:</span>
            {categories.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                to={`/projects?categoryId=${cat.id}`}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-center border-r border-slate-100 last:border-0">
            <div className="text-3xl font-extrabold text-indigo-600">20+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Active Projects
            </div>
          </div>
          <div className="text-center border-r border-slate-100 last:border-0">
            <div className="text-3xl font-extrabold text-indigo-600">10+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Verified Freelancers
            </div>
          </div>
          <div className="text-center border-r border-slate-100 last:border-0">
            <div className="text-3xl font-extrabold text-indigo-600">
              ${parseFloat(stats.totalVolume || 5700).toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Simulated Payments Released
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-extrabold text-indigo-600">100%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">
              ACID Transaction Safety
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            How FreelanceHub Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A transparent, transaction-safe workflow for both clients and freelancers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-800">Post & Discover</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Clients publish detailed projects with required skills and budget caps. Freelancers browse listings and submit competitive proposals with cover letters and timelines.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center font-bold text-base mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-800">Smart Match & Escrow</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Our 4-factor smart algorithm matches talent by skills (50%), rating (20%), experience (15%), and budget (15%). When accepted, atomic procedures lock the contract and fund milestone escrow.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-base mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-800">Milestone Release & Reviews</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Freelancers submit work deliverables. Upon client approval, stored procedures disburse payments from escrow to the freelancer's wallet. Review ratings update dynamically via database triggers.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FEATURED CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explore Project Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Browse top projects by engineering discipline
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/projects?categoryId=${cat.id}`}
              className="group p-5 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all shadow-xs hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                {cat.description}
              </p>
              <div className="mt-3 text-[10px] font-semibold text-indigo-600">
                {cat._count?.projects || 2} Active Projects →
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. TOP FREELANCERS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Top Rated Engineering Specialists
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verified specialists with high client satisfaction and proven deliverables
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topFreelancers.slice(0, 6).map((free) => (
            <div
              key={free.user_id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-base flex items-center justify-center shadow-sm">
                      {free.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{free.name}</h3>
                      <p className="text-xs text-indigo-600 font-medium">{free.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-amber-800 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{parseFloat(free.average_rating || 5.0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 border-t border-b border-slate-100 py-2.5">
                  <span>Rate: <strong className="text-slate-900">${free.hourly_rate}/hr</strong></span>
                  <span>Completed: <strong className="text-slate-900">{free.completed_projects_count} jobs</strong></span>
                  <span>Level: <strong className="text-indigo-600">{free.experience_level}</strong></span>
                </div>

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {free.skills?.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3">
                <Link
                  to="/projects"
                  className="w-full text-center block py-2 rounded-xl border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-xs font-bold transition-colors"
                >
                  View Profile & Hire
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TESTIMONIALS */}
      <section className="bg-slate-900 text-white py-16 -mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight">Client & Freelancer Testimonials</h2>
            <p className="text-xs text-slate-400 mt-1">Real feedback from clients and developers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The milestone escrow protection gave us 100% peace of mind. We hired a senior database engineer and our PostgreSQL query latency dropped by 80%."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700 text-xs">
                <p className="font-bold text-white">Acme Global Ventures</p>
                <p className="text-[11px] text-slate-400">Enterprise Client</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The smart matching feature directed high-budget enterprise projects directly to my dashboard. Once client approved milestones, funds released instantly."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700 text-xs">
                <p className="font-bold text-white">Alex Rivera</p>
                <p className="text-[11px] text-slate-400">Full-Stack Architect</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "The ADBMS architecture is transparent and rock-solid. From atomic proposal acceptance to audit trail tracking, everything functions with zero race conditions."
              </p>
              <div className="mt-4 pt-3 border-t border-slate-700 text-xs">
                <p className="font-bold text-white">TechStart Labs</p>
                <p className="text-[11px] text-slate-400">Startup Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

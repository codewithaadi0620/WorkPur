import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SecurityCaptcha from '../../components/SecurityCaptcha';
import { Briefcase, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const captchaRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!captchaRef.current?.validate()) {
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'CLIENT') {
        navigate('/client', { replace: true });
      } else {
        navigate('/freelancer', { replace: true });
      }
    } catch (err) {
      captchaRef.current?.refresh();
      // handled by AuthContext toast
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('password123');
    captchaRef.current?.autoVerify();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-200">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Welcome to FreelanceHub
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Sign in to manage your projects, contracts, and talent
          </p>
        </div>

        {/* Demo Accounts Quick-Select Card */}
        <div className="mt-6 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-indigo-900 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Quick Demo Access: One-Click Test Accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@freelancehub.com', 'ADMIN')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-900 text-center transition-colors shadow-xs"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('acme.corp@example.com', 'CLIENT')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-900 text-center transition-colors shadow-xs"
            >
              💼 Client (Acme)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('alex.fullstack@example.com', 'FREELANCER')}
              className="px-2 py-1.5 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-lg text-[11px] font-bold text-indigo-900 text-center transition-colors shadow-xs"
            >
              ⚡ Freelancer (Alex)
            </button>
          </div>
          <p className="text-[10px] text-indigo-700/80 text-center mt-2">
            Password: <span className="font-mono font-bold">password123</span> (pre-filled on click)
          </p>
        </div>

        {/* Main Card */}
        <div className="mt-4 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Anti-Bot Security Captcha */}
            <SecurityCaptcha ref={captchaRef} />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign in to Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

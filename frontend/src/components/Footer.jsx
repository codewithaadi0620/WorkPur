import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShieldCheck, CheckCircle2, Lock, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-950">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                FreelanceHub
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier marketplace connecting high-growth businesses with verified freelance engineering, design, and product talent worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/80 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Escrow Protection</span>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Clients
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/client/projects/new" className="hover:text-white transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Browse Specialists
                </Link>
              </li>
              <li>
                <Link to="/client/contracts" className="hover:text-white transition-colors">
                  Contract Management
                </Link>
              </li>
              <li>
                <Link to="/client/wallet" className="hover:text-white transition-colors">
                  Escrow & Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              For Freelancers
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Find Work
                </Link>
              </li>
              <li>
                <Link to="/freelancer/proposals" className="hover:text-white transition-colors">
                  Submit Proposals
                </Link>
              </li>
              <li>
                <Link to="/freelancer/wallet" className="hover:text-white transition-colors">
                  Earnings & Payouts
                </Link>
              </li>
              <li>
                <Link to="/freelancer/profile" className="hover:text-white transition-colors">
                  Profile & Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Trust & Security
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Milestone-based Escrow Releases</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Identity & Skill Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Audited Transaction Integrity</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Global Multi-Currency Ledger</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FreelanceHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 transition-colors cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

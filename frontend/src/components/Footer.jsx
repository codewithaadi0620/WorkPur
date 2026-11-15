import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Database, ShieldCheck, Github, Code, Layers } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                FreelanceHub
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Enterprise Freelance Marketplace Management System built for Advanced Database Management Systems (ADBMS). Powered by PostgreSQL 18, ACID transactions, and rule-based smart matching.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700 w-fit">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>PostgreSQL 18 Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Platform Features
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Client Direct Hiring
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Freelancer Discovery
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Smart Skill Match
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Escrow Simulated Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* ADBMS Architecture Modules */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              ADBMS Modules
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-indigo-400" />
                <span>PL/pgSQL Stored Procedures</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Analytical Views & MatViews</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Automatic Triggers & Audits</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Composite B-Tree Indexes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Pessimistic Row Locking</span>
              </li>
            </ul>
          </div>

          {/* Academic Project Credits */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Academic Project
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Advanced Database Management Systems (ADBMS) Project. Demonstrating Relational Normalization (3NF), ACID compliance, and concurrency controls.
            </p>
            <a
              href="http://localhost:5000/uploads/FreelanceHub_ADBMS_Report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow transition"
            >
              📄 Download ADBMS Report (PDF)
            </a>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FreelanceHub ADBMS. Genuine full-stack implementation.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400 font-medium">Node.js • Express • PostgreSQL 18 • React</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

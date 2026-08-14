import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, Building2, Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
          Enterprise SaaS
        </span>
        <span className="text-slate-600">/</span>
        <h2 className="text-lg font-bold text-white tracking-tight">{getBreadcrumb()}</h2>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-4">
        {/* Quick Action Button */}
        <Link
          to="/lead-generation"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Lead Scrape</span>
        </Link>

        {/* Company Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-xs">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-200">{user?.company?.name || 'Company'}</span>
        </div>

        {/* Security / Sanctum badge */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sanctum Secured</span>
        </div>
      </div>
    </header>
  );
}

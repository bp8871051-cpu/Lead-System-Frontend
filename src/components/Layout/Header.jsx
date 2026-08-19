import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Sparkles, Building2, ShieldCheck, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onToggleSidebar }) {
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
    <header className="h-16 glass-panel border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 w-full">
      {/* Title / Hamburger / Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden md:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
          Enterprise SaaS
        </span>
        <span className="hidden md:inline-block text-slate-600">/</span>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
          {getBreadcrumb()}
        </h2>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Action Button */}
        <Link
          to="/lead-generation"
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Lead Scrape</span>
          <span className="xs:hidden">Scrape</span>
        </Link>

        {/* Company Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300 text-xs max-w-[140px] md:max-w-[200px]">
          <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate">{user?.company?.name || 'Company'}</span>
        </div>

        {/* Security / Sanctum badge */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sanctum Secured</span>
        </div>
      </div>
    </header>
  );
}

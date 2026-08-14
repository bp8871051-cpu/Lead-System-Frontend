import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Globe,
  GlobeX,
  Sparkles,
  Send,
  AlertTriangle,
  TrendingUp,
  Award,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { dashboardApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading Enterprise Dashboard Metrics...</p>
      </div>
    );
  }

  const s = stats?.summary || {};

  const summaryCards = [
    { label: 'Total Leads', value: s.total_leads || 0, icon: Users, color: 'from-indigo-500 to-indigo-600', textColor: 'text-indigo-400' },
    { label: 'New Leads', value: s.new_leads || 0, icon: UserPlus, color: 'from-blue-500 to-cyan-500', textColor: 'text-cyan-400' },
    { label: 'Leads with Email', value: s.leads_with_email || 0, icon: Mail, color: 'from-emerald-500 to-teal-600', textColor: 'text-emerald-400' },
    { label: 'Leads with Phone', value: s.leads_with_mobile || 0, icon: Phone, color: 'from-purple-500 to-pink-600', textColor: 'text-purple-400' },
    { label: 'Has Website', value: s.leads_with_website || 0, icon: Globe, color: 'from-sky-500 to-blue-600', textColor: 'text-sky-400' },
    { label: 'No Website (Target)', value: s.leads_no_website || 0, icon: GlobeX || Globe, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400' },
    { label: 'Emails Generated', value: s.emails_generated || 0, icon: Sparkles, color: 'from-fuchsia-500 to-pink-500', textColor: 'text-fuchsia-400' },
    { label: 'Emails Sent', value: s.emails_sent || 0, icon: Send, color: 'from-indigo-500 to-purple-600', textColor: 'text-indigo-400' },
    { label: 'Emails Failed', value: s.emails_failed || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-600', textColor: 'text-red-400' },
    { label: 'Response Rate', value: `${s.response_rate || 0}%`, icon: TrendingUp, color: 'from-emerald-500 to-teal-500', textColor: 'text-emerald-400' },
    { label: 'Conversion Rate', value: `${s.conversion_rate || 0}%`, icon: Award, color: 'from-amber-500 to-yellow-500', textColor: 'text-amber-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Executive Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Real-Time
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pipeline performance, scraping telemetry, and email campaign analytics.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-card p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 truncate">{card.label}</span>
                <div className={`p-2 rounded-lg bg-slate-900/60 ${card.textColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-bold text-white tracking-tight">{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Growth Trend (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Lead Generation Growth</h3>
              <p className="text-xs text-slate-400">Daily lead acquisition velocity (Last 7 Days)</p>
            </div>
            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Live Trend
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.growth || []}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Donut Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Lead Source Mix</h3>
            <p className="text-xs text-slate-400">Distribution by acquisition channel</p>
          </div>
          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.sources || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.sources || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {(stats?.sources || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts: Website Status & Email Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Availability Breakdown */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Website Availability Audit</h3>
            <p className="text-xs text-slate-400">Identified leads by web presence readiness</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.website_breakdown || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(stats?.website_breakdown || []).map((entry, index) => (
                    <Cell key={`web-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Email Funnel Status */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white">Outreach Email Pipeline</h3>
            <p className="text-xs text-slate-400">Generation vs Dispatch vs Response conversion</p>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.email_breakdown || []}>
                <XAxis dataKey="status" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {(stats?.email_breakdown || []).map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Sparkles, Award, Globe, Users } from 'lucide-react';
import { dashboardApi } from '../api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then((res) => {
      if (res.data?.success) setStats(res.data.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="py-20 text-center text-slate-500">Loading Analytics Telemetry...</div>;

  const s = stats?.summary || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Performance & Conversion Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Deep analysis of lead acquisition, web presence targets, and outreach effectiveness.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Website Acquisition Index</p>
          <p className="text-3xl font-bold text-white">{s.leads_no_website || 0}</p>
          <p className="text-xs text-amber-400 font-semibold">High-Value Target Leads (No Website)</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Outreach Response Rate</p>
          <p className="text-3xl font-bold text-emerald-400">{s.response_rate || 0}%</p>
          <p className="text-xs text-slate-400">Total Replies vs Dispatched Emails</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 text-center space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Final Conversion Rate</p>
          <p className="text-3xl font-bold text-indigo-400">{s.conversion_rate || 0}%</p>
          <p className="text-xs text-slate-400">Won Clients vs Total Contacted</p>
        </div>
      </div>
    </div>
  );
}

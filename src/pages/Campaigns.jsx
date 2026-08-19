import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Play, Pause, Trash2, Mail, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { campaignApi, emailApi, leadApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [availableLeads, setAvailableLeads] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    service: 'Website Development',
    email_template_id: '',
    daily_sending_limit: 100,
    sending_provider: 'smtp',
    lead_ids: [],
  });

  const toast = useToast();

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await campaignApi.getCampaigns();
      if (res.data?.success) {
        setCampaigns(res.data.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const openCreateModal = async () => {
    setCreateModal(true);
    try {
      const [tmplRes, leadRes] = await Promise.all([
        emailApi.getTemplates(),
        leadApi.getLeads({ per_page: 100, has_email: 'yes' }),
      ]);
      if (tmplRes.data?.success) setTemplates(tmplRes.data.data || []);
      if (leadRes.data?.success) setAvailableLeads(leadRes.data.data.data || []);
    } catch (err) {
      toast.error('Failed to load setup data');
    }
  };

  const handleStartCampaign = async (id) => {
    try {
      await campaignApi.startCampaign(id);
      toast.success('Campaign launched! Queued dispatch jobs created.');
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to start campaign');
    }
  };

  const handlePauseCampaign = async (id) => {
    try {
      await campaignApi.pauseCampaign(id);
      toast.success('Campaign paused.');
      fetchCampaigns();
    } catch (err) {
      toast.error('Failed to pause campaign');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.lead_ids.length === 0) {
      return toast.error('Please select at least one lead for outreach');
    }
    try {
      const res = await campaignApi.createCampaign(formData);
      if (res.data?.success) {
        toast.success('Outreach Campaign created successfully!');
        setCreateModal(false);
        fetchCampaigns();
      }
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Outreach Campaigns</h1>
          <p className="text-sm text-slate-400 mt-1">
            Build and monitor automated email dispatch campaigns across segments of leads.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="col-span-full glass-panel p-12 rounded-2xl text-center text-slate-500">
            <Megaphone className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="font-semibold text-slate-300">No Outreach Campaigns Created</p>
            <p className="text-xs mt-1">Click "New Campaign" to create your first scheduled campaign.</p>
          </div>
        ) : (
          campaigns.map((c) => (
            <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                    c.status === 'running'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse'
                      : c.status === 'paused'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {c.status}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Limit: {c.daily_sending_limit}/day</span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base">{c.name}</h3>
                <p className="text-xs text-indigo-300 font-medium mt-0.5">{c.service || 'Outreach Offer'}</p>
              </div>

              {/* Campaign Stats */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Leads</p>
                  <p className="font-bold text-white mt-0.5">{c.total_leads}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 font-semibold uppercase">Sent</p>
                  <p className="font-bold text-emerald-400 mt-0.5">{c.sent_count}</p>
                </div>
                <div>
                  <p className="text-[10px] text-red-400 font-semibold uppercase">Failed</p>
                  <p className="font-bold text-red-400 mt-0.5">{c.failed_count}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                {c.status === 'running' ? (
                  <button
                    onClick={() => handlePauseCampaign(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartCampaign(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
                  >
                    <Play className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>Start Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Create Campaign */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-white">Create New Outreach Campaign</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Q3 Web Dev Outreach - Ahmedabad"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Service</label>
                <input
                  type="text"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  placeholder="Website Development"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Email Template (Optional)</label>
                <select
                  value={formData.email_template_id}
                  onChange={(e) => setFormData({ ...formData, email_template_id: e.target.value })}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900"
                >
                  <option value="">AI Dynamic Personalization (Recommended)</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Target Leads ({formData.lead_ids.length} selected)</label>
                <div className="max-h-40 overflow-y-auto p-2 glass-card rounded-xl space-y-1">
                  {availableLeads.map((l) => (
                    <label key={l.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={formData.lead_ids.includes(l.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, lead_ids: [...formData.lead_ids, l.id] });
                          } else {
                            setFormData({ ...formData, lead_ids: formData.lead_ids.filter((i) => i !== l.id) });
                          }
                        }}
                      />
                      <span>{l.business_name} ({l.email})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

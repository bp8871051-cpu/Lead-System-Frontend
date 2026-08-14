import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Cpu, Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { settingsApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const [settings, setSettings] = useState({
    apify_api_token: '',
    apify_actor_id: 'compass/google-maps-extractor',
    ai_provider: 'openrouter',
    ai_api_key: '',
    ai_model: 'google/gemini-2.5-flash',
    brevo_api_key: '',
    smtp_host: 'smtp.brevo.com',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_email: 'outreach@leadsystem.com',
    smtp_from_name: 'LeadSystem CRM',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);

  const toast = useToast();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getSettings();
      if (res.data?.success && res.data.data) {
        setSettings((prev) => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      toast.error('Failed to load system integration settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.updateSettings(settings);
      if (res.data?.success) {
        toast.success('System Integration & Email Settings updated successfully!');
      }
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmail.trim()) {
      toast.error('Please enter a target test email address.');
      return;
    }

    setTesting(true);
    try {
      const res = await settingsApi.testEmail({
        test_email: testEmail,
        provider: settings.brevo_api_key ? 'brevo' : 'smtp',
      });
      if (res.data?.success) {
        toast.success(res.data.message || `Test email dispatched to ${testEmail}! Check your inbox.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email. Check your SMTP/Brevo credentials.');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-slate-500">Loading Integration Settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System & Email Settings</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure Brevo API or SMTP credentials to send real outreach emails to recipient inboxes.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Brevo & Real SMTP Email Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Email Dispatch Setup (Brevo API or Custom SMTP)
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              Real Inbox Delivery Engine
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Option A: Brevo API Key (v3)
              </label>
              <input
                type="password"
                value={settings.brevo_api_key || ''}
                onChange={(e) => setSettings({ ...settings, brevo_api_key: e.target.value })}
                placeholder="xkeysib-••••••••••••"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono text-emerald-300"
              />
              <p className="text-[10px] text-slate-500 mt-1">Free 300 emails/day from Brevo. Get key at brevo.com</p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <p className="text-xs font-bold text-white mb-3">Option B: Custom SMTP Server (Gmail / Outlook / cPanel / Mailgun)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtp_host || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="e.g. smtp.gmail.com or smtp.brevo.com"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtp_port || 587}
                    onChange={(e) => setSettings({ ...settings, smtp_port: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Username / Email</label>
                  <input
                    type="text"
                    value={settings.smtp_username || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                    placeholder="your-email@gmail.com"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Password / App Password</label>
                  <input
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">From Sender Email</label>
                  <input
                    type="email"
                    value={settings.smtp_from_email || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                    placeholder="outreach@yourdomain.com"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">From Sender Name</label>
                  <input
                    type="text"
                    value={settings.smtp_from_name || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                    placeholder="LeadSystem CRM"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Email Dispatch Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-400" />
            Test Real Email Inbox Delivery
          </h2>
          <p className="text-xs text-slate-400">
            Enter your personal email address below to send a test email and verify that emails arrive in your real inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter your email ID (e.g. test@gmail.com)"
              className="flex-1 glass-input px-3.5 py-2.5 rounded-xl text-xs text-teal-300 font-bold"
            />
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs shadow-lg shadow-teal-500/20 shrink-0 flex items-center justify-center gap-2"
            >
              {testing ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
              <span>{testing ? 'Sending Test...' : 'Send Test Email Now'}</span>
            </button>
          </div>
        </div>

        {/* Apify & AI Config */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-400" />
            Apify & AI Scraping Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Apify API Token</label>
              <input
                type="password"
                value={settings.apify_api_token || ''}
                onChange={(e) => setSettings({ ...settings, apify_api_token: e.target.value })}
                placeholder="apify_api_••••••••••••"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">AI API Key (OpenRouter/Gemini)</label>
              <input
                type="password"
                value={settings.ai_api_key || ''}
                onChange={(e) => setSettings({ ...settings, ai_api_key: e.target.value })}
                placeholder="sk-or-v1-••••••••••••"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

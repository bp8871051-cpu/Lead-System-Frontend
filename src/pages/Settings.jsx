import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Key, Cpu, Mail, Send, CheckCircle2, AlertCircle, ShieldCheck, ExternalLink, Info } from 'lucide-react';
import { settingsApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const [settings, setSettings] = useState({
    apify_api_token: '',
    apify_actor_id: 'compass/google-maps-extractor',
    ai_provider: 'openrouter',
    ai_api_key: '',
    ai_model: 'google/gemini-2.5-flash',
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_username: 'sumedha.blueboxx@gmail.com',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_email: 'sumedha.blueboxx@gmail.com',
    smtp_from_name: 'Sumedha | Blueboxx',
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
        toast.success('Gmail SMTP & System Integration settings saved successfully!');
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
      });
      if (res.data?.success) {
        toast.success(res.data.message || `Test email dispatched to ${testEmail}! Check your inbox.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send test email. Check your Gmail SMTP credentials.');
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
            Configure Gmail SMTP with STARTTLS (Port 587) to send outreach emails directly from your Gmail account.
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
        {/* Gmail SMTP Email Configuration */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-400" />
              Gmail SMTP Dispatch Setup (STARTTLS / Port 587)
            </h2>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Secure SMTP Transport
            </span>
          </div>

          {/* Google App Password Guide Banner */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-slate-300">
              <p className="font-semibold text-white">Using Gmail SMTP with Google App Password:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-400">
                <li>Enable <strong className="text-slate-200">2-Step Verification</strong> on your Google account.</li>
                <li>Go to <strong className="text-slate-200">Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords</strong>.</li>
                <li>Create an App Password (e.g. name it "LeadSystem CRM") and copy the 16-character key into the SMTP Password field below.</li>
                <li>Do NOT use your normal Gmail personal password.</li>
              </ol>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Host</label>
              <input
                type="text"
                value={settings.smtp_host || 'smtp.gmail.com'}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono text-emerald-300"
              />
              <p className="text-[10px] text-slate-500 mt-1">Default: smtp.gmail.com</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">SMTP Port</label>
              <input
                type="number"
                value={settings.smtp_port || 587}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || 587 })}
                placeholder="587"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">Default: 587 (STARTTLS)</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Gmail Address / Username</label>
              <input
                type="email"
                value={settings.smtp_username || ''}
                onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                placeholder="info.blueboxx@gmail.com"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">16-Character Google App Password</label>
              <input
                type="password"
                value={settings.smtp_password || ''}
                onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                placeholder="iiwg dsnc xyrl wnnm"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">From Sender Email</label>
              <input
                type="email"
                value={settings.smtp_from_email || ''}
                onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                placeholder="info.blueboxx@gmail.com"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">From Sender Name</label>
              <input
                type="text"
                value={settings.smtp_from_name || ''}
                onChange={(e) => setSettings({ ...settings, smtp_from_name: e.target.value })}
                placeholder="Your Company Name"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Test Email Dispatch Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-400" />
            Test Gmail SMTP Inbox Delivery
          </h2>
          <p className="text-xs text-slate-400">
            Enter your personal email address below to send a live test email and verify that your Gmail SMTP connection is delivering to inboxes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Enter test recipient email (e.g. test@gmail.com)"
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

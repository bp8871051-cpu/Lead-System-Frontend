import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit, Trash2, CheckCircle2, Copy } from 'lucide-react';
import { emailApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    service: 'Website Development',
    tone: 'Professional',
  });

  const toast = useToast();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await emailApi.getTemplates();
      if (res.data?.success) {
        setTemplates(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await emailApi.createTemplate(formData);
      toast.success('Email Template created successfully!');
      setModal(false);
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to create template');
    }
  };

  const handleDelete = async (id) => {
    try {
      await emailApi.deleteTemplate(id);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template');
    }
  };

  const variables = ['{{business_name}}', '{{contact_name}}', '{{city}}', '{{category}}', '{{company_name}}'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Email Templates</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage reusable outreach copy with dynamic tag variables.
          </p>
        </div>

        <button
          onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-500">Loading templates...</div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {t.service || 'General'}
                </span>
                <button onClick={() => handleDelete(t.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-bold text-white text-base">{t.name}</h3>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <p className="font-semibold text-indigo-300">Subject: {t.subject}</p>
                <p className="text-slate-300 font-mono whitespace-pre-wrap">{t.body}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">New Email Template</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Template Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Cold Web Dev Pitch"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Subject Line</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Quick question regarding {{business_name}} in {{city}}"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Body Text</label>
                <textarea
                  rows={6}
                  required
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full glass-input p-3 rounded-xl text-xs font-mono"
                  placeholder="Hi {{business_name}} Team, ..."
                />
              </div>

              {/* Variable Helper Pills */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Available Variables (Click to Insert)</p>
                <div className="flex flex-wrap gap-1.5">
                  {variables.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setFormData({ ...formData, body: formData.body + ' ' + v })}
                      className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-indigo-300 border border-slate-700 hover:bg-slate-700"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

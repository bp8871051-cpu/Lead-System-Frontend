import React, { useState, useEffect } from 'react';
import { X, Send, Eye, Edit3, Sparkles, RefreshCw, Plus, Trash2, Smartphone, Monitor } from 'lucide-react';
import { emailApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function CorporateEmailModal({ lead, onClose, onSent }) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'edit'
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'mobile'

  const [loading, setLoading] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sending, setSending] = useState(false);

  // Email Structured Fields
  const [subject, setSubject] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [opportunities, setOpportunities] = useState([
    { title: 'Web Applications & Website Development', description: 'A modern, high-speed responsive web experience built to capture high-intent leads.' },
    { title: 'UI/UX & Graphic Design', description: 'High-impact brand visuals and user-friendly design tailored for your clients.' },
    { title: 'Digital Marketing & SEO', description: 'Improve local search visibility and capture high-intent customers automatically.' }
  ]);
  const [valueProposition, setValueProposition] = useState('We specialize in Website Development, UI/UX Design, Lead Generation, and CRM Automation tailored for growing businesses.');
  const [cta, setCta] = useState('Would you be open to a quick 5-minute call next Tuesday to discuss how these updates can boost your online presence?');
  const [senderName, setSenderName] = useState('');
  const [senderDesignation, setSenderDesignation] = useState('Business Development Manager');
  const [provider, setProvider] = useState('smtp');

  // Exact Rendered HTML
  const [htmlContent, setHtmlContent] = useState('');

  const toast = useToast();

  // Generate initial AI email content
  const generateAiContent = async () => {
    setLoading(true);
    try {
      const res = await emailApi.generateEmail({
        lead_id: lead.id,
        service: 'Website & Digital Growth Solutions',
        tone: 'Professional',
        length: 'Medium',
        cta: 'Book a 5-Minute Strategy Call'
      });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setHtmlContent(data.body);
        setSubject(data.subject);

        if (data.structured_data) {
          setIntroduction(data.structured_data.introduction || '');
          if (Array.isArray(data.structured_data.opportunities)) {
            setOpportunities(data.structured_data.opportunities);
          }
          if (data.structured_data.value_proposition) {
            setValueProposition(data.structured_data.value_proposition);
          }
          if (data.structured_data.cta) {
            setCta(data.structured_data.cta);
          }
        }
        toast.success('Professional Corporate HTML Email generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate AI Email content');
    } finally {
      setLoading(false);
    }
  };

  // Re-render HTML from updated structured fields
  const handleReRender = async () => {
    setRendering(true);
    try {
      const res = await emailApi.renderEmail({
        lead_id: lead.id,
        subject,
        introduction,
        opportunities,
        value_proposition: valueProposition,
        cta,
        sender_name: senderName,
        sender_designation: senderDesignation,
      });

      if (res.data?.success && res.data.html) {
        setHtmlContent(res.data.html);
        toast.success('Corporate Email HTML re-rendered!');
      }
    } catch (err) {
      toast.error('Failed to re-render HTML email');
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    generateAiContent();
  }, [lead.id]);

  const handleOpportunityChange = (index, field, value) => {
    const updated = [...opportunities];
    updated[index][field] = value;
    setOpportunities(updated);
  };

  const addOpportunity = () => {
    setOpportunities([...opportunities, { title: 'New Opportunity Service', description: 'Detailed description of how this service helps the business.' }]);
  };

  const removeOpportunity = (index) => {
    setOpportunities(opportunities.filter((_, i) => i !== index));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!lead.email) {
      toast.error('Lead has no Email ID! Please edit and add an Email ID first.');
      return;
    }

    setSending(true);
    try {
      const res = await emailApi.sendEmail({
        lead_id: lead.id,
        subject,
        body: htmlContent,
        provider,
      });

      if (res.data?.success) {
        toast.success(res.data.message || `Email sent successfully to ${lead.email}!`);
        if (onSent) onSent();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch email. Check SMTP credentials in Settings.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl h-[90vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Corporate HTML Cold Email Studio
            </h2>
            <p className="text-xs text-slate-400">
              Recipient: <span className="text-emerald-400 font-bold">{lead.business_name}</span> ({lead.email || 'No Email'})
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live HTML Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Structured Fields</span>
              </button>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-950/40">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-xs text-slate-400">Generating Corporate Blade HTML Email...</p>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="h-full flex flex-col space-y-3">
              {/* Device Toolbar */}
              <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-semibold text-white">Preview Device:</span>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded-lg flex items-center gap-1 text-xs ${
                      previewDevice === 'desktop' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop (650px)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded-lg flex items-center gap-1 text-xs ${
                      previewDevice === 'mobile' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile (375px)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReRender}
                  disabled={rendering}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${rendering ? 'animate-spin' : ''}`} />
                  <span>{rendering ? 'Rendering...' : 'Re-render HTML'}</span>
                </button>
              </div>

              {/* iframe Container */}
              <div className="flex-1 flex justify-center overflow-hidden bg-slate-950 p-2 rounded-xl border border-slate-800">
                <iframe
                  srcDoc={htmlContent}
                  title="Corporate Email Preview"
                  className={`h-full border-0 rounded-lg shadow-2xl transition-all duration-300 bg-white ${
                    previewDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[650px]'
                  }`}
                />
              </div>
            </div>
          ) : (
            /* Structured Fields Editor */
            <div className="space-y-4 max-w-3xl mx-auto">
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">1. Email Subject & Greeting</h3>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-emerald-300"
                  />
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">2. Personalized Introduction</h3>
                <textarea
                  rows={3}
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  className="w-full glass-input p-3 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">3. Numbered Opportunities List</h3>
                  <button
                    type="button"
                    onClick={addOpportunity}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {opportunities.map((opp, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400">Item #{idx + 1}</span>
                        {opportunities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOpportunity(idx)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={opp.title}
                        onChange={(e) => handleOpportunityChange(idx, 'title', e.target.value)}
                        placeholder="Service Title"
                        className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs font-bold text-white"
                      />
                      <textarea
                        rows={2}
                        value={opp.description}
                        onChange={(e) => handleOpportunityChange(idx, 'description', e.target.value)}
                        placeholder="Short opportunity description..."
                        className="w-full glass-input p-2 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">4. Value Proposition & Call to Action</h3>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Company Value Proposition</label>
                  <textarea
                    rows={2}
                    value={valueProposition}
                    onChange={(e) => setValueProposition(e.target.value)}
                    className="w-full glass-input p-2.5 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">CTA Paragraph</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-semibold text-teal-300"
                  />
                </div>
              </div>

              <div className="glass-panel p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-semibold mb-1">Sender Designation</label>
                  <input
                    type="text"
                    value={senderDesignation}
                    onChange={(e) => setSenderDesignation(e.target.value)}
                    placeholder="e.g. Business Development Manager"
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    handleReRender();
                    setActiveTab('preview');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg hover:bg-indigo-500 transition-all"
                >
                  Save & Update Preview 🖼️
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Toolbar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="glass-input px-3 py-1.5 rounded-xl text-xs bg-slate-950 text-slate-300"
            >
              <option value="smtp">Gmail / Custom SMTP</option>
              <option value="brevo">Brevo API Provider</option>
            </select>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Sends 100% exact Blade HTML email to inbox.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass-card text-xs text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || loading}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
            >
              {sending ? <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
              <span>{sending ? 'Sending...' : 'Send Corporate Email Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

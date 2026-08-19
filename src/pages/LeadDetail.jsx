import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Star,
  Sparkles,
  Send,
  MessageSquare,
  History,
  ArrowLeft,
  X,
} from 'lucide-react';
import { leadApi, emailApi } from '../api';
import { useToast } from '../context/ToastContext';

import CorporateEmailModal from '../components/CorporateEmailModal';

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [openStudioModal, setOpenStudioModal] = useState(false);

  // Email state
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailProvider, setEmailProvider] = useState('smtp');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  const toast = useToast();

  const fetchLead = async () => {
    setLoading(true);
    try {
      const res = await leadApi.getLead(id);
      if (res.data?.success) {
        const lData = res.data.data;
        setLead(lData);
        setEmailSubject(`Special Proposal & Digital Growth Solutions for ${lData.business_name}`);
        setEmailBody(`Hi ${lData.contact_name || lData.business_name},\n\nI was looking at business profiles in ${lData.city || 'your city'} and noticed ${lData.business_name}.\n\nWe specialize in helping local businesses increase revenue and streamline customer acquisition through custom digital solutions.\n\nWould you be open for a quick 5-minute call this week?\n\nBest regards,\nOutreach Team`);
      }
    } catch (err) {
      toast.error('Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await leadApi.addNote(id, newNote);
      if (res.data?.success) {
        toast.success('Note added successfully');
        setNewNote('');
        fetchLead();
      }
    } catch (err) {
      toast.error('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!lead.email) {
      toast.error('This lead does not have a primary email address.');
      return;
    }
    setSendingEmail(true);
    try {
      const res = await emailApi.sendEmail({
        lead_id: lead.id,
        subject: emailSubject,
        body: emailBody,
        provider: emailProvider,
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Outreach email sent successfully!');
        fetchLead();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleGenerateAiEmail = async () => {
    setAiGenerating(true);
    try {
      const res = await emailApi.generateEmail({
        lead_id: lead.id,
        service: 'Website & Digital Growth',
        tone: 'Professional',
        length: 'Medium',
        cta: 'Book a Call',
      });
      if (res.data?.success) {
        setEmailSubject(res.data.data.subject);
        setEmailBody(res.data.data.body);
        toast.success('AI Email generated!');
      }
    } catch (err) {
      toast.error('Failed to generate AI Email');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading || !lead) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3"></div>
        Loading Lead Profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/leads" className="p-2 rounded-xl glass-card text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{lead.business_name}</h1>
            <p className="text-xs text-slate-400">Lead Profile ID: #{lead.id} • Status: <span className="text-indigo-400 uppercase font-semibold">{lead.lead_status.replace('_', ' ')}</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Business & Contact Info (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Main Business Details */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Business Profile
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-medium">Category</p>
                <p className="text-white font-bold mt-1">{lead.category || 'N/A'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Contact Person</p>
                <p className="text-white font-bold mt-1">{lead.contact_name || 'N/A'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Google Rating</p>
                <p className="text-amber-400 font-bold mt-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {lead.google_rating || 'N/A'} ({lead.review_count} reviews)
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Primary Email</p>
                <p className="text-emerald-400 font-bold mt-1">{lead.email || 'Missing'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Primary Phone</p>
                <p className="text-indigo-300 font-bold mt-1">{lead.phone || 'Missing'}</p>
              </div>

              <div>
                <p className="text-slate-400 font-medium">Location</p>
                <p className="text-white font-bold mt-1">{lead.city || 'N/A'}, {lead.state}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Full Address</p>
              <p className="text-xs text-slate-200 mt-1">{lead.address || 'Address unavailable'}</p>
            </div>
          </div>

          {/* Card 2: Direct Email Outreach Studio */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                Enterprise HTML Outreach Studio
              </h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                Fixed Corporate Template
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <p className="text-xs text-slate-300">
                Generate and send a 100% fixed professional corporate Blade HTML email tailored for <strong className="text-emerald-400">{lead.business_name}</strong>. Includes AI-personalized intro, numbered opportunities, company info card, and enterprise service badges.
              </p>

              <button
                type="button"
                onClick={() => setOpenStudioModal(true)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Corporate Email Studio (Live Blade Preview & Edit)</span>
              </button>
            </div>
          </div>

          {openStudioModal && (
            <CorporateEmailModal
              lead={lead}
              onClose={() => setOpenStudioModal(false)}
              onSent={() => fetchLead()}
            />
          )}

          {/* Card 3: Notes & Conversation History */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Lead Notes
            </h2>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a call note or follow-up reminder..."
                className="flex-1 glass-input px-3.5 py-2 rounded-xl text-xs"
              />
              <button
                type="submit"
                disabled={submittingNote}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0"
              >
                Add Note
              </button>
            </form>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {lead.notes?.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No notes added yet.</p>
              ) : (
                lead.notes?.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                    <p className="text-slate-200">{n.note}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Added by {n.user?.name || 'User'} on {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline (1 Col) */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Activity Timeline
          </h2>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {lead.activity_logs?.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No history logged yet.</p>
            ) : (
              lead.activity_logs?.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-slate-950"></div>
                  <p className="text-xs font-semibold text-white">{act.description}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(act.created_at).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

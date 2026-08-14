import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Sparkles,
  Send,
  Eye,
  Globe,
  GlobeX,
  Mail,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Check,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { leadApi, emailApi } from '../api';
import { useToast } from '../context/ToastContext';

import CorporateEmailModal from '../components/CorporateEmailModal';

export default function LeadManagement() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filterDrawer, setFilterDrawer] = useState(false);
  const [studioLead, setStudioLead] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    has_website: '',
    has_email: '',
    has_phone: '',
    lead_status: '',
    source: '',
    city: '',
  });

  // Inline Table Editing for Email ID
  const [editingEmailId, setEditingEmailId] = useState(null);
  const [inlineEmailValue, setInlineEmailValue] = useState('');

  // Full Edit Lead Modal
  const [editLeadModal, setEditLeadModal] = useState(null);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    business_name: '',
    contact_name: '',
    category: '',
    email: '',
    phone: '',
    city: '',
    website: '',
  });
  const [aiModal, setAiModal] = useState(null);
  const [directEmailModal, setDirectEmailModal] = useState(null);

  // Direct Email Form State
  const [directEmailData, setDirectEmailData] = useState({
    subject: 'Growth Opportunities & Digital Solutions for {{business_name}}',
    body: 'Hi {{contact_name}},\n\nI was looking at business profiles in {{city}} and noticed {{business_name}}.\n\nWe specialize in helping businesses like yours attract more local clients through custom web solutions and automated CRM outreach.\n\nWould you be available for a brief 5-minute chat this week?\n\nBest regards,\nOutreach Team',
    provider: 'brevo',
  });

  // AI Generator options
  const [aiOptions, setAiOptions] = useState({
    service: 'Website Development',
    tone: 'Professional',
    length: 'Medium',
    cta: 'Book a Call',
  });

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [savingLead, setSavingLead] = useState(false);

  const toast = useToast();

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        search,
        ...filters,
      };
      const res = await leadApi.getLeads(params);
      if (res.data?.success) {
        setLeads(res.data.data.data || []);
        setPagination({
          current_page: res.data.data.current_page,
          last_page: res.data.data.last_page,
          total: res.data.data.total,
        });
      }
    } catch (err) {
      toast.error('Failed to load leads table data');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters, fetchLeads]);

  // Inline Email Editing Save
  const startInlineEmailEdit = (lead) => {
    setEditingEmailId(lead.id);
    setInlineEmailValue(lead.email || '');
  };

  const saveInlineEmailEdit = async (leadId) => {
    try {
      const res = await leadApi.updateLead(leadId, { email: inlineEmailValue });
      if (res.data?.success) {
        toast.success('Email ID updated successfully!');
        setEditingEmailId(null);
        fetchLeads(pagination.current_page);
      }
    } catch (err) {
      toast.error('Failed to update Email ID');
    }
  };

  const handleEnrichEmail = async (lead) => {
    toast.info(`Scraping website & web records for ${lead.business_name}...`);
    try {
      const res = await leadApi.enrichEmail(lead.id);
      if (res.data?.success) {
        toast.success(res.data.message || 'Real Email ID extracted successfully!');
        fetchLeads(pagination.current_page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not find public email on website. You can edit it manually.');
    }
  };

  const handleBulkEnrichEmails = async () => {
    if (selectedLeads.length === 0) return;
    toast.info(`Scanning web records for ${selectedLeads.length} selected leads...`);
    try {
      const res = await leadApi.bulkEnrichEmails(selectedLeads);
      if (res.data?.success) {
        toast.success(res.data.message || 'Bulk email enrichment complete!');
        fetchLeads(pagination.current_page);
      }
    } catch (err) {
      toast.error('Failed to run bulk email enrichment');
    }
  };

  // Create Single Lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSavingLead(true);
    try {
      const res = await leadApi.createLead(createFormData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Lead created successfully!');
        setCreateModal(false);
        setCreateFormData({ business_name: '', contact_name: '', category: '', email: '', phone: '', city: '', website: '' });
        fetchLeads(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSavingLead(false);
    }
  };

  // Full Edit Lead Save
  const handleSaveFullEditLead = async (e) => {
    e.preventDefault();
    if (!editLeadModal) return;
    setSavingLead(true);
    try {
      const res = await leadApi.updateLead(editLeadModal.id, editLeadModal);
      if (res.data?.success) {
        toast.success('Lead updated successfully!');
        setEditLeadModal(null);
        fetchLeads(pagination.current_page);
      }
    } catch (err) {
      toast.error('Failed to update lead details');
    } finally {
      setSavingLead(false);
    }
  };

  // Bulk Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map((l) => l.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const toggleSelectLead = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    try {
      await leadApi.bulkDelete(selectedLeads);
      toast.success(`${selectedLeads.length} leads moved to Trash`);
      setSelectedLeads([]);
      fetchLeads(pagination.current_page);
    } catch (err) {
      toast.error('Failed to bulk delete leads');
    }
  };

  const handleDeleteSingle = async (id) => {
    try {
      await leadApi.deleteLead(id);
      toast.success('Lead moved to Trash');
      fetchLeads(pagination.current_page);
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  // AI Email Generator Trigger
  const handleGenerateAiEmail = async (lead) => {
    setAiModal(lead);
    setAiResult(null);
    setAiLoading(true);
    try {
      const res = await emailApi.generateEmail({
        lead_id: lead.id,
        ...aiOptions,
      });
      if (res.data?.success) {
        setAiResult(res.data.data);
        toast.success('AI Email generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate AI Email');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendAiEmail = async () => {
    if (!aiResult) return;
    setSendLoading(true);
    try {
      const res = await emailApi.sendEmail({
        lead_id: aiResult.lead_id,
        subject: aiResult.subject,
        body: aiResult.body,
        provider: 'brevo',
      });
      if (res.data?.success) {
        toast.success(res.data.message || 'Outreach email sent successfully!');
        setAiModal(null);
        fetchLeads(pagination.current_page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSendLoading(false);
    }
  };

  // Direct Single or Bulk Email Send Trigger
  const openDirectEmailModal = (target) => {
    setDirectEmailModal(target);
  };

  const handleSendDirectEmail = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    try {
      if (Array.isArray(directEmailModal)) {
        // Filter out leads without email
        const validLeadIds = directEmailModal.filter((id) => {
          const l = leads.find((item) => item.id === id);
          return l && l.email && l.email.trim() !== '';
        });

        if (validLeadIds.length === 0) {
          toast.error('None of the selected leads have an Email ID. Please edit and add Email IDs first.');
          setSendLoading(false);
          return;
        }

        const res = await emailApi.bulkSendEmail({
          lead_ids: validLeadIds,
          subject: directEmailData.subject,
          body: directEmailData.body,
          provider: directEmailData.provider,
        });

        if (res.data?.success) {
          toast.success(res.data.message || 'Bulk outreach emails dispatched!');
          setDirectEmailModal(null);
          setSelectedLeads([]);
          fetchLeads(pagination.current_page);
        }
      } else {
        // Single Lead Send
        if (!directEmailModal.email || !directEmailModal.email.trim()) {
          toast.error('Please enter an Email ID for this lead before sending.');
          setSendLoading(false);
          return;
        }

        const res = await emailApi.sendEmail({
          lead_id: directEmailModal.id,
          subject: directEmailData.subject.replace('{{business_name}}', directEmailModal.business_name),
          body: directEmailData.body
            .replace('{{business_name}}', directEmailModal.business_name)
            .replace('{{contact_name}}', directEmailModal.contact_name || directEmailModal.business_name)
            .replace('{{city}}', directEmailModal.city || 'your city'),
          provider: directEmailData.provider,
        });

        if (res.data?.success) {
          toast.success(res.data.message || 'Email sent successfully!');
          setDirectEmailModal(null);
          fetchLeads(pagination.current_page);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to dispatch email');
    } finally {
      setSendLoading(false);
    }
  };

  // Helper count for selected leads with email
  const getSelectedValidEmailCount = () => {
    if (!Array.isArray(directEmailModal)) return 0;
    return directEmailModal.filter((id) => {
      const l = leads.find((item) => item.id === id);
      return l && l.email && l.email.trim() !== '';
    }).length;
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lead Database & Email Table</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage leads, edit Email IDs directly in table, and execute outreach.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Lead</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilters({ ...filters, has_email: '', lead_status: '' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filters.has_email === '' && filters.lead_status === ''
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'glass-card text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Leads ({pagination.total})
        </button>

        <button
          onClick={() => setFilters({ ...filters, has_email: 'yes', lead_status: '' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            filters.has_email === 'yes'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
              : 'glass-card text-emerald-400 hover:text-white border border-slate-800'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Has Email ID</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, has_email: 'no', lead_status: '' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            filters.has_email === 'no'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'glass-card text-amber-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Needs Email ID (Edit in Table)</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, lead_status: 'email_sent', has_email: '' })}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            filters.lead_status === 'email_sent'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'glass-card text-blue-400 hover:text-white border border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Email Sent</span>
        </button>
      </div>

      {/* Table Filters & Bulk Action Header */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search business name, category, email, city..."
            className="w-full glass-input pl-10 pr-4 py-2 rounded-xl text-xs"
          />
        </div>

        {/* Quick Filter Buttons & Drawers */}
        <div className="flex items-center gap-3">
          {selectedLeads.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDirectEmailModal(selectedLeads)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Bulk Email ({selectedLeads.length})</span>
              </button>

              <button
                onClick={handleBulkEnrichEmails}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Auto-Scrape Emails ({selectedLeads.length})</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setFilterDrawer(!filterDrawer)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              filterDrawer
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'glass-card border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Drawer Options */}
      {filterDrawer && (
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-3 animate-fadeIn">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Website</label>
            <select
              value={filters.has_website}
              onChange={(e) => setFilters({ ...filters, has_website: e.target.value })}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs bg-slate-900"
            >
              <option value="">All</option>
              <option value="no">No Website Only</option>
              <option value="yes">Has Website Only</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</label>
            <select
              value={filters.has_email}
              onChange={(e) => setFilters({ ...filters, has_email: e.target.value })}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs bg-slate-900"
            >
              <option value="">All</option>
              <option value="yes">With Email</option>
              <option value="no">Without Email</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lead Status</label>
            <select
              value={filters.lead_status}
              onChange={(e) => setFilters({ ...filters, lead_status: e.target.value })}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs bg-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="email_generated">Email Generated</option>
              <option value="email_sent">Email Sent</option>
              <option value="converted">Converted</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Source</label>
            <select
              value={filters.source}
              onChange={(e) => setFilters({ ...filters, source: e.target.value })}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs bg-slate-900"
            >
              <option value="">All Sources</option>
              <option value="direct_web">Direct Scraper</option>
              <option value="apify">Apify Scraper</option>
              <option value="google_maps">Google Maps</option>
              <option value="excel_import">Excel Import</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ has_website: '', has_email: '', has_phone: '', lead_status: '', source: '', city: '' })}
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white underline text-center"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeads.length === leads.length && leads.length > 0}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                </th>
                <th className="p-4">Business & Contact</th>
                <th className="p-4">Category</th>
                <th className="p-4">Website</th>
                <th className="p-4">Email ID (Editable ✏️)</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                    Loading leads database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-500">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => toggleSelectLead(lead.id)}
                        className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                      />
                    </td>
                    <td className="p-4">
                      <Link to={`/leads/${lead.id}`} className="font-bold text-white hover:text-indigo-400 transition-colors block">
                        {lead.business_name}
                      </Link>
                      {lead.contact_name && <p className="text-[11px] text-slate-400 mt-0.5">{lead.contact_name}</p>}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                        {lead.category || 'General'}
                      </span>
                    </td>
                    <td className="p-4">
                      {lead.website_status === 'no_website' ? (
                        <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                          <GlobeX className="w-3.5 h-3.5" /> No Website
                        </span>
                      ) : lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-indigo-400 hover:underline text-[11px] max-w-[130px] truncate"
                        >
                          <Globe className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{lead.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Missing</span>
                      )}
                    </td>

                    {/* EDITABLE EMAIL COLUMN */}
                    <td className="p-4">
                      {editingEmailId === lead.id ? (
                        <div className="flex items-center gap-1 max-w-[200px]">
                          <input
                            type="email"
                            value={inlineEmailValue}
                            onChange={(e) => setInlineEmailValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveInlineEmailEdit(lead.id);
                              if (e.key === 'Escape') setEditingEmailId(null);
                            }}
                            autoFocus
                            placeholder="Enter email..."
                            className="w-full glass-input px-2 py-1 text-xs rounded-lg text-emerald-300 font-bold"
                          />
                          <button
                            onClick={() => saveInlineEmailEdit(lead.id)}
                            title="Save Email"
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingEmailId(null)}
                            title="Cancel"
                            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group">
                          {lead.email ? (
                            <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                              <Mail className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate max-w-[140px] font-semibold text-emerald-300">{lead.email}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startInlineEmailEdit(lead)}
                                className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => handleEnrichEmail(lead)}
                                title="Auto-Scrape Real Email from Website"
                                className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-semibold hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                              >
                                <Search className="w-3 h-3" /> Scrape Email
                              </button>
                            </div>
                          )}

                          {lead.email && (
                            <button
                              onClick={() => startInlineEmailEdit(lead)}
                              title="Edit Email ID"
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-300 transition-opacity"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-slate-300 text-[11px]">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">No Phone</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-300 text-[11px]">
                      {lead.city || 'N/A'}{lead.state ? `, ${lead.state}` : ''}
                    </td>

                    <td className="p-4">
                      {lead.google_rating ? (
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{lead.google_rating}</span>
                          <span className="text-slate-500 font-normal">({lead.review_count})</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          lead.lead_status === 'email_sent'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : lead.lead_status === 'email_generated'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : lead.lead_status === 'converted'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {lead.lead_status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditLeadModal(lead)}
                          title="Full Edit Lead Details"
                          className="p-1.5 rounded-lg glass-card text-slate-400 hover:text-amber-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudioLead(lead)}
                          title="Open Corporate Email Studio (Live Blade HTML Preview)"
                          className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setStudioLead(lead)}
                          title="Generate Corporate Blade AI Email"
                          className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/leads/${lead.id}`}
                          title="View Profile"
                          className="p-1.5 rounded-lg glass-card text-slate-400 hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSingle(lead.id)}
                          title="Delete Lead"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <span>Total Records: {pagination.total}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => fetchLeads(pagination.current_page - 1)}
              className="p-1.5 rounded-lg glass-card hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => fetchLeads(pagination.current_page + 1)}
              className="p-1.5 rounded-lg glass-card hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add New Single Lead</h3>
              <button onClick={() => setCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name *</label>
                <input
                  type="text"
                  required
                  value={createFormData.business_name}
                  onChange={(e) => setCreateFormData({ ...createFormData, business_name: e.target.value })}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full glass-input px-3 py-2 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={createFormData.contact_name}
                    onChange={(e) => setCreateFormData({ ...createFormData, contact_name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData({ ...createFormData, category: e.target.value })}
                    placeholder="e.g. IT Services"
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email ID</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={createFormData.city}
                    onChange={(e) => setCreateFormData({ ...createFormData, city: e.target.value })}
                    placeholder="e.g. Ahmedabad"
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                  <input
                    type="text"
                    value={createFormData.website}
                    onChange={(e) => setCreateFormData({ ...createFormData, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20"
                >
                  {savingLead ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT LEAD MODAL */}
      {editLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Edit Lead Details</h3>
              <button onClick={() => setEditLeadModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFullEditLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  value={editLeadModal.business_name || ''}
                  onChange={(e) => setEditLeadModal({ ...editLeadModal, business_name: e.target.value })}
                  className="w-full glass-input px-3 py-2 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={editLeadModal.contact_name || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, contact_name: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <input
                    type="text"
                    value={editLeadModal.category || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, category: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-emerald-400 font-semibold mb-1">Email ID ✏️</label>
                  <input
                    type="email"
                    value={editLeadModal.email || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, email: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl text-emerald-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editLeadModal.phone || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, phone: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">City</label>
                  <input
                    type="text"
                    value={editLeadModal.city || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, city: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
                  <input
                    type="text"
                    value={editLeadModal.website || ''}
                    onChange={(e) => setEditLeadModal({ ...editLeadModal, website: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditLeadModal(null)}
                  className="px-4 py-2 rounded-xl glass-card text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLead}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-lg shadow-amber-500/20"
                >
                  {savingLead ? 'Saving...' : 'Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Email Sender Modal (Single / Bulk) */}
      {directEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  {Array.isArray(directEmailModal) ? `Send Bulk Email (${getSelectedValidEmailCount()} Valid Email Recipients)` : `Send Email to ${directEmailModal.business_name}`}
                </h3>
              </div>
              <button onClick={() => setDirectEmailModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning / Notice for missing email */}
            {!Array.isArray(directEmailModal) && (!directEmailModal.email || !directEmailModal.email.trim()) ? (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <p className="text-amber-400 font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Missing Email ID! Please enter Email ID below to proceed with sending:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={directEmailModal.email || ''}
                    onChange={(e) => setDirectEmailModal({ ...directEmailModal, email: e.target.value })}
                    placeholder="Enter email ID..."
                    className="flex-1 glass-input px-3 py-1.5 rounded-lg text-emerald-300 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => saveInlineEmailEdit(directEmailModal.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
                  >
                    Save Email ID
                  </button>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSendDirectEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Subject</label>
                <input
                  type="text"
                  required
                  value={directEmailData.subject}
                  onChange={(e) => setDirectEmailData({ ...directEmailData, subject: e.target.value })}
                  placeholder="e.g. Special Offer for {{business_name}}"
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-emerald-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email Body Message</label>
                <textarea
                  rows={7}
                  required
                  value={directEmailData.body}
                  onChange={(e) => setDirectEmailData({ ...directEmailData, body: e.target.value })}
                  placeholder="Write your email body here... Supported variables: {{business_name}}, {{contact_name}}, {{city}}"
                  className="w-full glass-input p-3 rounded-xl text-xs font-mono leading-relaxed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Available variables: {'{{business_name}}'}, {'{{contact_name}}'}, {'{{city}}'}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <select
                  value={directEmailData.provider}
                  onChange={(e) => setDirectEmailData({ ...directEmailData, provider: e.target.value })}
                  className="glass-input px-3 py-1.5 rounded-lg text-xs bg-slate-900 text-slate-300"
                >
                  <option value="brevo">Brevo API</option>
                  <option value="smtp">Custom SMTP Server</option>
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectEmailModal(null)}
                    className="px-4 py-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20"
                  >
                    {sendLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
                    <span>Dispatch Email Now</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Email Generation Drawer Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">AI Cold Outreach Email Generator</h3>
              </div>
              <button onClick={() => setAiModal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-white">Target Lead: {aiModal.business_name}</p>
              <p className="text-slate-400">Category: {aiModal.category} • Location: {aiModal.city} • Website: {aiModal.website_status}</p>
            </div>

            {aiLoading ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-semibold">Generating personalized outreach email using Company Profile...</p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Generated Subject</label>
                  <input
                    type="text"
                    value={aiResult.subject}
                    onChange={(e) => setAiResult({ ...aiResult, subject: e.target.value })}
                    className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Generated Email Body</label>
                  <textarea
                    rows={8}
                    value={aiResult.body}
                    onChange={(e) => setAiResult({ ...aiResult, body: e.target.value })}
                    className="w-full glass-input p-3 rounded-xl text-xs font-mono leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleGenerateAiEmail(aiModal)}
                    className="px-4 py-2 rounded-xl glass-card hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleSendAiEmail}
                    disabled={sendLoading}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
                  >
                    {sendLoading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Email Now</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {studioLead && (
        <CorporateEmailModal
          lead={studioLead}
          onClose={() => setStudioLead(null)}
          onSent={() => fetchLeads(pagination.current_page)}
        />
      )}
    </div>
  );
}

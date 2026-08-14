import React, { useState, useEffect } from 'react';
import { Building2, Save, Sparkles, Globe, Mail, Phone, MapPin, ShieldCheck, UserCheck, Palette, FileText, Clock } from 'lucide-react';
import { companyApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function CompanyProfile() {
  const [profile, setProfile] = useState({
    name: '',
    logo: '',
    primary_color: '#4F46E5',
    description: '',
    industry: '',
    services: [],
    products: [],
    website: '',
    phone: '',
    alternate_phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    gst_number: '',
    cin_number: '',
    business_hours: '',
    privacy_policy_url: '',
    terms_url: '',
    target_audience: '',
    usp: '',
    company_tone: 'Professional',
    default_sender_name: '',
    default_sender_designation: 'Business Development Manager',
    default_sender_email: '',
  });

  const [servicesText, setServicesText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await companyApi.getProfile();
      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        setProfile((prev) => ({ ...prev, ...d }));
        setServicesText(Array.isArray(d.services) ? d.services.join(', ') : d.services || '');
      }
    } catch (err) {
      toast.error('Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...profile,
      services: servicesText.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      const res = await companyApi.updateProfile(payload);
      if (res.data?.success) {
        toast.success('Company Profile updated! AI Email Generator & Corporate Blade Template updated automatically.');
      }
    } catch (err) {
      toast.error('Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">Loading Company Profile...</div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Enterprise Company Profile</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your official company identity, address, legal credentials, and email sender details for cold outreach emails.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Profile...' : 'Save Profile Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Identity */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Company Identity & Branding
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Name</label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. Blueboxx Technologies"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Industry</label>
              <input
                type="text"
                value={profile.industry || ''}
                onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                placeholder="e.g. Information Technology & Web Development"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Primary Brand Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={profile.primary_color || '#4F46E5'}
                  onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={profile.primary_color || '#4F46E5'}
                  onChange={(e) => setProfile({ ...profile, primary_color: e.target.value })}
                  className="flex-1 glass-input px-3 py-2 rounded-xl text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Company Description</label>
            <textarea
              rows={3}
              value={profile.description || ''}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              className="w-full glass-input p-3 rounded-xl text-xs"
              placeholder="Briefly describe your company's expertise and core capabilities..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Services Offered (Comma Separated for Badges & Email Template)
            </label>
            <input
              type="text"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              placeholder="Website Development, Web Applications, UI / UX Design, Graphic Design, Logo Design, Branding, Lead Generation, CRM Automation"
              className="w-full glass-input px-3 py-2 rounded-xl text-xs text-indigo-300 font-semibold"
            />
          </div>
        </div>

        {/* Online Presence & Contact Details */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            Online Presence & Official Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Official Website URL</label>
              <input
                type="text"
                value={profile.website || ''}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://blueboxx.io"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Support / Public Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="support@blueboxx.io"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Office Contact Phone</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Alternate Contact Phone</label>
              <input
                type="text"
                value={profile.alternate_phone || ''}
                onChange={(e) => setProfile({ ...profile, alternate_phone: e.target.value })}
                placeholder="+91 91234 56789"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Privacy Policy URL</label>
              <input
                type="text"
                value={profile.privacy_policy_url || ''}
                onChange={(e) => setProfile({ ...profile, privacy_policy_url: e.target.value })}
                placeholder="https://blueboxx.io/privacy-policy"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Terms & Conditions URL</label>
              <input
                type="text"
                value={profile.terms_url || ''}
                onChange={(e) => setProfile({ ...profile, terms_url: e.target.value })}
                placeholder="https://blueboxx.io/terms"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Address & Legal Information Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            Address & Company Card Credentials (Displayed in Email Footer Card)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Full Office Address</label>
              <input
                type="text"
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Plot #42, Commercial Complex, SG Highway"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">City</label>
                <input
                  type="text"
                  value={profile.city || ''}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Ahmedabad"
                  className="w-full glass-input px-2.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">State</label>
                <input
                  type="text"
                  value={profile.state || ''}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="Gujarat"
                  className="w-full glass-input px-2.5 py-2 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Country</label>
                <input
                  type="text"
                  value={profile.country || ''}
                  onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                  placeholder="India"
                  className="w-full glass-input px-2.5 py-2 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">GST Number (Optional)</label>
              <input
                type="text"
                value={profile.gst_number || ''}
                onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                placeholder="24AAAAA0000A1Z5"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">CIN Number (Optional)</label>
              <input
                type="text"
                value={profile.cin_number || ''}
                onChange={(e) => setProfile({ ...profile, cin_number: e.target.value })}
                placeholder="U72900GJ2026PTC123456"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Business Hours</label>
              <input
                type="text"
                value={profile.business_hours || ''}
                onChange={(e) => setProfile({ ...profile, business_hours: e.target.value })}
                placeholder="Mon - Fri (9:00 AM - 6:00 PM IST)"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Value Proposition & AI Context */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Unique Selling Proposition (USP) & AI Persona
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Unique Selling Proposition (USP)</label>
            <textarea
              rows={3}
              value={profile.usp || ''}
              onChange={(e) => setProfile({ ...profile, usp: e.target.value })}
              placeholder="e.g. We specialize in Website Development, UI/UX Design, Lead Generation, and CRM Automation tailored for growing businesses."
              className="w-full glass-input p-3 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Audience</label>
              <input
                type="text"
                value={profile.target_audience || ''}
                onChange={(e) => setProfile({ ...profile, target_audience: e.target.value })}
                placeholder="Local businesses, clinics, restaurants, and SMBs"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Default Company Tone</label>
              <select
                value={profile.company_tone || 'Professional'}
                onChange={(e) => setProfile({ ...profile, company_tone: e.target.value })}
                className="w-full glass-input px-3 py-2 rounded-xl text-xs bg-slate-900 text-white font-bold"
              >
                <option value="Professional">Professional Corporate</option>
                <option value="Friendly">Friendly & Approachable</option>
                <option value="Persuasive">Persuasive Sales Growth</option>
                <option value="Short & Direct">Short & Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Default Sender Credentials */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Default Signature & Sender Profile (For Corporate Email Templates)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Default Sender Name</label>
              <input
                type="text"
                value={profile.default_sender_name || ''}
                onChange={(e) => setProfile({ ...profile, default_sender_name: e.target.value })}
                placeholder="Rahul Sharma"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sender Designation / Title</label>
              <input
                type="text"
                value={profile.default_sender_designation || ''}
                onChange={(e) => setProfile({ ...profile, default_sender_designation: e.target.value })}
                placeholder="Business Development Manager"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Default Sender Email</label>
              <input
                type="email"
                value={profile.default_sender_email || ''}
                onChange={(e) => setProfile({ ...profile, default_sender_email: e.target.value })}
                placeholder="sumedha.blueboxx@gmail.com"
                className="w-full glass-input px-3 py-2 rounded-xl text-xs font-bold text-emerald-400"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

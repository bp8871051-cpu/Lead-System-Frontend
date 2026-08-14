import React, { useState, useEffect } from 'react';
import { Sparkles, Search, MapPin, Globe, Star, Play, CheckCircle2, Loader2, AlertCircle, RefreshCw, Cpu, Zap } from 'lucide-react';
import { scrapingApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function LeadGeneration() {
  const [formData, setFormData] = useState({
    keyword: 'Restaurants',
    location: 'Ahmedabad, Gujarat',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    requested_count: 50,
    rating_min: 4.0,
    website_filter: 'no_website',
    engine: 'direct',
  });

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await scrapingApi.getJobs();
      if (res.data?.success) {
        setJobs(res.data.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load scraping jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await scrapingApi.startScraping(formData);
      if (res.data?.success) {
        toast.success(res.data.message || 'Leads scraped & saved successfully!');
        fetchJobs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize scraping task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lead Generation & Web Scraper</h1>
        </div>
        <p className="text-sm text-slate-400 mt-1">
          Scrape verified businesses directly from Google Maps, OpenStreetMap & Web directory search engines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scraping Criteria Form (1 Col) */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Search className="w-4 h-4 text-indigo-400" />
            Search Criteria
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Scraper Engine
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, engine: 'direct' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    formData.engine === 'direct'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                      : 'glass-card border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>⚡ Fast Direct Scraper</span>
                  <span className="text-[9px] font-normal text-slate-400">Instant / Built-in</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, engine: 'apify' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                    formData.engine === 'apify'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                      : 'glass-card border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>🌐 Apify Actor</span>
                  <span className="text-[9px] font-normal text-slate-400">Google Maps Extractor</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Business Category / Keyword
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="keyword"
                  required
                  value={formData.keyword}
                  onChange={handleChange}
                  placeholder="e.g. Restaurants, Gyms, Real Estate, Clinics"
                  className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Location / City
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Ahmedabad, Gujarat"
                  className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Number of Leads
                </label>
                <input
                  type="number"
                  name="requested_count"
                  min={5}
                  max={1000}
                  required
                  value={formData.requested_count}
                  onChange={handleChange}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Min Rating
                </label>
                <div className="relative">
                  <Star className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    step="0.1"
                    name="rating_min"
                    min={0}
                    max={5}
                    value={formData.rating_min}
                    onChange={handleChange}
                    className="w-full glass-input pl-9 pr-3 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Website Filter
              </label>
              <select
                name="website_filter"
                value={formData.website_filter}
                onChange={handleChange}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm bg-slate-900"
              >
                <option value="all">All Businesses</option>
                <option value="no_website">No Website Only (High-Value Web Dev Leads)</option>
                <option value="has_website">Has Website Only</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-semibold text-sm shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scraping & Normalizing Leads...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Lead Scraper</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Scraping Job Telemetry Panel (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                Live Scraping Execution Jobs
              </h2>
              <p className="text-xs text-slate-400">Real-time status & lead acquisition monitor</p>
            </div>
            <button
              onClick={fetchJobs}
              className="p-2 rounded-lg glass-card hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <Sparkles className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No scraping jobs launched yet.</p>
              <p className="text-xs">Fill out the search criteria on the left to start collecting leads!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700/80 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">{job.job_number}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          job.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : job.status === 'running' || job.status === 'processing'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse'
                            : job.status === 'failed'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white">
                      "{job.keyword}" in <span className="text-indigo-300">{job.location}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Requested: {job.requested_count}</span>
                      <span>•</span>
                      <span>Rating ≥ {job.rating_min || 'Any'}</span>
                    </div>
                  </div>

                  {/* Telemetry Numbers */}
                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Found</p>
                      <p className="text-sm font-bold text-white">{job.leads_found}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-emerald-400 uppercase font-semibold">Saved</p>
                      <p className="text-sm font-bold text-emerald-400">{job.leads_saved}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-amber-400 uppercase font-semibold">Duplicates</p>
                      <p className="text-sm font-bold text-amber-400">{job.duplicates_found}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

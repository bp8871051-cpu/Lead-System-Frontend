import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, XCircle, Search } from 'lucide-react';
import { leadApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function Trash() {
  const [trashedLeads, setTrashedLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await leadApi.getTrash();
      if (res.data?.success) {
        setTrashedLeads(res.data.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load trashed records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await leadApi.restoreLead(id);
      toast.success('Lead restored to active database');
      fetchTrash();
    } catch (err) {
      toast.error('Failed to restore lead');
    }
  };

  const handleForceDelete = async (id) => {
    try {
      await leadApi.forceDeleteLead(id);
      toast.success('Lead permanently deleted');
      fetchTrash();
    } catch (err) {
      toast.error('Failed to permanently delete lead');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Trash & Soft-Deleted Recovery</h1>
        <p className="text-sm text-slate-400 mt-1">Review soft-deleted lead entries or restore them to the active database.</p>
      </div>

      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">Business Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Email</th>
                <th className="p-4">City</th>
                <th className="p-4">Deleted At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">Loading trash...</td>
                </tr>
              ) : trashedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">Trash is empty.</td>
                </tr>
              ) : (
                trashedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-bold text-white">{lead.business_name}</td>
                    <td className="p-4 text-slate-300">{lead.category}</td>
                    <td className="p-4 text-slate-400">{lead.email || '-'}</td>
                    <td className="p-4 text-slate-300">{lead.city || '-'}</td>
                    <td className="p-4 text-slate-400">{new Date(lead.deleted_at).toLocaleString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRestore(lead.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                        <button
                          onClick={() => handleForceDelete(lead.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Permanently</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

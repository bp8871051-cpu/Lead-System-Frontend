import React, { useState } from 'react';
import { FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, ArrowRight, Table } from 'lucide-react';
import { importExportApi } from '../api';
import { useToast } from '../context/ToastContext';

export default function ImportExport() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return toast.error('Please select an Excel or CSV file');
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await importExportApi.previewImport(formData);
      if (res.data?.success) {
        setPreview(res.data.data);
        setColumnMapping(res.data.data.suggested_mapping || {});
        toast.success('File loaded! Review column mapping below.');
      }
    } catch (err) {
      toast.error('Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImport = async () => {
    if (!preview) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('column_mapping', JSON.stringify(columnMapping));

    try {
      const res = await importExportApi.processImport(formData);
      if (res.data?.success) {
        setImportResult(res.data.data);
        toast.success(`Import finished! Processed ${res.data.data.imported} leads successfully.`);
      }
    } catch (err) {
      toast.error('Import processing failed');
    } finally {
      setImporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await importExportApi.exportLeads('csv');
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Leads_Export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success('Leads CSV file downloaded!');
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const dbFields = [
    { key: 'business_name', label: 'Business Name (Required)' },
    { key: 'category', label: 'Category' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'website', label: 'Website URL' },
    { key: 'address', label: 'Full Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'google_rating', label: 'Google Rating' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Import & Export Data</h1>
        <p className="text-sm text-slate-400 mt-1">
          Bulk import leads from Excel/CSV with intelligent column mapping and duplicate suppression, or export filtered lead data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Import Wizard */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            Excel / CSV Lead Import
          </h2>

          <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 p-6 rounded-xl text-center space-y-3 transition-colors bg-slate-900/40">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-indigo-400" />
            <div>
              <p className="text-xs font-semibold text-white">Choose Excel (.xlsx, .xls) or CSV file</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size 10MB</p>
            </div>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
            />
          </div>

          {file && !preview && (
            <button
              onClick={handlePreview}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
            >
              {loading ? 'Analyzing Headers...' : 'Parse Columns & Map Fields'}
            </button>
          )}

          {preview && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                Found <strong>{preview.total_rows}</strong> rows and <strong>{preview.headers.length}</strong> headers.
              </div>

              {/* Column Mapping Selector */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {dbFields.map((f) => (
                  <div key={f.key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300 font-medium w-1/2">{f.label}</span>
                    <select
                      value={columnMapping[f.key] || ''}
                      onChange={(e) => setColumnMapping({ ...columnMapping, [f.key]: e.target.value })}
                      className="w-1/2 glass-input px-2 py-1 rounded-lg text-xs bg-slate-900"
                    >
                      <option value="">-- Do Not Import --</option>
                      {preview.headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <button
                onClick={handleProcessImport}
                disabled={importing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20"
              >
                {importing ? 'Processing Import...' : 'Confirm & Execute Import'}
              </button>
            </div>
          )}

          {importResult && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1 text-emerald-300">
              <p className="font-bold">Import Completed Successfully!</p>
              <p>Imported: {importResult.imported} leads</p>
              <p>Duplicates Skipped: {importResult.skipped_duplicates}</p>
            </div>
          )}
        </div>

        {/* Right Column: Export Lead Center */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            Export Lead Records
          </h2>

          <p className="text-xs text-slate-300">
            Download your captured business leads into a clean CSV spreadsheet with normalized contact attributes.
          </p>

          <button
            onClick={handleExportCSV}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete Lead Database (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

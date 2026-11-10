"use client";

import React, { useState } from "react";
import { X, Upload, FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CsvImportModal({
  isOpen,
  onClose,
  onSuccess,
}: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setError(null);
      setImportResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "preview");

    try {
      const res = await fetch("/api/companies/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to parse CSV preview.");
      } else {
        setPreviewData(json);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "commit");

    try {
      const res = await fetch("/api/companies/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to commit CSV import.");
      } else {
        setImportResult(json);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel-glow bg-[#0c1017] rounded-2xl border border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Import Peripheral Brands via CSV</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {importResult ? (
          <div className="mt-6 py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Import Complete!</h4>
              <p className="text-xs text-slate-300 mt-1">
                Successfully added <strong className="text-emerald-400">{importResult.importedCount}</strong> new peripheral brands.
              </p>
              {importResult.duplicateCount > 0 && (
                <p className="text-[11px] text-amber-300 mt-1">
                  Skipped {importResult.duplicateCount} duplicate companies.
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* File drop area */}
            <div className="p-6 border-2 border-dashed border-slate-800 rounded-xl text-center hover:border-cyan-500/50 transition-colors bg-slate-950/40">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">Select or drag CSV file containing brands</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Headers: Name, Website, Country, Categories, Description, Contact Email
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-3 text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
              />
            </div>

            {/* Preview Breakdown */}
            {previewData && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">CSV Analysis Preview:</span>
                  <div className="flex gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {previewData.readyToImportCount} Ready
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                      {previewData.duplicateCount} Duplicates
                    </span>
                    {previewData.errors?.length > 0 && (
                      <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {previewData.errors.length} Format Errors
                      </span>
                    )}
                  </div>
                </div>

                {previewData.duplicates?.length > 0 && (
                  <div className="text-[11px] text-amber-300/90 space-y-1">
                    <span className="font-semibold">Detected Existing Brands (Skipped):</span>
                    <ul className="list-disc pl-4 text-[10px] text-slate-400">
                      {previewData.duplicates.map((d: any, idx: number) => (
                        <li key={idx}>
                          {d.row.name} — {d.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              {!previewData ? (
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={!file || loading}
                  className="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 cursor-pointer transition-all"
                >
                  {loading ? "Analyzing..." : "Preview Import"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={loading || previewData.readyToImportCount === 0}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-lg disabled:opacity-50 cursor-pointer transition-all shadow-md shadow-cyan-600/20"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {loading ? "Importing..." : `Commit Import (${previewData.readyToImportCount} Brands)`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

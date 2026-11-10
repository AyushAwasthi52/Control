"use client";

import React, { useState } from "react";
import { X, Package, CheckCircle2 } from "lucide-react";

interface LogOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companies: Array<{ id: string; name: string }>;
}

export default function LogOutcomeModal({
  isOpen,
  onClose,
  onSuccess,
  companies,
}: LogOutcomeModalProps) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || "");
  const [responseType, setResponseType] = useState("SAMPLE_OFFERED");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !companyId) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          responseType,
          summary: summary.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to log response.");
      } else {
        setSummary("");
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-glow bg-[#0c1017] rounded-2xl border border-slate-800 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Log Brand Response or Sampling Offer</h3>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Brand</label>
            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Outcome Classification</label>
            <select
              value={responseType}
              onChange={(e) => setResponseType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="INTERESTED">Interested / Positive Reply (Requests info/details)</option>
              <option value="SAMPLE_OFFERED">Sample Offered (Confirmed review unit offer)</option>
              <option value="PRODUCT_SHIPPED">Hardware Received (Controller/gear delivered)</option>
              <option value="NOT_INTERESTED">Declined / Program Inactive</option>
              <option value="OTHER">Other / Clarification</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Outcome Details & Context</label>
            <textarea
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Brand PR rep replied offering Vader 4 Pro sample for honest testing and feedback."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-lg disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-purple-600/20"
            >
              {isSubmitting ? "Logging..." : "Log Outcome"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

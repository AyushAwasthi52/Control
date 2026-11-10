"use client";

import React, { useState, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  Clock, 
  Mail, 
  Building2, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Zap,
  ExternalLink,
  ShieldCheck,
  CheckCheck
} from "lucide-react";

interface ApprovalQueueTabProps {
  onOpenDraftStudioForCompany: (companyId: string) => void;
  onRefreshAll: () => void;
}

export default function ApprovalQueueTab({
  onOpenDraftStudioForCompany,
  onRefreshAll,
}: ApprovalQueueTabProps) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "SENT" | "PENDING">("ALL");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [bulkDispatching, setBulkDispatching] = useState(false);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drafts");
      if (res.ok) {
        const json = await res.json();
        setDrafts(json.drafts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleAutoSend = async (draft: any) => {
    setDispatchingId(draft.id);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApprove: true, provider: "gmail" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Dispatch Error: ${json.error || "Failed to send"}`);
      } else {
        setStatusMessage(`⚡ Email automatically dispatched via Gmail to ${draft.contact.email}!`);
        await fetchDrafts();
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage(`Dispatch Error: ${err.message}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleBulkAutoSendAll = async () => {
    const unsent = drafts.filter((d) => d.status !== "SENT");
    if (unsent.length === 0) return;

    if (!confirm(`Launch automated dispatch for ${unsent.length} pending brand outreach emails via Gmail?`)) {
      return;
    }

    setBulkDispatching(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/pipeline/auto-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyIds: unsent.map((d) => d.companyId),
          preferredProvider: "gmail",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Bulk Dispatch Error: ${json.error}`);
      } else {
        setStatusMessage(`⚡ ${json.message}`);
        await fetchDrafts();
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage(`Bulk Dispatch Error: ${err.message}`);
    } finally {
      setBulkDispatching(false);
    }
  };

  const filtered = drafts.filter((d) => {
    if (filter === "ALL") return true;
    if (filter === "SENT") return d.status === "SENT";
    return d.status !== "SENT";
  });

  const sentCount = drafts.filter((d) => d.status === "SENT").length;
  const pendingCount = drafts.filter((d) => d.status !== "SENT").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Filter & Quick Autonomous Actions */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Autonomous Outreach Dispatches & Activity Log
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                Live Gmail
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Zero manual approval bottlenecks. Dispatched emails and real-time outbox tracking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <button
              onClick={handleBulkAutoSendAll}
              disabled={bulkDispatching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Zap className={`w-3.5 h-3.5 ${bulkDispatching ? "animate-spin" : ""}`} />
              Auto-Send All Queued ({pendingCount})
            </button>
          )}

          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "ALL"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            All Activity ({drafts.length})
          </button>
          <button
            onClick={() => setFilter("SENT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "SENT"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Sent Dispatches ({sentCount})
          </button>
          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "PENDING"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            Queued Leads ({pendingCount})
          </button>
          <button
            onClick={fetchDrafts}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
            title="Refresh Outbox"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 text-xs rounded-xl bg-slate-900 border border-cyan-800 text-cyan-300 flex items-center justify-between shadow-lg">
          <span className="font-medium">{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Dispatches List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400 space-y-2">
            <CheckCheck className="w-8 h-8 text-cyan-400 mx-auto opacity-70" />
            <p className="text-sm font-semibold text-slate-200">No dispatches in this category.</p>
            <p className="text-xs">Discover brands or click "Auto-Send Outreach" on any lead to dispatch directly.</p>
          </div>
        ) : (
          filtered.map((draft) => {
            const isSent = draft.status === "SENT";
            const isDispatching = dispatchingId === draft.id;

            return (
              <div
                key={draft.id}
                className={`glass-panel p-5 rounded-2xl border transition-all space-y-3 ${
                  isSent
                    ? "border-emerald-900/40 bg-emerald-950/10 hover:border-emerald-800/60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm">{draft.company.name}</span>
                    <span className="text-xs text-slate-300 flex items-center gap-1 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <Mail className="w-3 h-3 text-cyan-400" /> {draft.contact.email}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 border border-cyan-900/40">
                      {draft.contact.contactType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 font-mono text-[10px] text-slate-400 border border-slate-800">
                      v{draft.version}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                        isSent
                          ? "bg-emerald-950 text-emerald-300 border-emerald-800/60 shadow-sm shadow-emerald-900/30"
                          : "bg-cyan-950 text-cyan-300 border-cyan-800/50"
                      }`}
                    >
                      {isSent ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          DISPATCHED
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-cyan-400" />
                          READY TO SEND
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Subject & Preview */}
                <div>
                  <div className="text-xs font-semibold text-cyan-300 flex items-center justify-between">
                    <span>{draft.subject}</span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {new Date(draft.updatedAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-3 font-mono bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 mt-1.5 leading-relaxed">
                    {draft.body}
                  </p>
                </div>

                {/* Footer action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <button
                    onClick={() => onOpenDraftStudioForCompany(draft.companyId)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 font-medium cursor-pointer transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Inspect in Studio
                  </button>

                  <div className="flex items-center gap-2">
                    {!isSent ? (
                      <button
                        onClick={() => handleAutoSend(draft)}
                        disabled={isDispatching}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-400/30 cursor-pointer disabled:opacity-50 transition-all"
                      >
                        <Zap className={`w-3.5 h-3.5 ${isDispatching ? "animate-spin" : ""}`} />
                        {isDispatching ? "Sending via Gmail..." : "⚡ Auto-Send via Gmail"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/60">
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Delivered via Gmail SMTP</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

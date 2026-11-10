"use client";

import React from "react";
import { 
  Building2, 
  Mail, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Package, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Clock,
  Activity
} from "lucide-react";

interface AnalyticsData {
  counts: {
    totalCompanies: number;
    nonArchivedCompanies: number;
    researchedCompanies: number;
    companiesWithVerifiedContact: number;
    totalContacts: number;
    verifiedContacts: number;
    totalDrafts: number;
    approvedDrafts: number;
    needsReviewDrafts: number;
    totalSentMessages: number;
    mockSentMessages: number;
    gmailSentMessages: number;
    failedMessages: number;
    totalReplies: number;
    positiveReplies: number;
    confirmedOffers: number;
    productsReceived: number;
    suppressedCount: number;
  };
  rates: {
    researchCoverage: number;
    contactCoverage: number;
    draftReadiness: number;
    replyRate: number;
    positiveReplyRate: number;
    offerConversionRate: number;
  };
  funnel: Array<{
    step: string;
    count: number;
    description: string;
  }>;
}

interface ActivityLogItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  metadata: string | null;
}

interface OverviewTabProps {
  analytics: AnalyticsData | null;
  activityLogs: ActivityLogItem[];
  onNavigate: (tab: "overview" | "leads" | "approvals" | "studio" | "analytics" | "settings") => void;
  onOpenAddModal: () => void;
}

export default function OverviewTab({
  analytics,
  activityLogs,
  onNavigate,
  onOpenAddModal,
}: OverviewTabProps) {
  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mr-3"></div>
        Loading pipeline metrics...
      </div>
    );
  }

  const { counts, rates, funnel } = analytics;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/70 p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -bottom-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Genuinely Grounded Hardware Outreach Experiment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Targeted Sampling & Testing Pipeline
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Curate high-performance controller & peripheral makers, verify public brand contacts, generate fact-backed inquiry drafts from your student profile, and send only with explicit per-message review.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate("approvals")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Review Queue ({counts.needsReviewDrafts})
            </button>
            <button
              onClick={() => onNavigate("leads")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-800 border border-slate-700 text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              Explore Brands ({counts.totalCompanies})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Researched Brands */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Research Coverage</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{counts.researchedCompanies}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
              {rates.researchCoverage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {counts.researchedCompanies} of {counts.nonArchivedCompanies} non-archived brands researched
          </p>
        </div>

        {/* Verified Contacts */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Contact Coverage</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{counts.companiesWithVerifiedContact}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/50">
              {rates.contactCoverage}%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {counts.verifiedContacts} verified public PR/partnership emails
          </p>
        </div>

        {/* Sent Messages */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Outreach Sent</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{counts.totalSentMessages}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {counts.gmailSentMessages} via Gmail
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Autonomous live outreach dispatches
          </p>
        </div>

        {/* Products Received */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hardware Received</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-purple-300">{counts.productsReceived}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
              {counts.confirmedOffers} Offers
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confirmed physical product deliveries
          </p>
        </div>
      </div>

      {/* Main Section: Pipeline Funnel & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Pipeline Conversion Funnel
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact counts across every milestone with zero artificial inflations
              </p>
            </div>
            <button
              onClick={() => onNavigate("analytics")}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {funnel.map((stage, idx) => {
              const maxVal = Math.max(...funnel.map((s) => s.count), 1);
              const percentage = Math.round((stage.count / maxVal) * 100);
              return (
                <div key={stage.step} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{stage.step}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] hidden sm:inline">{stage.description}</span>
                      <span className="font-mono font-bold text-white px-2 py-0.5 bg-slate-800 rounded">
                        {stage.count}
                      </span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Append-Only Audit Log
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent activity recorded.</p>
            ) : (
              activityLogs.slice(0, 15).map((log) => {
                let meta: Record<string, unknown> = {};
                try {
                  meta = log.metadata ? JSON.parse(log.metadata) : {};
                } catch {
                  meta = {};
                }
                const formattedTime = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={log.id} className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-cyan-300 text-[11px]">{log.action}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formattedTime}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {log.entityType}: <span className="font-mono text-slate-400">{log.entityId}</span>
                    </div>
                    {Object.keys(meta).length > 0 && (
                      <div className="mt-1 text-[10px] text-slate-400 truncate font-mono bg-slate-900/60 px-1.5 py-0.5 rounded">
                        {JSON.stringify(meta).replace(/["{}]/g, "")}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

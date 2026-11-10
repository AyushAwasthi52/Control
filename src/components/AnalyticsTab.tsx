"use client";

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Percent, 
  Package, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Send, 
  Plus, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface AnalyticsTabProps {
  analytics: any;
  onRefresh: () => void;
  onOpenLogOutcomeModal: () => void;
}

export default function AnalyticsTab({
  analytics,
  onRefresh,
  onOpenLogOutcomeModal,
}: AnalyticsTabProps) {
  if (!analytics) return <div className="py-12 text-center text-slate-400">Loading analytics...</div>;

  const { counts, rates, funnel } = analytics;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Experiment Metrics & Sampling Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Strict denominator tracking across every stage of brand outreach. Zero fabricated metrics or inflated engagement claims.
          </p>
        </div>

        <button
          onClick={onOpenLogOutcomeModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 cursor-pointer transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Log Reply / Sampling Offer
        </button>
      </div>

      {/* Primary Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Research Coverage */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Research Coverage</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.researchCoverage}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.researchedCompanies}</span> researched ÷{" "}
            <span className="font-semibold text-slate-200">{counts.nonArchivedCompanies}</span> active brands
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Denominator: Non-archived companies in database.
          </p>
        </div>

        {/* Contact Coverage */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Contact Coverage</span>
            <Mail className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.contactCoverage}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.companiesWithVerifiedContact}</span> with verified email ÷{" "}
            <span className="font-semibold text-slate-200">{counts.researchedCompanies}</span> researched
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Denominator: Companies with verified evidence records.
          </p>
        </div>

        {/* Draft Readiness */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Draft Readiness</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.draftReadiness}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.approvedDrafts}</span> approved ÷{" "}
            <span className="font-semibold text-slate-200">{counts.totalDrafts}</span> generated drafts
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Reflects human review progression; not a quality guarantee.
          </p>
        </div>

        {/* Reply Rate */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Reply Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.replyRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.totalReplies}</span> replies ÷{" "}
            <span className="font-semibold text-slate-200">{counts.totalSentMessages}</span> sent messages
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Denominator: Provider-confirmed sent messages.
          </p>
        </div>

        {/* Positive Reply Rate */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Positive Reply Rate</span>
            <Percent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.positiveReplyRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.positiveReplies}</span> positive responses ÷{" "}
            <span className="font-semibold text-slate-200">{counts.totalSentMessages}</span> sent messages
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Includes program invites and review collaboration inquiries.
          </p>
        </div>

        {/* Offer Conversion Rate */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Offer Conversion</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{rates.offerConversionRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="font-semibold text-slate-200">{counts.confirmedOffers}</span> offers ÷{" "}
            <span className="font-semibold text-slate-200">{counts.totalSentMessages}</span> sent messages
          </div>
          <p className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
            Confirmed sample units offered for review/testing.
          </p>
        </div>
      </div>

      {/* Complete Funnel Visualizer */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Pipeline Milestones & Attrition Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {funnel.map((f: any, idx: number) => (
            <div key={f.step} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-center space-y-1">
              <span className="text-[10px] font-mono text-slate-400">Step {idx + 1}</span>
              <div className="text-lg font-black text-cyan-300">{f.count}</div>
              <div className="text-[11px] font-semibold text-slate-200 leading-tight">{f.step}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scientific/Statistical Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-300">Methodology & Small Sample Notice:</strong> Initial experiment results with small cohorts (e.g. &lt;30 sent messages) represent early sampling indicators rather than statistically significant conversion benchmarks. Products received are only logged upon physical confirmation of hardware delivery.
        </div>
      </div>
    </div>
  );
}

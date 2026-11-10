"use client";

import React from "react";
import { Gamepad2, LayoutDashboard, Building2, CheckSquare, Sparkles, BarChart3, Settings, ShieldCheck, Plus, Upload } from "lucide-react";

export type NavTab = "overview" | "leads" | "approvals" | "studio" | "analytics" | "settings";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenDiscoverModal: () => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  pendingApprovalsCount,
  onOpenAddModal,
  onOpenImportModal,
  onOpenDiscoverModal,
}: NavbarProps) {
  const tabs: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: "overview", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Brands & Leads", icon: Building2 },
    { id: "approvals", label: "Outreach Dispatches", icon: CheckSquare, badge: pendingApprovalsCount },
    { id: "studio", label: "Draft Studio", icon: Sparkles },
    { id: "analytics", label: "Analytics & Logs", icon: BarChart3 },
    { id: "settings", label: "Integrations & Setup", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090b10]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent text-lg">
                  OPERATION FREE CONTROLLER
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  MVP 1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Ethical Gaming Hardware Sampling & Fact-Grounded Outreach
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDiscoverModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 hover:bg-cyan-900/60 hover:border-cyan-500 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              Discover Brands
            </button>
            <button
              onClick={onOpenImportModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Import CSV
            </button>
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/20 ring-1 ring-cyan-400/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Autonomous Dispatch Sub-bar */}
      <div className="bg-slate-950/70 border-t border-slate-900 px-4 sm:px-8 py-1 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-cyan-400 font-bold uppercase tracking-wider text-[10px]">Autonomous Dashboard Active:</span>
          <span className="text-slate-300">Live Gmail Dispatch • Automated Fact-Grounded Generation • Duplicate & Suppression Protection Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-slate-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span className="text-emerald-400 font-mono text-[11px]">Gmail Active (ayushawasthi1312@gmail.com)</span>
          <span className="text-slate-600">|</span>
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Anti-Spam Guard Active</span>
        </div>
      </div>
    </header>
  );
}

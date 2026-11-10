"use client";

import React, { useState } from "react";
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  Download, 
  ExternalLink, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Archive,
  RefreshCw,
  Globe,
  Zap,
  CheckCheck,
  CheckSquare,
  Square
} from "lucide-react";

export interface CompanyItem {
  id: string;
  name: string;
  website: string | null;
  normalizedDomain: string | null;
  country: string | null;
  categories: string;
  description: string | null;
  status: string;
  createdAt: string;
  contacts: Array<{
    id: string;
    email: string;
    contactType: string;
    verificationStatus: string;
    sourceUrl: string | null;
  }>;
  researchRecords: Array<{
    id: string;
    sourceUrl: string;
    confidence: string;
  }>;
  drafts: Array<{
    id: string;
    status: string;
    version: number;
  }>;
}

interface LeadsTabProps {
  companies: CompanyItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
  onOpenDiscoverModal: () => void;
  onSelectCompany: (companyId: string) => void;
  onOpenDraftStudioForCompany: (companyId: string) => void;
}

export default function LeadsTab({
  companies,
  isLoading,
  onRefresh,
  onOpenAddModal,
  onOpenImportModal,
  onOpenDiscoverModal,
  onSelectCompany,
  onOpenDraftStudioForCompany,
}: LeadsTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [bulkDispatching, setBulkDispatching] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Extract all unique categories
  const allCategories = Array.from(
    new Set(
      companies.flatMap((c) => {
        try {
          const parsed = JSON.parse(c.categories);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })
    )
  );

  const filteredCompanies = companies.filter((c) => {
    // Search match
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.website && c.website.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q));

    // Status match
    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

    // Category match
    let matchesCategory = categoryFilter === "ALL";
    if (categoryFilter !== "ALL") {
      try {
        const parsed = JSON.parse(c.categories);
        matchesCategory = Array.isArray(parsed) && parsed.includes(categoryFilter);
      } catch {
        matchesCategory = false;
      }
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCompanies.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCompanies.map((c) => c.id));
    }
  };

  const handleAutoSendSingle = async (companyId: string, companyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatchingId(companyId);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/pipeline/auto-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, preferredProvider: "gmail" }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusBanner(`Dispatch Error for ${companyName}: ${json.error || json.message}`);
      } else {
        setStatusBanner(`⚡ ${json.message || `Outreach sent to ${companyName} via Gmail!`}`);
        onRefresh();
      }
    } catch (err: any) {
      setStatusBanner(`Dispatch Error: ${err.message}`);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleBulkAutoSendSelected = async () => {
    if (selectedIds.length === 0) return;

    if (!confirm(`Launch autonomous outreach to ${selectedIds.length} selected brand(s) via Gmail without manual approval?`)) {
      return;
    }

    setBulkDispatching(true);
    setStatusBanner(null);

    try {
      const res = await fetch("/api/pipeline/auto-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: selectedIds, preferredProvider: "gmail" }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusBanner(`Bulk Dispatch Error: ${json.error || json.message}`);
      } else {
        setStatusBanner(`⚡ ${json.message}`);
        setSelectedIds([]);
        onRefresh();
      }
    } catch (err: any) {
      setStatusBanner(`Bulk Dispatch Error: ${err.message}`);
    } finally {
      setBulkDispatching(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Action Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search manufacturers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="RESEARCHED">Researched</option>
              <option value="CONTACT_FOUND">Contact Found</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkAutoSendSelected}
              disabled={bulkDispatching}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/25 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Zap className={`w-3.5 h-3.5 ${bulkDispatching ? "animate-spin" : ""}`} />
              Auto-Send Selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={onRefresh}
            title="Refresh List"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={onOpenDiscoverModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 hover:bg-cyan-900/60 hover:border-cyan-500 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Discover Brands
          </button>
          <a
            href="/api/companies/export"
            download
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            Export CSV
          </a>
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-cyan-400" />
            Import CSV
          </button>
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/20 ring-1 ring-cyan-400/30 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Brand
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="p-3 text-xs rounded-xl bg-slate-900 border border-cyan-800 text-cyan-300 flex items-center justify-between shadow-lg">
          <span className="font-medium">{statusBanner}</span>
          <button onClick={() => setStatusBanner(null)} className="text-slate-400 hover:text-white cursor-pointer ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Leads Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold tracking-wider uppercase text-[11px]">
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="cursor-pointer text-slate-400 hover:text-cyan-400"
                    title={selectedIds.length === filteredCompanies.length ? "Deselect All" : "Select All"}
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredCompanies.length ? (
                      <CheckSquare className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-4">Brand & Website</th>
                <th className="py-3.5 px-4">Categories</th>
                <th className="py-3.5 px-4">Origin</th>
                <th className="py-3.5 px-4">Verified Contact</th>
                <th className="py-3.5 px-4">Outreach Status</th>
                <th className="py-3.5 px-4 text-right">Autonomous Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                    No brands match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((c) => {
                  let cats: string[] = [];
                  try {
                    cats = JSON.parse(c.categories);
                  } catch {
                    cats = [];
                  }
                  const primaryContact = c.contacts[0];
                  const latestDraft = c.drafts[0];
                  const isSent = latestDraft?.status === "SENT";
                  const isSelected = selectedIds.includes(c.id);
                  const isSendingThis = dispatchingId === c.id;

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-900/50 transition-colors group cursor-pointer ${
                        isSelected ? "bg-cyan-950/20" : ""
                      }`}
                      onClick={() => onSelectCompany(c.id)}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center" onClick={(e) => handleToggleSelect(c.id, e)}>
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400 mx-auto" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 hover:text-slate-400 mx-auto" />
                        )}
                      </td>

                      {/* Name & Website */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                          {c.name}
                        </div>
                        {c.website ? (
                          <a
                            href={c.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors mt-0.5"
                          >
                            <Globe className="w-3 h-3" />
                            {c.normalizedDomain || c.website}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400">No domain recorded</span>
                        )}
                      </td>

                      {/* Categories */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {cats.slice(0, 3).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {cat}
                            </span>
                          ))}
                          {cats.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-900 text-slate-400">
                              +{cats.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Country */}
                      <td className="py-3 px-4 text-slate-300">
                        {c.country || "Global"}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4">
                        {primaryContact ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-200">
                              <Mail className="w-3 h-3 text-cyan-400" />
                              <span className="truncate max-w-[170px]">{primaryContact.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 text-cyan-400 border border-cyan-900/40">
                                {primaryContact.contactType}
                              </span>
                              {primaryContact.verificationStatus === "VERIFIED" ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-400 font-medium">
                                  <CheckCircle className="w-2.5 h-2.5" /> Verified
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-400 font-medium">
                                  <AlertCircle className="w-2.5 h-2.5" /> Unverified
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">No contact added</span>
                        )}
                      </td>

                      {/* Outreach Status */}
                      <td className="py-3 px-4">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow-sm shadow-emerald-950">
                            <CheckCheck className="w-3 h-3 text-emerald-400" /> Dispatched
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-slate-900 text-slate-300 border border-slate-800">
                            Ready
                          </span>
                        )}
                      </td>

                      {/* Autonomous Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {!isSent ? (
                            <button
                              onClick={(e) => handleAutoSendSingle(c.id, c.name, e)}
                              disabled={isSendingThis}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/30 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <Zap className={`w-3 h-3 ${isSendingThis ? "animate-spin" : ""}`} />
                              {isSendingThis ? "Sending..." : "⚡ Auto-Send"}
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-400/80 mr-1">Sent via Gmail</span>
                          )}

                          <button
                            onClick={() => onOpenDraftStudioForCompany(c.id)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Studio
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

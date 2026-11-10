"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Compass, 
  Search, 
  Plus, 
  Check, 
  CheckCircle2, 
  Globe, 
  Mail, 
  Sparkles, 
  ArrowRight,
  Filter,
  Cpu,
  RefreshCw,
  ExternalLink,
  Zap
} from "lucide-react";
import { CandidateBrand } from "@/lib/research/discovery";

interface DiscoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiscoverModal({
  isOpen,
  onClose,
  onSuccess,
}: DiscoverModalProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [candidates, setCandidates] = useState<CandidateBrand[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [autoSendingBrand, setAutoSendingBrand] = useState<string | null>(null);
  const [bulkAutoSending, setBulkAutoSending] = useState(false);
  const [crawling, setCrawling] = useState(false);
  
  // Custom URL probe
  const [customUrl, setCustomUrl] = useState("");
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<any | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDynamicCrawl = async () => {
    setCrawling(true);
    setStatusMessage("Scanning web & hardware manufacturer registries for new brands...");
    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "crawl", category, limit: 12 }),
      });
      const data = await res.json();
      if (data.crawled && data.crawled.length > 0) {
        setCandidates((prev) => {
          const names = new Set(prev.map((c) => c.name));
          const fresh = data.crawled.filter((c: CandidateBrand) => !names.has(c.name));
          return [...prev, ...fresh];
        });
        setSelectedBrands((prev) => {
          const next = new Set(prev);
          data.crawled.forEach((c: CandidateBrand) => next.add(c.name));
          return next;
        });
        setStatusMessage(`Discovered ${data.crawled.length} new peripheral manufacturers via live web scan!`);
      } else {
        setStatusMessage("Web scan complete. All known manufacturers in this category are already active.");
      }
    } catch (err: any) {
      setStatusMessage(`Scan error: ${err.message}`);
    } finally {
      setCrawling(false);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (category && category !== "ALL") params.set("category", category);
      params.set("limit", "16");

      const res = await fetch(`/api/discovery?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setCandidates(json.candidates || []);
        // Auto-select all by default for easy 1-click batching
        setSelectedBrands(new Set(json.candidates.map((c: CandidateBrand) => c.name)));
      }
    } catch (err) {
      console.error("Error fetching candidate brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCandidates();
    }
  }, [isOpen, category]);

  if (!isOpen) return null;

  const toggleSelectBrand = (name: string) => {
    const next = new Set(selectedBrands);
    if (next.has(name)) {
      next.delete(name);
    } else {
      next.add(name);
    }
    setSelectedBrands(next);
  };

  const handleCommitSelected = async () => {
    const toCommit = candidates.filter((c) => selectedBrands.has(c.name));
    if (toCommit.length === 0) return;

    setCommitting(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          brands: toCommit,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${json.error}`);
      } else {
        setStatusMessage(`Successfully imported ${json.importedCount} new peripheral brands!`);
        onSuccess();
        setTimeout(() => {
          fetchCandidates();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setCommitting(false);
    }
  };

  const handleAutoSendSingleBrand = async (brand: CandidateBrand, e: React.MouseEvent) => {
    e.stopPropagation();
    setAutoSendingBrand(brand.name);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/pipeline/auto-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateBrand: brand,
          preferredProvider: "gmail",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Dispatch error: ${json.error || json.message}`);
      } else {
        setStatusMessage(`⚡ Outreach automatically dispatched to ${brand.name} via Gmail!`);
        onSuccess();
        setTimeout(() => fetchCandidates(), 1200);
      }
    } catch (err: any) {
      setStatusMessage(`Dispatch error: ${err.message}`);
    } finally {
      setAutoSendingBrand(null);
    }
  };

  const handleAutoSendSelectedBrands = async () => {
    const toSend = candidates.filter((c) => selectedBrands.has(c.name));
    if (toSend.length === 0) return;

    if (!confirm(`Launch autonomous outreach to ${toSend.length} selected brand(s) via Gmail without manual approval?`)) {
      return;
    }

    setBulkAutoSending(true);
    setStatusMessage(null);
    try {
      let successCount = 0;
      for (const brand of toSend) {
        const res = await fetch("/api/pipeline/auto-outreach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ candidateBrand: brand, preferredProvider: "gmail" }),
        });
        if (res.ok) successCount++;
      }
      setStatusMessage(`⚡ Dispatched outreach to ${successCount}/${toSend.length} brands via Gmail!`);
      onSuccess();
      setTimeout(() => fetchCandidates(), 1200);
    } catch (err: any) {
      setStatusMessage(`Dispatch error: ${err.message}`);
    } finally {
      setBulkAutoSending(false);
    }
  };

  const handleProbeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setProbing(true);
    setProbeResult(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "probe",
          websiteUrl: customUrl.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.safe) {
        setStatusMessage(`Probe failed: ${json.error || "Unsafe or unreachable URL"}`);
      } else {
        setProbeResult(json);
      }
    } catch (err: any) {
      setStatusMessage(`Probe error: ${err.message}`);
    } finally {
      setProbing(false);
    }
  };

  const handleAddProbedBrand = async () => {
    if (!probeResult || !customUrl) return;
    try {
      // Derive brand name from domain
      const urlObj = new URL(customUrl);
      const hostParts = urlObj.hostname.replace(/^www\./, "").split(".");
      const name = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);

      const candidate: CandidateBrand = {
        name,
        website: customUrl.trim(),
        country: "Global",
        categories: ["Gaming Peripherals"],
        description: probeResult.description || probeResult.title || `Gaming hardware manufacturer at ${urlObj.hostname}`,
        suggestedContact: probeResult.discoveredEmails?.[0] ? {
          email: probeResult.discoveredEmails[0].email,
          contactType: probeResult.discoveredEmails[0].contactType,
          sourceUrl: customUrl,
          notes: "Discovered via automated website contact probe.",
        } : undefined,
      };

      const res = await fetch("/api/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          brands: [candidate],
        }),
      });

      if (res.ok) {
        setStatusMessage(`Added ${name} to active leads!`);
        setCustomUrl("");
        setProbeResult(null);
        onSuccess();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  const categoriesList = [
    { id: "ALL", label: "All Categories" },
    { id: "CONTROLLERS", label: "Controllers & Hall Effect" },
    { id: "KEYBOARDS", label: "Keyboards & Rapid Trigger" },
    { id: "MICE", label: "Esports Mice" },
    { id: "FIGHTSTICKS", label: "Fightsticks & Leverless" },
    { id: "SIM RACING", label: "Sim Racing Wheels" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel-glow bg-[#0c1017] rounded-2xl border border-slate-800 shadow-2xl p-6 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  Dynamic Brand Discovery Engine
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/50">
                    120+ Curated Brands & Live Web Crawler
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Find new gaming peripheral manufacturers, verify their public PR contacts, and add them to your outreach pipeline.
                </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-800/60 text-cyan-300 text-xs flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Live Web URL Probe (Crawler) */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Automated Website Contact Probe (SSRF-Protected)
            </h4>
            <span className="text-[10px] text-slate-400">Crawls official site for public PR/Partnership emails</span>
          </div>

          <form onSubmit={handleProbeUrl} className="flex gap-2">
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Enter brand website: e.g. https://drunkdeer.com or https://lamzu.com"
              className="flex-1 px-3.5 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={probing || !customUrl.trim()}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg disabled:opacity-50 cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Search className={`w-3.5 h-3.5 ${probing ? "animate-spin text-cyan-400" : ""}`} />
              {probing ? "Probing..." : "Probe Site"}
            </button>
          </form>

          {probeResult && (
            <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{probeResult.title || customUrl}</span>
                <button
                  onClick={handleAddProbedBrand}
                  className="px-3 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded cursor-pointer"
                >
                  Add as Brand Lead
                </button>
              </div>
              {probeResult.description && (
                <p className="text-[11px] text-slate-300 line-clamp-2">{probeResult.description}</p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {probeResult.discoveredEmails?.length > 0 ? (
                  probeResult.discoveredEmails.map((em: any, idx: number) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-emerald-300 border border-emerald-900/40">
                      <Mail className="w-3 h-3 text-emerald-400" /> {em.email} ({em.contactType})
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">No direct mailto links found on home page. Sourced facts captured.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Curated Brand Catalog Discovery */}
        <div className="mt-6 flex-1 flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                placeholder="Search brands by keyword, sensor, or product line (e.g. Hall Effect, Rapid Trigger)..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDynamicCrawl}
                disabled={crawling}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white cursor-pointer transition-all disabled:opacity-50"
                title="Crawl web for more manufacturers"
              >
                <Globe className={`w-3.5 h-3.5 ${crawling ? "animate-spin text-cyan-400" : ""}`} />
                {crawling ? "Scanning Web..." : "🌐 Scan Web for More"}
              </button>

              <button
                onClick={fetchCandidates}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                title="Refresh Discovery"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                  category === cat.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50"
                    : "bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Candidates Grid */}
          <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 space-y-2.5">
            {loading ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                Searching brand registry...
              </div>
            ) : candidates.length === 0 ? (
              <div className="py-10 text-center text-slate-400 glass-panel rounded-xl border border-slate-800 px-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-200">All matching catalog brands in this category are active in your pipeline!</p>
                <p className="text-xs text-slate-400 mt-1">Want more? Trigger our dynamic web crawler to discover and verify brand-new peripheral companies live.</p>
                <button
                  onClick={handleDynamicCrawl}
                  disabled={crawling}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Globe className={`w-4 h-4 ${crawling ? "animate-spin" : ""}`} />
                  {crawling ? "Scanning Web..." : "🌐 Scan Web to Discover More Brands"}
                </button>
              </div>
            ) : (
              candidates.map((brand) => {
                const isSelected = selectedBrands.has(brand.name);
                return (
                  <div
                    key={brand.name}
                    onClick={() => toggleSelectBrand(brand.name)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-cyan-950/20 border-cyan-500/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="font-bold text-white text-sm">{brand.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({brand.country})</span>
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-slate-400 hover:text-cyan-400 inline-flex items-center gap-0.5 text-[11px]"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                        {brand.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {brand.categories.map((c) => (
                          <span key={c} className="px-2 py-0.2 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">
                            {c}
                          </span>
                        ))}
                        {brand.keyProducts?.slice(0, 2).map((p) => (
                          <span key={p} className="px-2 py-0.2 rounded text-[10px] bg-cyan-950/70 text-cyan-300 border border-cyan-800/40">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Contact indicator & Quick Auto-Send */}
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      {brand.suggestedContact ? (
                        <div className="space-y-0.5 text-left sm:text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                            <Mail className="w-3 h-3" /> {brand.suggestedContact.email}
                          </span>
                          <span className="block text-[9px] uppercase font-bold text-cyan-400">
                            {brand.suggestedContact.contactType} Channel Ready
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Official site evidence</span>
                      )}

                      <button
                        onClick={(e) => handleAutoSendSingleBrand(brand, e)}
                        disabled={autoSendingBrand === brand.name}
                        className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-extrabold rounded bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-sm shadow-cyan-500/25 ring-1 ring-cyan-400/30 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                      >
                        <Zap className={`w-3 h-3 ${autoSendingBrand === brand.name ? "animate-spin" : ""}`} />
                        {autoSendingBrand === brand.name ? "Sending..." : "⚡ Auto-Send"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800 mt-4">
          <div className="text-xs text-slate-400">
            Selected <strong className="text-cyan-400">{selectedBrands.size}</strong> of {candidates.length} candidate brands
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCommitSelected}
              disabled={committing || selectedBrands.size === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl disabled:opacity-40 cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {committing ? "Ingesting..." : `Add ${selectedBrands.size} to Leads`}
            </button>
            <button
              onClick={handleAutoSendSelectedBrands}
              disabled={bulkAutoSending || selectedBrands.size === 0}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-cyan-500/25 ring-1 ring-cyan-400/40 disabled:opacity-40 cursor-pointer transition-all"
            >
              <Zap className={`w-3.5 h-3.5 ${bulkAutoSending ? "animate-spin" : ""}`} />
              {bulkAutoSending ? "Auto-Sending..." : `⚡ Auto-Send to ${selectedBrands.size} Selected`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

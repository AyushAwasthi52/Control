"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  History, 
  ExternalLink,
  Save,
  Check,
  Building2,
  Mail,
  User,
  Info,
  Zap
} from "lucide-react";

interface DraftItem {
  id: string;
  companyId: string;
  contactId: string;
  subject: string;
  body: string;
  status: string;
  version: number;
  approvedVersion: number | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  company: {
    id: string;
    name: string;
    website: string | null;
    categories: string;
    researchRecords?: Array<{
      sourceUrl: string;
      facts: string;
      confidence: string;
    }>;
  };
  contact: {
    id: string;
    email: string;
    contactType: string;
    verificationStatus: string;
  };
}

interface DraftStudioProps {
  initialCompanyId?: string | null;
  onRefreshAll: () => void;
}

export default function DraftStudioTab({
  initialCompanyId,
  onRefreshAll,
}: DraftStudioProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(initialCompanyId || "");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  
  const [currentDraft, setCurrentDraft] = useState<DraftItem | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [citedFacts, setCitedFacts] = useState<string[]>([]);
  const [claimWarnings, setClaimWarnings] = useState<string[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Fetch companies and profile
  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies || []);
        if (!selectedCompanyId && data.companies?.length > 0) {
          const firstWithContact = data.companies.find((c: any) => c.contacts?.length > 0) || data.companies[0];
          setSelectedCompanyId(firstWithContact.id);
        }
      });

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setUserProfile(data.profile));
  }, []);

  // When initialCompanyId prop changes
  useEffect(() => {
    if (initialCompanyId) {
      setSelectedCompanyId(initialCompanyId);
    }
  }, [initialCompanyId]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  // Update contact when company changes
  useEffect(() => {
    if (selectedCompany && selectedCompany.contacts?.length > 0) {
      const verified = selectedCompany.contacts.find((c: any) => c.verificationStatus === "VERIFIED");
      setSelectedContactId(verified ? verified.id : selectedCompany.contacts[0].id);
    } else {
      setSelectedContactId("");
    }
    // Fetch latest draft for this company if one exists
    fetchDraftsForCompany(selectedCompanyId);
  }, [selectedCompanyId, selectedCompany]);

  const fetchDraftsForCompany = async (companyId: string) => {
    if (!companyId) return;
    try {
      const res = await fetch(`/api/drafts?companyId=${companyId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.drafts && json.drafts.length > 0) {
          const draft = json.drafts[0];
          loadDraft(draft);
        } else {
          setCurrentDraft(null);
          setSubject("");
          setBody("");
          setCitedFacts([]);
          setClaimWarnings([]);
        }
      }
    } catch (err) {
      console.error("Error fetching drafts:", err);
    }
  };

  const loadDraft = (draft: DraftItem) => {
    setCurrentDraft(draft);
    setSubject(draft.subject);
    setBody(draft.body);
    setSelectedContactId(draft.contactId);
    
    // Scan body for warnings
    validateBodyClaims(draft.body);
  };

  const validateBodyClaims = (text: string) => {
    const warnings: string[] = [];
    if (/\b(millions of followers|100k followers|huge audience|massive fanbase)\b/i.test(text)) {
      warnings.push("Warning: Audience size claims violate authentic student persona guidelines.");
    }
    if (/\b(guaranteed positive review|guaranteed 5-star)\b/i.test(text)) {
      warnings.push("Warning: Promising guaranteed positive reviews violates testing ethics.");
    }
    if (/\b(sponsored by|official partner of)\b/i.test(text)) {
      warnings.push("Warning: Unverified sponsorship claim detected.");
    }
    setClaimWarnings(warnings);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setBody(newText);
    validateBodyClaims(newText);
  };

  // Generate Draft
  const handleGenerate = async () => {
    if (!selectedCompanyId) return;
    setIsGenerating(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/drafts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: selectedCompanyId,
          contactId: selectedContactId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: json.error });
      } else {
        loadDraft(json.draft);
        setCitedFacts(json.citedFacts || []);
        setStatusMessage({
          type: "success",
          text: `Factual draft generated with ${json.citedFacts?.length || 0} cited facts. Saved as NEEDS_REVIEW.`,
        });
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  // Save Edits (increments version and invalidates approval)
  const handleSaveEdits = async () => {
    if (!currentDraft) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/drafts/${currentDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          body,
          contactId: selectedContactId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: json.error });
      } else {
        loadDraft(json.draft);
        if (json.approvalInvalidated) {
          setStatusMessage({
            type: "info",
            text: `Draft updated to v${json.draft.version}. Any prior approval was invalidated — explicit re-approval required before sending.`,
          });
        } else {
          setStatusMessage({
            type: "success",
            text: `Draft saved as v${json.draft.version} (NEEDS_REVIEW).`,
          });
        }
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Explicit Approve
  const handleApprove = async () => {
    if (!currentDraft) return;
    setIsApproving(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/drafts/${currentDraft.id}/approve`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: json.error });
      } else {
        loadDraft(json.draft);
        setStatusMessage({
          type: "success",
          text: `Exact version ${json.draft.version} approved! Ready for individual human send.`,
        });
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsApproving(false);
    }
  };

  // Direct Send via Gmail
  const handleSend = async () => {
    if (!currentDraft) return;

    if (!confirm(`Confirm dispatching outreach email to ${currentDraft.contact.email} via Gmail?\n\nSubject: ${currentDraft.subject}`)) {
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/drafts/${currentDraft.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoApprove: true, provider: "gmail" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({ type: "error", text: json.error });
      } else {
        setStatusMessage({
          type: "success",
          text: `⚡ Outreach successfully dispatched via Gmail! Provider ID: ${json.result?.providerMessageId || json.emailMessageId}`,
        });
        fetchDraftsForCompany(selectedCompanyId);
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message });
    } finally {
      setIsSending(false);
    }
  };

  const isApproved = currentDraft?.status === "APPROVED" && currentDraft.approvedVersion === currentDraft.version;

  return (
    <div className="space-y-6 pb-12">
      {/* Target Selector Banner */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          {/* Company Selector */}
          <div className="w-full sm:w-64">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Brand</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.contacts?.length === 0 ? "(No contacts)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Selector */}
          <div className="w-full sm:w-64">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Recipient Channel</label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {selectedCompany?.contacts?.map((contact: any) => (
                <option key={contact.id} value={contact.id}>
                  {contact.email} ({contact.contactType}) {contact.verificationStatus === "VERIFIED" ? "✓" : "⚠"}
                </option>
              ))}
              {(!selectedCompany?.contacts || selectedCompany.contacts.length === 0) && (
                <option value="">No contacts available</option>
              )}
            </select>
          </div>
        </div>

        {/* Generate / Refresh Button */}
        <div className="flex items-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedCompanyId || !selectedContactId}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-600/20 disabled:opacity-50 cursor-pointer transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating Factual Draft..." : "Generate Grounded Draft"}
          </button>
        </div>
      </div>

      {/* Alert banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            statusMessage.type === "success"
              ? "bg-emerald-950/70 border-emerald-800/60 text-emerald-300"
              : statusMessage.type === "error"
              ? "bg-rose-950/70 border-rose-800/60 text-rose-300"
              : "bg-cyan-950/70 border-cyan-800/60 text-cyan-300"
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Split Screen Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Sourced Evidence & Claims Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Claim Safety Warning Panel */}
          {claimWarnings.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Unsupported Claim Warnings</span>
              </div>
              <ul className="list-disc pl-4 text-[11px] text-amber-200 space-y-1">
                {claimWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Sourced Research Evidence */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Verified Brand Facts (Evidence)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
                {selectedCompany?.researchRecords?.length || 0} Records
              </span>
            </div>

            {selectedCompany?.researchRecords?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No research records logged for {selectedCompany?.name}. Add evidence in Company Detail to cite specific models.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedCompany?.researchRecords?.map((r: any, idx: number) => {
                  let parsed: any = {};
                  try {
                    parsed = JSON.parse(r.facts);
                  } catch {}
                  return (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-cyan-300">{r.sourceType}</span>
                        <span className="text-emerald-400 font-mono text-[10px]">{r.confidence}</span>
                      </div>
                      {parsed.keyProducts && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-400">Products:</strong> {parsed.keyProducts.join(", ")}
                        </div>
                      )}
                      {parsed.innovations && (
                        <div className="text-[11px] text-slate-300">
                          <strong className="text-slate-400">Innovations:</strong> {parsed.innovations.join(", ")}
                        </div>
                      )}
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                      >
                        Source URL <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Genuine Student Profile Grounding */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-400" />
              Approved Profile Claims (Truthful Context)
            </h3>
            <div className="text-xs space-y-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Sender Identity:</span>
                <span className="font-semibold text-white">{userProfile?.displayName || "Ayush"}</span> ({userProfile?.country || "India"})
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Background:</span>
                <span>{userProfile?.genuineBackground || "Computer Science student and PC gamer"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Hardware Focus:</span>
                <span className="text-cyan-300">{userProfile?.interests || "Controllers, Hall effect joysticks"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Draft Editor & Approval Workflow (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col">
          {/* Status and Version Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Draft State:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isApproved
                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
                    : currentDraft?.status === "SENT"
                    ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                    : currentDraft?.status === "REJECTED"
                    ? "bg-rose-950/80 text-rose-300 border-rose-700/60"
                    : "bg-amber-950/80 text-amber-300 border-amber-700/60"
                }`}
              >
                {currentDraft?.status || "NO DRAFT"}
              </span>
              {currentDraft && (
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
                  v{currentDraft.version}
                </span>
              )}
            </div>

            {isApproved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approved Version {currentDraft?.approvedVersion}
              </span>
            )}
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject Line</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Product-sampling inquiry — [Specific Model / Innovation]"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white font-medium focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Body Field */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Personalized Message Body</label>
              <span className="text-[10px] text-slate-400 font-mono">{body.length} characters</span>
            </div>
            <textarea
              rows={14}
              value={body}
              onChange={handleBodyChange}
              placeholder="Generate or draft your fact-grounded sampling inquiry..."
              className="w-full flex-1 px-3.5 py-3 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 leading-relaxed font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Invalidation Warning */}
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Safety Guard:</strong> Approval binds strictly to the exact subject, recipient, and body text. Any modification will invalidate the approval and revert the status to <em>NEEDS_REVIEW</em>.
            </span>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdits}
                disabled={isSaving || !currentDraft}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-50 cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                {isSaving ? "Saving..." : "Save Edits"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApprove}
                disabled={isApproving || !currentDraft || isApproved || currentDraft.status === "SENT"}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isApproving ? "Approving..." : isApproved ? "Version Approved" : `Approve v${currentDraft?.version || 1}`}
              </button>

              <button
                onClick={handleSend}
                disabled={isSending || !currentDraft || currentDraft?.status === "SENT"}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-extrabold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/25 disabled:opacity-40 cursor-pointer transition-all ring-1 ring-cyan-400/40"
              >
                <Zap className="w-3.5 h-3.5" />
                {isSending ? "Dispatching via Gmail..." : currentDraft?.status === "SENT" ? "Message Sent (Gmail)" : "⚡ Send Outreach Now via Gmail"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

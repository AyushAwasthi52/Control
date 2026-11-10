"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Building2, 
  Globe, 
  ExternalLink, 
  Mail, 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  FileText, 
  Package, 
  Trash2,
  Send,
  MessageSquare,
  ShieldCheck
} from "lucide-react";

interface CompanyDetailProps {
  companyId: string | null;
  onClose: () => void;
  onRefresh: () => void;
  onOpenDraftStudio: (companyId: string) => void;
}

export default function CompanyModal({
  companyId,
  onClose,
  onRefresh,
  onOpenDraftStudio,
}: CompanyDetailProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "contacts" | "research" | "responses">("overview");

  // Form states
  const [newEmail, setNewEmail] = useState("");
  const [newContactType, setNewContactType] = useState("PARTNERSHIPS");
  const [newContactNotes, setNewContactNotes] = useState("");
  const [addingContact, setAddingContact] = useState(false);

  const [researchUrl, setResearchUrl] = useState("");
  const [researchProducts, setResearchProducts] = useState("");
  const [researchInnovations, setResearchInnovations] = useState("");
  const [researchNotes, setResearchNotes] = useState("");
  const [addingResearch, setAddingResearch] = useState(false);

  const [responseType, setResponseType] = useState("SAMPLE_OFFERED");
  const [responseSummary, setResponseSummary] = useState("");
  const [loggingResponse, setLoggingResponse] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.company);
      }
    } catch (err) {
      console.error("Error fetching company detail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [companyId]);

  if (!companyId) return null;

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setAddingContact(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          email: newEmail,
          contactType: newContactType,
          notes: newContactNotes,
          verificationStatus: "VERIFIED",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${json.error}`);
      } else {
        setStatusMessage("Verified contact added successfully.");
        setNewEmail("");
        setNewContactNotes("");
        fetchDetail();
        onRefresh();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setAddingContact(false);
    }
  };

  const handleToggleVerification = async (contactId: string, currentStatus: string) => {
    const newStatus = currentStatus === "VERIFIED" ? "UNVERIFIED" : "VERIFIED";
    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });
      fetchDetail();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingResearch(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/research/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          sourceUrl: researchUrl || data?.website,
          keyProducts: researchProducts,
          innovations: researchInnovations,
          notes: researchNotes,
          confidence: "VERIFIED",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${json.error}`);
      } else {
        setStatusMessage("Research record added with verified provenance.");
        setResearchUrl("");
        setResearchProducts("");
        setResearchInnovations("");
        setResearchNotes("");
        fetchDetail();
        onRefresh();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setAddingResearch(false);
    }
  };

  const handleLogResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseSummary) return;
    setLoggingResponse(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          responseType,
          summary: responseSummary,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${json.error}`);
      } else {
        setStatusMessage("Outreach response / offer outcome logged.");
        setResponseSummary("");
        fetchDetail();
        onRefresh();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoggingResponse(false);
    }
  };

  const categories = data?.categories ? JSON.parse(data.categories) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel-glow bg-[#0c1017] rounded-2xl border border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between bg-slate-950/60 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{data?.name || "Loading..."}</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                {data?.status?.replace("_", " ")}
              </span>
            </div>
            {data?.website && (
              <a
                href={data.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mt-1 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                {data.normalizedDomain || data.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDraftStudio(companyId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Draft Studio
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div className="px-6 py-2.5 text-xs bg-slate-900 border-b border-slate-800 text-cyan-300 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Sub-tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          {(["overview", "contacts", "research", "responses"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeSubTab === tab
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "overview" && "Profile"}
              {tab === "contacts" && `Contacts (${data?.contacts?.length || 0})`}
              {tab === "research" && `Research Records (${data?.researchRecords?.length || 0})`}
              {tab === "responses" && `Responses & Outcomes (${data?.responses?.length || 0})`}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading details...</div>
          ) : (
            <>
              {/* SUBTAB: OVERVIEW */}
              {activeSubTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((c: string) => (
                        <span key={c} className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 text-cyan-300 border border-slate-800">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Description & Mission</h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      {data?.description || "No description recorded."}
                    </p>
                  </div>

                  {/* Sourced facts summary */}
                  <div>
                    <h3 className="text-xs font-semibold uppercase text-slate-400 mb-2">Verified Sourced Hardware</h3>
                    {data?.researchRecords?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.researchRecords.map((r: any) => {
                          let parsedFacts: any = {};
                          try {
                            parsedFacts = JSON.parse(r.facts);
                          } catch {}
                          return (
                            <div key={r.id} className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-slate-400">
                                <span className="font-semibold text-cyan-300">{r.sourceType}</span>
                                <span className="text-[10px] text-emerald-400 font-mono">{r.confidence}</span>
                              </div>
                              {parsedFacts.keyProducts && (
                                <p className="text-slate-300 text-[11px]">
                                  <strong className="text-slate-400">Key Products:</strong> {parsedFacts.keyProducts.join(", ")}
                                </p>
                              )}
                              {parsedFacts.innovations && (
                                <p className="text-slate-300 text-[11px]">
                                  <strong className="text-slate-400">Innovations:</strong> {parsedFacts.innovations.join(", ")}
                                </p>
                              )}
                              <a
                                href={r.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1"
                              >
                                Provenance Link <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No research records yet. Add evidence in the Research tab.</p>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB: CONTACTS */}
              {activeSubTab === "contacts" && (
                <div className="space-y-6">
                  {/* Contacts List */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">Public Business Contacts</h3>
                    {data?.contacts?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No contacts added. Use the form below to register a verified email channel.</p>
                    ) : (
                      data.contacts.map((contact: any) => (
                        <div key={contact.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white">{contact.email}</span>
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-300">
                                {contact.contactType}
                              </span>
                            </div>
                            {contact.notes && <p className="text-[11px] text-slate-400">{contact.notes}</p>}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleVerification(contact.id, contact.verificationStatus)}
                              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded cursor-pointer transition-all ${
                                contact.verificationStatus === "VERIFIED"
                                  ? "bg-emerald-950/70 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/50"
                                  : "bg-amber-950/70 text-amber-400 border border-amber-800/50 hover:bg-amber-900/50"
                              }`}
                            >
                              {contact.verificationStatus === "VERIFIED" ? (
                                <>
                                  <CheckCircle className="w-3 h-3" /> Verified
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" /> Mark Verified
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Contact Form */}
                  <form onSubmit={handleAddContact} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-cyan-400" /> Add Legitimate Public Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="press@brand.com or partnerships@brand.com"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <select
                          value={newContactType}
                          onChange={(e) => setNewContactType(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="PR">PR / Media</option>
                          <option value="PARTNERSHIPS">Partnerships</option>
                          <option value="SUPPORT">Support</option>
                          <option value="GENERAL">General</option>
                        </select>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={newContactNotes}
                      onChange={(e) => setNewContactNotes(e.target.value)}
                      placeholder="Source notes: Found on brand official contact/about page"
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={addingContact}
                      className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all cursor-pointer"
                    >
                      {addingContact ? "Adding..." : "Add & Verify Contact"}
                    </button>
                  </form>
                </div>
              )}

              {/* SUBTAB: RESEARCH */}
              {activeSubTab === "research" && (
                <div className="space-y-6">
                  {/* Research Form */}
                  <form onSubmit={handleAddResearch} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-cyan-400" /> Sourced Evidence Record (SSRF Protected)
                    </h4>
                    <div>
                      <input
                        type="url"
                        value={researchUrl}
                        onChange={(e) => setResearchUrl(e.target.value)}
                        placeholder={data?.website || "https://official-brand.com/products"}
                        className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={researchProducts}
                        onChange={(e) => setResearchProducts(e.target.value)}
                        placeholder="Key Products: e.g. Ultimate 2.4G, Vader 4 Pro, Hall Effect sticks"
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                      <input
                        type="text"
                        value={researchInnovations}
                        onChange={(e) => setResearchInnovations(e.target.value)}
                        placeholder="Innovations: e.g. Anti-drift Hall joysticks, 1000Hz polling rate"
                        className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <textarea
                      value={researchNotes}
                      onChange={(e) => setResearchNotes(e.target.value)}
                      rows={2}
                      placeholder="Additional notes on brand testing programs, community reviews..."
                      className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      disabled={addingResearch}
                      className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all cursor-pointer"
                    >
                      {addingResearch ? "Recording..." : "Record Verified Evidence"}
                    </button>
                  </form>
                </div>
              )}

              {/* SUBTAB: RESPONSES & OUTCOMES */}
              {activeSubTab === "responses" && (
                <div className="space-y-6">
                  {/* Logged responses */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase text-slate-400">Response & Offer History</h3>
                    {data?.responses?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No responses logged yet for this brand.</p>
                    ) : (
                      data.responses.map((resp: any) => (
                        <div key={resp.id} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-purple-300">{resp.responseType.replace("_", " ")}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(resp.receivedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{resp.summary}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Manual outcome logging form */}
                  <form onSubmit={handleLogResponse} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-cyan-400" /> Record Response / Product Sampling Offer
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <select
                          value={responseType}
                          onChange={(e) => setResponseType(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="INTERESTED">Interested / Positive Reply</option>
                          <option value="SAMPLE_OFFERED">Sample Offered / Accepted</option>
                          <option value="PRODUCT_SHIPPED">Hardware Received</option>
                          <option value="NOT_INTERESTED">Declined / Program Inactive</option>
                          <option value="OTHER">Other Query</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          required
                          value={responseSummary}
                          onChange={(e) => setResponseSummary(e.target.value)}
                          placeholder="Summary: e.g. PR team offered Vader 4 Pro review unit for feedback"
                          className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loggingResponse}
                      className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all cursor-pointer"
                    >
                      {loggingResponse ? "Logging..." : "Log Outcome"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

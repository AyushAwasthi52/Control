"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  ShieldCheck, 
  Mail, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw,
  Lock,
  Radio
} from "lucide-react";

interface SettingsTabProps {
  onRefreshAll: () => void;
}

export default function SettingsTab({ onRefreshAll }: SettingsTabProps) {
  // Profile state
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [genuineBackground, setGenuineBackground] = useState("");
  const [interests, setInterests] = useState("");
  const [approvedSignature, setApprovedSignature] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Suppression state
  const [suppressions, setSuppressions] = useState<any[]>([]);
  const [suppressEmail, setSuppressEmail] = useState("");
  const [suppressDomain, setSuppressDomain] = useState("");
  const [suppressReason, setSuppressReason] = useState("User requested opt-out");
  const [addingSuppression, setAddingSuppression] = useState(false);

  // Integration state
  const [integrationInfo, setIntegrationInfo] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchSuppressions();
    fetchIntegrationStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const json = await res.json();
        setProfile(json.profile);
        setDisplayName(json.profile.displayName);
        setCountry(json.profile.country);
        setGenuineBackground(json.profile.genuineBackground);
        setInterests(json.profile.interests);
        setApprovedSignature(json.profile.approvedSignature);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppressions = async () => {
    try {
      const res = await fetch("/api/suppressions");
      if (res.ok) {
        const json = await res.json();
        setSuppressions(json.suppressions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIntegrationStatus = async () => {
    try {
      const res = await fetch("/api/integrations/gmail");
      if (res.ok) {
        const json = await res.json();
        setIntegrationInfo(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          country,
          genuineBackground,
          interests,
          approvedSignature,
        }),
      });
      if (res.ok) {
        setStatusMessage("Profile claims updated. New drafts will ground on these verified details.");
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage(`Error saving profile: ${err.message}`);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSuppression = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suppressEmail && !suppressDomain) return;
    setAddingSuppression(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/suppressions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: suppressEmail || undefined,
          domain: suppressDomain || undefined,
          reason: suppressReason,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatusMessage(`Error: ${json.error}`);
      } else {
        setStatusMessage("Suppression added. Delivery to this target is permanently blocked.");
        setSuppressEmail("");
        setSuppressDomain("");
        fetchSuppressions();
        onRefreshAll();
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setAddingSuppression(false);
    }
  };

  const handleDeleteSuppression = async (id: string) => {
    if (!confirm("Remove this entry from the suppression list?")) return;
    try {
      await fetch(`/api/suppressions/${id}`, { method: "DELETE" });
      fetchSuppressions();
      onRefreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setStatusMessage(null);
    try {
      await fetchIntegrationStatus();
      setStatusMessage(integrationInfo?.testResult?.message || "Connection active.");
    } catch (err: any) {
      setStatusMessage(`Connection test failed: ${err.message}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          Settings, Genuine Persona & Safety Controls
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure your authentic student researcher claims, manage email delivery providers, and maintain the opt-out suppression registry.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 text-xs rounded-xl bg-slate-900 border border-cyan-800 text-cyan-300 flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Profile and Email Provider */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Genuine Profile Claims Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Genuine User Profile Claims</h3>
          </div>
          <p className="text-[11px] text-slate-400">
            All drafts cite these claims. No fake influencer statistics, follower counts, or fabricated press affiliations.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Genuine Academic / Gaming Background</label>
              <input
                type="text"
                value={genuineBackground}
                onChange={(e) => setGenuineBackground(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hardware & Peripheral Interests</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Approved Email Signature</label>
              <textarea
                rows={3}
                value={approvedSignature}
                onChange={(e) => setApprovedSignature(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {savingProfile ? "Saving..." : "Save Profile Claims"}
            </button>
          </form>
        </div>

        {/* Email Provider & Security Controls */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Live Email Delivery & Gmail Setup</h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                integrationInfo?.activeProvider === "GMAIL"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-800/60"
                  : "bg-cyan-950 text-cyan-300 border-cyan-800/60"
              }`}
            >
              {integrationInfo?.activeProvider === "GMAIL" ? "● REAL GMAIL ACTIVE" : "○ MOCK SAFE MODE"}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
              {integrationInfo?.testResult?.message || "Safe Mock Provider active. Zero real emails sent during local development."}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:text-white cursor-pointer transition-all"
              >
                {testingConnection ? "Verifying..." : "Test Active Provider"}
              </button>
              {integrationInfo?.gmailAccount && (
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Disconnect Gmail and revert to safe Mock Provider?")) return;
                    await fetch("/api/integrations/gmail", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "disconnect" }),
                    });
                    fetchIntegrationStatus();
                    onRefreshAll();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-300 hover:bg-rose-900/50 cursor-pointer transition-all"
                >
                  Disconnect Gmail
                </button>
              )}
            </div>
          </div>

          {/* Connect Real Gmail via 16-Char App Password */}
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Connect Real Gmail (Instant App Password)
              </h4>
              <span className="text-[10px] text-slate-400">Zero GCP setup needed</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              To send genuine outreach emails from your Gmail account, generate a 16-character App Password at{" "}
              <a
                href="https://myaccount.google.com/apppasswords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 underline font-semibold"
              >
                myaccount.google.com/apppasswords
              </a>{" "}
              (requires 2-Step Verification).
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const emailInput = form.elements.namedItem("gmailEmail") as HTMLInputElement;
                const passInput = form.elements.namedItem("gmailAppPassword") as HTMLInputElement;
                setStatusMessage(null);

                const res = await fetch("/api/integrations/gmail", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "save_app_password",
                    email: emailInput.value,
                    appPassword: passInput.value,
                  }),
                });

                const json = await res.json();
                if (!res.ok) {
                  setStatusMessage(`Error: ${json.error}`);
                } else {
                  setStatusMessage(json.message);
                  passInput.value = "";
                  fetchIntegrationStatus();
                  onRefreshAll();
                }
              }}
              className="space-y-2.5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  name="gmailEmail"
                  type="email"
                  required
                  placeholder="your-email@gmail.com"
                  defaultValue={integrationInfo?.gmailAccount?.accountEmail || ""}
                  className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                />
                <input
                  name="gmailAppPassword"
                  type="password"
                  required
                  placeholder="16-character App Password"
                  className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verify & Activate Live Gmail Sending
              </button>
            </form>
          </div>

          {/* Security Tenets Checklist */}
          <div className="space-y-1.5 text-xs pt-1">
            <h4 className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Enforced Delivery Safeguards
            </h4>
            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Zero bulk sending: Every email requires individual approval & confirmation.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Encrypted credentials: App passwords encrypted with AES-256-GCM.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Opt-out protection: Suppression registry checked before every send attempt.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suppression Registry */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Suppression & Opt-Out Registry</h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
            {suppressions.length} Active Suppressions
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Addresses or domains listed here are automatically checked before every send. Outreach is blocked unconditionally.
        </p>

        {/* Add Suppression Form */}
        <form onSubmit={handleAddSuppression} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-rose-400" /> Add Email or Domain Opt-Out
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={suppressEmail}
              onChange={(e) => setSuppressEmail(e.target.value)}
              placeholder="Email: e.g. optout@brand.com"
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              value={suppressDomain}
              onChange={(e) => setSuppressDomain(e.target.value)}
              placeholder="Domain: e.g. competitor.com"
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <input
              type="text"
              value={suppressReason}
              onChange={(e) => setSuppressReason(e.target.value)}
              placeholder="Reason for suppression"
              className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            disabled={addingSuppression || (!suppressEmail && !suppressDomain)}
            className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {addingSuppression ? "Adding..." : "Add to Suppression List"}
          </button>
        </form>

        {/* Suppressions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Date Added</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {suppressions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    No active suppressions.
                  </td>
                </tr>
              ) : (
                suppressions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-white">
                      {s.normalizedEmail || s.normalizedDomain}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{s.reason}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-900 text-slate-400">
                        {s.source}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteSuppression(s.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

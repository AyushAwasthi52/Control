"use client";

import React, { useState, useEffect } from "react";
import Navbar, { NavTab } from "@/components/Navbar";
import OverviewTab from "@/components/OverviewTab";
import LeadsTab, { CompanyItem } from "@/components/LeadsTab";
import DraftStudioTab from "@/components/DraftStudioTab";
import ApprovalQueueTab from "@/components/ApprovalQueueTab";
import AnalyticsTab from "@/components/AnalyticsTab";
import SettingsTab from "@/components/SettingsTab";
import CompanyModal from "@/components/CompanyModal";
import AddCompanyModal from "@/components/AddCompanyModal";
import CsvImportModal from "@/components/CsvImportModal";
import LogOutcomeModal from "@/components/LogOutcomeModal";
import DiscoverModal from "@/components/DiscoverModal";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);

  // Modals state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [studioCompanyId, setStudioCompanyId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isLogOutcomeModalOpen, setIsLogOutcomeModalOpen] = useState(false);
  const [isDiscoverModalOpen, setIsDiscoverModalOpen] = useState(false);

  // Refresh data
  const fetchAllData = async () => {
    setIsLoadingCompanies(true);
    try {
      const [companiesRes, analyticsRes, activityRes] = await Promise.all([
        fetch("/api/companies"),
        fetch("/api/analytics"),
        fetch("/api/activity?limit=25"),
      ]);

      if (companiesRes.ok) {
        const json = await companiesRes.json();
        setCompanies(json.companies || []);
      }

      if (analyticsRes.ok) {
        const json = await analyticsRes.json();
        setAnalytics(json);
      }

      if (activityRes.ok) {
        const json = await activityRes.json();
        setActivityLogs(json.logs || []);
      }
    } catch (err) {
      console.error("Error loading application state:", err);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenDraftStudioForCompany = (companyId: string) => {
    setStudioCompanyId(companyId);
    setSelectedCompanyId(null);
    setCurrentTab("studio");
  };

  const pendingApprovalsCount = analytics?.counts?.needsReviewDrafts || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#090b10] text-slate-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenDiscoverModal={() => setIsDiscoverModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === "overview" && (
          <OverviewTab
            analytics={analytics}
            activityLogs={activityLogs}
            onNavigate={setCurrentTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {currentTab === "leads" && (
          <LeadsTab
            companies={companies}
            isLoading={isLoadingCompanies}
            onRefresh={fetchAllData}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onOpenDiscoverModal={() => setIsDiscoverModalOpen(true)}
            onSelectCompany={(id) => setSelectedCompanyId(id)}
            onOpenDraftStudioForCompany={handleOpenDraftStudioForCompany}
          />
        )}

        {currentTab === "approvals" && (
          <ApprovalQueueTab
            onOpenDraftStudioForCompany={handleOpenDraftStudioForCompany}
            onRefreshAll={fetchAllData}
          />
        )}

        {currentTab === "studio" && (
          <DraftStudioTab
            initialCompanyId={studioCompanyId}
            onRefreshAll={fetchAllData}
          />
        )}

        {currentTab === "analytics" && (
          <AnalyticsTab
            analytics={analytics}
            onRefresh={fetchAllData}
            onOpenLogOutcomeModal={() => setIsLogOutcomeModalOpen(true)}
          />
        )}

        {currentTab === "settings" && (
          <SettingsTab onRefreshAll={fetchAllData} />
        )}
      </main>

      {/* Modals */}
      <CompanyModal
        companyId={selectedCompanyId}
        onClose={() => setSelectedCompanyId(null)}
        onRefresh={fetchAllData}
        onOpenDraftStudio={handleOpenDraftStudioForCompany}
      />

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchAllData}
      />

      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchAllData}
      />

      <LogOutcomeModal
        isOpen={isLogOutcomeModalOpen}
        onClose={() => setIsLogOutcomeModalOpen(false)}
        onSuccess={fetchAllData}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />

      <DiscoverModal
        isOpen={isDiscoverModalOpen}
        onClose={() => setIsDiscoverModalOpen(false)}
        onSuccess={fetchAllData}
      />
    </div>
  );
}

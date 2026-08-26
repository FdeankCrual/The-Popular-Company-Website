"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { AdvancedAnalyticsReport, WeeklyAnalyticsReport, MonthlyAnalyticsReport } from "../types/analytics";

// Sub-components
import AnalyticsDashboard from "./analytics/AnalyticsDashboard";
import WeeklyReportForm from "./analytics/WeeklyReportForm";
import MonthlyReportForm from "./analytics/MonthlyReportForm";

export default function AnalyticsHub({ initialRoles }: { initialRoles?: string[] }) {
  const canEdit = initialRoles === undefined || initialRoles.some(r => {
    const role = r.toUpperCase();
    return role.includes("ADMIN") || role.includes("PAGE MANAGER") || role.includes("FOUNDER");
  });

  const canAddRow = initialRoles === undefined || initialRoles.some(r => {
    const role = r.toUpperCase();
    return role.includes("ADMIN") || role.includes("ANALYST") || role.includes("FOUNDER");
  });

  const [clients, setClients] = useState<string[]>([]);
  const [configYears, setConfigYears] = useState<string[]>(["2026", "2027", "2028"]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Data State: Record of clientName -> Reports
  const [analyticsData, setAnalyticsData] = useState<Record<string, AdvancedAnalyticsReport[]>>({});
  const [loading, setLoading] = useState(true);
  
  // View State
  const [currentView, setCurrentView] = useState<"Dashboard" | "WeeklyForm" | "MonthlyForm">("Dashboard");
  const [editingReport, setEditingReport] = useState<AdvancedAnalyticsReport | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [res, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getClientResearch"),
        fetch("/api/admin/data?action=getConfig")
      ]);
      
      let configClients: string[] = [];
      let configYears: string[] = [];
      if (configRes.ok) {
        const configData = await configRes.json();
        configClients = configData.workbook_settings?.clients || [];
        configYears = configData.workbook_settings?.years || [];
        setConfigYears(configYears);
      }

      if (res.ok) {
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          let uniqueClients = configClients.length > 0 
            ? [...configClients] 
            : Array.from(new Set(rawData.map(r => r.clientName).filter(Boolean))) as string[];
          
          setClients(uniqueClients.sort());
          if (uniqueClients.length > 0 && !selectedClient) {
            setSelectedClient(uniqueClients[0]);
          }

          // Parse analytics data from _AdvancedAnalytics.json
          const parsedAnalytics: Record<string, AdvancedAnalyticsReport[]> = {};
          rawData.forEach(item => {
            if (item.filePath === '_AdvancedAnalytics.json' && item.markdownContent) {
              try {
                parsedAnalytics[item.clientName] = JSON.parse(item.markdownContent);
              } catch (e) {
                console.error("Failed to parse advanced analytics for", item.clientName);
              }
            }
          });
          setAnalyticsData(parsedAnalytics);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (client: string, data: AdvancedAnalyticsReport[]) => {
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateClientResearch",
          data: {
            clientName: client,
            filePath: "_AdvancedAnalytics.json",
            markdownContent: JSON.stringify(data)
          }
        })
      });
      setAnalyticsData(prev => ({ ...prev, [client]: data }));
    } catch (e) {
      console.error("Failed to save advanced analytics", e);
    }
  };

  const currentReports = useMemo(() => {
    if (!selectedClient) return [];
    return analyticsData[selectedClient] || [];
  }, [selectedClient, analyticsData]);

  const saveReport = (report: AdvancedAnalyticsReport) => {
    if (!selectedClient) return;
    const existing = currentReports.findIndex(r => r.id === report.id);
    let updated: AdvancedAnalyticsReport[];
    
    if (existing >= 0) {
      updated = [...currentReports];
      updated[existing] = report;
    } else {
      updated = [...currentReports, report];
    }
    
    setAnalyticsData(prev => ({ ...prev, [selectedClient]: updated }));
    handleSave(selectedClient, updated);
    setCurrentView("Dashboard");
    setEditingReport(null);
  };

  const deleteReport = (id: string) => {
    if (!selectedClient) return;
    const updated = currentReports.filter(r => r.id !== id);
    setAnalyticsData(prev => ({ ...prev, [selectedClient]: updated }));
    handleSave(selectedClient, updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-dvh text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#191919] text-[#D4D4D4]">
      {/* HEADER */}
      <div className="hidden md:block p-4 md:p-8 border-b border-white/10 shrink-0">
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-2 text-white flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 md:w-8 md:h-8 text-tpc-orange" />
          Analytics Hub
        </h2>
        <p className="text-gray-500 font-mono text-xs md:text-sm uppercase tracking-widest">
          Advanced Reporting & Insights
        </p>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        {/* SIDEBAR (Only visible on Dashboard to maximize space for forms) */}
        {currentView === "Dashboard" && (
          <div className="w-full md:w-64 bg-[#111] border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0">
            <div className="p-2 md:p-4 border-b border-white/10 bg-[#0a0a0a] flex items-center gap-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hidden md:block">Select Client</h2>
              <select
                value={selectedClient || ""}
                onChange={e => setSelectedClient(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-tpc-orange font-bold focus:outline-none focus:border-tpc-orange"
              >
                <option value="" disabled>Select Client</option>
                {clients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="hidden md:block flex-1 overflow-y-auto p-2">
              {clients.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedClient(c)}
                  className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${selectedClient === c ? 'bg-tpc-orange/20 text-tpc-orange font-bold' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col bg-[#151515] min-w-0 min-h-0">
          {!selectedClient ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <FileSpreadsheet className="w-16 h-16 mb-4 opacity-20" />
              <p className="uppercase tracking-widest text-xs font-bold">Select a Client</p>
            </div>
          ) : (
            <>
              {currentView === "Dashboard" && (
                <AnalyticsDashboard
                  clientName={selectedClient}
                  reports={currentReports}
                  canEdit={canAddRow || canEdit}
                  onNewReport={(type) => {
                    setEditingReport(null);
                    setCurrentView(type === "Weekly" ? "WeeklyForm" : "MonthlyForm");
                  }}
                  onEditReport={(report) => {
                    setEditingReport(report);
                    setCurrentView(report.type === "Weekly" ? "WeeklyForm" : "MonthlyForm");
                  }}
                  onDeleteReport={deleteReport}
                />
              )}
              
              {currentView === "WeeklyForm" && (
                <WeeklyReportForm
                  clientName={selectedClient}
                  initialData={editingReport as WeeklyAnalyticsReport}
                  configYears={configYears}
                  onSave={saveReport}
                  onCancel={() => { setCurrentView("Dashboard"); setEditingReport(null); }}
                />
              )}

              {currentView === "MonthlyForm" && (
                <MonthlyReportForm
                  clientName={selectedClient}
                  initialData={editingReport as MonthlyAnalyticsReport}
                  configYears={configYears}
                  onSave={saveReport}
                  onCancel={() => { setCurrentView("Dashboard"); setEditingReport(null); }}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { MonthlyContentResearchReport } from "../../../admin/types/research";
import { AdvancedAnalyticsReport } from "../../../admin/types/analytics";
import MonthlyResearchForm from "./MonthlyResearchForm";
import MonthlyResearchViewer from "./MonthlyResearchViewer";

interface Props {
  clientName: string;
  canEdit: boolean;
  researchFiles: any[]; // The raw items from getClientResearch
}

export default function MonthlyStrategyHub({ clientName, canEdit, researchFiles }: Props) {
  const [reports, setReports] = useState<MonthlyContentResearchReport[]>([]);
  const [analyticsReports, setAnalyticsReports] = useState<AdvancedAnalyticsReport[]>([]);
  const [viewState, setViewState] = useState<"list" | "form" | "view">("list");
  const [selectedReport, setSelectedReport] = useState<MonthlyContentResearchReport | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Extract Monthly Research Reports
    const researchFile = researchFiles.find(f => f.clientName === clientName && f.filePath === "_MonthlyResearch.json");
    if (researchFile && researchFile.markdownContent) {
      try {
        setReports(JSON.parse(researchFile.markdownContent));
      } catch (e) {
        console.error("Failed to parse monthly research", e);
      }
    } else {
      setReports([]);
    }

    // Extract Analytics Reports for auto-pulling
    const analyticsFile = researchFiles.find(f => f.clientName === clientName && f.filePath === "_AdvancedAnalytics.json");
    if (analyticsFile && analyticsFile.markdownContent) {
      try {
        setAnalyticsReports(JSON.parse(analyticsFile.markdownContent));
      } catch (e) {
        console.error("Failed to parse analytics", e);
      }
    } else {
      setAnalyticsReports([]);
    }
  }, [researchFiles, clientName]);

  const saveToDatabase = async (updatedReports: MonthlyContentResearchReport[]) => {
    setSaving(true);
    try {
      await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateClientResearch",
          data: {
            clientName: clientName,
            filePath: "_MonthlyResearch.json",
            markdownContent: JSON.stringify(updatedReports, null, 2)
          }
        })
      });
      setReports(updatedReports);
      setViewState("list");
      setSelectedReport(null);
    } catch (e) {
      console.error("Failed to save research", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReport = async (reportData: MonthlyContentResearchReport) => {
    const existingIndex = reports.findIndex(r => r.id === reportData.id);
    let newReports = [...reports];
    if (existingIndex >= 0) {
      newReports[existingIndex] = reportData;
    } else {
      newReports.push(reportData);
    }
    await saveToDatabase(newReports);
  };

  const handleDeleteReport = async (id: string) => {
    if (confirm("Are you sure you want to delete this research report permanently?")) {
      const newReports = reports.filter(r => r.id !== id);
      await saveToDatabase(newReports);
    }
  };

  if (viewState === "form") {
    return (
      <div className="h-full overflow-hidden p-4 md:p-8 relative">
        {saving && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="flex items-center gap-2 bg-black px-6 py-3 rounded-lg text-tpc-orange font-bold uppercase tracking-widest text-sm border border-tpc-orange/20">
              <Loader2 className="w-5 h-5 animate-spin" /> Saving...
            </div>
          </div>
        )}
        <MonthlyResearchForm
          clientName={clientName}
          initialData={selectedReport || undefined}
          analyticsReports={analyticsReports}
          onSave={handleSaveReport}
          onCancel={() => { setViewState("list"); setSelectedReport(null); }}
        />
      </div>
    );
  }

  if (viewState === "view" && selectedReport) {
    return (
      <div className="h-full overflow-hidden">
        <MonthlyResearchViewer
          clientName={clientName}
          report={selectedReport}
          onBack={() => { setViewState("list"); setSelectedReport(null); }}
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/10">
        <div className="min-w-0 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase truncate">{clientName} Strategy Reports</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 uppercase tracking-widest truncate">Executive Content Research & Planning</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setViewState("form")}
            className="w-full sm:w-auto justify-center bg-tpc-orange text-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        )}
      </div>

      {reports.length === 0 ? (
        <div className="text-center p-12 bg-[#111] rounded-xl border border-white/10">
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">No strategy reports found for this client.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...reports].sort((a, b) => new Date(b.datePrepared).getTime() - new Date(a.datePrepared).getTime()).map(report => (
            <div key={report.id} className="bg-[#111] border border-white/10 p-6 rounded-xl hover:border-tpc-orange/30 transition-colors relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-xs font-bold text-tpc-orange uppercase tracking-widest mb-1">{report.month} {report.year}</div>
                  <h3 className="text-white font-bold">{report.scorecard.overallPerformance ? `Score: ${report.scorecard.overallPerformance}/10` : 'No Score Yet'}</h3>
                </div>
                <div className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${report.status === "Final" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"}`}>
                  {report.status}
                </div>
              </div>
              
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-6">
                Prepared by: {report.preparedBy || "Unknown"}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedReport(report); setViewState("view"); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  View Report
                </button>
                {canEdit && (
                  <>
                    <button 
                      onClick={() => { setSelectedReport(report); setViewState("form"); }}
                      className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded transition-colors"
                      title="Edit Report"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

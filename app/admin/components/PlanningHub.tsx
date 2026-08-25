"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2, Presentation, Calendar, Database, FileText, Target } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AdvancedAnalyticsReport, MonthlyAnalyticsReport, WeeklyAnalyticsReport } from "../types/analytics";

export default function PlanningHub({ initialRoles }: { initialRoles?: string[] }) {
  // Admins only
  const isAdmin = initialRoles === undefined || initialRoles.some(r => {
    const role = r.toUpperCase();
    return role.includes("ADMIN") || role.includes("FOUNDER") || role.includes("DIRECTOR");
  });

  const [clients, setClients] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  const [months, setMonths] = useState<{ month: string, year: string }[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");

  const [researchData, setResearchData] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<Record<string, AdvancedAnalyticsReport[]>>({});
  const [workbookData, setWorkbookData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [researchRes, workbookRes, configRes] = await Promise.all([
        fetch("/api/admin/data?action=getClientResearch"),
        fetch("/api/admin/data?action=getWorkbook"),
        fetch("/api/admin/data?action=getConfig")
      ]);

      let allClients = new Set<string>();
      let hasConfig = false;

      if (configRes.ok) {
        const configData = await configRes.json();
        const configClients = configData.workbook_settings?.clients || [];
        if (configClients.length > 0) {
          hasConfig = true;
          configClients.forEach((c: string) => allClients.add(c));
        }
      }

      if (researchRes.ok) {
        const rawRes = await researchRes.json();
        if (Array.isArray(rawRes)) {
          setResearchData(rawRes);
          if (!hasConfig) {
            rawRes.forEach(r => r.clientName && allClients.add(r.clientName));
          }
          
          const parsedAnalytics: Record<string, AdvancedAnalyticsReport[]> = {};
          rawRes.forEach(item => {
            if (item.filePath === '_AdvancedAnalytics.json' && item.markdownContent) {
              try {
                parsedAnalytics[item.clientName] = JSON.parse(item.markdownContent);
              } catch (e) {}
            }
          });
          setAnalyticsData(parsedAnalytics);
        }
      }

      if (workbookRes.ok) {
        const rawWb = await workbookRes.json();
        if (Array.isArray(rawWb)) {
          setWorkbookData(rawWb);
          if (!hasConfig) {
            rawWb.forEach(w => w.client && allClients.add(w.client));
          }
        }
      }

      const uniqueClients = Array.from(allClients).sort();
      setClients(uniqueClients);
      if (uniqueClients.length > 0 && !selectedClient) {
        setSelectedClient(uniqueClients[0]);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Extract distinct months and years from the analytics data to populate dropdowns
  useEffect(() => {
    if (selectedClient && analyticsData[selectedClient]) {
      const clientAnalytics = analyticsData[selectedClient];
      const distinctCombos = Array.from(new Set(clientAnalytics.map(a => `${a.month}||${a.year}`)));
      const parsed = distinctCombos.map(c => {
        const [month, year] = c.split("||");
        return { month, year };
      }).sort((a, b) => {
        if (a.year !== b.year) return a.year.localeCompare(b.year);
        return a.month.localeCompare(b.month);
      });
      
      setMonths(parsed);
      
      if (parsed.length > 0) {
        // Only set if current selection is invalid
        const isValid = parsed.some(p => p.month === selectedMonth && p.year === selectedYear);
        if (!isValid) {
          setSelectedMonth(parsed[0].month);
          setSelectedYear(parsed[0].year);
        }
      } else {
        setSelectedMonth("");
        setSelectedYear("");
      }
    } else {
      setMonths([]);
      setSelectedMonth("");
      setSelectedYear("");
    }
  }, [selectedClient, analyticsData]);

  const currentAnalytics = useMemo(() => {
    if (!selectedClient || !selectedMonth || !selectedYear || !analyticsData[selectedClient]) return [];
    return analyticsData[selectedClient].filter(a => a.month === selectedMonth && a.year === selectedYear);
  }, [selectedClient, selectedMonth, selectedYear, analyticsData]);

  const activeTasks = useMemo(() => {
    if (!selectedClient) return [];
    return workbookData.filter(t => t.client === selectedClient && t.status !== "Completed" && t.status !== "Posted");
  }, [selectedClient, workbookData]);

  const researchNote = useMemo(() => {
    if (!selectedClient || !selectedMonth || !selectedYear) return null;
    
    const expectedFolder = `${selectedMonth} ${selectedYear}/`;
    const monthSpecific = researchData.find(r => r.clientName === selectedClient && r.filePath.startsWith(expectedFolder));
    if (monthSpecific) return monthSpecific;

    const oldMonthSpecific = researchData.find(r => r.clientName === selectedClient && r.filePath.startsWith(selectedMonth + "/"));
    if (oldMonthSpecific) return oldMonthSpecific;

    return researchData.find(r => r.clientName === selectedClient && (r.filePath === "Index.md" || r.filePath.toLowerCase() === "research.md" || r.filePath === "_Index.md"));
  }, [selectedClient, selectedMonth, selectedYear, researchData]);

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center h-[calc(100dvh-60px)] md:h-dvh text-gray-500 bg-[#191919]">
        <div className="text-center">
          <Presentation className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold uppercase tracking-widest text-white mb-2">Access Denied</h2>
          <p className="text-xs uppercase tracking-widest">You do not have permission to view the Planning Hub.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100dvh-60px)] md:h-dvh text-gray-500 bg-[#191919]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-60px)] md:h-dvh bg-[#191919] text-[#D4D4D4]">
      {/* HEADER */}
      <div className="p-4 md:p-6 border-b border-white/10 shrink-0 bg-[#0a0a0a] flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-1 text-white flex items-center gap-3">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-tpc-orange" />
            Planning Hub
          </h2>
          <p className="text-gray-500 font-mono text-[10px] md:text-xs uppercase tracking-widest">
            Combined Intelligence for Directors & Admins
          </p>
        </div>
        
        <div className="flex gap-4">
          <select
            value={selectedClient || ""}
            onChange={e => setSelectedClient(e.target.value)}
            className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white font-bold focus:outline-none focus:border-tpc-orange"
          >
            <option value="" disabled>Select Client</option>
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={`${selectedMonth}||${selectedYear}`}
            onChange={e => {
              const [m, y] = e.target.value.split("||");
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
            disabled={!selectedClient || months.length === 0}
            className="bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-tpc-orange font-bold focus:outline-none focus:border-tpc-orange disabled:opacity-50"
          >
            <option value="||" disabled>Select Period</option>
            {months.map(m => <option key={`${m.month}||${m.year}`} value={`${m.month}||${m.year}`}>{m.month} {m.year}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {!selectedClient ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Presentation className="w-16 h-16 mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-xs font-bold">Select a Client to start planning</p>
          </div>
        ) : !selectedMonth || !selectedYear ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Calendar className="w-16 h-16 mb-4 opacity-20" />
            <p className="uppercase tracking-widest text-xs font-bold">Select a Period</p>
            <p className="text-[10px] uppercase tracking-widest mt-2">(If empty, ensure Analytics have been submitted for this client)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            
            {/* COLUMN 1: RESEARCH */}
            <div className="bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex items-center gap-2">
                <FileText className="w-4 h-4 text-tpc-orange" />
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Research & Notes</h3>
              </div>
              <div className="p-6 overflow-y-auto flex-1 prose prose-invert prose-sm prose-orange">
                {researchNote ? (
                  <>
                    <div className="text-[10px] font-mono text-gray-500 mb-4 border-b border-white/10 pb-2">Source: {researchNote.filePath}</div>
                    <ReactMarkdown>{researchNote.markdownContent}</ReactMarkdown>
                  </>
                ) : (
                  <p className="text-gray-500 italic">No research document found for this month.</p>
                )}
              </div>
            </div>

            {/* COLUMN 2: ANALYTICS */}
            <div className="bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Analytics Performance</h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {currentAnalytics.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No analytics reported for this month.</p>
                ) : (
                  currentAnalytics.map(report => {
                    const isWeekly = report.type === "Weekly";
                    const wReport = report as WeeklyAnalyticsReport;
                    const mReport = report as MonthlyAnalyticsReport;
                    
                    const title = isWeekly ? wReport.reportingWeek : "Monthly Summary";
                    const growth = report.endingFollowers - report.startingFollowers;
                    const er = isWeekly 
                      ? ((wReport.totalLikes + wReport.totalComments + wReport.totalShares + wReport.totalSaves) / (wReport.totalReach || 1) * 100).toFixed(2)
                      : ((mReport.totalLikes + mReport.totalComments + mReport.totalShares + mReport.totalSaves) / (mReport.totalAccountsReached || 1) * 100).toFixed(2);
                    const reach = isWeekly ? wReport.totalReach : mReport.totalAccountsReached;

                    return (
                      <div key={report.id} className={`border border-white/10 rounded-xl p-4 ${report.status === 'Draft' ? 'bg-black/30 opacity-70' : 'bg-black/50'}`}>
                        <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-3">
                          <div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type: {report.type}</div>
                            <div className="text-sm font-bold text-white">{title}</div>
                          </div>
                          <div className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${report.status === 'Submitted' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            {report.status}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-blue-500/10 p-2 rounded text-center border border-blue-500/20">
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Growth</div>
                            <div className={`font-black text-sm ${growth >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{growth > 0 ? '+' : ''}{growth}</div>
                          </div>
                          <div className="bg-green-500/10 p-2 rounded text-center border border-green-500/20">
                            <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">Reach</div>
                            <div className="font-black text-green-400 text-sm">{reach || "-"}</div>
                          </div>
                          <div className="bg-purple-500/10 p-2 rounded text-center border border-purple-500/20">
                            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-1">Eng. Rate</div>
                            <div className="font-black text-purple-400 text-sm">{er}%</div>
                          </div>
                        </div>

                        {/* Top Highlights */}
                        {!isWeekly && (
                          <div className="text-xs text-gray-400 mb-2">
                            <span className="font-bold text-tpc-orange">Biggest Win:</span> {mReport.biggestWin || "N/A"}
                          </div>
                        )}
                        {isWeekly && (
                          <div className="text-xs text-gray-400 mb-2">
                            <span className="font-bold text-tpc-orange">Worked well:</span> {wReport.whatWorked || "N/A"}
                          </div>
                        )}
                        
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COLUMN 3: WORKBOOK EXECUTION */}
            <div className="bg-[#111] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" />
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Active Execution</h3>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                {activeTasks.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No active tasks in the workbook.</p>
                ) : (
                  <div className="space-y-3">
                    {activeTasks.map(task => (
                      <div key={task.id} className="bg-black/50 border border-white/10 rounded-lg p-3">
                        <div className="font-bold text-white text-sm mb-1">{task.name || "Untitled"}</div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-2 py-0.5 rounded">{task.status}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{task.platform}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 text-center">Plan next moves</p>
                  <a href="/admin/workbook" className="block w-full text-center bg-tpc-orange hover:bg-white text-black font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded transition-colors">
                    Go to Workbook
                  </a>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

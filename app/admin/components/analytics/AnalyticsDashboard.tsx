"use client";

import { useState, useMemo } from "react";
import { AdvancedAnalyticsReport, WeeklyAnalyticsReport, MonthlyAnalyticsReport } from "../../types/analytics";
import { Plus, Edit2, Trash2, LineChart as LineChartIcon, BarChart2, CheckCircle, Clock, Eye } from "lucide-react";
import ReportViewerModal from "./ReportViewerModal";
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell, Legend 
} from "recharts";

type Props = {
  reports: AdvancedAnalyticsReport[];
  clientName: string;
  onNewReport: (type: "Weekly" | "Monthly") => void;
  onEditReport: (report: AdvancedAnalyticsReport) => void;
  onDeleteReport: (id: string) => void;
  canEdit: boolean;
};

const COLORS = ['#f97316', '#4ECDC4', '#FFE66D', '#1A535C', '#3b82f6'];

export default function AnalyticsDashboard({ reports, clientName, onNewReport, onEditReport, onDeleteReport, canEdit }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [viewingReport, setViewingReport] = useState<AdvancedAnalyticsReport | null>(null);

  const sortedReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
  }, [reports]);

  // Filtering
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      if (selectedMonth !== "All" && r.month !== selectedMonth) return false;
      if (selectedYear !== "All" && r.year !== selectedYear) return false;
      return true;
    });
  }, [reports, selectedMonth, selectedYear]);

  // Data for Charts
  const chartData = useMemo(() => {
    // Only use submitted reports for macro charts
    let submitted = filteredReports.filter(r => r.status === "Submitted");
    
    if (selectedMonth === "All") {
      // Overall view: Only show Monthly reports
      submitted = submitted.filter(r => r.type === "Monthly");
    } else {
      // Specific month view: Show Weekly reports if available to show progression
      const hasWeekly = submitted.some(r => r.type === "Weekly");
      if (hasWeekly) {
        submitted = submitted.filter(r => r.type === "Weekly");
      }
    }

    submitted = submitted.sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime());
    return submitted.map(r => ({
      name: r.type === "Weekly" ? (r as WeeklyAnalyticsReport).reportingWeek : `${r.month} ${r.year}`,
      followers: r.type === "Weekly" ? r.endingFollowers : r.endingFollowers,
      reach: r.type === "Weekly" ? (r as WeeklyAnalyticsReport).totalReach : (r as MonthlyAnalyticsReport).totalAccountsReached,
      engagement: r.type === "Weekly" 
        ? ((r.totalLikes + r.totalComments + r.totalShares + r.totalSaves) / ((r as WeeklyAnalyticsReport).totalReach || 1) * 100).toFixed(2)
        : ((r.totalLikes + r.totalComments + r.totalShares + r.totalSaves) / ((r as MonthlyAnalyticsReport).totalAccountsReached || 1) * 100).toFixed(2)
    }));
  }, [filteredReports]);

  // Aggregate Data for Weekly Breakdown (Only if Month is selected)
  const weeklyData = useMemo(() => {
    if (selectedMonth === "All" || selectedYear === "All") return [];
    const weeks = filteredReports
      .filter(r => r.type === "Weekly" && r.status === "Submitted")
      .sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()) as WeeklyAnalyticsReport[];
    
    return weeks.map(w => ({
      name: w.reportingWeek,
      growth: w.newFollowers - w.unfollowers,
      reach: w.totalReach,
      impressions: w.totalImpressions,
      likes: w.totalLikes,
      comments: w.totalComments,
      shares: w.totalShares,
      saves: w.totalSaves
    }));
  }, [filteredReports, selectedMonth, selectedYear]);

  // Aggregate Data for Content & Engagement Mix (Monthly Report or Sum of Weeklies)
  const mixData = useMemo(() => {
    let totalReels = 0, totalPosts = 0, totalCarousels = 0, totalStories = 0;
    let totalLikes = 0, totalComments = 0, totalShares = 0, totalSaves = 0;

    const submitted = filteredReports.filter(r => r.status === "Submitted");
    submitted.forEach(r => {
      totalLikes += r.totalLikes || 0;
      totalComments += r.totalComments || 0;
      totalShares += r.totalShares || 0;
      totalSaves += r.totalSaves || 0;

      if (r.type === "Weekly") {
        totalReels += (r as WeeklyAnalyticsReport).numReels || 0;
        totalPosts += (r as WeeklyAnalyticsReport).numPosts || 0;
        totalCarousels += (r as WeeklyAnalyticsReport).numCarousels || 0;
        totalStories += (r as WeeklyAnalyticsReport).numStories || 0;
      } else {
        totalReels += (r as MonthlyAnalyticsReport).totalReels || 0;
        totalPosts += (r as MonthlyAnalyticsReport).totalPosts || 0;
        totalCarousels += (r as MonthlyAnalyticsReport).totalCarousels || 0;
        totalStories += (r as MonthlyAnalyticsReport).totalStories || 0;
      }
    });

    return {
      content: [
        { name: "Reels", value: totalReels },
        { name: "Posts", value: totalPosts },
        { name: "Carousels", value: totalCarousels },
        { name: "Stories", value: totalStories },
      ].filter(d => d.value > 0),
      engagement: [
        { name: "Likes", value: totalLikes },
        { name: "Comments", value: totalComments },
        { name: "Shares", value: totalShares },
        { name: "Saves", value: totalSaves },
      ].filter(d => d.value > 0)
    };
  }, [filteredReports]);

  // Aggregate Conversions
  const conversionData = useMemo(() => {
    let visits = 0, web = 0, wa = 0, email = 0, call = 0;
    filteredReports.filter(r => r.status === "Submitted").forEach(r => {
      visits += r.profileVisits || 0;
      web += r.websiteClicks || 0;
      wa += r.whatsappClicks || 0;
      email += r.emailClicks || 0;
      call += r.callClicks || 0;
    });

    return [
      { name: "Profile Visits", value: visits },
      { name: "Website Clicks", value: web },
      { name: "WhatsApp Clicks", value: wa },
      { name: "Email Clicks", value: email },
      { name: "Call Clicks", value: call }
    ].filter(d => d.value > 0);
  }, [filteredReports]);

  const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const allYears = ["2026", "2027", "2028", "2029", "2030"];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#151515] h-full space-y-8">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-white uppercase tracking-widest">{clientName} Dashboard</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest">{filteredReports.length} Reports Total</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={selectedMonth} 
              onChange={e => setSelectedMonth(e.target.value)}
              className="flex-1 sm:flex-none bg-black/50 border border-white/10 p-2 text-xs uppercase font-bold tracking-widest text-white rounded focus:outline-none focus:border-tpc-orange"
            >
              <option value="All">All Months</option>
              {allMonths.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={e => setSelectedYear(e.target.value)}
              className="flex-1 sm:flex-none bg-black/50 border border-white/10 p-2 text-xs uppercase font-bold tracking-widest text-white rounded focus:outline-none focus:border-tpc-orange"
            >
              <option value="All">All Years</option>
              {allYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {canEdit && (
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => onNewReport("Weekly")} className="flex-1 sm:flex-none justify-center px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Weekly
              </button>
              <button onClick={() => onNewReport("Monthly")} className="flex-1 sm:flex-none justify-center px-3 py-2 bg-tpc-orange hover:bg-white text-black rounded text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors">
                <Plus className="w-3 h-3" /> Monthly
              </button>
            </div>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <LineChartIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="uppercase tracking-widest text-xs font-bold">No reports found for this client</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* SECTION 1: MACRO TRENDS */}
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Macro Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              
              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-64 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Follower Growth</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                      <Area type="monotone" dataKey="followers" stroke="#f97316" fillOpacity={1} fill="url(#colorFollowers)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-64 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Reach</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                      <Area type="monotone" dataKey="reach" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorReach)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-64 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Engagement Rate (%)</h3>
                <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} cursor={{fill: '#222'}} />
                      <Bar dataKey="engagement" fill="#FFE66D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: WEEKLY AGGREGATION (Only visible when a month & year is selected) */}
          {selectedMonth !== "All" && selectedYear !== "All" && weeklyData.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Weekly Breakdown: {selectedMonth} {selectedYear}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-72 flex flex-col">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Reach vs Impressions</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} cursor={{fill: '#222'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                        <Bar dataKey="reach" name="Reach" fill="#4ECDC4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="impressions" name="Impressions" fill="#1A535C" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-72 flex flex-col">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Weekly Engagement Mix</h3>
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10, fill: '#666'}} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} cursor={{fill: '#222'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                        <Bar dataKey="likes" stackId="a" name="Likes" fill="#f97316" />
                        <Bar dataKey="comments" stackId="a" name="Comments" fill="#FFE66D" />
                        <Bar dataKey="shares" stackId="a" name="Shares" fill="#4ECDC4" />
                        <Bar dataKey="saves" stackId="a" name="Saves" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* SECTION 3: MIX & CONVERSION */}
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Content & Conversions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-72 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Content Mix</h3>
                {mixData.content.length > 0 ? (
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={mixData.content} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {mixData.content.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-widest">No Content Data</div>
                )}
              </div>

              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-72 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Engagement Mix</h3>
                {mixData.engagement.length > 0 ? (
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={mixData.engagement} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {mixData.engagement.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} />
                        <Legend wrapperStyle={{fontSize: '10px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-widest">No Engagement Data</div>
                )}
              </div>

              <div className="bg-[#111] p-4 rounded-xl border border-white/10 h-72 flex flex-col">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Conversion Funnel</h3>
                {conversionData.length > 0 ? (
                  <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={conversionData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#666'}} axisLine={false} tickLine={false} width={80} />
                        <Tooltip contentStyle={{backgroundColor: '#111', borderColor: '#333', fontSize: '12px'}} cursor={{fill: '#222'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                          {conversionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-gray-500 uppercase tracking-widest">No Conversion Data</div>
                )}
              </div>

            </div>
          </div>

          {/* SECTION 4: REPORT LIBRARY */}
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Report Library</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Monthly Reports */}
              <div>
                <h3 className="text-[10px] font-bold text-tpc-orange uppercase tracking-widest mb-3">Monthly Reports</h3>
                <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {sortedReports
                      .filter(r => r.type === "Monthly")
                      .filter(r => {
                        if (selectedMonth !== "All" && r.month !== selectedMonth) return false;
                        if (selectedYear !== "All" && r.year !== selectedYear) return false;
                        return true;
                      })
                      .map(report => (
                      <div key={report.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-tpc-orange/20 text-tpc-orange">
                            <BarChart2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {report.month} {report.year}
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                              {new Date(report.dateSubmitted).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded flex items-center gap-1 ${
                            report.status === "Submitted" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {report.status === "Submitted" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="hidden md:inline">{report.status}</span>
                          </div>
                          
                          <button onClick={() => setViewingReport(report)} className="p-2 text-blue-400 hover:text-white bg-black/50 hover:bg-blue-500/20 rounded transition-colors" title="View Report">
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          {canEdit && (
                            <>
                              <button onClick={() => onEditReport(report)} className="p-2 text-gray-400 hover:text-white bg-black/50 hover:bg-white/10 rounded transition-colors" title="Edit">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => {
                                if (confirm("Delete this report permanently?")) {
                                  onDeleteReport(report.id);
                                }
                              }} className="p-2 text-red-500/50 hover:text-red-500 bg-black/50 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {sortedReports.filter(r => r.type === "Monthly").filter(r => (selectedMonth === "All" || r.month === selectedMonth) && (selectedYear === "All" || r.year === selectedYear)).length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                        No monthly reports found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Weekly Reports */}
              <div>
                <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-3">Weekly Reports</h3>
                <div className="bg-[#111] rounded-xl border border-white/10 overflow-hidden">
                  <div className="divide-y divide-white/5">
                    {sortedReports
                      .filter(r => r.type === "Weekly")
                      .filter(r => {
                        if (selectedMonth !== "All" && r.month !== selectedMonth) return false;
                        if (selectedYear !== "All" && r.year !== selectedYear) return false;
                        return true;
                      })
                      .map(report => (
                      <div key={report.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-blue-500/20 text-blue-500">
                            <LineChartIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {(report as WeeklyAnalyticsReport).reportingWeek}
                            </h4>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                              {report.month} {report.year} • {new Date(report.dateSubmitted).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded flex items-center gap-1 ${
                            report.status === "Submitted" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {report.status === "Submitted" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            <span className="hidden md:inline">{report.status}</span>
                          </div>

                          <button onClick={() => setViewingReport(report)} className="p-2 text-blue-400 hover:text-white bg-black/50 hover:bg-blue-500/20 rounded transition-colors" title="View Report">
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          {canEdit && (
                            <>
                              <button onClick={() => onEditReport(report)} className="p-2 text-gray-400 hover:text-white bg-black/50 hover:bg-white/10 rounded transition-colors" title="Edit">
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button onClick={() => {
                                if (confirm("Delete this report permanently?")) {
                                  onDeleteReport(report.id);
                                }
                              }} className="p-2 text-red-500/50 hover:text-red-500 bg-black/50 hover:bg-red-500/10 rounded transition-colors" title="Delete">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {sortedReports.filter(r => r.type === "Weekly").filter(r => (selectedMonth === "All" || r.month === selectedMonth) && (selectedYear === "All" || r.year === selectedYear)).length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                        No weekly reports found.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {viewingReport && (
        <ReportViewerModal report={viewingReport} onClose={() => setViewingReport(null)} />
      )}
    </div>
  );
}

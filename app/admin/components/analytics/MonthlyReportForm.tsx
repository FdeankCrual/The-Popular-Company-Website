"use client";

import { useState } from "react";
import { MonthlyAnalyticsReport, ContentPerformanceRow, CategoryPerformanceRow } from "../../types/analytics";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";

interface MonthlyReportFormProps {
  clientName: string;
  initialData?: MonthlyAnalyticsReport;
  configYears?: string[];
  onSave: (data: MonthlyAnalyticsReport) => void;
  onCancel: () => void;
}

export default function MonthlyReportForm({ clientName, initialData, configYears = [], onSave, onCancel }: MonthlyReportFormProps) {
  const [data, setData] = useState<MonthlyAnalyticsReport>(
    initialData || {
      id: "rpt_" + Math.random().toString(36).substring(2, 9),
      type: "Monthly",
      status: "Draft",
      month: "",
      year: "",
      submittedBy: "",
      dateSubmitted: new Date().toISOString(),
      startingFollowers: 0,
      endingFollowers: 0,
      totalAccountsReached: 0,
      totalImpressions: 0,
      totalReels: 0,
      totalPosts: 0,
      totalCarousels: 0,
      totalStories: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
      websiteClicks: 0,
      profileVisits: 0,
      whatsappClicks: 0,
      emailClicks: 0,
      callClicks: 0,
      topContent: [],
      demographics: {
        topCities: [],
        topCountries: [],
        ageDistribution: [],
        gender: { male: 0, female: 0, other: 0 },
        mostActiveDays: [],
        mostActiveHours: ""
      },
      categoryPerformance: [],
      biggestWin: "",
      biggestChallenge: "",
      contentToRepeat: "",
      contentToStop: "",
      newIdeasToTest: "",
      lessonsLearned: "",
      targetFollowers: 0,
      targetEngagementRate: 0,
      targetReach: 0,
      targetWebsiteClicks: 0,
      actionPlan: ""
    }
  );

  const updateField = (field: keyof MonthlyAnalyticsReport, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const netGrowth = data.endingFollowers - data.startingFollowers;
  const growthPercent = data.startingFollowers ? ((netGrowth / data.startingFollowers) * 100).toFixed(2) : "0.00";
  const totalContent = data.totalReels + data.totalPosts + data.totalCarousels + data.totalStories;
  const totalEngagement = data.totalLikes + data.totalComments + data.totalShares + data.totalSaves;
  const avgEr = data.totalAccountsReached ? ((totalEngagement / data.totalAccountsReached) * 100).toFixed(2) : "0.00";
  const websiteClickRate = data.profileVisits ? ((data.websiteClicks / data.profileVisits) * 100).toFixed(2) : "0.00";

  const handleSave = (status: "Draft" | "Submitted") => {
    onSave({ ...data, status });
  };

  const renderContentRow = (post: ContentPerformanceRow, index: number) => {
    const updatePost = (field: keyof ContentPerformanceRow, value: any) => {
      const newList = [...data.topContent];
      newList[index] = { ...newList[index], [field]: value };
      updateField("topContent", newList);
    };
    const postEngagement = post.likes + post.comments + post.shares + post.saves;
    const postEr = post.reach ? ((postEngagement / post.reach) * 100).toFixed(2) : "0.00";

    return (
      <div key={post.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-black/20 p-2 rounded border border-white/5">
        <div className="col-span-2"><input placeholder="Title" value={post.title} onChange={e => updatePost("title", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-2">
          <select value={post.type} onChange={e => updatePost("type", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white">
            <option value="">Type</option>
            <option value="Reel">Reel</option><option value="Post">Post</option><option value="Carousel">Carousel</option><option value="Story">Story</option>
          </select>
        </div>
        <div className="col-span-2"><input type="number" placeholder="Reach" value={post.reach || ""} onChange={e => updatePost("reach", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-4 grid grid-cols-4 gap-1">
          <input type="number" placeholder="L" value={post.likes || ""} onChange={e => updatePost("likes", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" />
          <input type="number" placeholder="C" value={post.comments || ""} onChange={e => updatePost("comments", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" />
          <input type="number" placeholder="S" value={post.shares || ""} onChange={e => updatePost("shares", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" />
          <input type="number" placeholder="Sv" value={post.saves || ""} onChange={e => updatePost("saves", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" />
        </div>
        <div className="col-span-1 text-center text-xs font-bold text-tpc-orange">{postEr}%</div>
        <div className="col-span-1 text-right">
          <button onClick={() => { const nl = [...data.topContent]; nl.splice(index, 1); updateField("topContent", nl); }} className="text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    );
  };

  const renderCategoryRow = (cat: CategoryPerformanceRow, index: number) => {
    const updateCat = (field: keyof CategoryPerformanceRow, value: any) => {
      const newList = [...data.categoryPerformance];
      newList[index] = { ...newList[index], [field]: value };
      updateField("categoryPerformance", newList);
    };

    return (
      <div key={cat.id} className="grid grid-cols-5 gap-2 mb-2 items-center bg-black/20 p-2 rounded border border-white/5">
        <div className="col-span-1"><input placeholder="Category (e.g. Educational)" value={cat.categoryName} onChange={e => updateCat("categoryName", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-1"><input type="number" placeholder="Posts" value={cat.numberOfPosts || ""} onChange={e => updateCat("numberOfPosts", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-1"><input type="number" placeholder="Avg Reach" value={cat.averageReach || ""} onChange={e => updateCat("averageReach", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-1"><input type="number" placeholder="Avg ER %" value={cat.averageEngagementRate || ""} onChange={e => updateCat("averageEngagementRate", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" /></div>
        <div className="col-span-1 text-right">
          <button onClick={() => { const nl = [...data.categoryPerformance]; nl.splice(index, 1); updateField("categoryPerformance", nl); }} className="text-red-500 p-1"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111] border border-white/10 md:rounded-2xl flex flex-col flex-1 h-full overflow-hidden min-h-0">
      <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">{clientName} - Monthly Report</h2>
            <div className="text-[10px] text-tpc-orange font-mono">Status: {data.status}</div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => handleSave("Draft")} className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => handleSave("Submitted")} className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 bg-tpc-orange hover:bg-white text-black rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            Submit Report
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* A. Reporting Info */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-tpc-orange">A. Reporting Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Month</label>
              <select value={data.month} onChange={e => updateField("month", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white">
                {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Year</label>
              <select value={data.year} onChange={e => updateField("year", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white">
                <option value="">Select Year</option>
                {(configYears.length > 0 ? configYears : ["2026", "2027", "2028", "2029", "2030"]).map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Submitted By</label>
              <input type="text" value={data.submittedBy} onChange={e => updateField("submittedBy", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
          </div>
        </section>

        {/* B. Account Growth */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-blue-400">B. Account Growth</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Start Followers</label>
              <input type="number" value={data.startingFollowers || ""} onChange={e => updateField("startingFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">End Followers</label>
              <input type="number" value={data.endingFollowers || ""} onChange={e => updateField("endingFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-1 bg-white/5 p-2 rounded text-center">
              <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Net Growth</div>
              <div className={`font-mono text-lg ${netGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netGrowth > 0 ? '+' : ''}{netGrowth}</div>
            </div>
            <div className="col-span-1 bg-white/5 p-2 rounded text-center">
              <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Growth %</div>
              <div className={`font-mono text-lg ${Number(growthPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{growthPercent}%</div>
            </div>
            <div className="col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Accts Reached</label>
              <input type="number" value={data.totalAccountsReached || ""} onChange={e => updateField("totalAccountsReached", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Impressions</label>
              <input type="number" value={data.totalImpressions || ""} onChange={e => updateField("totalImpressions", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* C. Content Summary */}
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-purple-400">C. Content Summary</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Reels</label>
                <input type="number" value={data.totalReels || ""} onChange={e => updateField("totalReels", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Posts</label>
                <input type="number" value={data.totalPosts || ""} onChange={e => updateField("totalPosts", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Carousels</label>
                <input type="number" value={data.totalCarousels || ""} onChange={e => updateField("totalCarousels", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Stories</label>
                <input type="number" value={data.totalStories || ""} onChange={e => updateField("totalStories", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded flex justify-between items-center">
              <span className="text-[10px] uppercase text-gray-400 font-bold">Total Content Published</span>
              <span className="font-mono text-xl text-white">{totalContent}</span>
            </div>
          </section>

          {/* D. Engagement Summary */}
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-green-400">D. Engagement Summary</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Likes</label>
                <input type="number" value={data.totalLikes || ""} onChange={e => updateField("totalLikes", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Comments</label>
                <input type="number" value={data.totalComments || ""} onChange={e => updateField("totalComments", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Shares</label>
                <input type="number" value={data.totalShares || ""} onChange={e => updateField("totalShares", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Saves</label>
                <input type="number" value={data.totalSaves || ""} onChange={e => updateField("totalSaves", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-3 rounded flex justify-between items-center">
                <span className="text-[10px] uppercase text-gray-400 font-bold">Total Engagement</span>
                <span className="font-mono text-lg text-white">{totalEngagement}</span>
              </div>
              <div className="bg-white/5 p-3 rounded flex justify-between items-center border border-green-500/30">
                <span className="text-[10px] uppercase text-green-400 font-bold">Avg Engagement Rate</span>
                <span className="font-mono text-lg text-green-400">{avgEr}%</span>
              </div>
            </div>
          </section>
        </div>

        {/* E. Conversion & G. Audience (Condensed) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-yellow-400">E. Conversion Metrics</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Website</label>
                <input type="number" value={data.websiteClicks || ""} onChange={e => updateField("websiteClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Visits</label>
                <input type="number" value={data.profileVisits || ""} onChange={e => updateField("profileVisits", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">WhatsApp</label>
                <input type="number" value={data.whatsappClicks || ""} onChange={e => updateField("whatsappClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Call/Email</label>
                <input type="number" value={data.callClicks || ""} onChange={e => updateField("callClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded flex justify-between items-center border border-yellow-500/30">
              <span className="text-[10px] uppercase text-yellow-400 font-bold">Website Click Rate (vs Visits)</span>
              <span className="font-mono text-lg text-yellow-400">{websiteClickRate}%</span>
            </div>
          </section>

          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-pink-400">G. Audience Insights (Highlights)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Gender Split (M / F / O %)</label>
                <div className="flex gap-2">
                  <input type="number" value={data.demographics.gender.male || ""} onChange={e => updateField("demographics", {...data.demographics, gender: {...data.demographics.gender, male: Number(e.target.value)}})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white text-center" placeholder="M" />
                  <input type="number" value={data.demographics.gender.female || ""} onChange={e => updateField("demographics", {...data.demographics, gender: {...data.demographics.gender, female: Number(e.target.value)}})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white text-center" placeholder="F" />
                  <input type="number" value={data.demographics.gender.other || ""} onChange={e => updateField("demographics", {...data.demographics, gender: {...data.demographics.gender, other: Number(e.target.value)}})} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-sm text-white text-center" placeholder="O" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Most Active Hours</label>
                <input type="text" value={data.demographics.mostActiveHours} onChange={e => updateField("demographics", {...data.demographics, mostActiveHours: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded px-3 py-1 text-sm text-white" placeholder="e.g. 6 PM - 9 PM" />
              </div>
            </div>
          </section>
        </div>

        {/* F. Top 10 Content */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-tpc-orange uppercase tracking-widest">F. Top 10 Content</h3>
            <button onClick={() => {
              if (data.topContent.length < 10) {
                updateField("topContent", [...data.topContent, { id: Math.random().toString(), title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }]);
              }
            }} className="text-[10px] uppercase font-bold text-tpc-orange hover:text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Add Post</button>
          </div>
          <div className="text-[10px] text-gray-500 uppercase flex mb-2 grid grid-cols-12 gap-2 px-2">
            <div className="col-span-2">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Reach</div>
            <div className="col-span-4 text-center">Engagement (L/C/S/Sv)</div>
            <div className="col-span-1 text-center">ER%</div>
            <div className="col-span-1"></div>
          </div>
          {data.topContent.map((post, i) => renderContentRow(post, i))}
        </section>

        {/* H. Content Category Performance */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest">H. Category Performance</h3>
            <button onClick={() => {
              updateField("categoryPerformance", [...data.categoryPerformance, { id: Math.random().toString(), categoryName: "", numberOfPosts: 0, averageReach: 0, averageEngagementRate: 0 }]);
            }} className="text-[10px] uppercase font-bold text-teal-400 hover:text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Add Category</button>
          </div>
          <div className="text-[10px] text-gray-500 uppercase flex mb-2 grid grid-cols-5 gap-2 px-2">
            <div className="col-span-1">Category Name</div>
            <div className="col-span-1">Posts</div>
            <div className="col-span-1">Avg Reach</div>
            <div className="col-span-1">Avg ER%</div>
            <div className="col-span-1"></div>
          </div>
          {data.categoryPerformance.map((cat, i) => renderCategoryRow(cat, i))}
        </section>

        {/* I & J Review and Goals */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-tpc-orange">I. Monthly Review & J. Goals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-[10px] uppercase text-green-400 font-bold mb-1 block">Biggest Win</label>
              <textarea value={data.biggestWin} onChange={e => updateField("biggestWin", e.target.value)} className="w-full bg-black/50 border border-green-500/20 rounded px-3 py-2 text-sm text-white min-h-20" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-red-400 font-bold mb-1 block">Biggest Challenge</label>
              <textarea value={data.biggestChallenge} onChange={e => updateField("biggestChallenge", e.target.value)} className="w-full bg-black/50 border border-red-500/20 rounded px-3 py-2 text-sm text-white min-h-20" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Content To Repeat</label>
              <textarea value={data.contentToRepeat} onChange={e => updateField("contentToRepeat", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-20" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">New Ideas To Test</label>
              <textarea value={data.newIdeasToTest} onChange={e => updateField("newIdeasToTest", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-20" />
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded border border-white/10">
            <h4 className="text-[10px] font-bold text-tpc-orange uppercase tracking-widest mb-3">Next Month Goals</h4>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div><input type="number" placeholder="Target Followers" value={data.targetFollowers || ""} onChange={e => updateField("targetFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" /></div>
              <div><input type="number" placeholder="Target ER %" value={data.targetEngagementRate || ""} onChange={e => updateField("targetEngagementRate", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" /></div>
              <div><input type="number" placeholder="Target Reach" value={data.targetReach || ""} onChange={e => updateField("targetReach", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" /></div>
              <div><input type="number" placeholder="Target Clicks" value={data.targetWebsiteClicks || ""} onChange={e => updateField("targetWebsiteClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" /></div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Action Plan</label>
              <textarea value={data.actionPlan} onChange={e => updateField("actionPlan", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-20" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

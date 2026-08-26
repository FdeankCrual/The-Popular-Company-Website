"use client";

import { useState, useMemo } from "react";
import { WeeklyAnalyticsReport, ContentPerformanceRow } from "../../types/analytics";
import { Plus, Trash2, Save, X, ArrowLeft } from "lucide-react";

interface WeeklyReportFormProps {
  clientName: string;
  initialData?: WeeklyAnalyticsReport;
  configYears?: string[];
  onSave: (data: WeeklyAnalyticsReport) => void;
  onCancel: () => void;
}

export default function WeeklyReportForm({ clientName, initialData, configYears = [], onSave, onCancel }: WeeklyReportFormProps) {
  const [data, setData] = useState<WeeklyAnalyticsReport>(
    initialData || {
      id: "rpt_" + Math.random().toString(36).substring(2, 9),
      type: "Weekly",
      status: "Draft",
      reportingWeek: "",
      month: "",
      year: "",
      submittedBy: "",
      dateSubmitted: new Date().toISOString(),
      startingFollowers: 0,
      endingFollowers: 0,
      newFollowers: 0,
      unfollowers: 0,
      numReels: 0,
      numPosts: 0,
      numCarousels: 0,
      numStories: 0,
      totalReach: 0,
      totalImpressions: 0,
      profileVisits: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalSaves: 0,
      websiteClicks: 0,
      whatsappClicks: 0,
      emailClicks: 0,
      callClicks: 0,
      topPosts: [
        { id: "tp1", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 },
        { id: "tp2", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 },
        { id: "tp3", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }
      ],
      bottomPosts: [
        { id: "bp1", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 },
        { id: "bp2", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 },
        { id: "bp3", title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }
      ],
      whatWorked: "",
      whatDidNotWork: "",
      audienceFeedback: "",
      competitorInsights: "",
      recommendations: ""
    }
  );

  const updateField = (field: keyof WeeklyAnalyticsReport, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Calculations
  const netGrowth = data.newFollowers - data.unfollowers;
  const growthPercent = data.startingFollowers ? ((netGrowth / data.startingFollowers) * 100).toFixed(2) : "0.00";
  const totalContent = data.numReels + data.numPosts + data.numCarousels + data.numStories;
  const totalEngagement = data.totalLikes + data.totalComments + data.totalShares + data.totalSaves;
  const engagementRate = data.totalReach ? ((totalEngagement / data.totalReach) * 100).toFixed(2) : "0.00";
  const websiteClickRate = data.profileVisits ? ((data.websiteClicks / data.profileVisits) * 100).toFixed(2) : "0.00";

  const handleSave = (status: "Draft" | "Submitted") => {
    onSave({ ...data, status });
  };

  const renderContentRow = (
    post: ContentPerformanceRow, 
    index: number, 
    listName: "topPosts" | "bottomPosts"
  ) => {
    const updatePost = (field: keyof ContentPerformanceRow, value: any) => {
      const newList = [...data[listName]];
      newList[index] = { ...newList[index], [field]: value };
      updateField(listName, newList);
    };

    const postEngagement = post.likes + post.comments + post.shares + post.saves;
    const postEr = post.reach ? ((postEngagement / post.reach) * 100).toFixed(2) : "0.00";

    return (
      <div key={post.id} className="grid grid-cols-12 gap-2 mb-2 items-center bg-black/20 p-2 rounded border border-white/5">
        <div className="col-span-2">
          <input placeholder="Title" value={post.title} onChange={e => updatePost("title", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" />
        </div>
        <div className="col-span-2">
          <select value={post.type} onChange={e => updatePost("type", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white">
            <option value="">Type</option>
            <option value="Reel">Reel</option>
            <option value="Post">Post</option>
            <option value="Carousel">Carousel</option>
            <option value="Story">Story</option>
          </select>
        </div>
        <div className="col-span-2">
          <input type="number" placeholder="Reach" value={post.reach || ""} onChange={e => updatePost("reach", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white" />
        </div>
        <div className="col-span-4 grid grid-cols-4 gap-1">
          <input type="number" placeholder="L" value={post.likes || ""} onChange={e => updatePost("likes", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" title="Likes" />
          <input type="number" placeholder="C" value={post.comments || ""} onChange={e => updatePost("comments", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" title="Comments" />
          <input type="number" placeholder="S" value={post.shares || ""} onChange={e => updatePost("shares", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" title="Shares" />
          <input type="number" placeholder="Sv" value={post.saves || ""} onChange={e => updatePost("saves", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-1 py-1 text-xs text-white text-center" title="Saves" />
        </div>
        <div className="col-span-1 text-center text-xs font-bold text-tpc-orange">{postEr}%</div>
        <div className="col-span-1 text-right">
          <button onClick={() => {
            const newList = [...data[listName]];
            newList.splice(index, 1);
            updateField(listName, newList);
          }} className="text-red-500 hover:text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#111] border border-white/10 md:rounded-2xl flex flex-col flex-1 h-full overflow-hidden min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">{clientName} - Weekly Report</h2>
            <div className="text-[10px] text-tpc-orange font-mono">Status: {data.status}</div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={() => handleSave("Draft")} className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button onClick={() => handleSave("Submitted")} className="flex-1 md:flex-none justify-center px-4 py-3 md:py-2 bg-tpc-orange hover:bg-white text-black rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2">
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
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Week</label>
              <select value={data.reportingWeek} onChange={e => updateField("reportingWeek", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white">
                <option value="">Select Week</option>
                <option value="Week 1 (1st - 7th)">Week 1 (1st - 7th)</option>
                <option value="Week 2 (8th - 14th)">Week 2 (8th - 14th)</option>
                <option value="Week 3 (15th - 21st)">Week 3 (15th - 21st)</option>
                <option value="Week 4 (22nd - 28th)">Week 4 (22nd - 28th)</option>
                <option value="Week 5 (29th+)">Week 5 (29th+)</option>
              </select>
            </div>
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

        {/* B. Audience Growth */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-blue-400">B. Audience Growth</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Start Followers</label>
              <input type="number" value={data.startingFollowers || ""} onChange={e => updateField("startingFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">End Followers</label>
              <input type="number" value={data.endingFollowers || ""} onChange={e => updateField("endingFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block text-green-500">New</label>
              <input type="number" value={data.newFollowers || ""} onChange={e => updateField("newFollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white border-green-500/30" />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block text-red-500">Unfollowers</label>
              <input type="number" value={data.unfollowers || ""} onChange={e => updateField("unfollowers", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white border-red-500/30" />
            </div>
            
            {/* Auto Calcs */}
            <div className="col-span-1 bg-white/5 p-2 rounded text-center">
              <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Net Growth</div>
              <div className={`font-mono text-lg ${netGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{netGrowth > 0 ? '+' : ''}{netGrowth}</div>
            </div>
            <div className="col-span-1 bg-white/5 p-2 rounded text-center">
              <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Growth %</div>
              <div className={`font-mono text-lg ${Number(growthPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{growthPercent}%</div>
            </div>
          </div>
        </section>

        {/* Content & Reach Group */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* C. Content Published */}
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-purple-400">C. Content Published</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Reels</label>
                <input type="number" value={data.numReels || ""} onChange={e => updateField("numReels", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Posts</label>
                <input type="number" value={data.numPosts || ""} onChange={e => updateField("numPosts", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Carousels</label>
                <input type="number" value={data.numCarousels || ""} onChange={e => updateField("numCarousels", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Stories</label>
                <input type="number" value={data.numStories || ""} onChange={e => updateField("numStories", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded flex justify-between items-center">
              <span className="text-xs uppercase text-gray-400 font-bold">Total Content Published</span>
              <span className="font-mono text-xl text-white">{totalContent}</span>
            </div>
          </section>

          {/* D. Reach & Visibility */}
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-pink-400">D. Reach & Visibility</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Total Reach</label>
                <input type="number" value={data.totalReach || ""} onChange={e => updateField("totalReach", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Impressions</label>
                <input type="number" value={data.totalImpressions || ""} onChange={e => updateField("totalImpressions", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Profile Visits</label>
                <input type="number" value={data.profileVisits || ""} onChange={e => updateField("profileVisits", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
          </section>
        </div>

        {/* E. Engagement & F. Business Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-green-400">E. Engagement</h3>
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
                <span className="text-[10px] uppercase text-green-400 font-bold">Engagement Rate</span>
                <span className="font-mono text-lg text-green-400">{engagementRate}%</span>
              </div>
            </div>
          </section>

          <section className="bg-black/20 p-5 rounded-xl border border-white/5">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-yellow-400">F. Business Actions</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Website</label>
                <input type="number" value={data.websiteClicks || ""} onChange={e => updateField("websiteClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">WhatsApp</label>
                <input type="number" value={data.whatsappClicks || ""} onChange={e => updateField("whatsappClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Email</label>
                <input type="number" value={data.emailClicks || ""} onChange={e => updateField("emailClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Call</label>
                <input type="number" value={data.callClicks || ""} onChange={e => updateField("callClicks", Number(e.target.value))} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
            <div className="bg-white/5 p-3 rounded flex justify-between items-center border border-yellow-500/30">
              <span className="text-[10px] uppercase text-yellow-400 font-bold">Website Click Rate (vs Visits)</span>
              <span className="font-mono text-lg text-yellow-400">{websiteClickRate}%</span>
            </div>
          </section>
        </div>

        {/* G & H Top/Bottom Posts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-black/20 p-5 rounded-xl border border-green-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest">G. Top Performing Posts</h3>
              <button onClick={() => {
                if (data.topPosts.length < 3) {
                  updateField("topPosts", [...data.topPosts, { id: Math.random().toString(), title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }]);
                }
              }} className="text-[10px] uppercase font-bold text-green-400 hover:text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Add Post</button>
            </div>
            <div className="text-[10px] text-gray-500 uppercase flex mb-2 grid grid-cols-12 gap-2 px-2">
              <div className="col-span-2">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Reach</div>
              <div className="col-span-4 text-center">Engagement (L/C/S/Sv)</div>
              <div className="col-span-1 text-center">ER%</div>
              <div className="col-span-1"></div>
            </div>
            {data.topPosts.map((post, i) => renderContentRow(post, i, "topPosts"))}
            {data.topPosts.length === 0 && <div className="text-center text-gray-500 text-xs italic py-4">No top posts added.</div>}
          </section>

          <section className="bg-black/20 p-5 rounded-xl border border-red-500/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-widest">H. Bottom Performing Posts</h3>
              <button onClick={() => {
                if (data.bottomPosts.length < 3) {
                  updateField("bottomPosts", [...data.bottomPosts, { id: Math.random().toString(), title: "", type: "", datePosted: "", reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, followersGained: 0 }]);
                }
              }} className="text-[10px] uppercase font-bold text-red-400 hover:text-white flex items-center gap-1"><Plus className="w-3 h-3"/> Add Post</button>
            </div>
            <div className="text-[10px] text-gray-500 uppercase flex mb-2 grid grid-cols-12 gap-2 px-2">
              <div className="col-span-2">Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Reach</div>
              <div className="col-span-4 text-center">Engagement (L/C/S/Sv)</div>
              <div className="col-span-1 text-center">ER%</div>
              <div className="col-span-1"></div>
            </div>
            {data.bottomPosts.map((post, i) => renderContentRow(post, i, "bottomPosts"))}
            {data.bottomPosts.length === 0 && <div className="text-center text-gray-500 text-xs italic py-4">No bottom posts added.</div>}
          </section>
        </div>

        {/* I. Weekly Insights */}
        <section className="bg-black/20 p-5 rounded-xl border border-white/5">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 text-tpc-orange">I. Weekly Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">What Worked This Week?</label>
              <textarea value={data.whatWorked} onChange={e => updateField("whatWorked", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-24 resize-y" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">What Did Not Work?</label>
              <textarea value={data.whatDidNotWork} onChange={e => updateField("whatDidNotWork", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-24 resize-y" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Audience Feedback / Observations</label>
              <textarea value={data.audienceFeedback} onChange={e => updateField("audienceFeedback", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-24 resize-y" />
            </div>
            <div>
              <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Competitor Insights</label>
              <textarea value={data.competitorInsights} onChange={e => updateField("competitorInsights", e.target.value)} className="w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-24 resize-y" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase text-tpc-orange font-bold mb-1 block">Recommendations For Next Week</label>
              <textarea value={data.recommendations} onChange={e => updateField("recommendations", e.target.value)} className="w-full bg-black/50 border border-tpc-orange/50 rounded px-3 py-2 text-sm text-white min-h-24 resize-y" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

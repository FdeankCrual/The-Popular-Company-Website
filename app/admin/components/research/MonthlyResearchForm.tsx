"use client";

import { useState, useEffect } from "react";
import { MonthlyContentResearchReport, ActionPlanRow, CompetitorCard, ExperimentCard, ContentAnalysisRow, LowContentAnalysisRow, CategoryAnalysis, RiskCard, AIRecommendation } from "../../../admin/types/research";
import { MonthlyAnalyticsReport, AdvancedAnalyticsReport } from "../../../admin/types/analytics";
import { Save, ArrowLeft, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";

interface Props {
  clientName: string;
  initialData?: MonthlyContentResearchReport;
  analyticsReports: AdvancedAnalyticsReport[];
  onSave: (data: MonthlyContentResearchReport) => void;
  onCancel: () => void;
}

const SectionHeader = ({ title, desc }: { title: string, desc?: string }) => (
  <div className="mb-6 border-b border-white/10 pb-2">
    <h2 className="text-lg font-bold text-tpc-orange uppercase tracking-widest">{title}</h2>
    {desc && <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{desc}</p>}
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] uppercase text-gray-400 font-bold mb-1 block">{children}</label>
);

const Input = (props: any) => (
  <input {...props} className={`w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-tpc-orange focus:outline-none ${props.className || ''}`} />
);

const Textarea = (props: any) => (
  <textarea {...props} className={`w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-tpc-orange focus:outline-none min-h-[100px] ${props.className || ''}`} />
);

const Select = (props: any) => (
  <select {...props} className={`w-full bg-black/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-tpc-orange focus:outline-none ${props.className || ''}`}>
    {props.children}
  </select>
);

export default function MonthlyResearchForm({ clientName, initialData, analyticsReports, onSave, onCancel }: Props) {
  // Find all monthly analytics reports to allow user to select which month to base research on
  const monthlyAnalytics = analyticsReports.filter(r => r.type === "Monthly" && r.status === "Submitted") as MonthlyAnalyticsReport[];
  const [saving, setSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const [data, setData] = useState<MonthlyContentResearchReport>(
    initialData || {
      id: "res_" + Math.random().toString(36).substring(2, 9),
      type: "MonthlyResearch",
      status: "Draft",
      month: "",
      year: new Date().getFullYear().toString(),
      preparedBy: "",
      datePrepared: new Date().toISOString(),
      executiveSummary: "",
      kpiOverview: {
        followersGrowth: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        reach: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        impressions: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        engagementRate: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        websiteClicks: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        profileVisits: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" },
        totalContentPublished: { current: 0, previous: 0, difference: 0, percentChange: 0, trend: "flat" }
      },
      performanceDiagnosis: {
        followerGrowthReason: "", engagementReason: "", reachReason: "", biggestPositiveImpact: "", biggestNegativeImpact: "", externalFactors: ""
      },
      topContentAnalysis: [],
      lowContentAnalysis: [],
      categoryResearch: { categories: [], bestCategory: "", worstCategory: "", mostSharesCategory: "", mostSavesCategory: "", mostCommentsCategory: "", highestEngagementCategory: "", investmentRecommendations: "" },
      audienceBehaviour: { audienceChanges: "", demographicShifts: "", engagementBehaviour: "", buyingBehaviour: "", interests: "", newAudienceOpportunities: "", recommendations: "" },
      contentPattern: { bestContentFormat: "", bestPostingTime: "", bestHookStyle: "", bestCTA: "", bestCaptionStyle: "", bestThumbnailStyle: "", bestEditingStyle: "", averageReelLength: "", bestCarouselStyle: "", storyPerformance: "", visualIdentityConsistency: "", brandVoiceConsistency: "", postingFrequencyImpact: "" },
      competitors: [],
      industryTrends: { trendingAudio: "", trendingReelFormats: "", trendingCarouselFormats: "", trendingEditingStyles: "", trendingVisualStyles: "", trendingTopics: "", trendingHooks: "", trendingCTAs: "", emergingTrends: "", decliningTrends: "", futureOpportunities: "", potentialRisks: "" },
      swot: { strengths: "", weaknesses: "", opportunities: "", threats: "" },
      contentGap: { competitorContentWeLack: "", unansweredAudienceQuestions: "", underservedTopics: "", pillarsNeedingImprovement: "", ignoredAudienceSegments: "", unexploredOpportunities: "" },
      experiments: [],
      strategy: { pillars: [], recommendedPostingFrequency: "", recommendedReelLength: "", recommendedStoryFrequency: "", recommendedCarouselFrequency: "", recommendedPostingTimes: "", recommendedHookTypes: "", recommendedCTAStyle: "", recommendedDesignDirection: "", recommendedBrandMessaging: "" },
      actionPlan: [],
      risks: [],
      aiRecommendations: [],
      scorecard: { contentQuality: 0, audienceGrowth: 0, brandConsistency: 0, creativity: 0, communityBuilding: 0, contentDiversity: 0, innovation: 0, execution: 0, overallStrategy: 0, overallPerformance: 0, executiveSummary: "" }
    }
  );

  const [activeTab, setActiveTab] = useState(1);

  // Auto-pull handler
  const handleMonthSelect = (month: string) => {
    updateField("month", month);
    
    // Auto-populate from analytics
    const targetAnalytics = monthlyAnalytics.find(m => m.month === month && m.year === data.year);
    if (targetAnalytics) {
      // Find previous month for comparison
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const currentIdx = monthNames.indexOf(month);
      let prevMonth = "";
      if (currentIdx > 0) prevMonth = monthNames[currentIdx - 1];
      const prevAnalytics = prevMonth ? monthlyAnalytics.find(m => m.month === prevMonth && m.year === data.year) : null;

      const calcKpi = (currentVal: number, prevVal: number = 0) => {
        const diff = currentVal - prevVal;
        const perc = prevVal === 0 ? 100 : (diff / prevVal) * 100;
        return {
          current: currentVal,
          previous: prevVal,
          difference: diff,
          percentChange: Number(perc.toFixed(2)),
          trend: diff > 0 ? "up" : diff < 0 ? "down" : "flat"
        } as any;
      };

      const cEng = targetAnalytics.totalLikes + targetAnalytics.totalComments + targetAnalytics.totalShares + targetAnalytics.totalSaves;
      const cEngRate = targetAnalytics.totalAccountsReached ? (cEng / targetAnalytics.totalAccountsReached) * 100 : 0;
      
      let pEngRate = 0;
      if (prevAnalytics) {
        const pEng = prevAnalytics.totalLikes + prevAnalytics.totalComments + prevAnalytics.totalShares + prevAnalytics.totalSaves;
        pEngRate = prevAnalytics.totalAccountsReached ? (pEng / prevAnalytics.totalAccountsReached) * 100 : 0;
      }

      setData(prev => ({
        ...prev,
        kpiOverview: {
          followersGrowth: calcKpi(targetAnalytics.endingFollowers - targetAnalytics.startingFollowers, prevAnalytics ? (prevAnalytics.endingFollowers - prevAnalytics.startingFollowers) : 0),
          reach: calcKpi(targetAnalytics.totalAccountsReached, prevAnalytics?.totalAccountsReached || 0),
          impressions: calcKpi(targetAnalytics.totalImpressions, prevAnalytics?.totalImpressions || 0),
          engagementRate: calcKpi(cEngRate, pEngRate),
          websiteClicks: calcKpi(targetAnalytics.websiteClicks, prevAnalytics?.websiteClicks || 0),
          profileVisits: calcKpi(targetAnalytics.profileVisits, prevAnalytics?.profileVisits || 0),
          totalContentPublished: calcKpi(
            targetAnalytics.totalReels + targetAnalytics.totalPosts + targetAnalytics.totalCarousels + targetAnalytics.totalStories,
            prevAnalytics ? (prevAnalytics.totalReels + prevAnalytics.totalPosts + prevAnalytics.totalCarousels + prevAnalytics.totalStories) : 0
          )
        },
        topContentAnalysis: targetAnalytics.topContent.slice(0, 10).map(tc => ({
          id: tc.id,
          title: tc.title,
          type: tc.type,
          topic: "", hook: "", cta: "", performanceRating: 0,
          whyPerformedWell: "", audienceResponse: "", lessonsLearned: "", shouldReplicate: "Yes", improvementSuggestions: ""
        })),
        categoryResearch: {
          ...prev.categoryResearch,
          categories: targetAnalytics.categoryPerformance.map(cat => ({
            category: cat.categoryName,
            numberOfPosts: cat.numberOfPosts,
            averageReach: cat.averageReach,
            averageEngagement: cat.averageEngagementRate,
            trend: "flat", researchFindings: "", recommendations: ""
          }))
        },
        executiveSummary: `Biggest Win: ${targetAnalytics.biggestWin}\nBiggest Challenge: ${targetAnalytics.biggestChallenge}`,
        performanceDiagnosis: {
          ...prev.performanceDiagnosis,
          biggestPositiveImpact: targetAnalytics.biggestWin,
          biggestNegativeImpact: targetAnalytics.biggestChallenge,
          externalFactors: targetAnalytics.lessonsLearned
        },
        audienceBehaviour: {
          ...prev.audienceBehaviour,
          demographicShifts: `Top Cities: ${targetAnalytics.demographics?.topCities?.map(c => `${c.name} (${c.percentage}%)`).join(", ") || "N/A"}\nTop Countries: ${targetAnalytics.demographics?.topCountries?.map(c => `${c.name} (${c.percentage}%)`).join(", ") || "N/A"}\nGender: ${targetAnalytics.demographics?.gender?.male}% M, ${targetAnalytics.demographics?.gender?.female}% F`,
          engagementBehaviour: `Most Active Days: ${targetAnalytics.demographics?.mostActiveDays?.join(", ") || "N/A"}\nMost Active Hours: ${targetAnalytics.demographics?.mostActiveHours || "N/A"}`,
        },
        strategy: {
          ...prev.strategy,
          recommendedBrandMessaging: `Content to Repeat: ${targetAnalytics.contentToRepeat}\nContent to Stop: ${targetAnalytics.contentToStop}`,
          recommendedHookTypes: targetAnalytics.newIdeasToTest
        },
        actionPlan: targetAnalytics.actionPlan ? [{
          id: "item_" + Math.random().toString(36).substring(2, 9),
          priority: "High",
          action: targetAnalytics.actionPlan,
          reason: "Pulled from Analytics Action Plan",
          owner: "Content Manager",
          deadline: "",
          expectedOutcome: "",
          status: "Pending"
        }] : prev.actionPlan
      }));
    }
  };

  const updateField = (field: keyof MonthlyContentResearchReport, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (section: keyof MonthlyContentResearchReport, field: string, value: any) => {
    setData(prev => ({ ...prev, [section]: { ...(prev[section] as any), [field]: value } }));
  };

  const addArrayItem = (field: keyof MonthlyContentResearchReport, defaultItem: any) => {
    setData(prev => ({ ...prev, [field]: [...(prev[field] as any[]), { ...defaultItem, id: "item_" + Math.random().toString(36).substring(2, 9) }] }));
  };

  const updateArrayItem = (field: keyof MonthlyContentResearchReport, index: number, itemField: string, value: any) => {
    const newArray = [...(data[field] as any[])];
    newArray[index] = { ...newArray[index], [itemField]: value };
    updateField(field, newArray);
  };

  const removeArrayItem = (field: keyof MonthlyContentResearchReport, index: number) => {
    const newArray = [...(data[field] as any[])];
    newArray.splice(index, 1);
    updateField(field, newArray);
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/admin/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: data, clientName })
      });
      if (!res.ok) throw new Error("Failed to generate insights");
      const { insights } = await res.json();
      if (insights && Array.isArray(insights)) {
        updateField("aiRecommendations", insights);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate AI insights. Check console for details.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const tabs = [
    { id: 1, name: "Overview & KPIs" },
    { id: 2, name: "Content Analysis" },
    { id: 3, name: "Audience & Patterns" },
    { id: 4, name: "Competitors & Trends" },
    { id: 5, name: "SWOT & Strategy" },
    { id: 6, name: "Scorecard" },
  ];

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <button onClick={onCancel} className="text-gray-400 hover:text-white shrink-0"><ArrowLeft className="w-5 h-5" /></button>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-widest truncate">{clientName} - Monthly Research</h2>
            <div className="text-[10px] text-tpc-orange font-mono">Status: {data.status}</div>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => onSave({ ...data, status: "Draft" })} className="flex-1 sm:flex-none px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-widest">
            Save Draft
          </button>
          <button onClick={() => onSave({ ...data, status: "Final" })} className="flex-1 sm:flex-none px-4 py-2 bg-tpc-orange hover:bg-white text-black rounded text-xs font-bold uppercase tracking-widest">
            Finalize Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-white/10 bg-[#151515] shrink-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? 'border-tpc-orange text-tpc-orange bg-tpc-orange/5' : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Form Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12">
        
        {/* TAB 1: OVERVIEW & KPIS */}
        {activeTab === 1 && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <section>
              <SectionHeader title="1. Report Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <Label>Year</Label>
                  <Select value={data.year} onChange={(e: any) => updateField("year", e.target.value)}>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </Select>
                </div>
                <div>
                  <Label>Month to Analyze</Label>
                  <Select value={data.month} onChange={(e: any) => handleMonthSelect(e.target.value)}>
                    <option value="">Select Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                  <p className="text-[10px] text-gray-500 mt-1">Selecting a month auto-pulls analytics data.</p>
                </div>
                <div>
                  <Label>Prepared By</Label>
                  <Input value={data.preparedBy} onChange={(e: any) => updateField("preparedBy", e.target.value)} />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={data.datePrepared.split('T')[0]} onChange={(e: any) => updateField("datePrepared", new Date(e.target.value).toISOString())} />
                </div>
              </div>
              <div>
                <Label>Executive Summary</Label>
                <Textarea className="min-h-[200px]" placeholder="Overall performance, key achievements, major concerns, significant trends..." value={data.executiveSummary} onChange={(e: any) => updateField("executiveSummary", e.target.value)} />
              </div>
            </section>

            <section>
              <SectionHeader title="2. KPI Performance Overview" desc="Auto-pulled from Monthly Analytics" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(data.kpiOverview).map(([key, val]) => (
                  <div key={key} className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-2xl font-bold text-white">{val.current.toLocaleString()}{key === 'engagementRate' ? '%' : ''}</div>
                    <div className={`text-xs mt-1 ${val.trend === 'up' ? 'text-green-500' : val.trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
                      {val.trend === 'up' ? '↑' : val.trend === 'down' ? '↓' : '-'} {val.percentChange}% vs last month
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="3. Performance Diagnosis" desc="Why did metrics change?" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Why did follower growth increase/decrease?</Label>
                  <Textarea value={data.performanceDiagnosis.followerGrowthReason} onChange={(e: any) => updateNestedField("performanceDiagnosis", "followerGrowthReason", e.target.value)} />
                </div>
                <div>
                  <Label>Why did engagement improve/decline?</Label>
                  <Textarea value={data.performanceDiagnosis.engagementReason} onChange={(e: any) => updateNestedField("performanceDiagnosis", "engagementReason", e.target.value)} />
                </div>
                <div>
                  <Label>What had the biggest positive impact?</Label>
                  <Textarea value={data.performanceDiagnosis.biggestPositiveImpact} onChange={(e: any) => updateNestedField("performanceDiagnosis", "biggestPositiveImpact", e.target.value)} />
                </div>
                <div>
                  <Label>What had the biggest negative impact?</Label>
                  <Textarea value={data.performanceDiagnosis.biggestNegativeImpact} onChange={(e: any) => updateNestedField("performanceDiagnosis", "biggestNegativeImpact", e.target.value)} />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: CONTENT ANALYSIS */}
        {activeTab === 2 && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <section>
              <SectionHeader title="4. Top Content Analysis" desc="Analyze the auto-pulled top 10 posts" />
              {data.topContentAnalysis.length === 0 ? (
                <div className="text-gray-500 text-sm">No top content found. Make sure you selected a month that has analytics data.</div>
              ) : (
                <div className="space-y-6">
                  {data.topContentAnalysis.map((row, idx) => (
                    <div key={row.id} className="bg-[#151515] p-5 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white">{row.title} <span className="text-xs text-gray-500 ml-2">({row.type})</span></h4>
                        <div className="flex items-center gap-2">
                          <Label>Rating (1-10)</Label>
                          <Input type="number" min="1" max="10" className="w-20 py-1" value={row.performanceRating} onChange={(e: any) => updateArrayItem("topContentAnalysis", idx, "performanceRating", Number(e.target.value))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Hook Used</Label>
                          <Input value={row.hook} onChange={(e: any) => updateArrayItem("topContentAnalysis", idx, "hook", e.target.value)} />
                        </div>
                        <div>
                          <Label>Call to Action (CTA)</Label>
                          <Input value={row.cta} onChange={(e: any) => updateArrayItem("topContentAnalysis", idx, "cta", e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Why It Performed Well & Lessons Learned</Label>
                          <Textarea value={row.lessonsLearned} onChange={(e: any) => updateArrayItem("topContentAnalysis", idx, "lessonsLearned", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            <section>
              <SectionHeader title="5. Low Performing Content Analysis" />
              <button onClick={() => addArrayItem("lowContentAnalysis", { title: "", whyUnderperformed: "", recommendations: "" })} className="mb-4 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Low Performer
              </button>
              
              <div className="space-y-6">
                {data.lowContentAnalysis.map((row, idx) => (
                  <div key={row.id} className="bg-[#151515] p-5 rounded-xl border border-white/10 relative">
                    <button onClick={() => removeArrayItem("lowContentAnalysis", idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="md:col-span-2">
                        <Label>Content Title / Description</Label>
                        <Input value={row.title} onChange={(e: any) => updateArrayItem("lowContentAnalysis", idx, "title", e.target.value)} />
                      </div>
                      <div>
                        <Label>Why did it underperform?</Label>
                        <Textarea value={row.whyUnderperformed} onChange={(e: any) => updateArrayItem("lowContentAnalysis", idx, "whyUnderperformed", e.target.value)} />
                      </div>
                      <div>
                        <Label>Recommendations to Fix</Label>
                        <Textarea value={row.recommendations} onChange={(e: any) => updateArrayItem("lowContentAnalysis", idx, "recommendations", e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: AUDIENCE & PATTERNS */}
        {activeTab === 3 && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <section>
              <SectionHeader title="6. Content Category Analysis" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Best Category</Label><Input value={data.categoryResearch.bestCategory} onChange={(e: any) => updateNestedField("categoryResearch", "bestCategory", e.target.value)} /></div>
                <div><Label>Worst Category</Label><Input value={data.categoryResearch.worstCategory} onChange={(e: any) => updateNestedField("categoryResearch", "worstCategory", e.target.value)} /></div>
                <div><Label>Highest Engagement</Label><Input value={data.categoryResearch.highestEngagementCategory} onChange={(e: any) => updateNestedField("categoryResearch", "highestEngagementCategory", e.target.value)} /></div>
                <div className="md:col-span-3">
                  <Label>Investment Recommendations</Label>
                  <Textarea value={data.categoryResearch.investmentRecommendations} onChange={(e: any) => updateNestedField("categoryResearch", "investmentRecommendations", e.target.value)} />
                </div>
              </div>
            </section>

            <section>
              <SectionHeader title="7. Audience Behaviour Analysis" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Demographic Shifts</Label><Textarea value={data.audienceBehaviour.demographicShifts} onChange={(e: any) => updateNestedField("audienceBehaviour", "demographicShifts", e.target.value)} /></div>
                <div><Label>Engagement Behaviour</Label><Textarea value={data.audienceBehaviour.engagementBehaviour} onChange={(e: any) => updateNestedField("audienceBehaviour", "engagementBehaviour", e.target.value)} /></div>
                <div><Label>New Audience Opportunities</Label><Textarea value={data.audienceBehaviour.newAudienceOpportunities} onChange={(e: any) => updateNestedField("audienceBehaviour", "newAudienceOpportunities", e.target.value)} /></div>
                <div><Label>Recommendations</Label><Textarea value={data.audienceBehaviour.recommendations} onChange={(e: any) => updateNestedField("audienceBehaviour", "recommendations", e.target.value)} /></div>
              </div>
            </section>

            <section>
              <SectionHeader title="8. Content Pattern Research" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Best Content Format</Label><Input value={data.contentPattern.bestContentFormat} onChange={(e: any) => updateNestedField("contentPattern", "bestContentFormat", e.target.value)} /></div>
                <div><Label>Best Posting Time</Label><Input value={data.contentPattern.bestPostingTime} onChange={(e: any) => updateNestedField("contentPattern", "bestPostingTime", e.target.value)} /></div>
                <div><Label>Best Hook Style</Label><Input value={data.contentPattern.bestHookStyle} onChange={(e: any) => updateNestedField("contentPattern", "bestHookStyle", e.target.value)} /></div>
                <div><Label>Best CTA</Label><Input value={data.contentPattern.bestCTA} onChange={(e: any) => updateNestedField("contentPattern", "bestCTA", e.target.value)} /></div>
                <div><Label>Best Editing Style</Label><Input value={data.contentPattern.bestEditingStyle} onChange={(e: any) => updateNestedField("contentPattern", "bestEditingStyle", e.target.value)} /></div>
                <div><Label>Average Reel Length</Label><Input value={data.contentPattern.averageReelLength} onChange={(e: any) => updateNestedField("contentPattern", "averageReelLength", e.target.value)} /></div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: COMPETITORS & TRENDS */}
        {activeTab === 4 && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <section>
              <SectionHeader title="9. Competitor Research" />
              <button onClick={() => addArrayItem("competitors", { name: "", username: "", followerCount: 0, overallRating: 5 })} className="mb-4 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Competitor
              </button>
              
              <div className="space-y-6">
                {data.competitors.map((comp, idx) => (
                  <div key={comp.id} className="bg-[#151515] p-5 rounded-xl border border-white/10 relative">
                    <button onClick={() => removeArrayItem("competitors", idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label>Name</Label><Input value={comp.name} onChange={(e: any) => updateArrayItem("competitors", idx, "name", e.target.value)} /></div>
                      <div><Label>Username</Label><Input value={comp.username} onChange={(e: any) => updateArrayItem("competitors", idx, "username", e.target.value)} /></div>
                      <div><Label>Overall Rating (1-10)</Label><Input type="number" min="1" max="10" value={comp.overallRating} onChange={(e: any) => updateArrayItem("competitors", idx, "overallRating", Number(e.target.value))} /></div>
                      <div className="md:col-span-3 grid grid-cols-2 gap-4">
                        <div><Label>Strengths</Label><Textarea value={comp.strengths} onChange={(e: any) => updateArrayItem("competitors", idx, "strengths", e.target.value)} /></div>
                        <div><Label>Lessons to Apply</Label><Textarea value={comp.lessonsToApply} onChange={(e: any) => updateArrayItem("competitors", idx, "lessonsToApply", e.target.value)} /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="10. Industry Trend Research" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Trending Audio/Music</Label><Input value={data.industryTrends.trendingAudio} onChange={(e: any) => updateNestedField("industryTrends", "trendingAudio", e.target.value)} /></div>
                <div><Label>Trending Formats</Label><Input value={data.industryTrends.trendingReelFormats} onChange={(e: any) => updateNestedField("industryTrends", "trendingReelFormats", e.target.value)} /></div>
                <div><Label>Emerging Trends</Label><Textarea value={data.industryTrends.emergingTrends} onChange={(e: any) => updateNestedField("industryTrends", "emergingTrends", e.target.value)} /></div>
                <div><Label>Future Opportunities</Label><Textarea value={data.industryTrends.futureOpportunities} onChange={(e: any) => updateNestedField("industryTrends", "futureOpportunities", e.target.value)} /></div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: SWOT & STRATEGY */}
        {activeTab === 5 && (
          <div className="space-y-12 max-w-5xl mx-auto">
            <section>
              <SectionHeader title="11. SWOT Analysis" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-500/5 p-4 rounded-xl border border-green-500/20"><Label>Strengths</Label><Textarea className="bg-black/50 border-white/5" value={data.swot.strengths} onChange={(e: any) => updateNestedField("swot", "strengths", e.target.value)} /></div>
                <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/20"><Label>Weaknesses</Label><Textarea className="bg-black/50 border-white/5" value={data.swot.weaknesses} onChange={(e: any) => updateNestedField("swot", "weaknesses", e.target.value)} /></div>
                <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20"><Label>Opportunities</Label><Textarea className="bg-black/50 border-white/5" value={data.swot.opportunities} onChange={(e: any) => updateNestedField("swot", "opportunities", e.target.value)} /></div>
                <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/20"><Label>Threats</Label><Textarea className="bg-black/50 border-white/5" value={data.swot.threats} onChange={(e: any) => updateNestedField("swot", "threats", e.target.value)} /></div>
              </div>
            </section>

            <section>
              <SectionHeader title="13. Experiment Backlog" desc="Roadmap for next month" />
              <button onClick={() => addArrayItem("experiments", { name: "", objective: "", status: "Planned" })} className="mb-4 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Experiment
              </button>
              
              <div className="space-y-4">
                {data.experiments.map((exp, idx) => (
                  <div key={exp.id} className="bg-[#151515] p-5 rounded-xl border border-white/10 relative">
                    <button onClick={() => removeArrayItem("experiments", idx)} className="absolute top-4 right-4 text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><Label>Experiment Name</Label><Input value={exp.name} onChange={(e: any) => updateArrayItem("experiments", idx, "name", e.target.value)} /></div>
                      <div><Label>Hypothesis</Label><Input value={exp.hypothesis} onChange={(e: any) => updateArrayItem("experiments", idx, "hypothesis", e.target.value)} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="14. Strategy for Next Month" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Recommended Posting Frequency</Label><Input value={data.strategy.recommendedPostingFrequency} onChange={(e: any) => updateNestedField("strategy", "recommendedPostingFrequency", e.target.value)} /></div>
                <div><Label>Recommended Hook Types</Label><Input value={data.strategy.recommendedHookTypes} onChange={(e: any) => updateNestedField("strategy", "recommendedHookTypes", e.target.value)} /></div>
                <div><Label>Recommended Brand Messaging</Label><Input value={data.strategy.recommendedBrandMessaging} onChange={(e: any) => updateNestedField("strategy", "recommendedBrandMessaging", e.target.value)} /></div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 6: SCORECARD */}
        {activeTab === 6 && (
          <div className="space-y-12 max-w-5xl mx-auto">


            <section>
              <SectionHeader title="15. Executive Scorecard" desc="Rate the overall performance out of 10" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div><Label>Content Quality</Label><Input type="number" min="1" max="10" value={data.scorecard.contentQuality} onChange={(e: any) => updateNestedField("scorecard", "contentQuality", Number(e.target.value))} /></div>
                <div><Label>Audience Growth</Label><Input type="number" min="1" max="10" value={data.scorecard.audienceGrowth} onChange={(e: any) => updateNestedField("scorecard", "audienceGrowth", Number(e.target.value))} /></div>
                <div><Label>Creativity</Label><Input type="number" min="1" max="10" value={data.scorecard.creativity} onChange={(e: any) => updateNestedField("scorecard", "creativity", Number(e.target.value))} /></div>
                <div><Label>Overall Performance</Label><Input type="number" min="1" max="10" value={data.scorecard.overallPerformance} onChange={(e: any) => updateNestedField("scorecard", "overallPerformance", Number(e.target.value))} /></div>
              </div>
              <div>
                <Label>Executive Summary / Final Verdict</Label>
                <Textarea value={data.scorecard.executiveSummary} onChange={(e: any) => updateNestedField("scorecard", "executiveSummary", e.target.value)} />
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}

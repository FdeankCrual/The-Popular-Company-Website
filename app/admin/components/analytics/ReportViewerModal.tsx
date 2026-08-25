"use client";

import { AdvancedAnalyticsReport, WeeklyAnalyticsReport, MonthlyAnalyticsReport } from "../../types/analytics";
import { X, Calendar, TrendingUp, Users, Target, Zap, Activity } from "lucide-react";

type Props = {
  report: AdvancedAnalyticsReport;
  onClose: () => void;
};

export default function ReportViewerModal({ report, onClose }: Props) {
  const isWeekly = report.type === "Weekly";
  const wReport = report as WeeklyAnalyticsReport;
  const mReport = report as MonthlyAnalyticsReport;

  const getEngagementRate = () => {
    if (isWeekly) {
      const e = wReport.totalLikes + wReport.totalComments + wReport.totalShares + wReport.totalSaves;
      return wReport.totalReach ? ((e / wReport.totalReach) * 100).toFixed(2) : "0.00";
    } else {
      const e = mReport.totalLikes + mReport.totalComments + mReport.totalShares + mReport.totalSaves;
      return mReport.totalAccountsReached ? ((e / mReport.totalAccountsReached) * 100).toFixed(2) : "0.00";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isWeekly ? 'bg-blue-500/20 text-blue-500' : 'bg-tpc-orange/20 text-tpc-orange'}`}>
                {report.type} Report
              </span>
              <span className="text-gray-500 text-xs uppercase tracking-widest">{report.month} {report.year}</span>
            </div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
              {isWeekly ? wReport.reportingWeek : `${mReport.month} Overview`}
            </h2>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Submitted by {report.submittedBy} on {new Date(report.dateSubmitted).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Followers</p>
              <div className="text-xl font-bold text-white">{report.endingFollowers.toLocaleString()}</div>
              <div className={`text-xs mt-1 ${report.endingFollowers >= report.startingFollowers ? 'text-green-500' : 'text-red-500'}`}>
                {report.endingFollowers >= report.startingFollowers ? '+' : ''}{(report.endingFollowers - report.startingFollowers).toLocaleString()} Net
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Total Reach</p>
              <div className="text-xl font-bold text-white">{(isWeekly ? wReport.totalReach : mReport.totalAccountsReached).toLocaleString()}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Engagement Rate</p>
              <div className="text-xl font-bold text-tpc-orange">{getEngagementRate()}%</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Profile Visits</p>
              <div className="text-xl font-bold text-white">{report.profileVisits.toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Written Insights Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Qualitative Insights
              </h3>
              
              <div className="space-y-4">
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <h4 className="text-[10px] text-green-500 uppercase font-bold tracking-widest mb-2">
                    {isWeekly ? "What Worked Well" : "Biggest Win"}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {isWeekly ? (wReport.whatWorked || "No notes provided.") : (mReport.biggestWin || "No notes provided.")}
                  </p>
                </div>

                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <h4 className="text-[10px] text-red-500 uppercase font-bold tracking-widest mb-2">
                    {isWeekly ? "What Didn't Work" : "Biggest Challenge"}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {isWeekly ? (wReport.whatDidNotWork || "No notes provided.") : (mReport.biggestChallenge || "No notes provided.")}
                  </p>
                </div>

                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <h4 className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-2">
                    {isWeekly ? "Audience Feedback" : "Lessons Learned"}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {isWeekly ? (wReport.audienceFeedback || "No notes provided.") : (mReport.lessonsLearned || "No notes provided.")}
                  </p>
                </div>

                {isWeekly && (
                  <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                    <h4 className="text-[10px] text-purple-500 uppercase font-bold tracking-widest mb-2">Competitor Insights</h4>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {wReport.competitorInsights || "No notes provided."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Plan Column */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-tpc-orange" /> Action & Strategy
              </h3>
              
              <div className="space-y-4">
                <div className="bg-tpc-orange/10 p-4 rounded-xl border border-tpc-orange/20">
                  <h4 className="text-[10px] text-tpc-orange uppercase font-bold tracking-widest mb-2">
                    {isWeekly ? "Recommendations for Next Week" : "Action Plan"}
                  </h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {isWeekly ? (wReport.recommendations || "No notes provided.") : (mReport.actionPlan || "No notes provided.")}
                  </p>
                </div>

                {!isWeekly && (
                  <>
                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                      <h4 className="text-[10px] text-green-500 uppercase font-bold tracking-widest mb-2">Content to Repeat</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {mReport.contentToRepeat || "No notes provided."}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                      <h4 className="text-[10px] text-red-500 uppercase font-bold tracking-widest mb-2">Content to Stop</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {mReport.contentToStop || "No notes provided."}
                      </p>
                    </div>
                    <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                      <h4 className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-2">New Ideas to Test</h4>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {mReport.newIdeasToTest || "No notes provided."}
                      </p>
                    </div>
                  </>
                )}

                {/* Content Mix Breakdown */}
                <div className="bg-[#0a0a0a] p-4 rounded-xl border border-white/5">
                  <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">Content Published</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{isWeekly ? wReport.numReels : mReport.totalReels}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Reels</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{isWeekly ? wReport.numPosts : mReport.totalPosts}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Posts</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{isWeekly ? wReport.numCarousels : mReport.totalCarousels}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Carousels</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-white">{isWeekly ? wReport.numStories : mReport.totalStories}</div>
                      <div className="text-[10px] text-gray-500 uppercase">Stories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

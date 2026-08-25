"use client";

import { MonthlyContentResearchReport } from "../../../admin/types/research";
import { ArrowLeft, Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface Props {
  report: MonthlyContentResearchReport;
  clientName: string;
  onBack: () => void;
}

export default function MonthlyResearchViewer({ report, clientName, onBack }: Props) {
  
  const handlePrint = () => {
    window.print();
  };

  const scorecardData = [
    { subject: 'Quality', A: report.scorecard.contentQuality, fullMark: 10 },
    { subject: 'Growth', A: report.scorecard.audienceGrowth, fullMark: 10 },
    { subject: 'Consistency', A: report.scorecard.brandConsistency, fullMark: 10 },
    { subject: 'Creativity', A: report.scorecard.creativity, fullMark: 10 },
    { subject: 'Overall', A: report.scorecard.overallPerformance, fullMark: 10 },
  ];

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "flat" }) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="bg-[#111] h-full flex flex-col overflow-hidden font-sans">
      
      {/* Non-printable Header */}
      <div className="p-4 border-b border-white/10 bg-[#0a0a0a] flex justify-between items-center shrink-0 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">View Report</h2>
          </div>
        </div>
        <button onClick={handlePrint} className="px-4 py-2 bg-tpc-orange hover:bg-white text-black rounded text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Printer className="w-4 h-4" /> Print / PDF
        </button>
      </div>

      {/* Printable Document Area */}
      <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible bg-white print:bg-white print:text-black text-gray-800">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Cover / Header */}
          <div className="border-b-4 border-tpc-orange pb-8">
            <div className="text-sm font-bold text-tpc-orange uppercase tracking-widest mb-2">Monthly Content Strategy Report</div>
            <h1 className="text-4xl font-extrabold uppercase tracking-tight text-gray-900 mb-4">{clientName}</h1>
            <div className="flex items-center gap-6 text-sm text-gray-500 uppercase tracking-widest">
              <span>{report.month} {report.year}</span>
              <span>•</span>
              <span>Prepared By: {report.preparedBy}</span>
              <span>•</span>
              <span>{new Date(report.datePrepared).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <section>
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4 border-b pb-2">1. Executive Summary</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{report.executiveSummary || "No executive summary provided."}</p>
          </section>

          {/* 2. KPI Overview */}
          <section className="print:break-inside-avoid">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4 border-b pb-2">2. KPI Performance Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(report.kpiOverview).map(([key, val]) => (
                <div key={key} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-2xl font-bold text-gray-900">{val.current.toLocaleString()}{key === 'engagementRate' ? '%' : ''}</div>
                  <div className="flex items-center gap-1 mt-1 text-xs font-medium text-gray-600">
                    <TrendIcon trend={val.trend} />
                    <span className={val.trend === 'up' ? 'text-green-600' : val.trend === 'down' ? 'text-red-600' : ''}>
                      {val.percentChange}%
                    </span>
                    <span className="text-gray-400 font-normal">vs prev</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 18. Executive Scorecard */}
          <section className="print:break-inside-avoid">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4 border-b pb-2">3. Executive Scorecard</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="w-full md:w-1/3 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={scorecardData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#f97316" fill="#f97316" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-2/3">
                <div className="text-4xl font-extrabold text-tpc-orange mb-2">{report.scorecard.overallPerformance}/10</div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900 mb-2">Final Verdict</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{report.scorecard.executiveSummary || "No verdict provided."}</p>
              </div>
            </div>
          </section>

          {/* Content Diagnosis */}
          <section className="print:break-inside-avoid">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4 border-b pb-2">4. Performance Diagnosis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Biggest Positive Impact</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.performanceDiagnosis.biggestPositiveImpact}</p>
              </div>
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Biggest Negative Impact</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.performanceDiagnosis.biggestNegativeImpact}</p>
              </div>
            </div>
          </section>

          {/* Strategy Next Month */}
          <section className="print:break-before-page">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900 mb-4 border-b pb-2">5. Strategy & Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                <h4 className="text-xs font-bold text-tpc-orange uppercase tracking-widest mb-2">Posting Frequency</h4>
                <p className="text-sm text-gray-800">{report.strategy.recommendedPostingFrequency}</p>
              </div>
              <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                <h4 className="text-xs font-bold text-tpc-orange uppercase tracking-widest mb-2">Hook Types</h4>
                <p className="text-sm text-gray-800">{report.strategy.recommendedHookTypes}</p>
              </div>
              <div className="bg-orange-50 p-5 rounded-lg border border-orange-200">
                <h4 className="text-xs font-bold text-tpc-orange uppercase tracking-widest mb-2">Brand Messaging</h4>
                <p className="text-sm text-gray-800">{report.strategy.recommendedBrandMessaging}</p>
              </div>
            </div>
          </section>
          
          <div className="text-center text-xs text-gray-400 uppercase tracking-widest pt-12 print:block hidden">
            End of Report • Confidential • TPC Agency
          </div>

        </div>
      </div>
    </div>
  );
}

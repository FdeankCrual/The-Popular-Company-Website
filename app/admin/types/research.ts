export interface KPIComparison {
  current: number;
  previous: number;
  difference: number;
  percentChange: number;
  trend: "up" | "down" | "flat";
}

export interface KPIOverview {
  followersGrowth: KPIComparison;
  reach: KPIComparison;
  impressions: KPIComparison;
  engagementRate: KPIComparison;
  websiteClicks: KPIComparison;
  profileVisits: KPIComparison;
  totalContentPublished: KPIComparison;
}

export interface PerformanceDiagnosis {
  followerGrowthReason: string;
  engagementReason: string;
  reachReason: string;
  biggestPositiveImpact: string;
  biggestNegativeImpact: string;
  externalFactors: string;
}

export interface ContentAnalysisRow {
  id: string;
  title: string;
  type: string;
  topic: string;
  hook: string;
  cta: string;
  performanceRating: number; // 1-10
  whyPerformedWell: string;
  audienceResponse: string;
  lessonsLearned: string;
  shouldReplicate: "Yes" | "No";
  improvementSuggestions: string;
}

export interface LowContentAnalysisRow {
  id: string;
  title: string;
  weakHook: boolean;
  weakThumbnail: boolean;
  wrongPostingTime: boolean;
  weakCTA: boolean;
  poorRetention: boolean;
  lowShareability: boolean;
  wrongAudience: boolean;
  tooPromotional: boolean;
  otherFactors: string;
  whyUnderperformed: string;
  recommendations: string;
}

export interface CategoryAnalysis {
  category: string;
  numberOfPosts: number;
  averageReach: number;
  averageEngagement: number;
  trend: "up" | "down" | "flat";
  researchFindings: string;
  recommendations: string;
}

export interface CategoryResearch {
  categories: CategoryAnalysis[];
  bestCategory: string;
  worstCategory: string;
  mostSharesCategory: string;
  mostSavesCategory: string;
  mostCommentsCategory: string;
  highestEngagementCategory: string;
  investmentRecommendations: string;
}

export interface AudienceBehaviour {
  audienceChanges: string;
  demographicShifts: string;
  engagementBehaviour: string;
  buyingBehaviour: string;
  interests: string;
  newAudienceOpportunities: string;
  recommendations: string;
}

export interface ContentPatternResearch {
  bestContentFormat: string;
  bestPostingTime: string;
  bestHookStyle: string;
  bestCTA: string;
  bestCaptionStyle: string;
  bestThumbnailStyle: string;
  bestEditingStyle: string;
  averageReelLength: string;
  bestCarouselStyle: string;
  storyPerformance: string;
  visualIdentityConsistency: string;
  brandVoiceConsistency: string;
  postingFrequencyImpact: string;
}

export interface CompetitorCard {
  id: string;
  name: string;
  username: string;
  followerCount: number;
  postingFrequency: string;
  contentStyle: string;
  brandTone: string;
  topContent: string;
  bestHooks: string;
  bestCTAs: string;
  trendingTopics: string;
  strengths: string;
  weaknesses: string;
  lessonsToApply: string;
  threatLevel: "Low" | "Medium" | "High";
  overallRating: number; // 1-10
}

export interface IndustryTrends {
  trendingAudio: string;
  trendingReelFormats: string;
  trendingCarouselFormats: string;
  trendingEditingStyles: string;
  trendingVisualStyles: string;
  trendingTopics: string;
  trendingHooks: string;
  trendingCTAs: string;
  emergingTrends: string;
  decliningTrends: string;
  futureOpportunities: string;
  potentialRisks: string;
}

export interface SWOTAnalysis {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
}

export interface ContentGapAnalysis {
  competitorContentWeLack: string;
  unansweredAudienceQuestions: string;
  underservedTopics: string;
  pillarsNeedingImprovement: string;
  ignoredAudienceSegments: string;
  unexploredOpportunities: string;
}

export interface ExperimentCard {
  id: string;
  name: string;
  objective: string;
  hypothesis: string;
  reason: string;
  expectedImpact: string;
  priority: "Low" | "Medium" | "High";
  effort: "Low" | "Medium" | "High";
  successMetric: string;
  owner: string;
  timeline: string;
  status: "Planned" | "In Progress" | "Completed";
}

export interface ContentStrategy {
  pillars: { name: string; percentage: number }[];
  recommendedPostingFrequency: string;
  recommendedReelLength: string;
  recommendedStoryFrequency: string;
  recommendedCarouselFrequency: string;
  recommendedPostingTimes: string;
  recommendedHookTypes: string;
  recommendedCTAStyle: string;
  recommendedDesignDirection: string;
  recommendedBrandMessaging: string;
}

export interface ActionPlanRow {
  id: string;
  priority: "Low" | "Medium" | "High";
  action: string;
  reason: string;
  owner: string;
  deadline: string;
  expectedOutcome: string;
  status: "Pending" | "In Progress" | "Done";
}

export interface RiskCard {
  id: string;
  risk: string;
  likelihood: "Low" | "Medium" | "High";
  businessImpact: "Low" | "Medium" | "High";
  mitigationStrategy: string;
  owner: string;
}

export interface AIRecommendation {
  id: string;
  recommendation: string;
  supportingEvidence: string;
  expectedBusinessImpact: string;
  priority: "Low" | "Medium" | "High";
  confidenceScore: number; // percentage
}

export interface ExecutiveScorecard {
  contentQuality: number; // 1-10
  audienceGrowth: number;
  brandConsistency: number;
  creativity: number;
  communityBuilding: number;
  contentDiversity: number;
  innovation: number;
  execution: number;
  overallStrategy: number;
  overallPerformance: number; // 1-100 ? No, 1-10
  executiveSummary: string;
}

export interface MonthlyContentResearchReport {
  id: string;
  type: "MonthlyResearch";
  status: "Draft" | "Final";
  
  // 1. Executive Summary
  month: string;
  year: string;
  preparedBy: string;
  datePrepared: string;
  executiveSummary: string;

  // 2. KPI Performance Overview
  kpiOverview: KPIOverview;

  // 3. Performance Diagnosis
  performanceDiagnosis: PerformanceDiagnosis;

  // 4. Top Content Analysis
  topContentAnalysis: ContentAnalysisRow[];

  // 5. Low Performing Content Analysis
  lowContentAnalysis: LowContentAnalysisRow[];

  // 6. Content Category Analysis
  categoryResearch: CategoryResearch;

  // 7. Audience Behaviour Analysis
  audienceBehaviour: AudienceBehaviour;

  // 8. Content Pattern Research
  contentPattern: ContentPatternResearch;

  // 9. Competitor Research
  competitors: CompetitorCard[];

  // 10. Industry Trend Research
  industryTrends: IndustryTrends;

  // 11. SWOT Analysis
  swot: SWOTAnalysis;

  // 12. Content Gap Analysis
  contentGap: ContentGapAnalysis;

  // 13. Experiment Backlog
  experiments: ExperimentCard[];

  // 14. Strategy for Next Month
  strategy: ContentStrategy;

  // 15. Action Plan
  actionPlan: ActionPlanRow[];

  // 16. Risks & Challenges
  risks: RiskCard[];

  // 17. AI Strategic Recommendations
  aiRecommendations: AIRecommendation[];

  // 18. Executive Scorecard
  scorecard: ExecutiveScorecard;
}

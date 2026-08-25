export type ContentPerformanceRow = {
  id: string;
  title: string;
  link?: string;
  type: "Reel" | "Post" | "Carousel" | "Story" | "";
  datePosted: string;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
};

export type CategoryPerformanceRow = {
  id: string;
  categoryName: string;
  numberOfPosts: number;
  averageReach: number;
  averageEngagementRate: number; // percentage
};

export type Demographics = {
  topCities: { name: string; percentage: number }[];
  topCountries: { name: string; percentage: number }[];
  ageDistribution: { ageGroup: string; percentage: number }[];
  gender: {
    male: number;
    female: number;
    other: number;
  };
  mostActiveDays: string[];
  mostActiveHours: string;
};

export type WeeklyAnalyticsReport = {
  id: string;
  type: "Weekly";
  status: "Draft" | "Submitted";
  
  // Reporting Information
  reportingWeek: string; // e.g. "Week 1 (1st - 7th)"
  month: string; // e.g. "August"
  year: string; // e.g. "2026"
  submittedBy: string;
  dateSubmitted: string;

  // Audience Growth
  startingFollowers: number;
  endingFollowers: number;
  newFollowers: number;
  unfollowers: number;

  // Content Published
  numReels: number;
  numPosts: number;
  numCarousels: number;
  numStories: number;

  // Reach & Visibility
  totalReach: number;
  totalImpressions: number;
  profileVisits: number;

  // Engagement
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;

  // Business Actions
  websiteClicks: number;
  whatsappClicks: number;
  emailClicks: number;
  callClicks: number;

  // Top/Bottom Content
  topPosts: ContentPerformanceRow[]; // 3
  bottomPosts: ContentPerformanceRow[]; // 3

  // Insights
  whatWorked: string;
  whatDidNotWork: string;
  audienceFeedback: string;
  competitorInsights: string;
  recommendations: string;
};

export type MonthlyAnalyticsReport = {
  id: string;
  type: "Monthly";
  status: "Draft" | "Submitted";

  // Reporting Information
  month: string;
  year: string;
  submittedBy: string;
  dateSubmitted: string;

  // Account Growth
  startingFollowers: number;
  endingFollowers: number;
  totalAccountsReached: number;
  totalImpressions: number;

  // Content Summary
  totalReels: number;
  totalPosts: number;
  totalCarousels: number;
  totalStories: number;

  // Engagement Summary
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSaves: number;

  // Conversion Metrics
  websiteClicks: number;
  profileVisits: number;
  whatsappClicks: number;
  emailClicks: number;
  callClicks: number;

  // Content
  topContent: ContentPerformanceRow[]; // up to 10

  // Audience Insights
  demographics: Demographics;

  // Content Category Performance
  categoryPerformance: CategoryPerformanceRow[];

  // Monthly Review
  biggestWin: string;
  biggestChallenge: string;
  contentToRepeat: string;
  contentToStop: string;
  newIdeasToTest: string;
  lessonsLearned: string;

  // Goals
  targetFollowers: number;
  targetEngagementRate: number; // percentage
  targetReach: number;
  targetWebsiteClicks: number;
  actionPlan: string;
};

export type AdvancedAnalyticsReport = WeeklyAnalyticsReport | MonthlyAnalyticsReport;

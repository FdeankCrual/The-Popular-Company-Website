const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

const demoData = [{
  "id": "demo-report-2026-08",
  "type": "MonthlyResearch",
  "status": "Draft",
  "month": "August",
  "year": "2026",
  "preparedBy": "TPC AI Analyst",
  "datePrepared": "2026-08-25",
  "executiveSummary": "August was a solid month for Home Vista. We saw significant growth in engagement across video content, though static posts underperformed. The focus for next month should be scaling our high-performing Reel formats and addressing the drop in story retention.",
  "kpiOverview": {
    "totalFollowers": 24500,
    "followersGrowth": 1200,
    "totalReach": 185000,
    "reachGrowth": 15.5,
    "totalEngagement": 12400,
    "engagementRate": 6.7,
    "websiteClicks": 850,
    "leadsGenerated": 42
  },
  "performanceDiagnosis": {
    "whatWorked": "Short-form video content (Reels) showcasing before-and-after home renovations performed exceptionally well. Educational content about material choices also saw high save rates.",
    "whatDidNotWork": "Static image carousels of team culture and broad motivational quotes received minimal engagement and reach.",
    "keyLearnings": "Our audience is highly transactional and educational-focused. They want to see results (before/after) and learn actionable tips for their own homes. Fluff content doesn't work."
  },
  "topContentAnalysis": [
    {
      "id": "t1",
      "postType": "Reel",
      "topic": "Kitchen Makeover Time-lapse",
      "reach": 45000,
      "engagement": 3200,
      "whyItWorked": "Fast-paced visual transformation hooks the viewer instantly. High contrast between before and after.",
      "howToReplicate": "Create similar 15-second time-lapses for every major room renovation we complete."
    },
    {
      "id": "t2",
      "postType": "Static Post",
      "topic": "Top 5 Granite Countertop Myths",
      "reach": 12000,
      "engagement": 850,
      "whyItWorked": "Addresses a common customer pain point/confusion. Highly saveable and shareable.",
      "howToReplicate": "Identify other common myths (flooring, paint types) and create a 'Mythbusters' series."
    }
  ],
  "lowContentAnalysis": [
    {
      "id": "l1",
      "postType": "Static Post",
      "topic": "Happy Monday Motivational Quote",
      "reach": 2100,
      "engagement": 45,
      "poorHook": true,
      "poorRetention": false,
      "lowShareability": true,
      "wrongAudience": false,
      "tooPromotional": false,
      "otherFactors": "Generic content",
      "whyUnderperformed": "People don't follow a home renovation page for generic quotes. It felt out of place and added no value.",
      "recommendations": "Stop posting generic motivational content. If we want to inspire, use quotes from happy customers next to their renovated homes."
    }
  ],
  "categoryResearch": {
    "categories": [
      {
        "category": "Before & Afters",
        "numberOfPosts": 5,
        "averageReach": 28000,
        "averageEngagement": 1500,
        "trend": "up",
        "researchFindings": "Consistent top performer.",
        "recommendations": "Increase frequency to 2x a week."
      },
      {
        "category": "Educational Tips",
        "numberOfPosts": 4,
        "averageReach": 15000,
        "averageEngagement": 800,
        "trend": "up",
        "researchFindings": "High save rates indicating people refer back to it.",
        "recommendations": "Maintain frequency but experiment with carousel format instead of single image."
      }
    ],
    "bestCategory": "Before & Afters",
    "worstCategory": "Company Culture",
    "mostSharesCategory": "Educational Tips"
  },
  "audienceBehaviour": {
    "mostActiveTimes": "Evenings (7PM - 9PM) and Weekend mornings.",
    "demographicShifts": "Slight increase in 25-34 age bracket, possibly first-time homebuyers.",
    "sentimentAnalysis": "Overwhelmingly positive. Many questions in comments about pricing and locations.",
    "communityFeedback": "Followers want to see more budget-friendly renovation options."
  },
  "contentPattern": {
    "visualTrends": "High brightness, natural lighting, and minimalist text overlays work best.",
    "copywritingTrends": "Short, punchy hooks with detailed explanations in the caption.",
    "audioTrends": "Trending lo-fi beats behind time-lapses perform better than voiceovers currently.",
    "formatTrends": "Reels are dominating reach; Stories are best for conversion (link clicks)."
  },
  "competitors": [
    {
      "id": "c1",
      "name": "DreamHomes Udaipur",
      "strengths": "Very consistent posting schedule, great drone footage of properties.",
      "weaknesses": "Almost zero educational content; feels too much like a billboard.",
      "whatToLearn": "We should incorporate drone shots for exterior renovations."
    }
  ],
  "industryTrends": {
    "platformChanges": "Instagram algorithm is heavily favoring original audio and longer watch times on Reels.",
    "formatTrends": "Shift towards 'day in the life of a contractor' raw, unedited style content.",
    "nicheTrends": "Sustainable and eco-friendly home materials are becoming a massive talking point."
  },
  "swot": {
    "strengths": "Strong visual portfolio, high trust from existing client base.",
    "weaknesses": "Inconsistent posting schedule, lack of clear calls-to-action.",
    "opportunities": "Tapping into the eco-friendly renovation trend.",
    "threats": "New local competitors aggressively spending on Meta Ads."
  },
  "contentGap": {
    "whatIsMissing": "We have no content explaining the *process* of working with us (from consultation to handover).",
    "audienceQuestions": "How much does a standard kitchen reno cost? How long does it take?",
    "newTopics": "Pricing transparency guides, timeline expectations, eco-friendly materials."
  },
  "experiments": [],
  "strategy": {
    "pillars": [
      { "name": "Transformations (Before/After)", "percentage": 40 },
      { "name": "Education & Tips", "percentage": 30 },
      { "name": "Process & Transparency", "percentage": 20 },
      { "name": "Client Testimonials", "percentage": 10 }
    ],
    "recommendedPostingFrequency": "5 times a week (3 Reels, 2 Carousels)",
    "recommendedReelLength": "15-30 seconds",
    "recommendedStoryFrequency": "3-5 stories daily (behind the scenes)",
    "recommendedCarouselFrequency": "2x a week",
    "recommendedPostingTimes": "7:30 PM",
    "recommendedHookTypes": "Visual transformations, 'Did you know?', 'Stop doing X'",
    "recommendedCTAStyle": "Direct DM prompts ('DM us KITCHEN for a free quote')",
    "recommendedDesignDirection": "Clean, minimalist, high contrast, easy to read text",
    "recommendedBrandMessaging": "Premium quality, transparent pricing, stress-free renovations"
  },
  "actionPlan": [],
  "risks": [],
  "aiRecommendations": [],
  "scorecard": {
    "contentQuality": 8,
    "audienceGrowth": 7,
    "brandConsistency": 8,
    "creativity": 6,
    "communityBuilding": 7,
    "contentDiversity": 7,
    "innovation": 5,
    "execution": 8,
    "overallStrategy": 8,
    "overallPerformance": 7,
    "executiveSummary": "Solid performance driven by visual transformations, but we need to push creativity and innovate with new formats (like process videos) to avoid stagnation."
  }
}];

async function uploadDemo() {
  console.log("Uploading demo report to Home Vista...");
  const payload = {
    action: "updateClientResearch",
    data: {
      clientName: "Home Vista",
      filePath: "_MonthlyResearch.json",
      markdownContent: JSON.stringify(demoData, null, 2)
    }
  };

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
    redirect: "follow"
  });

  const text = await response.text();
  console.log("Server response:", text);
}

uploadDemo().catch(console.error);

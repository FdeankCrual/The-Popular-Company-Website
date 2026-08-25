const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

const demoData = [{
  "id": "demo-report-2026-08",
  "type": "MonthlyResearch",
  "status": "Draft",
  "month": "August",
  "year": "2026",
  "preparedBy": "TPC AI Analyst",
  "datePrepared": "2026-08-25T00:00:00.000Z",
  "executiveSummary": "August was a solid month for Home Vista. We saw significant growth in engagement across video content, though static posts underperformed. The focus for next month should be scaling our high-performing Reel formats and addressing the drop in story retention.",
  "kpiOverview": {
    "followersGrowth": { "current": 24500, "previous": 23300, "difference": 1200, "percentChange": 5.15, "trend": "up" },
    "reach": { "current": 185000, "previous": 160000, "difference": 25000, "percentChange": 15.6, "trend": "up" },
    "impressions": { "current": 250000, "previous": 220000, "difference": 30000, "percentChange": 13.6, "trend": "up" },
    "engagementRate": { "current": 6.7, "previous": 6.2, "difference": 0.5, "percentChange": 8.0, "trend": "up" },
    "websiteClicks": { "current": 850, "previous": 750, "difference": 100, "percentChange": 13.3, "trend": "up" },
    "profileVisits": { "current": 12000, "previous": 11000, "difference": 1000, "percentChange": 9.0, "trend": "up" },
    "totalContentPublished": { "current": 25, "previous": 22, "difference": 3, "percentChange": 13.6, "trend": "up" }
  },
  "performanceDiagnosis": {
    "followerGrowthReason": "Short-form video content (Reels) showcasing before-and-after home renovations reached non-followers.",
    "engagementReason": "Educational content about material choices saw high save rates.",
    "reachReason": "Instagram algorithm is pushing our Reels to Explore page.",
    "biggestPositiveImpact": "Reels with trending audio.",
    "biggestNegativeImpact": "Static image carousels.",
    "externalFactors": "Summer renovation season."
  },
  "topContentAnalysis": [
    {
      "id": "t1",
      "title": "Kitchen Makeover Time-lapse",
      "type": "Reel",
      "topic": "Renovation",
      "hook": "Watch this kitchen transform in 15 seconds",
      "cta": "DM for a quote",
      "performanceRating": 9,
      "whyPerformedWell": "Fast-paced visual transformation.",
      "audienceResponse": "Lots of questions about materials.",
      "lessonsLearned": "Time-lapses work well.",
      "shouldReplicate": "Yes",
      "improvementSuggestions": "Add pricing context."
    },
    {
      "id": "t2",
      "title": "Top 5 Granite Myths",
      "type": "Static Post",
      "topic": "Education",
      "hook": "Stop believing these granite myths",
      "cta": "Save this for later",
      "performanceRating": 8,
      "whyPerformedWell": "Addresses a common customer pain point.",
      "audienceResponse": "High saves.",
      "lessonsLearned": "Mythbusters series is a good idea.",
      "shouldReplicate": "Yes",
      "improvementSuggestions": "Try as a carousel next."
    }
  ],
  "lowContentAnalysis": [
    {
      "id": "l1",
      "title": "Happy Monday Motivational Quote",
      "type": "Static Post",
      "topic": "Culture",
      "hook": "None",
      "cta": "None",
      "performanceRating": 2,
      "whyUnderperformed": "People don't follow a home renovation page for generic quotes.",
      "audienceResponse": "Ignored.",
      "lessonsLearned": "Stop posting generic motivational content.",
      "improvementSuggestions": "Use quotes from happy customers instead."
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
        "researchFindings": "High save rates.",
        "recommendations": "Experiment with carousel format."
      }
    ],
    "bestCategory": "Before & Afters",
    "worstCategory": "Company Culture",
    "mostSharesCategory": "Educational Tips",
    "mostSavesCategory": "Educational Tips",
    "mostCommentsCategory": "Before & Afters",
    "highestEngagementCategory": "Before & Afters",
    "investmentRecommendations": "Double down on Before & Afters and Educational content."
  },
  "audienceBehaviour": {
    "audienceChanges": "Slight increase in 25-34 age bracket.",
    "demographicShifts": "More female followers this month.",
    "engagementBehaviour": "Evenings and Weekend mornings are most active.",
    "buyingBehaviour": "Many questions about pricing in DMs.",
    "interests": "Budget-friendly renovations.",
    "newAudienceOpportunities": "First-time homebuyers.",
    "recommendations": "Create content specifically for first-time buyers."
  },
  "contentPattern": {
    "bestContentFormat": "Reels",
    "bestPostingTime": "7PM - 9PM",
    "bestHookStyle": "Visual transformations",
    "bestCTA": "DM for quote",
    "bestCaptionStyle": "Short and punchy",
    "bestThumbnailStyle": "High contrast, big text",
    "bestEditingStyle": "Fast-paced cuts",
    "averageReelLength": "15 seconds",
    "bestCarouselStyle": "Educational steps",
    "storyPerformance": "Low retention after slide 3",
    "visualIdentityConsistency": "Good, using brand colors.",
    "brandVoiceConsistency": "Professional yet approachable.",
    "postingFrequencyImpact": "More posts led to more reach."
  },
  "competitors": [
    {
      "id": "c1",
      "name": "DreamHomes Udaipur",
      "strengths": "Great drone footage of properties.",
      "weaknesses": "Almost zero educational content.",
      "contentGapsWeCanFill": "Educational content about materials.",
      "visualDifferences": "They use more lifestyle shots, we use more close-ups.",
      "engagementComparison": "Our engagement rate is higher.",
      "lessonsLearned": "We should incorporate drone shots.",
      "actionableTakeaways": "Buy a drone for exterior shots."
    }
  ],
  "industryTrends": {
    "trendingAudio": "Lo-fi beats",
    "trendingReelFormats": "Day in the life",
    "trendingCarouselFormats": "Myth vs Fact",
    "trendingEditingStyles": "Raw and unedited",
    "trendingVisualStyles": "Minimalist text overlays",
    "trendingTopics": "Eco-friendly materials",
    "trendingHooks": "Stop doing X",
    "trendingCTAs": "Comment X for link",
    "emergingTrends": "Sustainable renovations",
    "decliningTrends": "Voiceovers",
    "futureOpportunities": "Smart home integrations",
    "potentialRisks": "Rising material costs making renovations harder to sell"
  },
  "swot": {
    "strengths": "Strong visual portfolio, high trust.",
    "weaknesses": "Inconsistent posting schedule.",
    "opportunities": "Tapping into eco-friendly trend.",
    "threats": "New local competitors."
  },
  "contentGap": {
    "competitorContentWeLack": "Drone footage.",
    "unansweredAudienceQuestions": "How much does a kitchen reno cost?",
    "underservedTopics": "Pricing transparency.",
    "pillarsNeedingImprovement": "Process & Transparency",
    "ignoredAudienceSegments": "First-time buyers",
    "unexploredOpportunities": "Eco-friendly materials."
  },
  "experiments": [],
  "strategy": {
    "pillars": [
      { "name": "Transformations (Before/After)", "percentage": 40 },
      { "name": "Education & Tips", "percentage": 30 },
      { "name": "Process & Transparency", "percentage": 20 },
      { "name": "Client Testimonials", "percentage": 10 }
    ],
    "recommendedPostingFrequency": "5 times a week",
    "recommendedReelLength": "15-30 seconds",
    "recommendedStoryFrequency": "3-5 daily",
    "recommendedCarouselFrequency": "2x a week",
    "recommendedPostingTimes": "7:30 PM",
    "recommendedHookTypes": "Visual transformations",
    "recommendedCTAStyle": "Direct DM prompts",
    "recommendedDesignDirection": "Clean, minimalist",
    "recommendedBrandMessaging": "Premium quality, transparent pricing"
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
    "innovation": 6,
    "execution": 8,
    "overallStrategy": 8,
    "overallPerformance": 8,
    "executiveSummary": "Solid performance with room to grow in innovation and creativity."
  }
}];

async function uploadDemo() {
  console.log("Uploading fixed demo report to Home Vista...");
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

uploadDemo();

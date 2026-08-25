const fs = require('fs');

async function seed() {
  try {
    const researchRes = await fetch("http://localhost:3000/api/admin/data?action=getClientResearch");
    const rawData = await researchRes.json();
    
    let existingData = [];
    const homeVistaItem = rawData.find(item => item.clientName === "Home Vista" && item.filePath === "_AdvancedAnalytics.json");
    
    if (homeVistaItem && homeVistaItem.markdownContent) {
      existingData = JSON.parse(homeVistaItem.markdownContent);
    }

    const weeklyReports = [
      {
        id: "rpt_w1",
        type: "Weekly",
        status: "Submitted",
        reportingWeek: "Week 1 (1st - 7th)",
        month: "May",
        year: "2026",
        submittedBy: "Demo Manager",
        dateSubmitted: "2026-05-07T10:00:00.000Z",
        startingFollowers: 1000,
        endingFollowers: 1050,
        newFollowers: 60,
        unfollowers: 10,
        numReels: 3,
        numPosts: 1,
        numCarousels: 0,
        numStories: 5,
        totalReach: 3500,
        totalImpressions: 5000,
        profileVisits: 75,
        totalLikes: 200,
        totalComments: 30,
        totalShares: 50,
        totalSaves: 25,
        websiteClicks: 10,
        whatsappClicks: 2,
        emailClicks: 0,
        callClicks: 1,
        topPosts: [],
        bottomPosts: [],
        whatWorked: "Behind the scenes reel",
        whatDidNotWork: "Static photo",
        audienceFeedback: "Loved the office tour",
        competitorInsights: "N/A",
        recommendations: "More video content"
      },
      {
        id: "rpt_w2",
        type: "Weekly",
        status: "Submitted",
        reportingWeek: "Week 2 (8th - 14th)",
        month: "May",
        year: "2026",
        submittedBy: "Demo Manager",
        dateSubmitted: "2026-05-14T10:00:00.000Z",
        startingFollowers: 1050,
        endingFollowers: 1110,
        newFollowers: 70,
        unfollowers: 10,
        numReels: 3,
        numPosts: 1,
        numCarousels: 1,
        numStories: 5,
        totalReach: 4000,
        totalImpressions: 5500,
        profileVisits: 80,
        totalLikes: 220,
        totalComments: 35,
        totalShares: 60,
        totalSaves: 30,
        websiteClicks: 12,
        whatsappClicks: 3,
        emailClicks: 1,
        callClicks: 1,
        topPosts: [],
        bottomPosts: [],
        whatWorked: "Educational carousel",
        whatDidNotWork: "Story polls",
        audienceFeedback: "Asking for more tips",
        competitorInsights: "N/A",
        recommendations: "Increase carousel frequency"
      },
      {
        id: "rpt_w3",
        type: "Weekly",
        status: "Submitted",
        reportingWeek: "Week 3 (15th - 21st)",
        month: "May",
        year: "2026",
        submittedBy: "Demo Manager",
        dateSubmitted: "2026-05-21T10:00:00.000Z",
        startingFollowers: 1110,
        endingFollowers: 1180,
        newFollowers: 85,
        unfollowers: 15,
        numReels: 3,
        numPosts: 1,
        numCarousels: 0,
        numStories: 5,
        totalReach: 4200,
        totalImpressions: 6000,
        profileVisits: 95,
        totalLikes: 250,
        totalComments: 40,
        totalShares: 80,
        totalSaves: 45,
        websiteClicks: 15,
        whatsappClicks: 4,
        emailClicks: 0,
        callClicks: 2,
        topPosts: [],
        bottomPosts: [],
        whatWorked: "Trending audio reel",
        whatDidNotWork: "N/A",
        audienceFeedback: "Good engagement on reels",
        competitorInsights: "Competitor did a giveaway",
        recommendations: "Plan a giveaway next month"
      },
      {
        id: "rpt_w4",
        type: "Weekly",
        status: "Submitted",
        reportingWeek: "Week 4 (22nd - 28th)",
        month: "May",
        year: "2026",
        submittedBy: "Demo Manager",
        dateSubmitted: "2026-05-28T10:00:00.000Z",
        startingFollowers: 1180,
        endingFollowers: 1250,
        newFollowers: 90,
        unfollowers: 20,
        numReels: 3,
        numPosts: 1,
        numCarousels: 1,
        numStories: 5,
        totalReach: 5000,
        totalImpressions: 7000,
        profileVisits: 110,
        totalLikes: 300,
        totalComments: 45,
        totalShares: 110,
        totalSaves: 60,
        websiteClicks: 18,
        whatsappClicks: 5,
        emailClicks: 1,
        callClicks: 1,
        topPosts: [],
        bottomPosts: [],
        whatWorked: "Testimonial carousel",
        whatDidNotWork: "N/A",
        audienceFeedback: "Trust building",
        competitorInsights: "N/A",
        recommendations: "Use more user generated content"
      }
    ];

    const updatedData = [...existingData.filter(d => d.type !== "Weekly" || d.month !== "May"), ...weeklyReports];

    const saveRes = await fetch("http://localhost:3000/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateClientResearch",
        data: {
          clientName: "Home Vista",
          filePath: "_AdvancedAnalytics.json",
          markdownContent: JSON.stringify(updatedData)
        }
      })
    });
    
    console.log(await saveRes.json());
  } catch(e) {
    console.error(e);
  }
}

seed();

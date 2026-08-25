import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { cookies } from "next/headers";
import { verifySessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("tpc_session")?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await verifySessionCookie(sessionCookie);
    if (!session || !session.roles) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportData, clientName } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing from environment variables." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are an elite, highly paid Social Media Strategist and Analyst at a top-tier agency.
Your task is to review a raw "Monthly Content Research Report" for a client named "${clientName}" and generate the TOP 10 most actionable, high-impact strategic recommendations for the upcoming month.

Here is the data for the client's performance and your team's research:
${JSON.stringify(reportData, null, 2)}

Based ONLY on this data, provide exactly 10 strategic recommendations. Do not provide generic advice. Be specific, data-driven, and highly tailored to this client's unique situation, audience, competitors, and recent performance.

You MUST respond in valid JSON format matching this EXACT schema, and nothing else (no markdown wrapping, no extra text):
[
  {
    "recommendation": "Short action-oriented recommendation (1-2 sentences).",
    "supportingEvidence": "What data from the report supports this?",
    "expectedBusinessImpact": "What will be the impact of doing this?",
    "priority": "High", // Must be "Low", "Medium", or "High"
    "confidenceScore": 95 // A number between 0 and 100
  }
]`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the JSON output from the AI
    let insights = [];
    try {
      // Strip out any potential markdown code blocks if the AI disobeyed
      const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
      insights = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini output as JSON:", text);
      return NextResponse.json({ error: "AI returned malformed data. Please try again." }, { status: 500 });
    }

    // Ensure they each have a unique ID for React rendering
    const formattedInsights = insights.map((insight: any) => ({
      ...insight,
      id: "ai_" + Math.random().toString(36).substring(2, 9)
    })).slice(0, 10);

    return NextResponse.json({ insights: formattedInsights });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate insights" }, { status: 500 });
  }
}

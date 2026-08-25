import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let response;

    if (data.action && data.action.startsWith("get")) {
      response = await fetch(GOOGLE_SCRIPT_URL + "?action=" + data.action, {
        method: "GET",
        next: { tags: [data.action], revalidate: 15 } // Cache for 15 seconds
      });
    } else if (data.action === "bulkUpdateWorkbook") {
      // DATA SAFETY ARCHITECTURE: 
      // Smart queuing system to push each task into Google Sheets sequentially.
      // This prevents Google Sheets from freezing or locking out when multiple rows are updated.
      const updates = data.updates || data.data;
      if (!Array.isArray(updates)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      
      let successCount = 0;
      for (const update of updates) {
        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "updateWorkbook", data: update }),
          redirect: "follow"
        });
        if (res.ok) successCount++;
      }
      
      // Bust the cache manually here
      // @ts-ignore: Next.js 15+ expects 2 args
      revalidateTag("getWorkbook", "max");

      return NextResponse.json({ success: true, count: successCount });
    } else {
      // For mutations, use POST method to hit doPost
      response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(data),
        redirect: "follow"
      });

      // Bust the cache for the relevant dataset after mutation
      if (data.action) {
        const act = data.action.toLowerCase();
        // @ts-ignore: Next.js 15+ expects 2 args but docs are still catching up
        if (act.includes("workbook")) revalidateTag("getWorkbook", "max");
        // @ts-ignore
        if (act.includes("clientresearch")) revalidateTag("getClientResearch", "max");
        // @ts-ignore
        if (act.includes("analytics")) revalidateTag("getAnalytics", "max");
        // @ts-ignore
        if (act.includes("lead")) revalidateTag("getLeads", "max");
        // @ts-ignore
        if (act.includes("user")) revalidateTag("getUsers", "max");
        // @ts-ignore
        if (act.includes("config")) revalidateTag("getConfig", "max");
      }
    }

    if (response.ok) {
      const result = await response.json();
      if (result && result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Google Script Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error communicating with DB:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (!action) {
      return NextResponse.json({ error: "Missing action parameter" }, { status: 400 });
    }

    const response = await fetch(GOOGLE_SCRIPT_URL + "?action=" + action, {
      method: "GET",
      next: { tags: [action], revalidate: 15 } // Cache for 15 seconds
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.error) {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Google Script Error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error communicating with DB (GET):", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

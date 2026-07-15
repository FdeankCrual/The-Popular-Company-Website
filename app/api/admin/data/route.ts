import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let response;

    if (data.action && data.action.startsWith("get")) {
      // For get actions, use GET method to hit doGet in Apps Script
      response = await fetch(GOOGLE_SCRIPT_URL + "?action=" + data.action, {
        method: "GET"
      });
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
      method: "GET"
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

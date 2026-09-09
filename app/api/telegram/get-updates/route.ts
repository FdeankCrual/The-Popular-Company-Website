import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "No token configured in environment variables" }, { status: 500 });
  
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?offset=-10`);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Telegram" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Network error fetching updates" }, { status: 500 });
  }
}

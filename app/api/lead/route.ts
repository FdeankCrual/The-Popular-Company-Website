import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3Ry7tiEaOKETGI3ET8Co58398DVVGwOoGZnHhYtZ81lpj-DbQzVnvnjkoDB2T9GJnbQ/exec";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Google Apps Script usually responds with a 302 redirect on success.
    // We will use URLSearchParams to avoid preflight/CORS issues if any,
    // though server-to-server POST with text/plain is usually fine.
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
      redirect: "manual" // Don't follow the redirect, just accept the 302
    });

    // 200 OK or 302 Found means Google Apps Script successfully processed it
    if (response.ok || response.status === 302 || response.status === 301) {
        return NextResponse.json({ success: true });
    } else {
        console.error("Google Script Error:", response.status, response.statusText);
        return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error submitting lead:", error);
    return NextResponse.json({ error: "Failed to submit lead" }, { status: 500 });
  }
}

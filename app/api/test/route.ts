import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby3Ry7tiEaOKETGI3ET8Co58398DVVGwOoGZnHhYtZ81lpj-DbQzVnvnjkoDB2T9GJnbQ/exec";

export async function GET() {
  try {
    const data = {
      type: "Contact",
      name: "John",
      email: "john@test.com",
      target: "Web",
      message: "Test message"
    };

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    const text = await response.text();
    return NextResponse.json({ status: response.status, ok: response.ok, text });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}

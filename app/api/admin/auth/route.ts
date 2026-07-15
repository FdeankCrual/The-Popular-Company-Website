import { NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Fetch users from Google Sheets
    const res = await fetch(`${GOOGLE_SCRIPT_URL}?action=getUsers`);
    if (!res.ok) {
      return NextResponse.json({ error: "Auth server unreachable" }, { status: 500 });
    }
    const users = await res.json();
    
    // Check if user exists and password matches
    const user = users.find((u: any) => u.Email === email && u.Password === password);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Ensure roles is an array
    const roles = Array.isArray(user.Roles) ? user.Roles : (user.Roles ? [user.Roles] : []);

    // Create secure session cookie
    const cookieValue = await createSessionCookie({ 
      id: user.ID,
      name: user.Name,
      email: user.Email, 
      roles: roles
    });

    const response = NextResponse.json({ success: true, roles: roles });
    
    response.cookies.set('tpc_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

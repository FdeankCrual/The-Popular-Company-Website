import { NextResponse } from 'next/server';
import { createSessionCookie } from '@/lib/auth';

const DEFAULT_USERS = [
  { email: "admin@tpc.com", password: "password123", role: "SUPER_ADMIN" },
  { email: "manager@tpc.com", password: "password123", role: "MANAGER" },
  { email: "creator@tpc.com", password: "password123", role: "CREATOR" },
];

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Parse users from env or fallback to defaults for testing
    let users = DEFAULT_USERS;
    if (process.env.ADMIN_USERS) {
      try {
        users = JSON.parse(process.env.ADMIN_USERS);
      } catch (e) {
        console.error("Failed to parse ADMIN_USERS env variable");
      }
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Create secure session cookie
    const cookieValue = await createSessionCookie({ email: user.email, role: user.role as any });

    const response = NextResponse.json({ success: true, role: user.role });
    
    response.cookies.set('tpc_session', cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

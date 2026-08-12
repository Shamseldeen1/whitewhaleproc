import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db";
import { verifyPassword, signSession, SESSION_COOKIE, type Role } from "@/lib/auth";

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: Role;
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
  }

  const user = await queryOne<UserRow>(
    "SELECT id, username, password_hash, full_name, role FROM users WHERE username = $1",
    [username]
  );

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await signSession({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
  });

  const res = NextResponse.json({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
  });

  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h, matches token expiry
  });

  return res;
}

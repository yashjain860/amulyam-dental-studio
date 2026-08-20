import { NextRequest, NextResponse } from "next/server";
import { validateUserCredentials } from "@/lib/db";
import { PATIENT_COOKIE_NAME, ADMIN_COOKIE_NAME, SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = validateUserCredentials(email, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please try again." },
        { status: 401 }
      );
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    const cookieName = user.role === "admin" ? ADMIN_COOKIE_NAME : PATIENT_COOKIE_NAME;

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set({
      name: cookieName,
      value: encodeURIComponent(JSON.stringify(sessionUser)),
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Login failed." },
      { status: 500 }
    );
  }
}

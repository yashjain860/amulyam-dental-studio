import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail } from "@/lib/db";
import { PATIENT_COOKIE_NAME, SessionUser } from "@/lib/auth";
import { generateWelcomeEmail, sendEmailNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const existing = getUserByEmail(email);
    if (existing && existing.passwordHash) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const user = createUser({
      name,
      email,
      phone: phone || "",
      password,
      role: "patient",
      authProvider: "local",
    });

    // Send Welcome Email
    (async () => {
      try {
        const welcomeMail = generateWelcomeEmail({ name: user.name, email: user.email });
        await sendEmailNotification({
          to: user.email,
          subject: welcomeMail.subject,
          html: welcomeMail.html,
        });
      } catch (e) {
        console.error("Failed to send welcome email:", e);
      }
    })();

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: "patient",
    };

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set({
      name: PATIENT_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionUser)),
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to register account." },
      { status: 500 }
    );
  }
}

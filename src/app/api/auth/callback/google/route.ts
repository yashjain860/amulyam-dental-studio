import { NextRequest, NextResponse } from "next/server";
import { PATIENT_COOKIE_NAME, ADMIN_COOKIE_NAME, SessionUser } from "@/lib/auth";
import { findOrCreateGoogleUser, getUserByEmail } from "@/lib/db";
import { generateWelcomeEmail, sendEmailNotification } from "@/lib/email";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  let stateObj = { role: "patient", redirectUrl: "/patient-portal" };
  if (stateRaw) {
    try {
      stateObj = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
    } catch (e) {}
  }

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || (req.nextUrl.protocol ? req.nextUrl.protocol.replace(":", "") : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (error || !code) {
    return NextResponse.redirect(new URL(stateObj.redirectUrl + "?auth_error=" + (error || "missing_code"), origin));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Server missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET." },
      { status: 500 }
    );
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(new URL(stateObj.redirectUrl + "?auth_error=token_exchange_failed", origin));
    }

    // 2. Fetch real Google User Profile
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const gUser = await userRes.json();
    if (!userRes.ok || !gUser.email) {
      console.error("Google profile fetch failed:", gUser);
      return NextResponse.redirect(new URL(stateObj.redirectUrl + "?auth_error=profile_fetch_failed", origin));
    }

    const sessionUser: SessionUser = {
      name: gUser.name || gUser.email.split("@")[0],
      email: gUser.email,
      avatar: gUser.picture || "",
      role: (stateObj.role as "admin" | "patient") || "patient",
    };

    // 3. Upsert into database
    try {
      const isNewPatient = !getUserByEmail(sessionUser.email);
      findOrCreateGoogleUser({
        name: sessionUser.name,
        email: sessionUser.email,
        avatar: sessionUser.avatar,
      });

      if (isNewPatient && sessionUser.role === "patient") {
        (async () => {
          try {
            const welcomeMail = generateWelcomeEmail({ name: sessionUser.name, email: sessionUser.email });
            await sendEmailNotification({
              to: sessionUser.email,
              subject: welcomeMail.subject,
              html: welcomeMail.html,
            });
          } catch (e) {
            console.error("Failed to send Google welcome email:", e);
          }
        })();
      }
    } catch (dbErr) {
      console.error("Database user upsert error:", dbErr);
    }

    // 4. Set 30-day session cookie
    const cookieName = stateObj.role === "admin" ? ADMIN_COOKIE_NAME : PATIENT_COOKIE_NAME;
    const cookieValue = JSON.stringify(sessionUser);

    const redirectTarget = new URL(stateObj.redirectUrl, origin);
    const response = NextResponse.redirect(redirectTarget);

    response.cookies.set({
      name: cookieName,
      value: encodeURIComponent(cookieValue),
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Google OAuth token exchange exception:", err);
    return NextResponse.redirect(new URL(stateObj.redirectUrl + "?auth_error=oauth_exception", origin));
  }
}

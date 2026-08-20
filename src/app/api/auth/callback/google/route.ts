import { NextRequest, NextResponse } from "next/server";
import { PATIENT_COOKIE_NAME, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const isMock = searchParams.get("mock") === "true";
  const origin = req.headers.get("origin") || req.nextUrl.origin;

  let stateObj = { role: "patient", redirectUrl: "/patient-portal" };
  if (stateRaw) {
    try {
      stateObj = JSON.parse(Buffer.from(stateRaw, "base64").toString("utf-8"));
    } catch (e) {}
  } else {
    stateObj.role = searchParams.get("role") || "patient";
    stateObj.redirectUrl = searchParams.get("redirectUrl") || (stateObj.role === "admin" ? "/admin" : "/patient-portal");
  }

  let userInfo = {
    name: stateObj.role === "admin" ? "Dr. Shreya Nidhi (Admin)" : "Verified Google Patient",
    email: stateObj.role === "admin" ? "amulyamdentalstudio@gmail.com" : "patient@gmail.com",
    avatar: "",
    role: stateObj.role,
  };

  if (!isMock && code) {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${origin}/api/auth/callback/google`;

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId || "",
          client_secret: clientSecret || "",
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.access_token) {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const gUser = await userRes.json();
        userInfo = {
          name: gUser.name || userInfo.name,
          email: gUser.email || userInfo.email,
          avatar: gUser.picture || "",
          role: stateObj.role,
        };
      }
    } catch (err) {
      console.error("Google OAuth token exchange error:", err);
    }
  }

  const cookieName = stateObj.role === "admin" ? ADMIN_COOKIE_NAME : PATIENT_COOKIE_NAME;
  const cookieValue = JSON.stringify(userInfo);

  const response = NextResponse.redirect(new URL(stateObj.redirectUrl, req.url));
  response.cookies.set({
    name: cookieName,
    value: encodeURIComponent(cookieValue),
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  return response;
}

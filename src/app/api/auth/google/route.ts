import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "patient";
  const redirectUrl = searchParams.get("redirectUrl") || (role === "admin" ? "/admin" : "/patient-portal");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId) {
    // If Google Client ID is not configured, fall back to instant session
    const target = `${origin}/api/auth/callback/google?mock=true&role=${role}&redirectUrl=${encodeURIComponent(redirectUrl)}`;
    return NextResponse.redirect(target);
  }

  const state = Buffer.from(JSON.stringify({ role, redirectUrl })).toString("base64");

  const googleAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
      state: state,
    }).toString();

  return NextResponse.redirect(googleAuthUrl);
}

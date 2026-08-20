import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "patient";
  const redirectUrl = searchParams.get("redirectUrl") || (role === "admin" ? "/admin" : "/patient-portal");

  const clientId = process.env.GOOGLE_CLIENT_ID;

  const host = req.headers.get("x-forwarded-host") || req.nextUrl.host;
  const proto = req.headers.get("x-forwarded-proto") || (req.nextUrl.protocol ? req.nextUrl.protocol.replace(":", "") : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId) {
    return NextResponse.json(
      {
        error: "Google OAuth credentials (GOOGLE_CLIENT_ID) not configured in server environment.",
      },
      { status: 500 }
    );
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

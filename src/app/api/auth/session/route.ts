import { NextRequest, NextResponse } from "next/server";
import { PATIENT_COOKIE_NAME, ADMIN_COOKIE_NAME } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const patientCookie = req.cookies.get(PATIENT_COOKIE_NAME)?.value;
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;

  let patient = null;
  let admin = null;

  if (patientCookie) {
    try {
      patient = JSON.parse(decodeURIComponent(patientCookie));
    } catch (e) {}
  }

  if (adminCookie) {
    try {
      admin = JSON.parse(decodeURIComponent(adminCookie));
    } catch (e) {}
  }

  return NextResponse.json({
    authenticated: !!(patient || admin),
    patient,
    admin,
  });
}

export async function POST(req: NextRequest) {
  const { role } = await req.json();
  const response = NextResponse.json({ success: true });

  if (role === "admin") {
    response.cookies.delete(ADMIN_COOKIE_NAME);
  } else {
    response.cookies.delete(PATIENT_COOKIE_NAME);
  }

  return response;
}

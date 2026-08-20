import { NextRequest, NextResponse } from "next/server";
import { getAllInquiries, createInquiry } from "@/lib/db";
import { sendEmailNotification } from "@/lib/email";
import { CLINIC_INFO } from "@/lib/constants";

export async function GET() {
  try {
    const inquiries = getAllInquiries();
    return NextResponse.json({ success: true, inquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, serviceOfInterest, subject, message } = body;

    if (!firstName || !email || !phone || !message) {
      return NextResponse.json({ success: false, error: "Please fill in all required fields." }, { status: 400 });
    }

    const inquiry = createInquiry({
      firstName,
      lastName: lastName || "",
      email,
      phone,
      serviceOfInterest: serviceOfInterest || "General Inquiry",
      subject: subject || "Website Message",
      message,
    });

    // Notify admin
    (async () => {
      try {
        await sendEmailNotification({
          to: process.env.ADMIN_ALERT_EMAIL || CLINIC_INFO.email,
          subject: `📩 New Contact Inquiry from ${firstName} ${lastName || ""}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2 style="color: #C9A227;">New Website Inquiry</h2>
              <p><strong>From:</strong> ${firstName} ${lastName || ""} (${email}, ${phone})</p>
              <p><strong>Service of Interest:</strong> ${serviceOfInterest || "General"}</p>
              <p><strong>Subject:</strong> ${subject || "None"}</p>
              <p><strong>Message:</strong></p>
              <blockquote style="background: #f9f9f9; border-left: 4px solid #C9A227; padding: 10px 15px; margin: 0;">
                ${message}
              </blockquote>
            </div>
          `,
        });
      } catch (e) {
        console.error("Error sending inquiry notification:", e);
      }
    })();

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

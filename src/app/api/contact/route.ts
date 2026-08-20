import { NextRequest, NextResponse } from "next/server";
import { getAllInquiries, createInquiry } from "@/lib/db";
import { sendEmailNotification, generateContactInquiryAckEmail } from "@/lib/email";
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

    // 1. Send immediate confirmation email to the patient
    (async () => {
      try {
        const ackMail = generateContactInquiryAckEmail(inquiry);
        await sendEmailNotification({
          to: inquiry.email,
          subject: ackMail.subject,
          html: ackMail.html,
        });
      } catch (e) {
        console.error("Error sending user inquiry acknowledgement:", e);
      }
    })();

    // 2. Notify clinic admin
    (async () => {
      try {
        await sendEmailNotification({
          to: process.env.ADMIN_ALERT_EMAIL || CLINIC_INFO.email,
          subject: `📩 New Website Inquiry: ${firstName} ${lastName || ""} (${inquiry.serviceOfInterest || "General"})`,
          html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; padding: 25px; color: #2E2E2E;">
              <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; border: 1px solid #EFEAE1; overflow: hidden;">
                <div style="background: #1C1A17; color: #fff; padding: 20px; text-align: center; border-bottom: 3px solid #C9A227;">
                  <h2 style="margin: 0; color: #DDB83C; font-size: 20px;">New Contact Inquiry</h2>
                </div>
                <div style="padding: 25px; line-height: 1.6;">
                  <p><strong>From:</strong> ${firstName} ${lastName || ""}</p>
                  <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                  <p><strong>Phone / WhatsApp:</strong> <a href="tel:${phone}">${phone}</a></p>
                  <p><strong>Service of Interest:</strong> ${serviceOfInterest || "General"}</p>
                  <p><strong>Subject:</strong> ${subject || "None"}</p>
                  <div style="background: #FAF8F5; border-left: 4px solid #C9A227; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>Message:</strong>
                    <p style="margin: 5px 0 0; color: #444; font-style: italic;">"${message}"</p>
                  </div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (e) {
        console.error("Error sending admin inquiry notification:", e);
      }
    })();

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

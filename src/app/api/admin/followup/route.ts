import { NextRequest, NextResponse } from "next/server";
import { getBookingById } from "@/lib/db";
import { generateFollowUpEmail, sendEmailNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { bookingId, type } = await req.json();

    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }

    const emailData = generateFollowUpEmail(booking, type);
    const result = await sendEmailNotification({
      to: booking.patientEmail,
      subject: emailData.subject,
      html: emailData.html,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

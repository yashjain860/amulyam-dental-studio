import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBooking, deleteBooking } from "@/lib/db";
import { generatePatientStatusTransitionEmail, sendEmailNotification } from "@/lib/email";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = getBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const existing = getBookingById(id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }

    const previousStatus = existing.status;
    const updated = updateBooking(id, updates);

    if (!updated) {
      return NextResponse.json({ success: false, error: "Failed to update booking." }, { status: 400 });
    }

    // If status changed, send status update email to patient
    if (updates.status && updates.status !== previousStatus) {
      (async () => {
        try {
          const emailData = generatePatientStatusTransitionEmail(updated, updates.status);
          await sendEmailNotification({
            to: updated.patientEmail,
            subject: emailData.subject,
            html: emailData.html,
          });
        } catch (e) {
          console.error("Error sending status transition email:", e);
        }
      })();
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = deleteBooking(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Booking not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Booking removed successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

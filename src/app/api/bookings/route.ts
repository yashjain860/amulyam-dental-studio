import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, createBooking } from "@/lib/db";
import {
  generatePatientConfirmationEmail,
  generateAdminNewBookingAlertEmail,
  sendEmailNotification,
} from "@/lib/email";
import { CLINIC_INFO } from "@/lib/constants";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const date = searchParams.get("date") || undefined;
    const search = searchParams.get("search") || undefined;

    const bookings = getAllBookings({ status, date, search });
    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      patientName,
      patientPhone,
      patientEmail,
      age,
      gender,
      serviceId,
      serviceName,
      category,
      preferredDoctor,
      appointmentDate,
      timeSlot,
      notes,
    } = body;

    if (!patientName || !patientPhone || !patientEmail || !serviceName || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for booking." },
        { status: 400 }
      );
    }

    const newBooking = createBooking({
      patientName,
      patientPhone,
      patientEmail,
      age: age ? parseInt(age) : undefined,
      gender: gender || "Not specified",
      serviceId: serviceId || "general",
      serviceName,
      category: category || "General Dentistry",
      preferredDoctor: preferredDoctor || "Dr. Shreya Nidhi",
      appointmentDate,
      timeSlot,
      notes: notes || "",
    });

    // Asynchronously dispatch emails without blocking response
    (async () => {
      try {
        // 1. Patient Confirmation
        const patientEmailData = generatePatientConfirmationEmail(newBooking);
        await sendEmailNotification({
          to: newBooking.patientEmail,
          subject: patientEmailData.subject,
          html: patientEmailData.html,
        });

        // 2. Admin Alert
        const adminEmailData = generateAdminNewBookingAlertEmail(newBooking);
        await sendEmailNotification({
          to: process.env.ADMIN_ALERT_EMAIL || CLINIC_INFO.email,
          subject: adminEmailData.subject,
          html: adminEmailData.html,
        });
      } catch (e) {
        console.error("Error sending booking emails:", e);
      }
    })();

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

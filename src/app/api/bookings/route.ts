import { NextRequest, NextResponse } from "next/server";
import { getAllBookings, createBooking, getBookingsForUser, createUser, getUserByEmail } from "@/lib/db";
import { PATIENT_COOKIE_NAME, ADMIN_COOKIE_NAME, SessionUser } from "@/lib/auth";
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
    const ref = searchParams.get("ref");
    const phone = searchParams.get("phone");

    // Check sessions
    const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const patientCookie = req.cookies.get(PATIENT_COOKIE_NAME)?.value;

    let isAdmin = false;
    let patientUser: SessionUser | null = null;

    if (adminCookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(adminCookie));
        if (parsed.role === "admin") isAdmin = true;
      } catch (e) {}
    }

    if (patientCookie) {
      try {
        patientUser = JSON.parse(decodeURIComponent(patientCookie));
      } catch (e) {}
    }

    // 1. Admin gets access to all clinic bookings with filters
    if (isAdmin) {
      const bookings = getAllBookings({ status, date, search });
      return NextResponse.json({ success: true, bookings });
    }

    // 2. Authenticated Patient gets ONLY their own bookings
    if (patientUser) {
      const userBookings = getBookingsForUser(
        patientUser.email,
        patientUser.phone,
        patientUser.id
      );
      return NextResponse.json({ success: true, bookings: userBookings });
    }

    // 3. Strict Public Lookup: Requires Ref Number AND Phone combination
    if (ref && phone) {
      const all = getAllBookings();
      const cleanPhone = phone.replace(/\D/g, "");
      const match = all.find(
        (b) =>
          b.refNumber.toUpperCase() === ref.trim().toUpperCase() &&
          b.patientPhone.replace(/\D/g, "").includes(cleanPhone)
      );

      return NextResponse.json({
        success: true,
        bookings: match ? [match] : [],
      });
    }

    // 4. Unauthenticated without secret ref + phone -> return empty to protect privacy
    return NextResponse.json({ success: true, bookings: [] });
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
      password, // Optional user registration password
    } = body;

    if (!patientName || !patientPhone || !patientEmail || !serviceName || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "Missing required fields for booking." },
        { status: 400 }
      );
    }

    // 1. Find or create user account
    let user = getUserByEmail(patientEmail);
    if (!user) {
      user = createUser({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        password: password || undefined,
        role: "patient",
        authProvider: "local",
      });
    } else if (password && !user.passwordHash) {
      // If user had a placeholder account and now set a password
      user = createUser({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        password: password,
      });
    }

    // 2. Create booking bound to user ID
    const newBooking = createBooking({
      userId: user.id,
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

    // 3. Asynchronously dispatch emails without blocking response
    (async () => {
      try {
        // Patient Confirmation
        const patientEmailData = generatePatientConfirmationEmail(newBooking);
        await sendEmailNotification({
          to: newBooking.patientEmail,
          subject: patientEmailData.subject,
          html: patientEmailData.html,
        });

        // Admin Alert
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

    // 4. Return booking + automatic session cookie
    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: "patient",
    };

    const response = NextResponse.json({ success: true, booking: newBooking, user: sessionUser }, { status: 201 });
    response.cookies.set({
      name: PATIENT_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(sessionUser)),
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { createUser, createBooking, updateBooking, createInquiry, getUserByEmail } from "../src/lib/db";
import {
  generateWelcomeEmail,
  generatePatientConfirmationEmail,
  generateAdminNewBookingAlertEmail,
  generatePatientStatusTransitionEmail,
  generateFollowUpEmail,
  generateContactInquiryAckEmail,
  sendEmailNotification,
} from "../src/lib/email";

async function runDemoSuite() {
  console.log("🚀 Starting Amulyam Dental Studio Live Demo Execution...");

  const client = {
    name: "Dr. Shreya Nidhi",
    email: "amulyamdentalstudio@gmail.com",
    phone: "+919753133330",
    role: "patient" as const,
  };

  // 1. Create Patient Account
  console.log("\n1️⃣ Creating Patient Account for:", client.name);
  const user = createUser({
    name: client.name,
    email: client.email,
    phone: client.phone,
    password: "AmulyamPatient2026!",
    role: "patient",
    authProvider: "local",
  });
  console.log("✅ Account created with ID:", user.id);

  // 2. Dispatch Welcome Email
  console.log("\n2️⃣ Sending Welcome Email to:", client.email);
  const welcomeMail = generateWelcomeEmail({ name: client.name, email: client.email });
  const resWelcome = await sendEmailNotification({
    to: client.email,
    subject: welcomeMail.subject,
    html: welcomeMail.html,
  });
  console.log("📧 Welcome Email Status:", resWelcome);

  // 3. Create Appointment Booking
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  console.log("\n3️⃣ Creating Appointment Booking for:", dateStr, "at 11:00 AM - 12:00 PM");
  const booking = createBooking({
    patientName: client.name,
    patientPhone: client.phone,
    patientEmail: client.email,
    serviceId: "s1",
    serviceName: "Rotary Endodontics (Pain-Free Single-Visit RCT)",
    category: "Endodontics & Restorative",
    appointmentDate: dateStr,
    timeSlot: "11:00 AM - 12:00 PM",
    preferredDoctor: "Dr. Shreya Nidhi (BDS, MDS)",
    age: 32,
    gender: "Female",
    notes: "Consultation & initial digital smile scan for aesthetic veneer alignment.",
  });
  console.log("✅ Booking Created:", booking.refNumber);

  // 4. Dispatch Booking Confirmation Pass Email
  console.log("\n4️⃣ Sending Booking Confirmation Pass Email to:", client.email);
  const passMail = generatePatientConfirmationEmail(booking);
  const resPass = await sendEmailNotification({
    to: client.email,
    subject: passMail.subject,
    html: passMail.html,
  });
  console.log("📧 Booking Confirmation Status:", resPass);

  // 5. Dispatch Admin Alert Email
  console.log("\n5️⃣ Sending Admin Alert Email to:", client.email);
  const adminMail = generateAdminNewBookingAlertEmail(booking);
  const resAdmin = await sendEmailNotification({
    to: client.email,
    subject: adminMail.subject,
    html: adminMail.html,
  });
  console.log("📧 Admin Alert Status:", resAdmin);

  // 6. Update Booking Status to CONFIRMED with Doctor Notes & Prescription
  console.log("\n6️⃣ Confirming Appointment with Clinical Notes & Prescription...");
  const updatedBooking = updateBooking(booking.id, {
    status: "CONFIRMED",
    doctorNotes: "Pre-procedure radiographic assessment recommended prior to scan. Dental chair #1 pre-sterilized.",
    prescription: "Tab. Amoxicillin 500mg (1 stat if needed), Paracetamol 650mg SOS after meals.",
  });

  if (updatedBooking) {
    const statusMail = generatePatientStatusTransitionEmail(updatedBooking, "CONFIRMED");
    const resStatus = await sendEmailNotification({
      to: client.email,
      subject: statusMail.subject,
      html: statusMail.html,
    });
    console.log("📧 Status Update Email Status:", resStatus);
  }

  // 7. Dispatch Follow-Up Emails (24h Reminder & Post-Treatment Care)
  console.log("\n7️⃣ Sending 24h Reminder & Post-Care Follow-up Emails...");
  const reminderMail = generateFollowUpEmail(booking, "REMINDER_24H");
  await sendEmailNotification({
    to: client.email,
    subject: reminderMail.subject,
    html: reminderMail.html,
  });

  const postCareMail = generateFollowUpEmail(booking, "POST_TREATMENT_CARE");
  await sendEmailNotification({
    to: client.email,
    subject: postCareMail.subject,
    html: postCareMail.html,
  });
  console.log("📧 Follow-up Emails Dispatched!");

  // 8. Create & Dispatch Contact Inquiry Acknowledgement
  console.log("\n8️⃣ Submitting Contact Inquiry & Dispatching Acknowledgement...");
  const inquiry = createInquiry({
    firstName: "Shreya",
    lastName: "Nidhi",
    email: client.email,
    phone: client.phone,
    serviceOfInterest: "Cosmetic Dentistry & Veneers",
    subject: "Smile Makeover & Consultation Inquiry",
    message: "Inquiring about single-visit porcelain veneers and ceramic crown smile design options.",
  });

  const ackMail = generateContactInquiryAckEmail(inquiry);
  await sendEmailNotification({
    to: client.email,
    subject: ackMail.subject,
    html: ackMail.html,
  });
  console.log("📧 Inquiry Acknowledgement Dispatched!");

  console.log("\n🎉 ALL 7 CLIENT ACTIONS & EMAIL SEQUENCES EXECUTED SUCCESSFULLY!");
  console.log("Booking Pass URL: https://amulyam.thewebvale.com/booking-confirmation/" + booking.refNumber);
}

runDemoSuite().catch(console.error);

import nodemailer from "nodemailer";
import { Booking, ContactInquiry } from "./types";
import { CLINIC_INFO } from "./constants";

// Nodemailer transport setup with production fallback to info@thewebvale.com
function getMailTransporter() {
  const host = process.env.SMTP_HOST || "smtpout.secureserver.net";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "info@thewebvale.com";
  const pass = process.env.SMTP_PASS || "Global5972@";

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

// 1. Patient Confirmation Email HTML Template
export function generatePatientConfirmationEmail(booking: Booking): { subject: string; html: string } {
  const subject = `Confirmed: Your Dental Appointment at Amulyam Dental Studio (${booking.refNumber})`;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2E2E2E; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #EFEAE1; }
    .header { background: linear-gradient(135deg, #1C1A17 0%, #2A2621 100%); color: #ffffff; padding: 35px 30px; text-align: center; border-bottom: 3px solid #C9A227; }
    .header h1 { margin: 0 0 8px; font-size: 24px; color: #DDB83C; letter-spacing: 0.5px; }
    .header p { margin: 0; color: #D1C7B7; font-size: 14px; }
    .content { padding: 35px 30px; }
    .pass-card { background: #FAF8F5; border: 1px solid #E8E0D2; border-left: 4px solid #C9A227; border-radius: 12px; padding: 20px; margin: 25px 0; }
    .pass-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
    .pass-label { color: #7A7265; font-weight: 500; }
    .pass-value { color: #1C1A17; font-weight: 700; text-align: right; }
    .btn { display: inline-block; background: #C9A227; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-top: 15px; }
    .instructions { background: #F4F1EA; border-radius: 10px; padding: 16px 20px; margin-top: 25px; font-size: 13px; color: #595349; line-height: 1.6; }
    .footer { background: #FAF8F5; padding: 25px; text-align: center; font-size: 12px; color: #8A8175; border-top: 1px solid #EFEAE1; }
    .footer a { color: #C9A227; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${CLINIC_INFO.name}</h1>
      <p>Precision Care for Beautiful, Confident Smiles</p>
    </div>
    
    <div class="content">
      <h2 style="margin-top: 0; color: #1C1A17; font-size: 20px;">Hello ${booking.patientName},</h2>
      <p style="color: #555047; font-size: 15px; line-height: 1.6;">
        Thank you for booking with Amulyam Dental Studio. Your appointment request has been successfully registered with reference <strong>${booking.refNumber}</strong>.
      </p>

      <div class="pass-card">
        <div class="pass-row">
          <span class="pass-label">Reference ID:</span>
          <span class="pass-value" style="color: #C9A227;">${booking.refNumber}</span>
        </div>
        <div class="pass-row">
          <span class="pass-label">Treatment / Service:</span>
          <span class="pass-value">${booking.serviceName}</span>
        </div>
        <div class="pass-row">
          <span class="pass-label">Appointment Date:</span>
          <span class="pass-value">${booking.appointmentDate}</span>
        </div>
        <div class="pass-row">
          <span class="pass-label">Time Slot:</span>
          <span class="pass-value">${booking.timeSlot}</span>
        </div>
        <div class="pass-row">
          <span class="pass-label">Doctor:</span>
          <span class="pass-value">${booking.preferredDoctor}</span>
        </div>
        <div class="pass-row" style="margin-bottom: 0;">
          <span class="pass-label">Current Status:</span>
          <span class="pass-value" style="color: #2E7D32;">${booking.status}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://amulyam.thewebvale.com"}/booking-confirmation/${booking.refNumber}" class="btn">
          View Digital Appointment Pass & Calendar Sync →
        </a>
      </div>

      <div class="instructions">
        <strong>📋 Important Patient Instructions:</strong>
        <ul style="margin: 8px 0 0; padding-left: 20px;">
          <li>Please arrive 10 minutes prior to your scheduled time slot.</li>
          <li>Bring any previous dental records or X-rays if available.</li>
          <li>For questions or rescheduling, call us directly at <strong>${CLINIC_INFO.phone}</strong> or message on WhatsApp.</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px;"><strong>${CLINIC_INFO.name}</strong></p>
      <p style="margin: 0 0 8px;">${CLINIC_INFO.address}</p>
      <p style="margin: 0;">Phone: <a href="tel:${CLINIC_INFO.rawPhone}">${CLINIC_INFO.phone}</a> | Email: <a href="mailto:${CLINIC_INFO.email}">${CLINIC_INFO.email}</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// 2. Admin Alert Email HTML Template
export function generateAdminNewBookingAlertEmail(booking: Booking): { subject: string; html: string } {
  const subject = `🚨 New Booking: ${booking.patientName} (${booking.serviceName}) - ${booking.appointmentDate} at ${booking.timeSlot}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #121110; margin: 0; padding: 20px; color: #F5F3EF; }
    .container { max-width: 600px; margin: 0 auto; background: #1C1A17; border-radius: 16px; overflow: hidden; border: 1px solid #332F28; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    .header { background: #C9A227; color: #1C1A17; padding: 25px 30px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .content { padding: 30px; }
    .grid { background: #26231E; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #3D382E; }
    .row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; border-bottom: 1px solid #332F28; padding-bottom: 8px; }
    .label { color: #A39E93; }
    .val { color: #FFFFFF; font-weight: 600; text-align: right; }
    .btn { display: inline-block; background: #C9A227; color: #1C1A17 !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🦷 New Appointment Request Received</h1>
    </div>
    
    <div class="content">
      <p style="color: #D1C7B7; font-size: 15px;">A new appointment has been scheduled through the website booking portal:</p>
      
      <div class="grid">
        <div class="row">
          <span class="label">Reference ID</span>
          <span class="val" style="color: #DDB83C;">${booking.refNumber}</span>
        </div>
        <div class="row">
          <span class="label">Patient Name</span>
          <span class="val">${booking.patientName} ${booking.age ? `(${booking.age}y, ${booking.gender || ""})` : ""}</span>
        </div>
        <div class="row">
          <span class="label">Phone</span>
          <span class="val"><a href="tel:${booking.patientPhone}" style="color: #60A5FA;">${booking.patientPhone}</a></span>
        </div>
        <div class="row">
          <span class="label">Email</span>
          <span class="val"><a href="mailto:${booking.patientEmail}" style="color: #60A5FA;">${booking.patientEmail}</a></span>
        </div>
        <div class="row">
          <span class="label">Service</span>
          <span class="val">${booking.serviceName} (${booking.category})</span>
        </div>
        <div class="row">
          <span class="label">Date & Time</span>
          <span class="val" style="color: #4ADE80;">${booking.appointmentDate} @ ${booking.timeSlot}</span>
        </div>
        <div class="row" style="border-bottom: none; padding-bottom: 0;">
          <span class="label">Patient Notes</span>
          <span class="val">${booking.notes || "None provided"}</span>
        </div>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"}/admin" class="btn">
          Open Admin Dashboard to Confirm / Manage →
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// 3. Status Transition Email
export function generatePatientStatusTransitionEmail(booking: Booking, newStatus: string): { subject: string; html: string } {
  let title = "Appointment Status Updated";
  let statusColor = "#C9A227";
  let message = `Your appointment status has been updated to <strong>${newStatus}</strong>.`;

  if (newStatus === "CONFIRMED") {
    title = "Appointment Confirmed!";
    statusColor = "#2E7D32";
    message = `Dr. Shreya Nidhi and our team have confirmed your appointment for <strong>${booking.appointmentDate}</strong> at <strong>${booking.timeSlot}</strong>. We look forward to seeing you!`;
  } else if (newStatus === "RESCHEDULED") {
    title = "Appointment Rescheduled";
    statusColor = "#D97706";
    message = `Your appointment has been rescheduled to <strong>${booking.appointmentDate}</strong> at <strong>${booking.timeSlot}</strong>.`;
  } else if (newStatus === "COMPLETED") {
    title = "Treatment Completed - Thank You!";
    statusColor = "#1565C0";
    message = `Thank you for visiting Amulyam Dental Studio. Your session for <strong>${booking.serviceName}</strong> is marked complete. We hope you had a painless, pleasant experience!`;
  } else if (newStatus === "CANCELLED") {
    title = "Appointment Cancelled";
    statusColor = "#C62828";
    message = `Your appointment scheduled for ${booking.appointmentDate} at ${booking.timeSlot} has been cancelled. ${booking.cancellationReason ? `Reason: ${booking.cancellationReason}` : ""}`;
  }

  const subject = `${title}: Amulyam Dental Studio (${booking.refNumber})`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2E2E2E; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EFEAE1; }
    .header { background: #1C1A17; color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid ${statusColor}; }
    .content { padding: 30px; }
    .badge { display: inline-block; background: ${statusColor}; color: #ffffff; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #DDB83C; margin: 0 0 5px; font-size: 22px;">${CLINIC_INFO.name}</h1>
      <p style="margin: 0; color: #D1C7B7;">${title}</p>
    </div>
    <div class="content">
      <p>Dear ${booking.patientName},</p>
      <div style="margin: 15px 0;"><span class="badge">${newStatus}</span></div>
      <p style="line-height: 1.6; color: #4A453C;">${message}</p>
      
      ${booking.doctorNotes ? `
      <div style="background: #FAF8F5; border-left: 4px solid #C9A227; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>👨‍⚕️ Clinical Notes from Doctor:</strong>
        <p style="margin: 5px 0 0; color: #555;">${booking.doctorNotes}</p>
      </div>` : ""}

      ${booking.prescription ? `
      <div style="background: #F0FDF4; border-left: 4px solid #16A34A; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong>💊 Prescription / Post-care:</strong>
        <p style="margin: 5px 0 0; color: #166534;">${booking.prescription}</p>
      </div>` : ""}

      <p style="font-size: 13px; color: #888;">If you need assistance, please call us at ${CLINIC_INFO.phone}.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// 4. Follow-up Email Template (24h Reminder / Post-treatment Checkup)
export function generateFollowUpEmail(booking: Booking, type: "REMINDER_24H" | "POST_TREATMENT_CARE"): { subject: string; html: string } {
  const isReminder = type === "REMINDER_24H";
  const subject = isReminder
    ? `Reminder: Your Dental Appointment Tomorrow at Amulyam Dental Studio (${booking.timeSlot})`
    : `How is your recovery? Post-Treatment Check-in from Dr. Shreya Nidhi`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2E2E2E; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EFEAE1; }
    .header { background: #1C1A17; color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #C9A227; }
    .content { padding: 30px; line-height: 1.6; color: #4A453C; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #DDB83C; margin: 0 0 5px; font-size: 22px;">${CLINIC_INFO.name}</h1>
      <p style="margin: 0; color: #D1C7B7;">${isReminder ? "Upcoming Appointment Reminder" : "Post-Treatment Care Check-in"}</p>
    </div>
    <div class="content">
      <p>Dear ${booking.patientName},</p>
      
      ${
        isReminder
          ? `<p>This is a friendly reminder from Amulyam Dental Studio for your scheduled appointment:</p>
             <div style="background: #FAF8F5; border-left: 4px solid #C9A227; padding: 15px; border-radius: 8px; margin: 20px 0;">
               <strong>Treatment:</strong> ${booking.serviceName}<br>
               <strong>Date:</strong> ${booking.appointmentDate}<br>
               <strong>Time Slot:</strong> ${booking.timeSlot}<br>
               <strong>Doctor:</strong> ${booking.preferredDoctor}<br>
               <strong>Address:</strong> ${CLINIC_INFO.address}
             </div>
             <p>Please arrive 10 minutes early. If you need directions or have questions, feel free to call us at ${CLINIC_INFO.phone}.</p>`
          : `<p>We hope you are feeling well following your <strong>${booking.serviceName}</strong> procedure with Dr. Shreya Nidhi.</p>
             <p>Remember to follow your post-care instructions and take any prescribed medications as advised.</p>
             <p>If you experience any unusual discomfort or have questions, please reach out to us right away on WhatsApp or call ${CLINIC_INFO.phone}.</p>`
      }
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// 5. Welcome & Account Creation Email
export function generateWelcomeEmail(user: { name: string; email: string }): { subject: string; html: string } {
  const subject = `✨ Welcome to Amulyam Dental Studio — Your Smile Journey Begins`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2E2E2E; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EFEAE1; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #1C1A17 0%, #2A2621 100%); color: #ffffff; padding: 35px 30px; text-align: center; border-bottom: 3px solid #C9A227; }
    .header h1 { margin: 0 0 8px; font-size: 24px; color: #DDB83C; letter-spacing: 0.5px; }
    .header p { margin: 0; color: #D1C7B7; font-size: 14px; }
    .content { padding: 35px 30px; line-height: 1.6; color: #4A453C; }
    .feature-card { background: #FAF8F5; border: 1px solid #E8E0D2; border-left: 4px solid #C9A227; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .btn { display: inline-block; background: #C9A227; color: #1C1A17 !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; margin-top: 15px; }
    .footer { background: #FAF8F5; padding: 25px; text-align: center; font-size: 12px; color: #8A8175; border-top: 1px solid #EFEAE1; }
    .footer a { color: #C9A227; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${CLINIC_INFO.name}</h1>
      <p>Precision Dentistry • Aesthetic Care • Uncompromised Hygiene</p>
    </div>
    
    <div class="content">
      <h2 style="margin-top: 0; color: #1C1A17; font-size: 20px;">Welcome, ${user.name}!</h2>
      <p>
        Thank you for joining the <strong>Amulyam Dental Studio</strong> family. Your personal dental care account has been successfully created.
      </p>

      <div class="feature-card">
        <h3 style="margin-top: 0; color: #1C1A17; font-size: 16px;">🌟 What You Can Do in Your Care Portal:</h3>
        <ul style="margin: 10px 0 0; padding-left: 20px; font-size: 14px; color: #595349;">
          <li><strong>Digital Boarding Passes:</strong> Instant QR-code express check-in on appointment day.</li>
          <li><strong>Treatment History:</strong> Access clinical notes, past procedures, and follow-up schedules.</li>
          <li><strong>1-Click Booking:</strong> Effortlessly reserve your preferred dates & consultation slots.</li>
          <li><strong>Digital Prescriptions:</strong> View doctor medication guidelines anytime on mobile.</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005"}/patient-portal" class="btn">
          Access Your Patient Care Portal →
        </a>
      </div>

      <div style="background: #F4F1EA; border-radius: 10px; padding: 16px 20px; font-size: 13px; color: #595349;">
        <strong>🏥 Clinic Details & Appointments:</strong>
        <p style="margin: 6px 0 0;">
          <strong>Location:</strong> ${CLINIC_INFO.address}<br>
          <strong>Hours:</strong> Mon – Sat: 10:00 AM – 8:00 PM<br>
          <strong>Direct Line / WhatsApp:</strong> ${CLINIC_INFO.phone}
        </p>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 8px;"><strong>${CLINIC_INFO.name}</strong> • Led by Dr. Shreya Nidhi (BDS, MDS Endodontist)</p>
      <p style="margin: 0;">Phone: <a href="tel:${CLINIC_INFO.rawPhone}">${CLINIC_INFO.phone}</a> | Email: <a href="mailto:${CLINIC_INFO.email}">${CLINIC_INFO.email}</a></p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// 6. Contact Inquiry Acknowledgement Email for Patients
export function generateContactInquiryAckEmail(inquiry: ContactInquiry): { subject: string; html: string } {
  const subject = `We've Received Your Message — Amulyam Dental Studio`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 20px; color: #2E2E2E; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #EFEAE1; }
    .header { background: #1C1A17; color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #C9A227; }
    .content { padding: 30px; line-height: 1.6; color: #4A453C; }
    .footer { background: #FAF8F5; padding: 20px; text-align: center; font-size: 12px; color: #8A8175; border-top: 1px solid #EFEAE1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: #DDB83C; margin: 0 0 5px; font-size: 22px;">${CLINIC_INFO.name}</h1>
      <p style="margin: 0; color: #D1C7B7;">Message Received</p>
    </div>
    
    <div class="content">
      <p>Hello <strong>${inquiry.firstName} ${inquiry.lastName || ""}</strong>,</p>
      <p>
        Thank you for contacting Amulyam Dental Studio. We have received your inquiry regarding <strong>${inquiry.serviceOfInterest || "our dental services"}</strong>.
      </p>

      <div style="background: #FAF8F5; border-left: 4px solid #C9A227; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <strong style="color: #1C1A17;">Your Message Summary:</strong>
        <p style="margin: 5px 0 0; color: #555; font-style: italic;">"${inquiry.message}"</p>
      </div>

      <p>
        Our clinical desk and Dr. Shreya Nidhi will review your notes and respond via email (<strong>${inquiry.email}</strong>) or phone/WhatsApp (<strong>${inquiry.phone}</strong>) within 2 to 4 business hours.
      </p>

      <p style="font-size: 13px; color: #777;">
        Need urgent assistance? Feel free to call us directly at <strong>${CLINIC_INFO.phone}</strong>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">${CLINIC_INFO.name} • ${CLINIC_INFO.address}</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

// Multi-Channel Dispatcher
export async function sendEmailNotification(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  try {
    const transporter = getMailTransporter();
    const info = await transporter.sendMail({
      from: `"Amulyam Dental Studio" <info@thewebvale.com>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`[SMTP EMAIL DISPATCHED] To: ${options.to} | MessageId: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error("[SMTP EMAIL ERROR]", err);
    return { success: false, error: err.message };
  }
}

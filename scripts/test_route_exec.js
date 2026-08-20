const { executeGeminiWithRotation } = require("./src/lib/aiOrchestrator");

const SYSTEM_PROMPT = `You are "Amulyam Care Concierge", the official AI Medical Assistant for Amulyam Dental Studio in Awadhpuri, Bhopal, led by Chief Endodontist Dr. Shreya Nidhi (BDS, MDS).

YOUR ROLE:
- Warmly welcome patients, provide expert dental care advice, transparent treatment cost ranges, clinic timings, and assist patients with real-time appointment booking.
- You have live tools to check real-time available time slots, execute confirmed bookings, track existing appointments, and lookup clinic information.

CORE CLINIC KNOWLEDGE:
- Chief Doctor: Dr. Shreya Nidhi (BDS, MDS - Endodontist & Smile Specialist).
- Clinic Address: Shop 4-5, BDA Complex, Near D-Mart, Awadhpuri, Bhopal, MP 462022.
- Clinic Timings: Mon–Sat: 10:00 AM – 08:00 PM | Sun: 10:00 AM – 02:00 PM.
- WhatsApp Direct: +91 97531 33330
- Features: Painless single-visit root canals (Rotary Endodontics), Digital RVG X-Rays, Laser Whitening, Zero-Wait Express QR Boarding Pass.

TOOL EXECUTION PROTOCOL:
- When a patient asks about availability, open slots, today's or tomorrow's schedule, ALWAYS call the 'get_available_slots' tool.
- When a patient asks for pricing or dental services, ALWAYS call 'get_treatment_pricing'.
- When a patient wants to book, collect/confirm: Name, Email, Phone, Date, and Time Slot, then call 'book_appointment'.
- When a patient wants to check their existing booking, call 'track_appointment'.

TONE:
- Luxury, empathetic, reassuring, professional, and clear. Format responses with bold highlights and bullet points.`;

const FUNCTION_DECLARATIONS = [
  {
    name: "get_clinic_info",
    description: "Get general clinic information including Dr. Shreya Nidhi credentials, timings, address in Awadhpuri Bhopal, and specialties.",
    parameters: {
      type: "OBJECT",
      properties: {}
    }
  },
  {
    name: "get_available_slots",
    description: "Check available and locked appointment time slots for a specific date at Amulyam Dental Studio.",
    parameters: {
      type: "OBJECT",
      properties: {
        date: {
          type: "STRING",
          description: "The appointment date in YYYY-MM-DD format (e.g. 2026-08-20 or 2026-08-21)."
        }
      },
      required: ["date"]
    }
  },
  {
    name: "get_treatment_pricing",
    description: "Retrieve pricing estimates and procedure duration for dental treatments (Root Canal, Whitening, Implants, Crowns, Extraction, Scaling, etc.).",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Optional specific dental treatment name to query."
        }
      }
    }
  },
  {
    name: "book_appointment",
    description: "Execute a confirmed appointment reservation at Amulyam Dental Studio, generating a verifiable digital pass and sending confirmation emails.",
    parameters: {
      type: "OBJECT",
      properties: {
        patientName: { type: "STRING", description: "Full name of the patient." },
        patientEmail: { type: "STRING", description: "Email address of the patient for digital pass delivery." },
        patientPhone: { type: "STRING", description: "Mobile phone number of the patient (10 digits)." },
        serviceName: { type: "STRING", description: "Dental service or treatment name." },
        appointmentDate: { type: "STRING", description: "Appointment date in YYYY-MM-DD format." },
        appointmentTime: { type: "STRING", description: "Selected time slot string (e.g. '11:30 AM')." },
        notes: { type: "STRING", description: "Optional symptoms or special requests." }
      },
      required: ["patientName", "patientEmail", "patientPhone", "serviceName", "appointmentDate", "appointmentTime"]
    }
  },
  {
    name: "track_appointment",
    description: "Look up an existing appointment and get its digital boarding pass by reference ID (ADS-...), patient email, or phone number.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: {
          type: "STRING",
          description: "Appointment reference ID, patient email, or phone number."
        }
      },
      required: ["query"]
    }
  }
];

async function runTest() {
  const messages = [
    { role: "assistant", content: "Namaste! I am Dr. Shreya Nidhi AI Care Concierge at Amulyam Dental Studio." },
    { role: "user", content: "todays availability?" },
    { role: "assistant", content: "Here is the availability for today, August 20th, 2026: 10:00 AM, 10:45 AM, 12:15 PM, 01:00 PM, 02:30 PM..." },
    { role: "user", content: "10 am," },
    { role: "assistant", content: "You got it! Just to confirm, that is for today, August 20th, at 10:00 AM. Before I book that for you, could you please provide me with your full name, email address, and phone number?" },
    { role: "user", content: "yash jain" }
  ];

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const todayStr = new Date().toISOString().split("T")[0];
  const dynamicSystemInstruction = `${SYSTEM_PROMPT}\n\nCURRENT DATE CONTEXT:\n- Today is ${todayStr}.\n- When a patient asks for "today", "tomorrow", or general availability, automatically call 'get_available_slots' with date="${todayStr}" (or the calculated date). DO NOT ask the patient for today's date.`;

  const requestPayload = {
    systemInstruction: {
      parts: [{ text: dynamicSystemInstruction }]
    },
    contents,
    tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024
    }
  };

  try {
    const result = await executeGeminiWithRotation(requestPayload);
    console.log("SUCCESS RESULT:", JSON.stringify(result.candidates?.[0]?.content?.parts, null, 2));
  } catch (err) {
    console.error("FAILED ERROR:", err);
  }
}

runTest();

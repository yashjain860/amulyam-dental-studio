import { NextResponse } from "next/server";
import {
  getClinicInfo,
  getAvailableSlots,
  getTreatmentPricing,
  bookAppointmentTool,
  trackAppointmentTool
} from "@/lib/mcp/tools";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyATwIVFcgzAhmItK27YDm0km89_sMYRwZM";
const MODEL_NAME = "gemini-2.5-flash";

const SYSTEM_PROMPT = `You are "Amulyam Care Concierge", the official AI Medical Assistant for Amulyam Dental Studio in Awadhpuri, Bhopal, led by Chief Endodontist Dr. Shreya Nidhi (BDS, MDS).

YOUR ROLE:
- Warmly welcome patients, provide expert dental care information, transparent treatment cost ranges, clinic timings, and assist patients with real-time appointment booking.
- You have live tools to check real-time available time slots, execute confirmed bookings, track existing appointments, and lookup clinic information.

CORE CLINIC KNOWLEDGE:
- Chief Doctor: Dr. Shreya Nidhi (BDS, MDS - Endodontist & Smile Specialist).
- Clinic Address: Shop 4-5, BDA Complex, Near D-Mart, Awadhpuri, Bhopal, MP 462022.
- Clinic Timings: Mon–Sat: 10:00 AM – 08:00 PM | Sun: 10:00 AM – 02:00 PM.
- WhatsApp Direct: +91 97531 33330
- Features: Painless single-visit root canals (Rotary Endodontics), Digital RVG X-Rays, Laser Whitening, Zero-Wait Express QR Boarding Pass.

BOOKING PROTOCOL:
1. When a patient expresses interest in booking an appointment:
   - Ask for their preferred Date (YYYY-MM-DD or relative like 'tomorrow'), Service/Treatment, and call 'get_available_slots' to see open times.
   - Present available time slots clearly.
   - Collect Patient Name, Email Address, and Phone Number.
   - Once all 5 parameters (Name, Email, Phone, Date, Time Slot) are confirmed by the patient, immediately call 'book_appointment'.
2. After successful booking, warmly congratulate the patient and mention that their instant Digital Boarding Pass with QR code and Google Calendar sync has been dispatched to their email.

TONE & BEHAVIOR:
- Luxury, empathetic, clinically reassuring, professional, and concise.
- Format responses cleanly with bold highlights and bullet points.
- If an emergency is described (e.g. severe trauma or acute bleeding), advise immediate contact via phone/WhatsApp (+91 97531 33330).`;

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
          description: "The appointment date in YYYY-MM-DD format (e.g. 2026-08-21)."
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
        serviceName: { type: "STRING", description: "Dental service or treatment name (e.g. Rotary Endodontics, Consultation, Teeth Whitening)." },
        appointmentDate: { type: "STRING", description: "Appointment date in YYYY-MM-DD format." },
        appointmentTime: { type: "STRING", description: "Selected time slot string (e.g. '11:00 AM - 12:00 PM')." },
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

async function executeTool(name: string, args: any) {
  try {
    switch (name) {
      case "get_clinic_info":
        return await getClinicInfo();
      case "get_available_slots":
        return await getAvailableSlots(args.date);
      case "get_treatment_pricing":
        return await getTreatmentPricing(args.query);
      case "book_appointment":
        return await bookAppointmentTool(args);
      case "track_appointment":
        return await trackAppointmentTool(args.query);
      default:
        return { error: `Tool ${name} not found` };
    }
  } catch (err: any) {
    console.error(`Tool execution error for ${name}:`, err);
    return { error: err.message || "Failed to execute tool" };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Convert chat history to Gemini contents format
    const contents: any[] = [];
    for (const msg of messages) {
      const role = msg.role === "assistant" ? "model" : "user";
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    const requestPayload = {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents,
      tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error in /api/chat:", response.status, errText);
      return handleFallbackChat(messages);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    const candidateContent = candidate?.content;

    if (!candidateContent) {
      return handleFallbackChat(messages);
    }

    // Check if tool call requested
    const functionCallPart = candidateContent.parts?.find((p: any) => p.functionCall);

    if (functionCallPart && functionCallPart.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      console.log(`🤖 AI Tool Invocation: ${name}`, args);

      const toolResult = await executeTool(name, args);

      // Append assistant's function call and user's function response to conversation
      contents.push({
        role: "model",
        parts: [{ functionCall: { name, args } }]
      });

      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name,
              response: { output: toolResult }
            }
          }
        ]
      });

      // Second turn with tool result
      const followUpPayload = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
      };

      const followUpResponse = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpPayload)
      });

      if (followUpResponse.ok) {
        const followUpResult = await followUpResponse.json();
        const followUpText = followUpResult.candidates?.[0]?.content?.parts?.[0]?.text || "Your request has been processed.";

        return NextResponse.json({
          role: "assistant",
          content: followUpText,
          toolExecuted: name,
          toolData: toolResult,
          bookingConfirmation: (toolResult as any)?.appointment || null
        });
      }
    }

    // Regular text response
    const textOutput = candidateContent.parts?.map((p: any) => p.text).filter(Boolean).join("\n") || "Hello! How can I assist you with your dental care today?";

    return NextResponse.json({
      role: "assistant",
      content: textOutput,
      toolExecuted: null
    });
  } catch (error: any) {
    console.error("Fatal error in /api/chat:", error);
    return NextResponse.json(
      {
        role: "assistant",
        content: "Welcome to Amulyam Dental Studio! You can book an appointment directly here or reach Dr. Shreya Nidhi on WhatsApp at +91 97531 33330.",
        error: error.message
      },
      { status: 200 }
    );
  }
}

// Defensive conversational fallback
function handleFallbackChat(messages: any[]) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (lastMsg.includes("timing") || lastMsg.includes("hour") || lastMsg.includes("open")) {
    return NextResponse.json({
      role: "assistant",
      content: `🏥 **Amulyam Dental Studio Timings:**\n\n• **Monday – Saturday:** 10:00 AM – 08:00 PM\n• **Sunday:** 10:00 AM – 02:00 PM (Prior Appointment)\n\n📍 **Location:** Awadhpuri, BDA Complex, Bhopal\n📞 **WhatsApp:** +91 97531 33330`
    });
  }

  if (lastMsg.includes("price") || lastMsg.includes("cost") || lastMsg.includes("fee")) {
    return NextResponse.json({
      role: "assistant",
      content: `💰 **Estimated Treatment Costs at Amulyam Dental Studio:**\n\n• **Consultation & RVG X-Ray:** ₹300 – ₹500\n• **Single-Visit Rotary RCT:** ₹2,500 – ₹4,500\n• **Zirconia Crown:** ₹3,500 – ₹8,000\n• **Laser Teeth Whitening:** ₹4,000 – ₹8,000\n• **Ultrasonic Scaling & Polishing:** ₹1,000 – ₹2,000\n\nWould you like to book an appointment with Dr. Shreya Nidhi?`
    });
  }

  return NextResponse.json({
    role: "assistant",
    content: `👋 Welcome to **Amulyam Dental Studio**! I am Dr. Shreya Nidhi's AI Care Concierge.\n\nI can help you **book an express appointment**, check available doctor slots, or provide pricing details.\n\nHow can I help you today?`
  });
}

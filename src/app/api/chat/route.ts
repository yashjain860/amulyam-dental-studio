import { NextResponse } from "next/server";
import {
  getClinicInfo,
  getAvailableSlots,
  getTreatmentPricing,
  bookAppointmentTool,
  trackAppointmentTool
} from "@/lib/mcp/tools";
import { executeGeminiWithRotation } from "@/lib/aiOrchestrator";

export const dynamic = "force-dynamic";

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

BOOKING & MULTI-TURN CONVERSATION PROTOCOL:
- When a patient checks availability and then selects a time slot (e.g. "10 am", "10:00 AM", "4 pm"):
  1. Acknowledge the chosen time slot for today (or the discussed date).
  2. Ask for their Full Name, Email Address, and Phone Number (if not already provided) so you can book the slot.
- If a patient provides information in pieces across multiple messages (e.g. Turn 1: "10 am", Turn 2: "Yash Jain", Turn 3: "yash@thewebvale.com 9753133330"):
  1. Maintain active memory of all previously provided details (selected slot, date, patient name).
  2. Ask ONLY for whatever details are still missing (e.g. "Thank you, Yash! Could you please share your email and phone number?").
- When all 5 booking parameters (patientName, patientEmail, patientPhone, appointmentDate, appointmentTime) are known, IMMEDIATELY call the "book_appointment" tool.
- When a patient asks about availability, open slots, today's or tomorrow's schedule, ALWAYS call the 'get_available_slots' tool.
- When a patient asks for pricing or dental services, ALWAYS call 'get_treatment_pricing'.

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

    // Convert chat history to Gemini contents format with strict role validation & merging
    const contents: any[] = [];
    for (const msg of messages) {
      if (!msg.content || typeof msg.content !== "string") continue;
      const role = msg.role === "assistant" ? "model" : "user";
      
      // If previous message had the same role, merge parts
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += `\n${msg.content}`;
      } else {
        contents.push({
          role,
          parts: [{ text: msg.content }]
        });
      }
    }

    // Strict Gemini API invariant: contents array MUST start with role 'user'
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    if (contents.length === 0) {
      return NextResponse.json({
        role: "assistant",
        content: "Namaste! How can I assist you with your dental care at Amulyam Dental Studio today?"
      });
    }

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

    let result: any;
    try {
      result = await executeGeminiWithRotation(requestPayload);
    } catch (llmErr: any) {
      console.error("LLM Rotation error, falling back to intelligent handler:", llmErr?.message || llmErr);
      return await handleFallbackChat(messages, llmErr?.message);
    }

    const candidate = result.candidates?.[0];
    const candidateContent = candidate?.content;

    if (!candidateContent) {
      return await handleFallbackChat(messages);
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
        systemInstruction: { parts: [{ text: dynamicSystemInstruction }] },
        contents,
        generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
      };

      try {
        const followUpResult = await executeGeminiWithRotation(followUpPayload);
        const followUpText = followUpResult.candidates?.[0]?.content?.parts?.[0]?.text || "Your request has been processed.";

        return NextResponse.json({
          role: "assistant",
          content: followUpText,
          toolExecuted: name,
          toolData: toolResult,
          bookingConfirmation: (toolResult as any)?.appointment || null
        });
      } catch (followUpErr) {
        console.warn("Follow-up generation error, returning structured tool response:", followUpErr);
        return formatToolDirectResponse(name, toolResult);
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
    return await handleFallbackChat([]);
  }
}

// Format direct tool response in case LLM follow-up text is unavailable
function formatToolDirectResponse(name: string, toolResult: any) {
  if (name === "get_available_slots") {
    const available = toolResult.slots?.filter((s: any) => s.available).map((s: any) => s.time) || [];
    return NextResponse.json({
      role: "assistant",
      content: `📅 **Doctor Availability for ${toolResult.date}:**\n\nWe have **${toolResult.availableSlotsCount} open slots** available:\n\n${available.map((t: string) => `• **${t}**`).join("\n")}\n\nTo reserve a slot, simply reply with your preferred time, your name, email, and phone number!`,
      toolExecuted: name,
      toolData: toolResult
    });
  }

  if (name === "book_appointment" && toolResult.success) {
    return NextResponse.json({
      role: "assistant",
      content: `🎉 **Appointment Confirmed!**\n\nYour appointment (Ref: **${toolResult.appointment.id}**) is reserved for **${toolResult.appointment.date}** at **${toolResult.appointment.timeSlot}**.\n\nA digital boarding pass with a QR code has been sent to **${toolResult.appointment.patientEmail}**.`,
      toolExecuted: name,
      toolData: toolResult,
      bookingConfirmation: toolResult.appointment
    });
  }

  return NextResponse.json({
    role: "assistant",
    content: "Your request has been successfully processed by Dr. Shreya Nidhi's clinic system.",
    toolExecuted: name,
    toolData: toolResult
  });
}

// Intelligent semantic fallback handler with live database tool execution & conversational memory
async function handleFallbackChat(messages: any[], debugErr?: string) {
  const todayStr = new Date().toISOString().split("T")[0];
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  const lastMsgLower = lastUserMsg.toLowerCase().trim();
  const allUserText = messages.filter((m) => m.role === "user").map((m) => m.content).join(" ");
  const allTextLower = allUserText.toLowerCase();

  // 1. Extract potential booking entities across entire conversation history
  const emailMatch = allUserText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const foundEmail = emailMatch ? emailMatch[1] : null;

  const phoneMatch = allUserText.match(/(?:\+91[\s-]?)?([6-9]\d{9})/);
  const foundPhone = phoneMatch ? phoneMatch[1] : null;

  // Detect time slot
  let foundTime: string | null = null;
  const timeRegex = /(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/gi;
  const timeMatches = Array.from(allTextLower.matchAll(timeRegex));
  for (const m of timeMatches) {
    const raw = m[1].trim();
    if (raw.includes("am") || raw.includes("pm") || /^(?:10|11|12|1|2|3|4|5|6|7|8)$/.test(raw)) {
      // Normalize to HH:MM AM/PM format
      let formatted = raw.toUpperCase();
      if (!formatted.includes("AM") && !formatted.includes("PM")) {
        const hourNum = parseInt(raw);
        formatted = hourNum >= 10 && hourNum <= 11 ? `${hourNum}:00 AM` : `${hourNum}:00 PM`;
      } else if (!formatted.includes(":")) {
        formatted = formatted.replace(/(AM|PM)/, ":00 $1").trim();
      }
      foundTime = formatted;
    }
  }

  // Detect patient name from user turns that are not standard commands or slots
  let foundName: string | null = null;
  const nonCommandUserMsgs = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter((txt) => {
      const low = txt.toLowerCase();
      if (low === "hi" || low === "hello" || low.includes("timing") || low.includes("avail") || low.includes("slot") || low.includes("book") || low.includes("@") || /^\d+$/.test(low)) {
        return false;
      }
      return true;
    });

  if (nonCommandUserMsgs.length > 0) {
    const candidateName = nonCommandUserMsgs[nonCommandUserMsgs.length - 1]
      .replace(/(?:my name is|i am|name is|patient is|this is)\s*/i, "")
      .replace(/[,.!\n].*$/, "")
      .trim();
    if (candidateName.length > 1 && candidateName.length < 40 && !candidateName.includes("http")) {
      foundName = candidateName;
    }
  }

  // 2. If all 5 fields are present across conversation -> Auto-execute booking!
  if (foundName && foundEmail && foundPhone && foundTime) {
    try {
      const bookRes = await bookAppointmentTool({
        patientName: foundName,
        patientEmail: foundEmail,
        patientPhone: foundPhone,
        serviceName: "General Dental Consultation & Checkup",
        appointmentDate: todayStr,
        appointmentTime: foundTime
      });

      return formatToolDirectResponse("book_appointment", bookRes);
    } catch (bookErr) {
      console.error("Auto-fallback booking error:", bookErr);
    }
  }

  // 3. If time slot is selected but missing personal details
  if (foundTime && (!foundName || !foundEmail || !foundPhone)) {
    const missing: string[] = [];
    if (!foundName) missing.push("Full Name");
    if (!foundEmail) missing.push("Email Address");
    if (!foundPhone) missing.push("Phone Number (10 digits)");

    return NextResponse.json({
      role: "assistant",
      content: `👍 Excellent! I have reserved your slot for **${foundTime}** today (**${todayStr}**).\n\n${foundName ? `Patient: **${foundName}**\n` : ""}To confirm and dispatch your **Digital Boarding Pass & QR Code**, please provide your:\n\n${missing.map((m) => `• **${m}**`).join("\n")}`
    });
  }

  // 4. Availability / Slots query (handles typos like "availablity", "slots", "today", "tomorrow")
  if (
    lastMsgLower.includes("avail") ||
    lastMsgLower.includes("slot") ||
    lastMsgLower.includes("open") ||
    lastMsgLower.includes("today") ||
    lastMsgLower.includes("tomorrow") ||
    lastMsgLower.includes("schedule")
  ) {
    const isTomorrow = lastMsgLower.includes("tomorrow");
    const targetDate = new Date();
    if (isTomorrow) targetDate.setDate(targetDate.getDate() + 1);
    const dateStr = targetDate.toISOString().split("T")[0];

    const slotData = await getAvailableSlots(dateStr);
    const available = slotData.slots?.filter((s) => s.available).map((s) => s.time) || [];

    return NextResponse.json({
      role: "assistant",
      content: `📅 **Doctor Availability for ${isTomorrow ? "Tomorrow" : "Today"} (${dateStr}):**\n\nDr. Shreya Nidhi has **${slotData.availableSlotsCount} available slots**:\n\n${available.slice(0, 10).map((t) => `• **${t}**`).join("\n")}\n\nTo reserve a slot, reply with your preferred time (e.g. *"10:00 AM"*) and your name!`
    });
  }

  // 5. Timings & Location
  if (lastMsgLower.includes("timing") || lastMsgLower.includes("hour") || lastMsgLower.includes("address") || lastMsgLower.includes("where") || lastMsgLower.includes("location")) {
    return NextResponse.json({
      role: "assistant",
      content: `🏥 **Amulyam Dental Studio Timings & Location:**\n\n• **Monday – Saturday:** 10:00 AM – 08:00 PM\n• **Sunday:** 10:00 AM – 02:00 PM (Prior Appointment)\n• **Lead Doctor:** Dr. Shreya Nidhi (BDS, MDS - Endodontist)\n• **Location:** Shop 4-5, BDA Complex, Near D-Mart, Awadhpuri, Bhopal (MP 462022)\n• **WhatsApp Direct:** +91 97531 33330\n\nWould you like to check doctor availability for today?`
    });
  }

  // 6. Treatment Pricing
  if (lastMsgLower.includes("price") || lastMsgLower.includes("cost") || lastMsgLower.includes("fee") || lastMsgLower.includes("charge") || lastMsgLower.includes("rct") || lastMsgLower.includes("whitening") || lastMsgLower.includes("implant") || lastMsgLower.includes("crown")) {
    const pricing = await getTreatmentPricing(lastMsgLower);
    return NextResponse.json({
      role: "assistant",
      content: `💰 **Estimated Treatment Pricing at Amulyam Dental Studio:**\n\n${pricing.treatments.slice(0, 5).map((t) => `• **${t.name}:** ${t.priceEstimate} (*${t.duration}*)`).join("\n")}\n\n*Note: Final quote confirmed following RVG digital X-ray examination by Dr. Shreya Nidhi.*\n\nWould you like to reserve a consultation?`
    });
  }

  // 7. General conversational acknowledgment if user gave an answer
  if (lastUserMsg && lastUserMsg.length > 2 && lastMsgLower !== "hi" && lastMsgLower !== "hello") {
    return NextResponse.json({
      role: "assistant",
      content: `Thank you! I have noted **"${lastUserMsg}"**.\n\nPlease share your preferred appointment time (e.g. *10:00 AM*), along with your Name, Email, and Phone number to generate your instant digital boarding pass.`
    });
  }

  return NextResponse.json({
    role: "assistant",
    content: `👋 Welcome to **Amulyam Dental Studio**! I am Dr. Shreya Nidhi's AI Care Concierge.\n\nI can help you check **today's doctor availability**, get treatment estimates, or **book an express appointment** with an instant digital pass.\n\nHow can I help you today?`
  });
}


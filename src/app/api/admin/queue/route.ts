import { NextResponse } from "next/server";
import {
  getAllQueueTokens,
  createQueueToken,
  updateQueueToken,
  deleteQueueToken
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const queue = getAllQueueTokens();
    return NextResponse.json({ success: true, queue });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = createQueueToken({
      patientName: body.patientName || "Walk-In Patient",
      patientPhone: body.patientPhone || "",
      serviceName: body.serviceName || "Dental Consultation",
      status: body.status || "WAITING",
      chairAssigned: body.chairAssigned || "Chair 1 (Main Operatory)",
      bookingId: body.bookingId,
      notes: body.notes
    });
    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Queue Token ID required" }, { status: 400 });
    }
    const updated = updateQueueToken(id, updates);
    return NextResponse.json({ success: true, token: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Queue Token ID required" }, { status: 400 });
    }
    const ok = deleteQueueToken(id);
    return NextResponse.json({ success: ok });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSlotOverrides, saveSlotOverride } from "@/lib/db";

export async function GET() {
  try {
    const overrides = getSlotOverrides();
    return NextResponse.json({ success: true, overrides });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, isClosedFullDay, blockedSlots, reason } = body;

    if (!date) {
      return NextResponse.json({ success: false, error: "Date is required." }, { status: 400 });
    }

    const updated = saveSlotOverride({
      date,
      isClosedFullDay: !!isClosedFullDay,
      blockedSlots: blockedSlots || [],
      reason: reason || "",
    });

    return NextResponse.json({ success: true, overrides: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

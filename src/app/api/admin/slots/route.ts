import { NextRequest, NextResponse } from "next/server";
import { getSlotOverrides, saveSlotOverride, getBookedSlotsForDate } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const overrides = getSlotOverrides();
    const bookedSlots = date ? getBookedSlotsForDate(date) : [];

    return NextResponse.json({
      success: true,
      overrides,
      date,
      bookedSlots,
    });
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

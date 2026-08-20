import { NextResponse } from "next/server";
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  getAllCashRegisterEntries,
  createCashRegisterEntry,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "invoices" | "cash_register"
    const date = searchParams.get("date") || undefined;

    if (type === "cash_register") {
      const entries = getAllCashRegisterEntries(date);
      return NextResponse.json({ success: true, entries });
    }

    const invoices = getAllInvoices();
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === "CREATE_INVOICE") {
      const inv = createInvoice(data);
      return NextResponse.json({ success: true, invoice: inv });
    }

    if (action === "CREATE_CASH_ENTRY") {
      const entry = createCashRegisterEntry(data);
      return NextResponse.json({ success: true, entry });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

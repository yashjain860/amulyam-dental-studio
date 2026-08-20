import { NextResponse } from "next/server";
import {
  getDentalChart,
  saveDentalChart,
  getAllPrescriptions,
  createPrescription,
  getAllTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlan,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "chart" | "rx" | "treatment_plan"
    const patientEmail = searchParams.get("patientEmail");

    if (type === "chart") {
      if (!patientEmail) {
        return NextResponse.json({ success: false, error: "patientEmail required" }, { status: 400 });
      }
      const chart = getDentalChart(patientEmail);
      return NextResponse.json({ success: true, chart });
    }

    if (type === "treatment_plan") {
      const plans = getAllTreatmentPlans();
      return NextResponse.json({ success: true, treatmentPlans: plans });
    }

    // Default: return all prescriptions
    const prescriptions = getAllPrescriptions();
    return NextResponse.json({ success: true, prescriptions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (action === "SAVE_CHART") {
      const saved = saveDentalChart(data);
      return NextResponse.json({ success: true, chart: saved });
    }

    if (action === "CREATE_RX") {
      const rx = createPrescription(data);
      return NextResponse.json({ success: true, prescription: rx });
    }

    if (action === "CREATE_TREATMENT_PLAN") {
      const plan = createTreatmentPlan(data);
      return NextResponse.json({ success: true, treatmentPlan: plan });
    }

    if (action === "UPDATE_TREATMENT_PLAN") {
      const updated = updateTreatmentPlan(data.id, data.updates);
      return NextResponse.json({ success: true, treatmentPlan: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

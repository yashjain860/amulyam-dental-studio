import { NextResponse } from "next/server";
import {
  getDentalChart,
  saveDentalChart,
  getAllPrescriptions,
  createPrescription,
  getAllTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlan,
  getSmileTransformations,
  addSmileTransformation,
  getRadiographs,
  saveRadiograph,
  getConsentForms,
  createConsentForm,
  getDentalLabOrders,
  createDentalLabOrder,
  updateDentalLabOrderStatus,
  getInventoryItems,
  updateInventoryStock,
  getSterilizationLogs,
  logSterilizationCycle,
  getPostOpProtocols,
} from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const patientEmail = searchParams.get("patientEmail");
    const patientId = searchParams.get("patientId");

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

    if (type === "smile_cases") {
      return NextResponse.json({ success: true, smileCases: getSmileTransformations() });
    }

    if (type === "radiographs") {
      return NextResponse.json({ success: true, radiographs: getRadiographs(patientId || patientEmail || undefined) });
    }

    if (type === "consent_forms") {
      return NextResponse.json({ success: true, consentForms: getConsentForms(patientId || patientEmail || undefined) });
    }

    if (type === "lab_orders") {
      return NextResponse.json({ success: true, labOrders: getDentalLabOrders() });
    }

    if (type === "inventory") {
      return NextResponse.json({ success: true, inventory: getInventoryItems() });
    }

    if (type === "sterilization_logs") {
      return NextResponse.json({ success: true, sterilizationLogs: getSterilizationLogs() });
    }

    if (type === "protocols") {
      return NextResponse.json({ success: true, protocols: getPostOpProtocols() });
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
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body = await req.json();

    if (type === "lab_order") {
      const order = createDentalLabOrder(body);
      return NextResponse.json({ success: true, labOrder: order });
    }

    if (type === "radiograph") {
      const rad = saveRadiograph(body);
      return NextResponse.json({ success: true, radiograph: rad });
    }

    if (type === "consent_form") {
      const form = createConsentForm(body);
      return NextResponse.json({ success: true, consentForm: form });
    }

    if (type === "sterilization_log") {
      const log = logSterilizationCycle(body);
      return NextResponse.json({ success: true, sterilizationLog: log });
    }

    if (type === "smile_case") {
      const sCase = addSmileTransformation(body);
      return NextResponse.json({ success: true, smileCase: sCase });
    }

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

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const body = await req.json();

    if (type === "lab_order") {
      const updated = updateDentalLabOrderStatus(body.id, body.status);
      return NextResponse.json({ success: true, labOrder: updated });
    }

    if (type === "inventory_stock") {
      const updated = updateInventoryStock(body.id, body.delta);
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid patch type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

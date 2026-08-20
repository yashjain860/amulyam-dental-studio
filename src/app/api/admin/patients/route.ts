import { NextRequest, NextResponse } from "next/server";
import { getAllPatients, getPatientById, createPatient, updatePatient } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const patient = getPatientById(id);
      if (!patient) {
        return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, patient });
    }

    const patients = getAllPatients();
    return NextResponse.json({ success: true, patients });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, age, gender, bloodGroup, medicalHistory, allergies, address, emergencyContact, source, notes } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Patient name is required" }, { status: 400 });
    }

    const newPatient = createPatient({
      name,
      email: email || `patient.${Date.now()}@amulyamclinic.local`,
      phone: phone || "+91 00000 00000",
      authProvider: "local",
      age: age ? Number(age) : undefined,
      gender: gender || "Not Specified",
      bloodGroup: bloodGroup || "Unknown",
      medicalHistory: medicalHistory || "None",
      allergies: allergies || "None",
      address: address || "",
      emergencyContact: emergencyContact || "",
      source: source || "WALK_IN",
      notes: notes || "",
    });

    return NextResponse.json({ success: true, patient: newPatient });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Patient ID is required" }, { status: 400 });
    }

    const updated = updatePatient(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

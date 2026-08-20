import fs from "fs";
import path from "path";
import { Booking, ContactInquiry, ClinicSlotOverride, ClinicStats, BookingStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "amulyam_store.json");

interface DatabaseSchema {
  bookings: Booking[];
  inquiries: ContactInquiry[];
  slotOverrides: ClinicSlotOverride[];
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialData(): DatabaseSchema {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return {
    bookings: [
      {
        id: "book-101",
        refNumber: "ADS-2026-8941",
        patientName: "Aarav Sharma",
        patientPhone: "+91 98260 12345",
        patientEmail: "aarav.sharma@example.com",
        age: 29,
        gender: "Male",
        serviceId: "rct",
        serviceName: "Root Canal Treatment (RCT)",
        category: "Endodontics",
        preferredDoctor: "Dr. Shreya Nidhi",
        appointmentDate: today,
        timeSlot: "11:30 AM",
        notes: "Mild pain in lower left molar when drinking cold water.",
        status: "CONFIRMED",
        doctorNotes: "Rotary RCT scheduled for tooth #36. RVG pre-op done.",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "book-102",
        refNumber: "ADS-2026-9012",
        patientName: "Neha Gupta",
        patientPhone: "+91 94250 98765",
        patientEmail: "neha.gupta@example.com",
        age: 34,
        gender: "Female",
        serviceId: "teeth-whitening",
        serviceName: "Teeth Whitening (Bleaching)",
        category: "Cosmetic",
        preferredDoctor: "Dr. Shreya Nidhi",
        appointmentDate: today,
        timeSlot: "03:15 PM",
        notes: "Wedding in 2 weeks, wants in-office laser whitening.",
        status: "PENDING",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "book-103",
        refNumber: "ADS-2026-9154",
        patientName: "Rajesh Mehra",
        patientPhone: "+91 98930 45678",
        patientEmail: "rajesh.mehra@example.com",
        age: 52,
        gender: "Male",
        serviceId: "dental-implants",
        serviceName: "Dental Implants",
        category: "Implantology",
        preferredDoctor: "Dr. Shreya Nidhi",
        appointmentDate: tomorrow,
        timeSlot: "04:45 PM",
        notes: "Consultation for single molar implant.",
        status: "CONFIRMED",
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "book-104",
        refNumber: "ADS-2026-7832",
        patientName: "Pooja Trivedi",
        patientPhone: "+91 97520 33445",
        patientEmail: "pooja.t@example.com",
        age: 26,
        gender: "Female",
        serviceId: "aligners",
        serviceName: "Clear Aligners",
        category: "Orthodontics",
        preferredDoctor: "Dr. Shreya Nidhi",
        appointmentDate: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
        timeSlot: "05:30 PM",
        notes: "Reviewing 3D scan and first set of aligner trays.",
        status: "COMPLETED",
        doctorNotes: "Delivered aligner set 1-4. Patient instructed on 22hr wear time.",
        prescription: "Orasore gel PRN for minor gum friction.",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    inquiries: [
      {
        id: "inq-1",
        firstName: "Vikram",
        lastName: "Patel",
        email: "vikram.patel@example.com",
        phone: "+91 91234 56789",
        serviceOfInterest: "Dental Implants",
        subject: "Full mouth rehabilitation quote inquiry",
        message: "Hi, my father needs multiple implants. Could you please share the rough estimate and if EMI options are available?",
        status: "NEW",
        createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
    ],
    slotOverrides: [],
  };
}

export function readDb(): DatabaseSchema {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const initial = getInitialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

export function writeDb(data: DatabaseSchema): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Booking Operations
export function getAllBookings(filter?: { status?: string; date?: string; search?: string }): Booking[] {
  const db = readDb();
  let list = [...db.bookings];

  if (filter?.status && filter.status !== "ALL") {
    list = list.filter((b) => b.status === filter.status);
  }

  if (filter?.date) {
    list = list.filter((b) => b.appointmentDate === filter.date);
  }

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(
      (b) =>
        b.patientName.toLowerCase().includes(q) ||
        b.patientPhone.includes(q) ||
        b.patientEmail.toLowerCase().includes(q) ||
        b.refNumber.toLowerCase().includes(q) ||
        b.serviceName.toLowerCase().includes(q)
    );
  }

  // Sort descending by appointment date and creation time
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBookingById(id: string): Booking | null {
  const db = readDb();
  return db.bookings.find((b) => b.id === id || b.refNumber.toUpperCase() === id.toUpperCase()) || null;
}

export function createBooking(input: Omit<Booking, "id" | "refNumber" | "status" | "createdAt" | "updatedAt">): Booking {
  const db = readDb();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const refNumber = `ADS-${new Date().getFullYear()}-${randomSuffix}`;
  const id = `book-${Date.now()}`;

  const newBooking: Booking = {
    ...input,
    id,
    refNumber,
    status: "PENDING",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.bookings.unshift(newBooking);
  writeDb(db);
  return newBooking;
}

export function updateBooking(id: string, updates: Partial<Booking>): Booking | null {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === id || b.refNumber.toUpperCase() === id.toUpperCase());
  if (idx === -1) return null;

  db.bookings[idx] = {
    ...db.bookings[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  writeDb(db);
  return db.bookings[idx];
}

export function deleteBooking(id: string): boolean {
  const db = readDb();
  const initialLen = db.bookings.length;
  db.bookings = db.bookings.filter((b) => b.id !== id && b.refNumber.toUpperCase() !== id.toUpperCase());
  if (db.bookings.length !== initialLen) {
    writeDb(db);
    return true;
  }
  return false;
}

// Inquiries Operations
export function getAllInquiries(): ContactInquiry[] {
  const db = readDb();
  return db.inquiries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createInquiry(input: Omit<ContactInquiry, "id" | "status" | "createdAt">): ContactInquiry {
  const db = readDb();
  const newInq: ContactInquiry = {
    ...input,
    id: `inq-${Date.now()}`,
    status: "NEW",
    createdAt: new Date().toISOString(),
  };
  db.inquiries.unshift(newInq);
  writeDb(db);
  return newInq;
}

// Slots & Stats
export function getSlotOverrides(): ClinicSlotOverride[] {
  const db = readDb();
  return db.slotOverrides || [];
}

export function saveSlotOverride(override: ClinicSlotOverride): ClinicSlotOverride[] {
  const db = readDb();
  const existingIdx = db.slotOverrides.findIndex((o) => o.date === override.date);
  if (existingIdx >= 0) {
    db.slotOverrides[existingIdx] = override;
  } else {
    db.slotOverrides.push(override);
  }
  writeDb(db);
  return db.slotOverrides;
}

export function getStats(): ClinicStats {
  const db = readDb();
  const today = new Date().toISOString().split("T")[0];

  return {
    totalBookings: db.bookings.length,
    todayBookings: db.bookings.filter((b) => b.appointmentDate === today).length,
    pendingBookings: db.bookings.filter((b) => b.status === "PENDING").length,
    confirmedBookings: db.bookings.filter((b) => b.status === "CONFIRMED").length,
    completedBookings: db.bookings.filter((b) => b.status === "COMPLETED").length,
    cancelledBookings: db.bookings.filter((b) => b.status === "CANCELLED").length,
    totalInquiries: db.inquiries.length,
  };
}

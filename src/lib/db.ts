import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  Booking,
  ContactInquiry,
  ClinicSlotOverride,
  ClinicStats,
  BookingStatus,
  UserAccount,
  QueueToken,
  PatientDentalChart,
  Prescription,
  TreatmentPlan,
  Invoice,
  CashRegisterEntry,
} from "./types";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "_amulyam_salt_2026").digest("hex");
}

interface DatabaseSchema {
  users: UserAccount[];
  bookings: Booking[];
  inquiries: ContactInquiry[];
  slotOverrides: ClinicSlotOverride[];
  queue: QueueToken[];
  dentalCharts: PatientDentalChart[];
  prescriptions: Prescription[];
  treatmentPlans: TreatmentPlan[];
  invoices: Invoice[];
  cashRegister: CashRegisterEntry[];
}


function getDbFilePath(): string {
  // If running in Vercel or AWS Lambda serverless environment, /var/task is read-only.
  // We must write to /tmp which is the only writable directory.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production") {
    const tmpDir = path.join("/tmp", "amulyam_data");
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch (e) {}
    }
    return path.join(tmpDir, "amulyam_store.json");
  }

  // Local development
  const localDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(localDir)) {
    try {
      fs.mkdirSync(localDir, { recursive: true });
    } catch (e) {}
  }
  return path.join(localDir, "amulyam_store.json");
}

let memoryCache: DatabaseSchema | null = null;



function getInitialData(): DatabaseSchema {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return {
    users: [
      {
        id: "user-admin",
        name: "Dr. Shreya Nidhi",
        email: "amulyamdentalstudio@gmail.com",
        phone: "+91 92036 04211",
        passwordHash: hashPassword("1234"),
        role: "admin",
        authProvider: "local",
        createdAt: new Date().toISOString(),
      },
      {
        id: "pat-1",
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone: "+91 98260 12345",
        passwordHash: hashPassword("patient123"),
        role: "patient",
        authProvider: "local",
        age: 29,
        gender: "Male",
        bloodGroup: "O+",
        medicalHistory: "No major systemic conditions",
        allergies: "None",
        address: "E-7 Arera Colony, Bhopal",
        emergencyContact: "Mrs. Sunita Sharma (+91 98260 99999)",
        source: "WEBSITE",
        notes: "Sensitive lower molars, interested in preventive care",
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: "pat-2",
        name: "Neha Gupta",
        email: "neha.gupta@example.com",
        phone: "+91 94250 98765",
        passwordHash: hashPassword("patient123"),
        role: "patient",
        authProvider: "local",
        age: 34,
        gender: "Female",
        bloodGroup: "B+",
        medicalHistory: "Mild asthma (inhaler)",
        allergies: "Penicillin allergy (caution)",
        address: "B-12 Bawadiya Kalan, Bhopal",
        emergencyContact: "Rohit Gupta (+91 94250 11111)",
        source: "WEBSITE",
        notes: "Cosmetic smile makeover and whitening before wedding",
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
      },
      {
        id: "pat-3",
        name: "Rajesh Mehra",
        email: "rajesh.mehra@example.com",
        phone: "+91 98930 55443",
        passwordHash: hashPassword("patient123"),
        role: "patient",
        authProvider: "local",
        age: 52,
        gender: "Male",
        bloodGroup: "A+",
        medicalHistory: "Type 2 Diabetes (HbA1c 6.8)",
        allergies: "None",
        address: "HIG-45 Awadhpuri BDA Road, Bhopal",
        emergencyContact: "Anjali Mehra (+91 98930 22222)",
        source: "WALK_IN",
        notes: "Requires bilateral molar crowns and routine scaling",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: "pat-4",
        name: "Pooja Trivedi",
        email: "pooja.trivedi@example.com",
        phone: "+91 91110 33445",
        passwordHash: hashPassword("patient123"),
        role: "patient",
        authProvider: "local",
        age: 26,
        gender: "Female",
        bloodGroup: "AB+",
        medicalHistory: "None",
        allergies: "None",
        address: "Minal Residency, Bhopal",
        emergencyContact: "Vikas Trivedi (+91 91110 77777)",
        source: "REFERRAL",
        notes: "Clear aligner scan done, awaiting tray dispatch",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: "pat-5",
        name: "Amitabh Verma",
        email: "amitabh.verma@example.com",
        phone: "+91 98270 44556",
        passwordHash: hashPassword("patient123"),
        role: "patient",
        authProvider: "local",
        age: 61,
        gender: "Male",
        bloodGroup: "O+",
        medicalHistory: "Hypertension (Amlodipine 5mg)",
        allergies: "Sulfa drugs",
        address: "Gulmohar Colony, Bhopal",
        emergencyContact: "Suman Verma (+91 98270 88888)",
        source: "PHONE",
        notes: "Implant evaluation for missing upper premolar",
        createdAt: new Date().toISOString(),
      },
    ],

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
    queue: [
      {
        id: "q-1",
        tokenNumber: "#T-01",
        bookingId: "book-101",
        patientName: "Aarav Sharma",
        patientPhone: "+91 98260 12345",
        serviceName: "Root Canal Treatment (RCT)",
        status: "IN_CHAIR",
        chairAssigned: "Chair 1 (Main Operatory)",
        checkInTime: "11:15 AM",
        calledAt: "11:28 AM",
        notes: "RVG done. Tooth #36 access cavity prepared.",
      },
      {
        id: "q-2",
        tokenNumber: "#T-02",
        bookingId: "book-102",
        patientName: "Neha Gupta",
        patientPhone: "+91 94250 98765",
        serviceName: "Teeth Whitening (Bleaching)",
        status: "WAITING",
        checkInTime: "03:00 PM",
        notes: "Pre-wedding laser bleaching consultation.",
      },
      {
        id: "q-3",
        tokenNumber: "#T-03",
        patientName: "Amitabh Verma (Walk-In)",
        patientPhone: "+91 98930 11223",
        serviceName: "Emergency Toothache / Pain Relief",
        status: "WAITING",
        checkInTime: "03:10 PM",
        notes: "Walk-in emergency: Acute pain upper right molar.",
      },
    ],
    dentalCharts: [
      {
        patientId: "usr-aarav-101",
        patientEmail: "aarav.sharma@example.com",
        patientName: "Aarav Sharma",
        teeth: {
          36: {
            toothNumber: 36,
            condition: "RCT_NEEDED",
            surfaces: { occlusal: true, distal: true },
            notes: "Deep disto-occlusal caries invading pulp chamber. Severe cold sensitivity.",
            updatedAt: new Date().toISOString(),
          },
          16: {
            toothNumber: 16,
            condition: "RESTORED",
            surfaces: { occlusal: true },
            notes: "Composite restoration intact (2025).",
            updatedAt: new Date().toISOString(),
          },
          48: {
            toothNumber: 48,
            condition: "MISSING",
            notes: "Surgically extracted in 2024.",
            updatedAt: new Date().toISOString(),
          },
        },
        lastUpdated: new Date().toISOString(),
      },
    ],
    prescriptions: [
      {
        id: "rx-1",
        rxNumber: "ADS-RX-2026-8941",
        bookingId: "book-101",
        patientName: "Aarav Sharma",
        patientAge: 29,
        patientGender: "Male",
        patientPhone: "+91 98260 12345",
        patientEmail: "aarav.sharma@example.com",
        diagnosis: "Acute Irreversible Pulpitis w/ Apical Periodontitis #36",
        chiefComplaint: "Severe throbbing pain in lower left molar radiating to jaw.",
        medicines: [
          {
            name: "Augmentin (Amoxicillin + Pot. Clavulanate)",
            dosage: "625 mg",
            frequency: "1-0-1",
            timing: "After Food",
            duration: "5 Days",
            instructions: "Complete entire antibiotic course without skipping.",
          },
          {
            name: "Zerodol-SP (Aceclofenac + Paracetamol + Serratiopeptidase)",
            dosage: "1 Tab",
            frequency: "1-0-1",
            timing: "After Food",
            duration: "3 Days",
            instructions: "For pain & swelling relief. Take strictly after meals.",
          },
          {
            name: "Hexidine Mouthwash (Chlorhexidine 0.2%)",
            dosage: "10 ml",
            frequency: "1-0-1",
            timing: "After Food",
            duration: "7 Days",
            instructions: "Swish for 60 seconds twice daily. Do not swallow.",
          },
        ],
        specialAdvice: "Avoid biting hard foods on left side until final crown placement.",
        doctorName: "Dr. Shreya Nidhi (BDS, MDS)",
        doctorRegistration: "MPDC-8842-A",
        createdAt: new Date().toISOString(),
      },
    ],
    treatmentPlans: [
      {
        id: "tp-1",
        bookingId: "book-101",
        patientName: "Aarav Sharma",
        patientEmail: "aarav.sharma@example.com",
        title: "Single-Visit Rotary RCT + CAD/CAM Zirconia Crown (#36)",
        steps: [
          {
            id: "step-1",
            title: "Pre-Op Digital RVG X-Ray & Bio-mechanical Preparation",
            description: "Access opening, canal location (MB, ML, D), rotary nickel-titanium shaping to 4% taper.",
            estimatedCost: 2500,
            status: "COMPLETED",
            completedAt: new Date().toISOString(),
          },
          {
            id: "step-2",
            title: "Canal Chemo-Mechanical Disinfection & 3D Warm Gutta-Percha Obturation",
            description: "Sonic irrigation w/ 3% NaOCl and resin-based AH Plus sealer.",
            estimatedCost: 2000,
            status: "IN_PROGRESS",
          },
          {
            id: "step-3",
            title: "Fiber Post Core Build-Up & Dual-Cure Composite",
            description: "Structural reinforcement of tooth #36 crown structure.",
            estimatedCost: 1500,
            status: "PLANNED",
          },
          {
            id: "step-4",
            title: "CAD/CAM Multi-Layered Zirconia Crown (15-Yr Warranty)",
            description: "Intraoral 3D scan, custom milling, and resin luting cementation.",
            estimatedCost: 6500,
            status: "PLANNED",
          },
        ],
        totalEstimatedCost: 12500,
        totalPaid: 4500,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
      },
    ],
    invoices: [
      {
        id: "inv-101",
        invoiceNumber: "ADS-INV-2026-0042",
        bookingId: "book-101",
        patientName: "Aarav Sharma",
        patientPhone: "+91 98260 12345",
        patientEmail: "aarav.sharma@example.com",
        items: [
          {
            id: "item-1",
            description: "Rotary Endodontics (Root Canal Treatment - Molar #36)",
            category: "Endodontics",
            unitPrice: 4500,
            quantity: 1,
            taxableAmount: 4500,
          },
          {
            id: "item-2",
            description: "High-Resolution Digital RVG Diagnostic X-Ray (Pre-Op + Working Length)",
            category: "Diagnostic",
            unitPrice: 400,
            quantity: 2,
            taxableAmount: 800,
          },
        ],
        subtotal: 5300,
        discountTotal: 300,
        taxTotal: 0,
        grandTotal: 5000,
        amountPaid: 5000,
        balanceDue: 0,
        paymentMethod: "UPI_QR",
        paymentStatus: "PAID",
        receiptUrl: "/receipts/ADS-INV-2026-0042.pdf",
        createdAt: new Date().toISOString(),
      },
      {
        id: "inv-102",
        invoiceNumber: "ADS-INV-2026-0043",
        bookingId: "book-104",
        patientName: "Pooja Trivedi",
        patientPhone: "+91 97520 33445",
        patientEmail: "pooja.t@example.com",
        items: [
          {
            id: "item-1",
            description: "Clear Aligners 3D Treatment Plan & Step 1-4 Trays",
            category: "Orthodontics",
            unitPrice: 35000,
            quantity: 1,
            taxableAmount: 35000,
          },
        ],
        subtotal: 35000,
        discountTotal: 2000,
        taxTotal: 0,
        grandTotal: 33000,
        amountPaid: 20000,
        balanceDue: 13000,
        paymentMethod: "CARD",
        paymentStatus: "PARTIAL",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    cashRegister: [
      {
        id: "cr-1",
        date: today,
        type: "INCOME",
        category: "Patient Treatment Billing",
        amount: 5000,
        method: "UPI_QR",
        description: "Aarav Sharma - RCT #36 & RVG (ADS-INV-2026-0042)",
        recordedBy: "Frontdesk / Priya",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cr-2",
        date: today,
        type: "INCOME",
        category: "Consultation Fee",
        amount: 500,
        method: "CASH",
        description: "Walk-in Consultation - Amitabh Verma",
        recordedBy: "Frontdesk / Priya",
        createdAt: new Date().toISOString(),
      },
      {
        id: "cr-3",
        date: today,
        type: "EXPENSE",
        category: "Clinic Consumables",
        amount: 350,
        method: "CASH",
        description: "Sterilization autoclave indicator strips & distilled water",
        recordedBy: "Dr. Shreya Nidhi",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function readDb(): DatabaseSchema {
  if (memoryCache) {
    return memoryCache;
  }

  const dbFile = getDbFilePath();
  const bundledFile = path.join(process.cwd(), "data", "amulyam_store.json");

  // 1. If writable store exists, read it
  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      memoryCache = JSON.parse(raw);
      return memoryCache!;
    } catch (e) {}
  }

  // 2. If bundled file exists, seed from bundled file
  if (fs.existsSync(bundledFile)) {
    try {
      const raw = fs.readFileSync(bundledFile, "utf-8");
      const data: DatabaseSchema = JSON.parse(raw);
      memoryCache = data;
      // Persist to writable location
      try {
        const dir = path.dirname(dbFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
      } catch (err) {}
      return data;
    } catch (e) {}
  }

  // 3. Fallback to initial seed
  const initial = getInitialData();
  memoryCache = initial;
  try {
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(dbFile, JSON.stringify(initial, null, 2), "utf-8");
  } catch (err) {}
  return initial;
}

export function writeDb(data: DatabaseSchema): void {
  memoryCache = data;
  const dbFile = getDbFilePath();
  try {
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Write DB error (falling back to memory):", err);
  }
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

export function getBookedSlotsForDate(date: string): string[] {
  const db = readDb();
  return (db.bookings || [])
    .filter((b) => b.appointmentDate === date && b.status !== "CANCELLED")
    .map((b) => b.timeSlot);
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

// User Account Operations
export function getUserByEmail(email: string): UserAccount | null {
  const db = readDb();
  const e = email.trim().toLowerCase();
  return (db.users || []).find((u) => u.email.toLowerCase() === e) || null;
}

export function getUserById(id: string): UserAccount | null {
  const db = readDb();
  return (db.users || []).find((u) => u.id === id) || null;
}

export function createUser(input: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role?: "patient" | "admin";
  authProvider?: "local" | "google";
  avatar?: string;
}): UserAccount {
  const db = readDb();
  if (!db.users) db.users = [];

  const existing = getUserByEmail(input.email);
  if (existing) {
    // If user already exists, update phone/name if provided
    const idx = db.users.findIndex((u) => u.id === existing.id);
    if (idx >= 0) {
      db.users[idx] = {
        ...db.users[idx],
        name: input.name || db.users[idx].name,
        phone: input.phone || db.users[idx].phone,
        avatar: input.avatar || db.users[idx].avatar,
      };
      writeDb(db);
      return db.users[idx];
    }
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: input.name,
    email: input.email.toLowerCase().trim(),
    phone: input.phone || "",
    passwordHash: input.password ? hashPassword(input.password) : undefined,
    role: input.role || "patient",
    authProvider: input.authProvider || "local",
    avatar: input.avatar || "",
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  writeDb(db);
  return newUser;
}

export function validateUserCredentials(email: string, password: string): UserAccount | null {
  const user = getUserByEmail(email);
  if (!user || !user.passwordHash) return null;
  const hash = hashPassword(password);
  if (user.passwordHash === hash) {
    return user;
  }
  return null;
}

export function findOrCreateGoogleUser(gUser: { name: string; email: string; avatar?: string }): UserAccount {
  const existing = getUserByEmail(gUser.email);
  if (existing) {
    return existing;
  }
  return createUser({
    name: gUser.name,
    email: gUser.email,
    authProvider: "google",
    avatar: gUser.avatar,
    role: gUser.email.toLowerCase() === "amulyamdentalstudio@gmail.com" ? "admin" : "patient",
  });
}

// User-isolated bookings query (Strict Privacy)
export function getBookingsForUser(email: string, phone?: string, userId?: string): Booking[] {
  const db = readDb();
  const e = (email || "").toLowerCase().trim();
  const p = (phone || "").replace(/\D/g, "");

  return (db.bookings || []).filter((b) => {
    if (userId && b.userId === userId) return true;
    if (e && b.patientEmail.toLowerCase().trim() === e) return true;
    if (p && p.length >= 10 && b.patientPhone.replace(/\D/g, "").includes(p)) return true;
    return false;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ----------------------------------------------------
// QUEUE & WAITING ROOM OPERATIONS
// ----------------------------------------------------
export function getAllQueueTokens(): QueueToken[] {
  const db = readDb();
  return db.queue || [];
}

export function createQueueToken(input: Omit<QueueToken, "id" | "tokenNumber" | "checkInTime">): QueueToken {
  const db = readDb();
  if (!db.queue) db.queue = [];
  const tokenNum = `#T-${String(db.queue.length + 1).padStart(2, "0")}`;
  const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const newToken: QueueToken = {
    ...input,
    id: `q-${Date.now()}`,
    tokenNumber: tokenNum,
    checkInTime: nowStr,
  };

  db.queue.push(newToken);
  writeDb(db);
  return newToken;
}

export function updateQueueToken(id: string, updates: Partial<QueueToken>): QueueToken | null {
  const db = readDb();
  if (!db.queue) db.queue = [];
  const idx = db.queue.findIndex((q) => q.id === id);
  if (idx === -1) return null;

  db.queue[idx] = {
    ...db.queue[idx],
    ...updates,
  };

  writeDb(db);
  return db.queue[idx];
}

export function deleteQueueToken(id: string): boolean {
  const db = readDb();
  if (!db.queue) return false;
  const initial = db.queue.length;
  db.queue = db.queue.filter((q) => q.id !== id);
  if (db.queue.length !== initial) {
    writeDb(db);
    return true;
  }
  return false;
}

// ----------------------------------------------------
// DENTAL CHART & ODONTOGRAM OPERATIONS
// ----------------------------------------------------
export function getDentalChart(patientEmailOrId: string): PatientDentalChart | null {
  const db = readDb();
  const clean = patientEmailOrId.toLowerCase().trim();
  return (
    (db.dentalCharts || []).find(
      (c) => c.patientEmail.toLowerCase() === clean || c.patientId === clean
    ) || null
  );
}

export function saveDentalChart(chart: PatientDentalChart): PatientDentalChart {
  const db = readDb();
  if (!db.dentalCharts) db.dentalCharts = [];
  const idx = db.dentalCharts.findIndex(
    (c) => c.patientEmail.toLowerCase() === chart.patientEmail.toLowerCase()
  );

  const updatedChart: PatientDentalChart = {
    ...chart,
    lastUpdated: new Date().toISOString(),
  };

  if (idx >= 0) {
    db.dentalCharts[idx] = updatedChart;
  } else {
    db.dentalCharts.push(updatedChart);
  }

  writeDb(db);
  return updatedChart;
}

// ----------------------------------------------------
// PRESCRIPTION (Rx) OPERATIONS
// ----------------------------------------------------
export function getAllPrescriptions(): Prescription[] {
  const db = readDb();
  return (db.prescriptions || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getPrescriptionById(id: string): Prescription | null {
  const db = readDb();
  return (db.prescriptions || []).find((p) => p.id === id || p.rxNumber === id) || null;
}

export function createPrescription(
  input: Omit<Prescription, "id" | "rxNumber" | "createdAt">
): Prescription {
  const db = readDb();
  if (!db.prescriptions) db.prescriptions = [];
  const rxNum = `ADS-RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newRx: Prescription = {
    ...input,
    id: `rx-${Date.now()}`,
    rxNumber: rxNum,
    createdAt: new Date().toISOString(),
  };

  db.prescriptions.unshift(newRx);
  writeDb(db);
  return newRx;
}

// ----------------------------------------------------
// TREATMENT PLANS OPERATIONS
// ----------------------------------------------------
export function getAllTreatmentPlans(): TreatmentPlan[] {
  const db = readDb();
  return db.treatmentPlans || [];
}

export function createTreatmentPlan(
  input: Omit<TreatmentPlan, "id" | "createdAt">
): TreatmentPlan {
  const db = readDb();
  if (!db.treatmentPlans) db.treatmentPlans = [];

  const newPlan: TreatmentPlan = {
    ...input,
    id: `tp-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  db.treatmentPlans.unshift(newPlan);
  writeDb(db);
  return newPlan;
}

export function updateTreatmentPlan(id: string, updates: Partial<TreatmentPlan>): TreatmentPlan | null {
  const db = readDb();
  if (!db.treatmentPlans) db.treatmentPlans = [];
  const idx = db.treatmentPlans.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  db.treatmentPlans[idx] = {
    ...db.treatmentPlans[idx],
    ...updates,
  };

  writeDb(db);
  return db.treatmentPlans[idx];
}

// ----------------------------------------------------
// BILLING & INVOICE OPERATIONS
// ----------------------------------------------------
export function getAllInvoices(): Invoice[] {
  const db = readDb();
  return (db.invoices || []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getInvoiceById(id: string): Invoice | null {
  const db = readDb();
  return (db.invoices || []).find((i) => i.id === id || i.invoiceNumber === id) || null;
}

export function createInvoice(input: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Invoice {
  const db = readDb();
  if (!db.invoices) db.invoices = [];
  const invNum = `ADS-INV-${new Date().getFullYear()}-${String(db.invoices.length + 1).padStart(4, "0")}`;

  const newInv: Invoice = {
    ...input,
    id: `inv-${Date.now()}`,
    invoiceNumber: invNum,
    createdAt: new Date().toISOString(),
  };

  db.invoices.unshift(newInv);

  // Auto-record into cash register if paid
  if (newInv.amountPaid > 0) {
    if (!db.cashRegister) db.cashRegister = [];
    db.cashRegister.unshift({
      id: `cr-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "INCOME",
      category: "Patient Treatment Billing",
      amount: newInv.amountPaid,
      method: newInv.paymentMethod,
      description: `${newInv.patientName} (${newInv.invoiceNumber})`,
      recordedBy: "Frontdesk / Cashier",
      createdAt: new Date().toISOString(),
    });
  }

  writeDb(db);
  return newInv;
}

// ----------------------------------------------------
// CASH REGISTER & EOD RECONCILIATION
// ----------------------------------------------------
export function getAllCashRegisterEntries(date?: string): CashRegisterEntry[] {
  const db = readDb();
  const entries = db.cashRegister || [];
  if (date) {
    return entries.filter((e) => e.date === date);
  }
  return entries;
}

export function createCashRegisterEntry(
  input: Omit<CashRegisterEntry, "id" | "createdAt">
): CashRegisterEntry {
  const db = readDb();
  if (!db.cashRegister) db.cashRegister = [];

  const newEntry: CashRegisterEntry = {
    ...input,
    id: `cr-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  db.cashRegister.unshift(newEntry);
  writeDb(db);
  return newEntry;
}

// ----------------------------------------------------
// PATIENT CRM & DIRECTORY OPERATIONS
// ----------------------------------------------------
export function getAllPatients(): UserAccount[] {
  const db = readDb();
  return (db.users || []).filter((u) => u.role === "patient");
}

export function getPatientById(idOrEmail: string): UserAccount | null {
  const db = readDb();
  return (
    (db.users || []).find(
      (u) => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
    ) || null
  );
}

export function createPatient(
  input: Omit<UserAccount, "id" | "role" | "createdAt"> & { role?: "patient" | "admin" }
): UserAccount {
  const db = readDb();
  if (!db.users) db.users = [];

  const newPatient: UserAccount = {
    ...input,
    id: `pat-${Date.now()}`,
    role: input.role || "patient",
    authProvider: input.authProvider || "local",
    createdAt: new Date().toISOString(),
  };

  db.users.unshift(newPatient);
  writeDb(db);
  return newPatient;
}

export function updatePatient(
  idOrEmail: string,
  updates: Partial<UserAccount>
): UserAccount | null {
  const db = readDb();
  const idx = (db.users || []).findIndex(
    (u) => u.id === idOrEmail || u.email.toLowerCase() === idOrEmail.toLowerCase()
  );
  if (idx === -1) return null;

  db.users[idx] = {
    ...db.users[idx],
    ...updates,
  };

  writeDb(db);
  return db.users[idx];
}




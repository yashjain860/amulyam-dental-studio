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
  SmileTransformation,
  RadiographRecord,
  ConsentForm,
  DentalLabOrder,
  LabOrderStatus,
  InventoryItem,
  SterilizationLog,
  MembershipPlan,
  PostOpProtocol,
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
  smileCases?: SmileTransformation[];
  radiographs?: RadiographRecord[];
  consentForms?: ConsentForm[];
  labOrders?: DentalLabOrder[];
  inventory?: InventoryItem[];
  sterilizationLogs?: SterilizationLog[];
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

export function getAllPatients(): UserAccount[] {
  const db = readDb();
  const existingPatients = (db.users || []).filter((u) => u.role === "patient");
  const seenKeys = new Set(
    existingPatients.map((p) => `${(p.name || "").trim().toLowerCase()}_${(p.phone || "").replace(/\D/g, "")}`)
  );

  const syntheticFromBookings: UserAccount[] = [];

  for (const b of db.bookings || []) {
    const key = `${(b.patientName || "").trim().toLowerCase()}_${(b.patientPhone || "").replace(/\D/g, "")}`;
    if (b.patientName && !seenKeys.has(key)) {
      seenKeys.add(key);

      syntheticFromBookings.push({
        id: `pat-b-${b.id}`,
        name: b.patientName,
        email: b.patientEmail || `${b.patientName.toLowerCase().replace(/\s+/g, ".")}@patient.local`,
        phone: b.patientPhone,
        role: "patient",
        authProvider: "local",
        age: b.age || 32,
        gender: b.gender || "Male",
        bloodGroup: "O+",
        medicalHistory: "Routine dental evaluation",
        allergies: "None",
        source: "WEBSITE",
        notes: `Booked for ${b.serviceName}`,
        createdAt: b.createdAt,
      });
    }
  }

  return [...existingPatients, ...syntheticFromBookings];
}

export function getPatientById(idOrEmail: string): UserAccount | null {
  const all = getAllPatients();
  return (
    all.find(
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

// ----------------------------------------------------
// 1. BEFORE & AFTER SMILE MAKEOVER STUDIO
// ----------------------------------------------------
const SEED_SMILE_CASES: SmileTransformation[] = [
  {
    id: "smile-01",
    title: "Upper Arch E-Max Veneers Makeover",
    category: "Cosmetic Veneers",
    patientInitials: "R.S.",
    patientAge: 28,
    beforeImage: "https://amulyam.thewebvale.com/images/s10.jpg",
    afterImage: "https://amulyam.thewebvale.com/images/s14.jpg",
    doctorNotes: "Corrected fluorosis discoloration & midline diastema with 6 minimal-prep E-max lithium disilicate veneers (Shade BL2).",
    treatmentDuration: "2 Visits (5 Days)",
    consentGranted: true,
    featured: true,
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "smile-02",
    title: "Single-Visit Laser Teeth Whitening",
    category: "Teeth Whitening",
    patientInitials: "A.K.",
    patientAge: 34,
    beforeImage: "https://amulyam.thewebvale.com/images/s11.jpg",
    afterImage: "https://amulyam.thewebvale.com/images/s12.jpg",
    doctorNotes: "Hydrogen peroxide 37.5% light-activated in-office bleaching. Improved from Shade A3.5 to A1 in 45 minutes.",
    treatmentDuration: "1 Visit (45 Mins)",
    consentGranted: true,
    featured: true,
    createdAt: "2026-08-10T11:30:00Z",
  },
  {
    id: "smile-03",
    title: "Clear Aligner Crowding Correction",
    category: "Clear Aligners",
    patientInitials: "P.T.",
    patientAge: 24,
    beforeImage: "https://amulyam.thewebvale.com/images/s13.jpg",
    afterImage: "https://amulyam.thewebvale.com/images/s14.jpg",
    doctorNotes: "Resolved anterior crowding with 14 transparent aligner trays over 7 months without wire braces.",
    treatmentDuration: "7 Months",
    consentGranted: true,
    featured: true,
    createdAt: "2026-07-15T09:00:00Z",
  },
];

export function getSmileTransformations(): SmileTransformation[] {
  const db = readDb();
  if (!db.smileCases || db.smileCases.length === 0) {
    db.smileCases = SEED_SMILE_CASES;
    writeDb(db);
  }
  return db.smileCases;
}

export function addSmileTransformation(item: Omit<SmileTransformation, "id" | "createdAt">): SmileTransformation {
  const db = readDb();
  if (!db.smileCases) db.smileCases = [...SEED_SMILE_CASES];
  const newCase: SmileTransformation = {
    ...item,
    id: `smile-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.smileCases.unshift(newCase);
  writeDb(db);
  return newCase;
}

// ----------------------------------------------------
// 2. RVG & OPG DIGITAL RADIOGRAPH VAULT
// ----------------------------------------------------
const SEED_RADIOGRAPHS: RadiographRecord[] = [
  {
    id: "rad-01",
    patientId: "pat-b-book-101",
    patientName: "Aarav Sharma",
    type: "IOPA",
    toothNumber: 16,
    imageUrl: "https://amulyam.thewebvale.com/images/clinic_3.png",
    takenDate: "2026-08-19",
    workingLengthMm: 21.5,
    findings: "Deep occlusal caries approaching pulp chamber on #16. Periapical radiolucency on mesial root apex.",
    doctorNotes: "Working length confirmed: MB: 21.5mm, DB: 21.0mm, Palatal: 22.0mm. Biomechanical prep initiated.",
    contrast: 100,
    brightness: 100,
    inverted: false,
    createdAt: "2026-08-19T10:00:00Z",
  },
  {
    id: "rad-02",
    patientId: "pat-b-book-103",
    patientName: "Rajesh Mehra",
    type: "OPG",
    imageUrl: "https://amulyam.thewebvale.com/images/clinic_1.png",
    takenDate: "2026-08-18",
    findings: "Generalized horizontal bone loss. Edentulous span #36, #37 with adequate ridge height (14mm) for implant fixture.",
    doctorNotes: "Implant plan approved for 4.2 x 11.5mm Osstem fixture on #36.",
    createdAt: "2026-08-18T14:20:00Z",
  },
];

export function getRadiographs(patientNameOrId?: string): RadiographRecord[] {
  const db = readDb();
  if (!db.radiographs || db.radiographs.length === 0) {
    db.radiographs = SEED_RADIOGRAPHS;
    writeDb(db);
  }
  if (!patientNameOrId) return db.radiographs;
  return db.radiographs.filter(
    (r) =>
      r.patientId === patientNameOrId ||
      r.patientName.toLowerCase().includes(patientNameOrId.toLowerCase())
  );
}

export function saveRadiograph(input: Omit<RadiographRecord, "id" | "createdAt">): RadiographRecord {
  const db = readDb();
  if (!db.radiographs) db.radiographs = [...SEED_RADIOGRAPHS];
  const newRad: RadiographRecord = {
    ...input,
    id: `rad-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.radiographs.unshift(newRad);
  writeDb(db);
  return newRad;
}

// ----------------------------------------------------
// 3. MEDICO-LEGAL DIGITAL CONSENT FORMS
// ----------------------------------------------------
const SEED_CONSENT_TEMPLATES = [
  {
    type: "RCT",
    title: "Root Canal Treatment (RCT) & Crown Consent",
    en: "I hereby authorize Dr. Shreya Nidhi to perform Endodontic Root Canal Therapy on the specified tooth. I understand that the goal is to relieve pain and preserve the natural tooth. Possible complications including post-op tenderness, instrument separation, or need for surgical apicoectomy have been explained to me.",
    hi: "मैं डॉ. श्रेया निधि को अपने दांत का रूट कैनाल ट्रीटमेंट करने की अनुमति देता/देती हूँ। मुझे उपचार के सभी चरण एवं संभावित जटिलताओं के बारे में समझा दिया गया है।",
    risks: [
      "Post-operative mild pain or soreness for 2-3 days",
      "Need for full-coverage crown restoration after completion",
      "Rare anatomical canal calcification or accessory canal challenges"
    ]
  },
  {
    type: "IMPLANT_SURGERY",
    title: "Dental Implant Placement & Bone Augmentation Consent",
    en: "I consent to the surgical placement of titanium dental implant fixture(s). I understand osseointegration takes 3-4 months and have disclosed all medical conditions including diabetes, osteoporosis, and blood-thinning medications.",
    hi: "मैं अपने जबड़े में डेंटल इम्प्लांट सर्जरी की अनुमति देता/देती हूँ। मैंने अपनी सभी मेडिकल हिस्ट्री जैसे शुगर, बीपी आदि की पूरी जानकारी दी है।",
    risks: [
      "Surgical swelling and minor bruising for 48-72 hours",
      "Need for strict oral hygiene maintenance and follow-up visits",
      "Rare risk of implant failure to integrate requiring fixture replacement"
    ]
  },
  {
    type: "EXTRACTION",
    title: "Tooth Extraction & Minor Oral Surgery Consent",
    en: "I authorize the extraction of the indicated tooth under local anesthesia. I agree to follow all post-operative instructions including biting on the gauze pack and avoiding spitting or hot food for 24 hours.",
    hi: "मैं स्थानीय एनेस्थीसिया के तहत दांत निकालने की अनुमति देता/देती हूँ। मैं सभी सावधानियों जैसे 24 घंटे थूकना नहीं और गर्म भोजन से परहेज का पालन करूँगा/करूँगी।",
    risks: [
      "Bleeding, mild swelling, and temporary jaw stiffness",
      "Dry socket (alveolar osteitis) if post-op precautions are violated",
      "Adjacent tooth sensitivity or temporary nerve tingling"
    ]
  }
];

export function getConsentTemplates() {
  return SEED_CONSENT_TEMPLATES;
}

export function getConsentForms(patientNameOrId?: string): ConsentForm[] {
  const db = readDb();
  if (!db.consentForms) db.consentForms = [];
  if (!patientNameOrId) return db.consentForms;
  return db.consentForms.filter(
    (c) =>
      c.patientId === patientNameOrId ||
      c.patientName.toLowerCase().includes(patientNameOrId.toLowerCase())
  );
}

export function createConsentForm(input: Omit<ConsentForm, "id" | "createdAt">): ConsentForm {
  const db = readDb();
  if (!db.consentForms) db.consentForms = [];
  const newConsent: ConsentForm = {
    ...input,
    id: `consent-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  db.consentForms.unshift(newConsent);
  writeDb(db);
  return newConsent;
}

// ----------------------------------------------------
// 4. DENTAL LAB & PROSTHETICS TRACKER
// ----------------------------------------------------
const SEED_LAB_ORDERS: DentalLabOrder[] = [
  {
    id: "lab-01",
    orderNumber: "LAB-2026-081",
    patientName: "Aarav Sharma",
    toothNumbers: [16],
    prostheticType: "Monolithic Zirconia Crown",
    shade: "A2",
    labPartner: "DentCare Dental Lab",
    status: "IN_FABRICATION",
    impressionDate: "2026-08-19",
    sentDate: "2026-08-19",
    expectedDate: "2026-08-23",
    scheduledSeatingDate: "2026-08-24",
    costToClinic: 1200,
    patientCharge: 6000,
    notes: "High translucency required for upper molar #16. 10-year warranty certificate.",
    createdAt: "2026-08-19T11:00:00Z",
  },
  {
    id: "lab-02",
    orderNumber: "LAB-2026-082",
    patientName: "Rajesh Mehra",
    toothNumbers: [36],
    prostheticType: "Multi-Layered Katana Zirconia",
    shade: "A3",
    labPartner: "Katana Zirconia Studio",
    status: "TRIAL_RECEIVED",
    impressionDate: "2026-08-15",
    sentDate: "2026-08-15",
    expectedDate: "2026-08-20",
    receivedDate: "2026-08-20",
    scheduledSeatingDate: "2026-08-21",
    costToClinic: 1800,
    patientCharge: 9500,
    notes: "Screw-retained implant crown for Osstem fixture.",
    createdAt: "2026-08-15T15:00:00Z",
  },
  {
    id: "lab-03",
    orderNumber: "LAB-2026-083",
    patientName: "Pooja Trivedi",
    toothNumbers: [11, 12, 21, 22],
    prostheticType: "E-Max Lithium Disilicate Veneer",
    shade: "BL1",
    labPartner: "DentCare Dental Lab",
    status: "READY_FOR_CEMENTATION",
    impressionDate: "2026-08-14",
    sentDate: "2026-08-14",
    expectedDate: "2026-08-19",
    receivedDate: "2026-08-19",
    scheduledSeatingDate: "2026-08-20",
    costToClinic: 4800,
    patientCharge: 24000,
    notes: "Bleach shade aesthetic veneers. Etched & silanated ready for Variolink cementation.",
    createdAt: "2026-08-14T09:30:00Z",
  },
];

export function getDentalLabOrders(): DentalLabOrder[] {
  const db = readDb();
  if (!db.labOrders || db.labOrders.length === 0) {
    db.labOrders = SEED_LAB_ORDERS;
    writeDb(db);
  }
  return db.labOrders;
}

export function createDentalLabOrder(input: Omit<DentalLabOrder, "id" | "orderNumber" | "createdAt">): DentalLabOrder {
  const db = readDb();
  if (!db.labOrders) db.labOrders = [...SEED_LAB_ORDERS];
  const newOrder: DentalLabOrder = {
    ...input,
    id: `lab-${Date.now()}`,
    orderNumber: `LAB-2026-${String(db.labOrders.length + 80).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  db.labOrders.unshift(newOrder);
  writeDb(db);
  return newOrder;
}

export function updateDentalLabOrderStatus(id: string, status: LabOrderStatus): DentalLabOrder | null {
  const db = readDb();
  if (!db.labOrders) return null;
  const idx = db.labOrders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.labOrders[idx].status = status;
  if (status === "TRIAL_RECEIVED" || status === "READY_FOR_CEMENTATION") {
    db.labOrders[idx].receivedDate = new Date().toISOString().split("T")[0];
  }
  writeDb(db);
  return db.labOrders[idx];
}

// ----------------------------------------------------
// 5. INVENTORY & AUTOCLAVE STERILIZATION LOGS
// ----------------------------------------------------
const SEED_INVENTORY: InventoryItem[] = [
  {
    id: "inv-01",
    name: "3M Filtek Z250 Universal Composite (Shade A2)",
    category: "Resin Composite",
    currentStock: 4,
    unit: "tubes",
    minThreshold: 2,
    batchNumber: "3M-9824B",
    expiryDate: "2027-11",
    supplierName: "Metro Dental Supply Bhopal",
    unitCost: 1450,
    location: "Operatory 1 Cabinet",
  },
  {
    id: "inv-02",
    name: "Lignox 2% with Adrenaline 1:80,000 Local Anesthesia",
    category: "Local Anesthesia",
    currentStock: 45,
    unit: "cartridges",
    minThreshold: 20,
    batchNumber: "LX-55102",
    expiryDate: "2027-08",
    supplierName: "Indore Pharma Depot",
    unitCost: 28,
    location: "Dark Room Storage",
  },
  {
    id: "inv-03",
    name: "Dentsply ProTaper Gold Rotary Files (SX-F3)",
    category: "Endodontics",
    currentStock: 6,
    unit: "packs",
    minThreshold: 3,
    batchNumber: "PTG-8812",
    expiryDate: "2028-04",
    supplierName: "Dentsply Sirona India",
    unitCost: 1800,
    location: "Operatory 1 Cabinet",
  },
  {
    id: "inv-04",
    name: "Opalescence Boost 40% In-Office Whitening Kit",
    category: "Bleaching & Cosmetic",
    currentStock: 2,
    unit: "kits",
    minThreshold: 2,
    batchNumber: "OPB-1120",
    expiryDate: "2026-12",
    supplierName: "Ultradent India",
    unitCost: 3200,
    location: "Dark Room Storage",
  },
];

const SEED_STERILIZATION_LOGS: SterilizationLog[] = [
  {
    id: "ster-01",
    cycleNumber: "CYCLE-2026-08-20-A",
    autoclaveUnit: "B-Class Autoclave (Main)",
    temperatureCelsius: 134,
    pressurePsi: 30,
    holdingTimeMinutes: 15,
    biologicalIndicator: "PASS (Negative)",
    chemicalIndicator: "PASS",
    pouchesSterilized: 18,
    technicianName: "Reception / Staff Anjali",
    date: "2026-08-20",
    time: "08:30 AM",
    status: "CERTIFIED_STERILE",
  },
  {
    id: "ster-02",
    cycleNumber: "CYCLE-2026-08-19-B",
    autoclaveUnit: "B-Class Autoclave (Main)",
    temperatureCelsius: 134,
    pressurePsi: 30,
    holdingTimeMinutes: 15,
    biologicalIndicator: "PASS (Negative)",
    chemicalIndicator: "PASS",
    pouchesSterilized: 22,
    technicianName: "Reception / Staff Anjali",
    date: "2026-08-19",
    time: "02:15 PM",
    status: "CERTIFIED_STERILE",
  },
];

export function getInventoryItems(): InventoryItem[] {
  const db = readDb();
  if (!db.inventory || db.inventory.length === 0) {
    db.inventory = SEED_INVENTORY;
    writeDb(db);
  }
  return db.inventory;
}

export function updateInventoryStock(id: string, delta: number): InventoryItem | null {
  const db = readDb();
  if (!db.inventory) return null;
  const idx = db.inventory.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  db.inventory[idx].currentStock = Math.max(0, db.inventory[idx].currentStock + delta);
  writeDb(db);
  return db.inventory[idx];
}

export function getSterilizationLogs(): SterilizationLog[] {
  const db = readDb();
  if (!db.sterilizationLogs || db.sterilizationLogs.length === 0) {
    db.sterilizationLogs = SEED_STERILIZATION_LOGS;
    writeDb(db);
  }
  return db.sterilizationLogs;
}

export function logSterilizationCycle(input: Omit<SterilizationLog, "id">): SterilizationLog {
  const db = readDb();
  if (!db.sterilizationLogs) db.sterilizationLogs = [...SEED_STERILIZATION_LOGS];
  const newLog: SterilizationLog = {
    ...input,
    id: `ster-${Date.now()}`,
  };
  db.sterilizationLogs.unshift(newLog);
  writeDb(db);
  return newLog;
}

// ----------------------------------------------------
// 6. MEMBERSHIP PLANS & POST-OP PROTOCOLS
// ----------------------------------------------------
const SEED_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "mem-silver",
    name: "Amulyam Silver Care",
    annualFee: 1499,
    freeCleaningsPerYear: 1,
    discountPercentTreatments: 10,
    unlimitedFreeConsultations: true,
    freeXraysIncluded: 2,
    maxFamilyMembers: 1,
    validityDays: 365,
  },
  {
    id: "mem-gold",
    name: "Amulyam Gold Smile Plan",
    annualFee: 2999,
    freeCleaningsPerYear: 2,
    discountPercentTreatments: 15,
    unlimitedFreeConsultations: true,
    freeXraysIncluded: 4,
    maxFamilyMembers: 2,
    validityDays: 365,
  },
  {
    id: "mem-platinum",
    name: "Amulyam Platinum Family Club",
    annualFee: 4999,
    freeCleaningsPerYear: 4,
    discountPercentTreatments: 20,
    unlimitedFreeConsultations: true,
    freeXraysIncluded: 8,
    maxFamilyMembers: 4,
    validityDays: 365,
  },
];

const SEED_POST_OP_PROTOCOLS: PostOpProtocol[] = [
  {
    id: "post-rct",
    treatmentName: "Root Canal Treatment",
    immediateInstructions: [
      "Avoid chewing hard or sticky foods on the treated side until the permanent crown is placed.",
      "Mild tenderness on chewing is normal for 2-3 days as tissues heal around the root apex.",
      "Continue prescribed antibiotics and analgesics as directed by Dr. Shreya Nidhi."
    ],
    dietaryRestrictions: [
      "Soft foods like khichdi, curd rice, daliya for 24 hours.",
      "Avoid extremely hot tea/coffee while local anesthesia numbness persists."
    ],
    medicationGuide: "Take Tab. Ketorolac / Zerodol-SP after meals if experiencing soreness.",
    emergencySymptoms: [
      "Severe throbbing pain not relieved by medication",
      "Visible swelling in gums or outer facial cheek"
    ],
    whatsappTemplate: "Namaste {patientName}, Dr. Shreya Nidhi from Amulyam Dental Studio checking in after your Root Canal today. Please take your prescribed medicine after food and avoid chewing on that side. Feel free to message us here if you have any questions!"
  },
  {
    id: "post-ext",
    treatmentName: "Tooth Extraction",
    immediateInstructions: [
      "Keep the sterile cotton gauze firmly pressed between your teeth for 45 minutes.",
      "DO NOT spit, suck through a straw, or smoke for 24 hours (preserves the healing blood clot).",
      "Apply an external ice pack on your cheek (10 mins on / 10 mins off) to minimize swelling."
    ],
    dietaryRestrictions: [
      "Cold, soft foods only (Ice cream, cold milk, yogurt, smoothie) on the first day.",
      "No spicy, crunchy, or hot foods for 48 hours."
    ],
    medicationGuide: "Start painkiller before the numbness wears off completely.",
    emergencySymptoms: [
      "Continuous active bright red bleeding soaking multiple gauze packs",
      "High fever or persistent throbbing pain after day 3"
    ],
    whatsappTemplate: "Namaste {patientName}, follow-up from Amulyam Dental Studio. Remember: Do not spit or rinse today. Cold ice cream is recommended! Rest well and reach out if you need anything."
  },
  {
    id: "post-implant",
    treatmentName: "Dental Implant Surgery",
    immediateInstructions: [
      "Do not disturb the surgical site with your tongue or fingers.",
      "Gentle warm saline rinses starting from tomorrow morning (after 24 hours).",
      "Use the prescribed Chlorhexidine mouthwash twice daily without vigorous swishing."
    ],
    dietaryRestrictions: [
      "Nutritious soft diet for 7 days avoiding direct pressure on implant area."
    ],
    medicationGuide: "Complete the full 5-day course of Amoxicillin-Clavulanate 625mg.",
    emergencySymptoms: [
      "Excessive swelling beyond 72 hours",
      "Loosening of the healing abutment screw"
    ],
    whatsappTemplate: "Namaste {patientName}, Dr. Shreya Nidhi here. Your implant fixture was placed with high primary stability today. Please take your antibiotics on time and use warm salt water from tomorrow. Speedy recovery!"
  }
];

export function getMembershipPlans(): MembershipPlan[] {
  return SEED_MEMBERSHIP_PLANS;
}

export function getPostOpProtocols(): PostOpProtocol[] {
  return SEED_POST_OP_PROTOCOLS;
}





export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  role: "patient" | "admin";
  authProvider: "local" | "google";
  avatar?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  medicalHistory?: string;
  allergies?: string;
  address?: string;
  emergencyContact?: string;
  source?: "WEBSITE" | "WALK_IN" | "PHONE" | "REFERRAL";
  notes?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId?: string;
  refNumber: string; // e.g. ADS-2026-8941
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  age?: number;
  gender?: string;
  serviceId: string;
  serviceName: string;
  category: string;
  preferredDoctor: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "11:00 AM"
  notes?: string;
  status: BookingStatus;
  doctorNotes?: string;
  prescription?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}


export interface Service {
  id: string;
  title: string;
  category:
    | "Endodontics"
    | "Implantology"
    | "Preventive"
    | "Cosmetic"
    | "Surgery"
    | "Prosthodontics"
    | "Orthodontics"
    | "Diagnostic"
    | "Restorative"
    | "General";
  tagline: string;
  description: string;
  longDescription?: string;
  duration: string;
  priceEstimate?: string;
  isPopular?: boolean;
  image?: string;
  benefits: string[];
  faqs?: { question: string; answer: string }[];
}

export interface Doctor {
  name: string;
  role: string;
  qualifications: string;
  experience: string;
  specialization: string;
  bio: string;
  image: string;
  achievements: string[];
}

export interface ContactInquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  serviceOfInterest?: string;
  subject?: string;
  message: string;
  status: "NEW" | "READ" | "RESPONDED";
  createdAt: string;
}

export interface ClinicSlotOverride {
  date: string; // YYYY-MM-DD
  isClosedFullDay?: boolean;
  blockedSlots?: string[]; // array of slot strings like ["10:00 AM", "02:00 PM"]
  reason?: string;
}

export interface ClinicStats {
  totalBookings: number;
  todayBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalInquiries: number;
  totalInvoiced?: number;
  totalCollected?: number;
  activeQueueCount?: number;
}

// ----------------------------------------------------
// CLINICAL DENTAL CHARTING & ODONTOGRAM
// ----------------------------------------------------
export type ToothCondition =
  | "SOUND"
  | "CARIES"
  | "RESTORED"
  | "RCT_NEEDED"
  | "RCT_DONE"
  | "CROWN"
  | "IMPLANT"
  | "MISSING"
  | "FRACTURED"
  | "BLEEDING";

export interface ToothSurfaceState {
  mesial?: boolean;
  distal?: boolean;
  occlusal?: boolean;
  buccal?: boolean;
  lingual?: boolean;
}

export interface ToothRecord {
  toothNumber: number; // 11-18, 21-28, 31-38, 41-48
  condition: ToothCondition;
  surfaces?: ToothSurfaceState;
  notes?: string;
  updatedAt: string;
}

export interface PatientDentalChart {
  patientId: string;
  patientEmail: string;
  patientName: string;
  teeth: Record<number, ToothRecord>;
  lastUpdated: string;
}

// ----------------------------------------------------
// E-PRESCRIPTION (Rx)
// ----------------------------------------------------
export interface RxMedicine {
  name: string;
  dosage: string; // e.g. "625 mg"
  frequency: string; // e.g. "1-0-1", "1-1-1", "SOS", "STAT"
  timing: string; // e.g. "After Food", "Before Food", "With Food"
  duration: string; // e.g. "5 Days"
  instructions?: string;
}

export interface Prescription {
  id: string;
  rxNumber: string; // ADS-RX-2026-XXXX
  bookingId?: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone: string;
  patientEmail: string;
  diagnosis: string;
  chiefComplaint: string;
  medicines: RxMedicine[];
  specialAdvice?: string;
  doctorName: string;
  doctorRegistration: string;
  createdAt: string;
}

// ----------------------------------------------------
// TREATMENT PLANNING
// ----------------------------------------------------
export interface TreatmentPlanStep {
  id: string;
  title: string;
  description: string;
  estimatedCost: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: string;
}

export interface TreatmentPlan {
  id: string;
  bookingId?: string;
  patientName: string;
  patientEmail: string;
  title: string;
  steps: TreatmentPlanStep[];
  totalEstimatedCost: number;
  totalPaid: number;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  createdAt: string;
}

// ----------------------------------------------------
// FRONTDESK QUEUE & LIVE WAITING ROOM
// ----------------------------------------------------
export type QueueStatus =
  | "WAITING"
  | "IN_CHAIR"
  | "BILLING"
  | "COMPLETED"
  | "NO_SHOW";

export interface QueueToken {
  id: string;
  tokenNumber: string; // e.g. "#T-01"
  bookingId?: string;
  patientName: string;
  patientPhone: string;
  serviceName: string;
  status: QueueStatus;
  checkInTime: string;
  chairAssigned?: "Chair 1 (Main Operatory)" | "Chair 2 (Hygiene & Scaling)";
  calledAt?: string;
  completedAt?: string;
  notes?: string;
}

// ----------------------------------------------------
// BILLING, POS & GST INVOICING
// ----------------------------------------------------
export interface InvoiceLineItem {
  id: string;
  description: string;
  category: string;
  unitPrice: number;
  quantity: number;
  discountPercent?: number;
  taxableAmount: number;
}

export type PaymentMethod = "CASH" | "UPI_QR" | "CARD" | "NET_BANKING" | "INSURANCE";

export interface Invoice {
  id: string;
  invoiceNumber: string; // ADS-INV-2026-XXXX
  bookingId?: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  items: InvoiceLineItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "PAID" | "PARTIAL" | "PENDING";
  receiptUrl?: string;
  createdAt: string;
}

// ----------------------------------------------------
// EOD CASH REGISTER & RECONCILIATION
// ----------------------------------------------------
export interface CashRegisterEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  method: PaymentMethod;
  description: string;
  recordedBy: string;
  createdAt: string;
}

// ----------------------------------------------------
// BEFORE & AFTER SMILE MAKEOVER STUDIO
// ----------------------------------------------------
export interface SmileTransformation {
  id: string;
  title: string;
  category: "Cosmetic Veneers" | "Teeth Whitening" | "Clear Aligners" | "Dental Implants" | "Diastema Closure" | "Full Mouth Rehab";
  patientInitials: string;
  patientAge?: number;
  beforeImage: string;
  afterImage: string;
  doctorNotes: string;
  treatmentDuration: string; // e.g. "2 Visits" or "6 Months"
  consentGranted: boolean;
  featured: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// RVG & OPG DIGITAL RADIOGRAPH VAULT
// ----------------------------------------------------
export interface RadiographRecord {
  id: string;
  patientId: string;
  patientName: string;
  type: "IOPA" | "OPG" | "BITEWING" | "CBCT" | "INTRAORAL_PHOTO";
  toothNumber?: number; // FDI 11-48
  imageUrl: string;
  takenDate: string;
  workingLengthMm?: number;
  findings: string;
  doctorNotes: string;
  contrast?: number;
  brightness?: number;
  inverted?: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// MEDICO-LEGAL DIGITAL CONSENT FORMS
// ----------------------------------------------------
export interface ConsentForm {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  treatmentType: "RCT" | "IMPLANT_SURGERY" | "EXTRACTION" | "ORTHODONTICS" | "BLEACHING" | "GENERAL_ANESTHESIA";
  language: "EN" | "HI";
  formContent: string;
  riskFactorsAcknowledged: string[];
  patientSignatureDataUrl: string; // Base64 signature
  patientSignedAt: string;
  doctorName: string;
  doctorRegistration: string;
  witnessName?: string;
  status: "SIGNED" | "DRAFT" | "REVOKED";
  createdAt: string;
}

// ----------------------------------------------------
// DENTAL LAB & PROSTHETICS TRACKER
// ----------------------------------------------------
export type LabOrderStatus =
  | "IMPRESSION_TAKEN"
  | "SENT_TO_LAB"
  | "IN_FABRICATION"
  | "TRIAL_RECEIVED"
  | "READY_FOR_CEMENTATION"
  | "COMPLETED"
  | "REMAKE_REQUESTED";

export interface DentalLabOrder {
  id: string;
  orderNumber: string; // e.g. "LAB-2026-081"
  patientId?: string;
  patientName: string;
  toothNumbers: number[]; // e.g. [16, 17]
  prostheticType:
    | "Monolithic Zirconia Crown"
    | "Multi-Layered Katana Zirconia"
    | "E-Max Lithium Disilicate Veneer"
    | "PFM (Porcelain Fused to Metal)"
    | "Clear Aligner Tray"
    | "Custom Night Guard / Splint"
    | "Complete Denture (BPS)"
    | "Cast Partial Denture";
  shade: string; // e.g. "A2", "A3", "BL1"
  labPartner: "DentCare Dental Lab" | "Katana Zirconia Studio" | "C-Dent Bhopal" | "In-House Lab";
  status: LabOrderStatus;
  impressionDate: string;
  sentDate?: string;
  expectedDate: string;
  receivedDate?: string;
  scheduledSeatingDate?: string;
  costToClinic: number;
  patientCharge: number;
  notes?: string;
  createdAt: string;
}

// ----------------------------------------------------
// DENTAL INVENTORY, CONSUMABLES & STERILIZATION LOGS
// ----------------------------------------------------
export interface InventoryItem {
  id: string;
  name: string;
  category: "Resin Composite" | "Local Anesthesia" | "Endodontics" | "Impression Material" | "Implants" | "Hygiene & PPE" | "Bleaching & Cosmetic";
  currentStock: number;
  unit: "tubes" | "cartridges" | "boxes" | "packs" | "bottles" | "kits";
  minThreshold: number;
  batchNumber: string;
  expiryDate: string; // YYYY-MM
  supplierName: string;
  unitCost: number;
  location: "Operatory 1 Cabinet" | "Hygiene Bay" | "Dark Room Storage" | "Sterilization Counter";
}

export interface SterilizationLog {
  id: string;
  cycleNumber: string; // e.g. "CYCLE-2026-08-20-A"
  autoclaveUnit: "B-Class Autoclave (Main)" | "Flash Autoclave 2";
  temperatureCelsius: number; // e.g. 134
  pressurePsi: number; // e.g. 30
  holdingTimeMinutes: number; // e.g. 15
  biologicalIndicator: "PASS (Negative)" | "FAIL (Positive)";
  chemicalIndicator: "PASS" | "FAIL";
  pouchesSterilized: number;
  technicianName: string;
  date: string;
  time: string;
  status: "CERTIFIED_STERILE" | "RE_RUN_REQUIRED";
}

// ----------------------------------------------------
// PATIENT DENTAL MEMBERSHIP & RECALL PROTOCOLS
// ----------------------------------------------------
export interface MembershipPlan {
  id: string;
  name: "Amulyam Silver Care" | "Amulyam Gold Smile Plan" | "Amulyam Platinum Family Club";
  annualFee: number;
  freeCleaningsPerYear: number;
  discountPercentTreatments: number;
  unlimitedFreeConsultations: boolean;
  freeXraysIncluded: number;
  maxFamilyMembers: number;
  validityDays: number;
}

export interface PostOpProtocol {
  id: string;
  treatmentName: "Root Canal Treatment" | "Tooth Extraction" | "Dental Implant Surgery" | "Teeth Whitening" | "Scaling & Deep Cleaning";
  immediateInstructions: string[];
  dietaryRestrictions: string[];
  medicationGuide: string;
  emergencySymptoms: string[];
  whatsappTemplate: string;
}



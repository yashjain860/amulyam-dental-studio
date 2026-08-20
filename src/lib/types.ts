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
}

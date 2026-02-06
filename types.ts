export interface ServiceOption {
  id: string;
  title: string;
  subtitle?: string;
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'full' | 'closed';
  slots: AvailabilitySlot[];
}

export interface PatientData {
  firstName: string;
  lastName: string;
  documentType: 'NIF' | 'NIE';
  documentNumber: string;
  phone: string;
  email: string;
  address: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string; // DNI/NIE
  phone: string;
  email: string;
  address: string;
}

export interface BookingState {
  company: string | null; // Represents Mutua
  specialty: string | null;
  reason: string | null; // Represents "Cita Para"
  selectedDate: string | null;
  selectedTime: string | null;
  patientData: PatientData;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  company: string;
  specialty: string;
  service?: string;
  date: string; // YYYY-MM-DD
  time: string;
  phone: string;
  email: string;
  address?: string;
  status: 'confirmed' | 'checked-in' | 'cancelled';
  source: 'Web' | 'Phone' | 'WhatsApp' | 'Presencial';
}
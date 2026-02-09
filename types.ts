export interface DbMutua {
  id_mutua: number;
  nombre: string;
}

export interface DbEspecialidad {
  id_especialidad: number;
  nombre: string;
}

export interface DbServicio {
  id_servicio: number;
  nombre: string;
  importe: number;
  duracion: number;
  id_especialidad: number;
  id_mutua: number | null;
}

export interface DbCliente {
  dni: string;
  nombre: string;
  apellidos: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  created_at?: string;
}

export interface DbCita {
  id: string; // UUID
  codigo_cita?: string; // Custom ID: CLF-DDMMYYHHMM
  fecha: string; // YYYY-MM-DD
  hora: string; // HH:MM:SS
  cliente_dni: string;
  id_servicio: number;
  id_metodo: number;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  estado: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  activo: boolean;
  motivo_eliminacion?: string;
  eliminado_por?: string | null;
  fecha_eliminacion?: string;
}

export interface User {
  id_usuario: string;
  username: string;
  nombre_completo: string;
  role: string;
}

// Frontend mapped types (keeping some for compatibility but updated sources)
export interface ServiceOption {
  id: string | number;
  title: string;
  subtitle?: string;
  duration?: number;
  price?: number;
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

export interface BookingState {
  company: number | null; // id_mutua
  specialty: number | null; // id_especialidad
  reason: number | null; // id_servicio
  selectedDate: string | null;
  selectedTime: string | null;
  patientData: PatientData;
}

export interface Appointment extends DbCita {
  // Extended properties for UI convenience and Backward Compatibility
  patientName?: string;
  serviceName?: string;
  companyName?: string;
  
  // Mapped fields from DB columns for frontend compatibility
  date?: string; // Maps to fecha
  time?: string; // Maps to hora
  patientId?: string; // Maps to cliente_dni
  service?: string; // Maps to service name
  company?: string; // Maps to company name
  specialty?: string; // Maps to specialty name
  phone?: string;
  email?: string;
  address?: string;
  source?: string; // Maps to id_metodo name

  // Admin/Manual Entry specific
  rawCompanyId?: number;
  rawSpecialtyId?: number;
  rawServiceId?: number;
}

export type Patient = PatientData;
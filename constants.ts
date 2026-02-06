import { ServiceOption, DayAvailability, Appointment, Patient } from './types';

export const MUTUAS: ServiceOption[] = [
  { id: 'adeslas', title: 'Adeslas', subtitle: 'SegurCaixa' },
  { id: 'sanitas', title: 'Sanitas', subtitle: 'Todas las coberturas' },
  { id: 'asisa', title: 'Asisa', subtitle: 'Salud' },
  { id: 'dkv', title: 'DKV Seguros', subtitle: 'Integral' },
  { id: 'mapfre', title: 'Mapfre', subtitle: 'Caja Salud' },
  { id: 'private', title: 'Paciente Privado', subtitle: 'Sin aseguradora' },
];

export const SPECIALTIES: ServiceOption[] = [
  { id: 'general', title: 'Medicina General' },
  { id: 'cardio', title: 'Cardiología' },
  { id: 'pedia', title: 'Pediatría' },
  { id: 'derma', title: 'Dermatología' },
  { id: 'gino', title: 'Ginecología' },
  { id: 'nutri', title: 'Nutrición' },
];

export const VISIT_TYPES: ServiceOption[] = [
  { id: 'first', title: 'Primera Visita', subtitle: 'Nuevo paciente o nueva dolencia' },
  { id: 'review', title: 'Revisión', subtitle: 'Seguimiento de tratamiento' },
  { id: 'results', title: 'Recogida de Resultados', subtitle: 'Análisis y pruebas' },
  { id: 'vaccine', title: 'Vacunación', subtitle: 'Campaña o calendario' },
];

// Mock Database of Patients for Autocomplete
export const MOCK_PATIENTS: Patient[] = [
  { id: '1', firstName: 'Antonio', lastName: 'García Pérez', documentNumber: '12345678A', phone: '600111222', email: 'antonio@email.com', address: 'Calle Mayor 1, Madrid' },
  { id: '2', firstName: 'Maria', lastName: 'López Ruiz', documentNumber: '87654321B', phone: '600333444', email: 'maria@email.com', address: 'Avenida de la Libertad 45, Barcelona' },
  { id: '3', firstName: 'Jose', lastName: 'Martinez Soria', documentNumber: '11223344C', phone: '600555666', email: 'jose@email.com', address: 'Calle de Alcalá 120, Madrid' },
  { id: '4', firstName: 'Lucia', lastName: 'Fernandez Mola', documentNumber: '99887766D', phone: '600777888', email: 'lucia@email.com', address: 'Plaza de España 3, Sevilla' },
  { id: '5', firstName: 'Carlos', lastName: 'Ramirez', documentNumber: 'X1234567A', phone: '600999000', email: 'carlos.r@example.com', address: 'Calle Falsa 123, Elda' },
];

// Helper to generate mock availability for the current month
const generateMockAvailability = (): DayAvailability[] => {
  const days: DayAvailability[] = [];
  const today = new Date();
  
  // Generate for 60 days to cover month transitions
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat

    // Strict Clinic Hours Logic:
    // Mon (1) - Thu (4): 09:00-14:00, 16:00-20:00
    // Fri (5): 09:00-14:00, 17:00-20:00
    // Sat (6), Sun (0): Closed

    let status: 'available' | 'full' | 'closed' = 'available';
    let slots: { time: string, available: boolean }[] = [];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      status = 'closed';
    } else {
      // Morning Shift: 09:00 - 14:00 (Last slot 13:30) for Mon-Fri
      const morningSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
      
      let afternoonSlots: string[] = [];
      
      if (dayOfWeek === 5) { 
        // Friday: 17:00 - 20:00 (Last slot 19:30)
        afternoonSlots = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
      } else {
        // Mon-Thu: 16:00 - 20:00 (Last slot 19:30)
        afternoonSlots = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
      }

      const allTimes = [...morningSlots, ...afternoonSlots];
      
      slots = allTimes.map(time => ({
        time,
        available: Math.random() > 0.3 // Random availability for demo
      }));

      // If purely random chance makes all slots taken, mark as full
      if (slots.every(s => !s.available)) status = 'full';
    }

    days.push({
      date: dateStr,
      status,
      slots
    });
  }
  return days;
};

export const MOCK_AVAILABILITY = generateMockAvailability();

// Helper to get today's date string YYYY-MM-DD
const todayStr = new Date().toISOString().split('T')[0];

// Calculate next valid business day for mock appointments
const getNextBusinessDay = (startDate: Date) => {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 1);
  // If Sat(6) or Sun(0), add days
  if (d.getDay() === 6) d.setDate(d.getDate() + 2); // Skip to Mon
  if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Skip to Mon
  return d.toISOString().split('T')[0];
};

const nextBusinessDayStr = getNextBusinessDay(new Date());

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'LF-88219',
    patientName: 'Carlos Ramirez',
    patientId: 'X1234567A',
    company: 'Aetna Health Premier',
    specialty: 'Cardiología',
    service: 'Primera Visita',
    date: todayStr,
    time: '09:00',
    phone: '+1 (555) 234-5678',
    email: 'carlos.r@example.com',
    address: 'Calle Falsa 123, Elda',
    status: 'confirmed',
    source: 'WhatsApp'
  },
  {
    id: 'LF-99100',
    patientName: 'Maria Gonzales',
    patientId: 'Y9876543B',
    company: 'Sede Central',
    specialty: 'Medicina General',
    service: 'Revisión',
    date: todayStr,
    time: '17:00',
    phone: '+34 600 000 000',
    email: 'maria.g@example.com',
    address: 'Avenida Mediterráneo 12, Alicante',
    status: 'checked-in',
    source: 'Web'
  },
  {
    id: 'LF-77221',
    patientName: 'Juanito Perez',
    patientId: 'Z1231231C',
    company: 'Sanitas',
    specialty: 'Pediatría',
    service: 'Vacunación',
    date: todayStr,
    time: '10:00',
    phone: '+34 611 222 333',
    email: 'j.perez@test.com',
    address: 'Calle Alfonso X, 5, Murcia',
    status: 'confirmed',
    source: 'Phone'
  },
  // Mock data for next business day
  {
    id: 'LF-12345',
    patientName: 'Ana Lopez',
    patientId: 'A1234567',
    company: 'Adeslas',
    specialty: 'Dermatología',
    service: 'Primera Visita',
    date: nextBusinessDayStr,
    time: '09:00',
    phone: '+34 666 777 888',
    email: 'ana@test.com',
    address: 'Calle Mayor s/n, Petrer',
    status: 'confirmed',
    source: 'WhatsApp'
  },
  {
    id: 'LF-54321',
    patientName: 'Pedro Sanchez',
    patientId: 'B9876543',
    company: 'DKV',
    specialty: 'Medicina General',
    service: 'Revisión',
    date: nextBusinessDayStr,
    time: '11:00',
    phone: '+34 600 123 123',
    email: 'pedro@test.com',
    address: 'Calle Pablo Iglesias 41, Elda',
    status: 'confirmed',
    source: 'Presencial'
  }
];
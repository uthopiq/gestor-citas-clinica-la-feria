import React, { createContext, useContext, useState, ReactNode, useEffect, PropsWithChildren } from 'react';
import { BookingState, Appointment } from './types';
import { INITIAL_APPOINTMENTS, MUTUAS, SPECIALTIES, VISIT_TYPES } from './constants';

interface AppContextType {
  // Patient Flow State
  bookingStep: number;
  setBookingStep: (step: number) => void;
  bookingData: BookingState;
  updateBookingData: (data: Partial<BookingState>) => void;
  submitAppointment: () => Promise<void>;
  
  // Admin Flow State
  appointments: Appointment[];
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  cancelAppointment: (id: string) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (appointment: Appointment) => void;
}

const initialBookingState: BookingState = {
  company: null,
  specialty: null,
  reason: null,
  selectedDate: null,
  selectedTime: null,
  patientData: {
    firstName: '',
    lastName: '',
    documentType: 'NIF',
    documentNumber: '',
    phone: '',
    email: '',
    address: ''
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingState>(initialBookingState);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const updateBookingData = (data: Partial<BookingState>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Simulated WebSocket / Email Service
  const submitAppointment = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const id = `LF-${Math.floor(Math.random() * 100000)}`;
        const mutuaTitle = MUTUAS.find(c => c.id === bookingData.company)?.title || 'Privado';
        const specialtyTitle = SPECIALTIES.find(s => s.id === bookingData.specialty)?.title || 'General';
        const serviceTitle = VISIT_TYPES.find(v => v.id === bookingData.reason)?.title || 'Consulta';

        const newAppointment: Appointment = {
          id: id,
          patientName: `${bookingData.patientData.firstName} ${bookingData.patientData.lastName}`,
          patientId: bookingData.patientData.documentNumber,
          company: mutuaTitle,
          specialty: specialtyTitle,
          service: serviceTitle,
          date: bookingData.selectedDate || '',
          time: bookingData.selectedTime || '',
          phone: `+34 ${bookingData.patientData.phone}`,
          email: bookingData.patientData.email,
          address: bookingData.patientData.address,
          status: 'confirmed',
          source: 'Web'
        };
        
        // "Real-time" push to admin dashboard
        setAppointments(prev => [...prev, newAppointment]);

        // Simulate Sending Email
        console.group('%c 📧 Simulando Envío de Correo Electrónico', 'color: #00b5cb; font-size: 16px; font-weight: bold;');
        console.log(`%cTo: ${bookingData.patientData.email}`, 'font-size:12px; color: #555');
        console.log(`%cSubject: Confirmación de Cita - Clínica La Feria`, 'font-weight:bold; font-size:12px;');
        console.log(`%c
        Hola ${bookingData.patientData.firstName},
        
        Su cita ha sido confirmada con éxito.
        
        DETALLES DE LA CITA:
        -----------------------------------
        Identificador:  ${id}
        Fecha:          ${bookingData.selectedDate}
        Hora:           ${bookingData.selectedTime}
        Especialidad:   ${specialtyTitle}
        Motivo:         ${serviceTitle}
        Mutua:          ${mutuaTitle}
        
        UBICACIÓN:
        Clínica La Feria
        Calle Pablo Iglesias, 41 bajo, Elda
        
        Gracias por confiar en nosotros.
        `, 'color: #333; font-family: monospace;');
        console.groupEnd();

        resolve();
      }, 1500); // Simulate network delay
    });
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === id ? { ...appt, status: 'cancelled' } : appt
    ));
  };

  const addAppointment = (appointment: Appointment) => {
    setAppointments(prev => [...prev, appointment]);
  };

  const updateAppointment = (appointment: Appointment) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === appointment.id ? appointment : appt
    ));
  };

  const loginAdmin = () => setIsAdminLoggedIn(true);
  const logoutAdmin = () => setIsAdminLoggedIn(false);

  return (
    <AppContext.Provider value={{
      bookingStep,
      setBookingStep,
      bookingData,
      updateBookingData,
      submitAppointment,
      appointments,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      cancelAppointment,
      addAppointment,
      updateAppointment
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
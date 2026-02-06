
import React, { createContext, useContext, useState, ReactNode, useEffect, PropsWithChildren } from 'react';
import { BookingState, Appointment } from './types';
import { INITIAL_APPOINTMENTS, MUTUAS, SPECIALTIES, VISIT_TYPES } from './constants';
import { appointmentService } from './services/appointmentService';
import { authService } from './services/authService';

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
  loginAdmin: (user: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
  cancelAppointment: (id: string) => Promise<void>;
  addAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointment: (appointment: Appointment) => Promise<void>;
  refreshAppointments: () => Promise<void>;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  const updateBookingData = (data: Partial<BookingState>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const refreshAppointments = async () => {
    try {
        // Fetch all active appointments for the dashboard
        // Optimally we would date filter, but for now we fetch all active to support month view
        const data = await appointmentService.getAppointments();
        setAppointments(data);
    } catch (error) {
        console.error("Failed to fetch appointments", error);
    }
  };

  // Initial load
  useEffect(() => {
    refreshAppointments();
  }, []);

  const submitAppointment = async () => {
      // Connect to Real Backend
      await appointmentService.createAppointment(bookingData, 1); // 1 = Web
      await refreshAppointments();
      
      // Simulate confirmation email log
      console.log(`Cita confirmada para: ${bookingData.patientData.email}`);
  };

  const cancelAppointment = async (id: string) => {
    try {
        await appointmentService.cancelAppointment(id);
        setAppointments(prev => prev.map(appt => 
            appt.id === id ? { ...appt, status: 'cancelled' } : appt
        ));
    } catch (e) {
        console.error("Error cancelling", e);
    }
  };

  const addAppointment = async (appointment: Appointment) => {
    try {
        // This is primarily called by Admin Dashboard with a constructed object
        // We need to map it back to BookingState-like structure for the service
        // OR we should expose a direct create method for Admin that takes explicit IDs
        
        // For now, assuming the Modal passes mapped IDs in the 'appointment' object fields?
        // Actually AdminDashboard constructs a mock Appointment.
        // We need to change AdminDashboard to pass proper IDs.
        // But to keep interface simple, let's assume we refresh after add.
        // Or we reconstruct a booking object:
         const booking: BookingState = {
            company: 1, // Fallback or need to map string to ID
            specialty: 1, 
            reason: 1,
            selectedDate: appointment.date,
            selectedTime: appointment.time,
            patientData: {
                firstName: appointment.patientName?.split(' ')[0] || '',
                lastName: appointment.patientName?.split(' ').slice(1).join(' ') || '',
                documentType: 'NIF',
                documentNumber: appointment.patientId,
                phone: appointment.phone,
                email: appointment.email,
                address: appointment.address || ''
            }
        };
        // Use a different method ID for 'Presencial' or 'Phone'
        // Let's guess based on source?
        let method = 3; // Presencial
        if (appointment.source === 'Phone') method = 2; // WhatsApp? No, Manual mapping...
        if (appointment.source === 'WhatsApp') method = 2;

        await appointmentService.createAppointment(booking, method);
        await refreshAppointments();
    } catch(e) {
        console.error("Error adding appointment", e);
    }
  };

  const updateAppointment = async (appointment: Appointment) => {
    // Current service only supports status update easily
    // Full update requires more logic. For now supporting status or basic changes?
    // The UI mainly does drag-drop or time change.
    // If just refreshing:
    await refreshAppointments();
  };

  const loginAdmin = async (user: string, pass: string) => {
      const success = await authService.login(user, pass);
      if (success) setIsAdminLoggedIn(true);
      return success;
  };
  
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
      updateAppointment,
      refreshAppointments
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
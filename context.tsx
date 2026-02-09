
import React, { createContext, useContext, useState, ReactNode, useEffect, PropsWithChildren } from 'react';
import { BookingState, Appointment, User } from './types';
import { INITIAL_APPOINTMENTS, MUTUAS, SPECIALTIES, VISIT_TYPES } from './constants';
import { appointmentService } from './services/appointmentService';
import { authService } from './services/authService';

interface AppContextType {
  // Patient Flow State
  bookingStep: number;
  setBookingStep: (step: number) => void;
  bookingData: BookingState;
  updateBookingData: (data: Partial<BookingState>) => void;
  submitAppointment: () => Promise<string>;
  
  // Admin Flow State
  appointments: Appointment[];
  isAdminLoggedIn: boolean;
  currentUser: User | null;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
      const result = await appointmentService.createAppointment(bookingData, 1); // 1 = Web
      await refreshAppointments();
      
      // Return the custom code for display, fall back to ID if missing
      const displayCode = result.codigo_cita || result.id;
      console.log(`Cita confirmada para: ${bookingData.patientData.email} con ID: ${displayCode}`);
      return displayCode;
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
        // Map back to BookingState-like structure for the service
        
         const booking: BookingState = {
            // Use raw IDs passed from NewAppointmentModal
            company: appointment.rawCompanyId || 1, // Default to 1 (Adeslas?) or -1 (Privado) if missing? UI defaults to mutuas[0]
            specialty: appointment.rawSpecialtyId || 0, 
            reason: appointment.rawServiceId || 0,
            
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

        // Map Source String to ID
        // 1: Web, 2: WhatsApp, 3: Presencial, 4: Phone (Llamada IA)
        let methodId = 1;
        switch(appointment.source) {
            case 'Web': methodId = 1; break;
            case 'WhatsApp': methodId = 2; break;
            case 'Presencial': methodId = 3; break;
            case 'Phone': methodId = 4; break;
            default: methodId = 1;
        }

        await appointmentService.createAppointment(booking, methodId);
        await refreshAppointments();
    } catch(e) {
        console.error("Error adding appointment", e);
        throw e; // Rethrow so UI can show error
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
      const userData = await authService.login(user, pass);
      if (userData) {
          setIsAdminLoggedIn(true);
          setCurrentUser(userData);
          return true;
      }
      return false;
  };
  
  const logoutAdmin = () => {
      setIsAdminLoggedIn(false);
      setCurrentUser(null);
  }

  return (
    <AppContext.Provider value={{
      bookingStep,
      setBookingStep,
      bookingData,
      updateBookingData,
      submitAppointment,
      appointments,
      isAdminLoggedIn,
      currentUser,
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
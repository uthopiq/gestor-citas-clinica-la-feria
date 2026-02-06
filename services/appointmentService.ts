
import { supabase } from '../supabase';
import { DbCita, BookingState, Appointment } from '../types';
import { clientService } from './clientService';

export const appointmentService = {
  async getAppointments(date?: string): Promise<Appointment[]> {
     let query = supabase
      .from('citas')
      .select(`
        *,
        clientes ( nombre, apellidos, dni, telefono, email, direccion ),
        servicios ( 
            nombre, 
            duracion,
            mutuas ( nombre )
        )
      `)
      .eq('activo', true);

     if (date) {
       query = query.eq('fecha', date);
     }
     
     const { data, error } = await query;

    if (error) throw error;

    // Transform to frontend Appointment type
    return (data || []).map((row: any) => ({
      ...row,
      patientName: `${row.clientes?.nombre} ${row.clientes?.apellidos}`,
      patientId: row.clientes?.dni,
      company: row.servicios?.mutuas?.nombre || 'Privado', // Use Privado/Particular fallback
      specialty: 'General', 
      service: row.servicios?.nombre,
      phone: row.clientes?.telefono,
      email: row.clientes?.email,
      address: row.clientes?.direccion,
      source: 'Web', // TODO: Map id_metodo to string name if needed
      // Ensure we explicitly map DB fields to the Type needed by UI if names differ
      id: row.id,
      date: row.fecha,
      time: row.hora
    }));
  },

  async createAppointment(booking: BookingState, sourceMethodId: number = 1): Promise<DbCita> {
    // 1. Ensure Client Exists 
    // If we only have partial data (e.g. from Admin manual entry which might be incomplete), handle carefully
    const client = await clientService.ensureClientExists(booking.patientData);

    // 2. Create Appointment
    const newAppointment = {
        fecha: booking.selectedDate,
        hora: booking.selectedTime,
        cliente_dni: client.dni,
        id_servicio: booking.reason || 1, // Default fallback if null (should handle in UI)
        id_metodo: sourceMethodId,
        estado: 'confirmed',
        activo: true
    };

    const { data, error } = await supabase
        .from('citas')
        .insert(newAppointment)
        .select()
        .single();

    if (error) throw error;
    return data;
  },
  
  async checkAvailability(date: string, time: string): Promise<boolean> {
      const { data, error } = await supabase
        .from('citas')
        .select('id')
        .eq('fecha', date)
        .eq('hora', time)
        .eq('activo', true) // Only active appointments block slots
        .neq('estado', 'cancelled'); // Defensiveness

      if (error) throw error;
      return data.length === 0;
  },

  async updateStatus(id: string, status: string): Promise<void> {
      const { error } = await supabase
        .from('citas')
        .update({ estado: status })
        .eq('id', id);
        
      if (error) throw error;
  },
  
  async cancelAppointment(id: string): Promise<void> {
      const { error } = await supabase
        .from('citas')
        .update({ 
            estado: 'cancelled',
            activo: false,
            motivo_eliminacion: 'Cancelado por usuario'
        })
        .eq('id', id);

      if (error) throw error;
  }
};

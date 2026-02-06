
import { supabase } from '../supabase';
import { DbCliente, PatientData } from '../types';

export const clientService = {
  async getByDni(dni: string): Promise<DbCliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('dni', dni)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async search(query: string): Promise<DbCliente[]> {
    if (!query) return [];

    // Search by DNI or Name (case insensitive partial match)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .or(`dni.ilike.%${query}%,nombre.ilike.%${query}%,apellidos.ilike.%${query}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async create(patientData: PatientData): Promise<DbCliente> {
    const newClient: DbCliente = {
      dni: patientData.documentNumber,
      nombre: patientData.firstName,
      apellidos: patientData.lastName,
      email: patientData.email,
      telefono: patientData.phone,
      direccion: patientData.address
    };

    const { data, error } = await supabase
      .from('clientes')
      .insert(newClient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  async ensureClientExists(patientData: PatientData): Promise<DbCliente> {
      const existing = await this.getByDni(patientData.documentNumber);
      if (existing) return existing;
      return await this.create(patientData);
  }
};

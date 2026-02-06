
import { supabase } from '../supabase';
import { DbServicio, DbMutua, DbEspecialidad } from '../types';

export const catalogService = {
  async getMutuas(): Promise<DbMutua[]> {
    const { data, error } = await supabase
      .from('mutuas')
      .select('*')
      .order('nombre');
    
    if (error) console.error('Error fetching mutuas:', error); // Log but return empty to not break UI
    return data || [];
  },

  async getEspecialidades(idMutua?: number | null): Promise<DbEspecialidad[]> {
    if (idMutua !== undefined) {
        // Filter specialties based on available services for this Mutua (inc. Private)
        // 1. Get IDs of specialties that have services for this mutua or are private
        let serviceQuery = supabase.from('servicios').select('id_especialidad');

        if (idMutua === null) {
            // Only private services
            serviceQuery = serviceQuery.is('id_mutua', null);
        } else {
            // Mutua's services OR Private services
            serviceQuery = serviceQuery.or(`id_mutua.eq.${idMutua},id_mutua.is.null`);
        }

        const { data: services, error: sError } = await serviceQuery;
        
        if (sError) {
            console.error('Error fetching services for filtering specialties:', sError);
            return [];
        }

        const specialtyIds = Array.from(new Set(services?.map(s => s.id_especialidad) || []));

        if (specialtyIds.length === 0) return [];

        const { data, error } = await supabase
            .from('especialidades')
            .select('*')
            .in('id_especialidad', specialtyIds)
            .order('nombre');

        if (error) console.error('Error fetching especialidades:', error);
        return data || [];
    }

    // Default: fetch all if no mutua specified (though typically UI might wait for mutua)
    const { data, error } = await supabase
      .from('especialidades')
      .select('*')
      .order('nombre');
      
    if (error) console.error('Error fetching especialidades:', error);
    return data || [];
  },

  async getServicios(idEspecialidad?: number | null, idMutua?: number | null): Promise<DbServicio[]> {
    let query = supabase
      .from('servicios')
      .select('*')
      .order('nombre');

    // If idEspecialidad is provided (and not 0/null), filter by it.
    // If it's null/0 (representing 'Todas'), we skip this filter to return ALL services.
    if (idEspecialidad && idEspecialidad > 0) {
      query = query.eq('id_especialidad', idEspecialidad);
    }
    
    if (idMutua !== undefined) {
        if (idMutua === null) {
            query = query.is('id_mutua', null);
        } else {
            // Include both specific mutua services AND private (null) services
            query = query.or(`id_mutua.eq.${idMutua},id_mutua.is.null`);
        }
    }

    const { data, error } = await query;
    if (error) console.error('Error fetching servicios:', error);
    return data || [];
  }
};

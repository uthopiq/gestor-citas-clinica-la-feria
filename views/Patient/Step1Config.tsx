import React, { useEffect, useState } from 'react';
import { useApp } from '../../context';
import { catalogService } from '../../services/catalogService';
import { DbMutua, DbEspecialidad, DbServicio } from '../../types';

export const Step1Config: React.FC = () => {
  const { bookingData, updateBookingData, setBookingStep } = useApp();

  // Local state for catalog data
  const [mutuas, setMutuas] = useState<DbMutua[]>([]);
  const [specialties, setSpecialties] = useState<DbEspecialidad[]>([]);
  const [services, setServices] = useState<DbServicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMutuas = async () => {
      try {
        const m = await catalogService.getMutuas();
        // Add Private option
        setMutuas([{ id_mutua: -1, nombre: 'Privado' }, ...m]);
      } catch (error) {
        console.error("Error loading mutuas", error);
        setMutuas([{ id_mutua: -1, nombre: 'Privado' }]);
      } finally {
        setLoading(false);
      }
    };
    loadMutuas();
    // We don't load specialties here anymore, we wait for company selection
  }, []);

  // Load Specialties when Mutua changes
  useEffect(() => {
    const loadSpecialties = async () => {
         // If no company selected, maybe clear specialties or show all? 
         // But UI implies flow. Let's wait for company.
         // Actually, if we want to show specialties right away (if flow allows), we can.
         // But let's follow the accordion flow.
         if (!bookingData.company) {
             setSpecialties([]); 
             return; 
         }

         const idMutua = bookingData.company === -1 ? null : bookingData.company;
         try {
             const s = await catalogService.getEspecialidades(idMutua);
             setSpecialties([{ id_especialidad: 0, nombre: 'Todas' }, ...s]);
             
             // We do NOT auto-select "Todas" (0) anymore. 
             // We rely on the user to manually select a specialty.
             // If bookingData.specialty was set to something invalid, it remains (but should have been cleared by onChange).
         } catch (e) {
             console.error(e);
             setSpecialties([{ id_especialidad: 0, nombre: 'Todas' }]);
         }
    };
    loadSpecialties();
  }, [bookingData.company]);

  // Fetch services when specialty or mutua changes
  useEffect(() => {
    const loadServices = async () => {
        // Specialty 0 is valid ("Todas")
        if (bookingData.specialty !== undefined) {
             const idMutua = bookingData.company === -1 ? null : bookingData.company;
             const s = await catalogService.getServicios(bookingData.specialty, idMutua);
             setServices(s);
             
             // Validate selected reason
             if (bookingData.reason) {
                 const exists = s.find(sr => sr.id_servicio === bookingData.reason);
                 if (!exists) updateBookingData({ reason: undefined }); // Or 0?
             }
        } else {
            setServices([]);
        }
    };
    loadServices();
  }, [bookingData.specialty, bookingData.company]);


  // Completion check: Company is required (-1 is truthy). Specialty can be 0 (Todas), but needs to be selected (distinct from undefined).
  // Reason is required.
  // Completion check: Company is required (-1 is truthy). Specialty can be 0 (Todas), but needs to be selected (distinct from undefined/null).
  // Reason is required.
  const isStepComplete = !!bookingData.company && (bookingData.specialty !== undefined && bookingData.specialty !== null) && !!bookingData.reason;

  // Helpers to get titles
  const selectedMutua = mutuas.find(m => m.id_mutua === bookingData.company);
  const selectedSpecialty = specialties.find(s => s.id_especialidad === bookingData.specialty);
  // Special handling for title if ID is 0
  const specialtyTitle = bookingData.specialty === 0 ? 'Todas' : selectedSpecialty?.nombre;
  
  const selectedReason = services.find(v => v.id_servicio === bookingData.reason);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando catálogo...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración de Cita</h1>
        <p className="text-gray-500">Seleccione los detalles básicos para agendar su atención médica.</p>
      </div>

      {/* Accordion 1: Mutua */}
      <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-all" open={!bookingData.company}>
        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full transition-colors ${bookingData.company ? 'bg-green-500 text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
               <span className="material-symbols-outlined">{bookingData.company ? 'check' : 'corporate_fare'}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className={`font-bold text-lg ${bookingData.company ? 'text-gray-800' : 'text-gray-600'}`}>
                    Mutua
                </span>
                {bookingData.company && (
                    <span className="text-sm font-semibold text-green-600 animate-in fade-in">
                        Seleccionado: {selectedMutua?.nombre}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Seleccione su compañía aseguradora:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {mutuas.map((mutua) => (
              <label 
                key={mutua.id_mutua}
                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  bookingData.company === mutua.id_mutua ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio"
                  name="company" 
                  className="hidden" 
                  checked={bookingData.company === mutua.id_mutua} 
                  onChange={() => updateBookingData({ company: mutua.id_mutua, specialty: undefined, reason: undefined })}
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{mutua.nombre}</div>
                </div>
                {bookingData.company === mutua.id_mutua && (
                  <span className="material-symbols-outlined text-primary ml-auto scale-110">check_circle</span>
                )}
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Accordion 2: Specialty */}
      <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-all" open={!!bookingData.company && (bookingData.specialty === undefined || bookingData.specialty === null)}>
        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full transition-colors ${bookingData.specialty !== undefined && bookingData.specialty !== null ? 'bg-green-500 text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
               <span className="material-symbols-outlined">{bookingData.specialty !== undefined && bookingData.specialty !== null ? 'check' : 'stethoscope'}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className={`font-bold text-lg ${bookingData.specialty !== undefined && bookingData.specialty !== null ? 'text-gray-800' : 'text-gray-600'}`}>
                    Especialidad Médica
                </span>
                {bookingData.specialty !== undefined && bookingData.specialty !== null && (
                    <span className="text-sm font-semibold text-green-600 animate-in fade-in">
                        Seleccionado: {specialtyTitle}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Indique el área médica:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {specialties.map((spec) => (
              <button
                key={spec.id_especialidad}
                onClick={() => updateBookingData({ specialty: spec.id_especialidad, reason: undefined })}
                className={`px-4 py-3 text-sm rounded-lg border transition-all ${
                  bookingData.specialty === spec.id_especialidad 
                    ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                {spec.nombre}
              </button>
            ))}
          </div>
        </div>
      </details>

      {/* Accordion 3: Cita Para (Replaces Reason) */}
      <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-all" open={bookingData.specialty !== undefined && bookingData.specialty !== null && !bookingData.reason}>
        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
             <div className={`p-2 rounded-full transition-colors ${bookingData.reason ? 'bg-green-500 text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
               <span className="material-symbols-outlined">{bookingData.reason ? 'check' : 'event_note'}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className={`font-bold text-lg ${bookingData.reason ? 'text-gray-800' : 'text-gray-600'}`}>
                    Cita Para
                </span>
                {bookingData.reason && (
                    <span className="text-sm font-semibold text-green-600 animate-in fade-in">
                        Seleccionado: {selectedReason?.nombre}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Seleccione el tipo de consulta:</p>
           <div className="grid md:grid-cols-2 gap-3">
            {services.map((type) => (
              <button
                key={type.id_servicio}
                onClick={() => updateBookingData({ reason: type.id_servicio })}
                className={`px-4 py-3 text-left rounded-lg border transition-all flex items-center justify-between ${
                  bookingData.reason === type.id_servicio 
                    ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                <div>
                   <div className="font-bold text-sm">{type.nombre}</div>
                   <div className={`text-xs ${bookingData.reason === type.id_servicio ? 'text-white/80' : 'text-gray-400'}`}>Duración: {type.duracion} min</div>
                </div>
                {bookingData.reason === type.id_servicio && (
                  <span className="material-symbols-outlined">check</span>
                )}
              </button>
            ))}
            {services.length === 0 && <p className="col-span-2 text-center text-gray-400">Seleccione especialidad para ver servicios</p>}
          </div>
        </div>
      </details>

      <div className="flex justify-end pt-6">
        <button
          onClick={() => isStepComplete && setBookingStep(2)}
          disabled={!isStepComplete}
          className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
            isStepComplete 
              ? 'bg-primary text-white hover:bg-primary-dark hover:-translate-y-1' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
          }`}
        >
          Siguiente
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
import React from 'react';
import { useApp } from '../../context';
import { MUTUAS, SPECIALTIES, VISIT_TYPES } from '../../constants';

export const Step1Config: React.FC = () => {
  const { bookingData, updateBookingData, setBookingStep } = useApp();

  const isStepComplete = bookingData.company && bookingData.specialty && bookingData.reason;

  // Helpers to get titles
  const selectedMutua = MUTUAS.find(m => m.id === bookingData.company);
  const selectedSpecialty = SPECIALTIES.find(s => s.id === bookingData.specialty);
  const selectedReason = VISIT_TYPES.find(v => v.id === bookingData.reason);

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
                        Seleccionado: {selectedMutua?.title}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Seleccione su compañía aseguradora:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {MUTUAS.map((mutua) => (
              <label 
                key={mutua.id}
                className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  bookingData.company === mutua.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input 
                  type="radio" 
                  name="company" 
                  className="hidden" 
                  checked={bookingData.company === mutua.id} 
                  onChange={() => updateBookingData({ company: mutua.id })}
                />
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-800">{mutua.title}</div>
                  <div className="text-xs text-gray-500">{mutua.subtitle}</div>
                </div>
                {bookingData.company === mutua.id && (
                  <span className="material-symbols-outlined text-primary ml-auto scale-110">check_circle</span>
                )}
              </label>
            ))}
          </div>
        </div>
      </details>

      {/* Accordion 2: Specialty */}
      <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-all" open={!!bookingData.company && !bookingData.specialty}>
        <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-full transition-colors ${bookingData.specialty ? 'bg-green-500 text-white shadow-md' : 'bg-primary/10 text-primary'}`}>
               <span className="material-symbols-outlined">{bookingData.specialty ? 'check' : 'stethoscope'}</span>
            </div>
            <div className="flex flex-col items-start">
                <span className={`font-bold text-lg ${bookingData.specialty ? 'text-gray-800' : 'text-gray-600'}`}>
                    Especialidad Médica
                </span>
                {bookingData.specialty && (
                    <span className="text-sm font-semibold text-green-600 animate-in fade-in">
                        Seleccionado: {selectedSpecialty?.title}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Indique el área médica:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPECIALTIES.map((spec) => (
              <button
                key={spec.id}
                onClick={() => updateBookingData({ specialty: spec.id })}
                className={`px-4 py-3 text-sm rounded-lg border transition-all ${
                  bookingData.specialty === spec.id 
                    ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                {spec.title}
              </button>
            ))}
          </div>
        </div>
      </details>

      {/* Accordion 3: Cita Para (Replaces Reason) */}
      <details className="group border border-gray-200 rounded-xl bg-white overflow-hidden transition-all" open={!!bookingData.specialty && !bookingData.reason}>
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
                        Seleccionado: {selectedReason?.title}
                    </span>
                )}
            </div>
          </div>
          <span className="material-symbols-outlined transition-transform group-open:rotate-180 text-gray-400">expand_more</span>
        </summary>
        <div className="p-5 pt-0 border-t border-transparent group-open:border-gray-100">
          <p className="text-sm text-gray-500 mb-4 mt-4">Seleccione el tipo de consulta:</p>
           <div className="grid md:grid-cols-2 gap-3">
            {VISIT_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => updateBookingData({ reason: type.id })}
                className={`px-4 py-3 text-left rounded-lg border transition-all flex items-center justify-between ${
                  bookingData.reason === type.id 
                    ? 'bg-primary text-white border-primary shadow-md transform scale-[1.02]' 
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                <div>
                   <div className="font-bold text-sm">{type.title}</div>
                   <div className={`text-xs ${bookingData.reason === type.id ? 'text-white/80' : 'text-gray-400'}`}>{type.subtitle}</div>
                </div>
                {bookingData.reason === type.id && (
                  <span className="material-symbols-outlined">check</span>
                )}
              </button>
            ))}
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
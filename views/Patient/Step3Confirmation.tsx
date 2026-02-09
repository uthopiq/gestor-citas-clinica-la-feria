import React, { useState, useEffect } from 'react';
import { useApp } from '../../context';
import { catalogService } from '../../services/catalogService';
import { DbMutua, DbServicio, DbEspecialidad } from '../../types';

export const Step3Confirmation: React.FC = () => {
  const { bookingData, updateBookingData, submitAppointment, setBookingStep } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Catalog State for Summary
  const [mutuaName, setMutuaName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [specialtyName, setSpecialtyName] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
        if (bookingData.company) {
            const mutuas = await catalogService.getMutuas();
            const m = mutuas.find(x => x.id_mutua === bookingData.company);
            if (m) setMutuaName(m.nombre);
        }
        if (bookingData.specialty) {
            const specialties = await catalogService.getEspecialidades();
            const s = specialties.find(x => x.id_especialidad === bookingData.specialty);
            if (s) setSpecialtyName(s.nombre);
        }
        // For service, we might need to fetch services based on specialty/mutua if we want to be precise,
        // or just fetch all services if the API supports it, or use the one we selected.
        // Assuming we can get services list efficiently or we just re-fetch context relevant services.
        if (bookingData.reason && bookingData.specialty) {
            const services = await catalogService.getServicios(bookingData.specialty, bookingData.company || undefined);
            const s = services.find(x => x.id_servicio === bookingData.reason);
            if (s) setServiceName(s.nombre);
        }
    };
    loadDetails();
  }, [bookingData.company, bookingData.specialty, bookingData.reason]);

  // Consent state
  const [consents, setConsents] = useState({
    privacy: false,
    terms: false,
    age: false,
    rules: false,
    commercial: false
  });

  // Local state for validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (field: keyof typeof bookingData.patientData, value: string) => {
    // Phone Mask Logic
    if (field === 'phone') {
       if (!value.startsWith('+34')) {
         value = '+34 ' + value.replace(/[^0-9]/g, '');
       } else {
         const numPart = value.substring(4).replace(/[^0-9]/g, '');
         value = '+34 ' + numPart;
       }
    }

    updateBookingData({
      patientData: { ...bookingData.patientData, [field]: value }
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    const pd = bookingData.patientData;

    if (!pd.firstName.trim()) newErrors.firstName = 'Campo obligatorio';
    if (!pd.lastName.trim()) newErrors.lastName = 'Campo obligatorio';
    if (!pd.email.includes('@')) newErrors.email = 'Email inválido';
    if (!pd.address.trim()) newErrors.address = 'La dirección es obligatoria';
    
    const docRegex = pd.documentType === 'NIF' ? /^[0-9]{8}[A-Z]$/i : /^[XYZ][0-9]{7}[A-Z]$/i;
    if (!docRegex.test(pd.documentNumber)) {
      newErrors.documentNumber = `Formato ${pd.documentType} inválido`;
    }

    if (pd.phone.length < 13) newErrors.phone = 'Teléfono incompleto';

    if (!consents.age) newErrors.age = 'Debe confirmar que es mayor de edad';
    if (!consents.rules) newErrors.rules = 'Debe aceptar la política de citas';
    if (!consents.privacy) newErrors.privacy = 'Debe aceptar la política de privacidad';
    if (!consents.terms) newErrors.terms = 'Debe aceptar los términos y condiciones';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const id = await submitAppointment();
      setAppointmentId(id);
      setIsSubmitting(false);
      setSuccess(true);
    } catch (error) {
      console.error("Error submitting appointment:", error);
      setIsSubmitting(false);
      alert("Hubo un error al procesar la cita. Por favor, inténtelo de nuevo.");
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500 text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-6xl text-green-600">check_circle</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Cita Confirmada!</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Hemos enviado los detalles a <strong>{bookingData.patientData.email}</strong>. 
          Su código de cita es: <span className="font-mono bg-gray-100 px-2 py-1 rounded font-bold">{appointmentId || 'Pendiente'}</span>
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-dark transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-right-8 duration-500 max-w-full overflow-x-hidden items-center lg:items-start">
      <div className="lg:col-span-7 space-y-6 flex flex-col items-center lg:items-start w-full max-w-2xl lg:max-w-none">
        <div className="w-full text-center lg:text-left">
          <h1 className="text-2xl font-bold text-gray-900">Finalizar Reserva</h1>
          <p className="text-gray-500">Por favor, completa tus datos personales.</p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 space-y-4 w-full shadow-sm">
           <div className="grid md:grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.firstName ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                  placeholder="Ej: Juan"
                  value={bookingData.patientData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Apellidos</label>
                <input 
                  type="text"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.lastName ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                  placeholder="Ej: Pérez García"
                  value={bookingData.patientData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
             </div>
           </div>

           <div>
             <label className="block text-sm font-bold text-gray-700 mb-1">Documento de Identidad</label>
             <div className="flex w-full items-stretch">
               <select 
                 className="p-3 bg-gray-50 border border-gray-200 border-r-0 rounded-l-lg focus:ring-0 focus:border-primary outline-none text-xs sm:text-sm"
                 style={{ minWidth: '70px' }}
                 value={bookingData.patientData.documentType}
                 onChange={(e) => handleInputChange('documentType', e.target.value as any)}
               >
                 <option value="NIF">NIF</option>
                 <option value="NIE">NIE</option>
               </select>
               <input 
                 type="text" 
                 className={`flex-1 min-w-0 p-3 border rounded-r-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.documentNumber ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                 placeholder={bookingData.patientData.documentType === 'NIF' ? '12345678A' : 'X1234567A'}
                 value={bookingData.patientData.documentNumber}
                 onChange={(e) => handleInputChange('documentNumber', e.target.value.toUpperCase())}
               />
             </div>
             {errors.documentNumber && <p className="text-red-500 text-xs mt-1">{errors.documentNumber}</p>}
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono de Contacto</label>
              <input 
                type="text"
                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.phone ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                placeholder="+34 600 000 000"
                value={bookingData.patientData.phone || '+34 '}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email"
                  className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.email ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                  placeholder="juan.perez@email.com"
                  value={bookingData.patientData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {!errors.email && bookingData.patientData.email.includes('@') && (
                  <span className="material-symbols-outlined absolute right-3 top-3 text-green-500">check_circle</span>
                )}
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
           </div>

           <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Completa</label>
              <input 
                type="text"
                className={`w-full p-3 border rounded-lg outline-none focus:ring-2 focus:border-transparent transition-all ${errors.address ? 'border-red-500 ring-red-100' : 'border-gray-200 focus:ring-primary'}`}
                placeholder="Ej: Calle Pablo Iglesias 41, bajo, Elda"
                value={bookingData.patientData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
           </div>
           
           {/* Obligaciones y Consentimientos */}
           <div className="pt-6 border-t border-gray-100 space-y-4">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Obligaciones y Consentimientos</h3>
              
              {/* Age Restriction */}
              <label className="flex items-start gap-3 cursor-pointer group">
                 <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-primary checked:bg-primary"
                      checked={consents.age}
                      onChange={(e) => setConsents({...consents, age: e.target.checked})}
                    />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100">check</span>
                 </div>
                 <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                   Declaro que soy <span className="font-bold text-gray-800">mayor de 18 años</span> y tengo capacidad legal para contratar servicios médicos.
                 </span>
              </label>
              {errors.age && <p className="text-red-500 text-[10px] ml-8">{errors.age}</p>}

              {/* Clinic Rules / Cancellation */}
              <label className="flex items-start gap-3 cursor-pointer group">
                 <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-primary checked:bg-primary"
                      checked={consents.rules}
                      onChange={(e) => setConsents({...consents, rules: e.target.checked})}
                    />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100">check</span>
                 </div>
                 <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                   Acepto la <span className="font-bold text-gray-800">política de citas</span>: Las cancelaciones deben realizarse con al menos <span className="font-bold">24 horas de antelación</span>. Entiendo que las citas no asistidas o canceladas tarde pueden conllevar gastos.
                 </span>
              </label>
              {errors.rules && <p className="text-red-500 text-[10px] ml-8">{errors.rules}</p>}

              {/* Privacy */}
              <label className="flex items-start gap-3 cursor-pointer group">
                 <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-primary checked:bg-primary"
                      checked={consents.privacy}
                      onChange={(e) => setConsents({...consents, privacy: e.target.checked})}
                    />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100">check</span>
                 </div>
                 <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                   He leído y acepto la <span className="text-primary font-bold underline cursor-pointer hover:text-primary-dark">política de privacidad</span> y el tratamiento de mis datos de salud.
                 </span>
              </label>
              {errors.privacy && <p className="text-red-500 text-[10px] ml-8">{errors.privacy}</p>}

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer group">
                 <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-primary checked:bg-primary"
                      checked={consents.terms}
                      onChange={(e) => setConsents({...consents, terms: e.target.checked})}
                    />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100">check</span>
                 </div>
                 <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                   He leído y acepto los <span className="text-primary font-bold underline cursor-pointer hover:text-primary-dark">términos y condiciones</span> del servicio.
                 </span>
              </label>
              {errors.terms && <p className="text-red-500 text-[10px] ml-8">{errors.terms}</p>}

              {/* Commercial (Optional) */}
              <label className="flex items-start gap-3 cursor-pointer group">
                 <div className="relative flex items-center mt-0.5">
                    <input 
                      type="checkbox" 
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-gray-300 transition-all checked:border-primary checked:bg-primary"
                      checked={consents.commercial}
                      onChange={(e) => setConsents({...consents, commercial: e.target.checked})}
                    />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs opacity-0 peer-checked:opacity-100">check</span>
                 </div>
                 <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-gray-900 transition-colors">
                   (Opcional) Autorizo el envío de comunicaciones comerciales y recordatorios de salud.
                 </span>
              </label>
           </div>
        </div>

        <div className="w-full flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-wait flex justify-center items-center gap-2 text-lg"
          >
            {isSubmitting ? (
               <>
                 <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                 Procesando...
               </>
            ) : (
               <>
                 Confirmar Cita
                 <span className="material-symbols-outlined">event_available</span>
               </>
            )}
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="lg:col-span-5 w-full flex justify-center lg:block mt-8 lg:mt-0">
         <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6 w-full max-w-md lg:max-w-none border border-gray-100">
            <div className="bg-primary p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <p className="font-bold text-sm opacity-80 uppercase tracking-widest mb-1">Resumen</p>
                 <h3 className="text-2xl font-bold">Detalle de Cita</h3>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
            </div>

            <div className="p-6 space-y-6">
               <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
                    <span className="material-symbols-outlined">medical_services</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{serviceName || 'Servicio seleccionado'}</p>
                    <p className="text-sm text-gray-500 capitalize">{specialtyName || 'Especialidad seleccionada'}</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
                    <span className="material-symbols-outlined">calendar_today</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">
                      {new Date(bookingData.selectedDate || '').toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric'})}
                    </p>
                    <p className="text-sm text-gray-500">A las {bookingData.selectedTime}</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg h-fit">
                    <span className="material-symbols-outlined">corporate_fare</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{mutuaName || 'Mutua seleccionada'}</p>
                    <p className="text-sm text-gray-500">Compañía Aseguradora</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      <div className="lg:col-span-12 mt-6 flex justify-center lg:justify-start pb-8">
        <button onClick={() => setBookingStep(2)} className="flex items-center gap-2 text-gray-500 hover:text-primary font-medium transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          Volver a Disponibilidad
        </button>
      </div>
    </div>
  );
};
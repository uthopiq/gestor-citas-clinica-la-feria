import React, { useState, useEffect, useMemo } from 'react';
import { MUTUAS, SPECIALTIES, VISIT_TYPES, MOCK_PATIENTS } from '../constants';
import { Appointment, Patient } from '../types';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Partial<Appointment>) => void;
  initialDate?: string;
  initialTime?: string;
  appointmentToEdit?: Appointment | null;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDate, 
  initialTime,
  appointmentToEdit 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Logic states
  const [isPatientSelected, setIsPatientSelected] = useState(false);
  const [isNewPatientMode, setIsNewPatientMode] = useState(false);
  const [patientSuccessMsg, setPatientSuccessMsg] = useState<string | null>(null);
  
  // Validation State
  const [hasAttemptedSave, setHasAttemptedSave] = useState(false);
  const [emailError, setEmailError] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
    company: MUTUAS[0].id,
    specialty: SPECIALTIES[0].id,
    reason: VISIT_TYPES[0].id,
    date: initialDate || new Date().toISOString().split('T')[0],
    time: initialTime || '',
    source: 'Phone' as 'Phone' | 'WhatsApp' | 'Web' | 'Presencial'
  });

  // Helper: Reverse lookup ID from Title
  const getIdByTitle = (list: any[], title: string, defaultId: string) => {
    return list.find(item => item.title === title)?.id || defaultId;
  };

  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        // EDIT MODE: Pre-fill data
        const [first, ...rest] = appointmentToEdit.patientName.split(' ');
        const last = rest.join(' ');

        setFormData({
          firstName: first || '',
          lastName: last || '',
          documentNumber: appointmentToEdit.patientId,
          phone: appointmentToEdit.phone,
          email: appointmentToEdit.email,
          address: appointmentToEdit.address || '',
          company: getIdByTitle(MUTUAS, appointmentToEdit.company, MUTUAS[0].id),
          specialty: getIdByTitle(SPECIALTIES, appointmentToEdit.specialty, SPECIALTIES[0].id),
          reason: getIdByTitle(VISIT_TYPES, appointmentToEdit.service || '', VISIT_TYPES[0].id),
          date: appointmentToEdit.date,
          time: appointmentToEdit.time,
          source: appointmentToEdit.source
        });
        
        setIsPatientSelected(true); // Lock patient part conceptually
        setSearchTerm(appointmentToEdit.patientId);
        setIsNewPatientMode(true); // Allow editing patient details in edit mode
        setPatientSuccessMsg(null);
        setHasAttemptedSave(false);
        setEmailError(false);

      } else {
        // CREATE MODE: Reset
        resetForm();
      }
    }
  }, [isOpen, initialDate, initialTime, appointmentToEdit]);

  const resetForm = () => {
    setFormData({
        firstName: '',
        lastName: '',
        documentNumber: '',
        phone: '',
        email: '',
        address: '',
        company: MUTUAS[0].id,
        specialty: SPECIALTIES[0].id,
        reason: VISIT_TYPES[0].id,
        date: initialDate || new Date().toISOString().split('T')[0],
        time: initialTime || '',
        source: 'Phone'
      });
      setSearchTerm('');
      setSearchResults([]);
      setIsDropdownOpen(false);
      setIsPatientSelected(false);
      setIsNewPatientMode(false);
      setPatientSuccessMsg(null);
      setHasAttemptedSave(false);
      setEmailError(false);
  };

  // Search Logic
  useEffect(() => {
    if (isPatientSelected || isNewPatientMode) return; // Don't search if we are in a locked state

    if (searchTerm.length < 2) {
      setSearchResults([]);
      setIsDropdownOpen(false);
      return;
    }

    const lowerTerm = searchTerm.toLowerCase();
    const results = MOCK_PATIENTS.filter(p => 
      p.documentNumber.toLowerCase().includes(lowerTerm) || 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(lowerTerm)
    );

    setSearchResults(results);
    setIsDropdownOpen(true);
  }, [searchTerm, isPatientSelected, isNewPatientMode]);

  // Generate Slots based on selected Date
  const availableSlots = useMemo(() => {
    if (!formData.date) return { morning: [], afternoon: [], isClosed: false };

    const date = new Date(formData.date);
    const day = date.getDay(); // 0=Sun, 6=Sat

    // Saturday (6) and Sunday (0) are CLOSED
    if (day === 0 || day === 6) {
      return { morning: [], afternoon: [], isClosed: true };
    }

    // Generate Morning: 09:00 - 13:30 (Closes 14:00)
    const morning = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
    
    // Generate Afternoon
    let afternoon: string[] = [];
    if (day === 5) { // Friday: 17:00 - 19:30 (Closes 20:00)
       afternoon = ['17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
    } else { // Mon-Thu: 16:00 - 19:30 (Closes 20:00)
       afternoon = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
    }

    return { morning, afternoon, isClosed: false };
  }, [formData.date]);

  // Helper to determine if search term looks like a DNI (has numbers) or Name (letters only)
  const isLikeDni = useMemo(() => {
    return /\d/.test(searchTerm);
  }, [searchTerm]);

  const handlePatientSelect = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      firstName: patient.firstName,
      lastName: patient.lastName,
      documentNumber: patient.documentNumber,
      phone: patient.phone,
      email: patient.email,
      address: patient.address
    }));
    setSearchTerm(patient.documentNumber); 
    setIsDropdownOpen(false);
    setIsPatientSelected(true);
    setIsNewPatientMode(false);
    setPatientSuccessMsg(null);
    setHasAttemptedSave(false);
  };

  const handleCreateNewClick = () => {
    setIsNewPatientMode(true);
    setIsDropdownOpen(false);
    setPatientSuccessMsg(null);
    setHasAttemptedSave(false);

    // Auto-fill logic based on what was typed
    const initialPhone = '+34 ';
    
    if (isLikeDni) {
        setFormData(prev => ({
            ...prev,
            documentNumber: searchTerm.toUpperCase(),
            firstName: '',
            lastName: '',
            phone: initialPhone,
            email: '',
            address: ''
        }));
    } else {
        // It was a name
        setFormData(prev => ({
            ...prev,
            documentNumber: '',
            firstName: searchTerm, // Put the whole term in first name as a starting point
            lastName: '',
            phone: initialPhone,
            email: '',
            address: ''
        }));
    }
  };

  // Helper for Phone Input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Enforce +34 prefix
    if (!value.startsWith('+34')) {
        // If user tries to delete prefix, put it back or clean input
        const numericPart = value.replace(/^\+34/, '').replace(/[^0-9]/g, '');
        value = '+34 ' + numericPart;
    } 
    setFormData({...formData, phone: value});
  };

  const handleSaveNewPatient = () => {
      setHasAttemptedSave(true); // Trigger Validation

      // Email Validation Regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmailValid = emailRegex.test(formData.email);
      setEmailError(!isEmailValid);

      // Validate patient data - ALL FIELDS MANDATORY
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.documentNumber || !formData.email || !formData.address || !isEmailValid) {
        return;
      }

      // Simulate saving to DB
      setPatientSuccessMsg("Cliente añadido correctamente");
      setIsNewPatientMode(false);
      setIsPatientSelected(true); // Now it's selected and locked
      setSearchTerm(formData.documentNumber);
      setHasAttemptedSave(false);
  };

  const cancelSelection = () => {
    if (appointmentToEdit) {
        onClose(); // Just close if we are editing
    } else {
        resetForm();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (!formData.time) {
      alert("Por favor seleccione una hora.");
      return;
    }
    if (!isPatientSelected) {
        alert("Debe seleccionar o crear un paciente.");
        return;
    }

    const companyTitle = MUTUAS.find(m => m.id === formData.company)?.title || '';
    const specialtyTitle = SPECIALTIES.find(s => s.id === formData.specialty)?.title || '';
    const serviceTitle = VISIT_TYPES.find(v => v.id === formData.reason)?.title || 'Consulta';
    
    onSubmit({
      id: appointmentToEdit?.id, // Pass back ID if editing
      patientName: `${formData.firstName} ${formData.lastName}`,
      patientId: formData.documentNumber,
      company: companyTitle,
      specialty: specialtyTitle,
      service: serviceTitle,
      date: formData.date,
      time: formData.time,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      source: formData.source,
      status: appointmentToEdit ? appointmentToEdit.status : 'confirmed'
    });
    
    onClose();
  };

  // Helper to determine input styles based on validation
  const getInputClass = (value: string, disabled: boolean, isEmail: boolean = false) => {
      if (disabled) {
          return 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed';
      }
      // Check validation error
      if (hasAttemptedSave) {
          if (!value || (isEmail && emailError)) {
              return 'bg-red-50 border-red-500 text-gray-900 ring-1 ring-red-500 focus:ring-red-500';
          }
      }
      return 'bg-white border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary text-gray-900';
  };

  const showError = (value: string, disabled: boolean, isEmail: boolean = false) => {
      if (disabled || !hasAttemptedSave) return false;
      if (!value) return true; // Empty check
      if (isEmail && emailError) return true; // Regex check
      return false;
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose} 
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* Global Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 z-20">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg text-primary">
               <span className="material-symbols-outlined">{appointmentToEdit ? 'edit' : 'add_circle'}</span>
             </div>
             <div>
               <h2 className="text-lg font-bold text-gray-800 leading-none">{appointmentToEdit ? 'Editar Cita' : 'Nueva Cita'}</h2>
               <p className="text-xs text-gray-500 mt-1">{appointmentToEdit ? 'Modifique los datos de la cita' : 'Complete los datos para agendar'}</p>
             </div>
           </div>
           <button 
             onClick={onClose} 
             className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
             aria-label="Cerrar"
           >
             <span className="material-symbols-outlined text-2xl">close</span>
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row h-full">
            
            {/* Left Side: Patient Data */}
            <div className="p-6 md:p-8 md:w-1/2 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 space-y-6 flex flex-col">
               
               {/* Success Message Area - Always at top of panel if active */}
               {patientSuccessMsg && (
                   <div className="p-3 bg-green-50 border border-green-200 rounded-xl animate-in fade-in slide-in-from-top-2 flex items-center gap-2 shadow-sm">
                       <span className="material-symbols-outlined text-green-600">check_circle</span>
                       <span className="text-xs font-bold text-green-800">{patientSuccessMsg}</span>
                   </div>
               )}

               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">person</span>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Datos del Paciente</h3>
                 </div>
                 
                 {/* Botón de Salir/Cancelar (X Roja) disponible si hay paciente seleccionado O se está creando uno nuevo */}
                 {(isPatientSelected || isNewPatientMode) && !appointmentToEdit && (
                     <button onClick={cancelSelection} className="text-xs text-red-500 hover:underline flex items-center gap-1 font-bold">
                         <span className="material-symbols-outlined text-base">close</span> 
                         {isNewPatientMode ? 'Cancelar' : 'Cambiar'}
                     </button>
                 )}
               </div>
               
               {/* Search - Only visible if no patient is locked in or if we are searching */}
               {!isPatientSelected && !isNewPatientMode && !appointmentToEdit && (
                   <div className="relative z-20">
                     <label className="block text-xs font-bold text-gray-500 mb-1.5">Buscar Paciente (DNI o Nombre)</label>
                     <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-3 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                        <input 
                          type="text"
                          autoFocus
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none shadow-sm transition-all"
                          placeholder="Escriba para buscar..."
                        />
                     </div>
                     
                     {/* Dropdown Logic */}
                     {isDropdownOpen && searchTerm.length > 0 && (
                       <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 mt-2 max-h-60 overflow-y-auto z-30">
                         {searchResults.length > 0 ? (
                             searchResults.map(p => (
                               <button
                                 key={p.id}
                                 onClick={() => handlePatientSelect(p)}
                                 className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group"
                               >
                                 <div>
                                   <div className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">{p.firstName} {p.lastName}</div>
                                   <div className="text-xs text-gray-400">{p.documentNumber}</div>
                                 </div>
                                 <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
                               </button>
                             ))
                         ) : (
                             <div className="p-4 text-center">
                                 <p className="text-sm text-gray-500 mb-3">
                                     {isLikeDni ? `Este DNI ` : `Este nombre `} 
                                     <span className="font-bold text-gray-800">{searchTerm}</span> 
                                     {isLikeDni ? ` no existe.` : ` no existe.`}
                                 </p>
                                 <button 
                                    onClick={handleCreateNewClick}
                                    className="w-full py-2 bg-primary/10 text-primary font-bold rounded-lg text-xs hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <span className="material-symbols-outlined text-sm">person_add</span>
                                     Añadir Nuevo Cliente
                                 </button>
                             </div>
                         )}
                       </div>
                     )}
                   </div>
               )}

               {/* Fields - Visible if isPatientSelected OR isNewPatientMode */}
               {(isPatientSelected || isNewPatientMode) && (
                   <div className="space-y-4 pt-2 flex-1 animate-in slide-in-from-bottom-2 fade-in">
                      {isNewPatientMode && !appointmentToEdit && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Rellene TODOS los campos para crear la ficha.
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Nombre <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              required
                              disabled={!isNewPatientMode}
                              value={formData.firstName}
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                              className={`w-full p-2.5 rounded-lg text-sm outline-none transition-all ${getInputClass(formData.firstName, !isNewPatientMode)}`}
                            />
                            {showError(formData.firstName, !isNewPatientMode) && <p className="text-[10px] text-red-500 mt-1 font-bold">Campo obligatorio</p>}
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Apellidos <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              required
                              disabled={!isNewPatientMode}
                              value={formData.lastName}
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                              className={`w-full p-2.5 rounded-lg text-sm outline-none transition-all ${getInputClass(formData.lastName, !isNewPatientMode)}`}
                            />
                            {showError(formData.lastName, !isNewPatientMode) && <p className="text-[10px] text-red-500 mt-1 font-bold">Campo obligatorio</p>}
                         </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">DNI / NIE <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            disabled={!isNewPatientMode}
                            value={formData.documentNumber}
                            onChange={(e) => setFormData({...formData, documentNumber: e.target.value.toUpperCase()})}
                            className={`w-full p-2.5 rounded-lg text-sm uppercase outline-none transition-all ${getInputClass(formData.documentNumber, !isNewPatientMode)}`}
                          />
                          {showError(formData.documentNumber, !isNewPatientMode) && <p className="text-[10px] text-red-500 mt-1 font-bold">Campo obligatorio</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono <span className="text-red-500">*</span></label>
                            <input 
                              type="tel" 
                              required
                              disabled={!isNewPatientMode}
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              className={`w-full p-2.5 rounded-lg text-sm outline-none transition-all ${getInputClass(formData.phone, !isNewPatientMode)}`}
                            />
                            {showError(formData.phone, !isNewPatientMode) && <p className="text-[10px] text-red-500 mt-1 font-bold">Campo obligatorio</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Email <span className="text-red-500">*</span></label>
                            <input 
                              type="email" 
                              required
                              disabled={!isNewPatientMode}
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              className={`w-full p-2.5 rounded-lg text-sm outline-none transition-all ${getInputClass(formData.email, !isNewPatientMode, true)}`}
                            />
                            {showError(formData.email, !isNewPatientMode, true) && (
                                <p className="text-[10px] text-red-500 mt-1 font-bold">
                                    {emailError ? 'Formato de email inválido' : 'Campo obligatorio'}
                                </p>
                            )}
                        </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Dirección <span className="text-red-500">*</span></label>
                          <input 
                            type="text" 
                            required
                            disabled={!isNewPatientMode}
                            value={formData.address}
                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                            className={`w-full p-2.5 rounded-lg text-sm outline-none transition-all ${getInputClass(formData.address, !isNewPatientMode)}`}
                          />
                          {showError(formData.address, !isNewPatientMode) && <p className="text-[10px] text-red-500 mt-1 font-bold">Campo obligatorio</p>}
                      </div>

                      {/* Explicit Create Button when in New Patient Mode AND NOT EDITING */}
                      {isNewPatientMode && !appointmentToEdit && (
                          <div className="pt-2">
                              <button 
                                type="button"
                                onClick={handleSaveNewPatient}
                                className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                              >
                                  <span className="material-symbols-outlined">person_add</span>
                                  Crear Ficha de Cliente
                              </button>
                          </div>
                      )}
                   </div>
               )}
               
               {!isPatientSelected && !isNewPatientMode && !appointmentToEdit && (
                   <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                       <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
                       <p className="text-sm text-center">Busque un paciente por DNI o nombre<br/>para comenzar.</p>
                   </div>
               )}
            </div>

            {/* Right Side: Appointment Details */}
            <div className="p-6 md:p-8 md:w-1/2 bg-white flex flex-col">
               <div className="flex items-center gap-2 mb-6">
                 <span className="material-symbols-outlined text-gray-400">event_note</span>
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Detalles de la Cita</h3>
               </div>

               <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                  {/* Disable Right Side if Patient is not selected (Saved) */}
                  <div className={`transition-all ${!isPatientSelected ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Fecha de Consulta</label>
                        <input 
                          type="date" 
                          required
                          value={formData.date}
                          onChange={(e) => {
                            setFormData({...formData, date: e.target.value, time: ''});
                          }}
                          className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        />
                      </div>

                      {/* Enhanced Time Selector */}
                      <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Hora de Consulta</label>
                        
                        {availableSlots.isClosed ? (
                          <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-center">
                            <span className="material-symbols-outlined text-gray-400 text-2xl mb-1">block</span>
                            <p className="text-xs text-gray-500 font-medium">Clínica cerrada este día.</p>
                            <p className="text-[10px] text-gray-400 mt-1">Sábados y Domingos cerrados.</p>
                          </div>
                        ) : (
                          <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 max-h-64 overflow-y-auto custom-scrollbar">
                            {/* Morning */}
                            {availableSlots.morning.length > 0 && (
                              <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-orange-600/80">
                                  <span className="material-symbols-outlined text-sm">wb_sunny</span>
                                  <span className="text-[10px] font-bold uppercase">Mañana (09:00 - 14:00)</span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {availableSlots.morning.map(t => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => setFormData({...formData, time: t})}
                                      className={`
                                        py-2 rounded-lg text-xs font-bold transition-all border
                                        ${formData.time === t 
                                          ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                        }
                                      `}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Afternoon */}
                            {availableSlots.afternoon.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2 text-indigo-600/80">
                                  <span className="material-symbols-outlined text-sm">wb_twilight</span>
                                  <span className="text-[10px] font-bold uppercase">
                                    Tarde ({availableSlots.afternoon[0]} - 20:00)
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {availableSlots.afternoon.map(t => (
                                    <button
                                      key={t}
                                      type="button"
                                      onClick={() => setFormData({...formData, time: t})}
                                      className={`
                                        py-2 rounded-lg text-xs font-bold transition-all border
                                        ${formData.time === t 
                                          ? 'bg-primary text-white border-primary shadow-md transform scale-105' 
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                                        }
                                      `}
                                    >
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Mutua / Compañía</label>
                        <div className="relative">
                          <select 
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                          >
                             {MUTUAS.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 pointer-events-none text-lg">expand_more</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Especialidad</label>
                          <div className="relative">
                            <select 
                              value={formData.specialty}
                              onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                               {SPECIALTIES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 pointer-events-none text-lg">expand_more</span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Cita Para</label>
                          <div className="relative">
                            <select 
                              value={formData.reason}
                              onChange={(e) => setFormData({...formData, reason: e.target.value})}
                              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            >
                               {VISIT_TYPES.map(v => <option key={v.id} value={v.id}>{v.title}</option>)}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 pointer-events-none text-lg">expand_more</span>
                          </div>
                        </div>
                      </div>

                       <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-500 mb-2">Canal de Entrada</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                           {['Phone', 'WhatsApp', 'Web', 'Presencial'].map(source => (
                             <button
                               type="button"
                               key={source}
                               onClick={() => setFormData({...formData, source: source as any})}
                               className={`py-2 px-1 rounded-lg text-[10px] sm:text-xs font-bold border transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                                 formData.source === source 
                                   ? source === 'WhatsApp' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-200' 
                                   : source === 'Phone' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-200'
                                   : source === 'Presencial' ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-200'
                                   : 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-200'
                                   : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                               }`}
                             >
                                <span className="material-symbols-outlined text-base">
                                  {source === 'WhatsApp' ? 'chat' : source === 'Phone' ? 'call' : source === 'Presencial' ? 'storefront' : 'language'}
                                </span>
                                <span>{source}</span>
                             </button>
                           ))}
                        </div>
                      </div>
                  </div>

                  <div className="mt-auto pt-8 flex gap-3">
                     <button 
                       type="button" 
                       onClick={onClose}
                       className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:text-gray-800 transition-colors"
                     >
                       Cancelar
                     </button>
                     <button 
                       type="submit"
                       disabled={!formData.time || !isPatientSelected}
                       className="flex-1 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <span className="material-symbols-outlined text-lg">{appointmentToEdit ? 'save_as' : 'save'}</span>
                       {appointmentToEdit ? 'Guardar Cambios' : 'Guardar Cita'}
                     </button>
                  </div>
               </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
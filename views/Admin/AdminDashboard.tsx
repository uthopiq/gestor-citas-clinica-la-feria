import React, { useState, useEffect } from 'react';
import { useApp } from '../../context';
import { Appointment } from '../../types';
import { NewAppointmentModal } from '../../components/NewAppointmentModal';

// Helper to get start of week
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const dayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = dayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    days.push({ date: d, isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false });
  }

  return days;
};

export const AdminDashboard: React.FC = () => {
  const { appointments, logoutAdmin, cancelAppointment, addAppointment, updateAppointment } = useApp();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal State
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);
  const [newAppointmentPreData, setNewAppointmentPreData] = useState<{date?: string, time?: string}>({});
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Cancel Confirmation Modal State
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);

  // Updated Time Slots to match clinic hours range (9-14, 16-20)
  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  // FIXED: Use local date parts to construct YYYY-MM-DD to avoid UTC timezone shifts (off-by-one error)
  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = formatDateStr(date);
    return appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
  };

  const getAppointmentsForSlot = (date: Date, time: string) => {
    const dateStr = formatDateStr(date);
    return appointments.filter(a => a.date === dateStr && a.time.startsWith(time.split(':')[0]) && a.status !== 'cancelled');
  };

  const getSourceStyles = (source: string) => {
    switch (source) {
      case 'WhatsApp': return 'bg-green-50 border-green-200 text-green-700';
      case 'Phone': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Web': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'Presencial': return 'bg-orange-50 border-orange-200 text-orange-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  const getSourceIcon = (source: string) => {
     switch (source) {
      case 'WhatsApp': return 'chat';
      case 'Phone': return 'call';
      case 'Web': return 'language';
      case 'Presencial': return 'storefront';
      default: return 'event';
    }
  };

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setDate(newDate.getDate() + (direction * 7));
    }
    setCurrentDate(newDate);
  };

  const handleSlotClick = (date: Date, time: string) => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return; // Prevent clicks on weekends
    
    // Prevent clicks on past dates
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkDate < today) return;
    
    setNewAppointmentPreData({ date: formatDateStr(date), time });
    setEditingAppointment(null); // Ensure we are not editing
    setIsNewAppointmentOpen(true);
  };

  const handleNewAppointmentButton = () => {
    setNewAppointmentPreData({ date: formatDateStr(new Date()), time: '09:00' });
    setEditingAppointment(null); // Ensure we are not editing
    setIsNewAppointmentOpen(true);
  };

  const handleEditClick = () => {
    if (selectedAppointment) {
      setEditingAppointment(selectedAppointment);
      setNewAppointmentPreData({}); // Clear pre-data
      setIsNewAppointmentOpen(true);
      // We keep selectedAppointment to re-open the drawer if needed, but the modal takes over
    }
  };

  const handleCancelConfirmation = () => {
    if (selectedAppointment) {
      cancelAppointment(selectedAppointment.id);
      setIsCancelConfirmationOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleSaveAppointment = async (apptData: Partial<Appointment>) => {
    try {
        if (apptData.id) {
            // Update existing
            await updateAppointment(apptData as Appointment);
            // Refresh selected appointment if it was the one edited
            if (selectedAppointment && selectedAppointment.id === apptData.id) {
                setSelectedAppointment(apptData as Appointment);
            }
        } else {
            // Create new
            const newAppt: Appointment = {
                ...apptData,
                // We don't generate ID here anymore, service handles it for 'Cita Web' flow.
                // But for Admin flow, we pass a BookingBookingState-like object to service?
                // Context's addAppointment constructs the BookingState.
                // Let's rely on Context -> Service flow.
                id: `LF-${Math.floor(Math.random() * 100000)}` // Temporary FE ID, service will overwrite or ignores it?
                // Actually service.createAppointment ignores the ID passed in 'booking' usually, it generates it.
                // Service uses `booking` object.
            } as Appointment;
            await addAppointment(newAppt);
        }
        setIsNewAppointmentOpen(false);
    } catch (error) {
        console.error("Error saving appointment:", error);
        alert("Error al guardar la cita. Verifique los datos o la conexión.");
    }
  };

  const startOfCurrentWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startOfCurrentWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <>
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 relative">
        {/* Sidebar - Hidden on mobile */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col p-4 hidden md:flex z-10">
          <button 
            onClick={handleNewAppointmentButton}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 mb-8 shadow-sm transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Nueva Cita</span>
          </button>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Calendario Mini</h3>
            <div className="bg-gray-50 rounded-xl p-3">
               <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm capitalize">{currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</span>
               </div>
               <div className="grid grid-cols-7 text-center text-[10px] gap-1">
                  {['D','L','M','X','J','V','S'].map(d => <span key={d} className="text-gray-400">{d}</span>)}
                  {getDaysInMonth(currentDate).slice(0, 35).map((d, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setCurrentDate(d.date); }}
                      className={`p-1 rounded-full w-6 h-6 flex items-center justify-center ${
                        d.date.toDateString() === currentDate.toDateString() 
                          ? 'bg-primary text-white font-bold' 
                          : d.isCurrentMonth ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300'
                      }`}
                    >
                      {d.date.getDate()}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
             <button onClick={logoutAdmin} className="flex items-center gap-3 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full transition-colors">
                <span className="material-symbols-outlined">logout</span>
                <span className="text-sm font-medium">Cerrar Sesión</span>
             </button>
          </div>
        </aside>

        {/* Main Area */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Toolbar - Responsive */}
          <div className="bg-white border-b border-gray-200 shadow-sm z-20">
            <div className="px-4 py-3 md:px-6 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <h2 className="text-base md:text-lg font-bold capitalize truncate">
                  {viewMode === 'month' 
                    ? currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
                    : `Semana ${startOfCurrentWeek.getDate()} ${startOfCurrentWeek.toLocaleString('es-ES', { month: 'short' })}`
                  }
                </h2>
                <div className="flex items-center gap-1">
                   <button onClick={() => navigateDate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 active:bg-gray-200"><span className="material-symbols-outlined">chevron_left</span></button>
                   <button onClick={() => navigateDate(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 active:bg-gray-200"><span className="material-symbols-outlined">chevron_right</span></button>
                   <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold text-primary hover:underline px-2">Hoy</button>
                </div>
              </div>
              
              <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
                <button 
                  onClick={() => setViewMode('week')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'week' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                >
                  Semana
                </button>
                <button 
                  onClick={() => setViewMode('month')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'month' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                >
                  Mes
                </button>
              </div>
            </div>

            {/* Source Legend */}
            <div className="px-4 pb-3 md:px-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-2">Origen:</span>
               {['Web', 'Phone', 'WhatsApp', 'Presencial'].map(source => (
                 <div key={source} className={`px-3 py-1.5 rounded-lg border-l-4 text-[10px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-default ${getSourceStyles(source)}`}>
                    <span className="material-symbols-outlined text-[10px]">{getSourceIcon(source)}</span>
                    <span>{source}</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Content Views */}
          <div className="flex-1 overflow-auto bg-gray-50 md:p-4">
             
             {/* MONTH VIEW - Improved to match Patient Grid */}
             {viewMode === 'month' && (
               <div className="min-h-full bg-white md:rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                  <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                      <div key={d} className="bg-gray-50 py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {d}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-200">
                    {getDaysInMonth(currentDate).map((dayObj, i) => {
                      const dayAppointments = getAppointmentsForDate(dayObj.date);
                      const isToday = dayObj.date.toDateString() === new Date().toDateString();
                      
                      const dayOfWeek = dayObj.date.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                      return (
                        <div 
                          key={i} 
                          onClick={() => { 
                            if (!isWeekend) {
                              setCurrentDate(dayObj.date); 
                              setViewMode('week'); 
                            }
                          }}
                          className={`
                            p-1 md:p-2 relative flex flex-col transition-all group h-24 md:h-auto
                            ${isWeekend ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
                            ${!dayObj.isCurrentMonth && !isWeekend ? 'bg-gray-50/50' : ''}
                            ${!isWeekend && dayObj.isCurrentMonth ? 'bg-white' : ''}
                          `}
                        >
                           <div className="flex justify-center mb-1">
                             <span className={`text-[11px] md:text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full transition-colors
                               ${isToday ? 'bg-primary text-white' : dayObj.isCurrentMonth && !isWeekend ? 'text-gray-700' : 'text-gray-300'}`}>
                               {dayObj.date.getDate()}
                             </span>
                           </div>
                           
                           {/* Desktop: Badges | Mobile: Dots */}
                           <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                             {!isWeekend && (
                               <>
                                 <div className="hidden md:block overflow-y-auto custom-scrollbar">
                                   {dayAppointments.slice(0, 3).map(a => (
                                     <div key={a.id} className={`text-[9px] px-1.5 py-0.5 rounded truncate font-medium mb-0.5 ${getSourceStyles(a.source)}`}>
                                       {a.time} {a.patientName}
                                     </div>
                                   ))}
                                   {dayAppointments.length > 3 && (
                                     <div className="text-[9px] text-gray-400 font-bold px-1.5 text-center">+{dayAppointments.length - 3} más</div>
                                   )}
                                 </div>
                                 <div className="flex md:hidden justify-center gap-0.5 mt-auto pb-1">
                                   {dayAppointments.slice(0, 3).map((a, idx) => (
                                     <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
                                   ))}
                                   {dayAppointments.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>}
                                 </div>
                               </>
                             )}
                           </div>
                        </div>
                      );
                    })}
                  </div>
               </div>
             )}

             {/* WEEK VIEW - Sticky functionality */}
             {viewMode === 'week' && (
               <div className="relative h-full bg-white md:rounded-xl border md:border border-gray-200 shadow-sm overflow-auto">
                  <div className="min-w-[700px] flex flex-col">
                    {/* Header Days */}
                    <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20 shadow-sm">
                       <div className="w-16 md:w-20 p-3 border-r border-gray-100 bg-gray-50/50"></div>
                       {weekDays.map(d => {
                         const isToday = d.toDateString() === new Date().toDateString();
                         const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                         
                         return (
                           <div key={d.toISOString()} className={`flex-1 p-3 text-center border-r border-gray-100 ${isToday ? 'bg-primary/5' : isWeekend ? 'bg-gray-50' : ''}`}>
                             <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{d.toLocaleDateString('es-ES', { weekday: 'short'})}</div>
                             <div className={`text-lg font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full mt-1 ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>{d.getDate()}</div>
                           </div>
                         );
                       })}
                    </div>

                    {/* Time Rows */}
                    {timeSlots.map(time => (
                      <div key={time} className="flex border-b border-gray-50 h-24 md:h-28 group">
                         {/* Sticky Time Column */}
                         <div className="w-16 md:w-20 sticky left-0 p-2 border-r border-gray-100 text-[10px] md:text-xs font-bold text-gray-400 text-right bg-white z-10">
                           {time}
                         </div>
                         
                         {weekDays.map((day, dayIdx) => {
                           const appts = getAppointmentsForSlot(day, time);
                           const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                           return (
                             <div 
                                key={dayIdx} 
                                className={`flex-1 min-w-0 border-r border-gray-50 relative p-1 transition-colors
                                  ${isWeekend ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer active:bg-gray-50/50'}
                                `}
                                onClick={() => handleSlotClick(day, time)}
                             >
                                {!isWeekend && appts.map((appt) => (
                                  <div 
                                    key={appt.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }}
                                    className={`
                                      cursor-pointer p-2 rounded-lg text-[10px] mb-1 shadow-sm border-l-4 transition-all hover:scale-[1.02] active:scale-95 w-full
                                      ${selectedAppointment?.id === appt.id ? 'ring-2 ring-primary/40 z-10' : ''}
                                      ${getSourceStyles(appt.source)}
                                    `}
                                  >
                                     <div className="flex justify-between items-start font-bold mb-0.5">
                                       <span className="truncate pr-1">{appt.patientName}</span>
                                       <span className="material-symbols-outlined text-[10px]">{getSourceIcon(appt.source)}</span>
                                     </div>
                                     <div className="truncate opacity-80 text-[9px]">{appt.specialty}</div>
                                  </div>
                                ))}
                             </div>
                           );
                         })}
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>

          {/* Mobile FAB - Always visible for quick access */}
          <button 
            onClick={handleNewAppointmentButton}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform shadow-primary/40"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </main>

        {/* Detail Drawer / Bottom Sheet */}
        {selectedAppointment && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-[2px] animate-in fade-in duration-200"
              onClick={() => setSelectedAppointment(null)}
            ></div>

            <aside className={`
              fixed z-[70] bg-white shadow-2xl flex flex-col transition-all duration-300 ease-out
              inset-x-0 bottom-0 rounded-t-[2.5rem] max-h-[90vh] md:max-h-none
              md:inset-y-0 md:right-0 md:left-auto md:w-96 md:rounded-none md:translate-y-0
              ${selectedAppointment ? 'translate-y-0' : 'translate-y-full md:translate-x-full'}
            `}>
               {/* Mobile Drag Handle */}
               <div className="md:hidden flex justify-center pt-4 pb-2">
                 <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
               </div>

               <div className="px-6 py-4 md:py-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-bold text-lg text-gray-800">Detalles de Cita</h2>
                  <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined text-gray-400">close</span>
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center gap-5">
                     <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                        {selectedAppointment.patientName.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedAppointment.patientName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{selectedAppointment.codigo_cita || selectedAppointment.id}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getSourceStyles(selectedAppointment.source)}`}>{selectedAppointment.source}</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Fecha</p>
                        <p className="text-sm font-bold text-gray-800">{new Date(selectedAppointment.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                     </div>
                     <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Hora</p>
                        <p className="text-sm font-bold text-gray-800">{selectedAppointment.time}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Información Médica</label>
                        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-4">
                           <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Mutua:</span>
                              <span className="text-xs font-bold text-gray-800">{selectedAppointment.company}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Especialidad:</span>
                              <span className="text-xs font-bold text-gray-800">{selectedAppointment.specialty}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">Servicio:</span>
                              <span className="text-xs font-bold text-primary">{selectedAppointment.service || 'Consulta General'}</span>
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Contacto</label>
                        <div className="space-y-2">
                           <a href={`tel:${selectedAppointment.phone}`} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                              <span className="text-sm font-mono text-gray-700">{selectedAppointment.phone}</span>
                              <span className="material-symbols-outlined text-primary">call</span>
                           </a>
                           <a href={`mailto:${selectedAppointment.email}`} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                              <span className="text-sm truncate text-gray-700 max-w-[200px]">{selectedAppointment.email}</span>
                              <span className="material-symbols-outlined text-primary">mail</span>
                           </a>
                           {selectedAppointment.address && (
                             <div className="p-4 border border-gray-100 rounded-2xl bg-gray-50">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dirección</p>
                                <p className="text-sm text-gray-600 leading-relaxed">{selectedAppointment.address}</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>

               <div className="p-6 md:p-8 border-t border-gray-100 grid grid-cols-2 gap-3 bg-white pb-10 md:pb-8">
                  <button 
                    onClick={handleEditClick}
                    className="col-span-2 py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 active:bg-gray-50 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">edit</span>
                    Editar
                  </button>
                  <button 
                    onClick={() => setIsCancelConfirmationOpen(true)}
                    className="col-span-2 py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm active:bg-red-100 transition-colors hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">cancel</span>
                    Cancelar Cita
                  </button>
               </div>
            </aside>
          </>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelConfirmationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform animate-in zoom-in-95 duration-200 border border-gray-200">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <span className="material-symbols-outlined text-3xl text-red-600">warning</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¿Cancelar esta cita?</h3>
              <p className="text-sm text-gray-500 mb-6">Esta acción es irreversible y notificará al paciente de la cancelación.</p>
              
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => setIsCancelConfirmationOpen(false)}
                   className="py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                 >
                   No, volver
                 </button>
                 <button 
                   onClick={handleCancelConfirmation}
                   className="py-3 rounded-xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-colors"
                 >
                   Sí, cancelar
                 </button>
              </div>
           </div>
        </div>
      )}

      <NewAppointmentModal 
        isOpen={isNewAppointmentOpen} 
        onClose={() => setIsNewAppointmentOpen(false)}
        onSubmit={handleSaveAppointment}
        initialDate={newAppointmentPreData.date}
        initialTime={newAppointmentPreData.time}
        appointmentToEdit={editingAppointment}
      />
    </>
  );
};
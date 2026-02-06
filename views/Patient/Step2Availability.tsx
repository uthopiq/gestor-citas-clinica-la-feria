import React, { useState, useMemo } from 'react';
import { useApp } from '../../context';
import { MOCK_AVAILABILITY } from '../../constants';
import { DayAvailability } from '../../types';

// Helpers for date calculation
const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const days = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-based start
  const dayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  for (let i = dayOfWeek; i > 0; i--) {
    days.push({ date: new Date(year, month, 1 - i), isCurrentMonth: false });
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  return days;
};

export const Step2Availability: React.FC = () => {
  const { bookingData, updateBookingData, setBookingStep } = useApp();
  const [currentPivotDate, setCurrentPivotDate] = useState(new Date());

  // Derive days (Always Month view for patients)
  const calendarDays = useMemo(() => getDaysInMonth(currentPivotDate), [currentPivotDate]);

  // Use local date string to avoid timezone issues
  const formatDateStr = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDayClick = (date: Date) => {
    const dayOfWeek = date.getDay();
    // Block Saturday (6) and Sunday (0)
    if (dayOfWeek === 6 || dayOfWeek === 0) return;

    const dateStr = formatDateStr(date);
    const dayData = MOCK_AVAILABILITY.find(d => d.date === dateStr);
    
    if (dayData?.status === 'closed') return;
    
    updateBookingData({ selectedDate: dateStr, selectedTime: null });
  };

  const navigate = (direction: number) => {
    const newDate = new Date(currentPivotDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentPivotDate(newDate);
  };

  const selectedDayObj = MOCK_AVAILABILITY.find(d => d.date === bookingData.selectedDate);

  return (
    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-full overflow-hidden">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Seleccionar Fecha</h1>
           <p className="text-sm text-gray-500">Consulta los horarios disponibles para tu cita.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setCurrentPivotDate(new Date())}
            className="px-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg border border-primary/20 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">today</span>
            Hoy
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Calendar Section (Google Calendar Style) */}
        <div className="lg:col-span-8 bg-white p-2 md:p-6 rounded-2xl border border-gray-200 shadow-sm">
           <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-lg font-bold capitalize text-gray-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">calendar_today</span>
                {currentPivotDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors flex items-center justify-center border border-gray-100">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-gray-100 rounded-full text-primary transition-colors flex items-center justify-center border border-gray-100">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
           </div>

           <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
             {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
               <div key={day} className="bg-gray-50 p-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
             ))}
             
             {calendarDays.map((dayObj, idx) => {
               const dateStr = formatDateStr(dayObj.date);
               const isSelected = bookingData.selectedDate === dateStr;
               const isToday = dayObj.date.toDateString() === new Date().toDateString();
               const dayData = MOCK_AVAILABILITY.find(d => d.date === dateStr);
               
               const dayOfWeek = dayObj.date.getDay();
               const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
               
               const isAvailable = !isWeekend && dayData?.status === 'available';
               const isClosed = isWeekend || dayData?.status === 'closed';

               return (
                 <button
                   key={idx}
                   disabled={isClosed}
                   onClick={() => handleDayClick(dayObj.date)}
                   className={`
                     aspect-square p-2 relative flex flex-col items-center justify-center transition-all group
                     ${isClosed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
                     ${!dayObj.isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                     ${isClosed ? 'cursor-not-allowed text-gray-300' : 'cursor-pointer'}
                   `}
                 >
                   <span className={`text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full transition-all relative z-10
                     ${isSelected ? 'bg-primary text-white shadow-md' : isToday ? 'text-primary ring-1 ring-primary/30 bg-primary/5' : ''}
                   `}>
                     {dayObj.date.getDate()}
                   </span>
                   
                   {/* Availability Status Indicator - Minimalist Dot */}
                   {!isClosed && (
                     <div className="mt-1 h-1.5 flex justify-center">
                        {isSelected ? null : (
                           isAvailable ? (
                             <div className="w-1 h-1 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></div>
                           ) : (
                             <div className="w-1 h-1 rounded-full bg-red-400"></div>
                           )
                        )}
                     </div>
                   )}
                 </button>
               );
             })}
           </div>

           {/* Legend */}
           <div className="flex flex-wrap gap-4 mt-6 px-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div>Disponible</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-400"></div>Completo</div>
             <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-200"></div>Cerrado</div>
           </div>
        </div>

        {/* Time Slots Section (Centered logic handled by parent grid and flex) */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                 <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                   <span className="material-symbols-outlined text-primary text-base">schedule</span>
                   {bookingData.selectedDate 
                     ? new Date(bookingData.selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long'}) 
                     : 'Horarios Disponibles'}
                 </h3>
              </div>
              
              <div className="p-5 flex-1 min-h-[300px] overflow-y-auto scrollbar-hide">
                {!bookingData.selectedDate ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined text-3xl">touch_app</span>
                    </div>
                    <p className="text-sm font-medium">Selecciona un día en el<br/>calendario para ver las horas.</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    {/* Morning Slots */}
                    <div>
                      <div className="flex items-center gap-2 text-orange-500 mb-4 border-b border-orange-100 pb-2">
                        <span className="material-symbols-outlined text-sm">wb_sunny</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Mañana</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDayObj?.slots.filter(s => parseInt(s.time) < 14).map(slot => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => updateBookingData({ selectedTime: slot.time })}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border
                              ${!slot.available ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60' : ''}
                              ${bookingData.selectedTime === slot.time 
                                ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                        {selectedDayObj?.slots.filter(s => parseInt(s.time) < 14).length === 0 && (
                          <p className="col-span-2 text-center py-4 text-xs text-gray-400">Sin huecos por la mañana</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Afternoon Slots */}
                    <div>
                      <div className="flex items-center gap-2 text-indigo-500 mb-4 border-b border-indigo-100 pb-2">
                        <span className="material-symbols-outlined text-sm">wb_twilight</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Tarde</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDayObj?.slots.filter(s => parseInt(s.time) >= 14).map(slot => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => updateBookingData({ selectedTime: slot.time })}
                            className={`py-3 rounded-xl text-xs font-bold transition-all border
                              ${!slot.available ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60' : ''}
                              ${bookingData.selectedTime === slot.time 
                                ? 'bg-primary text-white border-primary shadow-lg scale-[1.02]' 
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary'}
                            `}
                          >
                            {slot.time}
                          </button>
                        ))}
                        {selectedDayObj?.slots.filter(s => parseInt(s.time) >= 14).length === 0 && (
                          <p className="col-span-2 text-center py-4 text-xs text-gray-400">Sin huecos por la tarde</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {bookingData.selectedTime && (
                <div className="p-4 bg-primary/5 border-t border-primary/10 animate-in slide-in-from-bottom-4 duration-300">
                   <button
                     onClick={() => setBookingStep(3)}
                     className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-all flex justify-center items-center gap-2 text-sm"
                   >
                     Continuar al Resumen
                     <span className="material-symbols-outlined">arrow_forward</span>
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center md:justify-start">
        <button onClick={() => setBookingStep(1)} className="flex items-center gap-2 text-gray-400 hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver a Configuración
        </button>
      </div>
    </div>
  );
};
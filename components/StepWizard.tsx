import React from 'react';
import { useApp } from '../context';

export const StepWizard: React.FC = () => {
  const { bookingStep } = useApp();
  
  const steps = [
    { num: 1, label: 'Configuración' },
    { num: 2, label: 'Disponibilidad' },
    { num: 3, label: 'Confirmación' },
  ];

  const percentage = Math.round((bookingStep / 3) * 100);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">
          Paso {bookingStep} de 3: {steps[bookingStep - 1].label}
        </h2>
        <span className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {percentage}% Completado
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};
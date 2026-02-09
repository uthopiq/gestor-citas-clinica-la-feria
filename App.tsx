import React from 'react';
import { useApp } from './context';
import { StepWizard } from './components/StepWizard';
import { Step1Config } from './views/Patient/Step1Config';
import { Step2Availability } from './views/Patient/Step2Availability';
import { Step3Confirmation } from './views/Patient/Step3Confirmation';
import { AdminDashboard } from './views/Admin/AdminDashboard';

const Header = ({ isAdmin }: { isAdmin: boolean }) => {
  const { logoutAdmin, currentUser } = useApp();

  return (
    <header className={`${isAdmin ? 'bg-dark-header text-white' : 'bg-white border-b border-gray-200'} h-16 px-6 md:px-10 flex items-center justify-between sticky top-0 z-50 transition-colors`}>
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-primary' : 'bg-white text-primary'}`}>
          <span className="material-symbols-outlined text-3xl">medical_services</span>
        </div>
        <h1 className={`text-xl font-bold tracking-tight ${isAdmin ? 'text-white' : 'text-dark-header'}`}>Clínica La Feria</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Navbar links removed for Patient view */}
        <div className="flex items-center gap-3">
          {isAdmin && (
             <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-semibold">{currentUser?.nombre_completo || 'Usuario'}</p>
                 <p className="text-[10px] text-slate-400 capitalize">{currentUser?.username || 'Admin'}</p>
               </div>
               {/* Image Removed as requested */}
               
               {/* Mobile Logout Button */}
               <button 
                 onClick={logoutAdmin}
                 className="flex items-center justify-center w-9 h-9 bg-gray-100 rounded-full text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm active:scale-95"
                 title="Cerrar Sesión"
               >
                  <span className="material-symbols-outlined text-lg">logout</span>
               </button>
             </div>
          )}
        </div>
      </div>
    </header>
  );
};

const PatientFlow = () => {
  const { bookingStep } = useApp();
  
  return (
    <div className="min-h-screen pb-20">
      <Header isAdmin={false} />
      <main className="px-4 md:px-10 py-8 max-w-5xl mx-auto">
        <StepWizard />
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-10 min-h-[500px]">
           {bookingStep === 1 && <Step1Config />}
           {bookingStep === 2 && <Step2Availability />}
           {bookingStep === 3 && <Step3Confirmation />}
        </div>
      </main>
      <footer className="text-center text-gray-400 text-xs py-10">
        © 2024 Clínica La Feria. Todos los derechos reservados.
      </footer>
    </div>
  );
};

const LoginScreen = () => {
  const { loginAdmin } = useApp();
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('admin');
  const [error, setError] = React.useState('');

  const handleLogin = async () => {
      const success = await loginAdmin(username, password);
      if (!success) setError('Credenciales incorrectas');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-header p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6 text-primary">
          <span className="material-symbols-outlined text-5xl">medical_services</span>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Acceso Personal</h2>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Usuario" 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-3 border border-gray-300 rounded-lg" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={handleLogin}
            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all"
          >
            Iniciar Sesión
          </button>
          {error && <p className="text-red-500 text-center text-sm font-bold">{error}</p>}
        </div>
        <p className="text-xs text-center text-gray-400 mt-6">Sistema Interno Clínica La Feria v1.0</p>
      </div>
    </div>
  );
};

export const AppContent = () => {
  const { isAdminLoggedIn } = useApp();
  const [showAdmin, setShowAdmin] = React.useState(false);

  // Simple toggle for demo purposes to switch between flows
  if (showAdmin) {
    if (!isAdminLoggedIn) return (
      <>
        <div className="fixed top-4 left-4 z-[100]">
          <button onClick={() => setShowAdmin(false)} className="text-white bg-white/20 px-3 py-1 rounded text-xs backdrop-blur-sm">← Ir a Pacientes</button>
        </div>
        <LoginScreen />
      </>
    );
    return (
      <>
        <Header isAdmin={true} />
        <AdminDashboard />
      </>
    );
  }

  return (
    <>
      <PatientFlow />
      <div className="fixed bottom-4 right-4 z-50">
        <button onClick={() => setShowAdmin(true)} className="bg-dark-header text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2">
           <span className="material-symbols-outlined text-sm">lock</span>
           Acceso Personal
        </button>
      </div>
    </>
  );
};
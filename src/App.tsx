import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900/50 shadow-2xl backdrop-blur">
        <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Proyecto Limpio
        </h1>
        <p className="text-sm text-neutral-400">
          Todo el código anterior ha sido eliminado. Listo para construir lo que necesites.
        </p>
      </div>
    </div>
  );
};

export default App;

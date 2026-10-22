import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newAlert = { id, message, type };

    setAlerts((prev) => [...prev, newAlert]);

    if (duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
    return id;
  }, [removeAlert]);

  const success = useCallback((msg, duration) => showAlert({ message: msg, type: 'success', duration }), [showAlert]);
  const error = useCallback((msg, duration) => showAlert({ message: msg, type: 'error', duration }), [showAlert]);
  const warning = useCallback((msg, duration) => showAlert({ message: msg, type: 'warning', duration }), [showAlert]);
  const info = useCallback((msg, duration) => showAlert({ message: msg, type: 'info', duration }), [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert, removeAlert, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 pointer-events-none">
        {alerts.map((alert) => {
          let bgClass = 'bg-slate-900/95 border-slate-700 text-slate-200';
          let icon = <Info className="w-5 h-5 text-cyan-400 shrink-0" />;

          if (alert.type === 'success') {
            bgClass = 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
          } else if (alert.type === 'error') {
            bgClass = 'bg-rose-950/95 border-rose-500/40 text-rose-100';
            icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          } else if (alert.type === 'warning') {
            bgClass = 'bg-amber-950/95 border-amber-500/40 text-amber-100';
            icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          }

          return (
            <div
              key={alert.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-md border ${bgClass} transition-all duration-300 animate-in fade-in slide-in-from-bottom-3`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-relaxed">
                {alert.message}
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCircleCheck, IconCircleX, IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9999]">
        <div className="flex flex-col items-center gap-4 p-4 max-w-md w-full">
          <AnimatePresence mode="multiple">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </NotificationContext.Provider>
  );
};

const NotificationItem = ({ notification }) => {
  const { message, type } = notification;

  const icons = {
    success: <IconCircleCheck className="text-emerald-500" size={28} />,
    error: <IconCircleX className="text-rose-500" size={28} />,
    info: <IconInfoCircle className="text-blue-500" size={28} />,
    warning: <IconAlertTriangle className="text-amber-500" size={28} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="
        pointer-events-auto
        relative overflow-hidden
        flex flex-col items-center text-center gap-4 px-10 py-8 rounded-[2.5rem] 
        bg-white/80 backdrop-blur-2xl border border-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)]
        min-w-[340px] max-w-md
      "
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center shadow-inner"
      >
        {icons[type] || icons.info}
      </motion.div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Notification
        </p>
        <p className="text-lg font-black text-slate-900 leading-tight tracking-tight">
          {message}
        </p>
      </div>
      
      {/* Progress bar for auto-hide */}
      <motion.div 
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 3, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-100 origin-left"
      >
        <div className={`h-full w-full ${
          type === 'success' ? 'bg-brand-primary' : 
          type === 'error' ? 'bg-rose-500' : 
          type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
        }`} />
      </motion.div>
    </motion.div>
  );
};




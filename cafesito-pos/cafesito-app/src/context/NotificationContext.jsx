import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../services/socketService';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('posNotifications') || '[]');
    } catch (error) {
      console.error('Error parsing notifications from localStorage:', error);
      return [];
    }
  });

  useEffect(() => {
    const handleOrderFinished = (orderData) => {
      setNotifications(prev => {
        // Prevent duplicate notification entries for the same order ID
        if (prev.some(n => n.orderId === orderData.orderId)) {
          return prev;
        }
        const newNotifs = [orderData, ...prev];
        localStorage.setItem('posNotifications', JSON.stringify(newNotifs));
        return newNotifs;
      });
    };

    socket.on('sync-order-finished', handleOrderFinished);
    return () => {
      socket.off('sync-order-finished', handleOrderFinished);
    };
  }, []);

  const deleteNotification = (index) => {
    setNotifications(prev => {
      const newNotifs = prev.filter((_, i) => i !== index);
      localStorage.setItem('posNotifications', JSON.stringify(newNotifs));
      return newNotifs;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('posNotifications');
  };

  const value = React.useMemo(() => ({
    notifications,
    deleteNotification,
    clearAllNotifications
  }), [notifications]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return context;
}

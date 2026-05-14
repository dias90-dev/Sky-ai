
import React, { useState, useEffect, createContext, useContext } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import NotificationContainer from './components/NotificationContainer';
import { AppView, UserSession, AppNotification, NotificationType } from './types';

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, title?: string) => void;
  removeNotify: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotify must be used within a NotificationProvider");
  return context;
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [session, setSession] = useState<UserSession | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const notify = (message: string, type: NotificationType = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => removeNotify(id), 5000);
  };

  const removeNotify = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Auto-login logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search);
    const token = params.get('t');
    if (token === 'skynet') {
      setSession({ isAdmin: true, token });
      setView(AppView.DASHBOARD);
      notify("Bem-vindo de volta, Administrador.", "success", "Auth Automática");
    }
  }, []);

  const handleLoginSuccess = (token: string) => {
    setSession({ isAdmin: true, token });
    setView(AppView.DASHBOARD);
    notify("Sessão segura estabelecida.", "success", "Acesso Concedido");
  };

  const handleLogout = () => {
    setSession(null);
    setView(AppView.LOGIN);
    notify("Sessão encerrada com sucesso.", "info", "Deslogado");
  };

  return (
    <NotificationContext.Provider value={{ notify, removeNotify }}>
      <div className="min-h-screen bg-clouds text-zinc-900 dark:text-purple-400 selection:bg-purple-900 selection:text-white relative transition-colors duration-500">
        {view === AppView.LOGIN ? (
          <Login onLogin={handleLoginSuccess} />
        ) : (
          <Dashboard onLogout={handleLogout} />
        )}
        <NotificationContainer notifications={notifications} onRemove={removeNotify} />
      </div>
    </NotificationContext.Provider>
  );
};

export default App;

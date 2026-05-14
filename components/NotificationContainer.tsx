
import React from 'react';
import { AppNotification } from '../types';

interface Props {
  notifications: AppNotification[];
  onRemove: (id: string) => void;
}

const NotificationContainer: React.FC<Props> = ({ notifications, onRemove }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`pointer-events-auto flex flex-col p-4 rounded-xl border shadow-2xl transition-all duration-300 transform translate-x-0 animate-in slide-in-from-right-full ${
            n.type === 'error' ? 'bg-zinc-950 border-red-900/50' :
            n.type === 'success' ? 'bg-zinc-950 border-purple-900/50' :
            n.type === 'warning' ? 'bg-zinc-950 border-amber-900/50' :
            'bg-zinc-950 border-zinc-800'
          }`}
        >
          <div className="flex gap-3">
            <div className="mt-0.5 shrink-0">
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  {n.title && (
                    <h4 className={`font-black text-[14px] uppercase tracking-[0.2em] mb-1 ${
                      n.type === 'error' ? 'text-red-400' :
                      n.type === 'success' ? 'text-purple-400' :
                      n.type === 'warning' ? 'text-amber-400' :
                      'text-sky-400'
                    }`}>
                      {n.title}
                    </h4>
                  )}
                  <p className="text-sm font-medium leading-relaxed text-zinc-300 opacity-90">{n.message}</p>
                </div>
                <button 
                  onClick={() => onRemove(n.id)}
                  className="ml-4 opacity-50 hover:opacity-100 transition-opacity text-zinc-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
             <div className={`h-full animate-[progress_5s_linear_forwards] ${
               n.type === 'error' ? 'bg-red-500' :
               n.type === 'success' ? 'bg-purple-500' :
               n.type === 'warning' ? 'bg-amber-500' :
               'bg-sky-500'
             }`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;

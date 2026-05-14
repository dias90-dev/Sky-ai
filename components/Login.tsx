
import React, { useState } from 'react';
import { useNotify } from '../App';
import { ApiErrorResponse } from '../types';

interface LoginProps {
  onLogin: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { notify } = useNotify();

  const mockApiLogin = async (inputPin: string): Promise<{ success: boolean; data?: string; error?: ApiErrorResponse }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (inputPin === '1234' || inputPin === 'bot123' || inputPin === '2580') {
      return { success: true, data: inputPin };
    }
    
    return {
      success: false,
      error: {
        error: {
          code: "AUTH_INVALID_CREDENTIALS",
          message: "O PIN fornecido não corresponde a nenhum protocolo Sky Ai autorizado.",
          details: { attempt_timestamp: new Date().toISOString() }
        }
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await mockApiLogin(pin);
      if (response.success && response.data) {
        onLogin(response.data);
      } else if (response.error) {
        notify(response.error.error.message, "error", "Falha de Autenticação");
      }
    } catch (err) {
      notify("Falha de rede crítica durante autenticação.", "error", "Erro do Sistema");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-2xl dark:shadow-purple-900/10 transition-colors">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full bg-purple-500 blur opacity-20 ${isLoading ? 'animate-ping' : 'animate-pulse'}`}></div>
            <div className="relative bg-zinc-100 dark:bg-black p-4 rounded-full border border-purple-500 text-purple-600 dark:text-purple-500">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 ${isLoading ? 'opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-2 tracking-tighter text-purple-600 dark:text-purple-400">Sky Ai</h1>
        <p className="text-purple-700 dark:text-purple-800 text-center mb-8 text-sm uppercase tracking-widest font-bold">Sala de Admin v4.0.1</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[14px] uppercase tracking-widest text-purple-600 dark:text-purple-700 mb-2 ml-1">PIN de Acesso</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              disabled={isLoading}
              className={`w-full bg-transparent border border-zinc-200 dark:border-purple-900/50 p-4 rounded-xl text-center text-2xl tracking-[1rem] focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all text-zinc-900 dark:text-purple-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full glass-button disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                Verificando...
              </>
            ) : "Autenticar"}
          </button>
        </form>
        
        <p className="text-purple-700/60 dark:text-purple-900/40 text-[14px] text-center mt-8 uppercase leading-relaxed font-semibold">
          Protocolo de Inteligência Proprietário<br/>
          Acesso a Nó Seguro Requerido
        </p>
      </div>
    </div>
  );
};

export default Login;

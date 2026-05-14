
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_MATCHES, LEAGUES, MARKETS, generateId } from '../constants';
import { BettingMatch, ApiErrorResponse, SystemLog, FilterCriteria } from '../types';
import LiveAssistant, { LiveAssistantHandle } from './LiveAssistant';
import { ThemeToggle } from './ThemeToggle';
import { useNotify } from '../App';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'signals' | 'terminal' | 'database'>('signals');
  const [matches, setMatches] = useState<BettingMatch[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState<FilterCriteria>({});
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const { notify } = useNotify();
  const assistantRef = useRef<LiveAssistantHandle>(null);

  // Load from local "Database" on mount
  useEffect(() => {
    const saved = localStorage.getItem('sky_ai_matches');
    if (saved) {
      setMatches(JSON.parse(saved));
    } else {
      setMatches(MOCK_MATCHES);
    }
    
    addLog("Sistema inicializado. Link criptografado estabelecido.", "info");
  }, []);

  // Save to "Database" whenever matches change
  useEffect(() => {
    if (matches.length > 0) {
      localStorage.setItem('sky_ai_matches', JSON.stringify(matches));
    }
  }, [matches]);

  const addLog = (message: string, level: SystemLog['level'] = 'info') => {
    const newLog: SystemLog = {
      id: generateId(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const generateBulkSignals = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog("Iniciando protocolo de geração em lote...", "warn");
    
    try {
      await new Promise(r => setTimeout(r, 600));
      addLog("Analisando fontes de dados regionais...", "info");
      await new Promise(r => setTimeout(r, 1000));

      const newSignals: BettingMatch[] = Array.from({ length: 20 }).map((_, i) => ({
        id: generateId(),
        league: LEAGUES[Math.floor(Math.random() * LEAGUES.length)],
        match: `Partida Alpha-${i+1} vs Beta-${i+1}`,
        market: MARKETS[Math.floor(Math.random() * MARKETS.length)],
        meta: `${Math.floor(Math.random() * 5) + 4} cartões previstos`,
        timestamp: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:00`,
        confidence: 90 + Math.random() * 10,
        status: 'pending'
      }));

      setMatches(newSignals);
      notify("Geração em lote finalizada. 20 novas entradas indexadas.", "success", "Sucesso no Protocolo");
      addLog("Indexação de sinais concluída.", "success");
    } catch (err) {
      addLog("Falha crítica no motor gerativo.", "error");
      notify("Falha ao gerar pacote. Núcleo IA offline.", "error", "Erro Fatal de Motor");
    } finally {
      setIsSyncing(false);
    }
  };

  const syncData = React.useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    addLog("Buscando vazamentos recentes...", "info");

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() < 0.05) {
            reject({ error: { code: "SYNC_ERR", message: "Sinal de uplink perdido." } });
          } else { resolve(true); }
        }, 1200);
      });

      const newMatch: BettingMatch = {
        id: generateId(),
        league: LEAGUES[Math.floor(Math.random() * LEAGUES.length)],
        match: 'Vazamento Prioritário: Underworld Derby',
        market: 'Mais de ' + (Math.floor(Math.random() * 5) + 3) + '.5 cartões',
        meta: 'Alvo Insider: Ativo',
        timestamp: 'Live',
        confidence: 100,
        status: 'pending',
        expectedGoals: (Math.random() > 0.5 ? 'Over ' : 'Under ') + '2.5',
        firstToScore: 'Visitante',
        expectedFouls: '30+',
        formTrend: 'W-W-L (C)'
      };
      
      setMatches(prev => [newMatch, ...prev].slice(0, 40));
      addLog(`Vazamento prioritário encontrado: ${newMatch.match}`, "success");
      notify("Vazamento prioritário criptografado interceptado.", "warning", "Alerta de Segurança");
    } catch (err: any) {
      addLog("Sincronização de link falhou.", "error");
      notify(err.error?.message || "Handshake de sync falhou.", "error", "Falha de Rede");
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, addLog, setMatches, notify]);

  // Auto-refresh logic
  useEffect(() => {
    const interval = setInterval(() => {
      syncData();
    }, 30000);
    return () => clearInterval(interval);
  }, [syncData]);

  const displayedMatches = useMemo(() => {
    return matches.filter(m => {
      const leagueMatch = !filter.league || m.league.toLowerCase().includes(filter.league.toLowerCase());
      const statusMatch = !filter.status || m.status === filter.status;
      return leagueMatch && statusMatch;
    });
  }, [matches, filter]);

  return (
    <div className="flex flex-col min-h-screen bg-transparent pb-32 font-sans transition-colors duration-500">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-20 p-4 flex justify-between items-center transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-[0_4px_15px_rgba(168,85,247,0.4)]">MAX</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-zinc-900 dark:text-white leading-none">Sky Ai</h1>
            <p className="text-[14px] text-purple-600 dark:text-purple-500 font-bold uppercase tracking-widest">Protocol v4.0.1_STABLE</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={onLogout} className="px-3 py-1 border border-red-900/30 text-red-500 text-[14px] uppercase font-black hover:bg-red-500/10 transition-colors rounded">Encerrar</button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex glass-panel border-b border-purple-200 dark:border-purple-900/40 sticky top-[73px] z-10 transition-colors">
        <button 
          onClick={() => setActiveTab('signals')}
          className={`flex-1 py-3 text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === 'signals' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/5 border-b-2 border-purple-500' : 'text-zinc-500 dark:text-purple-900 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
        >
          Sinais
        </button>
        <button 
          onClick={() => setActiveTab('terminal')}
          className={`flex-1 py-3 text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === 'terminal' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/5 border-b-2 border-purple-500' : 'text-zinc-500 dark:text-purple-900 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
        >
          Terminal
        </button>
        <button 
          onClick={() => setActiveTab('database')}
          className={`flex-1 py-3 text-[14px] font-black uppercase tracking-widest transition-all ${activeTab === 'database' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/5 border-b-2 border-purple-500' : 'text-zinc-500 dark:text-purple-900 hover:bg-zinc-50 dark:hover:bg-zinc-900'}`}
        >
          Banco de Dados
        </button>
      </nav>

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {activeTab === 'signals' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h2 className="text-[14px] uppercase font-black tracking-[0.3em] text-purple-800 dark:text-purple-600">Feed Ativo Verificado</h2>
                {(filter.league || filter.status) && (
                  <button 
                    onClick={() => setFilter({})}
                    className="text-[12px] text-red-500 uppercase font-black border border-red-900/30 px-1 rounded hover:bg-red-500/10"
                  >
                    Limpar Filtro
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={syncData}
                  disabled={isSyncing}
                  className="text-[12px] text-purple-500 uppercase font-black border border-purple-900/30 px-2 py-1 rounded hover:bg-purple-500/10 disabled:opacity-50"
                >
                  {isSyncing ? 'Sincronizando...' : 'Atualizar'}
                </button>
                <span className="text-[14px] text-purple-500 animate-pulse">● LIVE_FEED</span>
              </div>
            </div>

            {displayedMatches.length > 0 ? displayedMatches.map((m) => (
              <div 
                key={m.id} 
                onClick={() => setExpandedMatchId(expandedMatchId === m.id ? null : m.id)}
                className="signal-enter glass-card rounded-xl p-4 relative overflow-hidden group hover:border-purple-500 transition-all duration-300 shadow-md dark:shadow-lg cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col pr-4">
                    <span className="text-[12px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-tighter">{m.league}</span>
                    <h3 className="text-zinc-900 dark:text-white font-bold text-base leading-tight group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors uppercase tracking-tight">{m.match}</h3>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={`text-[12px] font-black px-2 py-0.5 rounded border uppercase ${
                      m.status === 'success' ? 'border-purple-500 text-purple-600 dark:text-purple-500 bg-purple-50 dark:bg-purple-500/10' :
                      m.status === 'failed' ? 'border-red-500 text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-500/10' :
                      'border-zinc-300 dark:border-purple-900/50 text-zinc-500 dark:text-purple-700 bg-zinc-50 dark:bg-transparent'
                    }`}>
                      {m.status}
                    </div>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-purple-500/50 transition-transform duration-300 ${expandedMatchId === m.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-zinc-50 dark:bg-black/60 p-2 rounded border border-zinc-100 dark:border-purple-900/10">
                    <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">Mercado Alvo</p>
                    <p className="text-[14px] font-black text-purple-700 dark:text-purple-200">{m.market}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-black/60 p-2 rounded border border-zinc-100 dark:border-purple-900/10">
                    <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">Confiança</p>
                    <p className="text-[14px] font-black text-purple-600 dark:text-purple-400">{m.confidence.toFixed(1)}%</p>
                  </div>
                </div>

                {expandedMatchId === m.id && (
                  <div className="mt-2 pt-2 border-t border-purple-100 dark:border-purple-900/20 grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded border border-purple-100 dark:border-purple-900/20">
                      <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">Exp. Goals</p>
                      <p className="text-[14px] font-black text-purple-700 dark:text-purple-200">{m.expectedGoals || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded border border-purple-100 dark:border-purple-900/20">
                      <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">1º A Marcar</p>
                      <p className="text-[14px] font-black text-purple-700 dark:text-purple-200">{m.firstToScore || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded border border-purple-100 dark:border-purple-900/20">
                      <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">Faltas Est.</p>
                      <p className="text-[14px] font-black text-purple-700 dark:text-purple-200">{m.expectedFouls || 'N/A'}</p>
                    </div>
                    <div className="bg-purple-50/50 dark:bg-purple-900/10 p-2 rounded border border-purple-100 dark:border-purple-900/20">
                      <p className="text-[12px] uppercase text-purple-700 dark:text-purple-800 font-black mb-0.5">Tendência</p>
                      <p className="text-[14px] font-black text-purple-700 dark:text-purple-200">{m.formTrend || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-purple-900/10">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    <span className="text-[14px] text-zinc-500 dark:text-purple-800 font-black uppercase">{m.timestamp}</span>
                  </div>
                  <div className="text-[14px] text-purple-600 dark:text-purple-400 font-bold italic tracking-tighter">
                    {m.meta}
                  </div>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center opacity-40">
                <p className="text-[14px] uppercase font-black tracking-widest">Nenhuma pontuação correspondente ao protocolo atual.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="glass-card rounded-xl overflow-hidden h-[60vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-zinc-100 dark:bg-purple-900/10 p-2 border-b border-zinc-200 dark:border-purple-900/30 flex items-center justify-between">
              <span className="text-[12px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-500">Motor Preditivo v2.0</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-purple-500/50"></div>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-1 font-sans text-[14px] scrollbar-hide">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-zinc-400 dark:text-purple-900 shrink-0">[{log.timestamp}]</span>
                  <span className={`${
                    log.level === 'error' ? 'text-red-500' :
                    log.level === 'warn' ? 'text-amber-500' :
                    log.level === 'success' ? 'text-purple-600 dark:text-purple-400' :
                    'text-zinc-600 dark:text-purple-700'
                  }`}>
                    {log.level.toUpperCase()}: {log.message}
                  </span>
                </div>
              ))}
              <div className="animate-pulse text-purple-500">_</div>
            </div>
            <div className="p-4 border-t border-zinc-200 dark:border-purple-900/10">
              <button 
                onClick={generateBulkSignals}
                disabled={isSyncing}
                className="w-full py-3 glass-button disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] text-[14px] rounded transition-all active:scale-95"
              >
                {isSyncing ? "EXECUTANDO PROTOCOLO..." : "FORÇAR GERAÇÃO DE 20 DIÁRIOS"}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="glass-card rounded-xl p-6 text-center shadow-md dark:shadow-none">
              <div className="mb-4 inline-block p-4 rounded-full bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.791 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.791 8-4M4 7c0-2.21 3.582-4 8-4s8 1.791 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.791-8-4" />
                </svg>
              </div>
              <h2 className="text-zinc-900 dark:text-white font-black uppercase tracking-widest text-sm mb-2">Armazenamento Local Criptografado</h2>
              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="bg-zinc-50 dark:bg-black/50 p-3 rounded border border-zinc-100 dark:border-purple-900/10">
                  <p className="text-[12px] text-purple-700 dark:text-purple-800 uppercase font-black mb-1">Registros</p>
                  <p className="text-zinc-900 dark:text-white font-bold">{matches.length}</p>
                </div>
                <div className="bg-zinc-50 dark:bg-black/50 p-3 rounded border border-zinc-100 dark:border-purple-900/10">
                  <p className="text-[12px] text-purple-700 dark:text-purple-800 uppercase font-black mb-1">Saúde</p>
                  <p className="text-purple-600 dark:text-purple-400 font-bold uppercase">Optimal</p>
                </div>
              </div>
              
              {/* Test Notification Area */}
              <div className="mt-8 border-t border-zinc-200 dark:border-purple-900/10 pt-6">
                <h3 className="text-[14px] text-purple-700 uppercase font-black mb-4 tracking-widest">Diagnóstico do Sistema (Testes de Notificação)</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => notify("O teste automatizado confirmou a integridade do sistema.", "success", "Sucesso no Diagnóstico")}
                    className="p-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 text-[12px] uppercase font-bold rounded transition-colors"
                  >
                    Teste Sucesso
                  </button>
                  <button 
                    onClick={() => notify("Terminal autorizado acessado de nó desconhecido.", "info", "Log de Segurança")}
                    className="p-2 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-900/30 text-sky-600 dark:text-sky-400 text-[12px] uppercase font-bold rounded transition-colors"
                  >
                    Teste Info
                  </button>
                  <button 
                    onClick={() => notify("Baixa latência detectada no uplink da dark-web.", "warning", "Alerta de Latência")}
                    className="p-2 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 text-[12px] uppercase font-bold rounded transition-colors"
                  >
                    Teste Aviso
                  </button>
                  <button 
                    onClick={() => notify("Handshake criptográfico falhou no nó local.", "error", "Erro de Auth Fatal")}
                    className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-[12px] uppercase font-bold rounded transition-colors"
                  >
                    Teste Erro
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  localStorage.removeItem('sky_ai_matches');
                  notify("Todos os registros locais foram triturados. Recarregando...", "warning", "Limpeza Concluída");
                  addLog("Reset de banco de dados acionado pelo administrador.", "warn");
                  setTimeout(() => window.location.reload(), 1000);
                }}
                className="mt-8 text-[14px] text-red-500 dark:text-red-900 hover:text-red-600 dark:hover:text-red-500 uppercase font-black transition-colors"
              >
                [ Limpar Cache e Recarregar ]
              </button>
            </div>
          </div>
        )}

        <footer className="mt-12 mb-8 text-center">
          <p className="text-[12px] text-zinc-500 dark:text-purple-900/60 uppercase font-black tracking-widest">&copy; {new Date().getFullYear()} Todos os direitos reservados 90 Creations</p>
        </footer>
      </main>

      <LiveAssistant ref={assistantRef} onFilter={setFilter} />
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-zinc-950 to-transparent pointer-events-none z-30">
        <div className="flex gap-3 max-w-4xl mx-auto">
          <button 
            onClick={syncData}
            disabled={isSyncing}
            className="flex-1 pointer-events-auto glass-button disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(168,85,247,0.3)] active:scale-95 transition-all uppercase tracking-[0.2em] text-[14px] sm:text-[14px]"
          >
            {isSyncing ? 'VINCULANDO...' : 'SYNC RÁPIDO DE SINAL'}
          </button>
          <button 
            onClick={() => assistantRef.current?.startSession()}
            className="flex-1 pointer-events-auto bg-zinc-900 hover:bg-zinc-800 border border-purple-500/30 text-purple-400 font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all uppercase tracking-[0.2em] text-[14px] sm:text-[14px] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            COMANDO DE VOZ
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

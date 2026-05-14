
import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { useNotify } from '../App';
import { FilterCriteria } from '../types';
import { LEAGUES } from '../constants';

interface LiveAssistantProps {
  onFilter: (criteria: FilterCriteria) => void;
}

export interface LiveAssistantHandle {
  startSession: () => Promise<void>;
}

const LiveAssistant = forwardRef<LiveAssistantHandle, LiveAssistantProps>(({ onFilter }, ref) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const { notify } = useNotify();
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useImperativeHandle(ref, () => ({
    startSession: async () => {
      if (!isActive && !isConnecting) {
        await startSession();
      }
    }
  }));

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createAudioBuffer = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const filterSignalsFunction: FunctionDeclaration = {
    name: 'filterSignals',
    parameters: {
      type: Type.OBJECT,
      description: 'Filtrar a exibição de sinais de apostas por liga ou status.',
      properties: {
        league: {
          type: Type.STRING,
          description: 'O nome da liga de futebol para filtrar (ex: PSL, BRA-B, Botola). Use null para limpar o filtro.',
        },
        status: {
          type: Type.STRING,
          description: 'O status da partida (pending, success, failed, processing). Use null para limpar o filtro.',
        },
      },
    },
  };

  const startSession = async () => {
    if (!process.env.API_KEY) {
      notify("AI Environment Key is missing. Access restricted.", "error", "Config Error");
      return;
    }

    setIsConnecting(true);
    setTranscript(["Inicializando Sky Ai Voice..."]);

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          notify("Acesso ao microfone foi negado. A Sky Ai Voice requer entrada de áudio.", "error", "Permissão Negada");
        } else {
          notify("Nenhum microfone funcional detectado neste dispositivo.", "warning", "Aviso de Hardware");
        }
        setIsConnecting(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
          },
          tools: [{ functionDeclarations: [filterSignalsFunction] }],
          systemInstruction: `Você é o Sky Ai, um assistente profissional de apostas operando em Português do Brasil. Você fornece sinais de alta precisão para cartões e handicaps. Tom: sério, de elite, técnico. 
          
          Foco principal nas seguintes ligas: Marrocos, Argélia, África do Sul, Egito, Tanzânia, Nigéria, Tunísia, Arábia Saudita, China, Coreia, Brasil, México, Argentina, EUA, Inglaterra, Alemanha, Itália, Portugal, França, Holanda, Bélgica, Escócia, Grécia, Turquia, Rússia, entre outras.
          
          Sua missão é DEVER investigar, analisar profundamente e sugerir as ligas e partidas com as MAIORES POSSIBILIDADES de apostar e vencer. Seja analítico e estratégico.
          
          Você pode filtrar a exibição do painel para o usuário usando a ferramenta filterSignals. Se um usuário pedir para ver partidas específicas de uma liga ou filtrar por status, use a ferramenta imediatamente.
          
          Ligas disponíveis: ${LEAGUES.join(', ')}. 
          Status disponíveis: pending, success, failed, processing.
          
          Quando um usuário pedir para filtrar por liga ou status, use a ferramenta filterSignals com os argumentos apropriados. Se o usuário quiser limpar o filtro, passe null para os argumentos.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setTranscript(prev => [...prev, "Conectado. Fale agora."]);
            notify("Assistente pronto para análise de voz biométrica.", "success", "Conexão IA Ativa");

            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'filterSignals') {
                  const criteria: FilterCriteria = {
                    league: fc.args.league as string | undefined,
                    status: fc.args.status as any,
                  };
                  onFilter(criteria);
                  const result = `Filtros aplicados: Liga=${criteria.league || 'Todas'}, Status=${criteria.status || 'Todos'}`;
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result },
                      }
                    });
                  });
                  notify(result, "info", "Tela Filtrada");
                }
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await createAudioBuffer(decode(audioData), ctx, 24000, 1);
              const sourceNode = ctx.createBufferSource();
              sourceNode.buffer = buffer;
              sourceNode.connect(ctx.destination);
              sourceNode.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(sourceNode);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            notify("Comunicação com o núcleo central de IA interrompida.", "error", "Falha de Conexão");
            setIsActive(false);
            setIsConnecting(false);
          },
          onclose: (e) => {
            if (e.code !== 1000) {
              notify("Sessão de IA encerrada inesperadamente.", "warning", "Sessão Encerrada");
            }
            setIsActive(false);
            setIsConnecting(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      notify("Falha crítica durante o protocolo de inicialização de IA.", "error", "Erro Fatal");
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9998]">
      <div className={`transition-all duration-500 overflow-hidden ${isActive ? 'w-64 h-80 mb-4' : 'w-0 h-0 opacity-0'}`}>
        <div className="glass-card rounded-2xl h-full p-4 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-purple-600 dark:text-purple-500 font-bold uppercase tracking-widest">Sky Ai Voice Link</span>
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-ping"></div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-hide text-[14px] font-sans">
            {transcript.map((t, i) => (
              <p key={i} className="text-zinc-600 dark:text-purple-200 opacity-80">&gt; {t}</p>
            ))}
          </div>
          <div className="h-1 bg-zinc-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 w-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
          isActive 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-purple-500 text-white border-4 border-purple-100 dark:border-black/50 hover:bg-purple-600 dark:hover:bg-purple-500'
        }`}
      >
        {isConnecting ? (
          <div className="animate-spin h-6 w-6 border-2 border-black border-t-transparent rounded-full"></div>
        ) : isActive ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
    </div>
  );
});

export default LiveAssistant;

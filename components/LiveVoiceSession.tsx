import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { connectLiveSession, encode, decode, decodeAudioData } from '../services/geminiService';

interface LiveVoiceSessionProps {
  onClose: () => void;
}

const LiveVoiceSession: React.FC<LiveVoiceSessionProps> = ({ onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const sessionRef = useRef<any>(null);
  // Fix: use any cast for refs to avoid missing Audio types in TS environment
  const inputAudioCtxRef = useRef<any>(null);
  const outputAudioCtxRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<any>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
    if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsActive(false);
    setIsListening(false);
  };

  const startSession = async () => {
    try {
      // Fix: use window prefix for AudioContext
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      inputAudioCtxRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
      // Fix: cast navigator to any to access mediaDevices if typed as WorkerNavigator
      const stream = await (navigator as any).mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = connectLiveSession({
        onopen: () => {
          setIsActive(true);
          setIsListening(true);
          const source = inputAudioCtxRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e: any) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16[i] = inputData[i] * 32768;
            }
            const pcmBase64 = encode(new Uint8Array(int16.buffer));
            sessionPromise.then(s => s.sendRealtimeInput({
              media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputAudioCtxRef.current!.destination);
        },
        onmessage: async (msg: any) => {
          const audioBase64 = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioBase64 && outputAudioCtxRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtxRef.current.currentTime);
            const buffer = await decodeAudioData(decode(audioBase64), outputAudioCtxRef.current, 24000, 1);
            const source = outputAudioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputAudioCtxRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to start voice session:", err);
      stopSession();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20}/></button>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Live Voice Studio</h2>
          <p className="text-sm text-slate-400 mb-8">Talk naturally with Aether's Native Audio API</p>

          <div className="relative flex items-center justify-center mb-12">
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-blue-500/20 rounded-full animate-ping"></div>
                <div className="w-24 h-24 bg-blue-500/30 rounded-full animate-pulse delay-75"></div>
              </div>
            )}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.6)]' : 'bg-slate-800'}`}>
              {isActive ? <Volume2 size={32} className="text-white"/> : <MicOff size={32} className="text-slate-500"/>}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {!isActive ? (
              <button onClick={startSession} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2">
                <Mic size={18}/> Start Conversation
              </button>
            ) : (
              <button onClick={stopSession} className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-xl font-bold border border-red-500/50 transition-all">
                End Session
              </button>
            )}
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Powered by Gemini 2.5 Native Audio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoiceSession;
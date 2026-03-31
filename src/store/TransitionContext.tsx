// src/store/TransitionContext.tsx
import React, { createContext, useContext, useRef, useState, useCallback } from 'react';

type Phase = 'idle' | 'loading' | 'success' | 'shutter';

type TransitionContextType = {
  phase: Phase;
  targetKey: string | null;
  targetAccent: string | null;
  triggerTransition: (key: string, accent: string, onComplete: () => void, loadMs?: number) => void;
};

const TransitionContext = createContext<TransitionContextType>({
  phase: 'idle',
  targetKey: null,
  targetAccent: null,
  triggerTransition: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase]               = useState<Phase>('idle');
  const [targetKey, setTargetKey]       = useState<string | null>(null);
  const [targetAccent, setTargetAccent] = useState<string | null>(null);
  const busy = useRef(false);

  const triggerTransition = useCallback((
    key: string,
    accent: string,
    onComplete: () => void,
    loadMs = 1300
  ) => {
    if (busy.current) return;
    busy.current = true;
    setTargetKey(key);
    setTargetAccent(accent);
    setPhase('loading');

    setTimeout(() => {
      setPhase('success');
      setTimeout(() => {
        setPhase('shutter');
        onComplete(); // ← navigate here
        setTimeout(() => {
          setPhase('idle');
          busy.current = false;
        }, 600);
      }, 820);
    }, loadMs);
  }, []);

  return (
    <TransitionContext.Provider value={{ phase, targetKey, targetAccent, triggerTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

export const useTransition = () => useContext(TransitionContext);
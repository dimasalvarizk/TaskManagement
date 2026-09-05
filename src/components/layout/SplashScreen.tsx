'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  duration = 1800,
  message,
}) => {
  const [phase, setPhase] = useState<'enter' | 'zoom' | 'done'>('enter');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Subtle, clean zoom transition timing
    const t1 = setTimeout(() => setPhase('zoom'), duration * 0.75);
    const t2 = setTimeout(() => {
      setPhase('done');
      if (onFinish) onFinish();
    }, duration);

    // Progress counter
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 25);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden select-none"
        >
          {/* Minimalist Pure Cinematic Vignette (No flashy colors) */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,#000000_75%)] pointer-events-none" />

          {/* Central Logo Container with Clean Netflix Zoom */}
          <div className="relative flex flex-col items-center justify-center z-20">
            {/* ODST Logo with Crisp Elegant Entrance */}
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={
                phase === 'zoom'
                  ? {
                      scale: 2.2,
                      opacity: 0,
                      filter: 'blur(8px)',
                    }
                  : {
                      scale: 1,
                      opacity: 1,
                      filter: 'blur(0px)',
                    }
              }
              transition={
                phase === 'zoom'
                  ? { duration: 0.5, ease: [0.7, 0, 0.84, 0] }
                  : { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              }
              className="relative mb-6 flex items-center justify-center"
            >
              <div className="p-3 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 shadow-2xl backdrop-blur-xs">
                <img
                  src="/logo.png"
                  alt="ODST Logo"
                  className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
                />
              </div>

              {/* Minimalist Subtle White Sheen */}
              <motion.div
                initial={{ x: '-150%', opacity: 0 }}
                animate={{ x: '150%', opacity: [0, 0.35, 0] }}
                transition={{ duration: 0.9, delay: 0.3, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none rounded-2xl"
              />
            </motion.div>

            {/* Clean Crisp Typography */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={
                phase === 'zoom'
                  ? { opacity: 0, scale: 1.2 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-1 text-center"
            >
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-[0.3em] uppercase font-sans">
                TASKFLOW
              </h1>
              <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
                ODST Group Indonesia
              </p>
            </motion.div>
          </div>

          {/* Minimalist Hairline Progress Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === 'zoom' ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-12 flex flex-col items-center gap-2.5 z-20"
          >
            <div className="w-44 h-[2px] bg-neutral-800/80 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{message || 'Loading Workspace...'}</span>
              <span className="text-neutral-400">({progress}%)</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

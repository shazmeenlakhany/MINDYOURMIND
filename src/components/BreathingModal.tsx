import React, { useState, useEffect } from 'react';

interface BreathingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

export const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onClose }) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsInPhase, setSecondsInPhase] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPhase('inhale');
      setSecondsInPhase(4);
      setCyclesCompleted(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsInPhase((prev) => {
        if (prev <= 1) {
          // transition phase
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold-in';
            if (currentPhase === 'hold-in') return 'exhale';
            if (currentPhase === 'exhale') return 'hold-out';
            if (currentPhase === 'hold-out') {
              setCyclesCompleted((c) => c + 1);
              return 'inhale';
            }
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const phaseInstruction = {
    inhale: 'Breathe in slowly through the nose...',
    'hold-in': 'Gently hold your breath with stillness...',
    exhale: 'Slowly release all air through the mouth...',
    'hold-out': 'Rest in empty stillness...',
  }[phase];

  const circleScale =
    phase === 'inhale'
      ? 'scale-125'
      : phase === 'hold-in'
      ? 'scale-125'
      : phase === 'exhale'
      ? 'scale-75'
      : 'scale-75';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-sm w-full shadow-2xl space-y-6 text-center relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-sm"
        >
          ✕
        </button>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Nervous System Reset
          </span>
          <h3 className="text-lg font-bold text-slate-900">Box Breathing (4-4-4-4)</h3>
          <p className="text-xs text-slate-500">
            Regulate heart-rate variability and silence mental chatter in 60 seconds.
          </p>
        </div>

        {/* Breathing Animation Canvas */}
        <div className="py-8 flex items-center justify-center relative">
          <div
            className={`w-36 h-36 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center transition-transform duration-1000 ease-in-out ${circleScale}`}
          >
            <div className="text-center">
              <div className="text-2xl font-light text-slate-900 tabular-nums">
                {secondsInPhase}s
              </div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                {phase.replace('-', ' ')}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-800 transition-all">{phaseInstruction}</p>
          <div className="text-[11px] text-slate-400 tabular-nums">
            {cyclesCompleted} / 4 cycles completed
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          Return to Focus
        </button>
      </div>
    </div>
  );
};

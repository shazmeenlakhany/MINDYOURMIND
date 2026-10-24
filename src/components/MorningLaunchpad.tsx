import React, { useState } from 'react';
import { ActionItem } from '../types';
import { soundscapes } from '../utils/soundscapes';

interface MorningLaunchpadProps {
  onStartFocus: (task: ActionItem) => void;
  onAddTask: (task: ActionItem) => void;
  onOpenDump: () => void;
  onOpenBreathing: () => void;
}

export type EnergyState = 'low' | 'medium' | 'high';

export const MorningLaunchpad: React.FC<MorningLaunchpadProps> = ({
  onStartFocus,
  onAddTask,
  onOpenDump,
  onOpenBreathing,
}) => {
  const [energy, setEnergy] = useState<EnergyState>('low');
  const [upskillTopic, setUpskillTopic] = useState('');
  const [distractionShield, setDistractionShield] = useState(true);
  const [quickTaskText, setQuickTaskText] = useState('');

  // Gentle greeting by hour
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const handleStartUpskillSprint = () => {
    const title = upskillTopic.trim() || 'Daily Upskill & Micro-Learning Block';
    const task: ActionItem = {
      id: `act-upskill-${Date.now()}`,
      title: `Upskill: ${title}`,
      priority: 'now',
      estimatedMinutes: energy === 'low' ? 10 : 20,
      microFirstStep: 'Open the course / book / video. Only commit to 3 minutes without switching tabs.',
      energyLevel: energy,
      completed: false,
      createdAt: Date.now(),
    };
    onAddTask(task);
    soundscapes.playBowlChime();
    onStartFocus(task);
  };

  const handleStartQuickTask = () => {
    if (!quickTaskText.trim()) return;
    const task: ActionItem = {
      id: `act-quick-${Date.now()}`,
      title: quickTaskText.trim(),
      priority: 'now',
      estimatedMinutes: energy === 'low' ? 10 : 25,
      microFirstStep: `Open tools and take the very first 2-minute step for: ${quickTaskText.trim().slice(0, 30)}`,
      energyLevel: energy,
      completed: false,
      createdAt: Date.now(),
    };
    onAddTask(task);
    soundscapes.playBowlChime();
    onStartFocus(task);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border border-amber-200/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      {/* Friendly Warm Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{greeting} · The Friendly Wake-Up Launchpad</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Feeling demotivated? That’s okay. We start small.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            You don't need a surge of willpower to make today count. Even 10 unhurried minutes of learning or one finished task creates quiet self-respect. Let's calibrate to your current battery.
          </p>
        </div>

        {/* 60s Breathing quick reset */}
        <button
          onClick={onOpenBreathing}
          className="self-start sm:self-center px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
        >
          <span>🌬️</span>
          <span>60s Nervous System Reset</span>
        </button>
      </div>

      {/* Step 1: Energy Calibration */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            1. How does your battery feel right now?
          </label>
          <span className="text-xs text-slate-500">
            {energy === 'low'
              ? 'Low friction mode (5-10m micro-steps)'
              : energy === 'medium'
              ? 'Steady flow mode (15-20m sprints)'
              : 'Deep dive mode (25-45m immersion)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setEnergy('low')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              energy === 'low'
                ? 'bg-amber-100/70 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🪫</span>
              <span className="text-xs font-bold">Low / Sluggish</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Brain feels heavy. We will only ask for 1 tiny 5-minute action with zero pressure.
            </p>
          </button>

          <button
            onClick={() => setEnergy('medium')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              energy === 'medium'
                ? 'bg-amber-100/70 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">🔋</span>
              <span className="text-xs font-bold">Moderate / Waking Up</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ready for a steady 15-minute learning sprint or clearing 1 core task.
            </p>
          </button>

          <button
            onClick={() => setEnergy('high')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              energy === 'high'
                ? 'bg-amber-100/70 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-400'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <span className="text-xs font-bold">Good Energy / Focused</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ready to dive deep into a challenging topic or tackle the hardest project.
            </p>
          </button>
        </div>
      </div>

      {/* Step 2: Choose Your Morning Focus (Upskill or Daily Task) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          2. What will give you peace of mind today?
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Track A: Upskill & Micro-Learning */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📚</span>
                <span className="text-xs font-bold text-slate-900">Upskill & Growth Sprint</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn 1 concept, watch 1 module, or read 5 pages before day-to-day chaos steals your attention.
              </p>
              <input
                type="text"
                value={upskillTopic}
                onChange={(e) => setUpskillTopic(e.target.value)}
                placeholder="E.g., Python tutorial, Design system guidelines, Chapter 3 of book..."
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <button
              onClick={handleStartUpskillSprint}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Start {energy === 'low' ? '10m' : '20m'} Upskill Sprint</span>
              <span>→</span>
            </button>
          </div>

          {/* Track B: Tackle 1 Daily Task */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <span className="text-xs font-bold text-slate-900">Tackle 1 Daily Responsibility</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                The single thing that, if finished, lets you exhale. We will break it into a 2-minute starter.
              </p>
              <input
                type="text"
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                placeholder="E.g., Send client proposal email, pay bill, draft project brief..."
                className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <button
              onClick={handleStartQuickTask}
              disabled={!quickTaskText.trim()}
              className="w-full py-2.5 text-xs font-semibold text-slate-900 bg-amber-300 hover:bg-amber-200 disabled:opacity-40 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Lock in & Start Single-Task Focus</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Distraction Shield Guardrails */}
      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <div>
              <span className="text-xs font-bold text-slate-100">Anti-Distraction Shield</span>
              <p className="text-[11px] text-slate-400">Protects your fragile morning momentum from dopamine traps.</p>
            </div>
          </div>
          <button
            onClick={() => setDistractionShield(!distractionShield)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
              distractionShield
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {distractionShield ? 'Shield Active' : 'Shield Off'}
          </button>
        </div>

        {distractionShield && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-slate-300 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Single browser tab only</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Phone flipped face-down</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>Park stray thoughts with [P]</span>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Escape: Brain Dump if Head is Too Full */}
      <div className="text-center pt-1 text-xs text-slate-500">
        Mind too noisy or anxious to even pick?{' '}
        <button
          onClick={onOpenDump}
          className="text-slate-900 font-semibold underline hover:text-amber-800"
        >
          Spill raw thoughts in the Brain Dump first →
        </button>
      </div>
    </div>
  );
};

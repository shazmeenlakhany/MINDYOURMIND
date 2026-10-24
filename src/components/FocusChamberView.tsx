import React, { useState, useEffect, useRef } from 'react';
import { ActionItem } from '../types';
import { soundscapes } from '../utils/soundscapes';

interface FocusChamberViewProps {
  activeTask: ActionItem | null;
  onSelectTask: (task: ActionItem | null) => void;
  availableTasks: ActionItem[];
  onCompleteTask: (taskId: string) => void;
  onOpenThoughtInterceptor: () => void;
  onSessionComplete: (durationMinutes: number) => void;
  pinnedMantra?: string;
  onOpenInspiration: () => void;
}

export const FocusChamberView: React.FC<FocusChamberViewProps> = ({
  activeTask,
  onSelectTask,
  availableTasks,
  onCompleteTask,
  onOpenThoughtInterceptor,
  onSessionComplete,
  pinnedMantra,
  onOpenInspiration,
}) => {
  // Timer states
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(25);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);

  // Soundscape state
  const [activeSound, setActiveSound] = useState<'off' | 'brown' | 'rain' | 'gamma'>('off');
  const [volume, setVolume] = useState(soundscapes.getVolume());

  const timerRef = useRef<number | null>(null);

  // Sync remaining seconds when session duration changes (and not running)
  const setTimerPreset = (minutes: number) => {
    setIsRunning(false);
    setSessionDurationMinutes(minutes);
    setSecondsRemaining(minutes * 60);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundscapes.playBowlChime();
            onSessionComplete(sessionDurationMinutes);
            setIsCompletedModalOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, sessionDurationMinutes]);

  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      soundscapes.stopSoundscape();
    };
  }, []);

  const handleToggleSound = (mode: 'brown' | 'rain' | 'gamma') => {
    if (activeSound === mode) {
      soundscapes.stopSoundscape();
      setActiveSound('off');
    } else {
      soundscapes.startSoundscape(mode);
      setActiveSound(mode);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundscapes.setVolume(newVol);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent =
    ((sessionDurationMinutes * 60 - secondsRemaining) / (sessionDurationMinutes * 60)) * 100;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Session Complete Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full shadow-xl space-y-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-900">
              <span className="text-xl">🔔</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Deep Focus Block Finished</h3>
              <p className="text-sm text-slate-600 mt-1">
                You sustained deep, single-task immersion for {sessionDurationMinutes} minutes. Give your working memory a 5-minute break.
              </p>
            </div>
            {activeTask && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 text-left">
                <span className="font-semibold text-slate-900">Focused on: </span>
                {activeTask.title}
              </div>
            )}
            <div className="flex items-center gap-3">
              {activeTask && !activeTask.completed && (
                <button
                  onClick={() => {
                    onCompleteTask(activeTask.id);
                    setIsCompletedModalOpen(false);
                    onSelectTask(null);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Mark Task Complete
                </button>
              )}
              <button
                onClick={() => {
                  setIsCompletedModalOpen(false);
                  setTimerPreset(25);
                }}
                className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Reset for Next Sprint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Single-Task Devotion</span>
            <span aria-hidden="true">·</span>
            <span>Zero Multitasking</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
            The Deep Focus Chamber
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Clarity comes from doing one thing at a time. Anchor attention on your chosen task, activate calming ambient soundscapes, and park sudden distractions without derailing flow.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={onOpenInspiration}
            className="px-3 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span>✨</span>
            <span>Need Inspiration?</span>
          </button>
          <button
            onClick={onOpenThoughtInterceptor}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span>🧠</span>
            <span>Park Stray Thought</span>
          </button>
        </div>
      </div>

      {/* Motivational Mantra Banner */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs">
          <span className="text-amber-400 text-sm">✦</span>
          <span className="font-medium text-slate-200">
            {pinnedMantra || 'Action precedes motivation. Showing up for the first 2 minutes evaporates resistance.'}
          </span>
        </div>
        <button
          onClick={onOpenInspiration}
          className="text-[11px] text-amber-300 hover:text-white font-medium hover:underline shrink-0"
        >
          Change Mantra →
        </button>
      </div>

      {/* Main Focus Console Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Timer & Active Task Focus */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Progress Bar */}
          <div
            className="absolute top-0 left-0 h-1 bg-slate-900 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Active Anchor Task Selection */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-400">Current Anchor Task</span>
            {activeTask ? (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <span>{activeTask.priority === 'now' ? 'Top Priority' : 'Next In Line'} · ~{activeTask.estimatedMinutes}m</span>
                      {activeTask.alignmentTier === 'aligned_core' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 font-bold">🎯 Aligned 1-Year Plan</span>
                        </>
                      )}
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 leading-snug">{activeTask.title}</h2>
                  </div>
                  <button
                    onClick={() => onSelectTask(null)}
                    className="text-xs text-slate-400 hover:text-slate-700 whitespace-nowrap"
                  >
                    Change
                  </button>
                </div>
                {activeTask.microFirstStep && (
                  <p className="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-800">First 2 Minutes: </span>
                    {activeTask.microFirstStep}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center space-y-3 bg-slate-50/50">
                <p className="text-xs text-slate-500">No task anchored for this sprint.</p>
                {availableTasks.length > 0 ? (
                  <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto text-left">
                    <span className="text-[11px] text-slate-400 font-medium px-1">Pick a priority to focus on:</span>
                    {availableTasks.slice(0, 4).map((t) => (
                      <button
                        key={t.id}
                        onClick={() => onSelectTask(t)}
                        className="text-xs text-slate-800 p-2 bg-white hover:bg-slate-100 rounded border border-slate-200 truncate transition-colors text-left"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Add tasks via the Brain Dump or Task Matrix first.</p>
                )}
              </div>
            )}
          </div>

          {/* Large Minimalist Timer Display */}
          <div className="py-10 text-center space-y-4">
            <div className="text-6xl sm:text-7xl font-light tracking-tighter text-slate-900 tabular-nums">
              {formatTime(secondsRemaining)}
            </div>

            {/* Presets */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { min: 2, label: '⚡ 2m Warmup' },
                { min: 10, label: '10m Sprint' },
                { min: 25, label: '25m Pomodoro' },
                { min: 50, label: '50m Deep Flow' },
              ].map((p) => (
                <button
                  key={p.min}
                  onClick={() => setTimerPreset(p.min)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    sessionDurationMinutes === p.min
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Anti-Distraction Shield status when running */}
            {isRunning && (
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-700 animate-pulse">
                <span>🛡️</span>
                <span className="font-semibold">Anti-Distraction Shield Active:</span>
                <span>Stay on this single track until the bowl chimes.</span>
              </div>
            )}
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isRunning ? 'Pause Focus' : 'Start Focus Sprint'}
            </button>
            <button
              onClick={() => setTimerPreset(sessionDurationMinutes)}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset
            </button>
            {activeTask && (
              <button
                onClick={() => {
                  onCompleteTask(activeTask.id);
                  onSelectTask(null);
                  soundscapes.playBowlChime();
                }}
                className="px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Done
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Procedural Audio Soundscapes & Visual Anchor */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambient Soundscapes Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Focus Soundscapes</h3>
                <p className="text-xs text-slate-500">Procedural audio synthesis (no downloads, zero latency).</p>
              </div>
              <span className="text-xs text-slate-400">
                {activeSound === 'off' ? 'Muted' : 'Playing'}
              </span>
            </div>

            {/* Soundscape Options */}
            <div className="space-y-2.5">
              {[
                {
                  id: 'brown' as const,
                  name: 'Brown Noise',
                  desc: 'Deep warm hum; quiets racing thoughts and ADHD distractibility.',
                },
                {
                  id: 'rain' as const,
                  name: 'Gentle Rain',
                  desc: 'Soft steady droplets to mask ambient household noise.',
                },
                {
                  id: 'gamma' as const,
                  name: '40Hz Gamma Flow',
                  desc: 'Binaural cognitive entrainment for alertness and problem solving.',
                },
              ].map((sound) => {
                const isActive = activeSound === sound.id;
                return (
                  <button
                    key={sound.id}
                    onClick={() => handleToggleSound(sound.id)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isActive
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{sound.name}</span>
                      <span className="text-[11px] opacity-80">
                        {isActive ? 'Active' : 'Play'}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {sound.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Volume Control */}
            {activeSound !== 'off' && (
              <div className="pt-2 space-y-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Soundscape Volume</span>
                  <span className="tabular-nums">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Serene Architectural Workspace Photo Anchor */}
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative h-52">
            <img
              src="/src/assets/images/ambient_sanctuary_space_1792829376727.jpg"
              alt="Quiet minimalist workspace sanctuary"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
              <p className="text-xs text-slate-200 font-medium">
                Sanctuary Principle: Protect the boundary of the current 25 minutes. Everything else can wait.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

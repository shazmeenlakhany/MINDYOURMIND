import React from 'react';

export type TabType =
  | 'declutter'
  | 'focus'
  | 'career'
  | 'coach'
  | 'compass'
  | 'matrix'
  | 'inspiration'
  | 'challenges';

interface TopNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenDumpModal: () => void;
  onOpenBreathingModal: () => void;
  level: number;
  streakDays: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenDumpModal,
  onOpenBreathingModal,
  level,
  streakDays,
}) => {
  const navItems: { id: TabType; label: string }[] = [
    { id: 'declutter', label: 'Declutter' },
    { id: 'focus', label: 'Focus Chamber' },
    { id: 'career', label: 'Career Ladder' },
    { id: 'coach', label: 'AI Mentor' },
    { id: 'compass', label: 'Compass & Tasks' },
  ];

  const isCompassFamily =
    currentTab === 'compass' ||
    currentTab === 'matrix' ||
    currentTab === 'inspiration' ||
    currentTab === 'challenges';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand single element wordmark */}
        <button
          onClick={() => onSelectTab('declutter')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-slate-900 inline-block"></span>
          <span>AuraMind</span>
        </button>

        {/* Zone 2: 5 clean single-line nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive =
              item.id === 'compass' ? isCompassFamily : currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-slate-900 font-semibold border-b-2 border-slate-900 pb-0.5'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary action + unboxed streak/level indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('career')}
            title="Career Level & Streak"
            className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs text-slate-700 hover:text-slate-900 transition-colors"
          >
            <span className="font-semibold tabular-nums">Lvl {level}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">🔥 {streakDays}d</span>
          </button>

          <button
            onClick={onOpenBreathingModal}
            title="60-second breathing pacer"
            className="hidden sm:inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            60s Breathe
          </button>

          <button
            onClick={onOpenDumpModal}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            + Brain Dump
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex items-center gap-4 px-6 py-2 overflow-x-auto border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
        {navItems.map((item) => {
          const isActive =
            item.id === 'compass' ? isCompassFamily : currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 py-1 ${
                isActive ? 'font-semibold text-slate-900 border-b border-slate-900' : 'text-slate-500'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav, TabType } from './components/TopNav';
import { BrainDumpView } from './components/BrainDumpView';
import { FocusChamberView } from './components/FocusChamberView';
import { InspirationView } from './components/InspirationView';
import { ChallengeSolverView } from './components/ChallengeSolverView';
import { DailyCompassView } from './components/DailyCompassView';
import { TaskMatrixView } from './components/TaskMatrixView';
import { CareerLadderView } from './components/CareerLadderView';
import { CoachChatView } from './components/CoachChatView';
import { BreathingModal } from './components/BreathingModal';
import { ThoughtInterceptorModal } from './components/ThoughtInterceptorModal';
import {
  ActionItem,
  CognitiveReframe,
  DayChallenge,
  ParkingLotItem,
  DailyCompass,
  InspirationSpark,
  CareerProfile,
  ChatMessage,
  Priority,
} from './types';
import { storage, calculateCareerLevel } from './utils/storage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('declutter');

  // Sub-view toggle for Compass & Tasks family
  const [utilitySubView, setUtilitySubView] = useState<'matrix' | 'compass' | 'inspiration' | 'challenges'>('matrix');

  // Persistent States
  const [actions, setActions] = useState<ActionItem[]>(() => storage.getActions());
  const [reframes, setReframes] = useState<CognitiveReframe[]>(() => storage.getReframes());
  const [challenges, setChallenges] = useState<DayChallenge[]>(() => storage.getChallenges());
  const [parkingLot, setParkingLot] = useState<ParkingLotItem[]>(() => storage.getParkingLot());
  const [compass, setCompass] = useState<DailyCompass>(() => storage.getCompass());
  const [inspirations, setInspirations] = useState<InspirationSpark[]>(() =>
    storage.getInspirations()
  );
  const [career, setCareer] = useState<CareerProfile>(() => storage.getCareerProfile());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => storage.getChatMessages());
  const [focusStats, setFocusStats] = useState(() => storage.getFocusStats());

  // Focus Chamber active task & pinned motivational mantra
  const [activeFocusTask, setActiveFocusTask] = useState<ActionItem | null>(null);
  const [pinnedMantra, setPinnedMantra] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('auramind_pinned_mantra') ||
        'Action precedes motivation. Showing up for the first 2 minutes evaporates resistance.'
      );
    } catch {
      return 'Action precedes motivation. Showing up for the first 2 minutes evaporates resistance.';
    }
  });

  // Modals
  const [isBreathingOpen, setIsBreathingOpen] = useState(false);
  const [isInterceptorOpen, setIsInterceptorOpen] = useState(false);

  // Sync to storage
  useEffect(() => {
    storage.saveActions(actions);
  }, [actions]);

  useEffect(() => {
    storage.saveReframes(reframes);
  }, [reframes]);

  useEffect(() => {
    storage.saveChallenges(challenges);
  }, [challenges]);

  useEffect(() => {
    storage.saveParkingLot(parkingLot);
  }, [parkingLot]);

  useEffect(() => {
    storage.saveCompass(compass);
  }, [compass]);

  useEffect(() => {
    storage.saveInspirations(inspirations);
  }, [inspirations]);

  useEffect(() => {
    storage.saveCareerProfile(career);
  }, [career]);

  useEffect(() => {
    storage.saveChatMessages(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    storage.saveFocusStats(focusStats);
  }, [focusStats]);

  useEffect(() => {
    try {
      localStorage.setItem('auramind_pinned_mantra', pinnedMantra);
    } catch {}
  }, [pinnedMantra]);

  // Recalculate Career level when XP updates
  useEffect(() => {
    const calc = calculateCareerLevel(career.xp);
    if (calc.level !== career.level || calc.title !== career.title) {
      setCareer((prev) => ({
        ...prev,
        level: calc.level,
        title: calc.title,
        xpToNextLevel: calc.xpToNextLevel,
      }));
    }
  }, [career.xp]);

  // Keyboard shortcut for quick breathing and thought parking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'b' || e.key === 'B') {
        setIsBreathingOpen((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setIsInterceptorOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for adding/modifying items
  const handleAddActions = (newActions: ActionItem[]) => {
    setActions((prev) => [...newActions, ...prev]);
  };

  const handleAddReframes = (newReframes: CognitiveReframe[]) => {
    setReframes((prev) => [...newReframes, ...prev]);
  };

  const handleAddChallenges = (newChallenges: DayChallenge[]) => {
    setChallenges((prev) => [...newChallenges, ...prev]);
  };

  const handleAddParking = (newItems: ParkingLotItem[]) => {
    setParkingLot((prev) => [...newItems, ...prev]);
  };

  const handleAddInspiration = (spark: InspirationSpark) => {
    setInspirations((prev) => [spark, ...prev]);
  };

  const handleToggleFavoriteInspiration = (id: string) => {
    setInspirations((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
    );
  };

  const handleDeleteInspiration = (id: string) => {
    setInspirations((prev) => prev.filter((i) => i.id !== id));
  };

  const handleStartFocusOnTask = (task: ActionItem) => {
    setActiveFocusTask(task);
    setCurrentTab('focus');
  };

  const handleToggleComplete = (id: string) => {
    setActions((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const isNowCompleted = !a.completed;
          if (isNowCompleted) {
            // Reward +15 XP for completing task
            setCareer((c) => ({
              ...c,
              xp: c.xp + 15,
              tasksCompletedTotal: c.tasksCompletedTotal + 1,
            }));
          }
          return {
            ...a,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? Date.now() : undefined,
          };
        }
        return a;
      })
    );
  };

  const handleChangePriority = (id: string, newPriority: Priority) => {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, priority: newPriority } : a))
    );
  };

  const handleDeleteAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
    if (activeFocusTask?.id === id) {
      setActiveFocusTask(null);
    }
  };

  const handleResolveChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'resolved' ? 'active' : 'resolved' }
          : c
      )
    );
  };

  const handleResolveReframe = (id: string) => {
    setReframes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, resolved: !r.resolved } : r))
    );
  };

  const handleDeleteParkingItem = (id: string) => {
    setParkingLot((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePromoteParkingToTask = (item: ParkingLotItem) => {
    const newTask: ActionItem = {
      id: `act-promoted-${Date.now()}`,
      title: item.note,
      priority: 'next',
      estimatedMinutes: 20,
      microFirstStep: `Review notes and begin: ${item.note.slice(0, 30)}`,
      energyLevel: 'medium',
      completed: false,
      createdAt: Date.now(),
    };
    setActions((prev) => [newTask, ...prev]);
    setParkingLot((prev) => prev.filter((p) => p.id !== item.id));
  };

  const handleFocusSessionComplete = (durationMinutes: number) => {
    const isUpskill = activeFocusTask?.category === 'upskill';
    const xpGained = isUpskill ? 35 : 25;

    setFocusStats((prev) => ({
      completedSessions: prev.completedSessions + 1,
      totalMinutes: prev.totalMinutes + durationMinutes,
    }));

    setCareer((prev) => {
      const newTotalFocus = prev.totalFocusMinutes + durationMinutes;
      const newTotalUpskill = isUpskill
        ? prev.totalUpskillMinutes + durationMinutes
        : prev.totalUpskillMinutes;

      // Check badge unlocks
      const updatedBadges = prev.badges.map((b) => {
        if (b.id === 'first_spark') return { ...b, unlocked: true, unlockedAt: Date.now() };
        if (b.id === 'apprentice_60' && newTotalFocus >= 60)
          return { ...b, unlocked: true, unlockedAt: Date.now() };
        if (b.id === 'upskiller_30' && newTotalUpskill >= 30)
          return { ...b, unlocked: true, unlockedAt: Date.now() };
        return b;
      });

      return {
        ...prev,
        xp: prev.xp + xpGained,
        totalFocusMinutes: newTotalFocus,
        totalUpskillMinutes: newTotalUpskill,
        badges: updatedBadges,
      };
    });
  };

  const isUtilityFamily =
    currentTab === 'compass' ||
    currentTab === 'matrix' ||
    currentTab === 'inspiration' ||
    currentTab === 'challenges';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Bar Contract Navigation */}
      <TopNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenDumpModal={() => setCurrentTab('declutter')}
        onOpenBreathingModal={() => setIsBreathingOpen(true)}
        level={career.level}
        streakDays={career.streakDays}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 pb-16">
        {currentTab === 'declutter' && (
          <BrainDumpView
            onAddActions={handleAddActions}
            onAddReframes={handleAddReframes}
            onAddChallenges={handleAddChallenges}
            onAddParking={handleAddParking}
            onStartFocusOnTask={handleStartFocusOnTask}
            onOpenBreathingModal={() => setIsBreathingOpen(true)}
          />
        )}

        {currentTab === 'focus' && (
          <FocusChamberView
            activeTask={activeFocusTask}
            onSelectTask={setActiveFocusTask}
            availableTasks={actions.filter((a) => !a.completed)}
            onCompleteTask={handleToggleComplete}
            onOpenThoughtInterceptor={() => setIsInterceptorOpen(true)}
            onSessionComplete={handleFocusSessionComplete}
            pinnedMantra={pinnedMantra}
            onOpenInspiration={() => {
              setUtilitySubView('inspiration');
              setCurrentTab('compass');
            }}
          />
        )}

        {currentTab === 'career' && (
          <CareerLadderView
            career={career}
            tasks={actions}
            onUpdateCareer={setCareer}
            onUpdateTasks={setActions}
            onStartFocusOnTask={handleStartFocusOnTask}
            onOpenDump={() => setCurrentTab('declutter')}
          />
        )}

        {currentTab === 'coach' && (
          <CoachChatView
            messages={chatMessages}
            career={career}
            onSendMessage={(msg) => setChatMessages((prev) => [...prev, msg])}
            onClearChat={() =>
              setChatMessages([
                {
                  id: `msg-${Date.now()}`,
                  role: 'assistant',
                  text: 'Conversation reset. I am ready to help you plan, upskill, or hold you accountable. What is our focus?',
                  timestamp: Date.now(),
                },
              ])
            }
          />
        )}

        {isUtilityFamily && (
          <div className="space-y-6">
            {/* Clean Segmented Sub-view Switcher */}
            <div className="max-w-6xl mx-auto px-6 pt-6 flex justify-end">
              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg text-xs">
                <button
                  onClick={() => setUtilitySubView('matrix')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    utilitySubView === 'matrix'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Task Matrix
                </button>
                <button
                  onClick={() => setUtilitySubView('compass')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    utilitySubView === 'compass'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Daily Compass
                </button>
                <button
                  onClick={() => setUtilitySubView('inspiration')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    utilitySubView === 'inspiration'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inspiration
                </button>
                <button
                  onClick={() => setUtilitySubView('challenges')}
                  className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
                    utilitySubView === 'challenges'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Challenges
                </button>
              </div>
            </div>

            {utilitySubView === 'matrix' && (
              <TaskMatrixView
                actions={actions}
                parkingLot={parkingLot}
                onToggleComplete={handleToggleComplete}
                onChangePriority={handleChangePriority}
                onDeleteAction={handleDeleteAction}
                onAddTask={(task) => setActions((prev) => [task, ...prev])}
                onFocusTask={handleStartFocusOnTask}
                onDeleteParkingItem={handleDeleteParkingItem}
                onPromoteParkingToTask={handlePromoteParkingToTask}
              />
            )}

            {utilitySubView === 'compass' && (
              <DailyCompassView
                compass={compass}
                onSaveCompass={setCompass}
                onOpenFocusChamber={() => setCurrentTab('focus')}
              />
            )}

            {utilitySubView === 'inspiration' && (
              <InspirationView
                inspirations={inspirations}
                onAddInspiration={handleAddInspiration}
                onToggleFavorite={handleToggleFavoriteInspiration}
                onDeleteInspiration={handleDeleteInspiration}
                onPinToFocus={(mantra) => {
                  setPinnedMantra(mantra);
                  setCurrentTab('focus');
                }}
                onConvertToAction={(act) => setActions((prev) => [act, ...prev])}
              />
            )}

            {utilitySubView === 'challenges' && (
              <ChallengeSolverView
                challenges={challenges}
                reframes={reframes}
                onAddChallenge={(c) => setChallenges((prev) => [c, ...prev])}
                onAddReframe={(r) => setReframes((prev) => [r, ...prev])}
                onResolveChallenge={handleResolveChallenge}
                onResolveReframe={handleResolveReframe}
                onConvertToAction={(act) => setActions((prev) => [act, ...prev])}
              />
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <BreathingModal
        isOpen={isBreathingOpen}
        onClose={() => setIsBreathingOpen(false)}
      />

      <ThoughtInterceptorModal
        isOpen={isInterceptorOpen}
        onClose={() => setIsInterceptorOpen(false)}
        onParkThought={(item) => setParkingLot((prev) => [item, ...prev])}
        onAddTask={(task) => setActions((prev) => [task, ...prev])}
      />

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-6 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">AuraMind</span>
            <span aria-hidden="true">·</span>
            <span>Clarity over Chaos</span>
            <span aria-hidden="true">·</span>
            <span>Level {career.level} ({career.title})</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="tabular-nums">
              🔥 {career.streakDays}-day streak · {career.xp} XP
            </span>
            <span aria-hidden="true">·</span>
            <span>Press [B] for Breathe, [P] for Park Thought</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

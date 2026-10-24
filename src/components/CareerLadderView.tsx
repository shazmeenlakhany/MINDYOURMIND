import React, { useState } from 'react';
import { CareerProfile, AccountabilityContract, ActionItem } from '../types';
import { calculateCareerLevel } from '../utils/storage';
import { soundscapes } from '../utils/soundscapes';

interface CareerLadderViewProps {
  career: CareerProfile;
  tasks: ActionItem[];
  onUpdateCareer: (updated: CareerProfile) => void;
  onUpdateTasks: (updatedTasks: ActionItem[]) => void;
  onStartFocusOnTask: (task: ActionItem) => void;
  onOpenDump: () => void;
}

const COMMON_FORFEITS = [
  '20 pushups or 30 bodyweight squats immediately',
  'Cold water splash to the face & 60-second wall sit',
  'Put phone in another room and no social media for 24 hours',
  'Pay $5 to the physical accountability jar or charity',
  'Write a 3-sentence honest reflection on what triggered the hesitation',
];

const COMMON_REWARDS = [
  'Guilt-free 20-minute espresso & reading break',
  'Listen to your favorite album or gaming podcast',
  'A relaxing hot shower and peaceful evening walk',
  'Watch 1 episode of favorite series with zero guilt',
  'Treat yourself to a special dinner or snack',
];

export const CareerLadderView: React.FC<CareerLadderViewProps> = ({
  career,
  tasks,
  onUpdateCareer,
  onUpdateTasks,
  onStartFocusOnTask,
  onOpenDump,
}) => {
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractTask, setContractTask] = useState('');
  const [contractDeadline, setContractDeadline] = useState('In 45 minutes');
  const [contractReward, setContractReward] = useState(COMMON_REWARDS[0]);
  const [contractForfeit, setContractForfeit] = useState(COMMON_FORFEITS[0]);

  // Goal Editing States
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editLifeGoal, setEditLifeGoal] = useState(career.lifeGoal || '');
  const [editOneYearPlan, setEditOneYearPlan] = useState(career.oneYearPlan || '');
  const [editDayGoal, setEditDayGoal] = useState(career.currentDayGoal || '');

  const [isAuditingCompliance, setIsAuditingCompliance] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const levelInfo = calculateCareerLevel(career.xp);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClaimDailyChest = () => {
    const today = new Date().toISOString().split('T')[0];
    if (career.lastActiveDate === today && (career as any).chestClaimedToday) {
      showToast('Daily clarity chest already opened today. Return tomorrow!');
      return;
    }

    soundscapes.playBowlChime();
    const newXP = career.xp + 35;
    const newStreak = career.streakDays + 1;
    const updated = {
      ...career,
      xp: newXP,
      streakDays: newStreak,
      lastActiveDate: today,
      chestClaimedToday: true,
    };
    onUpdateCareer(updated);
    showToast('Unlocked Daily Clarity Chest: +35 XP & Streak Extended!');
  };

  const handleSaveGoals = () => {
    onUpdateCareer({
      ...career,
      lifeGoal: editLifeGoal.trim() || career.lifeGoal,
      oneYearPlan: editOneYearPlan.trim() || career.oneYearPlan,
      currentDayGoal: editDayGoal.trim() || career.currentDayGoal,
    });
    setIsEditingGoals(false);
    showToast('Career Ladder goals updated!');
  };

  const handleAuditTaskCompliance = async () => {
    setIsAuditingCompliance(true);
    try {
      const res = await fetch('/api/align-career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifeGoal: career.lifeGoal,
          oneYearPlan: career.oneYearPlan,
          tasks: tasks.filter((t) => !t.completed),
        }),
      });

      const data = await res.json();

      // Update task compliance in task list
      if (Array.isArray(data.taskCompliance)) {
        const complianceMap = new Map<string, any>(
          data.taskCompliance.map((item: any) => [item.taskId, item])
        );

        const updated = tasks.map((t) => {
          const audited = complianceMap.get(t.id);
          if (audited) {
            return {
              ...t,
              alignmentTier: audited.alignmentTier,
              alignedWithGoal: audited.alignedWithGoal,
              complianceScore: audited.complianceScore,
            };
          }
          return t;
        });

        onUpdateTasks(updated);
      }

      onUpdateCareer({
        ...career,
        alignmentScorePercent: data.alignmentScorePercent || 80,
        strategicInsight: data.strategicInsight || career.strategicInsight,
        oneYearMilestones: data.oneYearMilestones || career.oneYearMilestones,
        complianceAuditedAt: Date.now(),
      });

      soundscapes.playBowlChime();
      showToast('Compliance audit complete: Tasks mapped to 1-Year Plan.');
    } catch (err) {
      console.error(err);
      showToast('Audit failed. Using local alignment rules.');
    } finally {
      setIsAuditingCompliance(false);
    }
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTask.trim()) return;

    const newContract: AccountabilityContract = {
      id: `contract-${Date.now()}`,
      task: contractTask.trim(),
      deadline: contractDeadline.trim(),
      reward: contractReward,
      forfeit: contractForfeit,
      status: 'active',
      createdAt: Date.now(),
    };

    onUpdateCareer({
      ...career,
      activeContract: newContract,
    });

    setShowContractModal(false);
    setContractTask('');
    showToast('Accountability Contract locked in! Stakes are set.');
  };

  const handleFulfillContract = () => {
    if (!career.activeContract) return;
    soundscapes.playBowlChime();
    const newXP = career.xp + 75;
    const fulfilledContract: AccountabilityContract = {
      ...career.activeContract,
      status: 'fulfilled',
      settledAt: Date.now(),
    };

    // Unlock Iron Integrity badge if not unlocked
    const updatedBadges = career.badges.map((b) =>
      b.id === 'iron_integrity' ? { ...b, unlocked: true, unlockedAt: Date.now() } : b
    );

    onUpdateCareer({
      ...career,
      xp: newXP,
      tasksCompletedTotal: career.tasksCompletedTotal + 1,
      activeContract: null,
      contractHistory: [fulfilledContract, ...career.contractHistory],
      badges: updatedBadges,
    });

    showToast('Contract Fulfilled! +75 XP earned. Claim your reward!');
  };

  const handleForfeitContract = () => {
    if (!career.activeContract) return;
    const forfeitedContract: AccountabilityContract = {
      ...career.activeContract,
      status: 'forfeited',
      settledAt: Date.now(),
    };

    onUpdateCareer({
      ...career,
      accountabilityJarForfeits: career.accountabilityJarForfeits + 1,
      activeContract: null,
      contractHistory: [forfeitedContract, ...career.contractHistory],
    });

    showToast(`Contract forfeited. Time to execute your forfeit: "${career.activeContract.forfeit}".`);
  };

  const handleStartFocusFromContract = () => {
    if (!career.activeContract) return;
    const act: ActionItem = {
      id: `act-contract-${Date.now()}`,
      title: career.activeContract.task,
      priority: 'now',
      estimatedMinutes: 25,
      microFirstStep: `Open tools and engage with contract task: ${career.activeContract.task.slice(0, 30)}`,
      energyLevel: 'high',
      completed: false,
      createdAt: Date.now(),
    };
    onStartFocusOnTask(act);
  };

  const tiers = [
    { lvl: 1, title: 'Apprentice of Focus', range: '0 - 150 XP' },
    { lvl: 2, title: 'Consistent Practitioner', range: '150 - 350 XP' },
    { lvl: 3, title: 'Deep Work Specialist', range: '350 - 650 XP' },
    { lvl: 4, title: 'Senior Strategist', range: '650 - 1050 XP' },
    { lvl: 5, title: 'Master Craftsman / Executive Mind', range: '1050+ XP' },
  ];

  const activeTasks = tasks.filter((t) => !t.completed);
  const alignedCoreTasks = activeTasks.filter((t) => t.alignmentTier === 'aligned_core');
  const maintenanceTasks = activeTasks.filter((t) => t.alignmentTier === 'maintenance');
  const driftTasks = activeTasks.filter((t) => t.alignmentTier === 'drift');

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero: The Career Ladder & Streak Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Vertical Career Alignment</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Level {levelInfo.level} ({career.title})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              The Life Goal → 1-Year Plan → Daily Compliance Ladder
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Career breakthroughs happen when today's 25-minute focus block directly moves your 1-Year Milestone, anchored in your Life Goal. Zero busywork drift.
            </p>
          </div>

          {/* Daily Streak & Chest */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-xl text-center min-w-[90px]">
              <div className="text-xl font-bold text-amber-400 tabular-nums">
                🔥 {career.streakDays}
              </div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Day Streak
              </div>
            </div>

            <button
              onClick={handleClaimDailyChest}
              className="p-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition-all shadow text-center min-w-[120px]"
            >
              <div className="text-base">🎁 +35 XP</div>
              <div className="text-[10px] uppercase tracking-wider">Daily Clarity Chest</div>
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 tabular-nums">
            <span>
              XP: {career.xp} / {levelInfo.xpToNextLevel} XP
            </span>
            <span>{levelInfo.progressPercent}% to next promotion ({levelInfo.title})</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-700"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Section 1: The 3-Tier Career Compass (Life Vision -> 1-Year Plan -> Daily Goal) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              The Alignment Hierarchy
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Where Your Daily Energy Goes (Life Goal → 1-Year Plan → Day Goal)
            </h2>
            <p className="text-xs text-slate-500">
              Every day's task list must directly serve this vertical ladder to prevent fake busywork.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingGoals ? (
              <button
                onClick={() => {
                  setEditLifeGoal(career.lifeGoal);
                  setEditOneYearPlan(career.oneYearPlan);
                  setEditDayGoal(career.currentDayGoal);
                  setIsEditingGoals(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              >
                Edit Career Hierarchy
              </button>
            ) : (
              <button
                onClick={handleSaveGoals}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Save Hierarchy
              </button>
            )}
          </div>
        </div>

        {/* 3-Tier Cards */}
        {!isEditingGoals ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tier 1: Life Goal */}
            <div className="p-5 rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tier 1: 5-10 Year Pinnacle
                </span>
                <span className="text-base">🌟</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">The Life Goal / Vision</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                "{career.lifeGoal}"
              </p>
            </div>

            {/* Tier 2: 1-Year Plan */}
            <div className="p-5 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Tier 2: 12-Month Bridge
                </span>
                <span className="text-base">🚀</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">The 1-Year Career Plan</h3>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                "{career.oneYearPlan}"
              </p>
              {career.oneYearMilestones && career.oneYearMilestones.length > 0 && (
                <ul className="text-[11px] text-slate-600 space-y-1 pt-1 border-t border-amber-200/60">
                  {career.oneYearMilestones.map((m, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold">·</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tier 3: Today's Aligned Anchor */}
            <div className="p-5 rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Tier 3: Today's Non-Negotiable
                </span>
                <span className="text-base">🎯</span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase">Today's Aligned Goal</h3>
              <p className="text-xs text-slate-900 leading-relaxed font-semibold">
                "{career.currentDayGoal || 'Define your single highest-leverage career milestone today'}"
              </p>
              <div className="text-[11px] text-emerald-700 bg-emerald-100/60 p-2 rounded">
                Must comply directly with 1-Year Milestones.
              </div>
            </div>
          </div>
        ) : (
          /* Editing Form */
          <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                1. Life Goal & Vision (Pinnacle Craft & Autonomy)
              </label>
              <textarea
                rows={2}
                value={editLifeGoal}
                onChange={(e) => setEditLifeGoal(e.target.value)}
                placeholder="What is your ultimate professional & personal vision?"
                className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                2. The 1-Year Career Plan (12-Month Bridge)
              </label>
              <textarea
                rows={2}
                value={editOneYearPlan}
                onChange={(e) => setEditOneYearPlan(e.target.value)}
                placeholder="What concrete role, skill milestones, or projects must be delivered this year?"
                className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-800">
                3. Today's Aligned Goal (The Daily Compliance Anchor)
              </label>
              <input
                type="text"
                value={editDayGoal}
                onChange={(e) => setEditDayGoal(e.target.value)}
                placeholder="The single thing today that genuinely moves your 1-year plan forward."
                className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Day-to-Day Task Compliance & Drift Audit */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <h2 className="text-base font-semibold text-slate-900">
                Task Compliance Audit: Do Your Day-to-Day Tasks Comply?
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              The AI audits your proposed tasks against your 1-Year Career Plan to eliminate fake busywork.
            </p>
          </div>

          <button
            onClick={handleAuditTaskCompliance}
            disabled={isAuditingCompliance || activeTasks.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg shadow-sm transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
          >
            {isAuditingCompliance ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Auditing Career Alignment...</span>
              </>
            ) : (
              <span>Audit Task Compliance with 1-Year Plan</span>
            )}
          </button>
        </div>

        {/* Alignment Score Meter & Strategic Coaching Insight */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="md:col-span-4 text-center md:text-left space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Daily Career Alignment Index
            </span>
            <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
              {career.alignmentScorePercent || 85}% Aligned
            </div>
            <p className="text-[11px] text-slate-500">
              {career.alignmentScorePercent >= 80
                ? 'High-leverage alignment. Energy is focused on 1-year growth.'
                : 'Warning: Busywork drift detected. Shift focus to core milestones.'}
            </p>
          </div>

          <div className="md:col-span-8 p-4 bg-white border border-slate-200/80 rounded-lg text-xs space-y-1">
            <span className="font-bold text-slate-800">Strategic Coach Insight:</span>
            <p className="text-slate-600 leading-relaxed font-normal">
              "{career.strategicInsight || 'Prioritize your top aligned craft sprint before opening your inbox or tackling administrative chores.'}"
            </p>
          </div>
        </div>

        {/* Breakdown of Tasks by Compliance */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              Current Task Compliance Status ({activeTasks.length} active)
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-semibold">{alignedCoreTasks.length} Aligned Core</span>
              <span>·</span>
              <span className="text-slate-600 font-semibold">{maintenanceTasks.length} Maintenance</span>
              <span>·</span>
              <span className="text-amber-700 font-semibold">{driftTasks.length} Drift</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {activeTasks.map((task) => {
              const isAligned = task.alignmentTier === 'aligned_core';
              const isDrift = task.alignmentTier === 'drift';
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAligned
                      ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                      : isDrift
                      ? 'border-amber-200 bg-amber-50/40 text-amber-950'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isAligned
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDrift
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isAligned ? '🎯 Aligned Core' : isDrift ? '⚠️ Potential Drift' : '⚙️ Maintenance'}
                      </span>
                      <span className="font-semibold text-slate-900">{task.title}</span>
                    </div>
                    {task.alignedWithGoal && (
                      <p className="text-[11px] text-slate-600 pl-1">
                        Impact: {task.alignedWithGoal}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onStartFocusOnTask(task)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm whitespace-nowrap transition-colors"
                    >
                      Focus Sprint →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Productivity Accountability Stakes (Reward & Punishment) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base">⚖️</span>
              <h2 className="text-base font-semibold text-slate-900">
                Accountability Stakes: Make Sure You Comply With Your Career Plan
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Demotivation dissolves when there are real stakes. Set a target task, choose your earned reward, and name a non-negotiable constructive forfeit.
            </p>
          </div>

          {!career.activeContract && (
            <button
              onClick={() => setShowContractModal(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              + Create New Accountability Stake
            </button>
          )}
        </div>

        {/* Active Contract Card */}
        {career.activeContract ? (
          <div className="p-6 bg-amber-50/70 border border-amber-300 rounded-xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Active Contract · Deadline: {career.activeContract.deadline}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  "{career.activeContract.task}"
                </h3>
              </div>
              <button
                onClick={handleStartFocusFromContract}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors whitespace-nowrap"
              >
                Focus On This Task →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  🏆 The Reward (If Fulfilled)
                </span>
                <p className="text-xs text-emerald-950 font-medium">
                  {career.activeContract.reward}
                </p>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                  ⚡ The Forfeit / Penalty (If Procrastinated)
                </span>
                <p className="text-xs text-rose-950 font-medium">
                  {career.activeContract.forfeit}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-amber-200/80">
              <button
                onClick={handleForfeitContract}
                className="px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 rounded-lg transition-colors"
              >
                I Procrastinated (Accept Forfeit)
              </button>
              <button
                onClick={handleFulfillContract}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
              >
                ✓ I Fulfilled My Commitment (+75 XP)
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              No active accountability stake right now.
            </p>
            <p className="text-[11px] text-slate-400">
              Setting real stakes triples execution probability when waking up demotivated.
            </p>
            <button
              onClick={() => setShowContractModal(true)}
              className="mt-2 text-xs font-semibold text-slate-900 underline hover:text-amber-800"
            >
              Set up a stake for today →
            </button>
          </div>
        )}
      </div>

      {/* Section 4: The 5-Tier Career Ladder Progression */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Career & Craft Mastery Tiers</h2>
          <p className="text-xs text-slate-500">
            Reflects proven endurance of deep work, daily compliance, and consistent upskilling.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {tiers.map((t) => {
            const isCurrent = levelInfo.level === t.lvl;
            const isCompleted = levelInfo.level > t.lvl;
            return (
              <div
                key={t.lvl}
                className={`p-4 rounded-xl border transition-all space-y-2 ${
                  isCurrent
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/50 text-slate-900'
                    : 'border-slate-200 bg-white text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Level {t.lvl}
                  </span>
                  {isCompleted && <span className="text-emerald-600 text-xs">✓ Done</span>}
                  {isCurrent && <span className="text-amber-400 text-xs">★ Current</span>}
                </div>
                <h3 className="text-xs font-bold leading-tight">{t.title}</h3>
                <div className="text-[10px] opacity-70 tabular-nums">{t.range}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to Set Accountability Stake */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateContract}
            className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">⚖️</span>
                <h3 className="text-base font-bold text-slate-900">Set Accountability Stakes</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  Target Task (Must comply with 1-Year Plan)
                </label>
                <input
                  type="text"
                  required
                  value={contractTask}
                  onChange={(e) => setContractTask(e.target.value)}
                  placeholder="E.g., Complete 25 minutes of Python or ship core feature draft"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">Deadline</label>
                <input
                  type="text"
                  value={contractDeadline}
                  onChange={(e) => setContractDeadline(e.target.value)}
                  placeholder="E.g., Before 2:00 PM today, or in 45 minutes"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  🏆 The Reward (If Fulfilled)
                </label>
                <select
                  value={contractReward}
                  onChange={(e) => setContractReward(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {COMMON_REWARDS.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800">
                  ⚡ The Forfeit / Penalty (If Procrastinated)
                </label>
                <select
                  value={contractForfeit}
                  onChange={(e) => setContractForfeit(e.target.value)}
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {COMMON_FORFEITS.map((f, i) => (
                    <option key={i} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowContractModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm"
              >
                Lock In Stakes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

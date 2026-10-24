import React, { useState } from 'react';
import { CognitiveReframe, DayChallenge, ActionItem } from '../types';

interface ChallengeSolverViewProps {
  challenges: DayChallenge[];
  reframes: CognitiveReframe[];
  onAddChallenge: (challenge: DayChallenge) => void;
  onAddReframe: (reframe: CognitiveReframe) => void;
  onResolveChallenge: (id: string) => void;
  onResolveReframe: (id: string) => void;
  onConvertToAction: (action: ActionItem) => void;
}

const COMMON_CHALLENGES = [
  {
    title: 'Frozen by Overwhelm',
    desc: 'Too many things to do, so I end up doing nothing.',
    prompt: 'I feel completely overwhelmed with my to-do list and paralyzed on where to begin.',
  },
  {
    title: 'Dreading a Difficult Conversation',
    desc: 'Anxious about confronting someone or delivering tough news.',
    prompt: 'I am dreading an uncomfortable conversation with a coworker/client and feel sick with anticipatory anxiety.',
  },
  {
    title: 'Imposter Syndrome / Fear of Failing',
    desc: 'Worrying that I’m not qualified or will be exposed as incompetent.',
    prompt: 'I feel like a fraud on this project and that everyone will realize I don’t know what I am doing.',
  },
  {
    title: 'Midday Energy Slump & Doomscrolling',
    desc: 'Brain feels like sludge; urge to lose 2 hours on phone.',
    prompt: 'My brain is completely drained in the afternoon and I keep instinctively opening social media or refreshing tabs.',
  },
  {
    title: 'Fear of Making the Wrong Decision',
    desc: 'Over-analyzing options and stuck in analysis paralysis.',
    prompt: 'I cannot decide which approach to take and keep obsessing over every potential mistake or risk.',
  },
];

export const ChallengeSolverView: React.FC<ChallengeSolverViewProps> = ({
  challenges,
  reframes,
  onAddChallenge,
  onAddReframe,
  onResolveChallenge,
  onResolveReframe,
  onConvertToAction,
}) => {
  const [challengeInput, setChallengeInput] = useState('');
  const [contextInput, setContextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyzeChallenge = async (customPrompt?: string) => {
    const textToAnalyze = customPrompt || challengeInput;
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/reframe-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: textToAnalyze,
          context: contextInput,
        }),
      });
      const data = await res.json();
      setActiveAnalysis(data);

      // Also create a DayChallenge entry
      const newChal: DayChallenge = {
        id: `chal-${Date.now()}`,
        challenge: textToAnalyze,
        rootFriction: data.cognitiveDistortion || 'Cognitive Friction',
        frictionBusterStrategy: data.perspectiveShift || 'Focus on micro-steps within direct control.',
        immediateNextStep: data.actionSequence?.[0] || 'Take 1 slow breath and take the atomic first action.',
        status: 'active',
        createdAt: Date.now(),
      };
      onAddChallenge(newChal);
      showToast('Challenge analyzed and structured.');
    } catch (err) {
      console.error(err);
      showToast('Error analyzing challenge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateActionFromStep = (stepText: string) => {
    const newAct: ActionItem = {
      id: `act-from-step-${Date.now()}`,
      title: stepText,
      priority: 'now',
      estimatedMinutes: 10,
      microFirstStep: stepText.slice(0, 50),
      energyLevel: 'medium',
      completed: false,
      createdAt: Date.now(),
    };
    onConvertToAction(newAct);
    showToast('Created new action item from micro-step!');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <span>Cognitive Reframing</span>
          <span aria-hidden="true">·</span>
          <span>Stoic Circle of Control & CBT</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Day-to-Day Challenge Solver
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
          Daily friction usually stems from either attempting to control the uncontrollable or anticipating mountain-sized effort. Externalize the obstacle below to uncouple emotional panic from concrete action.
        </p>
      </div>

      {/* Quick Scenario Starter Grid */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-700">Common Daily Friction Points:</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMON_CHALLENGES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setChallengeInput(item.prompt);
                handleAnalyzeChallenge(item.prompt);
              }}
              className="text-left p-3.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-sm hover:shadow transition-all space-y-1"
            >
              <div className="text-xs font-semibold text-slate-900">{item.title}</div>
              <div className="text-[11px] text-slate-500 line-clamp-2">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Challenge Input Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-slate-900">Deconstruct a Specific Challenge</h2>
        <div className="space-y-3">
          <input
            type="text"
            value={challengeInput}
            onChange={(e) => setChallengeInput(e.target.value)}
            placeholder="What challenge or mental friction are you facing right now?"
            className="w-full text-sm text-slate-800 bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
          <input
            type="text"
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            placeholder="Optional context (e.g., happening with my boss, project deadline is tomorrow, haven't slept well)"
            className="w-full text-xs text-slate-700 bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleAnalyzeChallenge()}
            disabled={isLoading || !challengeInput.trim()}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Reframing & Separating Control...</span>
              </>
            ) : (
              <span>Break Down & Reframe Challenge</span>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Output Spotlight */}
      {activeAnalysis && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs text-slate-400">Challenge Analysis</span>
              <h3 className="text-lg font-semibold text-slate-900 mt-0.5">
                "{activeAnalysis.challenge}"
              </h3>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded">
              Pattern: {activeAnalysis.cognitiveDistortion}
            </span>
          </div>

          {/* Stoic Circle of Control Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-lg space-y-1.5">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                ✓ 100% Within Your Control (Focus Energy Here)
              </div>
              <p className="text-xs text-emerald-950 leading-relaxed">
                {activeAnalysis.stoicSeparation?.withinControl}
              </p>
            </div>

            <div className="p-4 bg-slate-100 border border-slate-200 rounded-lg space-y-1.5">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                ✗ Outside Your Control (Permit Yourself to Release)
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {activeAnalysis.stoicSeparation?.outsideControl}
              </p>
            </div>
          </div>

          {/* Compassionate Perspective Shift */}
          <div className="p-4 bg-slate-900 text-white rounded-lg space-y-1">
            <span className="text-xs text-slate-400 font-medium">Cognitive Perspective Shift</span>
            <p className="text-sm text-slate-200 leading-relaxed">
              "{activeAnalysis.perspectiveShift}"
            </p>
          </div>

          {/* 3-Step Friction Buster Sequence */}
          {activeAnalysis.actionSequence && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-900">
                Action Sequence (Micro-friction path):
              </div>
              <div className="space-y-2">
                {activeAnalysis.actionSequence.map((step: string, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800">{step}</span>
                    </div>
                    <button
                      onClick={() => handleCreateActionFromStep(step)}
                      className="text-xs font-medium text-slate-900 hover:underline shrink-0"
                    >
                      + Add to Tasks
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calm Affirmation Anchor */}
          {activeAnalysis.calmAffirmation && (
            <div className="text-center py-2 text-xs text-slate-500 italic">
              — "{activeAnalysis.calmAffirmation}"
            </div>
          )}
        </div>
      )}

      {/* Existing Saved Challenges & Reframes History */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Active Challenge Log & Mental Antidotes</h2>
          <span className="text-xs text-slate-400 tabular-nums">
            {challenges.filter((c) => c.status === 'active').length} active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((item) => (
            <div
              key={item.id}
              className={`p-5 bg-white border rounded-xl shadow-sm space-y-3 transition-all ${
                item.status === 'resolved' ? 'border-slate-100 opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {item.rootFriction}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{item.challenge}</h3>
                </div>
                <button
                  onClick={() => onResolveChallenge(item.id)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    item.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {item.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                </button>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded space-y-1.5 border border-slate-100">
                <div>
                  <span className="font-semibold text-slate-700">Strategy: </span>
                  {item.frictionBusterStrategy}
                </div>
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="font-semibold text-slate-700">Next Step: </span>
                  {item.immediateNextStep}
                </div>
              </div>
            </div>
          ))}

          {reframes.map((ref) => (
            <div
              key={ref.id}
              className={`p-5 bg-white border rounded-xl shadow-sm space-y-3 transition-all ${
                ref.resolved ? 'border-slate-100 opacity-60' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {ref.cognitiveDistortion || 'Mental Reframe'}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">"{ref.worryOrObstacle}"</h3>
                </div>
                <button
                  onClick={() => onResolveReframe(ref.id)}
                  className={`text-xs px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    ref.resolved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ref.resolved ? 'Resolved' : 'Mark Resolved'}
                </button>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded space-y-1 border border-slate-100">
                <div className="text-slate-700 leading-relaxed">{ref.realityCheck}</div>
                <div className="pt-1 font-semibold text-slate-900">
                  Shift: {ref.actionableShift}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

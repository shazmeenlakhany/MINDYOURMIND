import React, { useState } from 'react';
import { ActionItem, CognitiveReframe, DayChallenge, ParkingLotItem, DeclutterResponse } from '../types';
import { MorningLaunchpad } from './MorningLaunchpad';

interface BrainDumpViewProps {
  onAddActions: (actions: ActionItem[]) => void;
  onAddReframes: (reframes: CognitiveReframe[]) => void;
  onAddChallenges: (challenges: DayChallenge[]) => void;
  onAddParking: (items: ParkingLotItem[]) => void;
  onStartFocusOnTask: (task: ActionItem) => void;
  onOpenBreathingModal: () => void;
}

const PRESET_DUMPS = [
  {
    title: 'Work Overwhelm & Looming Deadlines',
    text: `I have so much stuff to do before Friday. Need to draft the client pitch presentation, but I feel unprepared and keep delaying it. There are 23 unread emails, someone wants feedback on the Q3 roadmap, and I need to schedule the dentist. I'm worried I'll make a fool of myself in the review meeting. I also haven't had time to exercise all week and feel exhausted.`,
  },
  {
    title: 'Chaotic Morning Catch-up',
    text: `Woke up late, brain feels foggy. Urgent message from manager about budget numbers. Forgot to pay the utility bill. Also need to organize the research notes for next week's kickoff. Wondering if I should rewrite the whole proposal or just tweak it. Feel like I'm constantly reacting instead of leading.`,
  },
  {
    title: 'Interpersonal Friction & Worry',
    text: `Had a slightly tense conversation yesterday with a colleague about project ownership. Can't stop replaying what they said. Dreading the 2pm sync today. Need to finish the slide deck before then. Feel anxious that they think I'm slacking. Also need to buy groceries and fix my bike tire.`,
  },
];

export const BrainDumpView: React.FC<BrainDumpViewProps> = ({
  onAddActions,
  onAddReframes,
  onAddChallenges,
  onAddParking,
  onStartFocusOnTask,
  onOpenBreathingModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<DeclutterResponse | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleProcessDump = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/declutter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes: inputText }),
      });
      if (!res.ok) throw new Error('Failed to process thoughts');
      const data: DeclutterResponse = await res.json();
      setLastResponse(data);
      showToast('Thoughts unpacked into clarity blocks.');
    } catch (err) {
      console.error(err);
      showToast('Unable to connect to server; please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = () => {
    if (!lastResponse) return;
    if (lastResponse.actionItems?.length) onAddActions(lastResponse.actionItems);
    if (lastResponse.cognitiveReframes?.length) onAddReframes(lastResponse.cognitiveReframes);
    if (lastResponse.dayChallenges?.length) onAddChallenges(lastResponse.dayChallenges);
    if (lastResponse.parkingLot?.length) onAddParking(lastResponse.parkingLot);
    showToast('Saved all items to your workspace!');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg transition-all">
          {notification}
        </div>
      )}

      {/* Friendly Wake-Up & Upskilling Launchpad for Demotivated Days */}
      <MorningLaunchpad
        onStartFocus={onStartFocusOnTask}
        onAddTask={(task) => onAddActions([task])}
        onOpenDump={() => {
          const el = document.getElementById('raw-brain-dump-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenBreathing={onOpenBreathingModal}
      />

      {/* Hero Header */}
      <div id="raw-brain-dump-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Cognitive Unloading</span>
            <span aria-hidden="true">·</span>
            <span>Externalize Working Memory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Dump chaotic thoughts. Extract crisp direction.
          </h1>
          <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
            When your brain tries to hold multiple to-dos, subtle anxieties, and open loops at once, cognitive friction spikes. Spill everything below—messy, unfiltered, disjointed. We’ll sort it into micro-actions, cognitive reframes, and parked ideas.
          </p>
        </div>

        {/* Hero Visual Rest Anchor */}
        <div className="lg:col-span-4 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-44 shadow-sm">
          <img
            src="/src/assets/images/clarity_water_ripple_1792829375868.jpg"
            alt="Concentric calm water ripple representing mental stillness"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
            <p className="text-xs text-slate-200 font-medium">
              "You cannot calm the storm. But you can calm yourself, and the storm will pass."
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Raw Stream of Consciousness</h2>
            <p className="text-xs text-slate-500 mt-0.5">Type freely with zero formatting. Worries, tasks, feelings, open loops.</p>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500">Quick Prompts:</span>
            {PRESET_DUMPS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(preset.text)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="What's spinning in your head right now?

E.g., I have 3 deliverables due tomorrow, need to email Sarah back, feeling overwhelmed about the review, haven't walked all day, what if the project fails..."
            rows={7}
            className="w-full text-sm text-slate-800 placeholder-slate-400 bg-slate-50/60 border border-slate-200 rounded-lg p-4 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all resize-y"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400 tabular-nums">
            {inputText.trim().split(/\s+/).filter(Boolean).length} words
          </div>
          <div className="flex items-center gap-3">
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleProcessDump}
              disabled={isLoading || !inputText.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Unpacking & Structuring...</span>
                </>
              ) : (
                <span>De-Clutter & Structure Thoughts</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Parsed Clarity Results */}
      {lastResponse && (
        <div className="space-y-8 animate-fade-in">
          {/* Mental State Reflection Card */}
          <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs text-slate-400 font-medium">Cognitive Observation</span>
              <button
                onClick={handleAcceptAll}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-md transition-colors"
              >
                Add Everything to Workspace
              </button>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              "{lastResponse.mentalStateSummary}"
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Column 1: Actionable Next Steps */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">1. Actionable Next Steps</h3>
                  <p className="text-xs text-slate-500">Deconstructed micro-actions to bypass resistance.</p>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {lastResponse.actionItems?.length || 0} items
                </span>
              </div>

              <div className="space-y-3">
                {lastResponse.actionItems?.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold text-slate-800 uppercase tracking-wider text-[10px]">
                            {item.priority === 'now' ? 'Do First' : item.priority === 'next' ? 'Scheduled Next' : 'Later'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">~{item.estimatedMinutes}m</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.energyLevel} energy</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => onStartFocusOnTask(item)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                        >
                          Focus Now
                        </button>
                        <button
                          onClick={() => {
                            onAddActions([item]);
                            showToast(`Added "${item.title.slice(0, 20)}..." to tasks`);
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap"
                        >
                          + Save
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span className="font-semibold text-slate-700">2-Minute First Step: </span>
                      {item.microFirstStep}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Cognitive Reframes & Parking Lot */}
            <div className="lg:col-span-5 space-y-8">
              {/* Cognitive Reframes */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">2. Cognitive Reframing</h3>
                  <p className="text-xs text-slate-500">Untangling catastrophic or unhelpful mental loops.</p>
                </div>

                <div className="space-y-3">
                  {lastResponse.cognitiveReframes?.map((ref, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{ref.cognitiveDistortion || 'Cognitive Loop'}</span>
                        <span className="font-medium text-slate-700">
                          {ref.circleOfControl === 'in_control'
                            ? 'Within Control'
                            : ref.circleOfControl === 'influence'
                            ? 'Influence Only'
                            : 'Outside Control'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700">
                        <span className="font-medium text-slate-900">Perceived Worry: </span>
                        "{ref.worryOrObstacle}"
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                        <div className="font-medium text-slate-800">Reality Check:</div>
                        <p className="leading-relaxed">{ref.realityCheck}</p>
                        <div className="pt-1 text-slate-800">
                          <span className="font-semibold">Calm Shift: </span>
                          {ref.actionableShift}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onAddReframes([ref]);
                          showToast('Reframe saved to Challenge Solver');
                        }}
                        className="text-xs text-slate-700 hover:text-slate-900 font-medium hover:underline"
                      >
                        + Save to Mental Reframes
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parking Lot */}
              {lastResponse.parkingLot && lastResponse.parkingLot.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">3. Safe Parking Lot</h3>
                    <p className="text-xs text-slate-500">Offload from working memory so you can focus today.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    {lastResponse.parkingLot.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                        <span className="text-slate-700">{p.note}</span>
                        <span className="text-slate-400 shrink-0 ml-2">{p.reviewWhen}</span>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        onAddParking(lastResponse.parkingLot);
                        showToast('Parked items saved!');
                      }}
                      className="mt-2 text-xs font-medium text-slate-900 hover:underline"
                    >
                      Save all to Parking Lot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

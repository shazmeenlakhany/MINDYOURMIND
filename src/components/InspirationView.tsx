import React, { useState } from 'react';
import { InspirationSpark, ActionItem } from '../types';
import { soundscapes } from '../utils/soundscapes';

interface InspirationViewProps {
  inspirations: InspirationSpark[];
  onAddInspiration: (spark: InspirationSpark) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteInspiration: (id: string) => void;
  onPinToFocus: (mantra: string) => void;
  onConvertToAction: (action: ActionItem) => void;
}

const COMMON_STRUGGLES = [
  {
    label: 'Waiting for Motivation',
    desc: 'Feeling uninspired to start on a big task',
    prompt: 'I feel completely uninspired and keep waiting for motivation before starting.',
    category: 'Overcoming Inertia',
  },
  {
    label: 'Overwhelmed by Scale',
    desc: 'The project is so huge I feel frozen',
    prompt: 'The project ahead is so massive that thinking about it makes me freeze.',
    category: 'Mental Resilience',
  },
  {
    label: 'Imposter Syndrome',
    desc: 'Doubt that I am good enough or capable',
    prompt: 'I am doubting my abilities and worried I will fail or be exposed as incompetent.',
    category: 'Self-Trust',
  },
  {
    label: 'Fear of Imperfection',
    desc: 'Paralysis from wanting it to be flawless',
    prompt: 'I am paralyzed because I want the output to be perfect and fear making a mediocre draft.',
    category: 'Perfectionism Antidote',
  },
  {
    label: 'Midday Energy Slump',
    desc: 'Mental fog and urge to escape',
    prompt: 'My cognitive energy is low and I have no drive to push through the afternoon.',
    category: 'Energy & Flow',
  },
];

export const InspirationView: React.FC<InspirationViewProps> = ({
  inspirations,
  onAddInspiration,
  onToggleFavorite,
  onDeleteInspiration,
  onPinToFocus,
  onConvertToAction,
}) => {
  const [customStruggle, setCustomStruggle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSpark, setActiveSpark] = useState<InspirationSpark | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerateSpark = async (struggleText?: string, cat?: string) => {
    const promptText = struggleText || customStruggle;
    if (!promptText.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/spark-inspiration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodOrStruggle: promptText,
          category: cat || 'momentum and resilience',
        }),
      });
      const data = await res.json();
      const newSpark: InspirationSpark = {
        id: `spark-${Date.now()}`,
        quoteOrWisdom: data.quoteOrWisdom,
        author: data.author,
        philosophicalContext: data.philosophicalContext,
        groundedReflect: data.groundedReflect,
        sparkMicroAction: data.sparkMicroAction,
        affirmation: data.affirmation,
        category: cat || 'Clarity & Courage',
        savedAt: Date.now(),
        isFavorite: true,
      };
      setActiveSpark(newSpark);
      onAddInspiration(newSpark);
      soundscapes.playBowlChime();
      showToast('Clarity spark generated.');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate inspiration. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTaskFromAction = (spark: InspirationSpark) => {
    const task: ActionItem = {
      id: `act-spark-${Date.now()}`,
      title: spark.sparkMicroAction,
      priority: 'now',
      estimatedMinutes: 5,
      microFirstStep: spark.sparkMicroAction.slice(0, 45),
      energyLevel: 'low',
      completed: false,
      createdAt: Date.now(),
    };
    onConvertToAction(task);
    showToast('Added micro-action to Task Matrix!');
  };

  const filteredInspirations = inspirations.filter((item) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return item.isFavorite;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Hero Header with Dawn Imagery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>The Inspiration Sanctuary</span>
            <span aria-hidden="true">·</span>
            <span>Grounded Psychological Fuel</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 leading-tight">
            Courage, perspective, and momentum on demand.
          </h1>
          <p className="text-slate-600 text-base max-w-2xl leading-relaxed">
            True motivation isn’t artificial hype or toxic positivity. It is deep psychological grounding—understanding that resistance is natural, that action precedes motivation, and that showing up for the first two minutes changes everything.
          </p>
        </div>

        {/* Visual Anchor */}
        <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative h-44">
          <img
            src="/src/assets/images/inspirational_dawn_horizon_1792831595264.jpg"
            alt="Dawn horizon over misty mountains"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-4">
            <p className="text-xs text-slate-200 font-medium">
              "Every morning we are born again. What we do today matters most."
            </p>
          </div>
        </div>
      </div>

      {/* Spark Generator: Select or Type Current Resistance */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-slate-900">What resistance are you feeling right now?</h2>
          <p className="text-xs text-slate-500">
            Select a common cognitive hurdle or describe your exact mental friction below.
          </p>
        </div>

        {/* Quick Struggle Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMMON_STRUGGLES.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomStruggle(item.prompt);
                handleGenerateSpark(item.prompt, item.category);
              }}
              className="text-left p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-all space-y-1"
            >
              <div className="text-xs font-semibold text-slate-900">{item.label}</div>
              <div className="text-[11px] text-slate-500">{item.desc}</div>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div className="space-y-3 pt-2">
          <input
            type="text"
            value={customStruggle}
            onChange={(e) => setCustomStruggle(e.target.value)}
            placeholder="Or describe your exact friction (e.g., afraid to hit send, feeling behind everyone else...)"
            className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />

          <div className="flex justify-end">
            <button
              onClick={() => handleGenerateSpark()}
              disabled={isLoading || !customStruggle.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Synthesizing Psychological Grounding...</span>
                </>
              ) : (
                <span>Generate Grounded Spark</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Active Generated Spark Spotlight */}
      {activeSpark && (
        <div className="bg-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Grounded Insight · {activeSpark.category || 'Clarity & Courage'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onPinToFocus(activeSpark.affirmation);
                  showToast('Pinned to Focus Chamber!');
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
              >
                Pin as Focus Mantra
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <blockquote className="text-lg sm:text-xl font-medium text-slate-100 leading-snug">
              "{activeSpark.quoteOrWisdom}"
            </blockquote>
            <p className="text-xs text-slate-400 font-medium">— {activeSpark.author}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-800/80 rounded-lg space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Psychological Reality
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSpark.philosophicalContext}
              </p>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-lg space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Grounded Shift
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeSpark.groundedReflect}
              </p>
            </div>
          </div>

          <div className="p-4 bg-white/10 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                The 90-Second Momentum Starter
              </span>
              <p className="text-xs text-slate-200">{activeSpark.sparkMicroAction}</p>
            </div>
            <button
              onClick={() => handleCreateTaskFromAction(activeSpark)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-300 hover:bg-amber-200 rounded-md transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              + Add as Micro-Task
            </button>
          </div>

          <div className="text-center pt-2 text-xs text-slate-400 italic">
            Mantra: "{activeSpark.affirmation}"
          </div>
        </div>
      )}

      {/* The Inspiration Vault (Saved Sparks & Philosophy Cards) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">The Wisdom & Inspiration Vault</h2>
            <p className="text-xs text-slate-500">
              Timeless psychological principles to keep you composed through any day-to-day challenge.
            </p>
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sparks
            </button>
            <button
              onClick={() => setSelectedCategory('favorites')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === 'favorites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saved Stars ({inspirations.filter((i) => i.isFavorite).length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInspirations.map((item) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-700">{item.category || 'Wisdom'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className={`text-sm hover:scale-110 transition-transform ${
                        item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'
                      }`}
                      title={item.isFavorite ? 'Remove star' : 'Star this spark'}
                    >
                      ★
                    </button>
                    <button
                      onClick={() => onDeleteInspiration(item.id)}
                      className="text-slate-300 hover:text-slate-600 text-xs"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <blockquote className="text-sm font-semibold text-slate-900 leading-snug">
                  "{item.quoteOrWisdom}"
                </blockquote>
                <p className="text-xs text-slate-500 font-medium">— {item.author}</p>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-100 leading-relaxed">
                  {item.groundedReflect}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    onPinToFocus(item.affirmation);
                    showToast('Pinned to Focus Chamber!');
                  }}
                  className="text-slate-700 hover:text-slate-900 font-medium hover:underline text-[11px]"
                >
                  Pin as Focus Mantra
                </button>
                <button
                  onClick={() => handleCreateTaskFromAction(item)}
                  className="text-slate-900 font-medium hover:underline text-[11px]"
                >
                  + Micro-Step Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { DailyCompass } from '../types';

interface DailyCompassViewProps {
  compass: DailyCompass;
  onSaveCompass: (compass: DailyCompass) => void;
  onOpenFocusChamber: () => void;
}

export const DailyCompassView: React.FC<DailyCompassViewProps> = ({
  compass,
  onSaveCompass,
  onOpenFocusChamber,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [topPriority, setTopPriority] = useState(compass.topPriority || '');
  const [potentialPitfall, setPotentialPitfall] = useState(compass.potentialPitfall || '');
  const [lettingGoOf, setLettingGoOf] = useState(compass.lettingGoOf || '');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [eveningWin, setEveningWin] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSynthesizeCompass = async () => {
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/morning-clarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topPriority, potentialPitfall, lettingGoOf }),
      });
      const data = await res.json();
      const updated: DailyCompass = {
        ...compass,
        topPriority,
        potentialPitfall,
        lettingGoOf,
        dailyNorthStar: data.dailyNorthStar,
        obstacleArmor: data.obstacleArmor,
        lightnessAnchor: data.lightnessAnchor,
        recommendedFocusBlock: data.recommendedFocusBlock,
      };
      onSaveCompass(updated);
      setIsEditing(false);
      showToast('Daily Compass updated with clarity.');
    } catch (err) {
      console.error(err);
      showToast('Saved locally.');
      const updated: DailyCompass = {
        ...compass,
        topPriority,
        potentialPitfall,
        lettingGoOf,
      };
      onSaveCompass(updated);
      setIsEditing(false);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveEvening = () => {
    if (!eveningWin.trim()) return;
    const updated: DailyCompass = {
      ...compass,
      eveningReflection: eveningWin,
    };
    onSaveCompass(updated);
    showToast('Evening debrief saved.');
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-3">
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Intentional Priming</span>
            <span aria-hidden="true">·</span>
            <span>Morning Anchor & Evening Wind-Down</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            The Daily Clarity Compass
          </h1>
          <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
            Without an intentional daily anchor, you react to everyone else’s urgency. Answer 3 minimal priming questions to guard your attention, calibrate expectations, and finish the day in peace.
          </p>
        </div>

        {/* Visual Anchor */}
        <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm relative h-40">
          <img
            src="/src/assets/images/calm_zenith_focus_stone_1792829376194.jpg"
            alt="Zen focus stone"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-3.5">
            <p className="text-xs text-slate-200 font-medium">
              "The mind is like water. When turbulent, it's difficult to see. When calm, everything becomes clear."
            </p>
          </div>
        </div>
      </div>

      {/* Current Daily Compass Card */}
      {!isEditing ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Today’s Alignment · {compass.date}
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {compass.topPriority || 'Define your single highest priority'}
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Recalibrate Compass
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-lg space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                1. The North Star
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {compass.dailyNorthStar}
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-lg space-y-1.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                2. Obstacle Armor
              </span>
              <p className="text-xs text-amber-950 leading-relaxed font-medium">
                {compass.obstacleArmor}
              </p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-lg space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                3. Lightness Anchor
              </span>
              <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                {compass.lightnessAnchor}
              </p>
            </div>
          </div>

          {compass.recommendedFocusBlock && (
            <div className="p-3 bg-slate-900 text-white rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>⏱</span>
                <span>Recommended Rhythm: {compass.recommendedFocusBlock}</span>
              </div>
              <button
                onClick={onOpenFocusChamber}
                className="px-3 py-1 text-slate-900 bg-white hover:bg-slate-100 font-semibold rounded text-xs transition-colors"
              >
                Enter Focus Chamber
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Edit Morning Priming Form */
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">Morning Clarity Calibration</h2>
            <p className="text-xs text-slate-500">Take 60 seconds to prime your mental boundaries for today.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                1. What is the single highest leverage task today?
              </label>
              <input
                type="text"
                value={topPriority}
                onChange={(e) => setTopPriority(e.target.value)}
                placeholder="E.g., Complete the draft proposal for client review"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                2. What might derail you, and how will you respond?
              </label>
              <input
                type="text"
                value={potentialPitfall}
                onChange={(e) => setPotentialPitfall(e.target.value)}
                placeholder="E.g., Getting sucked into inbox refreshing; I will close mail until 11am"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-800">
                3. What feeling, pressure, or expectation are you releasing today?
              </label>
              <input
                type="text"
                value={lettingGoOf}
                onChange={(e) => setLettingGoOf(e.target.value)}
                placeholder="E.g., Releasing the urge to make every slide 100% perfect"
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSynthesizeCompass}
              disabled={isSynthesizing || !topPriority.trim()}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-2"
            >
              {isSynthesizing ? 'Synthesizing Alignment...' : 'Lock In Daily Compass'}
            </button>
          </div>
        </div>
      )}

      {/* Evening Wind-Down Debrief Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Evening Closure
          </span>
          <h2 className="text-base font-semibold text-slate-900 mt-0.5">
            Wind-Down Reflection & Micro-Win
          </h2>
          <p className="text-xs text-slate-500">
            Acknowledge what you moved forward so your subconscious doesn't carry work tension into the evening.
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            value={eveningWin}
            onChange={(e) => setEveningWin(e.target.value)}
            placeholder={
              compass.eveningReflection ||
              'What was 1 meaningful micro-win today? What can safely wait until tomorrow?'
            }
            rows={3}
            className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveEvening}
              disabled={!eveningWin.trim()}
              className="px-4 py-2 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-sm disabled:opacity-40"
            >
              Save Evening Closure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

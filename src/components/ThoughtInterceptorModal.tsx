import React, { useState } from 'react';
import { ParkingLotItem, ActionItem } from '../types';

interface ThoughtInterceptorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onParkThought: (item: ParkingLotItem) => void;
  onAddTask: (task: ActionItem) => void;
}

export const ThoughtInterceptorModal: React.FC<ThoughtInterceptorModalProps> = ({
  isOpen,
  onClose,
  onParkThought,
  onAddTask,
}) => {
  const [thought, setThought] = useState('');
  const [destination, setDestination] = useState<'park' | 'task'>('park');
  const [reviewWhen, setReviewWhen] = useState('Later today');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;

    if (destination === 'park') {
      const parkItem: ParkingLotItem = {
        id: `park-${Date.now()}`,
        note: thought.trim(),
        reviewWhen: reviewWhen || 'Later today',
        archived: false,
        createdAt: Date.now(),
      };
      onParkThought(parkItem);
    } else {
      const actItem: ActionItem = {
        id: `act-interceptor-${Date.now()}`,
        title: thought.trim(),
        priority: 'next',
        estimatedMinutes: 15,
        microFirstStep: `Open and resolve: ${thought.trim().slice(0, 30)}`,
        energyLevel: 'medium',
        completed: false,
        createdAt: Date.now(),
      };
      onAddTask(actItem);
    }

    setThought('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🧠</span>
            <h3 className="text-sm font-semibold text-slate-900">Thought Interceptor</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Capture sudden interruptions or loose ends in 5 seconds so your focus remains 100% intact.
        </p>

        <textarea
          autoFocus
          value={thought}
          onChange={(e) => setThought(e.target.value)}
          placeholder="What stray thought just popped into your head?

E.g., Need to pay the electric bill, or call Sarah at 3pm..."
          rows={3}
          className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white resize-none"
        />

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            type="button"
            onClick={() => setDestination('park')}
            className={`p-2 rounded-lg border text-left transition-colors ${
              destination === 'park'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-[11px]">Safe Parking Lot</div>
            <div className="text-[10px] opacity-80">Don't think about it today</div>
          </button>

          <button
            type="button"
            onClick={() => setDestination('task')}
            className={`p-2 rounded-lg border text-left transition-colors ${
              destination === 'task'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-semibold text-[11px]">Add to Tasks</div>
            <div className="text-[10px] opacity-80">Queue for later sprint</div>
          </button>
        </div>

        {destination === 'park' && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700">When to review?</label>
            <input
              type="text"
              value={reviewWhen}
              onChange={(e) => setReviewWhen(e.target.value)}
              placeholder="E.g., End of day, Tomorrow morning, Weekend"
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!thought.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm"
          >
            Offload & Resume Flow
          </button>
        </div>
      </form>
    </div>
  );
};

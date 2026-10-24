import React, { useState } from 'react';
import { ActionItem, ParkingLotItem, Priority } from '../types';

interface TaskMatrixViewProps {
  actions: ActionItem[];
  parkingLot: ParkingLotItem[];
  onToggleComplete: (id: string) => void;
  onChangePriority: (id: string, newPriority: Priority) => void;
  onDeleteAction: (id: string) => void;
  onAddTask: (task: ActionItem) => void;
  onFocusTask: (task: ActionItem) => void;
  onDeleteParkingItem: (id: string) => void;
  onPromoteParkingToTask: (item: ParkingLotItem) => void;
}

export const TaskMatrixView: React.FC<TaskMatrixViewProps> = ({
  actions,
  parkingLot,
  onToggleComplete,
  onChangePriority,
  onDeleteAction,
  onAddTask,
  onFocusTask,
  onDeleteParkingItem,
  onPromoteParkingToTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('now');
  const [newMinutes, setNewMinutes] = useState(25);
  const [newFirstStep, setNewFirstStep] = useState('');
  const [newEnergy, setNewEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<'upskill' | 'work' | 'personal'>('upskill');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const task: ActionItem = {
      id: `act-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      estimatedMinutes: Number(newMinutes) || 15,
      microFirstStep: newFirstStep.trim() || `Spend the first 2 minutes on: ${newTitle.slice(0, 30)}`,
      energyLevel: newEnergy,
      category: newCategory,
      completed: false,
      createdAt: Date.now(),
    };
    onAddTask(task);
    setNewTitle('');
    setNewFirstStep('');
    setShowAddModal(false);
  };

  const filteredActions = actions.filter((a) => {
    if (filter === 'active') return !a.completed;
    if (filter === 'completed') return a.completed;
    return true;
  });

  const nowActions = filteredActions.filter((a) => a.priority === 'now');
  const nextActions = filteredActions.filter((a) => a.priority === 'next');
  const laterActions = filteredActions.filter((a) => a.priority === 'later');

  const completedCount = actions.filter((a) => a.completed).length;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
            <span>Executive Function</span>
            <span aria-hidden="true">·</span>
            <span>Clarity Priority Matrix</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mt-1">
            Task Matrix & Working Memory
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Keep only 1–3 items in "Do First". When working memory is lean, execution speed quadruples.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active ({actions.filter((a) => !a.completed).length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-white rounded-xl border border-slate-200 p-6 max-w-lg w-full shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-semibold text-slate-900">Add Clarity Task</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="E.g., Review project proposal draft"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="now">Now (Do First)</option>
                    <option value="next">Next (Scheduled)</option>
                    <option value="later">Later (Secondary)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Est. Minutes</label>
                  <input
                    type="number"
                    min={2}
                    max={180}
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-800">Energy Level</label>
                  <select
                    value={newEnergy}
                    onChange={(e) => setNewEnergy(e.target.value as any)}
                    className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="low">Low Energy</option>
                    <option value="medium">Medium Energy</option>
                    <option value="high">High Energy</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">Focus Type</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewCategory('upskill')}
                    className={`py-1.5 px-2.5 rounded-lg border text-center transition-colors ${
                      newCategory === 'upskill'
                        ? 'bg-amber-100 border-amber-300 font-bold text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    📚 Upskill & Study
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('work')}
                    className={`py-1.5 px-2.5 rounded-lg border text-center transition-colors ${
                      newCategory === 'work'
                        ? 'bg-amber-100 border-amber-300 font-bold text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🎯 Work Deliverable
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCategory('personal')}
                    className={`py-1.5 px-2.5 rounded-lg border text-center transition-colors ${
                      newCategory === 'personal'
                        ? 'bg-amber-100 border-amber-300 font-bold text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    🌱 Daily Task
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-800">
                  2-Minute Micro First Step (Friction reducer)
                </label>
                <input
                  type="text"
                  value={newFirstStep}
                  onChange={(e) => setNewFirstStep(e.target.value)}
                  placeholder="E.g., Open the document tab and read the first paragraph"
                  className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Priority Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Section 1: Now (Do First) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">1. Now (Do First)</h2>
              <p className="text-[11px] text-slate-500">Highest leverage for today.</p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">{nowActions.length}</span>
          </div>

          <div className="space-y-3">
            {nowActions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-xs text-slate-400">No tasks in "Do First".</p>
              </div>
            ) : (
              nowActions.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onChangePriority={onChangePriority}
                  onDeleteAction={onDeleteAction}
                  onFocusTask={onFocusTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Section 2: Next (Scheduled) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">2. Next (Scheduled)</h2>
              <p className="text-[11px] text-slate-500">Follow-up items after Now.</p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">{nextActions.length}</span>
          </div>

          <div className="space-y-3">
            {nextActions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-xs text-slate-400">No tasks in "Next".</p>
              </div>
            ) : (
              nextActions.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onChangePriority={onChangePriority}
                  onDeleteAction={onDeleteAction}
                  onFocusTask={onFocusTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Section 3: Later (Secondary) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">3. Later (Secondary)</h2>
              <p className="text-[11px] text-slate-500">Non-urgent backlog.</p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">{laterActions.length}</span>
          </div>

          <div className="space-y-3">
            {laterActions.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <p className="text-xs text-slate-400">No tasks in "Later".</p>
              </div>
            ) : (
              laterActions.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onChangePriority={onChangePriority}
                  onDeleteAction={onDeleteAction}
                  onFocusTask={onFocusTask}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Safe Parking Lot Drawer */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Safe Parking Lot (Offloaded Ideas)</h2>
            <p className="text-xs text-slate-500">
              Preserved here so you don't worry about forgetting them, while keeping today's field clear.
            </p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums">{parkingLot.length} parked</span>
        </div>

        {parkingLot.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No items currently parked.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {parkingLot.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="text-slate-800 font-medium">{item.note}</div>
                  <div className="text-[11px] text-slate-400 mt-1">Review: {item.reviewWhen}</div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => onPromoteParkingToTask(item)}
                    className="text-[11px] text-slate-900 font-medium hover:underline"
                  >
                    → Move to Tasks
                  </button>
                  <button
                    onClick={() => onDeleteParkingItem(item.id)}
                    className="text-[11px] text-slate-400 hover:text-slate-700"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: ActionItem;
  onToggleComplete: (id: string) => void;
  onChangePriority: (id: string, newPriority: Priority) => void;
  onDeleteAction: (id: string) => void;
  onFocusTask: (task: ActionItem) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onChangePriority,
  onDeleteAction,
  onFocusTask,
}) => {
  return (
    <div
      className={`p-4 bg-white border rounded-lg shadow-sm transition-all space-y-2.5 ${
        task.completed ? 'border-slate-100 opacity-60 bg-slate-50/50' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="mt-1 w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="tabular-nums">~{task.estimatedMinutes}m</span>
            <span aria-hidden="true">·</span>
            <span>{task.energyLevel} energy</span>
            {task.category === 'upskill' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-800 font-semibold">📚 Upskill</span>
              </>
            )}
          </div>
          <h3
            className={`text-xs font-semibold text-slate-900 leading-snug ${
              task.completed ? 'line-through text-slate-400' : ''
            }`}
          >
            {task.title}
          </h3>
        </div>
      </div>

      {task.microFirstStep && !task.completed && (
        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
          <span className="font-semibold text-slate-700">2-Min Step: </span>
          {task.microFirstStep}
        </div>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {!task.completed && (
            <button
              onClick={() => onFocusTask(task)}
              className="text-[11px] font-medium text-slate-900 hover:bg-slate-100 px-2 py-0.5 rounded transition-colors"
            >
              Focus Sprint
            </button>
          )}
          <select
            value={task.priority}
            onChange={(e) => onChangePriority(task.id, e.target.value as Priority)}
            className="text-[11px] text-slate-500 bg-transparent hover:text-slate-900 cursor-pointer"
          >
            <option value="now">Now</option>
            <option value="next">Next</option>
            <option value="later">Later</option>
          </select>
        </div>

        <button
          onClick={() => onDeleteAction(task.id)}
          className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

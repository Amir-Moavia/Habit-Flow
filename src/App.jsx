import React, { useState, useEffect } from 'react';
import { Plus, X, LayoutGrid, CalendarRange } from 'lucide-react';
import HabitGrid from './components/HabitGrid';
import Dashboard from './components/Dashboard';
import HeatmapView from './components/HeatmapView';
import { cn } from './lib/utils';

// Helper for local storage
const useStickyState = (defaultValue, key) => {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`Error parsing localStorage for key "${key}":`, error);
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};

function App() {
  const [habits, setHabits] = useStickyState([
    { id: 1, name: 'Morning Jog', color: 'bg-pastel-red' },
    { id: 2, name: 'Read 30 mins', color: 'bg-pastel-blue' },
    { id: 3, name: 'Drink Water', color: 'bg-pastel-green' },
    { id: 4, name: 'Meditation', color: 'bg-pastel-purple' },
    { id: 5, name: 'Coding', color: 'bg-pastel-yellow' },
  ], 'habitflow-habits');

  // Ensure habits is an array (failsafe for corrupted localstorage)
  const safeHabits = Array.isArray(habits) ? habits : [];

  const [logs, setLogs] = useStickyState({}, 'habitflow-logs');
  const [moods, setMoods] = useStickyState({}, 'habitflow-moods');

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const toggleHabit = (habitId, date) => {
    setLogs(prev => {
      const dateLogs = prev[date] || {};
      const newStatus = !dateLogs[habitId];
      return {
        ...prev,
        [date]: {
          ...dateLogs,
          [habitId]: newStatus
        }
      };
    });
  };

  const setMood = (date, mood) => {
    setMoods(prev => ({
      ...prev,
      [date]: mood
    }));
  };

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const colors = ['bg-pastel-red', 'bg-pastel-blue', 'bg-pastel-green', 'bg-pastel-purple', 'bg-pastel-yellow'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newHabit = {
      id: Date.now(),
      name: newHabitName,
      color: randomColor
    };

    setHabits([...safeHabits, newHabit]);
    setNewHabitName('');
    setIsAdding(false);
  };

  const deleteHabit = (id) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(safeHabits.filter(h => h.id !== id));
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());

  // Streak Calculation
  const streakData = React.useMemo(() => {
    const data = {};
    safeHabits.forEach(habit => {
      // Get all completed dates for this habit
      const completedDates = Object.keys(logs)
        .filter(date => logs[date]?.[habit.id])
        .sort((a, b) => new Date(a) - new Date(b));

      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      // Calculate Best Streak
      // Iterate through sorted dates and find longest sequence
      for (let i = 0; i < completedDates.length; i++) {
        const currentDate = new Date(completedDates[i]);
        const prevDate = i > 0 ? new Date(completedDates[i - 1]) : null;

        if (prevDate) {
          const diff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);
          if (diff === 1) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      }

      // Calculate Current Streak
      // Check backwards from today/yesterday
      const todayKey = new Date().toISOString().split('T')[0];
      const yesterdayKey = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let checkDate = new Date();
      // If today is not done, check if yesterday was done to keep streak alive
      if (!logs[todayKey]?.[habit.id] && !logs[yesterdayKey]?.[habit.id]) {
        currentStreak = 0;
      } else {
        // Iterate backwards to count streak
        // Optimization: Simple loop backwards from today
        let streakCount = 0;
        if (logs[todayKey]?.[habit.id]) streakCount = 1;

        // Check consecutive past days
        // Note: This is a simplified check. Ideally we iterate backwards day by day.
        // Since we have `completedDates`, we can check the end of the array.
        // But strict "consecutive days" requires checking day - 1.

        let d = new Date();
        if (!logs[todayKey]?.[habit.id]) d.setDate(d.getDate() - 1); // Start from yesterday if today not done

        while (true) {
          // We already counted the start day if applicable.
          // Wait, the while loop approach is better:
          // Start from Today. If logs[today], count++. Else if logs[yesterday], count starts there.
          break;
        }

        // Cleaner Approach for Current Streak:
        // 1. Determine start date (Today or Yesterday)
        let pointer = new Date();
        const todayStr = pointer.toISOString().split('T')[0];

        if (!logs[todayStr]?.[habit.id]) {
          pointer.setDate(pointer.getDate() - 1);
        }

        while (true) {
          const pStr = pointer.toISOString().split('T')[0];
          if (logs[pStr]?.[habit.id]) {
            currentStreak++;
            pointer.setDate(pointer.getDate() - 1);
          } else {
            break;
          }
        }
      }

      data[habit.id] = { current: currentStreak, best: bestStreak };
    });
    return data;
  }, [logs, safeHabits]);

  const exportData = () => {
    const data = { habits: safeHabits, logs, moods };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'heatmap'

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-brand-100 selection:text-brand-900 relative">

      {/* Premium Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Ambient Mesh Gradients */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-brand-400/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-multiply" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3 mix-blend-multiply" />
      </div>

      <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-12 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">HabitFlow</h1>
            <p className="text-slate-500 font-medium">Master your routine, one day at a time.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle - Professional Segmented Control */}
            <div className="bg-white/80 backdrop-blur-sm p-1 rounded-lg flex items-center border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-semibold",
                  viewMode === 'grid'
                    ? "bg-slate-100/80 text-slate-900 shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('heatmap')}
                className={cn(
                  "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-semibold",
                  viewMode === 'heatmap'
                    ? "bg-slate-100/80 text-slate-900 shadow-sm ring-1 ring-slate-900/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                )}
                title="Yearly Heatmap"
              >
                <CalendarRange size={16} />
              </button>
            </div>

            {isAdding ? (
              <form onSubmit={addHabit} className="flex items-center gap-2 animate-in slide-in-from-right duration-200">
                <input
                  autoFocus
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="Habit name..."
                  className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-48 shadow-sm bg-white/80 backdrop-blur-sm"
                />
                <button
                  type="submit"
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors shadow-sm shadow-brand-200"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </form>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={exportData}
                  className="flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-600 px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm font-semibold hover:bg-white hover:border-slate-300 transition-all"
                >
                  Export
                </button>
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg border border-transparent shadow-sm shadow-brand-200 text-sm font-bold hover:bg-brand-700 transition-all"
                >
                  <Plus size={16} />
                  New Habit
                </button>
              </div>
            )}
          </div>
        </header>

        <Dashboard
          logs={logs}
          habits={safeHabits}
          moods={moods}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <main className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {viewMode === 'grid' ? (
            <HabitGrid
              habits={safeHabits}
              logs={logs}
              moods={moods}
              currentDate={currentDate}
              streakData={streakData}
              onToggle={toggleHabit}
              onSetMood={setMood}
              onDeleteHabit={deleteHabit}
            />
          ) : (
            <HeatmapView
              logs={logs}
              habits={safeHabits}
              year={currentDate.getFullYear()}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App;

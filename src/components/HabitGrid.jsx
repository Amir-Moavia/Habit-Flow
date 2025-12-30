import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getWeek } from 'date-fns';
import { cn } from '../lib/utils';
import { Check, Smile, Meh, Frown, Sunrise, Sunset, X, Flame } from 'lucide-react';

export default function HabitGrid({ habits, logs, moods, currentDate, streakData, onToggle, onSetMood, onDeleteHabit }) {
    const today = currentDate; // Use passed date as reference
    const [isFocused, setIsFocused] = useState(false);

    const days = useMemo(() => {
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        return eachDayOfInterval({ start, end });
    }, [today]);

    // Apply Focus Mode filter
    const visibleDays = useMemo(() => {
        if (isFocused) {
            const actualToday = new Date();
            // Try to find "Today" in the current month view
            const todayInView = days.find(d => isSameDay(d, actualToday));
            return todayInView ? [todayInView] : [days[0]]; // Fallback to first day if today not in view
        }
        return days;
    }, [days, isFocused]);

    const weeks = useMemo(() => {
        const weeksMap = {};
        visibleDays.forEach(day => {
            const weekNum = getWeek(day);
            if (!weeksMap[weekNum]) weeksMap[weekNum] = [];
            weeksMap[weekNum].push(day);
        });
        return Object.entries(weeksMap).sort((a, b) => a[0] - b[0]);
    }, [visibleDays]);

    // Calculate daily totals for the top summary rows
    const dailyTotals = useMemo(() => {
        return visibleDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const totalCompleted = habits.reduce((acc, habit) => {
                return acc + (logs[dateKey]?.[habit.id] ? 1 : 0);
            }, 0);
            return {
                date: dateKey,
                completed: totalCompleted,
                notCompleted: habits.length - totalCompleted,
                percentage: habits.length > 0 ? Math.round((totalCompleted / habits.length) * 100) : 0
            };
        });
    }, [visibleDays, habits, logs]);

    const [activeMoodPopup, setActiveMoodPopup] = useState(null);

    const moodOptions = [
        { icon: Smile, label: 'Happy', color: 'text-emerald-500' },
        { icon: Sunrise, label: 'Energetic', color: 'text-yellow-500' },
        { icon: Meh, label: 'Neutral', color: 'text-slate-400' },
        { icon: Sunset, label: 'Relaxed', color: 'text-purple-400' },
        { icon: Frown, label: 'Stressed', color: 'text-rose-400' },
    ];

    return (
        <div className="relative overflow-x-auto pb-12 bg-white rounded-lg shadow-sm">
            {/* Focus Mode Toggle (Absolute Positioned or in Header) */}
            <div className="absolute top-2 right-2 z-40">
                <button
                    onClick={() => setIsFocused(!isFocused)}
                    className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm border",
                        isFocused
                            ? "bg-slate-800 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                >
                    {isFocused ? "Exit Focus" : "Focus Today"}
                </button>
            </div>

            <table className="border-collapse w-full min-w-max text-sm">
                <thead>
                    {/* Top Summary Section */}
                    <tr>
                        <th className="bg-white p-3 border-b border-r border-slate-200 min-w-[200px] text-left align-bottom">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Habit Matrix</span>
                            <span className="text-xl font-bold text-slate-800 tracking-tight">{format(currentDate, 'MMMM')}</span>
                        </th>

                        {/* Week Headers - Minimalist */}
                        {weeks.map(([weekNum, weekDays]) => (
                            <th
                                key={weekNum}
                                colSpan={weekDays.length}
                                className="p-0 border-b border-r border-slate-200 last:border-r-0"
                            >
                                <div className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-brand-200/50">
                                    Week {weekNum}
                                </div>
                            </th>
                        ))}
                        <th className="bg-white border-b border-l border-slate-200 w-[120px]"></th>
                    </tr>

                    {/* Day Headers (Mon 1, Tue 2...) */}
                    <tr>
                        <th className="p-2 border-b border-r border-slate-200 bg-slate-50/50 text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Goal</span>
                        </th>
                        {visibleDays.map((day, idx) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const isToday = isSameDay(day, new Date());

                            return (
                                <th
                                    key={day.toISOString()}
                                    id={`day-${dateKey}`} // ID for scrolling
                                    className={cn(
                                        "border-b border-r border-slate-200 p-1 min-w-[36px] text-center transition-colors",
                                        isToday ? "bg-brand-50/30" : "bg-white"
                                    )}
                                >
                                    <div className="flex flex-col items-center py-1">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1.5">{format(day, 'EEE')}</span>
                                        <span className={cn(
                                            "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all",
                                            isToday ? "bg-brand-600 text-white shadow-sm shadow-brand-200" : "text-slate-700 hover:bg-slate-50"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                    </div>
                                </th>
                            )
                        })}
                        <th className="border-b border-l border-slate-200 bg-slate-50/50 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Metrics
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {habits.map((habit, idx) => {
                        // Stats Calculations
                        const totalRequired = visibleDays.length;
                        const totalDone = visibleDays.reduce((acc, day) => acc + (logs[format(day, 'yyyy-MM-dd')]?.[habit.id] ? 1 : 0), 0);
                        const progress = totalRequired > 0 ? Math.round((totalDone / totalRequired) * 100) : 0;

                        return (
                            <tr key={habit.id} className="group hover:bg-slate-50/80 transition-colors">
                                {/* Goal Name */}
                                <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 p-2 font-medium text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-slate-50/80 transition-colors">
                                    <div className="flex justify-between items-center group/cell">
                                        <span className="text-sm tracking-tight">{habit.name}</span>
                                        {onDeleteHabit && (
                                            <button onClick={() => onDeleteHabit(habit.id)} className="opacity-0 group-hover/cell:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>

                                {/* Days Checkboxes */}
                                {visibleDays.map(day => {
                                    const dateKey = format(day, 'yyyy-MM-dd');
                                    const isChecked = logs[dateKey]?.[habit.id];
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <td key={dateKey} className={cn(
                                            "border-b border-r border-slate-200 p-0 text-center h-8 w-9 relative transition-colors",
                                            isToday ? "bg-brand-50/10" : ""
                                        )}>
                                            <button
                                                onClick={() => onToggle(habit.id, dateKey)}
                                                className="absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none"
                                            >
                                                {/* Checkbox Graphic - Professional Square */}
                                                <div className={cn(
                                                    "w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-200 shadow-sm",
                                                    isChecked
                                                        ? "bg-brand-500 shadow-brand-200"
                                                        : "bg-white border border-slate-200 hover:border-brand-300"
                                                )}>
                                                    {isChecked && <Check size={12} className="text-white" strokeWidth={4} />}
                                                </div>
                                            </button>
                                        </td>
                                    )
                                })}

                                {/* Metrics Columns */}
                                <td className="border-b border-l border-slate-200 bg-white p-0 align-middle w-[120px]">
                                    <div className="flex items-center h-full px-2 gap-2">
                                        {/* Streak */}
                                        <div className="flex flex-col items-center w-8">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">Strk</div>
                                            <div className="flex items-center gap-0.5 text-xs font-bold text-orange-500 group/streak relative cursor-help">
                                                <Flame size={10} fill="currentColor" />
                                                <span>{streakData?.[habit.id]?.current || 0}</span>
                                                <div className="absolute bottom-full right-0 mb-1 hidden group-hover/streak:block whitespace-nowrap bg-slate-800 text-white text-[10px] px-2 py-1 rounded z-50">
                                                    Best: {streakData?.[habit.id]?.best || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="flex-1 flex flex-col justify-center gap-1">
                                            <div className="flex justify-between items-end leading-none">
                                                <span className="text-[10px] font-bold text-slate-500">{progress}%</span>
                                                <span className="text-[9px] text-slate-300">{totalDone}/{totalRequired}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-500",
                                                        progress <= 30 ? "bg-rose-400" : progress <= 70 ? "bg-amber-400" : "bg-brand-500"
                                                    )}
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}

                    {/* Mood Row - Professional */}
                    <tr>
                        <td className="sticky left-0 z-10 bg-white border-b border-r border-slate-200 p-2 font-bold text-slate-400 text-xs uppercase tracking-wider text-right shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            Daily Mood
                        </td>
                        {visibleDays.map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const currentMoodLabel = moods[dateKey];
                            const currentMood = moodOptions.find(m => m.label === currentMoodLabel);
                            const isToday = isSameDay(day, new Date());

                            return (
                                <td key={dateKey} className={cn(
                                    "border-b border-r border-slate-200 p-0 text-center bg-slate-50/30",
                                    isToday ? "bg-brand-50/10" : ""
                                )}>
                                    <button
                                        onDoubleClick={() => setActiveMoodPopup(activeMoodPopup === dateKey ? null : dateKey)}
                                        className="w-full h-full min-h-[32px] flex items-center justify-center relative cursor-cell hover:bg-slate-50 transition-colors"
                                        title="Double click to set mood"
                                    >
                                        {currentMood ? (
                                            <currentMood.icon size={16} className={currentMood.color} />
                                        ) : (
                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        )}

                                        {/* Mood Popup */}
                                        {activeMoodPopup === dateKey && (
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-lg p-1 flex gap-1 z-50 whitespace-nowrap">
                                                {moodOptions.map(option => (
                                                    <div
                                                        key={option.label}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onSetMood(dateKey, option.label);
                                                            setActiveMoodPopup(null);
                                                        }}
                                                        className="p-1.5 hover:bg-slate-50 rounded-md cursor-pointer transition-colors"
                                                    >
                                                        <option.icon size={16} className={option.color} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                </td>
                            )
                        })}
                        <td className="border-b border-l border-slate-200 bg-slate-50/30"></td>
                    </tr>
                </tbody>
            </table>
        </div >
    );
}

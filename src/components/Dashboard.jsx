import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { Trees, TrendingUp, CheckCircle2, Smile } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Dashboard({ logs, habits, moods, currentDate, onDateChange }) {
    // 1. Activity Trend Data
    const trendData = useMemo(() => {
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start, end });

        return days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayLogs = logs[dateKey] || {};
            const completedCount = Object.values(dayLogs).filter(Boolean).length;
            const percentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;
            return {
                date: format(day, 'd'),
                fullDate: dateKey,
                count: completedCount,
                percentage: percentage
            };
        });
    }, [logs, habits, currentDate]);

    // 2. Monthly Completion Data
    const completionStats = useMemo(() => {
        const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
        const totalPossible = daysInMonth.length * habits.length;

        let totalCompleted = 0;
        daysInMonth.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayLogs = logs[dateKey] || {};
            totalCompleted += Object.values(dayLogs).filter(Boolean).length;
        });

        const percentage = totalPossible === 0 ? 0 : Math.round((totalCompleted / totalPossible) * 100);
        return { totalCompleted, totalPossible, percentage };
    }, [logs, habits, currentDate]);

    // 3. Mood Summary
    const moodStats = useMemo(() => {
        const counts = {};
        const start = startOfMonth(currentDate);
        const end = endOfMonth(currentDate);
        const days = eachDayOfInterval({ start, end });

        days.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const mood = moods[dateKey];
            if (mood) {
                counts[mood] = (counts[mood] || 0) + 1;
            }
        });

        return counts;
    }, [moods, currentDate]);

    // Forest Growth (Visual representation of consistency)
    // Logic: 1 tree for every 5 completed tasks + 1 tree for every 3 'Happy' moods
    const forestSize = useMemo(() => {
        const happyMoods = moodStats['Happy'] || 0;
        return Math.floor(completionStats.totalCompleted / 5) + Math.floor(happyMoods / 3);
    }, [completionStats.totalCompleted, moodStats]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Activity Trend Card */}
            {/* Month/Year Section & Activity Trend (Merged or Grid) */}
            <div className="flex flex-col gap-6">
                {/* Month/Year Box - Matches reference "March 2025" beige box */}
                {/* Month/Year Box - Professional Clean Look */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 relative overflow-hidden flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Overview</span>
                    </div>

                    <div className="flex gap-3">
                        <select
                            value={currentDate.getMonth()}
                            onChange={(e) => {
                                const newDate = new Date(currentDate);
                                newDate.setMonth(parseInt(e.target.value));
                                onDateChange(newDate);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i} value={i}>
                                    {format(new Date(2000, i, 1), 'MMMM')}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            value={currentDate.getFullYear()}
                            onChange={(e) => {
                                const newDate = new Date(currentDate);
                                newDate.setFullYear(parseInt(e.target.value));
                                onDateChange(newDate);
                            }}
                            className="bg-slate-50 border border-slate-200 rounded-lg p-2 w-20 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 hover:bg-slate-100 transition-colors"
                        />
                    </div>
                </div>

                {/* Activity Trend Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider">Activity Trend</h3>
                            <p className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-1">
                                Daily Peaks <TrendingUp size={16} className="text-brand-500" />
                            </p>
                        </div>
                    </div>
                    <div className="h-[150px] w-full -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                key={`${currentDate.getMonth()}-${currentDate.getFullYear()}`}
                                data={trendData}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                onClick={(e) => {
                                    if (e && e.activePayload && e.activePayload[0]) {
                                        const dateKey = e.activePayload[0].payload.fullDate;
                                        const el = document.getElementById(`day-${dateKey}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                    }
                                }}
                            >
                                <defs>
                                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} /> {/* Emerald-500 */}
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value}%`, 'Completed']}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="percentage"
                                    stroke="#059669"
                                    strokeWidth={2}
                                    fill="url(#colorGradient)"
                                    activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Monthly Completion Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pastel-blue rounded-full opacity-20 -mr-8 -mt-8 blur-2xl"></div>

                <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Monthly Goal</h3>

                <div className="flex items-center gap-6 mt-4">
                    {/* Custom Circular Progress */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                            <circle
                                cx="48" cy="48" r="40"
                                stroke="#f43f5e"
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="251.2"
                                strokeDashoffset={251.2 - (251.2 * completionStats.percentage) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-xl font-bold text-slate-800">{completionStats.percentage}%</span>
                        </div>
                    </div>

                    <div>
                        <div className="text-3xl font-bold text-slate-800 mb-1">{completionStats.totalCompleted}</div>
                        <div className="text-sm text-slate-400">of {completionStats.totalPossible} tasks done</div>
                        <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full inline-block">
                            You're doing great!
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Mood Summary & Growth Forest */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Mood Landscape</span>
                    <span className="text-[10px] normal-case bg-brand-50 text-brand-700 font-medium px-2 py-0.5 rounded-full border border-brand-100">
                        Growth Forest
                    </span>
                </h3>

                <div className="flex flex-col gap-4">
                    {/* Growth Forest Grid */}
                    <div className="bg-gradient-to-br from-brand-50 to-white rounded-xl p-4 border border-brand-100 min-h-[140px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Trees size={64} className="text-brand-800" />
                        </div>

                        <div className="flex flex-wrap gap-1.5 content-start">
                            {Array.from({ length: Math.min(forestSize, 50) }).map((_, i) => (
                                <div key={i} className="animate-in zoom-in duration-300" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <Trees size={20} className="text-brand-500 fill-brand-100" />
                                </div>
                            ))}
                            {forestSize === 0 && (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic mt-8">
                                    Complete 5 habits or log 3 happy moods to plant a tree!
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-3 text-[10px] font-bold text-brand-700 bg-white/90 px-2 py-1 rounded-full shadow-sm border border-brand-100">
                            {forestSize} TREES
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {['Happy', 'Neutral', 'Stressed'].map(m => (
                            <div key={m} className="flex items-center justify-between text-sm group">
                                <span className="text-slate-500 font-medium group-hover:text-slate-700 transition-colors w-16">{m}</span>
                                <div className="flex items-center flex-1 mx-3">
                                    <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                m === 'Happy' ? "bg-amber-400" : m === 'Neutral' ? "bg-slate-300" : "bg-rose-400"
                                            )}
                                            style={{ width: `${(moodStats[m] || 0) * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-700 w-4 text-right">{moodStats[m] || 0}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}


import React, { useMemo } from 'react';
import { eachDayOfInterval, endOfYear, format, getDay, startOfYear, isSameDay, getWeek } from 'date-fns';
import { cn } from '../lib/utils';

export default function HeatmapView({ logs, habits, year }) {
    // Generate all days for the selected year
    const days = useMemo(() => {
        const start = startOfYear(new Date(year, 0, 1));
        const end = endOfYear(new Date(year, 0, 1));
        return eachDayOfInterval({ start, end });
    }, [year]);

    // Calculate intensity for each day
    const intensityMap = useMemo(() => {
        const map = {};
        days.forEach(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayLogs = logs[dateKey] || {};
            const completedCount = habits.reduce((acc, h) => acc + (dayLogs[h.id] ? 1 : 0), 0);
            const totalHabits = habits.length;

            // Intensity: 0 (0%), 1 (1-25%), 2 (26-50%), 3 (51-75%), 4 (76-100%)
            let level = 0;
            if (totalHabits > 0 && completedCount > 0) {
                const percentage = (completedCount / totalHabits) * 100;
                if (percentage <= 25) level = 1;
                else if (percentage <= 50) level = 2;
                else if (percentage <= 75) level = 3;
                else level = 4;
            }
            map[dateKey] = { level, count: completedCount, date: day };
        });
        return map;
    }, [days, logs, habits]);

    // Group by weeks for the grid columns (Vertical Weeks, Horizontal Days is standard GitHub? No, GitHub is Horizontal Weeks, Vertical Days)
    // GitHub: 7 Rows (Sun-Sat), ~52 Columns.
    // We need to map days to [col, row].

    // Helper to get grid cell color
    const getColor = (level) => {
        switch (level) {
            case 0: return 'bg-slate-100';
            case 1: return 'bg-emerald-200';
            case 2: return 'bg-emerald-400';
            case 3: return 'bg-emerald-600';
            case 4: return 'bg-emerald-800';
            default: return 'bg-slate-100';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>Yearly Activity</span>
                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{year}</span>
            </h3>

            <div className="flex gap-1">
                {/* Week Columns */}
                {/* We iterate by weeks? Or simpler: Just render a grid with 7 rows. */}
                {/* Actually, CSS Grid is easiest if we flow column-wise. grid-flow-col. */}

                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {/* Render all days. The grid will auto-flow if we set grid-flow-col */}
                    {/* Warning: We need to pad the start to align with correct weekday if utilizing strict grid-flow-col */}

                    {/* Pad Start */}
                    {Array.from({ length: getDay(days[0]) }).map((_, i) => (
                        <div key={`pad-start-${i}`} className="w-3 h-3 md:w-4 md:h-4 bg-transparent" />
                    ))}

                    {days.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const data = intensityMap[dateKey];
                        return (
                            <div
                                key={dateKey}
                                className={cn(
                                    "w-3 h-3 md:w-4 md:h-4 rounded-sm transition-colors hover:ring-2 hover:ring-slate-400 cursor-pointer relative group",
                                    getColor(data.level)
                                )}
                                title={`${data.count} habits on ${format(day, 'MMM d')}`}
                            >
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-slate-100"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-200"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-600"></div>
                    <div className="w-3 h-3 rounded-sm bg-emerald-800"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}

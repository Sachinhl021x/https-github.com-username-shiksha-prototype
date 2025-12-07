'use client';

import React, { useState } from 'react';
import { LEADERBOARD_DATA } from '@/mockData';
import { Trophy, TrendingUp, Code2, Cpu, BarChart3, ArrowUp, ArrowDown, Minus, Sparkles } from 'lucide-react';

type Category = 'tokenUsage' | 'marketShare' | 'programming' | 'toolUsage' | 'topApps';

export default function Leaderboard() {
    const [activeCategory, setActiveCategory] = useState<Category>('tokenUsage');

    const categories = [
        { id: 'tokenUsage', label: 'Token Usage', icon: Trophy },
        { id: 'marketShare', label: 'Market Share', icon: BarChart3 },
        { id: 'programming', label: 'Programming', icon: Code2 },
        { id: 'toolUsage', label: 'Tool Calls', icon: Cpu },
        { id: 'topApps', label: 'Top Apps', icon: Sparkles },
    ];

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) return <ArrowUp className="w-3 h-3 text-green-500" />;
        if (growth < 0) return <ArrowDown className="w-3 h-3 text-red-500" />;
        return <Minus className="w-3 h-3 text-gray-400" />;
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) return 'text-green-600 bg-green-50';
        if (growth < 0) return 'text-red-600 bg-red-50';
        return 'text-gray-500 bg-gray-50';
    };

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h2 className="text-4xl font-black text-black mb-4 flex items-center gap-3">
                            <TrendingUp className="w-10 h-10" />
                            OpenRouter Leaderboard
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl">
                            Real-time insights into model performance, token usage, and market trends across the AI ecosystem.
                        </p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex p-1.5 bg-gray-100 rounded-xl overflow-x-auto">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as Category)}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                                    ${activeCategory === cat.id
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'}
                                `}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Leaderboard Table */}
                <div className="bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-black bg-gray-50">
                                    <th className="py-5 px-6 text-left text-sm font-black text-gray-500 uppercase tracking-wider w-20">Rank</th>
                                    <th className="py-5 px-6 text-left text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {activeCategory === 'topApps' ? 'App / Source' : 'Model / Provider'}
                                    </th>
                                    <th className="py-5 px-6 text-right text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {activeCategory === 'marketShare' || activeCategory === 'programming' ? 'Share' : 'Volume'}
                                    </th>
                                    <th className="py-5 px-6 text-right text-sm font-black text-gray-500 uppercase tracking-wider">
                                        {activeCategory === 'marketShare' ? 'Total Tokens' : activeCategory === 'topApps' ? 'Description' : 'Trend'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {LEADERBOARD_DATA[activeCategory].map((item: any, index: number) => (
                                    <tr
                                        key={index}
                                        className="group hover:bg-blue-50/50 transition-colors"
                                    >
                                        <td className="py-5 px-6">
                                            <div className={`
                                                w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 border-black
                                                ${index === 0 ? 'bg-yellow-400 text-black' :
                                                    index === 1 ? 'bg-gray-300 text-black' :
                                                        index === 2 ? 'bg-orange-300 text-black' : 'bg-white text-gray-500'}
                                            `}>
                                                {item.rank}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-lg text-black group-hover:text-blue-600 transition-colors">
                                                    {item.name}
                                                </span>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {activeCategory === 'topApps' ? item.source : `by ${item.provider}`}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <div className="font-mono font-bold text-lg text-black">
                                                {activeCategory === 'marketShare' || activeCategory === 'programming'
                                                    ? `${item.share}%`
                                                    : item.tokens || item.usage}
                                            </div>
                                            {(activeCategory === 'marketShare' || activeCategory === 'programming') && (
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full ml-auto mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-black rounded-full"
                                                        style={{ width: `${item.share}%` }}
                                                    />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            {activeCategory === 'marketShare' ? (
                                                <span className="font-mono font-medium text-gray-600">{item.tokens}</span>
                                            ) : activeCategory === 'topApps' ? (
                                                <span className="text-sm text-gray-600 font-medium">{item.description}</span>
                                            ) : (
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${getGrowthColor(item.growth || item.share)}`}>
                                                    {getGrowthIcon(item.growth || item.share)}
                                                    {Math.abs(item.growth || item.share)}%
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    );
}

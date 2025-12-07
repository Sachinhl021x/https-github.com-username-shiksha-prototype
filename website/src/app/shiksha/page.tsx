import React from 'react';
import Link from 'next/link';
import { ENGINEERING_TOPICS } from '@/mockData';
import { Terminal, ArrowRight, Database, Activity, Cpu, Code2, GitBranch } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    Database,
    Terminal,
    Activity,
    Cpu,
    Code2,
    GitBranch
};

import CourseGrid from '@/components/shiksha/CourseGrid';

export default function Shiksha() {
    return (
        <div className="min-h-screen py-12 md:py-20 bg-cyan-50 relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-20 left-20 w-24 h-24 bg-yellow-400 rounded-full border-4 border-black opacity-40 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-pink-400 border-4 border-black rotate-45 opacity-40 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400 rounded-full border-4 border-black opacity-30 animate-float" style={{ animationDelay: '1s' }} />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="flex flex-col items-center text-center mb-16">
                    <div className="p-4 bg-cyan-400 rounded-2xl mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Code2 className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4 text-black">
                        Shiksha Learning Paths
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 max-w-3xl font-medium">
                        Master any subject with personalized AI tutors, interactive lessons, and multilingual support.
                    </p>
                </div>

                <CourseGrid topics={ENGINEERING_TOPICS} />
            </div>
        </div>
    );
}
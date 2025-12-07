"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, ArrowRight, Database, Activity, Cpu, Code2, GitBranch, Search } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
    Database,
    Terminal,
    Activity,
    Cpu,
    Code2,
    GitBranch
};

interface Topic {
    id: string;
    title: string;
    description: string;
    icon: string;
    slug: string;
}

interface EngineeringGridProps {
    topics: Topic[];
}

export default function EngineeringGrid({ topics }: EngineeringGridProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTopics = topics.filter((topic) =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Search Bar */}
            <div className="relative mb-12 max-w-xl mx-auto">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="text"
                    placeholder="Search topics..."
                    className="block w-full pl-11 pr-4 py-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none text-foreground placeholder:text-muted-foreground/70 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Grid */}
            {filteredTopics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {filteredTopics.map((topic) => {
                        const Icon = iconMap[topic.icon as keyof typeof iconMap] || Terminal;

                        return (
                            <Link
                                key={topic.id}
                                href={`/shiksha/${topic.slug}`}
                                className="group relative overflow-hidden rounded-2xl bg-card/40 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
                            >
                                <div className="p-8 h-full flex flex-col">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                        {topic.title}
                                    </h3>

                                    <p className="text-muted-foreground mb-8 flex-grow leading-relaxed">
                                        {topic.description}
                                    </p>

                                    <div className="flex items-center text-sm font-semibold text-primary mt-auto">
                                        Start Learning <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>

                                {/* Decorative gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <Search className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No topics found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search query to find what you're looking for.
                    </p>
                </div>
            )}
        </div>
    );
}

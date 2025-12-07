'use client';

import React, { useState, useEffect } from 'react';

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText?: string;
    ctaLink?: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    badge?: string;
    className?: string;
    children?: React.ReactNode;
}

export function Hero({ title, subtitle, ctaText, ctaLink, secondaryCtaText, secondaryCtaLink, badge }: HeroProps) {
    const [hoveredShape, setHoveredShape] = useState<number | null>(null);

    // Rotating headlines
    const headlines = [
        "Pulse",
        "Engineering",
        "Insights",
        "Products"
    ];

    const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            setIsVisible(false);

            // After fade out completes, wait briefly, then change word and fade in
            setTimeout(() => {
                setCurrentHeadlineIndex((prev) => (prev + 1) % headlines.length);

                // Brief pause before fading in
                setTimeout(() => {
                    setIsVisible(true);
                }, 100);
            }, 500);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden py-20 sm:py-32 lg:pb-32 xl:pb-36 bg-white">
            {/* Animated Geometric Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block">
                {/* Yellow Circle - Top Right */}
                <div
                    className="absolute top-20 right-10 w-32 h-32 bg-yellow-400 rounded-full border-4 border-black animate-float"
                    style={{ animationDelay: '0s' }}
                />

                {/* Cyan Square - Top Left */}
                <div
                    className="absolute top-32 left-20 w-24 h-24 bg-cyan-400 border-4 border-black rotate-12 animate-float"
                    style={{ animationDelay: '0.5s' }}
                />

                {/* Coral Triangle - Bottom Right */}
                <div
                    className="absolute bottom-32 right-32 w-0 h-0 border-l-[50px] border-l-transparent border-r-[50px] border-r-transparent border-b-[86px] border-b-pink-500 animate-float"
                    style={{
                        animationDelay: '1s',
                        filter: 'drop-shadow(0 0 0 black) drop-shadow(2px 2px 0 black) drop-shadow(-2px -2px 0 black) drop-shadow(2px -2px 0 black) drop-shadow(-2px 2px 0 black)'
                    }}
                />

                {/* Purple Circle - Bottom Left */}
                <div
                    className="absolute bottom-20 left-10 w-20 h-20 bg-purple-400 rounded-full border-4 border-black animate-float"
                    style={{ animationDelay: '1.5s' }}
                />

                {/* Small Yellow Square - Middle Right */}
                <div
                    className="absolute top-1/2 right-20 w-16 h-16 bg-yellow-300 border-4 border-black -rotate-12 animate-float"
                    style={{ animationDelay: '0.8s' }}
                />

                {/* Small Cyan Circle - Middle Left */}
                <div
                    className="absolute top-1/3 left-32 w-12 h-12 bg-cyan-300 rounded-full border-4 border-black animate-float"
                    style={{ animationDelay: '1.2s' }}
                />
            </div>

            <div className="container px-4 md:px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {badge && (
                        <div className="inline-flex items-center rounded-full border-4 border-black bg-yellow-400 px-4 py-2 text-sm font-bold text-black mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                            {badge}
                        </div>
                    )}

                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 text-black leading-tight text-center">
                        {/* Static AI with cyan highlight */}
                        <span className="relative inline-block">
                            AI
                            <span className="absolute -bottom-2 left-0 w-full h-4 bg-cyan-400 -z-10 -rotate-1"></span>
                        </span>

                        {/* Fixed spacing */}
                        <span className="inline-block" style={{ width: '0.3em' }}></span>

                        {/* Rotating words container */}
                        <span className="relative inline-block">
                            <span
                                className={`transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                {headlines[currentHeadlineIndex]}
                            </span>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-700 mb-10 font-medium max-w-2xl mx-auto">
                        {subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {ctaText && ctaLink && (
                            <a
                                href={ctaLink}
                                className="group inline-flex h-14 items-center justify-center rounded-xl bg-black border-4 border-black px-8 text-lg font-bold text-white shadow-[4px_4px_0px_0px_rgba(255,215,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,215,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                                {ctaText}
                                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        )}
                        {secondaryCtaText && secondaryCtaLink && (
                            <a
                                href={secondaryCtaLink}
                                className="group inline-flex h-14 items-center justify-center rounded-xl bg-white border-4 border-black px-8 text-lg font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,217,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,217,255,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                            >
                                {secondaryCtaText}
                                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

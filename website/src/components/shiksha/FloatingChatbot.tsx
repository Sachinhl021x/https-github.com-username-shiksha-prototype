'use client';

import React, { useState, useEffect } from 'react';
import { Bot, X, ChevronLeft } from 'lucide-react';
import CourseChatbot from './CourseChatbot';

interface FloatingChatbotProps {
    courseTitle: string;
    courseContent: string;
}

export default function FloatingChatbot({ courseTitle, courseContent }: FloatingChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Keyboard accessibility: Alt+T to toggle
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey && e.key.toLowerCase() === 't') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            <button
                onClick={() => setIsOpen(true)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 
                    h-80 w-20 rounded-l-3xl 
                    bg-gradient-to-b from-cyan-500/80 via-blue-600/80 to-indigo-700/80
                    text-white 
                    border-l border-y border-white/10 backdrop-blur-xl
                    transition-all duration-500 ease-out
                    hover:w-24 hover:brightness-105
                    flex flex-col items-center justify-between py-8 group 
                    focus:outline-none focus:ring-4 focus:ring-cyan-400/50
                    ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
                    animate-breathe`}
                aria-label="Open AI Tutor (Alt+T)"
                aria-expanded={isOpen}
                style={{
                    boxShadow: isHovered
                        ? '0 0 40px rgba(6, 182, 212, 0.8), 0 0 80px rgba(59, 130, 246, 0.4), inset 0 2px 20px rgba(255, 255, 255, 0.2)'
                        : '0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(59, 130, 246, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.1)'
                }}
            >
                {/* Top Icon - Chevron */}
                <div
                    className="bg-white/20 p-2.5 rounded-full backdrop-blur-md shadow-inner relative overflow-hidden
                        transition-all duration-300 ease-out"
                    style={{
                        transform: isHovered ? 'scale(1.15) translateX(-2px)' : 'scale(1)',
                        transitionDelay: '0ms'
                    }}
                >
                    {/* Ripple effect on hover */}
                    <div className={`absolute inset-0 bg-white/20 rounded-full ${isHovered ? 'animate-ping' : 'opacity-0'}`}></div>
                    <ChevronLeft className="w-6 h-6 text-white relative z-10" />
                </div>

                {/* Center Text */}
                <div
                    className="flex-1 flex items-center justify-center py-4 transition-all duration-300"
                    style={{
                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        transitionDelay: '50ms'
                    }}
                >
                    <span className="text-base font-black writing-vertical-rl tracking-[0.15em] uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                        AI Tutor
                    </span>
                </div>

                {/* Bottom Icon - Bot */}
                <div
                    className="bg-white/20 p-2.5 rounded-full backdrop-blur-md shadow-inner relative overflow-hidden
                        transition-all duration-300 ease-out"
                    style={{
                        transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                        transitionDelay: '100ms'
                    }}
                >
                    {/* Ripple effect on hover */}
                    <div className={`absolute inset-0 bg-white/20 rounded-full ${isHovered ? 'animate-ping' : 'opacity-0'}`} style={{ animationDelay: '100ms' }}></div>
                    <Bot className="w-6 h-6 text-white relative z-10" />
                </div>

                {/* Subtle hint text */}
                <div className={`absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full
                    bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg
                    transition-all duration-300 whitespace-nowrap
                    ${isHovered ? 'opacity-100 -translate-x-[calc(100%+8px)]' : 'opacity-0 -translate-x-full pointer-events-none'}`}>
                    Ask me anything! (Alt+T)
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full 
                        w-0 h-0 border-[6px] border-transparent border-l-gray-900"></div>
                </div>
            </button>

            {/* Overlay (Backdrop) */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 animate-in fade-in"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-gray-50 z-50 shadow-2xl 
                    transform transition-all duration-500 ease-in-out border-l border-gray-200
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-tutor-title"
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl shadow-lg shadow-cyan-500/20 animate-in zoom-in duration-300">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 id="ai-tutor-title" className="font-bold text-gray-900 leading-none text-lg">AI Tutor</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1">Ask about {courseTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        aria-label="Close AI Tutor"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Chatbot Content */}
                <div className="h-[calc(100%-81px)]">
                    <CourseChatbot courseTitle={courseTitle} courseContent={courseContent} isDrawer={true} />
                </div>
            </div>

            {/* CSS for breathing animation */}
            <style jsx>{`
                @keyframes breathe {
                    0%, 100% { 
                        transform: translateY(-50%) scale(1); 
                    }
                    50% { 
                        transform: translateY(-50%) scale(1.02); 
                    }
                }
                .animate-breathe {
                    animation: breathe 4s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}

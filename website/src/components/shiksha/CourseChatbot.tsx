'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MoreVertical, Globe } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface CourseChatbotProps {
    courseTitle: string;
    courseContent: string;
    isDrawer?: boolean;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
];

export default function CourseChatbot({ courseTitle, courseContent, isDrawer = false }: CourseChatbotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: `Hi! I'm your AI Tutor for **${courseTitle}**. \n\nI've analyzed the course content and I'm ready to help you master it. Ask me anything!`,
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/shiksha-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages, // Send full history
                    courseTitle,
                    courseContent,
                    language: selectedLanguage
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting right now. Please try again.", timestamp: new Date() }]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        if (!isMounted) return ''; // Prevent hydration mismatch
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={`flex flex-col h-full bg-gray-50 ${!isDrawer ? 'rounded-2xl border border-gray-200 shadow-xl' : ''} overflow-hidden font-sans`}>
            {/* Header - Only show if NOT in drawer (drawer has its own header) */}
            {!isDrawer && (
                <div className="bg-white/80 backdrop-blur-md p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-xl shadow-lg shadow-cyan-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-none">AI Tutor</h3>
                            <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Language Selector (Visible in Drawer too) */}
            <div className="px-4 py-2 bg-white border-b border-gray-100 flex justify-end relative">
                <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-cyan-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200"
                >
                    <Globe className="w-3 h-3" />
                    {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                </button>

                {showLanguageMenu && (
                    <div className="absolute top-full right-4 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                        {LANGUAGES.map(lang => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setSelectedLanguage(lang.code);
                                    setShowLanguageMenu(false);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedLanguage === lang.code ? 'text-cyan-600 font-bold bg-cyan-50' : 'text-gray-700'}`}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        {/* Avatar */}
                        <div className={`
                            w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-cyan-600 border border-gray-100'}
                        `}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[80%]`}>
                            <div className={`
                                px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm relative group
                                ${msg.role === 'user'
                                    ? 'bg-gray-900 text-white rounded-tr-sm'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}
                            `}>
                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-pre:bg-gray-800 prose-pre:text-gray-100">
                                    {msg.content.split('\n').map((line, i) => (
                                        <p key={i} className="mb-1 last:mb-0 min-h-[1.2em]">{line || <br />}</p>
                                    ))}
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1.5 font-medium px-1">
                                {formatTime(msg.timestamp)}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-4 animate-in fade-in duration-300">
                        <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Sparkles className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 ${!isDrawer ? 'rounded-b-2xl' : ''}`}>
                <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
                    <div className="relative flex-1 bg-gray-100 rounded-2xl focus-within:ring-2 focus-within:ring-cyan-500/20 focus-within:bg-white transition-all duration-200 border border-transparent focus-within:border-cyan-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Ask a question in ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}...`}
                            className="w-full pl-4 pr-12 py-3.5 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-gray-900 transition-all duration-200 shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30 active:scale-95"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400 font-medium">AI can make mistakes. Verify important info.</p>
                </div>
            </div>
        </div>
    );
}

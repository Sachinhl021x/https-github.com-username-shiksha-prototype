import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    imageUrl: string;
    slug: string;
    author?: string;
    readTime?: string;
    tags?: string[];
}

interface NewsHeroProps {
    items: NewsItem[];
}

export default function NewsHero({ items }: NewsHeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 2500);

        return () => clearInterval(interval);
    }, [items.length, isPaused]);

    const currentItem = items[currentIndex];

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!items.length) return null;

    return (
        <div
            className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden mb-16 group bg-black"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Images (Transition) */}
            {items.map((item, index) => (
                <div
                    key={item.id}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                    style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
            ))}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:p-16 z-10">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4 animate-fade-in">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                            Featured
                        </span>
                        <span className="px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground text-sm font-medium border border-white/10">
                            {currentItem.category}
                        </span>
                    </div>

                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-sm animate-fade-in-up">
                        {currentItem.title}
                    </h2>

                    <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-3 animate-fade-in-up delay-100">
                        {currentItem.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300 mb-8 animate-fade-in-up delay-200">
                        {currentItem.author && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                                    {currentItem.author.charAt(0)}
                                </div>
                                <span className="font-medium text-white">{currentItem.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{currentItem.date}</span>
                        </div>
                        {currentItem.readTime && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{currentItem.readTime}</span>
                            </div>
                        )}
                    </div>

                    <Link
                        href={`/latest/${currentItem.slug}`}
                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200 animate-fade-in-up delay-300"
                    >
                        Read Full Story
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-8 h-8" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-8 h-8" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}

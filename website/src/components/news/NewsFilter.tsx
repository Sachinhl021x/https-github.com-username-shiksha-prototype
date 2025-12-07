import React from 'react';

interface NewsFilterProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function NewsFilter({ categories, selectedCategory, onSelectCategory }: NewsFilterProps) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar mask-gradient-r">
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`
                        px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                        ${selectedCategory === category
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                            : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-accent/50'}
                    `}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}

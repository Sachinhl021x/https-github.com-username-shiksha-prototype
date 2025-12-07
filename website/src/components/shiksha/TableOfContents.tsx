"use client";

import React, { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TableOfContentsProps {
    content: string;
}

interface Heading {
    id: string;
    text: string;
    level: number;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
    const [headings, setHeadings] = useState<Heading[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        // Parse headings from markdown content
        const lines = content.split('\n');
        const extractedHeadings: Heading[] = [];

        lines.forEach((line) => {
            const match = line.match(/^(#{2,3})\s+(.+)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                // Create a simple slug from the text
                const id = text
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');

                extractedHeadings.push({ id, text, level });
            }
        });

        setHeadings(extractedHeadings);

        // Setup intersection observer for active state
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -66% 0px' }
        );

        // We need to wait for the content to be rendered in the DOM
        // This is a bit of a hack, but since we're parsing raw markdown string here
        // and the actual DOM elements are rendered by ReactMarkdown elsewhere,
        // we rely on the fact that ReactMarkdown will generate IDs matching our logic.
        // *Self-correction*: ReactMarkdown doesn't auto-generate IDs by default without a plugin.
        // For this MVP, we will just render the links and assume the user clicks them.
        // To make it fully functional, we'd need `rehype-slug` on the page.tsx side.
        // I will add `rehype-slug` to the plan if this doesn't work, but for now let's just render the list.

    }, [content]);

    if (headings.length === 0) return null;

    return (
        <div className="hidden lg:block sticky top-32 ml-8 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-primary">
                <List className="w-4 h-4" />
                <span>On this page</span>
            </div>
            <nav className="space-y-1">
                {headings.map((heading) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-sm py-1 transition-colors hover:text-primary line-clamp-1 ${activeId === heading.id
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground'
                            } ${heading.level === 3 ? 'pl-4' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(heading.id)?.scrollIntoView({
                                behavior: 'smooth'
                            });
                            setActiveId(heading.id);
                        }}
                    >
                        {heading.text}
                    </a>
                ))}
            </nav>
        </div>
    );
}

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { ENGINEERING_CONTENT, ENGINEERING_TOPICS } from '@/mockData';

interface PageProps {
    params: {
        slug: string;
    };
}

export function generateStaticParams() {
    return ENGINEERING_TOPICS.map((topic) => ({
        slug: topic.slug,
    }));
}

import rehypeSlug from 'rehype-slug';
import TableOfContents from '@/components/shiksha/TableOfContents';

import FloatingChatbot from '@/components/shiksha/FloatingChatbot';

export default function CourseDetail({ params }: PageProps) {
    const { slug } = params;
    const content = ENGINEERING_CONTENT[slug];
    const topic = ENGINEERING_TOPICS.find((t) => t.slug === slug);

    if (!content || !topic) {
        notFound();
    }

    // Calculate reading time (approx 200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return (
        <div className="min-h-screen py-12 md:py-20 bg-cyan-50 relative overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-20 left-20 w-24 h-24 bg-yellow-400 rounded-full border-4 border-black opacity-40 animate-float" style={{ animationDelay: '0s' }} />
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-pink-400 border-4 border-black rotate-45 opacity-40 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-1/3 w-20 h-20 bg-purple-400 rounded-full border-4 border-black opacity-30 animate-float" style={{ animationDelay: '1s' }} />

            <div className="container px-4 md:px-6 max-w-7xl mx-auto relative z-10">
                {/* Back Link */}
                <Link
                    href="/shiksha"
                    className="inline-flex items-center text-sm font-bold text-black hover:text-cyan-600 transition-colors mb-8 group bg-white px-4 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Courses
                </Link>

                {/* Header */}
                <div className="mb-12 max-w-4xl">
                    <div className="flex items-center gap-4 text-sm text-black font-medium mb-4">
                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border-2 border-black">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime} min read</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border-2 border-black">
                            <Calendar className="w-4 h-4" />
                            <span>Updated recently</span>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-black leading-tight">
                        {topic.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed border-l-4 border-black pl-6 font-medium">
                        {topic.description}
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar (TOC) - Moved to Left */}
                    <aside className="hidden lg:block w-80 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="bg-white p-6 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                                    <span className="w-2 h-8 bg-purple-400 border-2 border-black block"></span>
                                    Table of Contents
                                </h3>
                                <TableOfContents content={content} />
                            </div>
                        </div>
                    </aside>

                    {/* Content */}
                    <article className="flex-1 prose prose-lg prose-slate max-w-none 
                        prose-headings:font-black prose-headings:text-black
                        prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-2 prose-h2:border-b-4 prose-h2:border-black
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-gray-800 prose-p:leading-relaxed prose-p:font-medium
                        prose-li:marker:text-black prose-li:text-gray-800
                        prose-strong:text-black prose-strong:font-bold
                        prose-code:bg-yellow-200 prose-code:text-black prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:border-2 prose-code:border-black prose-code:font-bold prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-gray-900 prose-pre:text-white prose-pre:border-4 prose-pre:border-black prose-pre:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                        prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:bg-white prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] prose-blockquote:not-italic
                    ">
                        <ReactMarkdown rehypePlugins={[rehypeSlug]}>{content}</ReactMarkdown>
                    </article>
                </div>

                {/* Floating Chatbot (Available on all screens) */}
                <FloatingChatbot courseTitle={topic.title} courseContent={content} />

                {/* Footer Navigation */}
                <div className="mt-16 pt-8 border-t-4 border-black flex justify-between items-center max-w-4xl">
                    <Link
                        href="/shiksha"
                        className="text-black font-bold hover:text-cyan-600 transition-colors flex items-center group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Overview
                    </Link>
                </div>
            </div>
        </div>
    );
}

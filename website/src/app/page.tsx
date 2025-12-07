'use client';

import React from 'react';
import { Hero } from '@/components/ui/Hero';
import { ENGINEERING_TOPICS } from '@/mockData';
import CourseGrid from '@/components/shiksha/CourseGrid';
import FloatingChatbot from '@/components/shiksha/FloatingChatbot';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Hero
        title="Shiksha: AI-Powered Learning"
        subtitle="Master any subject with your personalized AI tutor. Interactive lessons, quizzes, and multilingual support."
        ctaText="Start Learning"
        ctaLink="#courses"
        secondaryCtaText="Chat with AI"
        secondaryCtaLink="/chat"
        badge="Shiksha Hackathon Prototype"
      />

      <div id="courses" className="container px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore Courses</h2>
          <p className="text-gray-600 text-lg max-w-2xl">
            Select a topic to start your learning journey. Your AI tutor is ready to help you every step of the way.
          </p>
        </div>

        <CourseGrid topics={ENGINEERING_TOPICS} />
      </div>

      {/* Persistent Chatbot for the Home Page */}
      <FloatingChatbot
        courseTitle="General Learning"
        courseContent="You are Shiksha, a general AI tutor. Help the user choose a course or answer general questions about learning."
      />
    </div>
  );
}

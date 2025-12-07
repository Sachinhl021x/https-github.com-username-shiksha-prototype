import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

// Initialize OpenAI client with Gemini configuration
const openai = new OpenAI({
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    apiKey: 'AIzaSyCRI1N3b-5tJoTeTOY9KHHjb0RewcrBpiI', // Using provided key
});

const TOPICS = [
    {
        title: "Software Systems Engineering",
        slug: "software-systems-engineering",
        description: "Bridge the gap between theory and production. Learn to architect scalable, fault-tolerant distributed systems."
    },
    {
        title: "Generative AI Engineering",
        slug: "genai-engineering",
        description: "The definitive guide to building with GenAI. Move beyond simple prompts to mastering RAG and agentic workflows."
    },
    {
        title: "Forward Deployment Decisions",
        slug: "forward-deployment-decisions",
        description: "Develop the strategic intuition of a Principal Engineer. Learn a rigorous framework for making high-stakes technical decisions."
    },
    {
        title: "Product Management Fundamentals",
        slug: "product-management-fundamentals",
        description: "Master the art of building products users love. Learn to map user journeys, define MVPs, and prioritize features effectively."
    }
];

const PROMPT_TEMPLATE = `
You are an expert curriculum designer for Shiksha, an advanced AI learning platform.
Create a comprehensive, high-quality course syllabus and content for the course: "{{TITLE}}".
Description: {{DESCRIPTION}}

Format the output as a Markdown string suitable for a "Master Class".
Structure:
# {{TITLE}} (Master Class)

## A — FOUNDATIONS
... (Detailed sub-modules with bullet points)

## B — CORE CONCEPTS
... (Detailed sub-modules with bullet points)

## C — ADVANCED TOPICS
... (Detailed sub-modules with bullet points)

## D — REAL-WORLD APPLICATIONS
... (Detailed sub-modules with bullet points)

Make it detailed, technical, and engaging. Use bolding for key terms.
`;

async function generateContent() {
    const generatedContent: Record<string, string> = {};

    for (const topic of TOPICS) {
        console.log(`Generating content for: ${topic.title}...`);
        try {
            const prompt = PROMPT_TEMPLATE.replace('{{TITLE}}', topic.title).replace('{{DESCRIPTION}}', topic.description);

            const completion = await openai.chat.completions.create({
                model: 'gemini-2.0-flash-exp',
                messages: [{ role: 'user', content: prompt }],
            });

            const content = completion.choices[0].message.content || '';
            generatedContent[topic.slug] = content;
            console.log(`✓ Generated ${content.length} characters for ${topic.title}`);
        } catch (error) {
            console.error(`Error generating content for ${topic.title}:`, error);
        }
    }

    // Output the generated content as a JSON string to be copied
    console.log("\n\n--- GENERATED CONTENT JSON ---");
    console.log(JSON.stringify(generatedContent, null, 2));
}

generateContent();

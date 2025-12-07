import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://genai4code.com',
        'X-Title': 'GenAI4Code AI Tutor',
    },
});

export const maxDuration = 60;

export async function POST(req: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const { message, courseTitle, courseContent } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Mock Mode Logic
        if (!apiKey || apiKey === 'dummy-key') {
            console.log('Using Mock Course Chat Mode');

            // Simple keyword matching against course content
            const lowerMessage = message.toLowerCase();
            const contentLines = courseContent.split('\n');
            let relevantContent = "";

            // Find paragraphs containing keywords from the message
            const keywords = lowerMessage.split(' ').filter((w: string) => w.length > 3);
            for (const line of contentLines) {
                if (keywords.some((k: string) => line.toLowerCase().includes(k))) {
                    relevantContent += line + "\n";
                    if (relevantContent.length > 500) break; // Limit context
                }
            }

            let mockReply = `I can help you understand **${courseTitle}**. Ask me specific questions about the content!`;

            if (relevantContent) {
                mockReply = `Based on the course material:\n\n${relevantContent}\n\nDoes that help clarify things?`;
            } else {
                mockReply = `I couldn't find a specific answer in the course material for that. However, generally speaking, **${courseTitle}** covers this topic. Could you rephrase your question?`;
            }

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            return NextResponse.json({ reply: mockReply });
        }

        const systemPrompt = `
            You are an expert AI Tutor for the course: "${courseTitle}".
            
            Your goal is to help the student understand the material in this course.
            Use the following course content as your primary knowledge base:
            
            ---
            ${courseContent.slice(0, 20000)} // Limit context to avoid token limits if content is huge
            ---
            
            Instructions:
            1. Answer the student's question based on the course material provided above.
            2. If the answer is not in the course material, you can use your general knowledge but mention that it's outside the specific course scope.
            3. Be encouraging, clear, and concise.
            4. Use markdown for code snippets or formatting if needed.
            5. Keep your answers under 3-4 paragraphs unless a detailed explanation is requested.
        `;

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
            ],
        });

        const reply = completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Course Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process your request' },
            { status: 500 }
        );
    }
}

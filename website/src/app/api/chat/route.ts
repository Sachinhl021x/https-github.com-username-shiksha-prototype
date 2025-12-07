import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { ENGINEERING_TOPICS } from '@/mockData';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || 'dummy-key',
    defaultHeaders: {
        'HTTP-Referer': 'https://genai4code.com', // Replace with your actual site URL
        'X-Title': 'GenAI4Code',
    },
});

export async function POST(request: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    let { messages, context } = await request.json(); // Moved out of try block for scope access
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    const getMockResponse = async () => {
        console.log('Using Mock Chat Mode');

        // Simple keyword matching against engineering topics
        const matchedTopic = ENGINEERING_TOPICS.find(topic =>
            lastMessage.includes(topic.title.toLowerCase()) ||
            lastMessage.includes(topic.slug.replace(/-/g, ' ')) ||
            topic.description.toLowerCase().includes(lastMessage)
        );

        let mockReply = "I'm Shiksha AI. I can help you with engineering topics like LLMs, System Design, and AI Ethics. Try asking about 'LLM Fundamentals' or 'System Design'.";

        if (matchedTopic) {
            mockReply = `**${matchedTopic.title}**\n\n${matchedTopic.description}\n\nWould you like to dive deeper into this topic?`;
        } else if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
            mockReply = "Hello! I'm your engineering assistant. Ask me about software architecture, AI models, or research papers.";
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            role: 'assistant',
            content: mockReply
        });
    };

    // Mock Mode Logic (Explicit or Missing Key)
    if (!apiKey || apiKey === 'dummy-key') {
        return getMockResponse();
    }

    try {
        // Real API Call
        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful AI research assistant. You are helping a user understand a research paper.
Here is the content of the paper:
${context}

Answer the user's questions based on this paper. If the answer is not in the paper, say so.`,
                },
                ...messages,
            ],
        });

        return NextResponse.json(completion.choices[0].message);
    } catch (error) {
        console.error('Error in chat API (falling back to mock):', error);
        return getMockResponse();
    }
}

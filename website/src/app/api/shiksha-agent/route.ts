import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: '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', // User provided OpenRouter key
    defaultHeaders: {
        'HTTP-Referer': 'https://shiksha.app',
        'X-Title': 'Shiksha',
    },
});

const ORCHESTRATOR_PROMPT = `
You are the Orchestrator Agent for Shiksha. Your job is to analyze the user's message and route it to the correct specialized agent.
Available Agents:
1. "TUTOR": For general explanations, concepts, and follow-up questions.
2. "QUIZ": If the user explicitly asks for a quiz, test, or practice question.
3. "CODER": If the user asks for code examples, implementation details, or debugging help.

Output ONLY the agent name: "TUTOR", "QUIZ", or "CODER".
`;

const TUTOR_PROMPT = `
You are the Shiksha Tutor Agent.
Goal: Explain complex engineering concepts simply and clearly.
Context: {{COURSE_CONTEXT}}
Language: {{LANGUAGE}}
Tone: Encouraging, patient, professional.
Instructions:
- Use analogies.
- Keep it concise.
- Answer strictly based on context.
`;

const QUIZ_PROMPT = `
You are the Shiksha Quiz Agent.
Goal: Test the user's understanding of the course material.
Context: {{COURSE_CONTEXT}}
Language: {{LANGUAGE}}
Instructions:
- Generate ONE multiple-choice question based on the context.
- Provide 4 options (A, B, C, D).
- Do NOT reveal the answer immediately. Ask the user to reply with their choice.
`;

const CODER_PROMPT = `
You are the Shiksha Coder Agent.
Goal: Provide production-ready code examples.
Context: {{COURSE_CONTEXT}}
Language: {{LANGUAGE}} (Comments/Explanation in this language)
Instructions:
- Provide clean, commented code.
- Use Python/PyTorch for LLM topics.
- Explain the key parts of the code.
`;

export async function POST(request: Request) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const { message, history, courseTitle, courseContent, language = 'English' } = await request.json();

    // For prototype, we are using the hardcoded key above, so we skip the env var check.
    // if (!apiKey || apiKey === 'dummy-key') { ... }

    try {
        // Step 1: Orchestrator decides intent
        const orchestratorCompletion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [
                { role: 'system', content: ORCHESTRATOR_PROMPT },
                { role: 'user', content: message }
            ],
            temperature: 0.1, // Low temp for deterministic routing
        });

        const intent = orchestratorCompletion.choices[0].message.content?.trim().toUpperCase() || 'TUTOR';
        console.log(`[Orchestrator] Routed to: ${intent}`);

        // Step 2: Select Agent Prompt
        let selectedSystemPrompt = TUTOR_PROMPT;
        if (intent.includes('QUIZ')) selectedSystemPrompt = QUIZ_PROMPT;
        if (intent.includes('CODER')) selectedSystemPrompt = CODER_PROMPT;

        // Step 3: Execute Agent
        let systemPrompt = selectedSystemPrompt.replace('{{COURSE_CONTEXT}}', `Course: ${courseTitle}\n\nContent:\n${courseContent.substring(0, 20000)}...`);
        systemPrompt = systemPrompt.replace('{{LANGUAGE}}', language);

        // Construct messages with history
        const apiMessages = [
            { role: 'system', content: systemPrompt },
            ...(history || []).map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const completion = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: apiMessages as any,
            temperature: 0.7,
        });

        return NextResponse.json({
            reply: completion.choices[0].message.content,
            agent: intent // Optional: return which agent handled it
        });
    } catch (error: any) {
        console.error('Error in Shiksha Agent API:', error);
        if (error.response) {
            console.error('API Response Status:', error.response.status);
            console.error('API Response Data:', error.response.data);
        }
        return NextResponse.json(
            { error: 'Failed to process request', details: error.message },
            { status: 500 }
        );
    }
}

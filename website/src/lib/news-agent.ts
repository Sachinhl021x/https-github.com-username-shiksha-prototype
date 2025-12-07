import { search } from 'duck-duck-scrape';
import OpenAI from 'openai';
import { newsService, GeneratedArticle } from './news-service';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://genai4code.com',
        'X-Title': 'GenAI4Code Research Agent',
    },
});

// Utility to wait and avoid rate limits
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class NewsAgent {
    private model: string;

    constructor(model = 'google/gemini-2.0-flash-exp:free') {
        this.model = model;
    }

    async generateNewsStories(): Promise<GeneratedArticle[]> {
        console.log('[NewsAgent] Starting Newsroom Pipeline...');

        // 1. Editor-in-Chief: Brainstorm Story Angles
        let angles;
        try {
            angles = await this.brainstormAngles();
            console.log(`[NewsAgent] Brainstormed ${angles.length} angles:`, angles.map(a => a.title));
        } catch (error) {
            console.error('[NewsAgent] Fatal error in brainstorming:', error);
            return [];
        }

        if (!angles || angles.length === 0) {
            console.error('[NewsAgent] No angles to process');
            return [];
        }

        const generatedArticles: GeneratedArticle[] = [];

        // 2. Journalist: Research and Write each story
        for (let i = 0; i < angles.length; i++) {
            const angle = angles[i];
            try {
                console.log(`[NewsAgent] [${i + 1}/${angles.length}] Processing: "${angle.title}"`);

                // Add delay between requests to avoid rate limiting
                if (i > 0) {
                    console.log(`[NewsAgent] Waiting 2s to avoid rate limits...`);
                    await sleep(2000);
                }

                // Search
                const searchResults = await this.performSearch(angle.query);
                console.log(`[NewsAgent] [${i + 1}/${angles.length}] Found ${searchResults.length} search results`);

                // Write with fallback content if no search results
                const article = await this.writeArticle(angle, searchResults);

                if (article) {
                    console.log(`[NewsAgent] [${i + 1}/${angles.length}] Article written successfully, saving...`);
                    newsService.saveArticle(article);
                    generatedArticles.push(article);
                    console.log(`[NewsAgent] [${i + 1}/${angles.length}] Article saved: "${article.title}"`);
                } else {
                    console.error(`[NewsAgent] [${i + 1}/${angles.length}] Failed to write article`);
                }
            } catch (error) {
                console.error(`[NewsAgent] [${i + 1}/${angles.length}] Error processing "${angle.title}":`, error);
                // Continue to next story instead of failing completely
                continue;
            }
        }

        console.log(`[NewsAgent] Newsroom Pipeline Complete. Generated ${generatedArticles.length} articles.`);
        return generatedArticles;
    }

    private async brainstormAngles(): Promise<{ title: string; query: string; focus: string }[]> {
        const today = new Date().toLocaleDateString();
        const prompt = `
            You are the Editor-in-Chief of a top AI Tech Publication.
            Today is ${today}.
            Identify 3 distinct, high-impact story angles based on likely breaking news or major trends in AI right now.
            Avoid generic "AI is growing" stories. Look for specific model releases, benchmarks, or corporate moves.
            
            Return a JSON object with an "angles" array containing exactly 3 objects, each with:
            - title: A catchy headline
            - query: A specific search query to find facts for this story
            - focus: What specific details the journalist should look for
            
            Example format: {"angles": [{"title": "DeepSeek V3 Crushes Benchmarks", "query": "DeepSeek V3 benchmark results vs GPT-4", "focus": "Technical specs and coding performance"}, {...}, {...}]}
            
            IMPORTANT: Return exactly 3 distinct angles.
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0].message.content || '{"angles": []}';
            console.log('[NewsAgent] Raw brainstorm response:', content);

            const parsed = JSON.parse(content);
            const angles = parsed.angles || [];

            console.log(`[NewsAgent] Brainstormed ${angles.length} angles`);

            if (angles.length === 0) {
                console.error('[NewsAgent] No angles returned, using fallback');
                return this.getFallbackAngles();
            }

            return angles;
        } catch (error) {
            console.error('[NewsAgent] Brainstorming failed:', error);
            return this.getFallbackAngles();
        }
    }

    private getFallbackAngles(): { title: string; query: string; focus: string }[] {
        return [
            {
                title: "AI Model Breakthrough: Latest Advances in Large Language Models",
                query: "latest LLM releases 2025",
                focus: "Model architecture and performance metrics"
            },
            {
                title: "GPU Wars: NVIDIA vs AMD in the AI Acceleration Race",
                query: "NVIDIA AMD AI chips 2025",
                focus: "Hardware specifications and pricing"
            },
            {
                title: "Enterprise AI Adoption Surges: What Companies Are Doing Differently",
                query: "enterprise AI adoption trends 2025",
                focus: "Use cases and ROI data"
            }
        ];
    }

    private async performSearch(query: string): Promise<any[]> {
        try {
            const results = await search(query, { safeSearch: 0, time: 'd' });
            return results.results.slice(0, 5).map(r => ({
                title: r.title,
                url: r.url,
                snippet: r.description
            }));
        } catch (error) {
            console.error(`Search failed for "${query}":`, error);
            // Return fallback generic context instead of empty array
            return [{
                title: "AI Industry Overview",
                url: "https://example.com",
                snippet: "The AI industry continues to evolve rapidly with new developments in models, hardware, and applications."
            }];
        }
    }

    private async writeArticle(angle: { title: string; focus: string }, searchResults: any[]): Promise<GeneratedArticle | null> {
        const today = new Date().toISOString();
        const context = JSON.stringify(searchResults, null, 2);

        const prompt = `
            You are a Senior AI Journalist.
            Write a full news article based on the following research.
            
            Headline: ${angle.title}
            Focus: ${angle.focus}
            Research Data: ${context}
            
            Requirements:
            1. **Format**: Return a JSON object with:
               - "title": Final engaging headline
               - "excerpt": 2-sentence summary
               - "content": Full article in Markdown (at least 500 words). Use ## headers.
               - "tags": Array of 3-5 keywords
               - "slug": URL-friendly slug (e.g., "deepseek-v3-release")
            2. **Style**: Professional, technical, objective. No fluff.
            3. **Images**: I will handle images later, just write the text.
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: this.model,
                messages: [{ role: 'user', content: prompt }],
                response_format: { type: 'json_object' }
            });

            const content = completion.choices[0].message.content;
            if (!content) return null;

            const parsed = JSON.parse(content);

            // Basic validation
            if (!parsed.title || !parsed.content) return null;

            return {
                id: uuidv4(),
                title: parsed.title,
                slug: parsed.slug || angle.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                excerpt: parsed.excerpt || '',
                content: parsed.content,
                author: 'AI Research Agent',
                date: today,
                tags: parsed.tags || ['AI', 'Tech'],
                imageUrl: this.getImageForTopic(parsed.title, parsed.tags || ['AI']),
                sourceUrl: searchResults[0]?.url
            };
        } catch (error) {
            console.error('Writing failed:', error);
            return null;
        }
    }

    private getImageForTopic(title: string, tags: string[]): string {
        // Use Pollinations.ai to generate a dynamic image based on the title
        // We add some keywords to ensure a good style
        const prompt = `${title}, ${tags.join(', ')}, cinematic lighting, highly detailed, 8k, tech news style, futuristic`;
        const encodedPrompt = encodeURIComponent(prompt);
        // Add a random seed to ensure uniqueness even for similar titles
        const seed = Math.floor(Math.random() * 1000);
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${seed}&model=flux`;
    }
}

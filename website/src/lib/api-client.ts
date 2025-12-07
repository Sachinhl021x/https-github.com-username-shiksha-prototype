export interface ResearchPaper {
    id: string;
    title: string;
    summary: string;
    publishedAt: string;
    authors: string[];
    url: string;
    codeRepository?: string;
    pdfUrl?: string;
}

export interface NewsItem {
    id: string;
    title: string;
    excerpt: string;
    date: string;
    url: string;
    source: string;
    category: string;
    imageUrl?: string;
}

export interface GeneratedArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    date: string;
    imageUrl?: string;
    tags: string[];
}

export async function getTrendingPapers(): Promise<ResearchPaper[]> {
    const res = await fetch('/api/research/trending');
    if (!res.ok) throw new Error('Failed to fetch trending papers');
    return res.json();
}

export async function searchPapers(query: string): Promise<ResearchPaper[]> {
    const res = await fetch(`/api/research/search?query=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Failed to search papers');
    return res.json();
}

export async function getPaperDetails(id: string): Promise<ResearchPaper> {
    const res = await fetch(`/api/research/paper?id=${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch paper details');
    return res.json();
}

export async function getAiNews(filter?: string): Promise<NewsItem[]> {
    const url = filter ? `/api/news?filter=${encodeURIComponent(filter)}` : '/api/news';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch AI news');
    return res.json();
}

export async function getGeneratedNews(): Promise<GeneratedArticle[]> {
    const res = await fetch('/api/news/generated');
    if (!res.ok) throw new Error('Failed to fetch generated news');
    return res.json();
}

export async function getGeneratedArticle(slug: string): Promise<GeneratedArticle> {
    const res = await fetch(`/api/news/generated?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error('Failed to fetch generated article');
    return res.json();
}

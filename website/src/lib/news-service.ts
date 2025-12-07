import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/data/news-store.json');

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
    sourceUrl?: string;
}

export class NewsService {
    private getStore(): GeneratedArticle[] {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        try {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to read news store:', error);
            return [];
        }
    }

    private saveStore(articles: GeneratedArticle[]) {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2));
        } catch (error) {
            console.error('Failed to save news store:', error);
        }
    }

    getAllArticles(): GeneratedArticle[] {
        return this.getStore().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    getArticleBySlug(slug: string): GeneratedArticle | undefined {
        return this.getStore().find(a => a.slug === slug);
    }

    saveArticle(article: GeneratedArticle) {
        const articles = this.getStore();
        // Check if article with same slug exists
        const existingIndex = articles.findIndex(a => a.slug === article.slug);

        if (existingIndex >= 0) {
            articles[existingIndex] = article;
        } else {
            articles.push(article);
        }

        this.saveStore(articles);
    }
}

export const newsService = new NewsService();

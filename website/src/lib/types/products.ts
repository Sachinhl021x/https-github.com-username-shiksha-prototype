export enum ProductCategory {
    CODE_DEVELOPMENT = 'Code & Development',
    CONTENT_CREATION = 'Content Creation',
    PRODUCTIVITY = 'Productivity & Automation',
    DATA_ANALYTICS = 'Data & Analytics',
    CUSTOMER_SERVICE = 'Customer Service',
    DESIGN_CREATIVE = 'Design & Creative',
    MARKETING_SALES = 'Marketing & Sales',
    ADVERTISING_BRANDING = 'Advertising & Branding',
    SOCIAL_MEDIA = 'Social Media',
    RETAIL_SHOPPING = 'Retail & Shopping',
    HEALTHCARE = 'Healthcare',
    CONSUMER_TOOLS = 'Consumer Tools',
}

export enum PricingModel {
    FREE = 'Free',
    FREEMIUM = 'Freemium',
    PAID = 'Paid',
}

export interface Rating {
    thumbsUp: number;
    thumbsDown: number;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    description: string;
    fullDescription: string;
    category: ProductCategory;
    tags: string[];
    useCases: string[];
    demoVideoUrl?: string;
    launchDate: string;
    website: string;
    pricing: PricingModel;
    rating: Rating;
    featured?: boolean;
}

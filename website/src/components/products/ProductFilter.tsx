'use client';

import React from 'react';
import { ProductCategory } from '@/lib/types/products';

interface ProductFilterProps {
    selectedCategory: ProductCategory | 'All';
    onCategoryChange: (category: ProductCategory | 'All') => void;
    productCounts: Record<string, number>;
}

export default function ProductFilter({ selectedCategory, onCategoryChange, productCounts }: ProductFilterProps) {
    const categories = [
        { value: 'All' as const, label: 'All Products' },
        { value: ProductCategory.CODE_DEVELOPMENT, label: 'Code & Dev' },
        { value: ProductCategory.CONTENT_CREATION, label: 'Content' },
        { value: ProductCategory.PRODUCTIVITY, label: 'Productivity' },
        { value: ProductCategory.DATA_ANALYTICS, label: 'Data & Analytics' },
        { value: ProductCategory.CUSTOMER_SERVICE, label: 'Customer Service' },
        { value: ProductCategory.DESIGN_CREATIVE, label: 'Design' },
        { value: ProductCategory.MARKETING_SALES, label: 'Marketing & Sales' },
        { value: ProductCategory.ADVERTISING_BRANDING, label: 'Advertising' },
        { value: ProductCategory.SOCIAL_MEDIA, label: 'Social Media' },
        { value: ProductCategory.RETAIL_SHOPPING, label: 'Retail' },
        { value: ProductCategory.HEALTHCARE, label: 'Healthcare' },
        { value: ProductCategory.CONSUMER_TOOLS, label: 'Consumer Tools' },
    ];

    return (
        <div className="mb-8 overflow-x-auto">
            <div className="flex gap-3 pb-2">
                {categories.map((category) => {
                    const count = productCounts[category.value] || 0;
                    const isActive = selectedCategory === category.value;

                    return (
                        <button
                            key={category.value}
                            onClick={() => onCategoryChange(category.value)}
                            className={`
                px-4 py-2 rounded-lg border-2 font-bold text-sm whitespace-nowrap transition-all
                ${isActive
                                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-black hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                }
              `}
                        >
                            {category.label}
                            <span className={`ml-2 ${isActive ? 'text-gray-300' : 'text-gray-500'}`}>
                                ({count})
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

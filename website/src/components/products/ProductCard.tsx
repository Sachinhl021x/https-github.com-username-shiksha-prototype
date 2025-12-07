import React from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/products';
import { ThumbsUp, ThumbsDown, Tag } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
    const totalVotes = product.rating.thumbsUp + product.rating.thumbsDown;
    const approvalRate = totalVotes > 0
        ? Math.round((product.rating.thumbsUp / totalVotes) * 100)
        : 0;

    const getPricingColor = (pricing: string) => {
        switch (pricing) {
            case 'Free':
                return 'bg-green-100 text-green-700';
            case 'Freemium':
                return 'bg-blue-100 text-blue-700';
            case 'Paid':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Generate a color for the logo placeholder based on index
    const logoColors = [
        'bg-gradient-to-br from-pink-400 to-rose-400',
        'bg-gradient-to-br from-blue-400 to-cyan-400',
        'bg-gradient-to-br from-purple-400 to-indigo-400',
        'bg-gradient-to-br from-green-400 to-emerald-400',
        'bg-gradient-to-br from-orange-400 to-amber-400',
        'bg-gradient-to-br from-red-400 to-pink-400',
    ];
    const logoColor = logoColors[index % logoColors.length];

    return (
        <Link href={`/products/${product.slug}`} className="block group">
            <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex gap-4">
                    {/* Logo */}
                    <div className={`flex-shrink-0 w-16 h-16 ${logoColor} rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-sm`}>
                        {product.name.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Title and Number */}
                        <div className="flex items-start gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {index + 1}. {product.name}
                            </h3>
                            <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-semibold rounded ${getPricingColor(product.pricing)}`}>
                                {product.pricing}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Tags/Categories */}
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <Tag className="w-3.5 h-3.5" />
                            {product.tags.slice(0, 3).map((tag, idx) => (
                                <React.Fragment key={idx}>
                                    <span className="font-medium">{tag}</span>
                                    {idx < Math.min(product.tags.length, 3) - 1 && (
                                        <span className="text-gray-400">•</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Rating - Right Side */}
                    <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="flex items-center gap-1 text-green-600">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="font-semibold">{product.rating.thumbsUp}</span>
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                                <ThumbsDown className="w-4 h-4" />
                                <span className="font-semibold">{product.rating.thumbsDown}</span>
                            </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                            {approvalRate}% approval
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

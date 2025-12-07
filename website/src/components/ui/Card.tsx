import React from 'react';
import Link from 'next/link';

interface CardProps {
    title: string;
    description?: string;
    imageUrl?: string;
    href?: string;
    className?: string;
    children?: React.ReactNode;
    footer?: React.ReactNode;
    shadowColor?: 'yellow' | 'cyan' | 'pink';
}

export function Card({ title, description, imageUrl, href, className = "", children, footer, shadowColor = 'yellow' }: CardProps) {
    const shadowColors = {
        yellow: 'shadow-[4px_4px_0px_0px_rgba(255,215,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,215,0,1)]',
        cyan: 'shadow-[4px_4px_0px_0px_rgba(0,217,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,217,255,1)]',
        pink: 'shadow-[4px_4px_0px_0px_rgba(255,107,157,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,107,157,1)]',
    };

    const Content = () => (
        <div className={`group relative overflow-hidden rounded-xl bg-white border-4 border-black ${shadowColors[shadowColor]} hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200 h-full flex flex-col ${className}`}>
            {imageUrl && (
                <div className="aspect-video w-full overflow-hidden shrink-0 border-b-4 border-black">
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-black mb-2 line-clamp-2 text-black">{title}</h3>
                {description && <p className="text-gray-700 mb-4 line-clamp-3 flex-grow font-medium">{description}</p>}
                {children}
                {footer && <div className="mt-auto pt-4">{footer}</div>}
            </div>
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="block">
                <Content />
            </Link>
        );
    }

    return <Content />;
}

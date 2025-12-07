import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';

export default function NewsletterSignup() {
    return (
        <div className="w-full bg-gradient-to-br from-primary/5 via-card to-card border border-border/50 rounded-3xl p-8 md:p-12 my-20 relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                        <Mail className="w-3 h-3" />
                        <span>Weekly Intelligence</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                        Stay Ahead of the Curve
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Join 10,000+ AI engineers and researchers receiving our weekly breakdown of the most critical developments in Artificial Intelligence.
                    </p>
                </div>

                <div className="w-full md:w-auto min-w-[350px]">
                    <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-4 pr-12 py-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
                        >
                            Subscribe Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-center text-muted-foreground">
                            No spam. Unsubscribe anytime.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { Github, Star, GitFork } from 'lucide-react';

interface CodeCardProps {
    repositoryUrl: string;
}

export default function CodeCard({ repositoryUrl }: CodeCardProps) {
    // Extract owner and repo from URL for display
    // e.g., https://github.com/facebookresearch/llama
    const match = repositoryUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    const repoName = match ? `${match[1]}/${match[2]}` : 'Official Repository';

    return (
        <div className="bg-gray-900 text-white rounded-xl p-6 mb-8 shadow-lg transform transition-all hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Github className="w-8 h-8" />
                    <div>
                        <h3 className="font-bold text-lg">Official Implementation</h3>
                        <p className="text-gray-400 text-sm">{repoName}</p>
                    </div>
                </div>
                <a
                    href={repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                >
                    View Code
                </a>
            </div>

            <div className="flex gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span>High Impact</span>
                </div>
                <div className="flex items-center gap-2">
                    <GitFork className="w-4 h-4 text-blue-400" />
                    <span>Open Source</span>
                </div>
            </div>
        </div>
    );
}

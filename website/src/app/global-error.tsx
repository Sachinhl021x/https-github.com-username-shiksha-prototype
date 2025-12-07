'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center space-y-4 p-8">
                        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
                        <p className="text-gray-600">
                            {error.message || 'A critical error occurred.'}
                        </p>
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}

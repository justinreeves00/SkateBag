"use client";

import { useEffect } from "react";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("GlobalErrorBoundary caught an error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                className="text-red-500"
              >
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            
            <h2 className="text-2xl font-black uppercase tracking-tight italic">
              Critical Error
            </h2>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              We encountered a critical error that prevented the application from loading. Please try again or refresh the page.
            </p>
            
            {process.env.NODE_ENV === "development" && (
              <div className="text-left bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs font-mono text-red-400 mb-2">Error details:</p>
                <pre className="text-xs font-mono text-slate-400 overflow-auto">
                  {error.message}
                  {error.digest && `

Digest: ${error.digest}`}
                </pre>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-[var(--board-accent)] text-black font-black uppercase tracking-widest text-xs rounded-lg hover:brightness-110 transition-all"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white/10 transition-all"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

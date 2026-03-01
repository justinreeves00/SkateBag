export function SkateBagLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      {/* Skateboard sticking out top-left */}
      <g transform="rotate(-35 8 8) translate(-2 -4)">
        <path d="M18 11h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2h2" strokeWidth="1.5" opacity="0.8" />
        <circle cx="7" cy="11" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="17" cy="11" r="1.5" fill="currentColor" stroke="none" />
        <path d="M6 15h12" strokeWidth="1.5" opacity="0.8" />
      </g>

      {/* The Bag (Backpack shape) */}
      <path d="M6 8V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" />
      <rect x="4" y="8" width="16" height="13" rx="3" />
      <path d="M4 12h16" />
      <path d="M9 12v4a3 3 0 0 0 6 0v-4" />
    </svg>
  );
}

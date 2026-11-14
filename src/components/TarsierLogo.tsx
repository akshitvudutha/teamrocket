import React from 'react';

interface TarsierLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export const TarsierLogo: React.FC<TarsierLogoProps> = ({
  className = '',
  size = 28,
  showWordmark = true,
  wordmarkClassName = '',
}) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Tarsier Observant Aperture Icon */}
      <div
        className="relative flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-[1.5px] shadow-sm shrink-0"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-[var(--bg-canvas)] flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-4 h-4 text-indigo-400"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Outer watchful iris */}
            <circle cx="12" cy="12" r="9" className="opacity-80" />
            {/* Inner pupil */}
            <circle cx="12" cy="12" r="4.5" className="fill-indigo-500/20 stroke-indigo-400" />
            {/* Keen center reflection / sensor */}
            <circle cx="12" cy="12" r="1.5" className="fill-emerald-400 stroke-none" />
            {/* Dynamic observation beam */}
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" className="opacity-40" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex items-center space-x-1.5">
          <span
            className={`font-semibold tracking-wider text-[var(--text-primary)] text-sm ${wordmarkClassName}`}
          >
            TARSIER
          </span>
          <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded-full bg-[var(--tag-bg)] text-indigo-400 border border-[var(--border-subtle)]">
            AI
          </span>
        </div>
      )}
    </div>
  );
};

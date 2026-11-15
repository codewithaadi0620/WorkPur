import React from 'react';
import { Link } from 'react-router-dom';

/**
 * WorkPur Modern Enterprise Logo Component
 * Combines an intertwined geometric 'W' & 'P' nexus mark with refined brand typography.
 * 
 * Props:
 * - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - showText: boolean (default: true)
 * - showTagline: boolean (default: true)
 * - variant: 'default' | 'light' | 'dark' (default: 'default')
 * - asLink: boolean (default: false)
 * - to: string (default: '/')
 * - className: string
 */
export function LogoIcon({ size = 'md', className = '' }) {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 group ${dim} ${className}`}>
      {/* Dynamic ambient halo on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-violet-600/30 to-emerald-400/20 blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
      
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-md"
      >
        <defs>
          {/* Background Squircle Gradient */}
          <linearGradient id="wp-bg-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Left Wing ('W' Stroke) */}
          <linearGradient id="wp-w-gradient" x1="10" y1="12" x2="26" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          {/* Right Arch ('P' Loop & Escrow Nexus) */}
          <linearGradient id="wp-p-gradient" x1="20" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>

          {/* Core Bridge Gradient */}
          <linearGradient id="wp-bridge" x1="18" y1="20" x2="30" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Squircle Base with subtle specular rim */}
        <rect
          x="1.5"
          y="1.5"
          width="45"
          height="45"
          rx="12"
          fill="url(#wp-bg-gradient)"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Left Segment: Sharp 'W' descent and rise */}
        <path
          d="M12 15L17.5 33C17.7 33.6 18.5 33.8 19 33.3L23 28L18.5 15H14C12.8 15 12 15 12 15Z"
          fill="url(#wp-w-gradient)"
        />

        {/* Intersecting central facet: Connecting bridge */}
        <path
          d="M18.8 24.5L23.8 15H28.2L22.5 28.5L18.8 24.5Z"
          fill="url(#wp-bridge)"
          opacity="0.95"
        />

        {/* Right Segment: Elevated 'P' loop with curved head */}
        <path
          d="M26 15H31.5C35.2 15 37.8 17.6 37.8 21.2C37.8 24.8 35.2 27.5 31.5 27.5H27.5L25 33H21.5L26 15ZM27.8 24H31.3C33.2 24 34.5 22.8 34.5 21.2C34.5 19.6 33.2 18.5 31.3 18.5H29.1L27.8 24Z"
          fill="url(#wp-p-gradient)"
        />

        {/* Atomic Escrow Trust Spark (Upper Right Gem) */}
        <circle cx="36.5" cy="13.5" r="2.2" fill="#34D399" />
        <circle cx="36.5" cy="13.5" r="3.5" stroke="#10B981" strokeWidth="0.8" opacity="0.6" />
      </svg>
    </div>
  );
}

export default function Logo({
  size = 'md',
  showText = true,
  showTagline = true,
  variant = 'default',
  asLink = false,
  to = '/',
  className = '',
}) {
  const textSizeMap = {
    xs: { title: 'text-sm', tag: 'text-[7px]' },
    sm: { title: 'text-base', tag: 'text-[8px]' },
    md: { title: 'text-xl', tag: 'text-[9px]' },
    lg: { title: 'text-2xl', tag: 'text-[10px]' },
    xl: { title: 'text-3xl', tag: 'text-[11px]' },
  };

  const textStyle = textSizeMap[size] || textSizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      <LogoIcon size={size} />

      {showText && (
        <div className="flex flex-col select-none">
          <div className="flex items-center">
            <span
              className={`font-black tracking-tight ${
                variant === 'light'
                  ? 'text-white'
                  : 'text-slate-900 dark:text-white'
              } ${textStyle.title}`}
            >
              Work
            </span>
            <span
              className={`font-black tracking-tight bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent ${textStyle.title}`}
            >
              Pur
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 shadow-sm shadow-emerald-400 animate-pulse" />
          </div>

          {showTagline && (
            <span
              className={`font-bold tracking-widest uppercase -mt-0.5 ${
                variant === 'light'
                  ? 'text-slate-400'
                  : 'text-slate-400 dark:text-slate-500'
              } ${textStyle.tag}`}
            >
              Enterprise Talent
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link to={to} className="inline-flex focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}

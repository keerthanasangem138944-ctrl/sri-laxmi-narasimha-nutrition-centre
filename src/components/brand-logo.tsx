import React from 'react';

export interface BrandLogoProps {
  /**
   * Display size variant:
   * - 'header': responsive 36-44px (mobile), 44-56px (tablet), 48-64px (desktop)
   * - 'sm': compact 32-36px
   * - 'md': standard 44-48px
   * - 'lg': prominent 56-64px
   * - 'xl': hero / showcase 72-96px
   */
  size?: 'header' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  /**
   * 'full': Complete official logo asset with 3-leaf emblem and full text
   * 'emblem': Square 3-leaf emblem only
   */
  variant?: 'full' | 'emblem';
  /**
   * Whether to display the text next to emblem when variant is 'emblem'
   * or when showing full branding
   */
  showText?: boolean;
  className?: string;
  imgClassName?: string;
  linkToHome?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'header',
  variant = 'full',
  showText = false,
  className = '',
  imgClassName = '',
  linkToHome = false,
  onClick,
}) => {
  // Height definitions adhering strictly to specification:
  // Desktop: 48-64px, Tablet: 44-56px, Mobile: 36-44px
  const sizeClasses = {
    header: 'h-9 sm:h-11 md:h-12 lg:h-14 w-auto max-w-[240px] sm:max-w-[280px] md:max-w-[320px]',
    sm: 'h-8 sm:h-9 w-auto',
    md: 'h-10 sm:h-12 w-auto',
    lg: 'h-14 sm:h-16 w-auto',
    xl: 'h-20 sm:h-24 w-auto',
    custom: '',
  };

  const imageSrc = variant === 'emblem'
    ? '/images/sri-laxmi-narasimha-icon.png'
    : '/images/sri-laxmi-narasimha-logo.png';

  const content = (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`} id="brand-logo-container">
      <img
        src={imageSrc}
        alt="Sri Laxmi Narasimha Nutrition Centre"
        id="brand-logo-image"
        className={`object-contain transition-transform duration-200 ${sizeClasses[size]} ${imgClassName}`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
      />
      {showText && (
        <div className="flex flex-col text-left leading-tight" id="brand-logo-text-block">
          <span className="font-serif font-bold text-slate-900 text-sm sm:text-base md:text-lg tracking-tight">
            Sri Laxmi Narasimha
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-emerald-800 tracking-wider uppercase">
            Nutrition Centre
          </span>
        </div>
      )}
    </div>
  );

  if (linkToHome || onClick) {
    return (
      <a
        href="/"
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick();
          }
        }}
        id="brand-logo-link"
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg group"
        aria-label="Sri Laxmi Narasimha Nutrition Centre - Return to Homepage"
      >
        {content}
      </a>
    );
  }

  return content;
};

export default BrandLogo;

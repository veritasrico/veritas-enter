import React from 'react';

interface VeritasLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  badge?: boolean;
}

/**
 * Official Brand Logo Component for PT NUSA VERITAS INSPEKTAMA
 * Displays the authentic high-resolution molecular network graphic:
 * /assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png
 */
export const VeritasLogo: React.FC<VeritasLogoProps> = ({
  className = 'h-9 w-9',
  size,
  showText = false,
  textColor = 'text-slate-900 dark:text-white',
  badge = true,
}) => {
  const logoImage = (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-lg overflow-hidden select-none transition-transform ${
        badge
          ? 'bg-white p-0.5 shadow-2xs border border-slate-200/80 dark:border-slate-700/80'
          : ''
      } ${className}`}
      style={size ? { width: size, height: size } : undefined}
      title="PT NUSA VERITAS INSPEKTAMA"
    >
      <img
        src="/assets/aistudio/Abstract_Blue_Molecular_Network_fe9a48c2.png"
        alt="PT Nusa Veritas Inspektama Logo"
        className="h-full w-full object-contain block"
        loading="eager"
        decoding="async"
      />
    </div>
  );

  if (!showText) {
    return logoImage;
  }

  return (
    <div className="inline-flex items-center gap-2.5 select-none shrink-0">
      {logoImage}
      <div className="flex flex-col">
        <span className={`text-sm sm:text-base font-black tracking-tight leading-none ${textColor}`}>
          VERITAS
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Inspektama
        </span>
      </div>
    </div>
  );
};

export default VeritasLogo;

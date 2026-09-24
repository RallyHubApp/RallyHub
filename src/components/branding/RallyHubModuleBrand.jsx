import React from 'react';

const RALLYHUB_MARK_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

export default function RallyHubModuleBrand({ moduleName, pageLabel, align = 'center', className = '' }) {
  const alignment = align === 'left' ? 'items-start' : 'items-center';
  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      <div className="flex items-center gap-2">
        <img src={RALLYHUB_MARK_URL} alt="RallyHub logo" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
        <div className="text-left">
          <div className="text-lg sm:text-xl font-black leading-none tracking-[-.04em] text-[#081342] dark:text-white">
            Rally<span className="text-[#078e48]">Hub</span>
          </div>
          {moduleName && <div className="mt-1 text-[9px] sm:text-[10px] font-black uppercase tracking-[.2em] text-[#0c1e53] dark:text-slate-200">{moduleName}</div>}
        </div>
      </div>
      {pageLabel && <p className="mt-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">{pageLabel}</p>}
    </div>
  );
}

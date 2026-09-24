import React from 'react';

const RALLYHUB_MARK_URL = 'https://media.base44.com/images/public/6a01dc00702b7dd2a2978c28/2041005ec_logo_fixed.png';

function ClubChip({ club }) {
  if (!club?.name && !club?.logo_url) return null;
  const primary = club.primary_colour || 'hsl(var(--primary))';
  const secondary = club.secondary_colour || primary;
  return (
    <div
      className="flex min-w-0 items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm"
      style={{ borderTopWidth: 4, borderTopColor: primary, borderBottomWidth: 2, borderBottomColor: secondary }}
    >
      {club.logo_url && (
        <img
          src={club.logo_url}
          alt={club.name ? `${club.name} logo` : 'Club logo'}
          className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-1"
        />
      )}
      {club.name && <span className="min-w-0 truncate text-sm font-black text-foreground">{club.name}</span>}
    </div>
  );
}

export default function RallyHubPublicBrand({
  moduleName,
  pageLabel,
  club = null,
  clubs = [],
  align = 'center',
  className = '',
}) {
  const identityClubs = clubs?.length ? clubs : club ? [club] : [];
  const alignment = align === 'left' ? 'items-start' : 'items-center';
  const chipsAlignment = align === 'left' ? 'justify-start' : 'justify-center';

  return (
    <div className={`flex flex-col ${alignment} ${className}`}>
      <div className="flex items-center gap-2">
        <img src={RALLYHUB_MARK_URL} alt="RallyHub" className="h-8 w-8 object-contain sm:h-9 sm:w-9" />
        <div className="text-left">
          <div className="text-lg font-black leading-none tracking-[-.04em] text-[#081342] dark:text-white sm:text-xl">
            Rally<span className="text-[#078e48]">Hub</span>
          </div>
          {moduleName && (
            <div className="mt-1 text-[9px] font-black uppercase tracking-[.2em] text-[#0c1e53] dark:text-slate-200 sm:text-[10px]">
              {moduleName}
            </div>
          )}
        </div>
      </div>
      {pageLabel && (
        <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-muted-foreground sm:text-[10px]">
          {pageLabel}
        </p>
      )}
      {identityClubs.length > 0 && (
        <div className={`mt-3 flex max-w-full flex-wrap gap-2 ${chipsAlignment}`}>
          {identityClubs.map((item, index) => <ClubChip key={item.id || item.name || index} club={item} />)}
        </div>
      )}
    </div>
  );
}

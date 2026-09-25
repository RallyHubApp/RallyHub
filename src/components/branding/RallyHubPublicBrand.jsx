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
  clubFirst = false,
}) {
  const identityClubs = clubs?.length ? clubs : club ? [club] : [];
  const alignment = align === 'left' ? 'items-start' : 'items-center';
  const chipsAlignment = align === 'left' ? 'justify-start' : 'justify-center';
  const primaryClub = identityClubs[0] || null;

  if (clubFirst && primaryClub) {
    const primary = primaryClub.primary_colour || 'hsl(var(--primary))';
    const secondary = primaryClub.secondary_colour || primary;
    return (
      <div className={`flex flex-col ${alignment} ${className}`}>
        <div
          className="flex max-w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm"
          style={{ borderTopWidth: 5, borderTopColor: primary, borderBottomWidth: 2, borderBottomColor: secondary }}
        >
          {primaryClub.logo_url && (
            <img
              src={primaryClub.logo_url}
              alt={primaryClub.name ? `${primaryClub.name} logo` : 'Club logo'}
              className="h-14 w-14 shrink-0 rounded-xl bg-white object-contain p-1 sm:h-16 sm:w-16"
            />
          )}
          <div className="min-w-0 text-left">
            <div className="truncate text-xl font-black leading-tight text-foreground sm:text-2xl">{primaryClub.name}</div>
            {moduleName && <div className="mt-1 text-[10px] font-black uppercase tracking-[.18em] text-muted-foreground">{moduleName}</div>}
            {pageLabel && <div className="mt-1 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">{pageLabel}</div>}
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">
          <span>Powered by</span>
          <img src={RALLYHUB_MARK_URL} alt="" className="h-4 w-4 object-contain" />
          <span>RallyHub</span>
        </div>
      </div>
    );
  }

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

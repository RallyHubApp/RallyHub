import React, { useEffect, useState } from 'react';

const CACHE_VERSION = '20260918-1';

export const normaliseDirectoryAssetUrl = value => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const marker = '/files/mp/public/';
  try {
    const url = new URL(raw, window.location.origin);
    if (url.hostname === 'base44.app' && url.pathname.includes(marker)) {
      const tail = url.pathname.split(marker)[1];
      if (tail) {
        const media = new URL(`https://media.base44.com/images/public/${tail}`);
        media.searchParams.set('rhv', CACHE_VERSION);
        return media.toString();
      }
    }
    if (url.hostname === 'media.base44.com') {
      url.searchParams.set('rhv', CACHE_VERSION);
      return url.toString();
    }
    return raw;
  } catch {
    return raw;
  }
};

const initials = name => String(name || '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0]?.toUpperCase())
  .join('');

export default function PublicDirectoryLogo({
  src,
  name,
  alt = null,
  imageClassName = '',
  fallbackClassName = '',
}) {
  const normalised = normaliseDirectoryAssetUrl(src);
  const [currentSrc, setCurrentSrc] = useState(normalised);
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(!normalised);

  useEffect(() => {
    setCurrentSrc(normaliseDirectoryAssetUrl(src));
    setRetryCount(0);
    setFailed(!String(src || '').trim());
  }, [src]);

  const handleError = () => {
    if (retryCount === 0 && currentSrc) {
      const separator = currentSrc.includes('?') ? '&' : '?';
      setRetryCount(1);
      setCurrentSrc(`${currentSrc}${separator}rhr=${Date.now()}`);
      return;
    }
    setFailed(true);
  };

  if (failed || !currentSrc) {
    return (
      <div className={fallbackClassName} aria-label={`${name} logo unavailable`}>
        {initials(name)}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt || `${name} logo`}
      className={imageClassName}
      onError={handleError}
      referrerPolicy="no-referrer"
      decoding="async"
    />
  );
}

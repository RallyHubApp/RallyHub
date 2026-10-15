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


// Super Admin-approved Directory logo framing, 15 October 2026.
const logoDisplayByName = {
  "East Cork Pickleball": {
    "fit": "contain",
    "scale": 60,
    "x": 0,
    "y": 0
  },
  "Kilcullen Pickleball Panthers": {
    "fit": "contain",
    "scale": 65,
    "x": 0,
    "y": -30
  },
  "Kinvara Pickleball": {
    "fit": "contain",
    "scale": 60,
    "x": 0,
    "y": -20
  },
  "Lisburn Pickleball Club": {
    "fit": "contain",
    "scale": 70,
    "x": 0,
    "y": 0
  },
  "Moate Pickleball Club": {
    "fit": "contain",
    "scale": 80,
    "x": 0,
    "y": -15
  },
  "Newport Pickleball": {
    "fit": "contain",
    "scale": 75,
    "x": 0,
    "y": -30
  },
  "Pickleball Arklow": {
    "fit": "contain",
    "scale": 60,
    "x": 0,
    "y": -25
  },
  "Rathdrum Pickleball": {
    "fit": "contain",
    "scale": 75,
    "x": 0,
    "y": -25
  },
  "Sligo Pickleball Club": {
    "fit": "contain",
    "scale": 75,
    "x": 0,
    "y": -20
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
  const framing = logoDisplayByName[name];
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
      style={framing ? { objectFit: framing.fit, transform: `translate(${framing.x}px, ${framing.y}px) scale(${framing.scale / 100})`, transformOrigin: 'center center' } : undefined}
      onError={handleError}
      referrerPolicy="no-referrer"
      decoding="async"
    />
  );
}

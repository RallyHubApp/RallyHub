import { rallyhubShareForPath } from '@/lib/rallyhubShare';
import { useEffect } from 'react';

const SITE_URL = 'https://rallyhub.ie';
const DEFAULT_IMAGE = 'https://rallyhub.ie/assets/brand/rallyhub-horizontal-light.png';

function ensureMeta(selector, attrs) {
  const existing = [...document.head.querySelectorAll(selector)];
  const node = existing[0] || document.createElement('meta');
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  if (!existing.length) document.head.appendChild(node);
  existing.slice(1).forEach(extra => extra.remove());
  return node;
}

function ensureCanonical(href) {
  const existing = [...document.head.querySelectorAll('link[rel="canonical"]')];
  const node = existing[0] || document.createElement('link');
  node.setAttribute('rel', 'canonical');
  node.setAttribute('href', href);
  if (!existing.length) document.head.appendChild(node);
  existing.slice(1).forEach(extra => extra.remove());
}

// Base44 can use this metadata when its crawler prerender completes. Keep the
// runtime titles consistent with our build-time 60/160-character SEO rules.
export function seoTitle(value) {
  const title = String(value || '').trim();
  if (title.length <= 60) return title;
  const suffix = ' | RallyHub';
  const segments = title.split(' | ');
  const compact = segments.length > 2 ? `${segments[0]}${suffix}` : title;
  if (compact.length <= 60) return compact;
  const first = compact.endsWith(suffix) ? compact.slice(0, -suffix.length) : compact;
  const budget = 60 - suffix.length;
  const candidate = first.slice(0, budget);
  const lastSpace = candidate.lastIndexOf(' ');
  const visible = (lastSpace > Math.floor(budget * 0.7) ? candidate.slice(0, lastSpace) : candidate)
    .replace(/[\s,;:–—-]+$/, '');
  return `${visible}${suffix}`;
}

export function seoDescription(value) {
  const description = String(value || '').trim();
  if (description.length <= 160) return description;
  const candidate = description.slice(0, 157);
  const lastSpace = candidate.lastIndexOf(' ');
  return `${(lastSpace > 115 ? candidate.slice(0, lastSpace) : candidate).replace(/[.,;: ]+$/, '')}...`;
}

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function Seo({
  title,
  description,
  socialTitle = title,
  socialDescription = description,
  path = '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
  structuredData = [],
}) {
  useEffect(() => {
    const canonical = absoluteUrl(path);
    const approvedShare = rallyhubShareForPath(path);
    const readableTitle = seoTitle(title);
    const readableDescription = seoDescription(description);
    const ogTitle = seoTitle(approvedShare?.title || socialTitle || title);
    const ogDescription = seoDescription(approvedShare?.description || socialDescription || description);
    const schemas = Array.isArray(structuredData) ? structuredData.filter(Boolean) : [structuredData].filter(Boolean);

    document.title = readableTitle;
    ensureMeta('meta[name="description"]', { name: 'description', content: readableDescription });
    ensureMeta('meta[name="robots"]', { name: 'robots', content: robots });
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: ogTitle });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: ogDescription });
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image || DEFAULT_IMAGE });
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: ogTitle });
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: ogDescription });
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image || DEFAULT_IMAGE });
    ensureCanonical(canonical);

    document.head.querySelectorAll('script[data-rallyhub-seo="jsonld"]').forEach(node => node.remove());
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.rallyhubSeo = 'jsonld';
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.head.querySelectorAll('script[data-rallyhub-seo="jsonld"]').forEach(node => node.remove());
    };
  }, [title, description, socialTitle, socialDescription, path, image, type, robots, structuredData]);

  return null;
}

export { SITE_URL, DEFAULT_IMAGE };

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
    const ogTitle = approvedShare?.title || socialTitle;
    const ogDescription = approvedShare?.description || socialDescription;
    const schemas = Array.isArray(structuredData) ? structuredData.filter(Boolean) : [structuredData].filter(Boolean);

    document.title = title;
    ensureMeta('meta[name="description"]', { name: 'description', content: description });
    ensureMeta('meta[name="robots"]', { name: 'robots', content: robots });
    ensureMeta('meta[property="og:title"]', { property: 'og:title', content: ogTitle });
    ensureMeta('meta[property="og:description"]', { property: 'og:description', content: ogDescription });
    ensureMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    ensureMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    ensureMeta('meta[property="og:image"]', { property: 'og:image', content: image });
    ensureMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    ensureMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: ogTitle });
    ensureMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: ogDescription });
    ensureMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
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

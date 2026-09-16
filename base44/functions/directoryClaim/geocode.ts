const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);
const normalise = (value:any) => clean(value, 500).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const compact = (value:any) => normalise(value).replace(/\s+/g, '');

function plausibleResult(row:any, venue:any, context:any) {
  const lat = Number(row?.lat);
  const lon = Number(row?.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return false;
  if (lat < 51.2 || lat > 55.6 || lon < -11 || lon > -5) return false;

  const countryCode = clean(row?.address?.country_code, 10).toLowerCase();
  if (countryCode && !['ie', 'gb'].includes(countryCode)) return false;

  const display = normalise(row?.display_name || '');
  const requestedPostcode = compact(venue?.eircode);
  const returnedPostcode = compact(row?.address?.postcode);
  if (requestedPostcode && returnedPostcode && requestedPostcode !== returnedPostcode) return false;

  const county = normalise(context?.county);
  const town = normalise(context?.town);
  if (county && !display.includes(county) && town && !display.includes(town)) return false;
  return true;
}

async function lookup(query:string) {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    addressdetails: '1',
    countrycodes: 'ie,gb',
    viewbox: '-11,55.6,-5,51.2',
    bounded: '1',
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'RallyHubDirectory/1.0 (https://rallyhub.ie)' },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const rows = await response.json().catch(() => []);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.warn('Directory venue geocoding failed', error?.message || error);
    return [];
  } finally { clearTimeout(timeout); }
}

export async function geocodeDirectoryVenue(venue:any, context:any = {}) {
  const existingLat = Number(venue?.latitude);
  const existingLng = Number(venue?.longitude);
  if (Number.isFinite(existingLat) && Number.isFinite(existingLng)) {
    return { latitude: existingLat, longitude: existingLng, geocoded: false };
  }

  const name = clean(venue?.name, 220);
  const address = clean(venue?.address, 320);
  const postcode = clean(venue?.eircode, 40);
  const town = clean(context?.town, 120);
  const county = clean(context?.county, 120);
  const candidates = [
    [name, address, postcode, town, county, 'Ireland'],
    [address, postcode, town, county, 'Ireland'],
    [name, address, town, county, 'Ireland'],
    [address, town, county, 'Ireland'],
    [name, town, county, 'Ireland'],
  ].map(parts => parts.filter(Boolean).join(', ')).filter((q, i, arr) => q && arr.indexOf(q) === i);

  for (const query of candidates) {
    const rows = await lookup(query);
    const match = rows.find(row => plausibleResult(row, venue, context));
    if (!match) continue;
    return { latitude: Number(match.lat), longitude: Number(match.lon), geocoded: true };
  }
  return null;
}

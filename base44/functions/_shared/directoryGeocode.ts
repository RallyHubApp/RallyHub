const clean = (value:any, max=500) => String(value ?? '').trim().slice(0, max);

export async function geocodeDirectoryVenue(venue:any) {
  const existingLat = Number(venue?.latitude);
  const existingLng = Number(venue?.longitude);
  if (Number.isFinite(existingLat) && Number.isFinite(existingLng)) {
    return { latitude: existingLat, longitude: existingLng, geocoded: false };
  }

  const name = clean(venue?.name, 220);
  const address = clean(venue?.address, 320);
  const postcode = clean(venue?.eircode, 40);
  const query = [name, address, postcode].filter(Boolean).join(', ');
  if (!query) return null;

  // Low-volume, one-time geocoding only. Coordinates are persisted after success,
  // so directory browsing never calls the geocoder. The Ireland-wide view box
  // includes both the Republic of Ireland and Northern Ireland.
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '1',
    addressdetails: '0',
    countrycodes: 'ie,gb',
    viewbox: '-11,55.6,-5,51.2',
    bounded: '1',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RallyHubDirectory/1.0 (https://rallyhub.ie)',
      },
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const rows = await response.json().catch(() => []);
    const first = Array.isArray(rows) ? rows[0] : null;
    const latitude = Number(first?.lat);
    const longitude = Number(first?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude, longitude, geocoded: true };
  } catch (error) {
    console.warn('Directory venue geocoding failed', error?.message || error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function geocodeDirectoryVenues(venues:any[] = []) {
  const output = [];
  for (const venue of venues) {
    const result = await geocodeDirectoryVenue(venue);
    output.push(result ? { ...venue, latitude: result.latitude, longitude: result.longitude } : venue);
  }
  return output;
}

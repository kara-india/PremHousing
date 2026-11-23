export const mapboxAccessToken = import.meta.env?.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

export const hasMapboxToken = Boolean(mapboxAccessToken);

const localityBias = '72.82,19.29';
const localityBounds = '72.70,19.12,72.98,19.44';
export const MAX_CONCURRENT_GEOCODES = 3;

export function isMapboxResourceError(event) {
  const status = Number(event?.error?.status ?? event?.error?.statusCode);
  const message = String(event?.error?.message ?? '').toLowerCase();
  return (Number.isFinite(status) && status >= 400)
    || /tile|style|access token|unauthori[sz]ed|forbidden|network/.test(message)
    || Boolean(event?.sourceId || event?.source);
}

/** Resolve multiple names with bounded fan-out, retaining per-name failures. */
export async function geocodeLocalities(names, signal, geocode = geocodeLocality, concurrency = MAX_CONCURRENT_GEOCODES) {
  const results = new Array(names.length);
  let nextIndex = 0;
  const workerCount = Math.min(names.length, Math.max(1, concurrency));

  async function worker() {
    while (nextIndex < names.length) {
      if (signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError');
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = { status: 'fulfilled', value: await geocode(names[index], signal) };
      } catch (reason) {
        if (reason?.name === 'AbortError' || signal?.aborted) throw reason;
        results[index] = { status: 'rejected', reason };
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

/** Resolve a locality name for map context only; temporary results are never persisted. */
export async function geocodeLocality(name, signal) {
  if (!mapboxAccessToken) throw new Error('Mapbox token is not configured.');
  const query = `${name}, Mira-Bhayandar, Maharashtra, India`;
  const params = new URLSearchParams({
    q: query,
    country: 'IN',
    proximity: localityBias,
    bbox: localityBounds,
    limit: '1',
    language: 'en',
    access_token: mapboxAccessToken,
  });
  const response = await fetch(`https://api.mapbox.com/search/geocode/v6/forward?${params}`, { signal });
  if (!response.ok) throw new Error(`Mapbox geocoding failed (${response.status}).`);
  const payload = await response.json();
  const feature = payload.features?.[0];
  const coordinates = feature?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length < 2) return null;
  const [longitude, latitude] = coordinates.map(Number);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (longitude < 72.65 || longitude > 73.03 || latitude < 19.08 || latitude > 19.48) return null;
  return { name, longitude, latitude };
}

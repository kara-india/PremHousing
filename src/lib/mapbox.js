export const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim() ?? '';

export const hasMapboxToken = Boolean(mapboxAccessToken);

const localityBias = '72.82,19.29';
const localityBounds = '72.70,19.12,72.98,19.44';

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

import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, MapPin } from 'lucide-react';
import { geocodeLocalities, hasMapboxToken, isMapboxResourceError, mapboxAccessToken } from '../../lib/mapbox.js';
import './LocalityMap.css';

const MIRA_BHAYANDAR_CENTER = [72.82, 19.29];

function normalizeLocalities(localities) {
  const byName = new Map();
  localities.forEach((locality) => {
    const name = locality?.name?.trim();
    if (!name) return;
    const current = byName.get(name) ?? { name, count: 0 };
    current.count += Number(locality.count) || 0;
    byName.set(name, current);
  });
  return [...byName.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function LocalityMap({ localities = [], selectedLocality = '', onSelectLocality }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const selectLocalityRef = useRef(onSelectLocality);
  const [geocoded, setGeocoded] = useState([]);
  const [geocodeState, setGeocodeState] = useState('loading');
  const [geocodeError, setGeocodeError] = useState('');
  const [mapState, setMapState] = useState('loading');
  const [mapRetryCount, setMapRetryCount] = useState(0);
  const normalized = useMemo(() => normalizeLocalities(localities), [localities]);
  const localitySignature = normalized.map(({ name }) => name).join('|');

  useEffect(() => { selectLocalityRef.current = onSelectLocality; }, [onSelectLocality]);

  useEffect(() => {
    const requestedNames = localitySignature ? localitySignature.split('|') : [];
    if (!hasMapboxToken) {
      setGeocoded([]);
      setGeocodeState('missing-token');
      return undefined;
    }
    if (requestedNames.length === 0) {
      setGeocoded([]);
      setGeocodeState('empty');
      return undefined;
    }

    const controller = new AbortController();
    setGeocodeState('loading');
    setGeocodeError('');
    geocodeLocalities(requestedNames, controller.signal).then((results) => {
      const validPoints = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value)
        .filter(Boolean);
      const failures = results.filter((result) => result.status === 'rejected').length;
      setGeocoded(validPoints);
      setGeocodeError(failures ? `${failures} of ${requestedNames.length} locality lookups could not be completed.` : '');
      setGeocodeState(validPoints.length
        ? failures ? 'partial' : 'ready'
        : failures ? 'error' : 'empty');
    }).catch((error) => {
      if (error.name !== 'AbortError') {
        setGeocoded([]);
        setGeocodeError(error.message || 'Mapbox could not resolve these localities.');
        setGeocodeState('error');
      }
    });
    return () => controller.abort();
  }, [localitySignature]);

  useEffect(() => {
    if (!hasMapboxToken || !containerRef.current || mapRef.current) return undefined;
    let mounted = true;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      accessToken: mapboxAccessToken,
      style: 'mapbox://styles/mapbox/light-v11',
      center: MIRA_BHAYANDAR_CENTER,
      zoom: 11.1,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    });
    mapRef.current = map;
    setMapState('loading');
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.ScaleControl({ unit: 'metric', maxWidth: 90 }), 'bottom-left');
    map.once('load', () => { if (mounted) setMapState('ready'); });
    map.on('error', (event) => {
      if (!mounted) return;
      if (isMapboxResourceError(event)) setMapState('error');
    });
    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  // Map lifetime is tied to the component; locality changes update markers below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMapboxToken, mapRetryCount]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapState !== 'ready') return undefined;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    const countByName = new Map(normalized.map(({ name, count }) => [name, count]));
    geocoded.forEach(({ name, longitude, latitude }) => {
      const count = countByName.get(name) ?? 0;
      const markerElement = document.createElement('button');
      markerElement.type = 'button';
      markerElement.className = `locality-map-marker${selectedLocality === name ? ' is-selected' : ''}${count ? ' has-count' : ''}`;
      markerElement.textContent = count ? String(count) : '';
      markerElement.setAttribute('aria-label', `${name}, approximate locality centre${count ? `, ${count} matching published ${count === 1 ? 'property' : 'properties'}` : ', no matching published properties'}`);
      markerElement.title = `${name} · approximate locality centre`;
      markerElement.addEventListener('click', () => selectLocalityRef.current?.(name));
      const marker = new mapboxgl.Marker({ element: markerElement, anchor: 'center' }).setLngLat([longitude, latitude]).addTo(map);
      markersRef.current.push(marker);
    });
    return undefined;
  }, [geocoded, mapState, normalized, selectedLocality]);

  useEffect(() => {
    const map = mapRef.current;
    const selected = geocoded.find((point) => point.name === selectedLocality);
    if (map && selected && mapState === 'ready') {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      map.easeTo({ center: [selected.longitude, selected.latitude], zoom: Math.max(map.getZoom(), 12), duration: reduceMotion ? 0 : 500 });
    }
  }, [geocoded, mapState, selectedLocality]);

  const locationMessage = geocodeState === 'loading'
    ? 'Looking up locality coordinates…'
    : geocodeState === 'missing-token'
      ? 'Map is not configured yet. Add the Mapbox public token to the Vercel environment to load the locality map.'
      : geocodeState === 'error'
        ? `${geocodeError} The locality list remains available.`
        : geocodeState === 'partial'
          ? `${geocodeError} Available locality points are shown; the full locality list remains available.`
        : 'No locality coordinates were returned. The locality list remains available.';

  return <div className="locality-map-wrap">
    {hasMapboxToken && <div ref={containerRef} className="locality-map-canvas" aria-label="Map of Mira-Bhayandar localities with approximate locality-centre markers" role="region" />}
    {(!hasMapboxToken || geocodeState === 'error' || geocodeState === 'empty') && <div className="locality-map-fallback" role="status">
      <MapPin size={22} aria-hidden="true" />
      <strong>{geocodeState === 'missing-token' ? 'Map unavailable' : 'Map coordinates unavailable'}</strong>
      <span>{locationMessage}</span>
    </div>}
    {hasMapboxToken && geocodeState === 'loading' && <div className="locality-map-overlay" role="status"><span className="map-loading-dot" /> {locationMessage}</div>}
    {hasMapboxToken && geocodeState === 'partial' && <div className="locality-map-overlay" role="status"><AlertTriangle size={16} /> {locationMessage}</div>}
    {hasMapboxToken && mapState === 'error' && <div className="locality-map-overlay map-error" role="status"><AlertTriangle size={16} /> Map tiles could not load. Use the locality list beside the map. <button type="button" onClick={() => { setMapState('loading'); setMapRetryCount((count) => count + 1); }}>Retry map</button></div>}
    {(geocodeState === 'ready' || geocodeState === 'partial') && <p className="locality-map-note">Mapbox Geocoding · approximate locality centres only; not property locations</p>}
  </div>;
}

export default LocalityMap;

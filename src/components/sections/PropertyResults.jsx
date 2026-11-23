import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BedDouble, List, Map as MapIcon, MapPin, Ruler, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LOCALITY_NAMES } from '../../lib/localities.js';
import './PropertyResults.css';

const LocalityMap = lazy(() => import('../explorers/LocalityMap.jsx'));

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatPrice(property) {
  const price = currency.format(property.price);
  return property.transaction_type === 'rent' ? `${price} / month` : price;
}

function PropertyCard({ property, onEnquire }) {
  return <article className="property-result-card" key={property.id}>
    <div className="property-result-image" aria-hidden="true">
      {property.image_urls?.[0]
        ? <img src={property.image_urls[0]} alt="" loading="lazy" />
        : <span>Photos available on request</span>}
    </div>
    <div className="property-result-body">
      <div className="property-result-badges">
        <span className="property-result-kind">
          {property.property_type === 'commercial' ? 'Commercial' : property.transaction_type === 'sale' ? 'For sale' : 'For rent'}
        </span>
        {property.is_featured && <span className="property-result-featured">PREM featured</span>}
      </div>
      <h3>{property.title}</h3>
      <p className="property-result-location"><MapPin size={14} /> {property.locality?.name}</p>
      <strong className="property-result-price">{formatPrice(property)}</strong>
      <div className="property-result-facts">
        {property.bedrooms > 0 && <span><BedDouble size={14} /> {property.bedrooms} BHK</span>}
        {property.area_sqft && <span><Ruler size={14} /> {Number(property.area_sqft).toLocaleString('en-IN')} sq ft</span>}
        {property.deposit > 0 && <span>Deposit {currency.format(property.deposit)}</span>}
      </div>
      <button className="property-result-cta" type="button" onClick={() => onEnquire(property)}>
        Ask about this property <ArrowRight size={15} />
      </button>
      <Link className="property-result-details" to={`/properties/${property.id}`}>View full details</Link>
    </div>
  </article>;
}

function PropertyResults({ state, properties, count, onEnquire }) {
  const [view, setView] = useState('map');
  const [selectedLocality, setSelectedLocality] = useState('');
  const [expandedListKey, setExpandedListKey] = useState('');
  const mapViewportRef = useRef(null);
  const [mapActivated, setMapActivated] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));

  useEffect(() => {
    if (view !== 'map' || mapActivated || !mapViewportRef.current) return undefined;
    if (!('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMapActivated(true);
        observer.disconnect();
      }
    }, { rootMargin: '120px 0px' });
    observer.observe(mapViewportRef.current);
    return () => observer.disconnect();
  }, [mapActivated, view]);

  function selectLocality(name) {
    setSelectedLocality(name);
    setExpandedListKey('');
  }

  const localityCounts = useMemo(() => {
    const counts = new Map();
    properties.forEach((property) => {
      const name = property.locality?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...new Set([...LOCALITY_NAMES, ...counts.keys()])].map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [properties]);

  const matchingProperties = selectedLocality
    ? properties.filter((property) => property.locality?.name === selectedLocality)
    : properties;
  const listKey = `${selectedLocality}:${properties.map((property) => property.id).join(',')}`;
  const showAllProperties = expandedListKey === listKey;
  const visibleProperties = showAllProperties ? matchingProperties : matchingProperties.slice(0, 3);
  const readyCount = Number.isFinite(count) ? count : properties.length;

  return <section className="property-results" id="property-results" aria-live="polite" aria-busy={state === 'loading'}>
    <div className="property-results-heading">
      <div>
        <span className="eyebrow">HOMEPAGE PROPERTY EXPLORER</span>
        <h2>Find a place that fits.</h2>
        <p>Search published PREM properties, then explore the results by locality.</p>
      </div>
      {state === 'ready' && <span className="property-result-count">{readyCount} {readyCount === 1 ? 'published match' : 'published matches'}</span>}
    </div>

    <div className="property-explorer-toolbar">
      <span className="property-explorer-context">Map points show approximate locality centres, never individual building locations.</span>
      <div className="property-view-toggle" role="group" aria-label="Explorer view">
        <button type="button" className={view === 'map' ? 'active' : ''} aria-pressed={view === 'map'} onClick={() => setView('map')}><MapIcon size={15} /> Map</button>
        <button type="button" className={view === 'list' ? 'active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={15} /> List</button>
      </div>
    </div>

    <div className={`property-explorer-layout${view === 'list' ? ' list-view' : ''}`}>
      {view === 'map' && <div className="property-explorer-map" ref={mapViewportRef}>
        {mapActivated
          ? <Suspense fallback={<div className="locality-map-loading" role="status">Preparing locality map…</div>}><LocalityMap localities={localityCounts} selectedLocality={selectedLocality} onSelectLocality={selectLocality} /></Suspense>
          : <div className="locality-map-loading">Map loads as you reach the explorer.</div>}
      </div>}
      <div className="property-explorer-results">
        <div className="property-explorer-localities" aria-label="Published property count by locality">
          <p>{state === 'ready' ? 'MATCHES BY LOCALITY' : 'MIRA-BHAYANDAR LOCALITIES'}</p>
          <div className="property-locality-chips">
            {localityCounts.map(({ name, count: localityCount }) => <button key={name} type="button" className={selectedLocality === name ? 'selected' : ''} aria-pressed={selectedLocality === name} onClick={() => selectLocality(selectedLocality === name ? '' : name)}>
              <span>{name}</span>{state === 'ready' && <b>{localityCount}</b>}
            </button>)}
          </div>
        </div>
        {selectedLocality && <div className="property-selected-locality"><span>{selectedLocality}</span><button type="button" onClick={() => selectLocality('')} aria-label="Clear locality selection"><X size={14} /> Clear</button></div>}
        {state === 'idle' && <p className="property-results-message">Choose your budget and property preferences above, then select “Match my requirement” to see current published options here.</p>}
        {state === 'loading' && <p className="property-results-message" role="status">Searching published PREM listings…</p>}
        {state === 'error' && <p className="property-results-message" role="alert">We couldn’t load listings just now. Please try again or contact our team.</p>}
        {state === 'ready' && properties.length === 0 && <p className="property-results-message">No published listings match these filters. Clear a filter or contact our team to check current availability.</p>}
        {state === 'ready' && properties.length > 0 && visibleProperties.length === 0 && <p className="property-results-message">No matching listings in {selectedLocality}. Choose another locality or clear this selection.</p>}
        {state === 'ready' && visibleProperties.length > 0 && (
          <>
            <div className="property-explorer-list-heading"><h3>{selectedLocality || 'Published properties'}</h3><span>{visibleProperties.length}{matchingProperties.length > 3 ? ` shown of ${matchingProperties.length}` : ''}</span></div>
            <div className="property-result-grid" id="property-result-list">
              {visibleProperties.map((property) => <PropertyCard property={property} onEnquire={onEnquire} key={property.id} />)}
            </div>
            {matchingProperties.length > 3 && <button className="property-results-expand" type="button" aria-expanded={showAllProperties} aria-controls="property-result-list" onClick={() => setExpandedListKey(showAllProperties ? '' : listKey)}>
              {showAllProperties ? 'Show first 3 properties' : `View all ${matchingProperties.length} properties`}
            </button>}
            <p className="property-results-disclaimer">Listing details and availability are confirmed with PREM before a viewing. Map markers represent localities, not exact property addresses.</p>
          </>
        )}
      </div>
    </div>
  </section>;
}

export default PropertyResults;

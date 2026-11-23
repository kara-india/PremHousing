import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Compass, Info, List, Map as MapIcon, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteFooter, SiteHeader } from '../SiteChrome.jsx';
import { LOCALITY_NAMES } from '../../lib/localities.js';
import { supabase } from '../../lib/supabase.js';
import './LocalityInsightsPage.css';

const LocalityMap = lazy(() => import('../explorers/LocalityMap.jsx'));

const profiles = [
  { id: 'standard', title: 'Standard residential & connectivity', description: 'Balance a property’s known asking details with everyday access and affordability.', evidence: 'Transit, school, hospital and comparable-price evidence is not connected yet.' },
  { id: 'peaceful', title: 'Peaceful living', description: 'Explore a residential setting with the priorities that make a home feel right to you.', evidence: 'Verified green-space, land-use, traffic and environmental measures are not connected yet.' },
  { id: 'investment', title: 'Investment potential', description: 'Review available property facts while keeping future outcomes uncertain.', evidence: 'Comparable rents, registered outcomes and a validated forecast are not connected yet.' },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const propertyProjection = 'id,title,property_type,transaction_type,price,area_sqft,bedrooms,furnishing,image_urls,locality:localities!inner(name)';

export function LocalityInsightsExplorer({ embedded = false }) {
  const [records, setRecords] = useState([]);
  const [recordCount, setRecordCount] = useState(0);
  const [loadState, setLoadState] = useState('loading');
  const [profileId, setProfileId] = useState('standard');
  const [transaction, setTransaction] = useState('sale');
  const [propertyType, setPropertyType] = useState('residential');
  const [bedrooms, setBedrooms] = useState('any');
  const [budget, setBudget] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('Mira Road');
  const [view, setView] = useState('map');
  const mapViewportRef = useRef(null);
  const [mapActivated, setMapActivated] = useState(() => typeof window !== 'undefined' && !('IntersectionObserver' in window));

  useEffect(() => {
    let active = true;
    async function loadProperties() {
      if (!supabase) { setLoadState('unavailable'); return; }
      setLoadState('loading');
      try {
        const { data, error, count } = await supabase
          .from('properties')
          .select(propertyProjection, { count: 'exact' })
          .eq('status', 'published')
          .order('price', { ascending: true })
          .limit(500);
        if (error) throw error;
        if (!active) return;
        setRecords(data ?? []);
        setRecordCount(count ?? data?.length ?? 0);
        setLoadState('ready');
      } catch {
        if (active) setLoadState('error');
      }
    }
    loadProperties();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (view !== 'map' || mapActivated || !mapViewportRef.current || !('IntersectionObserver' in window)) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setMapActivated(true);
        observer.disconnect();
      }
    }, { rootMargin: '180px 0px' });
    observer.observe(mapViewportRef.current);
    return () => observer.disconnect();
  }, [mapActivated, view]);

  const filteredProperties = useMemo(() => records.filter((property) => {
    if (property.transaction_type !== transaction) return false;
    if (propertyType === 'residential' && property.property_type === 'commercial') return false;
    if (propertyType === 'commercial' && property.property_type !== 'commercial') return false;
    const priceCap = Number(budget);
    if (budget && Number.isFinite(priceCap) && priceCap > 0 && Number(property.price) > priceCap) return false;
    const bedroomsFilter = Number(bedrooms);
    if (bedrooms !== 'any' && (bedroomsFilter === 3 ? Number(property.bedrooms) < 3 : Number(property.bedrooms) !== bedroomsFilter)) return false;
    return true;
  }), [records, transaction, propertyType, budget, bedrooms]);

  const localitySummaries = useMemo(() => {
    const counts = new Map();
    filteredProperties.forEach((property) => {
      const name = property.locality?.name;
      if (name) counts.set(name, (counts.get(name) ?? 0) + 1);
    });
    return [...new Set([...LOCALITY_NAMES, ...counts.keys()])].map((name) => ({ name, count: counts.get(name) ?? 0 }));
  }, [filteredProperties]);

  const selectedProfile = profiles.find((profile) => profile.id === profileId) ?? profiles[0];
  const selectedProperties = filteredProperties.filter((property) => property.locality?.name === selectedLocality);

  const Heading = embedded ? 'h2' : 'h1';

  return <>
      <section className="insights-intro" id={embedded ? 'locality-insights' : undefined}>
        <div className="wrap">
          <div className="eyebrow"><span className="eyebrow-line" /> LOCALITY INTELLIGENCE</div>
          <div className="insights-intro-row"><div><Heading>Understand the area.<br /><em>Then choose your place.</em></Heading><p>Set your requirements, explore current PREM inventory by locality, and see clearly where reliable evidence is still missing.</p></div><span className="insights-asof"><ShieldCheck size={15} /> Published PREM inventory</span></div>
        </div>
      </section>

      <section className="insights-workspace wrap" aria-label="Locality intelligence explorer">
        <aside className="insights-requirements">
          <div className="insights-panel-heading"><span className="eyebrow">YOUR REQUIREMENT</span><h2>What matters to you?</h2></div>
          <div className="insights-transaction" role="group" aria-label="Property transaction">
            <button type="button" className={transaction === 'sale' ? 'active' : ''} aria-pressed={transaction === 'sale'} onClick={() => setTransaction('sale')}>Buy</button>
            <button type="button" className={transaction === 'rent' ? 'active' : ''} aria-pressed={transaction === 'rent'} onClick={() => setTransaction('rent')}>Rent</button>
          </div>
          <label className="insights-field">Maximum budget ({transaction === 'rent' ? '₹ / month' : '₹'})<input type="number" min="0" step="10000" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="No limit" /></label>
          <label className="insights-field">Property type<select value={propertyType} onChange={(event) => setPropertyType(event.target.value)}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="any">Any property</option></select></label>
          {propertyType !== 'commercial' && <label className="insights-field">Bedrooms<select value={bedrooms} onChange={(event) => setBedrooms(event.target.value)}><option value="any">Any BHK</option><option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3+ BHK</option></select></label>}
          <div className="insights-profile-label"><span className="eyebrow">YOUR PREFERENCE</span><span>Choose a lens to guide your review</span></div>
          <div className="insights-profile-list" role="radiogroup" aria-label="Preference profile">
            {profiles.map((profile) => <button key={profile.id} type="button" role="radio" aria-checked={profile.id === profileId} className={`insights-profile${profile.id === profileId ? ' selected' : ''}`} onClick={() => setProfileId(profile.id)}>
              <span className="insights-radio" aria-hidden="true">{profile.id === profileId && <Check size={11} />}</span><span><strong>{profile.title}</strong><small>{profile.description}</small></span>
            </button>)}
          </div>
          <button className="button button-dark insights-apply" type="button" onClick={() => document.getElementById('locality-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}><Search size={15} /> Update exploration</button>
        </aside>

        <div className="insights-map-column">
          <div className="insights-result-context"><div><span className="eyebrow">{selectedProfile.title}</span><strong>{loadState === 'loading' ? 'Loading published properties…' : `${filteredProperties.length} matching ${filteredProperties.length === 1 ? 'property' : 'properties'}`}</strong></div><span>Locality centres are approximate</span></div>
          <div className="insights-map-controls">
            <div className="insights-layer-label"><Compass size={15} /><span>PREM published inventory by locality</span></div>
            <div className="property-view-toggle" role="group" aria-label="Locality view">
              <button type="button" className={view === 'map' ? 'active' : ''} aria-pressed={view === 'map'} onClick={() => setView('map')}><MapIcon size={15} /> Map</button>
              <button type="button" className={view === 'list' ? 'active' : ''} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={15} /> List</button>
            </div>
          </div>
          {view === 'map' && <div className="insights-map" ref={mapViewportRef}>{mapActivated
            ? <Suspense fallback={<div className="locality-map-loading" role="status">Preparing locality map…</div>}><LocalityMap localities={localitySummaries} selectedLocality={selectedLocality} onSelectLocality={setSelectedLocality} /></Suspense>
            : <div className="locality-map-loading" role="status">Map loads as you reach locality insights.</div>}
          </div>}
          {view === 'list' && <div className="insights-locality-list" aria-label="Localities and matching property counts">
            {localitySummaries.map(({ name, count }) => <button key={name} type="button" className={selectedLocality === name ? 'selected' : ''} aria-pressed={selectedLocality === name} onClick={() => setSelectedLocality(name)}><span><MapPin size={15} />{name}</span><b>{count} {count === 1 ? 'property' : 'properties'}</b></button>)}
          </div>}
          <p className="insights-map-legend"><span><i /> Published property count by locality</span><span>Mapbox · approximate centres, not property pins</span></p>
        </div>

        <aside className="insights-evidence" id="locality-results">
          <div className="insights-panel-heading"><span className="eyebrow">LOCALITY SNAPSHOT</span><h2>{selectedLocality}</h2><p>Within your current budget and property filters.</p></div>
          <div className="insights-stat"><span>Matching published properties</span><strong>{loadState === 'ready' ? selectedProperties.length : '—'}</strong></div>
          <div className="insights-selected-records">
            {selectedProperties.slice(0, 5).map((property) => <Link to={`/properties/${property.id}`} className="insights-property" key={property.id}>
              <span><strong>{property.title}</strong><small>{property.bedrooms > 0 ? `${property.bedrooms} BHK · ` : ''}{property.area_sqft ? `${Number(property.area_sqft).toLocaleString('en-IN')} sq ft` : 'Area not provided'}</small></span>
              <b>{currency.format(property.price)}{property.transaction_type === 'rent' ? <small> / mo.</small> : null}</b>
              <ArrowRight size={14} />
            </Link>)}
            {loadState === 'loading' && <p className="insights-empty">Loading current PREM listings…</p>}
            {loadState === 'error' && <p className="insights-empty" role="alert">Published inventory could not be loaded. Please try again later.</p>}
            {loadState === 'unavailable' && <p className="insights-empty">The property database is not configured for this deployment.</p>}
            {loadState === 'ready' && selectedProperties.length === 0 && <p className="insights-empty">No published property matches these filters in {selectedLocality}.</p>}
            {selectedProperties.length > 5 && <Link className="insights-view-all" to="/#search">Browse all {selectedProperties.length} properties <ArrowRight size={14} /></Link>}
          </div>
          <div className="insights-evidence-note"><Info size={16} /><div><strong>Evidence available today</strong><p>Property details and published inventory counts only. This is not a sale-price index, transaction record or forecast.</p></div></div>
          <div className="insights-unavailable"><span className="eyebrow">NOT YET VERIFIED</span><p>{selectedProfile.evidence}</p><small>No locality ranking or return estimate is generated from missing data.</small></div>
          <Link className="insights-contact-link" to="/#contact">Talk through your priorities <ArrowRight size={15} /></Link>
          {recordCount > records.length && <p className="insights-cap-note">Showing the first {records.length} of {recordCount} published records.</p>}
        </aside>
      </section>
      <section className="insights-footnote wrap"><p>Map markers locate named areas approximately. They do not identify a building, property boundary, travel distance, amenity, or investment outcome.</p></section>
  </>;
}

function LocalityInsightsPage() {
  return <div className="site-shell insights-page">
    <SiteHeader />
    <main><LocalityInsightsExplorer /></main>
    <SiteFooter />
  </div>;
}

export default LocalityInsightsPage;

import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Building2, ChevronDown,
  Home, KeyRound, MapPin, MessageCircle, Phone, Search, Store
} from 'lucide-react';
import './App.css';
import './components/HeroMedia.css';
import { supabase } from './lib/supabase';
import { whatsappUrl } from './lib/whatsapp';
import HeroMedia from './components/HeroMedia';
import PropertyResults from './components/sections/PropertyResults';
import { SiteFooter, SiteHeader } from './components/SiteChrome.jsx';
import { LOCALITY_NAMES } from './lib/localities.js';

const LocalityInsightsExplorer = lazy(() => import('./components/sections/LocalityInsightsPage.jsx').then((module) => ({ default: module.LocalityInsightsExplorer })));

async function searchPublishedProperties(filters) {
  if (!supabase) throw new Error('Property search is not configured.');
  const commercialTypes = ['Shop', 'Office', 'Commercial unit'];
  let query = supabase
    .from('properties')
    .select('id,title,property_type,transaction_type,price,deposit,area_sqft,bedrooms,furnishing,description,features,image_urls,locality:localities!inner(name)', { count: 'exact' })
    .eq('status', 'published')
    .order('price', { ascending: true })
    .limit(1000);

  if (filters.transaction === 'Buy') query = query.eq('transaction_type', 'sale');
  if (filters.transaction === 'Rent') query = query.eq('transaction_type', 'rent');
  if (filters.transaction === 'Commercial' || commercialTypes.includes(filters.propertyType)) query = query.eq('property_type', 'commercial');
  if (filters.transaction !== 'Commercial' && !commercialTypes.includes(filters.propertyType)) {
    if (filters.propertyType === '1 BHK') query = query.eq('bedrooms', 1);
    if (filters.propertyType === '2 BHK') query = query.eq('bedrooms', 2);
    if (filters.propertyType === '3 BHK or larger') query = query.gte('bedrooms', 3);
  }
  if (filters.locality && filters.locality !== 'Flexible / nearby') query = query.ilike('locality.name', `%${filters.locality}%`);
  const maxPrice = Number(filters.budget);
  if (Number.isFinite(maxPrice) && maxPrice > 0) query = query.lte('price', maxPrice);
  const deposit = Number(filters.minimumDeposit);
  if (Number.isFinite(deposit) && deposit > 0) query = query.gte('deposit', deposit);
  const areaFrom = Number(filters.minimumArea);
  if (Number.isFinite(areaFrom) && areaFrom > 0) query = query.gte('area_sqft', areaFrom);
  const areaTo = Number(filters.maximumArea);
  if (Number.isFinite(areaTo) && areaTo > 0) query = query.lte('area_sqft', areaTo);
  if (filters.furnishing !== 'Any furnishing') query = query.eq('furnishing', filters.furnishing);
  return query;
}

function App() {
  const [transaction, setTransaction] = useState('Buy');
  const [propertyType, setPropertyType] = useState('Any property');
  const [locality, setLocality] = useState('Flexible / nearby');
  const [budget, setBudget] = useState('');
  const [minimumDeposit, setMinimumDeposit] = useState('');
  const [minimumArea, setMinimumArea] = useState('');
  const [maximumArea, setMaximumArea] = useState('');
  const [furnishing, setFurnishing] = useState('Any furnishing');
  const [properties, setProperties] = useState([]);
  const [propertyCount, setPropertyCount] = useState(0);
  const [searchState, setSearchState] = useState('loading');
  const [lead, setLead] = useState({ name: '', phone: '', requirement: 'Buy a property', details: '' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    searchPublishedProperties({
      transaction: 'Buy', propertyType: 'Any property', locality: 'Flexible / nearby', budget: '',
      minimumDeposit: '', minimumArea: '', maximumArea: '', furnishing: 'Any furnishing',
    }).then(({ data, error, count }) => {
      if (!active) return;
      if (error) throw error;
      setProperties(data ?? []);
      setPropertyCount(count ?? data?.length ?? 0);
      setSearchState('ready');
    }).catch(() => {
      if (!active) return;
      setProperties([]);
      setPropertyCount(0);
      setSearchState('error');
    });
    return () => { active = false; };
  }, []);

  const requirementMessage = useMemo(() => (
    `Requirement: ${transaction}; Property type: ${propertyType}; Preferred area: ${locality || 'Flexible'}; Maximum price: ${budget || 'Not specified'}; Minimum deposit: ${minimumDeposit || 'Not specified'}; Area: ${minimumArea || 'Any'}–${maximumArea || 'Any'} sq ft; Furnishing: ${furnishing}`
  ), [transaction, propertyType, locality, budget, minimumDeposit, minimumArea, maximumArea, furnishing]);

  async function submitSearch(event) {
    event.preventDefault();
    const requirement = transaction === 'Buy' ? 'Buy a property' : transaction === 'Rent' ? 'Rent a property' : transaction === 'Sell' ? 'Sell my property' : 'Commercial property';
    setLead((current) => ({
      ...current,
      requirement,
      details: requirementMessage,
    }));

    if (transaction === 'Sell') {
      setSearchState('idle');
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSearchState('loading');
    try {
      const { data, error, count } = await searchPublishedProperties({ transaction, propertyType, locality, budget, minimumDeposit, minimumArea, maximumArea, furnishing });
      if (error) throw error;
      setProperties(data ?? []);
      setPropertyCount(count ?? data?.length ?? 0);
      setSearchState('ready');
    } catch {
      setProperties([]);
      setPropertyCount(0);
      setSearchState('error');
    }
    document.getElementById('property-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitLead(event) {
    event.preventDefault();
    const message = [
      'Hello PREM, I would like to discuss a property requirement.',
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Requirement: ${lead.requirement}`,
      lead.details ? `Details: ${lead.details}` : '',
    ].filter(Boolean).join('\n');
    setNotice('Opening WhatsApp with your enquiry. Please press Send in WhatsApp to share it with PREM.');
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="hero" id="home">
          <HeroMedia />
          <div className="hero-shade" />
          <div className="wrap hero-content">
            <div className="eyebrow light"><span className="eyebrow-line" /> MIRA ROAD · BHAYANDAR · WESTERN SUBURBS</div>
            <h1>A better view of<br /><em>Mira–Bhayandar.</em></h1>
            <p className="hero-lede">Find a home with local knowledge and the details you need to choose well.</p>
          </div>
          <section className="hero-search-section" id="search">
            <div className="wrap">
              <div className="search-card">
              <div className="search-heading">
                <div><span className="eyebrow">START WITH YOUR PLAN</span><h2>What are you looking for?</h2></div>
                <span className="search-note"><MapPin size={14} /> Focused on Mira-Bhayandar</span>
              </div>
              <div className="transaction-tabs" role="tablist" aria-label="Property requirement">
                {['Buy', 'Rent', 'Sell', 'Commercial'].map((item) => (
                  <button key={item} type="button" className={transaction === item ? 'transaction-tab active' : 'transaction-tab'} onClick={() => setTransaction(item)} role="tab" aria-selected={transaction === item}>
                    {item === 'Buy' ? <Home size={16} /> : item === 'Rent' ? <KeyRound size={16} /> : item === 'Sell' ? <ArrowRight size={16} /> : <Store size={16} />}{item}
                  </button>
                ))}
              </div>
              <form className="search-form" onSubmit={submitSearch}>
                <label className="field"><span>Preferred locality / micro-market</span><span className="select-wrap"><MapPin size={17} /><select value={locality} onChange={(e) => setLocality(e.target.value)}>{LOCALITY_NAMES.map((name) => <option key={name}>{name}</option>)}<option>Flexible / nearby</option></select><ChevronDown size={15} /></span></label>
                <label className="field"><span>BHK / property type</span><span className="select-wrap"><Building2 size={17} /><select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}><option>Any property</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK or larger</option><option>Shop</option><option>Office</option><option>Commercial unit</option></select><ChevronDown size={15} /></span></label>
                <label className="field"><span>Maximum budget (₹)</span><input type="number" min="0" step="1000" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder={transaction === 'Buy' ? 'e.g. 8500000' : 'e.g. 25000'} /></label>
                <label className="field"><span>Minimum deposit (₹)</span><input type="number" min="0" step="1000" value={minimumDeposit} onChange={(e) => setMinimumDeposit(e.target.value)} placeholder="Optional" /></label>
                <button className="button button-dark search-submit" type="submit"><Search size={17} /> Match my requirement</button>
                <details className="search-advanced">
                  <summary>More filters</summary>
                  <div className="search-advanced-fields">
                    <label className="field"><span>Minimum area (sq ft)</span><input type="number" min="0" value={minimumArea} onChange={(e) => setMinimumArea(e.target.value)} placeholder="Any" /></label>
                    <label className="field"><span>Maximum area (sq ft)</span><input type="number" min="0" value={maximumArea} onChange={(e) => setMaximumArea(e.target.value)} placeholder="Any" /></label>
                    <label className="field"><span>Furnishing</span><select value={furnishing} onChange={(e) => setFurnishing(e.target.value)}><option>Any furnishing</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="furnished">Furnished</option></select></label>
                  </div>
                </details>
              </form>
                <p className="search-disclaimer">We confirm current availability before sharing a property. No unverified listing claims.</p>
              </div>
            </div>
          </section>
          <div className="hero-side-label">MIRA-BHAYANDAR · EST. 2001</div>
        </section>

        <div className="wrap">
          <PropertyResults
            state={searchState}
            properties={properties}
            count={propertyCount}
            onEnquire={(property) => {
              setLead((current) => ({
                ...current,
                requirement: property.transaction_type === 'sale' ? 'Buy a property' : 'Rent a property',
                details: `Interested in ${property.title} in ${property.locality?.name ?? 'Mira-Bhayandar'}. ${requirementMessage}`,
              }));
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </div>

        <Suspense fallback={<section className="insights-intro" aria-live="polite"><div className="wrap">Loading locality insights…</div></section>}>
          <LocalityInsightsExplorer embedded />
        </Suspense>

        <section className="about-section" id="about">
          <div className="about-photo"><img src="/assets/office.png" alt="PREM property consultation" loading="lazy" /><span className="photo-caption">PERSONAL SERVICE, BUILT OVER TIME</span></div>
          <div className="about-copy"><span className="eyebrow">THE PREM APPROACH</span><h2>More than a listing.<br /><em>A relationship.</em></h2><p>Real estate is personal. A home, a rental, a shop or a sale represents a major decision. PREM brings more than two decades of local business experience together with property discovery and market intelligence.</p><p>We work to understand your budget, timing and priorities before suggesting the next step. If a property is not the right fit, we would rather be clear about it.</p><div className="about-proof"><div><strong>20+</strong><span>years of local experience</span></div><div><strong>01</strong><span>personal point of contact</span></div><div><strong>MB</strong><span>Mira-Bhayandar focus</span></div></div><a className="text-link" href="#contact">Get to know our team <ArrowRight size={16} /></a></div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="wrap contact-layout">
            <div className="contact-copy"><span className="eyebrow light">LET’S TALK PROPERTY</span><h2>Your next move<br />starts <em>here.</em></h2><p>Share a few details about what you need. Your enquiry will open in WhatsApp so you can review it and send it directly to PREM.</p><a className="contact-phone" href="tel:+919833325547"><Phone size={18} /><span><small>Call our team</small><strong>+91 98333 25547</strong></span></a><div className="contact-location"><MapPin size={18} /><span>Mira Road & Bhayandar<br />Maharashtra, India</span></div></div>
            <form className="lead-form" onSubmit={submitLead}>
              <div className="form-top"><span>PROPERTY ENQUIRY</span><MessageCircle size={19} /></div>
              <h3>Tell us what you need.</h3><p>We’ll use these details to start your conversation.</p>
              <label>Your name<input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Full name" autoComplete="name" /></label>
              <label>Phone number<input required type="tel" inputMode="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Your contact number" autoComplete="tel" /></label>
              <label>I'm looking to<select value={lead.requirement} onChange={(e) => setLead({ ...lead, requirement: e.target.value })}><option>Rent a property</option><option>Buy a property</option><option>Sell my property</option><option>List a rental property</option><option>Find a commercial property</option><option>Discuss a property partnership</option></select></label>
              <label>Additional details<textarea value={lead.details} onChange={(e) => setLead({ ...lead, details: e.target.value })} placeholder="Locality, budget, BHK, move-in date or anything else that matters" rows={3} /></label>
              <button className="button button-gold form-submit" type="submit">Continue to WhatsApp <ArrowRight size={17} /></button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
              <small className="privacy-note">By continuing, you choose to share these details with PREM to respond to your enquiry.</small>
            </form>
          </div>
        </section>

      </main>

      <SiteFooter />

      <a className="floating-whatsapp" href={whatsappUrl('Hello PREM, I would like to discuss a property requirement.')} target="_blank" rel="noreferrer" aria-label="Message PREM on WhatsApp"><MessageCircle size={21} /><span>WhatsApp us</span></a>
    </div>
  );
}

export default App;

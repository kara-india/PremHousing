import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, Building2, Check, ChevronDown, Clock3,
  Home, KeyRound, MapPin, Menu, MessageCircle, Phone, Search, ShieldCheck,
  Store, X
} from 'lucide-react';
import './App.css';

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '919833325547').replace(/[^0-9]/g, '');

const areas = [
  { name: 'Mira Road East', note: 'Residential homes, resale & rentals', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=85' },
  { name: 'Bhayandar East', note: 'Homes close to everyday essentials', image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85' },
  { name: 'Bhayandar West', note: 'Residential and commercial options', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85' },
  { name: 'Commercial spaces', note: 'Shops, offices & business premises', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85' },
];

const services = [
  { icon: Home, title: 'Buy a home', text: 'Explore resale and new-project options with local guidance.', action: 'Buy' },
  { icon: KeyRound, title: 'Rent a property', text: 'Find a home that fits your budget, location and move-in date.', action: 'Rent' },
  { icon: Building2, title: 'Sell your property', text: 'Discuss pricing, buyer enquiries and a clear selling process.', action: 'Sell' },
  { icon: Store, title: 'Commercial property', text: 'Find or lease shops, offices and other business spaces.', action: 'Commercial' },
];

function whatsappUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function App() {
  const [transaction, setTransaction] = useState('Rent');
  const [propertyType, setPropertyType] = useState('Any property');
  const [locality, setLocality] = useState('Mira Road');
  const [budget, setBudget] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', requirement: 'Rent a property', details: '' });
  const [notice, setNotice] = useState('');

  const requirementMessage = useMemo(() => {
    return `Hello Prem Housing, I would like help with a property in Mira-Bhayandar.\nRequirement: ${transaction}\nProperty type: ${propertyType}\nPreferred area: ${locality || 'Flexible'}\nBudget: ${budget || 'Please discuss'}\nPlease share suitable options and confirm availability.`;
  }, [transaction, propertyType, locality, budget]);

  function submitSearch(event) {
    event.preventDefault();
    setLead((current) => ({
      ...current,
      requirement: transaction === 'Buy' ? 'Buy a property' : transaction === 'Rent' ? 'Rent a property' : transaction === 'Sell' ? 'Sell my property' : 'Commercial property',
      details: `Property type: ${propertyType}; Area: ${locality}; Budget: ${budget || 'Not specified'}`,
    }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submitLead(event) {
    event.preventDefault();
    const message = [
      'Hello Prem Housing, I would like to discuss a property requirement.',
      `Name: ${lead.name}`,
      `Phone: ${lead.phone}`,
      `Requirement: ${lead.requirement}`,
      lead.details ? `Details: ${lead.details}` : '',
    ].filter(Boolean).join('\n');
    setNotice('Opening WhatsApp with your enquiry. Please press Send in WhatsApp to share it with Prem Housing.');
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  }

  function chooseService(action) {
    setTransaction(action);
    setLead((current) => ({
      ...current,
      requirement: action === 'Buy' ? 'Buy a property' : action === 'Rent' ? 'Rent a property' : action === 'Sell' ? 'Sell my property' : 'Commercial property',
    }));
    document.getElementById('search')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return (
    <div className="site-shell">
      <div className="topline">
        <div className="wrap topline-inner">
          <span><MapPin size={14} /> Mira Road · Bhayandar · Maharashtra</span>
          <a href="tel:+919833325547"><Phone size={14} /> +91 98333 25547</a>
        </div>
      </div>

      <header className="header">
        <div className="wrap nav-inner">
          <a className="brand" href="#home" aria-label="Prem Housing home">
            <span className="brand-mark">PH<span>.</span></span>
            <span className="brand-copy"><strong>PREM HOUSING</strong><small>LOCAL KNOWLEDGE. PERSONAL SERVICE.</small></span>
          </a>
          <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <nav className={mobileMenuOpen ? 'nav-links open' : 'nav-links'}>
            <a href="#search" onClick={() => setMobileMenuOpen(false)}>Find a property</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)}>What we do</a>
            <a href="#areas" onClick={() => setMobileMenuOpen(false)}>Explore areas</a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>Our story</a>
            <a className="nav-cta" href="#contact" onClick={() => setMobileMenuOpen(false)}>Talk to our team <ArrowRight size={15} /></a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-image" role="img" aria-label="Contemporary residential building in Mumbai" />
          <div className="hero-shade" />
          <div className="wrap hero-content">
            <div className="eyebrow light"><span className="eyebrow-line" /> YOUR MIRA-BHAYANDAR PROPERTY PARTNER</div>
            <h1>Find the place<br />you’ll <em>call home.</em></h1>
            <p className="hero-lede">For over 20 years, Prem Housing has helped people navigate property decisions across Mira Road and Bhayandar — with local insight and personal attention.</p>
            <div className="hero-actions">
              <a className="button button-gold" href="#search">Explore your options <ArrowDownRight size={17} /></a>
              <a className="hero-call" href="tel:+919833325547"><span className="call-icon"><Phone size={17} /></span><span><small>Speak with our team</small><strong>+91 98333 25547</strong></span></a>
            </div>
            <div className="hero-footnote"><ShieldCheck size={16} /> Local guidance for buying, selling, renting and commercial property</div>
          </div>
          <div className="hero-side-label">MIRA-BHAYANDAR · EST. 2001</div>
        </section>

        <section className="search-section" id="search">
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
                <label className="field"><span>Preferred locality</span><span className="select-wrap"><MapPin size={17} /><select value={locality} onChange={(e) => setLocality(e.target.value)}><option>Mira Road</option><option>Mira Road East</option><option>Mira Road West</option><option>Bhayandar East</option><option>Bhayandar West</option><option>Kashimira</option><option>Flexible / nearby</option></select><ChevronDown size={15} /></span></label>
                <label className="field"><span>Property type</span><span className="select-wrap"><Building2 size={17} /><select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}><option>Any property</option><option>1 BHK</option><option>2 BHK</option><option>3 BHK or larger</option><option>Shop</option><option>Office</option><option>Commercial unit</option></select><ChevronDown size={15} /></span></label>
                <label className="field"><span>Budget (optional)</span><input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. ₹25,000 / month" /></label>
                <button className="button button-dark search-submit" type="submit"><Search size={17} /> Match my requirement</button>
              </form>
              <p className="search-disclaimer">We confirm current availability before sharing a property. No unverified listing claims.</p>
            </div>
          </div>
        </section>

        <section className="section services-section" id="services">
          <div className="wrap">
            <div className="section-intro">
              <div><span className="eyebrow">ONE LOCAL TEAM, EVERY PROPERTY NEED</span><h2>Make your next move<br /><em>with confidence.</em></h2></div>
              <p>Whether you’re finding a first home, moving tenants into a property, selling a flat or choosing a shop, start with a conversation grounded in the local market.</p>
            </div>
            <div className="service-grid">
              {services.map(({ icon: Icon, title, text, action }, index) => (
                <button className="service-card" key={title} onClick={() => chooseService(action)}>
                  <span className="service-index">0{index + 1}</span><span className="service-icon"><Icon size={23} strokeWidth={1.6} /></span>
                  <h3>{title}</h3><p>{text}</p><span className="service-link">Tell us what you need <ArrowRight size={16} /></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="inventory-section" id="properties">
          <div className="wrap inventory-inner">
            <div className="inventory-copy"><span className="eyebrow light">QUALITY OVER QUANTITY</span><h2>Good property advice<br />starts with <em>the facts.</em></h2><p>We are building a carefully maintained catalogue of available homes, resale properties and commercial spaces. Every listing should be checked with its owner or authorized agent before a viewing is arranged.</p><a href="#contact" className="button button-gold">Request current options <ArrowRight size={16} /></a></div>
            <div className="inventory-panel">
              <div className="inventory-icon"><ShieldCheck size={28} /></div><span className="inventory-label">PREM HOUSING LISTING STANDARD</span><h3>Availability comes first.</h3>
              <ul><li><Check size={16} /> Confirmed with owner or authorized agent</li><li><Check size={16} /> Clear price and property details</li><li><Check size={16} /> Viewing coordinated by a real person</li></ul>
              <div className="inventory-status"><span className="status-dot" /> Current inventory is confirmed on request</div>
            </div>
          </div>
        </section>

        <section className="section areas-section" id="areas">
          <div className="wrap">
            <div className="section-intro area-intro"><div><span className="eyebrow">KNOW THE NEIGHBOURHOOD</span><h2>Local roots. <em>Local perspective.</em></h2></div><p>Tell us where you want to be. We’ll help narrow the search to the right neighbourhood and property type.</p></div>
            <div className="area-grid">
              {areas.map((area, index) => <a href="#contact" className="area-card" key={area.name} onClick={() => setLead((current) => ({ ...current, details: `Preferred area: ${area.name}` }))}>
                <img src={area.image} alt="" loading="lazy" /><span className="area-overlay" /><span className="area-number">0{index + 1}</span><span className="area-content"><strong>{area.name}</strong><small>{area.note}</small></span><span className="area-arrow"><ArrowRight size={18} /></span>
              </a>)}
            </div>
            <p className="image-note">Neighbourhood images are illustrative and do not represent a specific property listing.</p>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-photo"><img src="/assets/office.png" alt="Prem Housing property consultation" loading="lazy" /><span className="photo-caption">PERSONAL SERVICE, BUILT OVER TIME</span></div>
          <div className="about-copy"><span className="eyebrow">THE PREM HOUSING APPROACH</span><h2>More than a listing.<br /><em>A relationship.</em></h2><p>Real estate is personal. A home, a rental, a shop or a sale represents a major decision. Prem Housing brings more than two decades of local business experience and a relationship-driven approach to every conversation.</p><p>We work to understand your budget, timing and priorities before suggesting the next step. If a property is not the right fit, we would rather be clear about it.</p><div className="about-proof"><div><strong>20+</strong><span>years of local experience</span></div><div><strong>01</strong><span>personal point of contact</span></div><div><strong>MB</strong><span>Mira-Bhayandar focus</span></div></div><a className="text-link" href="#contact">Get to know our team <ArrowRight size={16} /></a></div>
        </section>

        <section className="contact-section section" id="contact">
          <div className="wrap contact-layout">
            <div className="contact-copy"><span className="eyebrow light">LET’S TALK PROPERTY</span><h2>Your next move<br />starts <em>here.</em></h2><p>Share a few details about what you need. Your enquiry will open in WhatsApp so you can review it and send it directly to Prem Housing.</p><a className="contact-phone" href="tel:+919833325547"><Phone size={18} /><span><small>Call our team</small><strong>+91 98333 25547</strong></span></a><div className="contact-location"><MapPin size={18} /><span>Mira Road & Bhayandar<br />Maharashtra, India</span></div></div>
            <form className="lead-form" onSubmit={submitLead}>
              <div className="form-top"><span>PROPERTY ENQUIRY</span><MessageCircle size={19} /></div>
              <h3>Tell us what you need.</h3><p>We’ll use these details to start your conversation.</p>
              <label>Your name<input required value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Full name" autoComplete="name" /></label>
              <label>Phone number<input required type="tel" inputMode="tel" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} placeholder="Your contact number" autoComplete="tel" /></label>
              <label>I'm looking to<select value={lead.requirement} onChange={(e) => setLead({ ...lead, requirement: e.target.value })}><option>Rent a property</option><option>Buy a property</option><option>Sell my property</option><option>List a rental property</option><option>Find a commercial property</option><option>Discuss a property partnership</option></select></label>
              <label>Additional details<textarea value={lead.details} onChange={(e) => setLead({ ...lead, details: e.target.value })} placeholder="Locality, budget, BHK, move-in date or anything else that matters" rows={3} /></label>
              <button className="button button-gold form-submit" type="submit">Continue to WhatsApp <ArrowRight size={17} /></button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
              <small className="privacy-note">By continuing, you choose to share these details with Prem Housing to respond to your enquiry.</small>
            </form>
          </div>
        </section>

        <section className="closing-strip"><div className="wrap closing-inner"><span>PREM HOUSING</span><p>Local knowledge for your next property decision.</p><a href="#home">Back to top ↑</a></div></section>
      </main>

      <footer className="footer"><div className="wrap footer-main"><a className="brand footer-brand" href="#home"><span className="brand-mark">PH<span>.</span></span><span className="brand-copy"><strong>PREM HOUSING</strong><small>MIRA-BHAYANDAR, MAHARASHTRA</small></span></a><p>Residential and commercial property guidance for buying, selling, renting and leasing.</p><div className="footer-links"><a href="#services">Services</a><a href="#areas">Areas</a><a href="#about">About</a><a href="#contact">Contact</a><a href="/privacy.html">Privacy</a></div></div><div className="wrap footer-bottom"><span>© {new Date().getFullYear()} Prem Housing. All rights reserved.</span><span>Property availability and details are subject to confirmation.</span></div></footer>
      <a className="floating-whatsapp" href={whatsappUrl('Hello Prem Housing, I would like to discuss a property requirement.')} target="_blank" rel="noreferrer" aria-label="Message Prem Housing on WhatsApp"><MessageCircle size={21} /><span>WhatsApp us</span></a>
    </div>
  );
}

export default App;

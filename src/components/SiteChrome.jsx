import { useState } from 'react';
import { ArrowRight, MapPin, Menu, Phone, X } from 'lucide-react';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMenu = () => setMobileMenuOpen(false);

  return <>
    <div className="topline">
      <div className="wrap topline-inner">
        <span><MapPin size={14} /> Mira Road · Bhayandar · Maharashtra</span>
        <a href="tel:+919833325547"><Phone size={14} /> +91 98333 25547</a>
      </div>
    </div>
    <header className="header">
      <div className="wrap nav-inner">
        <a className="brand" href="/#home" aria-label="PREM home" onClick={closeMenu}>
          <span className="brand-mark">P<span>.</span></span>
          <span className="brand-copy"><strong>PREM</strong><small>PROPERTY & REAL ESTATE MARKET</small></span>
        </a>
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <nav className={mobileMenuOpen ? 'nav-links open' : 'nav-links'} aria-label="Main navigation">
          <a href="/#search" onClick={closeMenu}>Find a property</a>
          <a href="/#locality-insights" onClick={closeMenu}>Locality insights</a>
          <a href="/#about" onClick={closeMenu}>Our story</a>
          <a href="/auth" onClick={closeMenu}>Sign in</a>
          <a className="nav-cta" href="/#contact" onClick={closeMenu}>Talk to our team <ArrowRight size={15} /></a>
        </nav>
      </div>
    </header>
  </>;
}

export function SiteFooter() {
  return <>
    <section className="closing-strip"><div className="wrap closing-inner"><span>PREM</span><p>Property discovery and market intelligence for your next move.</p><a href="/#home">Back to top ↑</a></div></section>
    <footer className="footer">
      <div className="wrap footer-main">
        <a className="brand footer-brand" href="/#home"><span className="brand-mark">P<span>.</span></span><span className="brand-copy"><strong>PREM</strong><small>PROPERTY & REAL ESTATE MARKET</small></span></a>
        <p>Residential and commercial property guidance, local market insight and future-facing predictions.</p>
        <div className="footer-links"><a href="/#locality-insights">Locality insights</a><a href="/#about">About</a><a href="/#contact">Contact</a><a href="/privacy.html">Privacy</a><a href="/auth">Account sign-in</a><a href="/admin">Staff sign-in</a></div>
      </div>
      <div className="wrap footer-bottom"><span>© {new Date().getFullYear()} PREM. All rights reserved.</span><span>Property availability and details are subject to confirmation.</span></div>
    </footer>
  </>;
}

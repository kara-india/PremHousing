import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'Properties', href: '/#properties' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      {/* Top Bar - Contact Info */}
      <div className="top-bar">
        <div className="container top-bar-container">
          <div className="top-bar-item">
            <MapPin size={14} />
            <span>Mira-Bhayandar, Maharashtra</span>
          </div>
          <div className="top-bar-item">
            <Phone size={14} />
            <a href="tel:+919876543210">+91 98765 43210</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="main-nav">
        <div className="container nav-container">
          <Link to="/" className="logo">
            <span className="logo-icon">PH</span>
            <span className="logo-text">Prem Housing</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="desktop-menu">
            <ul>
              {navLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/#') ? (
                    <a href={link.href}>{link.name}</a>
                  ) : (
                    <Link to={link.href}>{link.name}</Link>
                  )}
                </li>
              ))}
            </ul>
            <a href="#contact" className="btn btn-primary">Get in Touch</a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <ul>
          {navLinks.map((link) => (
            <li key={link.name}>
              {link.href.startsWith('/#') ? (
                <a href={link.href} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</a>
              ) : (
                <Link to={link.href} onClick={() => setIsMobileMenuOpen(false)}>{link.name}</Link>
              )}
            </li>
          ))}
        </ul>
        <div className="mobile-menu-footer">
          <a href="#contact" className="btn btn-primary" onClick={() => setIsMobileMenuOpen(false)}>Get in Touch</a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

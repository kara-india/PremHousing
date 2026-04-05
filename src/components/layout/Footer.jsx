import React from 'react';
import { Home, MapPin, Phone, Mail, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              <span className="logo-icon small">PH</span>
              <span className="logo-text">Prem Housing</span>
            </a>
            <p className="footer-about">
              Premier real estate agency in Mira-Bhayandar providing comprehensive property solutions for buyers, sellers, and investors.
            </p>
            <div className="social-links-footer">
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
              <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            </div>
          </div>
          
          <div className="footer-links-group">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#properties">Properties</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4>Property Types</h4>
            <ul>
              <li><a href="#">Apartments</a></li>
              <li><a href="#">Commercial Spaces</a></li>
              <li><a href="#">Villas</a></li>
              <li><a href="#">Plots</a></li>
              <li><a href="#">New Projects</a></li>
            </ul>
          </div>
          
          <div className="footer-contact">
            <h4>Contact Info</h4>
            <ul>
              <li>
                <MapPin size={18} className="text-secondary" />
                <span>123, Prem Plaza, Station Road, Mira Road East, 401107</span>
              </li>
              <li>
                <Phone size={18} className="text-secondary" />
                <span>+91 98765 43210</span>
              </li>
              <li>
                <Mail size={18} className="text-secondary" />
                <span>info@premhousing.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-inner">
            <p>&copy; {new Date().getFullYear()} Prem Housing and Real Estate. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/919876543210" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="whatsapp-icon">
          <path d="M16.05 2.5C8.6 2.5 2.55 8.55 2.55 16c0 2.95 1 5.7 2.7 8l-1.8 6.55 6.75-1.75c2.2 1.5 4.8 2.35 7.5 2.35 7.45 0 13.5-6.05 13.5-13.5S23.5 2.5 16.05 2.5zm0 24.3c-2.35 0-4.65-.65-6.65-1.8l-.45-.25-4.4 1.15 1.15-4.3-.3-.5c-1.3-2.05-1.95-4.45-1.95-6.95 0-6.1 4.95-11.05 11.05-11.05s11.05 4.95 11.05 11.05-4.95 11.05-11.05 11.05zm5.95-8.05c-.35-.15-1.95-.95-2.25-1.05-.3-.1-.55-.15-.75.15-.2.3-.85 1.05-1.05 1.25-.2.2-.4.25-.75.05-2.15-1-3.6-2-4.9-4.2-.15-.25 0-.4.15-.55.15-.15.3-.35.45-.55.15-.2.2-.35.3-.55.1-.2.05-.4-.05-.55-.1-.15-.75-1.8-1.05-2.45-.3-.65-.55-.55-.75-.55h-.65c-.25 0-.65.1-.95.4-.3.3-1.15 1.15-1.15 2.8s1.2 3.25 1.35 3.5c.15.25 2.4 3.65 5.8 5.1s4 1.45 4.7 1.35c.7-.1 1.95-.8 2.25-1.55.3-.75.3-1.4.2-1.55-.1-.15-.3-.25-.6-.4z" fill="#fff"/>
        </svg>
      </a>
    </footer>
  );
};

export default Footer;

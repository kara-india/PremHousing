import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Square, Phone, Play, Share2, Copy, Check, Calendar } from 'lucide-react';
import { listings, generateSocialPost } from '../../constants/listings';
import BookingModal from '../common/BookingModal';
import './PropertyDetail.css';

const PropertyDetail = () => {
  const { id } = useParams();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const property = listings.find(p => p.id === id);
  if (!property) return <div className="container section">Property not found.</div>;

  const socialContent = generateSocialPost(property);

  const handleCopySocial = () => {
    const text = `${socialContent.caption}\n\n${socialContent.hashtags}\n\n${socialContent.cta}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="property-detail-page">
      <div className="container section">
        <Link to="/" className="back-link">← Back to Listings</Link>
        
        <div className="detail-header">
          <div className="header-info">
            <span className="badge-gold">{property.tag}</span>
            <h1 className="property-title-large">{property.title}</h1>
            <div className="location-row">
              <MapPin size={18} />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="header-price">
            <span className="price-label">Price Range</span>
            <h3>{property.price}</h3>
          </div>
        </div>

        {/* Video Walkthrough - ABOVE THE FOLD */}
        <div className="video-section animate-fade-in">
          <div className="section-header">
            <h3><Play size={20} /> Watch Flat Walkthrough</h3>
          </div>
          <div className="video-container">
            <iframe 
              src={property.videoUrl} 
              title="Property Walkthrough"
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="image-gallery">
              <img src={property.images[0]} alt={property.title} className="main-image" />
            </div>

            <div className="info-card">
              <h3>Description</h3>
              <p className="description-text">{property.description}</p>
              
              <div className="property-meta">
                <div className="meta-item">
                  <Bed size={20} />
                  <span>{property.bhk} BHK</span>
                </div>
                <div className="meta-item">
                  <Square size={20} />
                  <span>{property.area} Area</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Key Highlights</h3>
              <ul className="highlights-list">
                {property.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="detail-sidebar">
            <div className="sticky-sidebar">
              <div className="booking-card">
                <h3>Ready to See This?</h3>
                <p>Book a private, zero-cost site visit today.</p>
                <button 
                  className="btn btn-primary w-full shadow-gold"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Calendar size={18} /> Book Free Site Visit
                </button>
                <a 
                  href={`https://wa.me/919876543210?text=Hi, I want details for ${property.title}`} 
                  target="_blank"
                  className="btn btn-outline w-full whatsapp-btn-large"
                >
                  <Phone size={18} /> WhatsApp for Details
                </a>
              </div>

              {/* Social Marketing Section */}
              <div className="marketing-card">
                <div className="marketing-header">
                  <h3><Share2 size={18} /> Social Marketing</h3>
                  <button 
                    className={`copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopySocial}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy Post'}
                  </button>
                </div>
                <div className="social-preview">
                  <pre>{socialContent.caption}</pre>
                  <pre className="hashtags">{socialContent.hashtags}</pre>
                </div>
                <p className="marketing-tip">High-converting post generated for Instagram/FB</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile Only */}
      <div className="mobile-cta-bar">
        <button className="btn btn-primary" onClick={() => setIsBookingOpen(true)}>Book Visit</button>
        <a href={`https://wa.me/919876543210`} className="btn btn-outline whatsapp-icon-btn"><Phone size={20} /></a>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        propertyName={property.title} 
      />
    </div>
  );
};

export default PropertyDetail;

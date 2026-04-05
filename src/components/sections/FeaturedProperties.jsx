import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, MoveRight } from 'lucide-react';
import { listings } from '../../constants/listings';
import './FeaturedProperties.css';

const FeaturedProperties = () => {
  const [filter, setFilter] = useState('All');
  
  const filteredProperties = filter === 'All' 
    ? listings 
    : listings.filter(prop => prop.tag === filter || prop.bhk.includes(filter));

  return (
    <section id="properties" className="section properties-section">
      <div className="container">
        <div className="properties-header">
          <div className="animate-fade-in">
            <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Featured Properties</h2>
            <p className="section-subtitle" style={{ margin: '1rem 0 0 0', textAlign: 'left' }}>
              Discover our hand-picked selection of premium gold-standard properties in Mira-Bhayandar.
            </p>
          </div>
          
          <div className="property-filters">
            {['All', '1 BHK', '2 BHK', '3 BHK'].map(f => (
              <button 
                key={f}
                className={`filter-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="properties-grid">
          {filteredProperties.map(property => (
            <div key={property.id} className="property-card">
              <div className="property-image-wrapper">
                <img src={property.images[0]} alt={property.title} className="property-image" />
                <div className="property-tags">
                  <span className={`tag type-sale`}>{property.tag}</span>
                </div>
              </div>
              
              <div className="property-details">
                <div className="property-price">{property.price}</div>
                <h3 className="property-title">{property.title}</h3>
                <div className="property-location">
                  <MapPin size={16} />
                  <span>{property.location}</span>
                </div>
                
                <div className="property-features">
                  <div className="feature">
                    <Bed size={18} />
                    <span>{property.bhk}</span>
                  </div>
                  <div className="feature">
                    <Square size={18} />
                    <span>{property.area}</span>
                  </div>
                </div>
                
                <div className="property-footer">
                  <Link to={`/property/${property.id}`} className="btn btn-outline w-full shine-btn">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="btn btn-primary">
            Explore All Properties <MoveRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;

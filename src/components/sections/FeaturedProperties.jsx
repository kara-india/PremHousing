import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, MoveRight } from 'lucide-react';
import './FeaturedProperties.css';

const properties = [
  {
    id: 1,
    title: 'Lodha Aqua Luxury Apartments',
    location: 'Dahisar East, near Mira Road',
    price: '₹ 1.2 Cr onwards',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    beds: 2,
    baths: 2,
    area: '950 sq ft',
    type: 'Sale',
    tag: 'Premium'
  },
  {
    id: 2,
    title: 'JP North Garden City',
    location: 'Vinay Nagar, Mira Road East',
    price: '₹ 85 Lakhs',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    beds: 1,
    baths: 2,
    area: '650 sq ft',
    type: 'Sale',
    tag: 'New Launch'
  },
  {
    id: 3,
    title: 'Kanakia Queens',
    location: 'Beverly Park, Mira Road',
    price: '₹ 25,000 / month',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    beds: 2,
    baths: 2,
    area: '850 sq ft',
    type: 'Rent',
    tag: 'Furnished'
  },
  {
    id: 4,
    title: 'Unique Aurum',
    location: 'Poonam Garden, Mira Road',
    price: '₹ 1.5 Cr',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    beds: 3,
    baths: 3,
    area: '1200 sq ft',
    type: 'Sale',
    tag: 'Ready to Move'
  }
];

const FeaturedProperties = () => {
  const [filter, setFilter] = useState('All');
  
  const filteredProperties = filter === 'All' 
    ? properties 
    : properties.filter(prop => prop.type === filter);

  return (
    <section id="properties" className="section properties-section">
      <div className="container">
        <div className="properties-header">
          <div>
            <h2 className="section-title" style={{ margin: 0, textAlign: 'left' }}>Featured Properties</h2>
            <p className="section-subtitle" style={{ margin: '1rem 0 0 0', textAlign: 'left' }}>
              Discover our hand-picked selection of premium properties in Mira-Bhayandar.
            </p>
          </div>
          
          <div className="property-filters">
            {['All', 'Sale', 'Rent'].map(f => (
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
                <img src={property.image} alt={property.title} className="property-image" />
                <div className="property-tags">
                  <span className={`tag type-${property.type.toLowerCase()}`}>{property.type}</span>
                  {property.tag && <span className="tag highlight">{property.tag}</span>}
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
                    <span>{property.beds} Beds</span>
                  </div>
                  <div className="feature">
                    <Bath size={18} />
                    <span>{property.baths} Baths</span>
                  </div>
                  <div className="feature">
                    <Square size={18} />
                    <span>{property.area}</span>
                  </div>
                </div>
                
                <div className="property-footer">
                  <button className="btn btn-outline w-full">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <a href="#all-properties" className="btn btn-primary">
            Explore All Properties <MoveRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;

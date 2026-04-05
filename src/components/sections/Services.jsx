import React from 'react';
import { Home, Key, Map, TrendingUp } from 'lucide-react';
import './Services.css';

const services = [
  {
    id: 1,
    title: 'Property Buying',
    description: 'Find your dream home with our expert guidance. We help you navigate the entire buying process from viewing to closing.',
    icon: <Home size={32} />,
    color: 'var(--primary)',
  },
  {
    id: 2,
    title: 'Property Renting',
    description: 'Looking for a place to rent? We have a wide range of premium rental properties to suit your lifestyle and budget.',
    icon: <Key size={32} />,
    color: 'var(--accent)',
  },
  {
    id: 3,
    title: 'Commercial Spaces',
    description: 'Find the perfect location for your business. We offer prime commercial real estate including shops, offices, and warehouses.',
    icon: <Map size={32} />,
    color: 'var(--secondary)',
  },
  {
    id: 4,
    title: 'Investment Consulting',
    description: 'Maximize your returns with our expert investment advice. We identify high-growth areas and lucrative property opportunities.',
    icon: <TrendingUp size={32} />,
    color: '#10b981', // green
  },
];

const Services = () => {
  return (
    <section id="services" className="section bg-light">
      <div className="container">
        <h2 className="section-title">Our Premium Services</h2>
        <p className="text-center section-subtitle">Comprehensive real estate solutions tailored to your unique needs.</p>
        
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card group">
              <div 
                className="service-icon-wrapper"
                style={{ backgroundColor: `${service.color}15`, color: service.color }}
              >
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <a href="#contact" className="service-link" style={{ color: service.color }}>
                Learn More <span className="arrow">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

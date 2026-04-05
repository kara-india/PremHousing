import React from 'react';
import { Search, MapPin, Home } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero">
      <div className="hero-overlay"></div>
      
      <div className="container hero-container relative z-10">
        <div className="hero-content animate-fade-in">
          <span className="badge">Welcome to Prem Housing</span>
          <h1>Find Your Dream Property in <span className="highlight-text">Mira-Bhayandar</span></h1>
          <p className="hero-subtitle">
            Premium residential and commercial spaces. Expert guidance. Seamless experience. Let us help you find the perfect place to call home.
          </p>
          
          <div className="search-box">
            <div className="search-tabs">
              <button className="tab active">Buy</button>
              <button className="tab">Rent</button>
              <button className="tab">New Projects</button>
            </div>
            
            <form className="search-form" onSubmit={(e) => e.preventDefault()}>
              <div className="search-input-group">
                <MapPin className="input-icon" size={20} />
                <input type="text" placeholder="Location, Landmark, or Project" />
              </div>
              
              <div className="search-input-group">
                <Home className="input-icon" size={20} />
                <select>
                  <option>Property Type</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3+ BHK</option>
                  <option>Commercial</option>
                </select>
              </div>
              
              <button type="submit" className="btn btn-primary search-btn">
                <Search size={20} />
                <span>Search</span>
              </button>
            </form>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <h3>15+</h3>
              <p>Years Experience</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Happy Families</p>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <h3>100+</h3>
              <p>Active Listings</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

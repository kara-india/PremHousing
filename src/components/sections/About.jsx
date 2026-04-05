import React from 'react';
import { Target, Users, Award, ShieldCheck } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="section pb-0">
      <div className="container">
        <div className="about-wrapper">
          
          <div className="about-content">
            <h2 className="section-title" style={{ textAlign: 'left' }}>About Prem Housing</h2>
            <p className="about-lead">
              Your trusted partner in Mira-Bhayandar real estate for over 15 years, dedicated to turning your property dreams into reality.
            </p>
            <p className="about-text">
              At Prem Housing, we believe that finding the right property is more than just a transaction; it's about building a foundation for your future. Founded on principles of integrity, transparency, and market expertise, we have established ourselves as the premier real estate agency in the Mira-Bhayandar region.
            </p>
            <p className="about-text">
              Whether you are a first-time homebuyer, an experienced investor, or looking for the perfect commercial space, our team of dedicated professionals is here to guide you every step of the way with personalized solutions.
            </p>
            
            <div className="about-features">
              <div className="about-feature">
                <div className="feature-icon"><Award size={24} /></div>
                <div>
                  <h4>Local Expertise</h4>
                  <p>Deep knowledge of Mira-Bhayandar's micro-markets.</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-icon"><ShieldCheck size={24} /></div>
                <div>
                  <h4>Verified Listings</h4>
                  <p>100% legal checks on all our featured properties.</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-icon"><Users size={24} /></div>
                <div>
                  <h4>Client-Centric</h4>
                  <p>Dedicated support from property search to registration.</p>
                </div>
              </div>
            </div>
            
            <button className="btn btn-primary mt-6">Learn More About Us</button>
          </div>
          
          <div className="about-image-section">
            <div className="image-grid">
              <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Office building" className="img-large" />
              <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80" alt="Agent with client" className="img-small" />
            </div>
            <div className="experience-badge">
              <span className="years">15+</span>
              <span className="text">Years of<br/>Excellence</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default About;

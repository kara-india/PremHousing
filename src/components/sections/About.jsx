import React from 'react';
import { Award, ShieldCheck, PhoneCall } from 'lucide-react';
import brokerImg from '../../assets/broker.png';
import './About.css';

const About = () => {
  return (
    <section id="about" className="section bg-white border-top">
      <div className="container">
        <div className="about-compact-wrapper">
          
          <div className="about-image-column">
            <div className="profile-container">
              <img src={brokerImg} alt="Principal Consultant" className="profile-img-small" />
              <div className="status-indicator"></div>
            </div>
            <div className="profile-info">
              <h3>Principal Consultant</h3>
              <p>Prem Housing & Real Estate</p>
              <div className="direct-cta-small">
                <PhoneCall size={14} />
                <span>+91 98333 25547</span>
              </div>
            </div>
          </div>

          <div className="about-text-column">
            <h2 className="compact-title">Commitment to Integrity</h2>
            <p className="compact-text">
              With 15+ years of regional leadership in Mira-Bhayandar, we specialize in curating lifestyle residences and verified investment opportunities. Our mission is to provide transparent, secure transactions that honor your vision for a perfect home.
            </p>
            
            <div className="compact-features">
              <div className="c-feature">
                <Award size={18} className="text-primary" />
                <span>Verified Strategic Listings</span>
              </div>
              <div className="c-feature">
                <ShieldCheck size={18} className="text-primary" />
                <span>100% Legal Transparency</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default About;

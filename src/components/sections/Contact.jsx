import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form submitted:', formData);
    alert('Thank you for reaching out! We will get back to you shortly.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="text-center section-subtitle">
          Have a question about a property? Ready to sell? We're here to help.
        </p>
        
        <div className="contact-wrapper">
          <div className="contact-info">
            <h3>Contact Information</h3>
            <p className="mb-8 text-muted">
              Fill up the form and our team will get back to you within 24 hours.
            </p>
            
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon"><Phone size={20} /></div>
                <div>
                  <h4>Call Us</h4>
                  <p>+91 98765 43210</p>
                  <p>+91 91234 56789</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div>
                  <h4>Email Us</h4>
                  <p>info@premhousing.com</p>
                  <p>sales@premhousing.com</p>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon"><MapPin size={20} /></div>
                <div>
                  <h4>Visit Us</h4>
                  <p>123, Prem Plaza, Station Road,</p>
                  <p>Mira Road East, Mira-Bhayandar,</p>
                  <p>Maharashtra 401107</p>
                </div>
              </div>
            </div>
            
            {/* Social Links placeholder */}
            <div className="social-links mt-8">
              <span>Follow us: </span>
              {/* Can add social icons here */}
            </div>
          </div>
          
          <div className="contact-form-container">
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  rows="4" 
                  placeholder="I am interested in..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              
              <button type="submit" className="btn btn-primary w-full">
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </div>
        
        <div className="map-placeholder">
          {/* Will be replaced with actual Mapbox map later */}
          <div className="map-overlay">
            <MapPin size={48} className="text-primary mb-4" />
            <p>Google Maps / Mapbox placeholder</p>
            <span className="text-muted text-sm mt-2">Will be integrated in future phases</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

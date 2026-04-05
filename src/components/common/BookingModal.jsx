import React, { useState } from 'react';
import { X, Send, Calendar, Clock, Phone } from 'lucide-react';
import './BookingModal.css';

const BookingModal = ({ isOpen, onClose, propertyName }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setFormData({ name: '', phone: '', date: '', time: '', message: '' });
    }, 3000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <button className="close-btn" onClick={onClose}><X size={24} /></button>
        
        {!submitted ? (
          <>
            <h2 className="modal-title">Book a Free Site Visit</h2>
            <p className="modal-subtitle">Property: {propertyName}</p>
            
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="+91"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Calendar size={14} /> Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label><Clock size={14} /> Time</label>
                  <select 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  >
                    <option>AM</option>
                    <option>PM</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full">
                <Send size={18} /> Confirm Booking
              </button>
            </form>
            
            <div className="whatsapp-fallback">
              <p>Or faster booking via</p>
              <a 
                href={`https://wa.me/919833325547?text=Hi, I want to book a site visit for ${propertyName}`}
                target="_blank"
                className="btn btn-outline w-full whatsapp-btn"
              >
                <Phone size={18} /> Book via WhatsApp
              </a>
            </div>
          </>
        ) : (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h3>Request Received!</h3>
            <p>Our team will contact you shortly to confirm your visit to <strong>{propertyName}</strong>.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;

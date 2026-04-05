import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { gsap } from 'gsap';
import 'mapbox-gl/dist/mapbox-gl.css';
import './CinematicHero.css';

// Using a token for demo - please replace with your own pk token in .env
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoibWFwYm94YWRtaW4iLCJhIjoiY2x0eXJ0Z3N5MDBiazJrcXF0eGZ6c3g3dyJ9.YOUR_TOKEN';

const CinematicHero = ({ onComplete }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [step, setStep] = useState(0); 
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('prem_housing_intro_seen');
    if (hasSeenIntro) {
      handleComplete();
      return;
    }
    setStep(1);
  }, []);

  const initMap = () => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [72.8777, 19.0760], // Mumbai Start
      zoom: 1, // Start very wide for first frame
      pitch: 45,
      bearing: -10,
      interactive: false,
      attributionControl: false
    });

    map.current.on('style.load', () => {
      // Enable 3D Buildings
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 12,
          paint: {
            'fill-extrusion-color': '#1f1f1f',
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.7
          }
        },
        labelLayerId
      );

      // Add Gold Lighting
      map.current.setLight({
        anchor: 'viewport',
        color: '#C9A646',
        intensity: 0.4,
        position: [1.5, 90, 80]
      });

      // Add Atmospheric Fog
      map.current.setFog({
        'range': [0.5, 10],
        'color': '#121212',
        'horizon-blend': 0.1,
        'high-color': '#242424',
        'space-color': '#000000',
        'star-intensity': 0.15
      });
    });
  };

  const startTimeline = () => {
    initMap();
    const tl = gsap.timeline();

    // Scene 1: Fingerprint (1.5s) - Manual Trigger
    // Scene 2: Message (1s)
    tl.to({}, { duration: 1.5, onComplete: () => setStep(2) });

    // Scene 3: Map Reveal + Mumbai Fly (2.5s - 5s)
    tl.to({}, { 
      duration: 1, 
      onComplete: () => {
        setStep(3);
        map.current.flyTo({
          center: [72.8777, 19.0760],
          zoom: 9.5,
          pitch: 45,
          bearing: -10,
          speed: 1.2,
          curve: 1.4,
          essential: true
        });
      }
    });

    // Scene 4: Zoom to Mira Road (5s - 8s)
    tl.to({}, { 
      duration: 2.5, 
      onComplete: () => {
        setStep(4);
        map.current.flyTo({
          center: [72.8710, 19.2810],
          zoom: 14.5,
          pitch: 55,
          speed: 0.8,
          essential: true
        });
      }
    });

    // Final Snap to Prem Housing (8s - 9s)
    tl.to({}, { 
      duration: 2.5, 
      onComplete: () => {
        map.current.flyTo({
          center: [72.87, 19.29],
          zoom: 17.8,
          pitch: 65,
          bearing: 15,
          speed: 0.6,
          essential: true
        });
      }
    });

    // Final Reveal (9s+)
    tl.to({}, { 
      duration: 2.5, 
      onComplete: () => {
        handleComplete();
      }
    });
  };

  const handleComplete = () => {
    localStorage.setItem('prem_housing_intro_seen', 'true');
    onComplete();
    setIsSkipped(true);
  };

  if (isSkipped) return null;

  return (
    <motion.div 
      className="cinematic-overlay map-experience"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
    >
      <button className="skip-intro-btn gold-border" onClick={handleComplete}>
        Skip Intro <X size={14} />
      </button>

      <div ref={mapContainer} className={`map-viewport ${step >= 3 ? 'visible' : 'hidden'}`} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="scan-scene"
            className="scene full-center"
            exit={{ opacity: 0 }}
          >
            <div className="fingerprint-wrapper">
              <motion.div 
                className="scan-pulse"
                animate={{ scale: [1, 1.4, 1.8], opacity: [0.3, 0.1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <button 
                className="fingerprint-trigger-gold" 
                onClick={startTimeline}
              >
                <Fingerprint size={100} strokeWidth={0.5} />
              </button>
              <p className="scan-text-premium">Tap to Unlock Mumbai</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="msg-scene"
            className="scene full-center bg-transparent"
            initial={{ opacity: 0, letterSpacing: '15px' }}
            animate={{ opacity: 1, letterSpacing: '5px' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="emotional-mumbai-text">Aap Mumbai aa sakte hai</h1>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="location-overlay"
            className="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="map-overlay-labels">
              <span className="location-name">Mira Road East</span>
              <span className="location-tagline">Your home starts here</span>
            </div>
            
            {/* Pulsing Marker at Approx. Location */}
            <div className="marker-container">
              <div className="gold-pulse-marker"></div>
              <div className="marker-label">Prem Housing</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CinematicHero;

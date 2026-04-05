import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, X } from 'lucide-react';
import './CinematicHero.css';

const CinematicHero = ({ onComplete }) => {
  const [step, setStep] = useState(0); // 0: Init, 1: Fingerprint, 2: Message, 3: Skyline, 4: Zoom, 5: Complete
  const [isSkipped, setIsSkipped] = useState(false);

  useEffect(() => {
    // Check if user has already seen the intro
    const hasSeenIntro = localStorage.getItem('prem_housing_intro_seen');
    if (hasSeenIntro) {
      onComplete();
      setIsSkipped(true);
    } else {
      setStep(1);
    }
  }, [onComplete]);

  const handleStartScan = () => {
    setStep(2);
    // SCENE 2: Message (1s)
    setTimeout(() => {
      setStep(3);
      // SCENE 3: Skyline (2s)
      setTimeout(() => {
        setStep(4);
        // SCENE 4: Zoom (3s)
        setTimeout(() => {
          handleComplete();
        }, 3000);
      }, 2000);
    }, 1500); // 1.5s fingerprint scan
  };

  const handleComplete = () => {
    localStorage.setItem('prem_housing_intro_seen', 'true');
    onComplete();
  };

  const skipIntro = () => {
    handleComplete();
    setIsSkipped(true);
  };

  if (isSkipped) return null;

  return (
    <motion.div 
      className="cinematic-overlay premium-vibe"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <button className="skip-intro-btn" onClick={skipIntro}>
        Skip Intro <X size={14} />
      </button>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="scan-scene"
            className="scene full-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fingerprint-wrapper">
              <motion.div 
                className="scan-circle"
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <button className="fingerprint-trigger" onClick={handleStartScan}>
                <Fingerprint size={80} strokeWidth={1} />
              </button>
              <p className="scan-text">Tap to Enter Mumbai</p>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="message-scene"
            className="scene full-center bg-black"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="mumbai-message">Aap Mumbai aa sakte hai</h1>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="skyline-scene"
            className="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="skyline-bg"
              initial={{ scale: 1.1, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ duration: 2, ease: "linear" }}
            >
              <img 
                src="https://images.unsplash.com/photo-1570160227045-20d2f0991667?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Mumbai Skyline" 
                className="parallax-img"
              />
              <div className="golden-overlay"></div>
            </motion.div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="zoom-scene"
            className="scene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="zoom-container"
              initial={{ scale: 1 }}
              animate={{ scale: 4, filter: 'blur(20px)' }}
              transition={{ duration: 3, ease: [0.65, 0, 0.35, 1] }}
            >
              <img 
                src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
                alt="Mumbai Aerial Zoom" 
                className="zoom-img"
              />
            </motion.div>
            <motion.div 
              className="zoom-overlay-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <span>Your home starts here</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CinematicHero;

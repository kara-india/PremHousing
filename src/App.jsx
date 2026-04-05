import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import FeaturedProperties from './components/sections/FeaturedProperties';
import About from './components/sections/About';
import Contact from './components/sections/Contact';
import Footer from './components/layout/Footer';
import PropertyDetail from './components/sections/PropertyDetail';
import CinematicHero from './components/sections/CinematicHero';
import './App.css';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Home = () => (
  <>
    <Hero />
    <Services />
    <FeaturedProperties />
    <About />
    <Contact />
  </>
);

function App() {
  const [showCinematic, setShowCinematic] = useState(true);

  return (
    <Router>
      <div className="app-container">
        <ScrollToTop />
        
        <AnimatePresence>
          {showCinematic && (
            <CinematicHero onComplete={() => setShowCinematic(false)} />
          )}
        </AnimatePresence>

        {!showCinematic && (
          <>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
              </Routes>
            </main>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;

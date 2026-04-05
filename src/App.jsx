import React from 'react';
import Navbar from './components/layout/Navbar';
import Hero from './components/sections/Hero';
import Services from './components/sections/Services';
import FeaturedProperties from './components/sections/FeaturedProperties';
import About from './components/sections/About';
import Contact from './components/sections/Contact';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <FeaturedProperties />
        <About />
        <Contact />
      </main>
    </div>
  );
}

export default App;

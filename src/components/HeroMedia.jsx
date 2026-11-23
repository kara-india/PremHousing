import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const POSTER_SRC = '/media/mira-road-hero-poster.webp';

function canPlayBackgroundVideo() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(min-width: 640px)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function HeroMedia({ featuredProject = null }) {
  const videoRef = useRef(null);
  const [videoAllowed, setVideoAllowed] = useState(canPlayBackgroundVideo);
  const [videoPaused, setVideoPaused] = useState(false);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 640px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateVideoPreference = () => {
      setVideoAllowed(desktopQuery.matches && !reducedMotionQuery.matches);
    };

    updateVideoPreference();
    desktopQuery.addEventListener('change', updateVideoPreference);
    reducedMotionQuery.addEventListener('change', updateVideoPreference);

    return () => {
      desktopQuery.removeEventListener('change', updateVideoPreference);
      reducedMotionQuery.removeEventListener('change', updateVideoPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    video.playbackRate = 0.85;
    if (!videoAllowed || videoPaused) {
      video.pause();
      return undefined;
    }

    video.play().catch(() => setVideoPaused(true));
    return () => video.pause();
  }, [videoAllowed, videoPaused]);

  function toggleVideo() {
    setVideoPaused((paused) => !paused);
  }

  return (
    <>
      <div className="hero-media" aria-hidden="true">
        <img
          className="hero-poster"
          src={POSTER_SRC}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
        {videoAllowed && (
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay={!videoPaused}
            muted
            loop
            playsInline
            preload="metadata"
            poster={POSTER_SRC}
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/media/mira-road-hero.webm" type="video/webm" />
            <source src="/media/mira-road-hero.mp4" type="video/mp4" />
          </video>
        )}
      </div>
      {videoAllowed && (
        <button
          className="hero-video-toggle"
          type="button"
          onClick={toggleVideo}
          aria-label={videoPaused ? 'Play background video' : 'Pause background video'}
          aria-pressed={!videoPaused}
          title={videoPaused ? 'Play background video' : 'Pause background video'}
        >
          {videoPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          <span>{videoPaused ? 'Play motion' : 'Pause motion'}</span>
        </button>
      )}
      {featuredProject?.name && featuredProject?.locality && featuredProject?.href && (
        <a className="featured-project" href={featuredProject.href}>
          <span className="featured-project-label">Featured development</span>
          <strong>{featuredProject.name}</strong>
          <span>{featuredProject.locality}</span>
          <span className="featured-project-arrow" aria-hidden="true">↗</span>
        </a>
      )}
    </>
  );
}

export default HeroMedia;

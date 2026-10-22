import React, { useRef, useState, useEffect } from 'react';

/**
 * HeroCinematicVideo — High-performance, accessible, cinematic hero video component
 * 
 * Features:
 * - Immediate WebP / JPG high-resolution poster display (zero layout shift, 0ms paint).
 * - Multi-source adaptive delivery:
 *     - Standard H.264 MP4 (faststart, CRF 23, 720p, zero audio).
 *     - Low-bandwidth mobile H.264 MP4 (faststart, CRF 26, 480p, ~1.3MB).
 * - Network-aware: honors navigator.connection.saveData and 2G/slow-2g connections (stays on poster).
 * - Accessibility: honors prefers-reduced-motion: reduce (disables autoplay, shows poster).
 * - Resource conservation: IntersectionObserver pauses video when scrolled out of viewport.
 * - Tab visibility: Page Visibility API pauses playback when tab is in background.
 * - Non-blocking: video never interrupts text selection, buttons, or search bar clicks.
 */
export default function HeroCinematicVideo({ className = '' }) {
  const videoRef = useRef(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(true);

  useEffect(() => {
    // 1. Respect prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setShouldPlayVideo(false);
      return;
    }

    // 2. Respect Save-Data and slow connection headers
    if ('connection' in navigator) {
      const conn = navigator.connection;
      if (conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
        setShouldPlayVideo(false);
        return;
      }
    }

    // 3. Pause playback when page tab is hidden
    const handleVisibilityChange = () => {
      if (videoRef.current) {
        if (document.hidden) {
          videoRef.current.pause();
        } else if (shouldPlayVideo) {
          videoRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Pause playback when hero is scrolled out of viewport (IntersectionObserver)
    let observer;
    if ('IntersectionObserver' in window && videoRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (videoRef.current) {
              if (entry.isIntersecting && shouldPlayVideo) {
                videoRef.current.play().catch(() => {});
              } else {
                videoRef.current.pause();
              }
            }
          });
        },
        { threshold: 0.15 }
      );
      observer.observe(videoRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, [shouldPlayVideo]);

  // Determine mobile vs desktop source based on initial window width
  const isMobileScreen = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} aria-hidden="true">
      {/* 1. Base Picture Poster (Zero CLS, Instant Paint) */}
      <picture className="absolute inset-0 w-full h-full">
        <source srcSet="/video/hero-poster.webp" type="image/webp" />
        <img
          src="/video/hero-poster.jpg"
          alt=""
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            isVideoLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          width="1280"
          height="720"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </picture>

      {/* 2. Cinematic Video (Native HTML5 Pipeline, Unmuted Audio Stripped) */}
      {shouldPlayVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/hero-poster.webp"
          onPlaying={() => setIsVideoLoaded(true)}
          onError={() => setIsVideoLoaded(false)}
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 pointer-events-none ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          disablePictureInPicture
          disableRemotePlayback
        >
          {isMobileScreen ? (
            <source src="/video/hero-cinematic-mobile.mp4" type="video/mp4" />
          ) : (
            <source src="/video/hero-cinematic.mp4" type="video/mp4" />
          )}
        </video>
      )}

      {/* 3. Subtle Dark Navy & Brand Vignette Gradient Overlay for readability */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-[#0B1527]/90 via-[#0B1527]/30 to-transparent pointer-events-none" 
      />
    </div>
  );
}

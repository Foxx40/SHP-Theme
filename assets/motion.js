/**
 * Frostbyte Motion Engine - High Performance Mobile Parallax & Scroll Effects
 * GPU-Accelerated (transform: translate3d, will-change, requestAnimationFrame)
 * Battery & Performance Friendly, respects prefers-reduced-motion
 */

(function () {
  'use strict';

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Intersection Observer for Smooth Scroll Fade & Slide-in
  function initScrollReveals() {
    if (isReducedMotion) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
      return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      revealObserver.observe(el);
    });
  }

  // 2. 0.2x Speed Parallax Hero Background Engine
  function initParallaxHero() {
    if (isReducedMotion) return;

    const heroSection = document.querySelector('.hero-section');
    const heroBg = document.querySelector('.hero-parallax-bg');
    if (!heroSection || !heroBg) return;

    let ticking = false;
    const speed = 0.2; // 0.2x speed as specified in requirements

    function updateParallax() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const heroHeight = heroSection.offsetHeight;

      // Only calculate if hero is visible or near viewport
      if (scrollY <= heroHeight * 1.5) {
        const offset = scrollY * speed;
        heroBg.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });

    // Initial position
    updateParallax();
  }

  // 3. Floating Snowflake Parallax Layer (drifting at slow offset speed)
  function initSnowflakes() {
    if (isReducedMotion) return;

    const canvases = document.querySelectorAll('.snowflakes-canvas');
    if (!canvases.length) return;

    canvases.forEach(canvas => {
      const ctx = canvas.getContext('2d');
      let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
      let height = (canvas.height = canvas.parentElement.offsetHeight || 500);

      const flakesCount = Math.min(35, Math.floor(width / 12));
      const flakes = [];

      for (let i = 0; i < flakesCount; i++) {
        flakes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2.2 + 0.8,
          speedY: Math.random() * 0.45 + 0.2,
          speedX: Math.sin(i) * 0.25,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI
        });
      }

      function resize() {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
      }

      window.addEventListener('resize', resize, { passive: true });

      let animationFrame;
      function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          f.y += f.speedY;
          f.x += f.speedX;
          f.pulse += 0.02;

          if (f.y > height) {
            f.y = -5;
            f.x = Math.random() * width;
          }
          if (f.x > width) f.x = 0;
          if (f.x < 0) f.x = width;

          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity * 0.7})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.fill();
        }

        animationFrame = requestAnimationFrame(animate);
      }

      animate();
    });
  }

  // 4. Horizontal Inertia Scrolling Momentum Touch Feedback
  function initInertiaScrollers() {
    const scrollers = document.querySelectorAll('.inertia-scroller, .trust-scroller, .social-video-scroller');

    scrollers.forEach(scroller => {
      let isDown = false;
      let startX;
      let scrollLeft;

      scroller.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - scroller.offsetLeft;
        scrollLeft = scroller.scrollLeft;
      });

      scroller.addEventListener('mouseleave', () => { isDown = false; });
      scroller.addEventListener('mouseup', () => { isDown = false; });

      scroller.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scroller.offsetLeft;
        const walk = (x - startX) * 1.5;
        scroller.scrollLeft = scrollLeft - walk;
      });
    });
  }

  // DOM Content Loaded Handler
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveals();
    initParallaxHero();
    initSnowflakes();
    initInertiaScrollers();
  });

  // Expose to window for dynamic calls
  window.FrostbyteMotion = {
    initScrollReveals,
    initParallaxHero,
    initSnowflakes
  };
})();

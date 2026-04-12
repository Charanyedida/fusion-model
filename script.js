/* ============================================
   SPATIAL-SYNERGYNET — Interactive Scripts
   Modern JS: Intersection Observer, Smooth Scroll
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  const navbar = document.getElementById('navbar');
  const observerRoot = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', observerRoot, { passive: true });
  observerRoot();

  // ============================================
  // HAMBURGER MENU
  // ============================================
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  // ============================================
  // SCROLL REVEAL (Intersection Observer API)
  // ============================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: unobserve after reveal for performance
        // revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // ANIMATED COUNTERS
  // ============================================
  const statNumbers = document.querySelectorAll('.hero-stat .number[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, 0, target, 1200);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // SCANNET CLASSES GRID
  // ============================================
  const SCANNET_CLASSES = [
    "Wall", "Floor", "Cabinet", "Bed", "Chair", "Sofa", "Table", "Door", "Window",
    "Bookshelf", "Picture", "Counter", "Desk", "Curtain", "Fridge", "ShowerCurtain",
    "Toilet", "Sink", "Bathtub", "OtherFurniture"
  ];

  // tab20 inspired colors — old school warm tones
  const CLASS_COLORS = [
    '#6B1D2A', '#C5973B', '#2D5016', '#1B2A4A', '#8B2F42',
    '#3F7A1F', '#5C4033', '#2A3F6A', '#9B6B3A', '#4A6741',
    '#7A4455', '#B8860B', '#556B2F', '#4A0E1C', '#8B7355',
    '#6B8E23', '#704214', '#2F4F4F', '#8B4513', '#696969'
  ];

  const classesGrid = document.getElementById('classesGrid');

  SCANNET_CLASSES.forEach((name, i) => {
    const chip = document.createElement('div');
    chip.className = 'class-chip reveal';
    chip.innerHTML = `
      <span class="chip-color" style="background: ${CLASS_COLORS[i]}"></span>
      <span class="chip-label">${name}</span>
      <span class="chip-id">#${i}</span>
    `;
    classesGrid.appendChild(chip);
  });

  // Re-observe the newly created chips
  classesGrid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ============================================
  // SMOOTH SCROLLING FOR ANCHOR LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // PIPELINE STEP HOVER — Subtle Glow
  // ============================================
  document.querySelectorAll('.pipeline-step').forEach(step => {
    step.addEventListener('mouseenter', () => {
      step.querySelector('.pipeline-icon').style.boxShadow =
        '0 8px 32px rgba(197,151,59,0.2)';
    });
    step.addEventListener('mouseleave', () => {
      step.querySelector('.pipeline-icon').style.boxShadow = '';
    });
  });

  // ============================================
  // ACTIVE NAV LINK HIGHLIGHT ON SCROLL
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a:not(.nav-cta)');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${id}`) {
            a.style.color = 'var(--charcoal)';
          }
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' });

  sections.forEach(s => navObserver.observe(s));

});

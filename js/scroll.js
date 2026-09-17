/**
 * ALPHABIT — Módulo de Efectos de Scroll y Revelado (scroll.js)
 * Manejo de sticky navbar con fondo traslúcido al hacer scroll,
 * scroll suave para anclas y IntersectionObserver para animación de entrada en tarjetas.
 */

export function initScrollEffects() {
  const navbar = document.getElementById('main-navbar');

  // 1. Sticky navbar: añade clase al superar 60px de scroll
  const handleScroll = () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 2. Smooth scroll para anclas internas (#proyectos, #servicios, #nosotros, #contacto)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#' || !href) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // 3. IntersectionObserver para elementos con clase .reveal
  observeRevealElements();
}

/**
 * Observa y anima elementos con clase .reveal
 * @param {HTMLElement} [rootElement=document]
 */
export function observeRevealElements(rootElement = document) {
  if (!('IntersectionObserver' in window)) {
    // Si el navegador no soporta IntersectionObserver, mostrar directamente
    const reveals = rootElement.querySelectorAll('.reveal');
    reveals.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  const elements = rootElement.querySelectorAll('.reveal:not(.is-revealed)');
  elements.forEach(el => observer.observe(el));
}

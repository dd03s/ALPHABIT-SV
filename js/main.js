/**
 * ALPHABIT — Orquestador Principal (main.js)
 * Inicializa la aplicación en DOMContentLoaded, consume la API REST,
 * orquesta filtros, paginación, tarjetas desplegables, modales y navegación.
 */

import { CONFIG } from './config.js';
import { getInfo, getServices, getProjects } from './api.js';
import { renderProjectsGrid, renderSkeletons, renderError, renderServices, renderServicesSkeletons } from './render.js';
import { ProjectModal } from './modal.js';
import { CategoryFilters, projectMatchesCategory } from './filters.js';
import { ProjectsPagination } from './pagination.js';
import { initScrollEffects, observeRevealElements } from './scroll.js';

class AlphabitApp {
  constructor() {
    this.projects = [];
    this.allLoadedProjects = [];
    this.activeCategory = 'TODOS';

    // DOM Elements
    this.projectsGrid = document.getElementById('projects-grid');
    this.servicesGrid = document.getElementById('services-grid');
    this.paginationBtn = document.getElementById('btn-load-more');
    this.filtersContainer = document.getElementById('filters-container');

    // Modal DOM Elements
    this.modalEl = document.getElementById('project-modal');
    this.modalBackdrop = document.getElementById('modal-backdrop');
    this.modalContainer = document.getElementById('modal-content-container');
    this.modalCloseBtn = document.getElementById('modal-close-btn');
    this.modalPrevBtn = document.getElementById('modal-prev-btn');
    this.modalNextBtn = document.getElementById('modal-next-btn');

    // Menu DOM Elements
    this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    this.navbarLinks = document.getElementById('navbar-links');

    // Contact Form Elements
    this.contactForm = document.getElementById('agency-contact-form');
    this.serviceSelect = document.getElementById('contact-service-select');
    this.feedbackToast = document.getElementById('form-feedback-toast');

    // Manejadores interactivos para las tarjetas desplegables y sus botones
    this.cardHandlers = {
      onToggleExpand: (card, project, isExpanding) => {
        if (isExpanding) {
          // Cerrar otras tarjetas abiertas para una experiencia de acordeón limpia y ordenada
          const openCards = this.projectsGrid?.querySelectorAll('.project-card.is-expanded') || [];
          openCards.forEach(other => {
            if (other !== card) {
              other.classList.remove('is-expanded');
              other.setAttribute('aria-expanded', 'false');
              const drw = other.querySelector('.card-expanded-drawer');
              if (drw) drw.setAttribute('aria-hidden', 'true');
              const tBtn = other.querySelector('.btn-card-toggle');
              if (tBtn) {
                tBtn.setAttribute('aria-expanded', 'false');
                const tText = tBtn.querySelector('.toggle-text');
                const tIcon = tBtn.querySelector('.toggle-icon');
                if (tText) tText.textContent = 'Desplegar detalles y fotos';
                if (tIcon) tIcon.textContent = '↓';
              }
            }
          });

          // Scroll suave para asegurar que la tarjeta desplegada quede cómoda en la vista
          setTimeout(() => {
            const rect = card.getBoundingClientRect();
            if (rect.top < 80 || rect.bottom > window.innerHeight) {
              card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }, 120);
        }
      },
      onOpenModal: (project) => {
        this.openProjectModal(project);
      },
      onQuoteProject: (project) => {
        const contactSection = document.getElementById('contacto');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        // Pre-seleccionar la disciplina en el select de contacto
        if (this.serviceSelect && project) {
          const catLower = (project.category || '').toLowerCase();
          for (let i = 0; i < this.serviceSelect.options.length; i++) {
            const optText = this.serviceSelect.options[i].text.toLowerCase();
            const optVal = this.serviceSelect.options[i].value.toLowerCase();
            if (optVal && (catLower.includes(optVal) || catLower.includes(optText) || optVal.includes(catLower))) {
              this.serviceSelect.selectedIndex = i;
              break;
            }
          }
        }
        // Enfocar el campo de nombre tras el scroll
        setTimeout(() => {
          const nameInput = document.getElementById('contact-name');
          if (nameInput) nameInput.focus();
        }, 500);
      }
    };
  }

  async init() {
    // 1. Inicializar efectos de scroll y observador
    initScrollEffects();

    // 2. Inicializar navegación suave
    this._initSmoothScroll();

    // 3. Inicializar menú móvil accesible
    this._initMobileMenu();

    // 4. Inicializar ventana Modal
    this.modal = new ProjectModal({
      modalElement: this.modalEl,
      backdropElement: this.modalBackdrop,
      containerElement: this.modalContainer,
      closeButton: this.modalCloseBtn,
      prevButton: this.modalPrevBtn,
      nextButton: this.modalNextBtn
    });

    // 5. Inicializar Filtros (con las 3 categorías requeridas + TODOS)
    this.filters = new CategoryFilters({
      containerElement: this.filtersContainer,
      onFilterChange: (category) => this.handleCategoryChange(category)
    });

    // 6. Inicializar Paginación con manejadores de tarjeta
    this.pagination = new ProjectsPagination({
      buttonElement: this.paginationBtn,
      gridElement: this.projectsGrid,
      cardHandlers: this.cardHandlers,
      onProjectsAppended: (newProjects) => {
        this.allLoadedProjects = [...this.allLoadedProjects, ...newProjects];
        this.filters.updateCategoriesFromProjects(this.allLoadedProjects);
        this.projects = this.allLoadedProjects.filter(p => projectMatchesCategory(p, this.activeCategory));
        this.modal.setProjectsList(this.projects);
        observeRevealElements(this.projectsGrid);
      }
    });

    // 7. Inicializar Formulario de Contacto
    this._initContactForm();

    // 8. Cargar datos de la empresa (GET /api/info)
    this.loadCompanyInfo();

    // 9. Cargar servicios (GET /api/services)
    this.loadServices();

    // 10. Cargar proyectos desde la API REST (GET /api/projects)
    await this.loadInitialProjects();
  }

  /**
   * Recarga todos los datos tras un cambio en la API
   */
  async reloadAll() {
    await Promise.all([
      this.loadCompanyInfo(),
      this.loadServices(),
      this.loadInitialProjects()
    ]);
  }

  /**
   * Carga y renderiza la información institucional de la empresa
   */
  async loadCompanyInfo() {
    try {
      const info = await getInfo();
      if (!info) return;

      // Actualizar nombre y tagline en hero y header
      const heroName = document.getElementById('hero-company-name');
      if (heroName && info.name) heroName.textContent = info.name;

      const heroTagline = document.getElementById('hero-tagline');
      if (heroTagline && info.tagline) heroTagline.textContent = info.tagline.toUpperCase();

      const heroCountry = document.getElementById('hero-country-pill');
      if (heroCountry && info.location) heroCountry.textContent = `${info.location} · Servicios Digitales`;

      // Actualizar descripción en hero si existe
      const heroBio = document.getElementById('hero-bio');
      if (heroBio && info.description) {
        heroBio.textContent = info.description;
      }

      // Actualizar texto y ubicación en sección Nosotros
      const aboutText = document.getElementById('about-description');
      if (aboutText && info.description) {
        aboutText.textContent = info.description;
      }

      const aboutLocText = document.getElementById('about-location-text');
      const aboutLocPill = document.getElementById('about-location-pill');
      if (aboutLocText && info.location) {
        aboutLocText.textContent = info.location;
        if (aboutLocPill) aboutLocPill.style.display = 'inline-flex';
      }

      // Actualizar stats si vienen en la API
      const statsContainer = document.getElementById('hero-stats');
      if (statsContainer && Array.isArray(info.stats) && info.stats.length > 0) {
        statsContainer.innerHTML = '';
        info.stats.forEach(stat => {
          const statItem = document.createElement('div');
          statItem.className = 'stat-item';
          statItem.innerHTML = `
            <span class="stat-value">${stat.value}</span>
            <span class="stat-label">${stat.label}</span>
          `;
          statsContainer.appendChild(statItem);
        });
      }

      // Actualizar contacto en footer y sección de contacto
      const footerEmail = document.getElementById('footer-email');
      if (footerEmail && info.email) {
        footerEmail.textContent = info.email;
        footerEmail.href = `mailto:${info.email}`;
      }

      // Actualizar redes sociales en footer si las provee la API
      const footerSocials = document.getElementById('footer-social-links');
      if (footerSocials && info.socialLinks) {
        footerSocials.innerHTML = '';
        if (info.socialLinks.instagram) {
          const ig = document.createElement('a');
          ig.href = info.socialLinks.instagram;
          ig.target = '_blank';
          ig.rel = 'noopener noreferrer';
          ig.className = 'footer-link';
          ig.textContent = 'Instagram';
          footerSocials.appendChild(ig);
        }
        if (info.socialLinks.facebook) {
          const fb = document.createElement('a');
          fb.href = info.socialLinks.facebook;
          fb.target = '_blank';
          fb.rel = 'noopener noreferrer';
          fb.className = 'footer-link';
          fb.textContent = 'Facebook';
          footerSocials.appendChild(fb);
        }
      }

      // Año en footer
      const yearSpan = document.getElementById('footer-year');
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    } catch (err) {
      console.warn('[App] Error procesando información institucional:', err);
    }
  }

  /**
   * Carga los servicios desde GET /api/services
   */
  async loadServices() {
    renderServicesSkeletons(this.servicesGrid, 6);
    try {
      const services = await getServices();
      renderServices(services, this.servicesGrid);
      observeRevealElements(this.servicesGrid);

      // Poblar el dropdown del formulario con los servicios dinámicos
      if (this.serviceSelect && Array.isArray(services) && services.length > 0) {
        this.serviceSelect.innerHTML = '<option value="">Selecciona una disciplina...</option>';
        services.forEach(serv => {
          const opt = document.createElement('option');
          opt.value = serv.name;
          opt.textContent = serv.name;
          this.serviceSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.warn('[App] Error cargando servicios:', err);
      const servSection = document.getElementById('servicios');
      if (servSection) servSection.style.display = 'none';
    }
  }

  /**
   * Carga los proyectos desde la API REST (GET /api/projects)
   * Clasifica en las 3 categorías requeridas y renderiza las tarjetas desplegables
   */
  async loadInitialProjects() {
    renderSkeletons(this.projectsGrid, CONFIG.PROJECTS_PER_PAGE);

    try {
      this.activeCategory = this.filters.getInitialCategoryFromURL();

      // Solicitar proyectos desde la API REST
      const rawProjects = await getProjects(1, 50, 'all');
      this.allLoadedProjects = Array.isArray(rawProjects) ? rawProjects : [];

      // Actualizar contadores y botones de las 3 categorías en el filtro
      this.filters.updateCategoriesFromProjects(this.allLoadedProjects);
      if (this.activeCategory !== 'TODOS') {
        this.filters.setCategory(this.activeCategory, false);
      }

      // Filtrar proyectos según la categoría activa
      this.projects = this.allLoadedProjects.filter(p => projectMatchesCategory(p, this.activeCategory));
      this.modal.setProjectsList(this.projects);

      // Renderizar tarjetas desplegables
      renderProjectsGrid(this.projects, this.projectsGrid, this.cardHandlers);
      observeRevealElements(this.projectsGrid);

      // Sincronizar paginación
      this.pagination.reset(this.activeCategory, this.projects.length);
    } catch (err) {
      console.error('[App] Error en carga inicial de proyectos:', err);
      renderError(this.projectsGrid, 'No fue posible conectar con la API de proyectos.', () => {
        this.loadInitialProjects();
      });
      this.pagination.hide();
    }
  }

  /**
   * Manejador al cambiar de categoría (TODOS, LOGOS, PROYECTOS FOTOGRÁFICOS, DISEÑOS)
   * @param {string} category
   */
  async handleCategoryChange(category) {
    this.activeCategory = category;
    renderSkeletons(this.projectsGrid, 3);
    this.pagination.hide();

    // Breve pausa para transición visual fluida
    setTimeout(() => {
      this.projects = this.allLoadedProjects.filter(p => projectMatchesCategory(p, this.activeCategory));
      this.modal.setProjectsList(this.projects);

      renderProjectsGrid(this.projects, this.projectsGrid, this.cardHandlers);
      observeRevealElements(this.projectsGrid);

      this.pagination.reset(this.activeCategory, this.projects.length);
    }, 180);
  }

  /**
   * Abre el modal para un proyecto determinado
   * @param {Object} project
   */
  openProjectModal(project) {
    this.modal.setProjectsList(this.projects);
    this.modal.open(project);
  }

  _initMobileMenu() {
    if (!this.mobileMenuToggle || !this.navbarLinks) return;

    this.mobileMenuToggle.addEventListener('click', () => {
      const isExpanded = this.mobileMenuToggle.getAttribute('aria-expanded') === 'true';
      this.mobileMenuToggle.setAttribute('aria-expanded', String(!isExpanded));
      this.navbarLinks.classList.toggle('is-open');
    });

    // Cerrar menú al hacer clic en cualquier enlace
    this.navbarLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        this.navbarLinks.classList.remove('is-open');
      });
    });
  }

  _initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            const navOffset = 80;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      });
    });
  }

  _initContactForm() {
    if (!this.contactForm) return;

    this.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value.trim();
      const email = document.getElementById('contact-email-input')?.value.trim();
      const message = document.getElementById('contact-message')?.value.trim();
      const submitBtn = document.getElementById('contact-submit-btn');

      if (!name || !email || !message) {
        this._showToast('Por favor completa los campos requeridos (*)', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Enviando...</span>';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Mensaje Enviado ✓</span>';
        }
        this._showToast('¡Gracias por tu mensaje! Nos pondremos en contacto contigo a la brevedad.', 'success');
        this.contactForm.reset();

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '<span>Enviar Mensaje</span><span class="arrow" aria-hidden="true">→</span>';
          }
        }, 3500);
      }, 700);
    });
  }

  _showToast(msg, type = 'success') {
    if (!this.feedbackToast) return;
    this.feedbackToast.textContent = msg;
    this.feedbackToast.className = `form-feedback-toast is-visible toast-${type}`;

    setTimeout(() => {
      this.feedbackToast.className = 'form-feedback-toast';
    }, 4500);
  }
}

let appInstance = null;

export function reloadAppData() {
  if (appInstance) {
    return appInstance.reloadAll();
  }
  return Promise.resolve();
}

window.addEventListener('alphabit:reload-data', () => {
  reloadAppData();
});

// Inicialización en DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  appInstance = new AlphabitApp();
  appInstance.init();
});

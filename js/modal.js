/**
 * ALPHABIT — Módulo de Ventana Modal (modal.js)
 * Manejo de apertura, cierre, animaciones, navegación anterior/siguiente,
 * bloqueo de scroll del body, trampa de foco (focus trap) y accesibilidad completa.
 */

import { renderModalContent } from './render.js';
import { getProjectById } from './api.js';

export class ProjectModal {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.modalElement
   * @param {HTMLElement} options.backdropElement
   * @param {HTMLElement} options.containerElement
   * @param {HTMLElement} options.closeButton
   * @param {HTMLElement} options.prevButton
   * @param {HTMLElement} options.nextButton
   */
  constructor(options) {
    this.modal = options.modalElement;
    this.backdrop = options.backdropElement;
    this.contentContainer = options.containerElement;
    this.closeBtn = options.closeButton;
    this.prevBtn = options.prevButton;
    this.nextBtn = options.nextButton;

    this.isOpen = false;
    this.currentProject = null;
    this.currentProjectIndex = -1;
    this.projectsList = [];
    this.triggerElement = null;

    this._bindEvents();
  }

  /**
   * Configura la lista activa de proyectos para habilitar navegación Anterior / Siguiente
   * @param {Array} list
   */
  setProjectsList(list) {
    this.projectsList = Array.isArray(list) ? list : [];
    this._updateNavigationState();
  }

  /**
   * Abre el modal cargando los datos completos del proyecto
   * @param {Object} project
   * @param {HTMLElement} [triggerEl]
   */
  async open(project, triggerEl = null) {
    if (!project) return;
    this.triggerElement = triggerEl || document.activeElement;
    this.currentProject = project;
    this.currentProjectIndex = this.projectsList.findIndex(p => p._id === project._id);

    // Bloquear scroll de body
    document.body.classList.add('modal-open');

    // Mostrar modal y backdrop
    this.modal.classList.add('is-active');
    this.modal.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Resetear scroll interno
    if (this.modal) {
      this.modal.scrollTop = 0;
    }
    if (this.contentContainer) {
      this.contentContainer.scrollTop = 0;
    }

    // Renderizar primero los datos disponibles (optimista)
    renderModalContent(this.currentProject, this.contentContainer);
    this._updateNavigationState();

    // Enfocar botón de cierre o modal para accesibilidad
    setTimeout(() => {
      if (this.closeBtn) {
        this.closeBtn.focus();
      } else {
        this.modal.focus();
      }
    }, 50);

    // Intentar obtener detalle completo si hiciera falta body profundo
    if (!project.body || project.body.length === 0) {
      const fullDetail = await getProjectById(project._id || project.slug);
      if (fullDetail && this.isOpen && this.currentProject?._id === project._id) {
        this.currentProject = fullDetail;
        renderModalContent(this.currentProject, this.contentContainer);
      }
    }
  }

  /**
   * Cierra el modal con animación y restaura foco y scroll
   */
  close() {
    if (!this.isOpen) return;

    this.modal.classList.add('is-closing');
    this.modal.classList.remove('is-active');
    this.modal.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      this.modal.classList.remove('is-closing');
      document.body.classList.remove('modal-open');
      this.isOpen = false;
      this.currentProject = null;

      // Restaurar foco al elemento que detonó la apertura
      if (this.triggerElement && typeof this.triggerElement.focus === 'function') {
        this.triggerElement.focus();
      }
    }, 200);
  }

  /**
   * Navega al proyecto anterior si existe
   */
  prev() {
    if (!this.isOpen || this.currentProjectIndex <= 0) return;
    const prevProject = this.projectsList[this.currentProjectIndex - 1];
    if (prevProject) {
      this.open(prevProject, this.triggerElement);
    }
  }

  /**
   * Navega al siguiente proyecto si existe
   */
  next() {
    if (!this.isOpen || this.currentProjectIndex >= this.projectsList.length - 1) return;
    const nextProject = this.projectsList[this.currentProjectIndex + 1];
    if (nextProject) {
      this.open(nextProject, this.triggerElement);
    }
  }

  _updateNavigationState() {
    if (!this.prevBtn || !this.nextBtn) return;

    const hasPrev = this.currentProjectIndex > 0;
    const hasNext = this.currentProjectIndex < this.projectsList.length - 1;

    this.prevBtn.disabled = !hasPrev;
    this.prevBtn.setAttribute('aria-disabled', String(!hasPrev));

    this.nextBtn.disabled = !hasNext;
    this.nextBtn.setAttribute('aria-disabled', String(!hasNext));
  }

  _bindEvents() {
    // Botón de cierre
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Clic en el backdrop (o fuera de la tarjeta modal)
    if (this.backdrop) {
      this.backdrop.addEventListener('click', (e) => {
        if (e.target === this.backdrop) {
          this.close();
        }
      });
    }

    // Botones de navegación
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Eventos de teclado (Escape, Flechas y Focus Trap)
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'Tab') {
        this._handleFocusTrap(e);
      }
    });
  }

  _handleFocusTrap(e) {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = this.modal.querySelectorAll(focusableSelectors);
    if (focusable.length === 0) return;

    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab normal
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
}

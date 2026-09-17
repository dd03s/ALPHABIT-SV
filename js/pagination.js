/**
 * ALPHABIT — Módulo de Paginación "Cargar más proyectos" (pagination.js)
 * Manejo de estado de página, peticiones incrementales a la API, adición de tarjetas,
 * estados de carga en el botón y ocultación automática cuando no hay más resultados.
 */

import { CONFIG } from './config.js';
import { getProjects } from './api.js';
import { createProjectCard } from './render.js';

export class ProjectsPagination {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.buttonElement
   * @param {HTMLElement} options.gridElement
   * @param {Object|Function} options.cardHandlers
   * @param {Function} options.onProjectsAppended
   */
  constructor(options) {
    this.btn = options.buttonElement;
    this.grid = options.gridElement;
    this.cardHandlers = typeof options.cardHandlers === 'object' ? options.cardHandlers : { onOpenModal: options.cardHandlers || options.onProjectClick };
    this.onProjectsAppended = options.onProjectsAppended;

    this.currentPage = CONFIG.INITIAL_PAGE;
    this.limit = CONFIG.PROJECTS_PER_PAGE;
    this.activeCategory = 'TODOS';
    this.hasMore = true;
    this.isLoading = false;

    this._bindEvents();
  }

  setCardHandlers(handlers) {
    this.cardHandlers = handlers;
  }

  /**
   * Reinicia la paginación para una nueva categoría o carga inicial
   * @param {string} category
   * @param {number} initialLoadedCount
   */
  reset(category = 'TODOS', initialLoadedCount = 0) {
    this.currentPage = CONFIG.INITIAL_PAGE;
    this.activeCategory = category;
    this.isLoading = false;

    // Si ya cargó menos del límite, no hay más por cargar
    if (initialLoadedCount < this.limit) {
      this.hasMore = false;
      this.hide();
    } else {
      this.hasMore = true;
      this.show();
    }
  }

  show() {
    if (this.btn) {
      this.btn.style.display = 'inline-flex';
      this.btn.disabled = false;
      this.btn.innerHTML = '<span>Cargar más proyectos</span> <span class="arrow" aria-hidden="true">↓</span>';
    }
  }

  hide() {
    if (this.btn) {
      this.btn.style.display = 'none';
    }
  }

  /**
   * Solicita la siguiente página a la API y agrega las tarjetas al grid existente
   */
  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    this.isLoading = true;

    // Estado visual de carga en el botón
    if (this.btn) {
      this.btn.disabled = true;
      this.btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> <span>Cargando proyectos...</span>';
    }

    const nextPage = this.currentPage + 1;
    const catQuery = this.activeCategory === 'TODOS' ? 'all' : this.activeCategory;

    try {
      const newProjects = await getProjects(nextPage, this.limit, catQuery);

      if (!newProjects || newProjects.length === 0) {
        this.hasMore = false;
        this.hide();
        return;
      }

      // Añadir nuevas tarjetas al grid sin borrar las existentes
      const fragment = document.createDocumentFragment();
      newProjects.forEach((proj, idx) => {
        const card = createProjectCard(proj, this.cardHandlers);
        card.style.animationDelay = `${idx * 0.08}s`;
        fragment.appendChild(card);
      });

      this.grid.appendChild(fragment);
      this.currentPage = nextPage;

      // Notificar al orquestador para actualizar la lista de proyectos en memoria del modal
      if (typeof this.onProjectsAppended === 'function') {
        this.onProjectsAppended(newProjects);
      }

      // Si llegaron menos del límite, alcanzamos el final
      if (newProjects.length < this.limit) {
        this.hasMore = false;
        this.hide();
      } else {
        this.show();
      }
    } catch (err) {
      console.error('[Pagination] Error al cargar más proyectos:', err);
      this.show();
    } finally {
      this.isLoading = false;
    }
  }

  _bindEvents() {
    if (this.btn) {
      this.btn.addEventListener('click', () => this.loadMore());
    }
  }
}

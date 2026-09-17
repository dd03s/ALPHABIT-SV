/**
 * ALPHABIT — Módulo de Filtros por Categoría (filters.js)
 * Define y gestiona las 3 categorías requeridas por la agencia:
 * 1. LOGOS
 * 2. PROYECTOS FOTOGRÁFICOS
 * 3. DISEÑOS
 * (Incluyendo 'TODOS' como selector global y de reinicio)
 * 
 * Funcionalidades:
 * - Botones tipo píldora interactivos y accesibles con contador dinámico
 * - Clasificación inteligente de proyectos provenientes de la API REST
 * - Sincronización con URL (?category=slug)
 * - Persistencia del estado activo y soporte de navegación atrás/adelante (popstate)
 */

/**
 * Mapeo de categorías oficiales requeridas
 */
export const CATEGORY_DEFINITIONS = [
  {
    id: 'todos',
    key: 'TODOS',
    label: 'Todos los Trabajos',
    shortLabel: 'TODOS',
    matcher: () => true
  },
  {
    id: 'logos',
    key: 'LOGOS',
    label: 'Logos',
    shortLabel: 'LOGOS',
    matcher: (project) => {
      if (!project) return false;
      const cat = (project.category || '').toLowerCase();
      const title = (project.title || '').toLowerCase();
      const tags = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : '';
      return cat.includes('logo') || title.includes('logo') || tags.includes('logo');
    }
  },
  {
    id: 'proyectos-fotograficos',
    key: 'PROYECTOS FOTOGRÁFICOS',
    label: 'Proyectos Fotográficos',
    shortLabel: 'PROYECTOS FOTOGRÁFICOS',
    matcher: (project) => {
      if (!project) return false;
      const cat = (project.category || '').toLowerCase();
      const title = (project.title || '').toLowerCase();
      const tags = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : '';
      return cat.includes('foto') || title.includes('foto') || tags.includes('foto');
    }
  },
  {
    id: 'disenos',
    key: 'DISEÑOS',
    label: 'Diseños',
    shortLabel: 'DISEÑOS',
    matcher: (project) => {
      if (!project) return false;
      const cat = (project.category || '').toLowerCase();
      const title = (project.title || '').toLowerCase();
      const tags = Array.isArray(project.tags) ? project.tags.join(' ').toLowerCase() : '';
      return (
        cat.includes('diseñ') ||
        cat.includes('disen') ||
        cat.includes('editorial') ||
        cat.includes('empaque') ||
        cat.includes('gráfico') ||
        cat.includes('grafico') ||
        title.includes('diseñ') ||
        title.includes('disen') ||
        tags.includes('diseñ')
      );
    }
  }
];

/**
 * Convierte una categoría en slug amigable para URL
 * @param {string} cat
 * @returns {string}
 */
export function categoryToSlug(cat) {
  if (!cat || cat.toUpperCase() === 'TODOS') return 'todos';
  const found = CATEGORY_DEFINITIONS.find(c => c.key.toUpperCase() === cat.toUpperCase());
  if (found) return found.id;
  return cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Retorna si un proyecto coincide con la categoría seleccionada
 * @param {Object} project
 * @param {string} categoryKey
 * @returns {boolean}
 */
export function projectMatchesCategory(project, categoryKey) {
  if (!categoryKey || categoryKey.toUpperCase() === 'TODOS') return true;
  const def = CATEGORY_DEFINITIONS.find(c => c.key.toUpperCase() === categoryKey.toUpperCase());
  if (def) {
    return def.matcher(project);
  }
  // Coincidencia exacta de fallback
  const cat = (project.category || '').toLowerCase();
  return cat === categoryKey.toLowerCase();
}

export class CategoryFilters {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.containerElement
   * @param {Function} options.onFilterChange
   */
  constructor(options) {
    this.container = options.containerElement;
    this.onFilterChange = options.onFilterChange;
    this.activeCategory = 'TODOS';
    this.projects = [];

    this._initURLListener();
    this.render();
  }

  /**
   * Actualiza el listado de proyectos cargados desde la API para refrescar los contadores
   * @param {Array} projects
   */
  updateCategoriesFromProjects(projects) {
    this.projects = Array.isArray(projects) ? projects : [];
    this.render();
  }

  /**
   * Calcula la cantidad de proyectos por categoría
   * @param {string} categoryKey
   * @returns {number}
   */
  getProjectCount(categoryKey) {
    if (!this.projects || this.projects.length === 0) return 0;
    if (categoryKey.toUpperCase() === 'TODOS') return this.projects.length;
    return this.projects.filter(p => projectMatchesCategory(p, categoryKey)).length;
  }

  /**
   * Lee la categoría desde la URL al cargar la página
   * @returns {string}
   */
  getInitialCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const urlCatSlug = params.get('category');
    if (!urlCatSlug || urlCatSlug === 'todos') return 'TODOS';

    const match = CATEGORY_DEFINITIONS.find(c => c.id === urlCatSlug || c.key.toLowerCase() === urlCatSlug.toLowerCase());
    return match ? match.key : 'TODOS';
  }

  /**
   * Aplica una categoría seleccionada y notifica a los suscriptores
   * @param {string} categoryKey
   * @param {boolean} [updateURL=true]
   */
  setCategory(categoryKey, updateURL = true) {
    const normalizedKey = (categoryKey || 'TODOS').toUpperCase();
    this.activeCategory = normalizedKey;
    this._updateActiveStyles();

    if (updateURL) {
      const url = new URL(window.location);
      if (this.activeCategory === 'TODOS') {
        url.searchParams.delete('category');
      } else {
        url.searchParams.set('category', categoryToSlug(this.activeCategory));
      }
      window.history.pushState({}, '', url);
    }

    if (typeof this.onFilterChange === 'function') {
      this.onFilterChange(this.activeCategory);
    }
  }

  /**
   * Renderiza los botones de categorías (TODOS, LOGOS, PROYECTOS FOTOGRÁFICOS, DISEÑOS)
   */
  render() {
    if (!this.container) return;
    this.container.innerHTML = '';

    const nav = document.createElement('div');
    nav.className = 'filters-nav';
    nav.setAttribute('role', 'tablist');
    nav.setAttribute('aria-label', 'Filtrar proyectos por categoría');

    CATEGORY_DEFINITIONS.forEach(catDef => {
      const isSelected = catDef.key.toUpperCase() === this.activeCategory.toUpperCase();
      const count = this.getProjectCount(catDef.key);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-pill ${isSelected ? 'is-active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', String(isSelected));
      btn.dataset.category = catDef.key;
      btn.id = `filter-tab-${catDef.id}`;

      // Etiqueta de la categoría
      const labelSpan = document.createElement('span');
      labelSpan.className = 'filter-label';
      labelSpan.textContent = catDef.shortLabel;
      btn.appendChild(labelSpan);

      // Badge numérico sutil de conteo de proyectos
      if (this.projects && this.projects.length > 0) {
        const badge = document.createElement('span');
        badge.className = 'filter-count-badge';
        badge.textContent = count;
        btn.appendChild(badge);
      }

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.activeCategory !== catDef.key) {
          this.setCategory(catDef.key, true);
        }
      });

      nav.appendChild(btn);
    });

    this.container.appendChild(nav);
  }

  _updateActiveStyles() {
    if (!this.container) return;
    const buttons = this.container.querySelectorAll('.filter-pill');
    buttons.forEach(btn => {
      const isSelected = btn.dataset.category?.toUpperCase() === this.activeCategory.toUpperCase();
      btn.classList.toggle('is-active', isSelected);
      btn.setAttribute('aria-selected', String(isSelected));
    });
  }

  _initURLListener() {
    window.addEventListener('popstate', () => {
      const cat = this.getInitialCategoryFromURL();
      this.setCategory(cat, false);
    });
  }
}

/**
 * ALPHABIT — Configuración de API y Paginación
 * Single source of truth for all URLs and pagination parameters.
 */
const DEFAULT_API_BASE = (typeof window !== 'undefined' && window.location && window.location.origin)
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

function getStoredApiBase() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const saved = window.localStorage.getItem('alphabit_api_base');
    if (saved && saved.trim()) return saved.trim();
  }
  return DEFAULT_API_BASE;
}

export const CONFIG = {
  // Base URL for all REST API endpoints. Can be customized via the API Console.
  API_BASE: getStoredApiBase(),
  DEFAULT_API_BASE: DEFAULT_API_BASE,
  PROJECTS_PER_PAGE: 6,
  INITIAL_PAGE: 1,

  /**
   * Actualiza dinámicamente la URL base de la API
   * @param {string} newUrl 
   */
  setApiBase(newUrl) {
    if (!newUrl || !newUrl.trim()) {
      this.API_BASE = DEFAULT_API_BASE;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('alphabit_api_base');
      }
    } else {
      let cleanUrl = newUrl.trim();
      if (cleanUrl.endsWith('/')) {
        cleanUrl = cleanUrl.slice(0, -1);
      }
      this.API_BASE = cleanUrl;
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('alphabit_api_base', cleanUrl);
      }
    }
  },

  /**
   * Restablece la URL base por defecto
   */
  resetApiBase() {
    this.setApiBase(null);
  }
};

export default CONFIG;

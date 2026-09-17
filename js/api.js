/**
 * ALPHABIT — Módulo Cliente de API REST
 * 
 * =========================================================================================
 * CONTRATO DE API REST Y ESQUEMAS JSON (EXACT JSON SCHEMAS)
 * Backend Developer Documentation & Specification
 * =========================================================================================
 * 
 * 1. LISTADO DE PROYECTOS (GET /api/projects?page=1&limit=6&category=all)
 * Response: Array<ProjectListItem>
 * [
 *   {
 *     "_id": "65f02a01c4e9123456789101",
 *     "title": "Dermalaser – Rediseño de Logo – Ejercicio Creativo #002",
 *     "subtitle": "Ejercicio Creativo #002",
 *     "category": "Logo",
 *     "tags": ["Diseño Gráfico", "Línea Gráfica", "Logo", "Rediseño"],
 *     "date": "2026-09-11",
 *     "coverImage": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
 *     "excerpt": "Rediseño de identidad visual para Clínica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.",
 *     "slug": "dermalaser-rediseno-logo-002"
 *   }
 * ]
 * 
 * 2. DETALLE INTEGRAL DE PROYECTO (GET /api/projects/:id)
 * Response: ProjectDetail
 * {
 *   "_id": "65f02a01c4e9123456789101",
 *   "title": "Dermalaser – Rediseño de Logo – Ejercicio Creativo #002",
 *   "subtitle": "Ejercicio Creativo #002",
 *   "category": "Logo",
 *   "tags": ["Diseño Gráfico", "Línea Gráfica", "Logo", "Rediseño"],
 *   "date": "2026-09-11",
 *   "coverImage": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
 *   "excerpt": "Rediseño de identidad visual para Clínica Dermalaser...",
 *   "body": [
 *     { 
 *       "type": "text", 
 *       "content": "Como parte de nuestros ejercicios creativos de septiembre..." 
 *     },
 *     { 
 *       "type": "image", 
 *       "url": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=80", 
 *       "caption": "Propuesta de rediseño de isotipo con proporciones áureas" 
 *     }
 *   ],
 *   "slug": "dermalaser-rediseno-logo-002"
 * }
 * 
 * 3. SERVICIOS OFRECIDOS (GET /api/services)
 * Response: Array<ServiceItem>
 * [
 *   {
 *     "_id": "65f01a01c4e9123456789001",
 *     "name": "Diseño Gráfico",
 *     "description": "Identidad visual, línea gráfica coherente, piezas publicitarias y sistemas visuales de alto impacto.",
 *     "icon": "graphic-design"
 *   }
 * ]
 * 
 * 4. INFORMACIÓN INSTITUCIONAL DE LA EMPRESA (GET /api/info)
 * Response: CompanyInfo
 * {
 *   "name": "ALPHABIT",
 *   "tagline": "Servicios Digitales",
 *   "description": "Somos ALPHABIT, una agencia de servicios digitales en El Salvador. Transformamos ideas en experiencias visuales que comunican, conectan y perduran.",
 *   "email": "contacto@alphabit.sv",
 *   "location": "El Salvador",
 *   "socialLinks": { 
 *     "instagram": "https://instagram.com/alphabit.sv", 
 *     "facebook": "https://facebook.com/alphabit.sv" 
 *   },
 *   "stats": [
 *     { "value": "4+", "label": "Años de experiencia" },
 *     { "value": "+50", "label": "Proyectos completados" },
 *     { "value": "SV", "label": "El Salvador" }
 *   ]
 * }
 * 
 * =========================================================================================
 * PROYECTOS DE REFERENCIA REALES DOCUMENTADOS PARA EL BACKEND:
 * - Proyecto 1: Dermalaser – Rediseño de Logo – Ejercicio Creativo #002 (Logo, 2026-09-11)
 * - Proyecto 2: Historiales Liceo Cristiano «Rev. Juan Bueno» – Diseño Gráfico y Fotografía (Diseño Gráfico, 2026-09-02)
 * - Proyecto 3: Memoria de Labores ACONAC 2021 – Diseño Editorial – El Salvador (Diseño Editorial, 2026-07-29)
 * - Proyecto 4: Casa Vía del Mar – Fotografía Inmobiliaria – El Salvador (Fotografía, 2026-07-03)
 * - Proyecto 5: Fresquito – Diseño de Empaque – Ejercicio Creativo (Empaque, 2026-06-30)
 * =========================================================================================
 */

import { CONFIG } from './config.js';

/**
 * Realiza una petición GET segura con manejo de timeout y control de errores.
 * Nunca lanza excepciones que puedan romper la interfaz del usuario.
 * @param {string} endpoint - Ruta relativa del recurso (ej: '/projects')
 * @param {Object} [params] - Parámetros de consulta
 * @returns {Promise<any|null>} Respuesta en JSON o null en caso de fallo
 */
async function fetchSafe(endpoint, params = {}) {
  try {
    const url = new URL(`${CONFIG.API_BASE}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[API] Error HTTP ${response.status} en ${endpoint}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`[API] Error de red o conexión al consumir ${endpoint}:`, error);
    return null;
  }
}

/**
 * Obtiene la lista paginada de proyectos desde la API
 * GET /api/projects?page=N&limit=N&category=all
 * @param {number} [page=1]
 * @param {number} [limit=6]
 * @param {string} [category='all']
 * @returns {Promise<Array>}
 */
export async function getProjects(page = CONFIG.INITIAL_PAGE, limit = CONFIG.PROJECTS_PER_PAGE, category = 'all') {
  try {
    const data = await fetchSafe('/projects', { page, limit, category });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[API] Fallo al solicitar proyectos:', err);
    return [];
  }
}

/**
 * Obtiene el detalle completo de un proyecto por su ID o slug
 * GET /api/projects/:id
 * @param {string} idOrSlug
 * @returns {Promise<Object|null>}
 */
export async function getProjectById(idOrSlug) {
  if (!idOrSlug) return null;
  try {
    return await fetchSafe(`/projects/${encodeURIComponent(idOrSlug)}`);
  } catch (err) {
    console.error(`[API] Fallo al solicitar proyecto ${idOrSlug}:`, err);
    return null;
  }
}

/**
 * Obtiene la lista de servicios profesionales ofrecidos
 * GET /api/services
 * @returns {Promise<Array>}
 */
export async function getServices() {
  try {
    const data = await fetchSafe('/services');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('[API] Fallo al solicitar servicios:', err);
    return [];
  }
}

/**
 * Obtiene la información institucional de ALPHABIT
 * GET /api/info
 * @returns {Promise<Object|null>}
 */
export async function getInfo() {
  try {
    return await fetchSafe('/info');
  } catch (err) {
    console.error('[API] Fallo al solicitar info de la empresa:', err);
    return null;
  }
}

/**
 * Realiza un healthcheck de conexión en vivo contra una URL base
 * @param {string} [baseUrl] 
 * @returns {Promise<{ ok: boolean, status: number, latencyMs: number, data: any, error?: string }>}
 */
export async function checkApiHealth(baseUrl = CONFIG.API_BASE) {
  const startTime = performance.now();
  const cleanBase = (baseUrl || CONFIG.API_BASE).replace(/\/+$/, '');
  const url = `${cleanBase}/health`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = { rawText: await response.text() };
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs,
      data,
      url
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      status: 0,
      statusText: 'Connection Error',
      latencyMs,
      error: err.name === 'AbortError' ? 'Tiempo de espera agotado (Timeout > 8s)' : (err.message || 'Error de red'),
      url
    };
  }
}

/**
 * Ejecuta una petición HTTP para el explorador interactivo de la API
 * @param {string} method - 'GET' | 'POST'
 * @param {string} endpoint - '/projects', '/services', etc.
 * @param {Object} [params] - Parámetros query
 * @param {Object} [body] - Cuerpo para POST
 * @param {string} [baseUrl] - Base URL a utilizar
 * @returns {Promise<Object>}
 */
export async function executeRawRequest(method = 'GET', endpoint = '/projects', params = {}, body = null, baseUrl = CONFIG.API_BASE) {
  const cleanBase = (baseUrl || CONFIG.API_BASE).replace(/\/+$/, '');
  const targetUrl = new URL(`${cleanBase}${endpoint}`);

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        targetUrl.searchParams.append(key, params[key]);
      }
    });
  }

  const startTime = performance.now();
  const options = {
    method: method.toUpperCase(),
    headers: {
      'Accept': 'application/json'
    }
  };

  if (body && (options.method === 'POST' || options.method === 'PUT')) {
    options.headers['Content-Type'] = 'application/json';
    options.body = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
  }

  // Generar comando curl para que el usuario pueda probarlo en su terminal
  let curlCommand = `curl -X ${options.method} "${targetUrl.toString()}"`;
  if (options.headers['Content-Type']) {
    curlCommand += ` \\\n  -H "Content-Type: application/json"`;
  }
  if (options.body) {
    curlCommand += ` \\\n  -d '${options.body.replace(/'/g, "'\\''")}'`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    options.signal = controller.signal;

    const response = await fetch(targetUrl.toString(), options);
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - startTime);
    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    const responseHeaders = {};
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val;
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      latencyMs,
      url: targetUrl.toString(),
      method: options.method,
      data: responseData,
      headers: responseHeaders,
      curlCommand
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ok: false,
      status: 0,
      statusText: err.name === 'AbortError' ? 'Timeout' : 'Network Error',
      latencyMs,
      url: targetUrl.toString(),
      method: options.method,
      error: err.message || 'Error de conexión',
      curlCommand
    };
  }
}

/**
 * Crea un nuevo proyecto mediante POST /api/projects
 * @param {Object} projectData 
 * @param {string} [baseUrl] 
 * @returns {Promise<Object>}
 */
export async function createProject(projectData, baseUrl = CONFIG.API_BASE) {
  return await executeRawRequest('POST', '/projects', {}, projectData, baseUrl);
}

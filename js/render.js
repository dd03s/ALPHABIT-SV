/**
 * ALPHABIT — Módulo de Renderizado del DOM (render.js)
 * Renderizado de tarjetas desplegables para proyectos, galería de fotos interactiva,
 * modales, servicios y estados esqueleto.
 */

import { CONFIG } from './config.js';

/**
 * Formatea una fecha ISO en formato legible editorial (ej: "11 SEP 2026")
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = months[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return isoString;
  }
}

/**
 * Extrae todas las fotografías disponibles de un proyecto (portada, cuerpo e imágenes adicionales)
 * @param {Object} project
 * @returns {Array<{url: string, caption: string, type: string}>}
 */
export function getProjectPhotos(project) {
  if (!project) return [];
  const photos = [];
  const seenUrls = new Set();

  // 1. Imagen de portada principal
  if (project.coverImage && typeof project.coverImage === 'string') {
    photos.push({
      url: project.coverImage,
      caption: project.title || 'Portada del proyecto',
      type: 'cover'
    });
    seenUrls.add(project.coverImage);
  }

  // 2. Fotografías contenidas en los bloques del cuerpo
  if (Array.isArray(project.body)) {
    project.body.forEach((block, idx) => {
      if (block && block.type === 'image' && block.url && !seenUrls.has(block.url)) {
        photos.push({
          url: block.url,
          caption: block.caption || `Fotografía de detalle #${idx + 1}`,
          type: 'body'
        });
        seenUrls.add(block.url);
      }
    });
  }

  // 3. Fotografías en arreglo 'images' si la API las envía
  if (Array.isArray(project.images)) {
    project.images.forEach((img, idx) => {
      const url = typeof img === 'string' ? img : img?.url;
      const caption = typeof img === 'object' && img?.caption ? img.caption : `Fotografía del proyecto #${idx + 1}`;
      if (url && !seenUrls.has(url)) {
        photos.push({
          url,
          caption,
          type: 'gallery'
        });
        seenUrls.add(url);
      }
    });
  }

  return photos;
}

/**
 * Crea el elemento DOM de una tarjeta de proyecto DESPLEGABLE (.project-card)
 * Al seleccionarla, la tarjeta se despliega mostrando nombre, info detallada y galería de fotos.
 * 
 * @param {Object} project Datos del proyecto desde la API
 * @param {Object} handlers Manejadores de interacción
 * @param {Function} handlers.onToggleExpand Callback cuando se despliega/pliega la tarjeta
 * @param {Function} handlers.onOpenModal Callback para ver en modal completo
 * @param {Function} handlers.onQuoteProject Callback para cotizar proyecto similar
 * @returns {HTMLElement}
 */
export function createProjectCard(project, handlers = {}) {
  const { onToggleExpand, onOpenModal, onQuoteProject } = handlers;
  const photos = getProjectPhotos(project);
  let activePhotoIndex = 0;

  const card = document.createElement('article');
  card.className = 'project-card reveal';
  card.id = `project-card-${project._id || project.slug || Math.random().toString(36).substr(2, 9)}`;
  card.dataset.id = project._id || '';
  card.dataset.slug = project.slug || '';
  card.dataset.category = project.category || '';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'region');
  card.setAttribute('aria-expanded', 'false');
  card.setAttribute('aria-label', `Proyecto: ${project.title || 'Sin título'}`);

  // ---------------------------------------------------------------------------
  // 1. VISTA COMPACTA / CABECERA DE LA TARJETA (.card-preview)
  // ---------------------------------------------------------------------------
  const preview = document.createElement('div');
  preview.className = 'card-preview';
  preview.id = `card-preview-${project._id}`;

  // Envoltura de imagen con proporción 4/3
  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'card-image-wrapper';

  if (project.coverImage) {
    const img = document.createElement('img');
    img.src = project.coverImage;
    img.alt = project.title || 'Proyecto ALPHABIT';
    img.loading = 'lazy';
    img.className = 'card-image';

    img.addEventListener('error', () => {
      imageWrapper.innerHTML = '';
      const fallback = document.createElement('div');
      fallback.className = 'card-image-placeholder';
      fallback.innerHTML = '<span class="placeholder-brand">ALPHABIT</span>';
      imageWrapper.appendChild(fallback);
    });

    imageWrapper.appendChild(img);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'card-image-placeholder';
    placeholder.innerHTML = '<span class="placeholder-brand">ALPHABIT</span>';
    imageWrapper.appendChild(placeholder);
  }

  // Chip de categoría flotante (Top-Right)
  if (project.category) {
    const chip = document.createElement('span');
    chip.className = 'card-category-chip';
    chip.textContent = project.category;
    imageWrapper.appendChild(chip);
  }

  // Badge indicador de fotos disponibles (Top-Left)
  if (photos.length > 0) {
    const photoBadge = document.createElement('span');
    photoBadge.className = 'card-photo-count-badge';
    photoBadge.innerHTML = `<span class="photo-icon" aria-hidden="true">📷</span> ${photos.length} ${photos.length === 1 ? 'Foto' : 'Fotos'}`;
    imageWrapper.appendChild(photoBadge);
  }

  preview.appendChild(imageWrapper);

  // Contenido de la vista compacta
  const previewContent = document.createElement('div');
  previewContent.className = 'card-content';

  // Fecha editorial
  if (project.date) {
    const dateSpan = document.createElement('time');
    dateSpan.className = 'card-date';
    dateSpan.dateTime = project.date;
    dateSpan.textContent = formatDate(project.date);
    previewContent.appendChild(dateSpan);
  }

  // Nombre del proyecto (Título principal)
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = project.title || 'Proyecto sin título';
  previewContent.appendChild(title);

  // Resumen informativo / extracto
  if (project.excerpt) {
    const excerpt = document.createElement('p');
    excerpt.className = 'card-excerpt';
    excerpt.textContent = project.excerpt;
    previewContent.appendChild(excerpt);
  }

  // Barra de interacción compacta con botón funcional de despliegue
  const actionBar = document.createElement('div');
  actionBar.className = 'card-preview-action-bar';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'btn-card-toggle';
  toggleBtn.id = `btn-toggle-${project._id}`;
  toggleBtn.setAttribute('aria-expanded', 'false');
  toggleBtn.setAttribute('aria-controls', `card-drawer-${project._id}`);
  toggleBtn.innerHTML = `
    <span class="toggle-text">Desplegar detalles y fotos</span>
    <span class="toggle-icon" aria-hidden="true">↓</span>
  `;

  actionBar.appendChild(toggleBtn);
  previewContent.appendChild(actionBar);
  preview.appendChild(previewContent);
  card.appendChild(preview);

  // ---------------------------------------------------------------------------
  // 2. PANEL DESPLEGABLE (.card-expanded-drawer)
  // Al seleccionar la tarjeta, se despliega fluidamente revelando nombre, info y fotos.
  // ---------------------------------------------------------------------------
  const drawer = document.createElement('div');
  drawer.className = 'card-expanded-drawer';
  drawer.id = `card-drawer-${project._id}`;
  drawer.setAttribute('aria-hidden', 'true');

  const drawerInner = document.createElement('div');
  drawerInner.className = 'card-drawer-inner';

  // --- A. SECCIÓN INFORMATIVA DEL PROYECTO ---
  const infoSection = document.createElement('div');
  infoSection.className = 'drawer-info-section';

  // Encabezado desplegado con Nombre y Subtítulo
  const unfoldedHeading = document.createElement('div');
  unfoldedHeading.className = 'drawer-heading-block';

  const unfoldedTitle = document.createElement('h4');
  unfoldedTitle.className = 'drawer-project-title';
  unfoldedTitle.textContent = project.title || 'Proyecto sin título';
  unfoldedHeading.appendChild(unfoldedTitle);

  if (project.subtitle) {
    const unfoldedSub = document.createElement('p');
    unfoldedSub.className = 'drawer-project-subtitle';
    unfoldedSub.textContent = project.subtitle;
    unfoldedHeading.appendChild(unfoldedSub);
  }

  infoSection.appendChild(unfoldedHeading);

  // Ficha de Metadatos (Categoría, Fecha, Tags)
  const metaBar = document.createElement('div');
  metaBar.className = 'drawer-meta-bar';

  if (project.category) {
    const metaCat = document.createElement('div');
    metaCat.className = 'drawer-meta-item';
    metaCat.innerHTML = `<span class="meta-label">Disciplina</span><span class="meta-val meta-cat-val">${project.category}</span>`;
    metaBar.appendChild(metaCat);
  }

  if (project.date) {
    const metaDate = document.createElement('div');
    metaDate.className = 'drawer-meta-item';
    metaDate.innerHTML = `<span class="meta-label">Fecha</span><span class="meta-val">${formatDate(project.date)}</span>`;
    metaBar.appendChild(metaDate);
  }

  infoSection.appendChild(metaBar);

  // Tags en chips
  if (Array.isArray(project.tags) && project.tags.length > 0) {
    const tagsWrapper = document.createElement('div');
    tagsWrapper.className = 'drawer-tags-wrapper';
    project.tags.forEach(t => {
      const tagChip = document.createElement('span');
      tagChip.className = 'drawer-tag-chip';
      tagChip.textContent = `#${t}`;
      tagsWrapper.appendChild(tagChip);
    });
    infoSection.appendChild(tagsWrapper);
  }

  // Párrafos informativos detallados (body textual o excerpt extendido)
  const descContainer = document.createElement('div');
  descContainer.className = 'drawer-paragraphs-container';

  let hasBodyText = false;
  if (Array.isArray(project.body)) {
    project.body.forEach(block => {
      if (block && block.type === 'text' && block.content) {
        hasBodyText = true;
        const p = document.createElement('p');
        p.className = 'drawer-paragraph';
        p.textContent = block.content;
        descContainer.appendChild(p);
      }
    });
  }

  if (!hasBodyText && project.excerpt) {
    const p = document.createElement('p');
    p.className = 'drawer-paragraph';
    p.textContent = project.excerpt;
    descContainer.appendChild(p);
  }

  infoSection.appendChild(descContainer);
  drawerInner.appendChild(infoSection);

  // --- B. GALERÍA INTERACTIVA DE FOTOS DEL PROYECTO ---
  const gallerySection = document.createElement('div');
  gallerySection.className = 'drawer-gallery-section';

  const galleryHeader = document.createElement('div');
  galleryHeader.className = 'gallery-section-header';
  galleryHeader.innerHTML = `
    <h5 class="gallery-title">
      <span class="gallery-icon" aria-hidden="true">📷</span> Fotografías del Proyecto
    </h5>
    <span class="gallery-counter-label" id="gallery-counter-${project._id}">
      ${photos.length > 0 ? `Foto 1 de ${photos.length}` : 'Sin fotografías'}
    </span>
  `;
  gallerySection.appendChild(galleryHeader);

  if (photos.length > 0) {
    // 1. Visor principal interactivo
    const viewer = document.createElement('div');
    viewer.className = 'gallery-main-viewer';

    const mainImg = document.createElement('img');
    mainImg.className = 'gallery-main-img';
    mainImg.src = photos[0].url;
    mainImg.alt = photos[0].caption || project.title;
    mainImg.id = `gallery-main-img-${project._id}`;
    mainImg.loading = 'eager';

    viewer.appendChild(mainImg);

    // Botones funcionales de navegación entre fotos (si hay más de 1)
    if (photos.length > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'btn-gallery-nav btn-gallery-prev';
      prevBtn.setAttribute('aria-label', 'Ver fotografía anterior');
      prevBtn.innerHTML = '‹';

      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'btn-gallery-nav btn-gallery-next';
      nextBtn.setAttribute('aria-label', 'Ver siguiente fotografía');
      nextBtn.innerHTML = '›';

      viewer.appendChild(prevBtn);
      viewer.appendChild(nextBtn);

      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activePhotoIndex = (activePhotoIndex - 1 + photos.length) % photos.length;
        updateActivePhoto(activePhotoIndex);
      });

      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activePhotoIndex = (activePhotoIndex + 1) % photos.length;
        updateActivePhoto(activePhotoIndex);
      });
    }

    gallerySection.appendChild(viewer);

    // Pie de foto interactivo
    const captionEl = document.createElement('p');
    captionEl.className = 'gallery-caption-text';
    captionEl.id = `gallery-caption-${project._id}`;
    captionEl.textContent = photos[0].caption || '';
    gallerySection.appendChild(captionEl);

    // 2. Tira de miniaturas (Thumbnails)
    if (photos.length > 1) {
      const thumbStrip = document.createElement('div');
      thumbStrip.className = 'gallery-thumbnails-strip';
      thumbStrip.setAttribute('role', 'tablist');
      thumbStrip.setAttribute('aria-label', 'Miniaturas del proyecto');

      photos.forEach((photo, idx) => {
        const thumbBtn = document.createElement('button');
        thumbBtn.type = 'button';
        thumbBtn.className = `gallery-thumb-btn ${idx === 0 ? 'is-active' : ''}`;
        thumbBtn.setAttribute('role', 'tab');
        thumbBtn.setAttribute('aria-selected', String(idx === 0));
        thumbBtn.setAttribute('aria-label', `Seleccionar fotografía ${idx + 1}`);

        const thumbImg = document.createElement('img');
        thumbImg.src = photo.url;
        thumbImg.alt = photo.caption || `Miniatura ${idx + 1}`;
        thumbImg.loading = 'lazy';
        thumbImg.className = 'gallery-thumb-img';

        thumbBtn.appendChild(thumbImg);

        thumbBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          activePhotoIndex = idx;
          updateActivePhoto(idx);
        });

        thumbStrip.appendChild(thumbBtn);
      });

      gallerySection.appendChild(thumbStrip);
    }

    // Función interna para actualizar la foto activa
    function updateActivePhoto(index) {
      if (!photos[index]) return;
      const current = photos[index];
      mainImg.src = current.url;
      mainImg.alt = current.caption || project.title;
      captionEl.textContent = current.caption || '';

      const counter = gallerySection.querySelector(`#gallery-counter-${project._id}`);
      if (counter) {
        counter.textContent = `Foto ${index + 1} de ${photos.length}`;
      }

      const allThumbs = gallerySection.querySelectorAll('.gallery-thumb-btn');
      allThumbs.forEach((th, i) => {
        const isActive = i === index;
        th.classList.toggle('is-active', isActive);
        th.setAttribute('aria-selected', String(isActive));
      });
    }
  } else {
    // Si no hay fotos, mostrar placeholder de alta gama
    const emptyGallery = document.createElement('div');
    emptyGallery.className = 'gallery-placeholder-box';
    emptyGallery.innerHTML = `
      <span class="placeholder-brand">ALPHABIT</span>
      <p class="placeholder-note">Fotografías del proyecto disponibles en el dossier técnico.</p>
    `;
    gallerySection.appendChild(emptyGallery);
  }

  drawerInner.appendChild(gallerySection);

  // --- C. BOTONES DE ACCIÓN FUNCIONALES EN EL PIE DEL DESPLIEGUE ---
  const actionsBar = document.createElement('div');
  actionsBar.className = 'drawer-actions-bar';

  // Botón 1: Plegar tarjeta
  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'btn-drawer-collapse';
  collapseBtn.innerHTML = `
    <span class="arrow" aria-hidden="true">↑</span>
    <span>Plegar tarjeta</span>
  `;
  collapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleExpansion(false);
  });
  actionsBar.appendChild(collapseBtn);

  // Botón 2: Cotizar proyecto similar (scroll a contacto y pre-selección)
  const quoteBtn = document.createElement('button');
  quoteBtn.type = 'button';
  quoteBtn.className = 'btn-drawer-quote';
  quoteBtn.innerHTML = `
    <span>Cotizar proyecto similar</span>
    <span class="arrow" aria-hidden="true">→</span>
  `;
  quoteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onQuoteProject === 'function') {
      onQuoteProject(project);
    }
  });
  actionsBar.appendChild(quoteBtn);

  // Botón 3: Ver en modal de pantalla completa
  const modalBtn = document.createElement('button');
  modalBtn.type = 'button';
  modalBtn.className = 'btn-drawer-modal';
  modalBtn.setAttribute('aria-label', 'Ver proyecto en pantalla completa');
  modalBtn.innerHTML = `
    <span aria-hidden="true">⤢</span>
    <span>Pantalla completa</span>
  `;
  modalBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (typeof onOpenModal === 'function') {
      onOpenModal(project);
    }
  });
  actionsBar.appendChild(modalBtn);

  drawerInner.appendChild(actionsBar);
  drawer.appendChild(drawerInner);
  card.appendChild(drawer);

  // ---------------------------------------------------------------------------
  // 3. LÓGICA DE INTERACCIÓN Y DESPLIEGUE (Expand / Collapse)
  // ---------------------------------------------------------------------------
  function toggleExpansion(forceState) {
    const isCurrentlyExpanded = card.classList.contains('is-expanded');
    const newState = typeof forceState === 'boolean' ? forceState : !isCurrentlyExpanded;

    card.classList.toggle('is-expanded', newState);
    card.setAttribute('aria-expanded', String(newState));
    drawer.setAttribute('aria-hidden', String(!newState));
    toggleBtn.setAttribute('aria-expanded', String(newState));

    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    if (toggleText) {
      toggleText.textContent = newState ? 'Plegar detalles' : 'Desplegar detalles y fotos';
    }
    if (toggleIcon) {
      toggleIcon.textContent = newState ? '↑' : '↓';
    }

    if (typeof onToggleExpand === 'function') {
      onToggleExpand(card, project, newState);
    }
  }

  // Interacción al hacer clic en el encabezado compacto o en el botón
  preview.addEventListener('click', (e) => {
    // Si se hizo clic en un enlace o botón específico, no duplicar
    if (e.target.closest('a, button:not(.btn-card-toggle)')) return;
    e.preventDefault();
    toggleExpansion();
  });

  // Interacción por teclado (Enter / Espacio sobre la tarjeta)
  card.addEventListener('keydown', (e) => {
    if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggleExpansion();
    }
  });

  return card;
}

/**
 * Renderiza la grilla de proyectos
 * @param {Array} projects Proyectos a renderizar
 * @param {HTMLElement} container Contenedor de la grilla
 * @param {Object} handlers Manejadores de eventos de la tarjeta
 */
export function renderProjectsGrid(projects, container, handlers = {}) {
  if (!container) return;
  container.innerHTML = '';

  // Estado si la API aún no ha enviado proyectos
  if (!projects || projects.length === 0) {
    container.innerHTML = `
      <div class="projects-empty-waiting">
        <div class="empty-waiting-icon" aria-hidden="true">✦</div>
        <h3 class="empty-waiting-title">A la espera de proyectos desde la API REST</h3>
        <p class="empty-waiting-desc">
          Las tarjetas en las categorías <strong>LOGOS</strong>, <strong>PROYECTOS FOTOGRÁFICOS</strong> y <strong>DISEÑOS</strong>
          se desplegarán automáticamente aquí en cuanto sean emitidas por la API.
        </p>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  projects.forEach((proj, idx) => {
    const card = createProjectCard(proj, handlers);
    card.style.animationDelay = `${(idx % 6) * 0.08}s`;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/**
 * Renderiza tarjetas esqueleto con shimmer durante la carga
 * @param {HTMLElement} container
 * @param {number} count
 */
export function renderSkeletons(container, count = 6) {
  if (!container) return;
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-card';
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.innerHTML = `
      <div class="skeleton-image-wrapper">
        <div class="skeleton-chip shimmer"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line skeleton-date shimmer"></div>
        <div class="skeleton-line skeleton-title shimmer"></div>
        <div class="skeleton-line skeleton-title-short shimmer"></div>
        <div class="skeleton-line skeleton-excerpt shimmer"></div>
        <div class="skeleton-line skeleton-btn shimmer"></div>
      </div>
    `;
    fragment.appendChild(skeleton);
  }
  container.appendChild(fragment);
}

/**
 * Renderiza estado de error con botón funcional de reintento
 * @param {HTMLElement} container
 * @param {string} message
 * @param {Function} onRetry
 */
export function renderError(container, message, onRetry) {
  if (!container) return;
  container.innerHTML = `
    <div class="error-state">
      <div class="error-icon" aria-hidden="true">!</div>
      <h3 class="error-title">No fue posible cargar el contenido</h3>
      <p class="error-desc">${message || 'Error de conexión con la API REST.'}</p>
      <button type="button" class="btn btn-outline btn-retry" id="btn-retry-action">
        Reintentar conexión
      </button>
    </div>
  `;

  const btn = container.querySelector('#btn-retry-action');
  if (btn && typeof onRetry === 'function') {
    btn.addEventListener('click', onRetry);
  }
}

/**
 * Renderiza el contenido interno del modal de detalle de un proyecto
 * @param {Object} project
 * @param {HTMLElement} modalContainer
 */
export function renderModalContent(project, modalContainer) {
  if (!modalContainer || !project) return;
  modalContainer.innerHTML = '';

  const article = document.createElement('article');
  article.className = 'modal-project-detail';

  // 1. Cover Image Header (16/9)
  const coverWrap = document.createElement('div');
  coverWrap.className = 'modal-cover-wrapper';

  if (project.coverImage) {
    const coverImg = document.createElement('img');
    coverImg.src = project.coverImage;
    coverImg.alt = project.title || 'Portada de proyecto';
    coverImg.className = 'modal-cover-image';
    coverImg.loading = 'eager';
    coverImg.addEventListener('error', () => {
      coverWrap.innerHTML = '<div class="modal-cover-placeholder"><span class="placeholder-brand">ALPHABIT</span></div>';
    });
    coverWrap.appendChild(coverImg);
  } else {
    coverWrap.innerHTML = '<div class="modal-cover-placeholder"><span class="placeholder-brand">ALPHABIT</span></div>';
  }
  article.appendChild(coverWrap);

  // 2. Encabezado editorial del proyecto
  const header = document.createElement('header');
  header.className = 'modal-header';

  // Meta: Categoría + Fecha
  const metaLine = document.createElement('div');
  metaLine.className = 'modal-meta-line';

  if (project.category) {
    const catSpan = document.createElement('span');
    catSpan.className = 'modal-category';
    catSpan.textContent = project.category;
    metaLine.appendChild(catSpan);
  }

  if (project.date) {
    if (project.category) {
      const sep = document.createElement('span');
      sep.className = 'modal-meta-sep';
      sep.textContent = '·';
      metaLine.appendChild(sep);
    }
    const dateSpan = document.createElement('time');
    dateSpan.className = 'modal-date';
    dateSpan.dateTime = project.date;
    dateSpan.textContent = formatDate(project.date);
    metaLine.appendChild(dateSpan);
  }
  header.appendChild(metaLine);

  // Título completo
  const title = document.createElement('h1');
  title.className = 'modal-title';
  title.textContent = project.title || 'Proyecto sin título';
  header.appendChild(title);

  // Subtítulo si existe
  if (project.subtitle) {
    const subtitle = document.createElement('p');
    subtitle.className = 'modal-subtitle';
    subtitle.textContent = project.subtitle;
    header.appendChild(subtitle);
  }

  // Tags en chips
  if (project.tags && Array.isArray(project.tags) && project.tags.length > 0) {
    const tagsWrapper = document.createElement('div');
    tagsWrapper.className = 'modal-tags-wrapper';
    project.tags.forEach(tag => {
      const tagChip = document.createElement('span');
      tagChip.className = 'modal-tag-chip';
      tagChip.textContent = tag;
      tagsWrapper.appendChild(tagChip);
    });
    header.appendChild(tagsWrapper);
  }

  article.appendChild(header);

  // 3. Renderizado de bloques del cuerpo (body: text & image)
  const bodyContainer = document.createElement('div');
  bodyContainer.className = 'modal-body-blocks';

  if (project.body && Array.isArray(project.body) && project.body.length > 0) {
    project.body.forEach(block => {
      if (block.type === 'text') {
        const p = document.createElement('p');
        p.className = 'modal-body-paragraph';
        p.textContent = block.content;
        bodyContainer.appendChild(p);
      } else if (block.type === 'image') {
        const figure = document.createElement('figure');
        figure.className = 'modal-body-figure';

        if (block.url) {
          const img = document.createElement('img');
          img.src = block.url;
          img.alt = block.caption || project.title || 'Imagen del proyecto';
          img.loading = 'lazy';
          img.className = 'modal-body-image';
          figure.appendChild(img);
        } else {
          const placeholder = document.createElement('div');
          placeholder.className = 'modal-body-image-placeholder';
          placeholder.innerHTML = '<span class="placeholder-brand">ALPHABIT</span>';
          figure.appendChild(placeholder);
        }

        if (block.caption) {
          const figcaption = document.createElement('figcaption');
          figcaption.className = 'modal-body-caption';
          figcaption.textContent = block.caption;
          figure.appendChild(figcaption);
        }

        bodyContainer.appendChild(figure);
      }
    });
  } else if (project.excerpt) {
    const p = document.createElement('p');
    p.className = 'modal-body-paragraph';
    p.textContent = project.excerpt;
    bodyContainer.appendChild(p);
  }

  article.appendChild(bodyContainer);
  modalContainer.appendChild(article);
}

/**
 * Renderiza la grilla de servicios en la sección de Servicios
 * @param {Array} services
 * @param {HTMLElement} container
 */
export function renderServices(services, container) {
  if (!container) return;
  const section = document.getElementById('servicios');

  if (!services || services.length === 0) {
    if (section) section.style.display = 'none';
    return;
  }

  if (section) section.style.display = 'block';
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  services.forEach((service, index) => {
    const card = document.createElement('div');
    card.className = 'service-card reveal';
    const indexStr = String(index + 1).padStart(2, '0');

    card.innerHTML = `
      <span class="service-number" aria-hidden="true">${indexStr}</span>
      <h3 class="service-name">${service.name || 'Servicio'}</h3>
      <p class="service-description">${service.description || ''}</p>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

/**
 * Renderiza esqueletos de servicios
 * @param {HTMLElement} container
 * @param {number} count
 */
export function renderServicesSkeletons(container, count = 6) {
  if (!container) return;
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'service-card skeleton-service';
    sk.innerHTML = `
      <div class="skeleton-line shimmer" style="width: 40px; height: 36px; margin-bottom: 24px;"></div>
      <div class="skeleton-line shimmer" style="width: 70%; height: 22px; margin-bottom: 16px;"></div>
      <div class="skeleton-line shimmer" style="width: 100%; height: 16px; margin-bottom: 8px;"></div>
      <div class="skeleton-line shimmer" style="width: 85%; height: 16px;"></div>
    `;
    fragment.appendChild(sk);
  }
  container.appendChild(fragment);
}

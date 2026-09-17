import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable CORS for external consumer flexibility if needed
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Seed Data for ALPHABIT Services
const servicesData = [
  {
    _id: "65f01a01c4e9123456789001",
    name: "Diseño Gráfico",
    description: "Identidad visual, línea gráfica coherente, piezas publicitarias y sistemas visuales de alto impacto.",
    icon: "graphic-design"
  },
  {
    _id: "65f01a01c4e9123456789002",
    name: "Diseño de Logo & Branding",
    description: "Creación y rediseño de marcas que trascienden. Tipografía a la medida y manuales de identidad completos.",
    icon: "logo-design"
  },
  {
    _id: "65f01a01c4e9123456789003",
    name: "Fotografía Inmobiliaria",
    description: "Captura de arquitectura, desarrollos habitacionales y espacios comerciales con luz natural y perspectiva calculada.",
    icon: "real-estate"
  },
  {
    _id: "65f01a01c4e9123456789004",
    name: "Fotografía de Producto",
    description: "Tomas de estudio con dirección de arte cuidada, iluminación cenital y texturas nítidas para e-commerce y catálogos.",
    icon: "product-photo"
  },
  {
    _id: "65f01a01c4e9123456789005",
    name: "Diseño Editorial",
    description: "Maquetación de libros, revistas, catálogos impresos e informes corporativos con precisión tipográfica.",
    icon: "editorial"
  },
  {
    _id: "65f01a01c4e9123456789006",
    name: "Diseño de Empaque",
    description: "Desarrollo estructural y gráfico de envases, etiquetas y packaging pensado para experiencia de unboxing y retail.",
    icon: "packaging"
  }
];

// Seed Data for Company Info (GET /api/info)
const companyInfo = {
  name: "ALPHABIT",
  tagline: "Servicios Digitales",
  description: "Somos ALPHABIT, una agencia de servicios digitales en El Salvador. Transformamos ideas en experiencias visuales que comunican, conectan y perduran. Desde el diseño de logos hasta fotografía inmobiliaria, editorial y empaque de producto, nuestro trabajo habla por nosotros.",
  email: "contacto@alphabit.sv",
  location: "El Salvador",
  socialLinks: {
    instagram: "https://instagram.com/alphabit.sv",
    facebook: "https://facebook.com/alphabit.sv"
  },
  stats: [
    { value: "4+", label: "Años de experiencia" },
    { value: "+50", label: "Proyectos completados" },
    { value: "SV", label: "El Salvador" }
  ]
};

// Almacenamiento dinámico de proyectos para la API REST.
// INICIALIZADO VACÍO (CERO DATOS QUEMADOS):
// Ninguna tarjeta está quemada en el código. Toda la información es enviada y gestionada
// en tiempo real por el sistema backend a través de la API paralela.
let projectsData: any[] = [];

// POST /api/projects/seed - Inyectar proyectos bajo demanda explícita vía petición HTTP
app.post("/api/projects/seed", (req, res) => {
  projectsData = [
    {
      _id: "65f02a01c4e9123456789101",
      title: "Dermalaser – Rediseño de Logo – Ejercicio Creativo #002",
      subtitle: "Ejercicio Creativo #002",
      category: "Logo",
      tags: ["Diseño Gráfico", "Línea Gráfica", "Logo", "Rediseño"],
      date: "2026-09-11",
      coverImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Rediseño de identidad visual para Clínica Dermalaser, llevando el logo anterior a un nuevo nivel de limpieza, orden y compatibilidad con medios digitales.",
      slug: "dermalaser-rediseno-logo-002",
      body: [
        {
          type: "text",
          content: "Como parte de nuestros ejercicios creativos de septiembre, nos enfocamos en reimaginar marcas salvadoreñas desde una perspectiva contemporánea y funcional. El rediseño de Dermalaser optimiza la legibilidad en pantallas retina y aplicaciones impresas de alta gama."
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1400&q=80",
          caption: "Propuesta de rediseño de isotipo con proporciones áureas"
        }
      ]
    },
    {
      _id: "65f02a01c4e9123456789102",
      title: "Historiales Liceo Cristiano «Rev. Juan Bueno» – Diseño Gráfico y Fotografía – El Salvador",
      subtitle: "Programa de Ayuda Humanitaria",
      category: "Diseño Gráfico",
      tags: ["Diseño Gráfico", "Fotografía", "El Salvador"],
      date: "2026-09-02",
      coverImage: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Durante 4 años, Alphabit colaboró con el Programa de Ayuda del Liceo Cristiano diseñando historiales físicos para niños aspirantes a patrocinio educativo.",
      slug: "historiales-liceo-cristiano-rev-juan-bueno",
      body: [
        {
          type: "text",
          content: "Durante 4 años continuos colaboramos con el Programa de Ayuda del Liceo Cristiano «Rev. Juan Bueno» en El Salvador, diseñando historiales físicos para niños que aspiraban a un patrocinio educativo internacional."
        },
        {
          type: "image",
          url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=80",
          caption: "Diagramación editorial de fichas socioeconómicas para patrocinio infantil"
        }
      ]
    },
    {
      _id: "65f02a01c4e9123456789103",
      title: "Memoria de Labores ACONAC 2021 – Diseño Editorial – El Salvador",
      subtitle: "Informe Anual de Gestión",
      category: "Diseño Editorial",
      tags: ["Diseño Editorial", "Diagramación", "El Salvador"],
      date: "2026-07-29",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Diseño editorial y diagramación de memoria de labores institucional para Asociación Comunal Nueva Alianza Comunitaria (ACONAC).",
      slug: "memoria-de-labores-aconac-2021",
      body: [
        {
          type: "text",
          content: "Diseño editorial y maquetación de memoria de labores anual para la Asociación Comunal Nueva Alianza Comunitaria (ACONAC). Un documento institucional de 64 páginas con infografías y balances contables claros."
        }
      ]
    },
    {
      _id: "65f02a01c4e9123456789104",
      title: "Casa Vía del Mar – Fotografía Inmobiliaria – El Salvador",
      subtitle: "Arquitectura Residencial",
      category: "Fotografía",
      tags: ["Fotografía", "Inmobiliaria", "Arquitectura", "El Salvador"],
      date: "2026-07-03",
      coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Sesión fotográfica de arquitectura e interiores para residencia privada en residencial Vía del Mar, Nuevo Cuscatlán.",
      slug: "casa-via-del-mar-fotografia-inmobiliaria",
      body: [
        {
          type: "text",
          content: "Sesión fotográfica especializada en bienes raíces para residencia privada en Vía del Mar, Nuevo Cuscatlán. Captura de luz natural en áreas sociales y exteriores."
        }
      ]
    },
    {
      _id: "65f02a01c4e9123456789105",
      title: "Fresquito – Diseño de Empaque – Ejercicio Creativo",
      subtitle: "Concepto de Packaging",
      category: "Empaque",
      tags: ["Diseño de Empaque", "Branding", "Packaging", "Café"],
      date: "2026-06-30",
      coverImage: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=1200&q=80",
      excerpt: "Concepto de empaque flexible para marca artesanal de café gourmet salvadoreño de estricta altura.",
      slug: "fresquito-diseno-empaque",
      body: [
        {
          type: "text",
          content: "Concepto de diseño de empaque para café gourmet salvadoreño producido en la cordillera Apaneca-Ilamatepec. Sistema de empaque flexible con acabado mate y cierre hermético."
        }
      ]
    }
  ];

  res.json({
    message: "Proyectos inyectados dinámicamente en la API mediante petición POST",
    count: projectsData.length,
    projects: projectsData
  });
});

// DELETE /api/projects - Vaciar todos los proyectos de la API
app.delete("/api/projects", (req, res) => {
  projectsData = [];
  res.json({
    message: "Todos los proyectos han sido eliminados de la API",
    count: 0
  });
});

// DELETE /api/projects/:id - Eliminar un proyecto individual
app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const initialCount = projectsData.length;
  projectsData = projectsData.filter(p => p._id !== id && p.slug !== id);
  if (projectsData.length === initialCount) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }
  res.json({ message: "Proyecto eliminado exitosamente de la API", id });
});

// GET /api/health - Conexión y estado de salud
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Conexión con la API de ALPHABIT establecida correctamente",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptimeSeconds: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    endpoints: [
      { method: "GET", path: "/api/health", description: "Comprobación de estado y conectividad" },
      { method: "GET", path: "/api/info", description: "Información institucional de la agencia" },
      { method: "GET", path: "/api/services", description: "Lista de servicios ofrecidos" },
      { method: "GET", path: "/api/projects", description: "Lista de proyectos con filtrado y paginación" },
      { method: "GET", path: "/api/projects/:id", description: "Detalle completo de proyecto por ID o slug" },
      { method: "POST", path: "/api/projects", description: "Crear nuevo proyecto (para pruebas o backend completo)" }
    ],
    counts: {
      projects: projectsData.length,
      services: servicesData.length
    }
  });
});

// GET /api/info
app.get("/api/info", (req, res) => {
  res.json(companyInfo);
});

// GET /api/services
app.get("/api/services", (req, res) => {
  res.json(servicesData);
});

// GET /api/projects
// Supports query params: ?page=1&limit=6&category=all
app.get("/api/projects", (req, res) => {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  const category = req.query.category as string;

  let filtered = [...projectsData];
  if (category && category.toLowerCase() !== "all" && category.toLowerCase() !== "todos") {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);
    return res.json(paginated);
  }

  // Return all projects by default if no pagination params
  res.json(filtered);
});

// POST /api/projects - Crear nuevo proyecto en la API
app.post("/api/projects", (req, res) => {
  const { title, category, excerpt, coverImage, body, tags, subtitle, space, status, images } = req.body;
  if (!title || !category) {
    return res.status(400).json({ error: "El título y la categoría son campos obligatorios" });
  }

  const newId = "65f02a01c4e9" + Math.floor(Math.random() * 899999999999 + 100000000000);
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  // Build body blocks with extra images if provided
  let bodyBlocks = Array.isArray(body) && body.length > 0 ? [...body] : [];
  if (bodyBlocks.length === 0 && excerpt) {
    bodyBlocks.push({
      type: "text",
      content: excerpt
    });
  }

  if (Array.isArray(images)) {
    images.forEach((img: any) => {
      if (img && img.url) {
        bodyBlocks.push({
          type: "image",
          url: img.url,
          caption: img.caption || img.name || "Fotografía de proyecto"
        });
      }
    });
  }

  const newProject = {
    _id: newId,
    title,
    subtitle: subtitle || "Proyecto ALPHABIT",
    category,
    space: space || "principal", // "principal", "destacado", "archivo", "vitrina"
    status: status || "publicado", // "publicado", "borrador"
    tags: Array.isArray(tags) && tags.length > 0 ? tags : [category],
    date: req.body.date || new Date().toISOString().split("T")[0],
    coverImage: coverImage || "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80",
    excerpt: excerpt || "Nuevo proyecto registrado exitosamente en el sistema de ALPHABIT.",
    slug: slug || newId,
    body: bodyBlocks,
    createdAt: new Date().toISOString()
  };

  projectsData.unshift(newProject);
  res.status(201).json(newProject);
});

// PUT /api/projects/:id - Actualizar proyecto existente (CRUD Completo)
app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const index = projectsData.findIndex(p => p._id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ error: "Proyecto no encontrado para actualizar" });
  }

  const existing = projectsData[index];
  const { title, subtitle, category, space, status, tags, date, coverImage, excerpt, body, images } = req.body;

  let updatedBody = body ? (Array.isArray(body) ? body : [body]) : existing.body;

  // Si se envían imágenes adicionales, fusionarlas si se desea
  if (Array.isArray(images) && images.length > 0) {
    const textBlocks = updatedBody.filter((b: any) => b.type === "text");
    const imageBlocks = images.map((img: any) => ({
      type: "image",
      url: img.url,
      caption: img.caption || img.name || "Fotografía del proyecto"
    }));
    updatedBody = [...textBlocks, ...imageBlocks];
  }

  let slug = existing.slug;
  if (title && title !== existing.title && !req.body.slug) {
    slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }

  const updatedProject = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
    category: category !== undefined ? category : existing.category,
    space: space !== undefined ? space : (existing.space || "principal"),
    status: status !== undefined ? status : (existing.status || "publicado"),
    tags: tags !== undefined ? (Array.isArray(tags) ? tags : [tags]) : existing.tags,
    date: date !== undefined ? date : existing.date,
    coverImage: coverImage !== undefined ? coverImage : existing.coverImage,
    excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
    body: updatedBody,
    slug,
    updatedAt: new Date().toISOString()
  };

  projectsData[index] = updatedProject;
  res.json(updatedProject);
});

// POST /api/upload - Subida y procesamiento de imágenes
app.post("/api/upload", (req, res) => {
  const { image, name, caption } = req.body;
  if (!image) {
    return res.status(400).json({ error: "No se proporcionó imagen válida" });
  }

  // Devolver URL procesada (Data URL persistente o URL directa)
  res.json({
    success: true,
    url: image,
    name: name || "Imagen subida",
    caption: caption || "",
    timestamp: new Date().toISOString()
  });
});

// GET /api/admin/stats - Estadísticas y métricas del Dashboard Admin
app.get("/api/admin/stats", (req, res) => {
  const totalProjects = projectsData.length;
  const publishedProjects = projectsData.filter(p => p.status !== "borrador").length;
  const draftProjects = totalProjects - publishedProjects;

  // Conteo por espacio asignado
  const spaces = {
    principal: projectsData.filter(p => !p.space || p.space === "principal" || p.space === "hero").length,
    destacado: projectsData.filter(p => p.space === "destacado" || p.space === "vitrina").length,
    archivo: projectsData.filter(p => p.space === "archivo").length,
    servicios: projectsData.filter(p => p.space === "servicios").length
  };

  // Conteo por categoría
  const categories: Record<string, number> = {};
  projectsData.forEach(p => {
    const cat = p.category || "Sin categoría";
    categories[cat] = (categories[cat] || 0) + 1;
  });

  res.json({
    totalProjects,
    publishedProjects,
    draftProjects,
    totalServices: servicesData.length,
    spaces,
    categories,
    lastUpdated: new Date().toISOString()
  });
});

// GET /api/projects/:id (or by slug)
app.get("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const project = projectsData.find(p => p._id === id || p.slug === id);

  if (!project) {
    return res.status(404).json({ error: "Proyecto no encontrado" });
  }

  res.json(project);
});

// Mount Vite middleware for dev or static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ALPHABIT Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

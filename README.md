# 🌐 AlphabitSV — Sitio Web & Sistema de Administración

> **Plataforma web institucional y sistema de administración de portafolio desarrollado para AlphabitSV.**

![Status](https://img.shields.io/badge/Status-Development-orange)
![GitHub](https://img.shields.io/badge/GitHub-Repository-black?logo=github)
![License](https://img.shields.io/badge/License-Private-lightgrey)

---

## 📖 Descripción

**AlphabitSV** es una plataforma web desarrollada para **Alphabit**, una agencia de marketing digital y diseño gráfico orientada principalmente a pequeñas y medianas empresas (PYMES).
El proyecto tiene como objetivo proporcionar una presencia digital moderna y profesional para la empresa, permitiendo mostrar sus servicios, proyectos y trabajos realizados mediante un **portafolio digital administrable**.
La plataforma está compuesta por dos partes principales:
* 🌐 **Sitio web público:** destinado a clientes y visitantes.
* 🔐 **Sistema de administración:** destinado a la gestión del contenido y portafolio de la empresa.

El sistema busca facilitar la actualización de proyectos y contenido sin necesidad de realizar modificaciones directamente sobre el código fuente de la aplicación.

---

## 🏢 Sobre Alphabit

**Alphabit** es una agencia de marketing digital y diseño gráfico que busca brindar soluciones a las PYMES que están creciendo y desean proyectarse aún más mediante el uso de canales digitales.

La agencia ayuda a sus clientes a desarrollar contenido atractivo y adecuado para sus marcas, proyectándolas visualmente de manera profesional y generando interacción con sus clientes para fortalecer su posicionamiento dentro del mercado actual.

### 💡 Propuesta de valor

> **¡Somos el par de manos extras que necesitas para dar forma a tus ideas!**

---

## 💎 Valores

Alphabit desarrolla su trabajo bajo los siguientes valores:

* 🎨 **Creatividad**
* 🤝 **Integridad**
* 🧩 **Responsabilidad**
* 💼 **Compromiso**
* ⭐ **Profesionalismo**
* 🔒 **Confianza**
* ❤️ **Servicio**

---

# 🚀 Servicios

Alphabit ofrece servicios completos y adaptados a las necesidades de cada negocio.

### 🎨 Diseño gráfico

Diseño y rediseño de logotipos, tarjetas de presentación, membretes, flyers, brochures, presentaciones empresariales, memorias de labores, catálogos, afiches, banners, vallas publicitarias, empaques y diferentes piezas de comunicación visual.

### 📱 Manejo de redes sociales

Gestión de redes sociales que puede incluir:

* Creación y configuración de páginas.
* Estrategia de contenido.
* Creación de contenido.
* Atención al cliente.
* Calendario de publicaciones.
* Creación de campañas.
* Gestión de publicidad.
* Pauta publicitaria.
* Diseño de imágenes y plantillas.

### 📸 Fotografía, video y drone

Servicios de producción audiovisual orientados a diferentes necesidades empresariales:

* Fotografía de productos.
* Fotografía de alimentos.
* Fotografía de servicios.
* Fotografía inmobiliaria.
* Videos empresariales.
* Tomas aéreas con drone.
* Producción de contenido audiovisual.

Alphabit cuenta con equipo especializado para producción fotográfica, incluyendo caja de luz, estudio fotográfico desmontable y set de iluminación portátil.

---

# ✨ Características del proyecto

## 🌐 Sitio web público

El sitio web permite a los visitantes conocer la empresa y explorar sus servicios y proyectos.

### Principales secciones

* 🏠 Página de inicio.
* 🏢 Información sobre Alphabit.
* 💼 Servicios.
* 🖼️ Portafolio.
* 📞 Información de contacto.
* 📱 Diseño adaptable a diferentes dispositivos.

---

## 🔐 Sistema de administración

El proyecto incorpora un sistema de administración para facilitar la gestión del contenido del portafolio.

### Funcionalidades

* 🔑 Inicio de sesión.
* 📊 Panel de administración.
* ➕ Creación de proyectos.
* ✏️ Edición de proyectos.
* 🗑️ Eliminación de proyectos.
* 🖼️ Gestión de imágenes.
* 📁 Administración del contenido del portafolio.
* 🔒 Acceso restringido para usuarios autorizados.

> Las funcionalidades pueden ampliarse conforme evolucione el proyecto.

---

# 🛠️ Tecnologías utilizadas

> **Esta sección debe actualizarse con las tecnologías utilizadas realmente en el proyecto.**

### Frontend

* [Tecnología utilizada]
* [Framework utilizado]
* [Librería de estilos]
* [Otras tecnologías]

### Backend

* [Lenguaje]
* [Framework]
* [API / Arquitectura]

### Base de datos

* [Motor de base de datos]

### Herramientas

* Git
* GitHub
* Visual Studio Code
* [Otras herramientas]

---

# 🏗️ Arquitectura del proyecto

La aplicación está organizada en diferentes componentes con el objetivo de separar la interfaz pública de las funcionalidades administrativas.

```text
┌──────────────────────────────────────────────┐
│                  AlphabitSV                  │
├──────────────────────────────────────────────┤
│                                              │
│              🌐 Sitio Web Público            │
│                                              │
│   Inicio • Nosotros • Servicios • Portafolio│
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│            🔐 Administración                 │
│                                              │
│   Login • Dashboard • Proyectos • Imágenes   │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│                 ⚙️ Backend                   │
│                                              │
│          API • Autenticación • Lógica        │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│                🗄️ Base de datos              │
│                                              │
│          Usuarios • Proyectos • Datos        │
│                                              │
└──────────────────────────────────────────────┘
```

---

# 📂 Estructura del proyecto

La estructura dependerá de la arquitectura y tecnologías utilizadas.

```text
AlphabitSV/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── assets/
│   └── ...
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
│
├── database/
│   └── ...
│
├── public/
│   └── ...
│
├── .env
├── .gitignore
├── README.md
└── ...
```

---

# ⚙️ Instalación

## 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
```

## 2. Acceder al proyecto

```bash
cd AlphabitSV
```

## 3. Instalar dependencias

```bash
COMANDO_DE_INSTALACION
```

## 4. Configurar variables de entorno

Crear un archivo `.env` en la ubicación correspondiente.

Ejemplo:

```env
DATABASE_URL=
API_URL=
SECRET_KEY=
```

> ⚠️ **Importante:** nunca subir contraseñas, claves privadas, tokens, API keys o credenciales reales al repositorio.

## 5. Ejecutar el proyecto

```bash
COMANDO_DE_EJECUCION
```

---

# 🔒 Seguridad

El sistema administrativo está diseñado para restringir el acceso a las funciones de gestión del portafolio.

Las credenciales de acceso y variables sensibles deben mantenerse fuera del repositorio mediante variables de entorno y mecanismos adecuados de configuración.

---

# 🖼️ Capturas de pantalla

## Página principal

![Página principal](./screenshots/home.png)

## Servicios

![Servicios](./screenshots/servicios.png)

## Portafolio

![Portafolio](./screenshots/portafolio.png)

## Sistema de administración

![Panel de administración](./screenshots/admin.png)

> Las imágenes anteriores deben reemplazarse por las capturas reales del proyecto.

---

# 📱 Diseño responsive

La plataforma está diseñada para proporcionar una experiencia de usuario adecuada en diferentes tamaños de pantalla:

* 💻 Computadoras de escritorio.
* 💻 Laptops.
* 📱 Dispositivos móviles.
* 📲 Tablets.

---

# 📌 Objetivos del proyecto

Los principales objetivos del desarrollo son:

1. Crear una presencia digital profesional para Alphabit.
2. Presentar de forma clara los servicios de la empresa.
3. Mostrar los trabajos realizados mediante un portafolio digital.
4. Facilitar la actualización del portafolio.
5. Centralizar la administración del contenido.
6. Mejorar la experiencia de los visitantes.
7. Proporcionar una plataforma escalable para futuras funcionalidades.

---

# 🔄 Flujo general del sistema

```text
                    VISITANTE
                       │
                       ▼
              ┌─────────────────┐
              │   Sitio Web     │
              │    Alphabit     │
              └────────┬────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Servicios    Portafolio    Contacto
                       │
                       ▼
                 Información
                 de proyectos


                 ADMINISTRADOR
                       │
                       ▼
              ┌─────────────────┐
              │      Login      │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │    Dashboard    │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
          Crear      Editar    Eliminar
         proyecto   proyecto   proyecto
             │         │         │
             └─────────┼─────────┘
                       ▼
                 Base de datos
                       │
                       ▼
                  Portafolio
                    público
```

---

# 🚀 Despliegue

El proyecto puede desplegarse en un entorno de producción utilizando servicios compatibles con la arquitectura seleccionada.

### Producción

**Sitio web:**
`URL_DEL_SITIO_WEB`

**Sistema administrativo:**
`URL_DEL_PANEL_ADMINISTRATIVO`

**Repositorio:**
`URL_DEL_REPOSITORIO_GITHUB`

---

# 👨‍💻 Desarrollador

## Diego David Guevara Flores

Desarrollador responsable del diseño y desarrollo del proyecto web y sistema de administración de portafolio para **AlphabitSV**.

### Responsabilidades

* Análisis de requerimientos.
* Diseño y desarrollo de la plataforma.
* Desarrollo del sitio web.
* Desarrollo del sistema administrativo.
* Integración de la base de datos.
* Implementación de funcionalidades.
* Pruebas y corrección de errores.
* Documentación del proyecto.

---

# 📋 Estado del proyecto

🚧 **En desarrollo**

El proyecto se encuentra en proceso de desarrollo y puede recibir nuevas funcionalidades, mejoras de diseño, optimizaciones y actualizaciones.

---

# 🔮 Futuras mejoras

Entre las posibles mejoras y ampliaciones del sistema se encuentran:

* [ ] Gestión avanzada de usuarios.
* [ ] Gestión de categorías de proyectos.
* [ ] Sistema de búsqueda y filtros.
* [ ] Optimización avanzada de imágenes.
* [ ] Estadísticas del portafolio.
* [ ] Mejoras de SEO.
* [ ] Integración con redes sociales.
* [ ] Mejoras de seguridad.
* [ ] Sistema de respaldo de información.
* [ ] Nuevas herramientas para administración.

---

# 📄 Licencia

Este proyecto fue desarrollado para **AlphabitSV**.

El uso, modificación, distribución y publicación del código fuente estarán sujetos a los acuerdos establecidos entre el desarrollador y la empresa.

---

# ⭐ Créditos

**Proyecto:** AlphabitSV — Sitio Web y Sistema de Administración de Portafolio
**Empresa:** Alphabit
**Desarrollador:** Diego David Guevara Flores
**Año:** 2026

---

<p align="center">
  Desarrollado con dedicación para <strong>AlphabitSV</strong> 💜
</p>

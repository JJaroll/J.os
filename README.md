# J.OS - Web Portfolio System

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Version](https://img.shields.io/badge/Version-1.0.0-green?style=for-the-badge)

Este es un proyecto de portafolio web interactivo construido con [Next.js](https://nextjs.org/), simulando un sistema operativo completo dentro del navegador (**J.OS**). Permite a los usuarios explorar proyectos, habilidades y disfrutar de varios minijuegos clásicos adaptados tanto para escritorio como para dispositivos móviles.

## Características Principales

- **Interfaz de Sistema Operativo:** Una experiencia de usuario única que emula un entorno de escritorio clásico con ventanas arrastrables, barra de tareas y menú de inicio.
- **Aplicaciones Integradas:**
  - **Terminal:** Para comandos interactivos y exploración.
  - **Navegador web / Proyectos:** Muestra el portafolio de trabajos realizados.
  - **Configuración:** Para personalizar el entorno.
  - **Juegos:** Una suite completa de juegos retro completamente jugables y localizados al español.
- **Diseño Responsivo:** Completamente funcional en dispositivos móviles (celulares y tablets) ofreciendo una vista adaptada (por ejemplo, juegos específicos para pantallas táctiles).
- **Temas y Estilos:** Soporte para modo oscuro/claro y ventana de personalización.

## Suite de Juegos (Completamente en Español)

El sistema incluye una variedad de juegos clásicos programados en React/Canvas, con textos e interfaz gráfica completamente en español:

**Juegos de Escritorio:**
- 👾 **Buscaminas (Minesweeper)**
- 🏓 **Retro Pong**
- 🃏 **Solitario**
- 👻 **Pac-Man**
- 🧱 **Tetris**

**Juegos Móviles / Táctiles:**
- 🐦 **Flappy Bird** (Estilo tap-to-fly)
- 🦖 **Dino Run** (Runner infinito estilo Chrome)
- 🧩 **2048** (Juego de lógica deslizable)
- 💥 **Breakout** (Destruye bloques con rebote)

## Tecnologías Utilizadas

- **[Next.js](https://nextjs.org):** Framework de React para el frontend.
- **React (Hooks, Context, Canvas):** Para la lógica de UI y renderizado de juegos de alto rendimiento.
- **Tailwind CSS:** Para estilos rápidos, modernos y responsivos.
- **TypeScript:** Para código tipado y más seguro.
- **Lucide React:** Para iconografía dentro del sistema.

## Primeros Pasos

Para ejecutar el servidor de desarrollo localmente:

```bash
# Instalar dependencias
npm install
# o yarn install
# o pnpm install
# o bun install

# Iniciar servidor de desarrollo
npm run dev
# o yarn dev
# o pnpm dev
# o bun dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

Puedes empezar a editar la página modificando `app/page.tsx`. La página se actualizará automáticamente conforme hagas cambios.

## Personalización

Si deseas adaptar este portafolio para tu propio uso:
- Edita los componentes de aplicaciones dentro de `src/components/os/apps/`
- Modifica la configuración global y accesos directos desde la vista principal.
- Modifica las variables de entorno o constantes correspondientes para ajustar tus enlaces personales y proyectos mostrados.

## Despliegue

La forma más sencilla de desplegar esta aplicación Next.js es utilizar la [Plataforma Vercel](https://vercel.com/new). Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más detalles.

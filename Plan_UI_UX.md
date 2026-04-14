# LEADBY

### Plataforma B2B SaaS

## Plan de Implementación UI/UX

```
Rediseño profesional con animaciones avanzadas
Inspiración: wope.com (layout) + dialedweb.com (animaciones)
Autor: Antonio López Belinchón
Universidad Complutense de Madrid — TFG 2025-
Abril 2026
```

## Índice


- Índice
- 0. Fase Previa: Infraestructura de Animaciones
   - 0.1. Dependencias a instalar
   - 0.2. Ficheros de utilidades a crear
   - 0.3. Cambios en tailwind.config.ts
   - 0.4. Cambios en globals.css
   - 0.5. Cambios en layout.tsx (Root Layout)
- 1. Landing Page — página principal (page.tsx)
   - 1.1. Header / Navbar
   - 1.2. Hero Section
   - 1.3. Logo Ticker / Social Proof
   - 1.4. Features / Funcionalidades
   - 1.5. Stats / Métricas de Impacto
   - 1.6. Cómo Funciona (Timeline)
   - 1.7. Vídeo Corporativo
   - 1.8. Pricing
   - 1.9. CTA Final
   - 1.10. Footer
- 2. Página Sobre Nosotros (/sobre-nosotros)
   - 2.1. Hero
   - 2.2. Sección Investigación
   - 2.3. Stack Tecnológico
   - 2.4. Diferenciadores
- 3. Página Blog (/blog)
   - 3.1. Mejoras de animación
- 4. Páginas de Autenticación (/auth/login y /auth/register)
   - 4.1. Rediseño visual
   - 4.2. Animaciones
- 5. Dashboard Principal (/dashboard)
   - 5.1. Sidebar mejorada
   - 5.2. Métricas
   - 5.3. Acciones rápidas
   - 5.4. Sección de actividad reciente
- 6. Motor de Prospección (/prospecting)
   - 6.1. Rediseño del formulario
   - 6.2. Estado de búsqueda
   - 6.3. Resultados
- 7. Bandeja de Leads (/leads)
   - 7.1. Filtros animados
   - 7.2. Tabla
   - 7.3. Vista detalle (/leads/[leadId])
- 8. Configuración (/settings)
   - 8.1. Mejoras
- 9. Páginas Legales (/legal/terms, /legal/privacy)
- 10. Transiciones Globales entre Páginas
   - 10.1. Implementación con Next.js + framer-motion
   - 10.2. Loading states
- 11. Hoja de Ruta de Implementación
- 12. Inventario de Ficheros a Crear / Modificar
   - 12.1. Ficheros nuevos
   - 12.2. Ficheros a modificar significativamente


## 0. Fase Previa: Infraestructura de Animaciones

Antes de tocar cualquier página, hay que preparar el proyecto con las dependencias y
utilidades compartidas que usarán TODAS las páginas.

### 0.1. Dependencias a instalar

npm install framer-motion @gsap/react gsap lenis
Justificación de cada librería:
**Paquete Propósito Peso (~gzip)**
framer-motion Animaciones declarativas en React:
scroll-triggered reveals, layout animations,
variants, AnimatePresence para transiciones de
página.

#### ~43 KB

```
gsap + @gsap/react Animaciones imperativas de alto rendimiento:
text splitting, parallax, scroll-pinning, timelines
complejas. Estilo Dialedweb.
```
#### ~28 KB

```
lenis Smooth scroll nativo. Suaviza el
desplazamiento del navegador para que las
animaciones scroll-triggered se sientan fluidas.
```
#### ~5 KB

### 0.2. Ficheros de utilidades a crear

**src/lib/animations/scroll-provider.tsx** — Provider global de Lenis smooth-scroll que se
monta en layout.tsx. Inicializa Lenis, sincroniza con GSAP ScrollTrigger y expone un
contexto React para acceder a la instancia.
**src/lib/animations/reveal.tsx** — Componente <Reveal> reutilizable basado en
framer-motion. Props: direction (up/down/left/right/scale), delay, duration, threshold, once.
Usa useInView + motion.div con variants.
**src/lib/animations/magnetic.tsx** — Componente <Magnetic> que envuelve cualquier
elemento y le añade efecto magnético al cursor (como los botones de Dialedweb). Usa
useMotionValue + useSpring de framer-motion.
**src/lib/animations/text-split.tsx** — Componente <TextSplit> que divide texto en
líneas/palabras/caracteres y los anima con stagger usando GSAP SplitText o
implementación manual con spans.
**src/lib/animations/parallax.tsx** — Componente <Parallax> que mueve su hijo a velocidad
relativa al scroll. Basado en GSAP ScrollTrigger con scrub: true.
**src/lib/animations/counter.tsx** — Componente <CountUp> que anima números desde 0
hasta el valor objetivo cuando entra en viewport. Usa framer-motion useInView + animate.
**src/lib/animations/cursor.tsx** — Cursor personalizado global (círculo naranja que sigue el
ratón, se agranda sobre elementos interactivos). Usa motion.div con useMotionValue para
posición x/y.

### 0.3. Cambios en tailwind.config.ts

Añadir al objeto animation/keyframes existente:


- float: keyframe de translación vertical suave (0px → -10px → 0px) en 6s infinite, para
    elementos decorativos flotantes.
- glow-pulse: keyframe que anima box-shadow naranja (opacidad 0.2 → 0.4 → 0.2) en
    3s infinite, para CTAs destacados.
- ticker: keyframe translateX(0) → translateX(-33.33%) linear infinite, para el carrusel
    de logos.
- gradient-shift: keyframe que rota el ángulo de un gradiente background-position de
    0% a 100%, para fondos animados.
- slide-in-blur: keyframe que combina translateY(30px) + blur(8px) + opacity(0) →
    limpio, para reveals premium.

### 0.4. Cambios en globals.css

- Añadir clase .glass: background rgba(255,255,255,0.05), backdrop-filter blur(20px)
    saturate(180%), border 1px solid rgba(255,255,255,0.08). Para cards con efecto
    glassmorphism.
- Añadir clase .glow-orb: position absolute, border-radius 50%, filter blur(var(--blur)),
    pointer-events none. Con variables CSS --size, --color, --blur, --opacity.
- Añadir clase .text-gradient: background linear-gradient, -webkit-background-clip text,
    -webkit-text-fill-color transparent.
- Añadir clase .noise-overlay: background-image url de textura de ruido SVG inline en
    base64, opacity 0.03, para añadir grano sutil a secciones oscuras.

### 0.5. Cambios en layout.tsx (Root Layout)

El layout raíz actualmente monta Header + Footer en TODAS las rutas (incluyendo
dashboard). Esto debe cambiar:

- **Crear src/app/(public)/layout.tsx** — Route group para páginas públicas (landing,
    sobre-nosotros, precios, blog, legal). Este layout monta el nuevo Header animado +
    Footer animado + LenisProvider.
- **Mover las páginas públicas** al route group (public): page.tsx → (public)/page.tsx,
    sobre-nosotros → (public)/sobre-nosotros, etc.
- **El root layout.tsx** queda limpio: solo html/body + ThemeScript + globals.css. Sin
    Header ni Footer.
- **Las rutas protegidas** (dashboard, prospecting, leads, settings) mantienen sus
    layouts existentes con Sidebar.


## 1. Landing Page — página principal (page.tsx)

La landing actual tiene estructura correcta pero carece completamente de animaciones,
efectos visuales y el nivel de pulido de las referencias. El rediseño es integral.

### 1.1. Header / Navbar

**Archivo:** src/components/layout/Header.tsx (reescritura completa)
**Estado actual:** Header estático con sticky top, backdrop-blur básico, sin animación de
entrada ni transición de scroll.
**Objetivo:** Navbar flotante estilo Wope que cambia de transparente a glassmorphism al
hacer scroll, con animación de entrada staggered.
Implementación paso a paso:

- Añadir estado scrolled con hook useScroll() de framer-motion (threshold: 80px).
- La navbar arranca con background: transparent, py-6, sin border.
- Al pasar threshold: transición a clase .glass, py-4, border-bottom 1px solid
    rgba(255,255,255,0.08), con transition duration-500.
- Los links de navegación (Inicio, Sobre Nosotros, Precios, Recursos) aparecen con
    stagger de 0.05s usando <Reveal direction='down' delay={i*0.05}>.
- El botón CTA 'Empezar gratis' tiene efecto glow-pulse permanente en el box-shadow
    + <Magnetic strength={0.15}> para efecto de atracción al cursor.
- En móvil: hamburger menu con AnimatePresence. Panel fullscreen que se desliza
    desde la derecha con motion.div initial={{x:'100%'}} animate={{x:0}}.
- Logo: añadir hover scale(1.02) con transition 300ms y un sutil glow naranja de 0.
    opacidad.

### 1.2. Hero Section

**Estado actual:** Grid 2 columnas con título a la izquierda y mockup wireframe a la derecha.
Sin animaciones. Glow decorativo estático.
**Objetivo:** Hero centrado full-viewport como Wope, con cursor-tracking glow, text splitting
animado, y mockup del dashboard con perspectiva 3D.
Cambios estructurales:

- Cambiar de grid 2 columnas a layout centrado single-column (text-center, max-w-4xl
    mx-auto).
- Fondo: bg-leadby-hero existente + 2 glow orbs naranjas animados con float
    keyframe + dot-grid pattern sutil (radial-gradient en pseudo-element).
- Añadir un div absoluto que sigue el cursor del ratón con un radial-gradient naranja
    (opacidad 0.06). Usar onMouseMove + useMotionValue de framer-motion.
Animaciones del contenido (orden secuencial):
- **Badge 'Nuevo' (delay 0.1s):** <Reveal direction='up' delay={0.1}>. Pill con borde
sutil, fondo glass, icono de rayo + texto. Efecto shimmer en el borde con animación
CSS (background-position animate sobre un linear-gradient diagonal).
- **Headline principal (delay 0.3s):** <TextSplit> que anima palabra por palabra con
stagger 0.03s desde abajo. El texto 'sin ampliar tu equipo' lleva clase .text-gradient
para degradado naranja.


- **Subtítulo (delay 0.5s):** <Reveal direction='up' delay={0.5}>. Texto en gray-400,
    max-w-xl.
- **Botones CTA (delay 0.65s):** Dos botones: primario con gradiente naranja +
    glow-pulse + <Magnetic>, y secundario ghost con borde sutil + hover que rellena con
    rgba(255,117,31,0.1). Ambos con <Reveal direction='up' delay={0.65}>.
- **Mockup Dashboard (delay 0.9s):** <Reveal direction='scale' delay={0.9}>. Card con
    borde sutil, barra de ventana tipo browser (3 dots + URL). Contenido: sidebar con
    items + grid 3 métricas + tabla de leads. Aplicar perspective(1200px) rotateX(2deg)
    con hover que vuelve a rotateX(0). Box-shadow con glow naranja al 8%.

### 1.3. Logo Ticker / Social Proof

**Estado actual:** No existe.
**Crear:** Banda horizontal entre Hero y Features con logos de las tecnologías (HubSpot,
Apollo.io, Google AI, Supabase, Vercel, Resend).

- Duplicar el array 3x y aplicar animación CSS ticker (translateX) infinite linear 25s.
- Borders top/bottom 1px solid rgba(255,255,255,0.06).
- Logos en grayscale con opacity 0.4, hover: opacity 1 + grayscale(0) con transition
    400ms.
- Fade gradients en los bordes izquierdo/derecho (pseudo-elements con gradient de
    fondo a transparente).

### 1.4. Features / Funcionalidades

**Estado actual:** Grid 3 columnas con iconos básicos (Search, Mail, Database). Sin
animaciones, cards planas.
**Objetivo:** Cards estilo Wope con reveal staggered, hover 3D tilt, glow decorativo, y
contenido expandido.
Implementación:

- Encabezado de sección: <Reveal> con tag 'FUNCIONALIDADES' en uppercase
    tracking-widest color naranja + headline con texto gradiente.
- 3 cards, cada una envuelta en <Reveal direction='up' delay={i * 0.15}>:
    ◦ Background: glass card (#141414 con border rgba(255,255,255,0.06)).
    ◦ Hover: border-color transiciona a rgba(255,117,31,0.3) + translateY(-4px) +
       box-shadow 0 20px 40px rgba(255,117,31,0.08).
    ◦ Icono: cuadrado 52px con rounded-xl, fondo naranja al 10%, icono Lucide en
       naranja.
    ◦ Glow decorativo: div absoluto top-right con radial-gradient naranja al 5%, blur 60px.
    ◦ Efecto 3D tilt (opcional avanzado): onMouseMove calcula rotateX/rotateY basado en
       posición del cursor relativa al centro de la card, con useSpring para suavizar.
- Añadir una 4ª feature card que ocupe el ancho completo (col-span-3) mostrando un
    mini-diagrama del flujo: Descubrir → Enriquecer → Aprobar → Enviar. Usar SVG con
    líneas animadas (stroke-dashoffset que se anima al entrar en viewport con GSAP).

### 1.5. Stats / Métricas de Impacto

**Estado actual:** No existe en la landing actual.


**Crear:** Sección de números con CountUp animado, dentro de una card grande con fondo
sutil.

- Card contenedora: border sutil + fondo con linear-gradient diagonal naranja al 3%.
- Grid 4 columnas, cada métrica con <CountUp> que arranca al entrar en viewport:
    ◦ 275M+ contactos en base de datos
    ◦ 73M+ empresas verificadas
    ◦ 34% tasa media de respuesta
    ◦ 10x ROI primer trimestre
- Números en fontSize clamp(36px, 4vw, 56px), font-weight 700, color blanco.
- Separadores verticales entre métricas (div de 1px de ancho, 60% altura, rgba blanco
    al 10%).

### 1.6. Cómo Funciona (Timeline)

**Estado actual:** No existe como sección separada.
**Crear:** Timeline vertical con 4 pasos, línea animada que se dibuja con scroll.

- Línea vertical izquierda: SVG path con stroke-dasharray/stroke-dashoffset animado
    con GSAP ScrollTrigger (scrub: true). Se va dibujando conforme haces scroll.
- Cada paso tiene un círculo numerado (01-04) conectado a la línea. El paso activo
    (primer visible) tiene círculo con gradiente naranja y glow.
- Contenido de cada paso aparece con <Reveal direction='left' delay={i*0.15}>.
- Los 4 pasos: Define tu perfil ideal → IA descubre y enriquece → Revisa y aprueba →
    Email hiperpersonalizado.
- En el paso 4, añadir un mini-preview de email generado por IA (card oscura con
    texto simulado), con efecto de typing animation en el contenido.

### 1.7. Vídeo Corporativo

**Estado actual:** Referenciado en la documentación técnica pero no implementado
visualmente.
**Crear:** Sección con iframe de vídeo embebido (YouTube/Vimeo) con thumbnail custom y
botón de play animado.

- Thumbnail: imagen estática con overlay oscuro al 40%.
- Botón play central: círculo 80px con gradiente naranja + glow-pulse + escala 1 → 1.
    en hover.
- Al hacer click: AnimatePresence transiciona de thumbnail a iframe con layoutId para
    morph suave.
- <Reveal direction='scale'> para la aparición al scroll.

### 1.8. Pricing

**Estado actual:** Página separada /precios con modelo híbrido (Implementación 6-12K +
Licencia 2K/mes + Comisión 1%). Cards estáticas sin animaciones.
**Objetivo:** Incluir resumen de pricing en la landing + mejorar la página /precios con
animaciones.
En la landing:


- Preview compacto con las 3 cards en grid, la central (Licencia) destacada con border
    naranja 2px + badge 'El Core' + glow sutil.
- Cada card con <Reveal direction='up' delay={i*0.12}> y hover translateY(-4px).
- Botón 'Ver detalles' que enlaza a /precios.
En /precios (mejoras):
- Hero de la página con <TextSplit> en el headline.
- Cards con efecto hover: border glow naranja + subtle scale(1.01).
- Toggle mensual/anual (si aplica en futuro).
- FAQ con acordeones animados (AnimatePresence + motion.div height auto).

### 1.9. CTA Final

**Estado actual:** No existe.
**Crear:** Sección de cierre con mensaje impactante + botón CTA principal.

- Card grande con fondo gradiente sutil naranja al 8% + border naranja al 15%.
- Dos glow orbs decorativos animados con float.
- Headline: 'Empieza a vender más. Hoy.' con <TextSplit>.
- Subtítulo: '14 días gratis. Sin tarjeta. Cancela cuando quieras.'
- Botón CTA con <Magnetic> + glow-pulse + icono flecha animada (translateX hover).

### 1.10. Footer

**Archivo:** src/components/layout/Footer.tsx (reescritura)
**Estado actual:** Footer mínimo con logo + 3 links legales + copyright.
**Objetivo:** Footer completo tipo Wope con 4 columnas.

- Grid: Logo+desc (1.5fr) | Producto (1fr) | Empresa (1fr) | Legal (1fr).
- Links con hover color transition a blanco.
- Línea divisoria sutil + fila inferior: copyright izquierda + 'TFG — UCM' derecha.
- <Reveal direction='up'> en el footer completo al entrar en viewport.


## 2. Página Sobre Nosotros (/sobre-nosotros)

**Estado actual:** Página funcional con hero, sección I+D, stack tecnológico, diferenciadores y
banner TFG. Glow estático, sin animaciones.

### 2.1. Hero

- <TextSplit> en el headline con stagger por palabra.
- Glow orbs con animación float en vez de estáticos.
- Tag 'SOBRE NOSOTROS' con <Reveal direction='down' delay={0.1}>.

### 2.2. Sección Investigación

- <Reveal> en cada bloque de texto.
- Añadir imagen/ilustración de la UCM o del proceso de investigación con parallax
    sutil.

### 2.3. Stack Tecnológico

- Convertir la lista actual en un grid de tarjetas tecnológicas (una por servicio: Next.js,
    Supabase, Apollo.io, Gemini, Resend, Vercel).
- Cada card: icono/logo + nombre + descripción corta + <Reveal delay={i*0.1}>.
- Hover: border glow + scale(1.02).
- Alternativamente: Bento grid asimétrico estilo Dialedweb con cards de diferentes
    tamaños.

### 2.4. Diferenciadores

- Los 3 diferenciadores actuales (Coste Cero, Data Moat, Human-in-the-Loop) con
    iconos animados al entrar en viewport.
- Cada icono: SVG con stroke-dashoffset animation para efecto de dibujo.


## 3. Página Blog (/blog)

**Estado actual:** Grid de artículos con cards básicas. Tags de categoría, extracto y link.

### 3.1. Mejoras de animación

- Hero con <TextSplit>.
- Cards de artículos con <Reveal direction='up' delay={i*0.08}> para entrada
    staggered.
- Hover en cards: translateY(-4px) + box-shadow creciente + image zoom (scale 1.
    en la thumbnail con overflow hidden).
- Tags de categoría con colores semánticos (IA = naranja, Ventas = azul, etc.) y hover
    effect.
- CTA inferior ('Agenda una demostración') con <Magnetic> + glow.
- Transición de página: al hacer click en un artículo, la card se expande con layoutId
    (shared layout animation de framer-motion) hacia la página de detalle.


## 4. Páginas de Autenticación (/auth/login y /auth/register)

**Estado actual:** Formularios funcionales con estilos básicos de Tailwind (bg-white,
rounded-lg, shadow). Botón azul genérico (bg-blue-600). Sin animaciones.

### 4.1. Rediseño visual

- Layout split-screen: mitad izquierda con ilustración/branding LeadBy (fondo oscuro +
    glow orbs + texto motivacional), mitad derecha con formulario.
- Formulario con entradas estilizadas: fondo transparente, border sutil, focus ring
    naranja (no azul), transiciones suaves.
- Botón submit: gradiente naranja LeadBy con glow, no bg-blue-600.
- Logo LeadBy arriba del formulario con animación de entrada.

### 4.2. Animaciones

- Lado izquierdo: glow orbs con float + texto que aparece con <TextSplit>.
- Formulario: campos aparecen con stagger <Reveal delay={0.1 * i}> de arriba a
    abajo.
- Botón submit: <Magnetic> + loading state con spinner animado.
- Error messages: AnimatePresence con slide-down + fade.
- Transición login ↔ register: shared layout animation en el contenedor del formulario.


## 5. Dashboard Principal (/dashboard)

**Estado actual:** Métricas en cards bg-white con iconos coloreados. Acciones rápidas en grid
2 columnas. Sin animaciones.

### 5.1. Sidebar mejorada

**Archivo:** src/components/layout/Sidebar.tsx

- Añadir tooltip animado en hover de cada nav item (motion.div con opacity/x
    transition).
- Indicador activo: pill naranja con layoutId para animación de transición entre páginas
    (el highlight se desliza de un item a otro).
- Logo con sutil hover glow.
- Botón logout con confirmación modal animada (AnimatePresence).
- Responsive: en móvil, sidebar se convierte en bottom nav o drawer lateral con gesto
    de swipe.

### 5.2. Métricas

- Cards de métrica con <Reveal direction='up' delay={i*0.1}> para entrada staggered.
- Números con <CountUp> animado desde 0.
- Añadir mini-sparklines (SVG) dentro de cada card mostrando tendencia de los
    últimos 7 días.
- Hover: card eleva con box-shadow creciente.
- Iconos: reemplazar fondos estáticos (bg-blue-50) por gradientes sutiles con el color
    correspondiente.

### 5.3. Acciones rápidas

- Cards interactivas con hover: border-color transiciona al color temático + icono
    scale(1.1) + arrow aparece a la derecha con motion.
- Considerar añadir una tercera acción rápida: 'Ver estadísticas' con enlace a futuro
    módulo de analítica.

### 5.4. Sección de actividad reciente

- Añadir debajo de acciones rápidas: timeline de actividad reciente (leads
    descubiertos, emails enviados, leads aprobados).
- Cada entry con timestamp relativo, icono, y animación de entrada staggered.
- Pull-to-refresh con animación de loading (skeleton shimmer).


## 6. Motor de Prospección (/prospecting)

**Estado actual:** SearchForm.tsx con inputs de sector, localidad, máximo resultados. Botón
azul. Caja informativa estática. Sin animaciones.

### 6.1. Rediseño del formulario

- Campos con entrada staggered <Reveal delay={i*0.1}>.
- Focus state: border naranja + glow sutil + label que se mueve arriba (floating label
    animation).
- Botón 'Buscar leads': gradiente naranja (no bg-blue-600), icono Search animado en
    hover (rotación 15deg).
- Añadir sugerencias rápidas: chips clickables ('Maquinaria industrial', 'Hidráulica',
    'CNC') que pre-rellenan el sector.

### 6.2. Estado de búsqueda

- Loading: reemplazar texto 'Iniciando búsqueda...' por animación de pasos (stepper
    visual animado):
       ◦ Paso 1: 'Contactando Apollo.io...' (icono radar animado)
       ◦ Paso 2: 'Filtrando duplicados...' (icono filtro)
       ◦ Paso 3: 'Enriqueciendo datos...' (icono sparkles)
       ◦ Paso 4: 'Leads listos' (icono check con bounce)
- Cada paso transiciona con AnimatePresence.
- Barra de progreso animada naranja debajo del stepper.

### 6.3. Resultados

- Los resultados (actualmente redirige a /leads) podrían mostrarse in-situ con una lista
    que aparece con stagger.
- Cada lead aparece con <Reveal> + número de lead animado con <CountUp>.


## 7. Bandeja de Leads (/leads)

**Estado actual:** LeadsTable.tsx con filtros por estado (tabs), tabla con columnas
Empresa/Contacto/Estado/Descubierto/Acciones. Básica pero funcional.

### 7.1. Filtros animados

- Tabs de estado con indicador activo que se desliza (layoutId de framer-motion, pill
    naranja que morphea de un tab a otro).
- Contador de resultados con <CountUp> que se actualiza al cambiar filtro.
- Añadir campo de búsqueda con icono Search y clear button animado.

### 7.2. Tabla

- Rows con entrada staggered al cambiar filtro: AnimatePresence + motion.tr con
    opacity/y.
- Hover en rows: background transition + cursor pointer.
- Badges de estado: colores semánticos (pendiente=amber, aprobado=blue,
    enviado=green, rechazado=red) con dot animado (pulse para pendientes).
- Botón 'Aprobar' en cada fila: cambia a loading spinner cuando se hace click, luego
    transiciona el badge con AnimatePresence.
- Empty state: ilustración animada (SVG con líneas que se dibujan) + texto + CTA a
    /prospecting.

### 7.3. Vista detalle (/leads/[leadId])

**Estado actual:** Layout 2 columnas: info empresa/contacto a la izquierda,
EmailApprovalPanel a la derecha.

- Card de empresa: <Reveal direction='left' delay={0.1}>.
- Card de contacto: <Reveal direction='left' delay={0.2}>.
- EmailApprovalPanel: <Reveal direction='right' delay={0.2}>.
- Editor de email: añadir toolbar con formato básico (bold, italic) con botones
    animados.
- Botón 'Enviar': confirmación con modal animada (scale + fade) antes de enviar.
- Post-envío: animación de éxito (confetti particles o check animado con lottie/SVG).


## 8. Configuración (/settings)

**Estado actual:** Cards de info estáticas: Organización, Integración CRM, Preferencias de IA,
Equipo. Read-only.

### 8.1. Mejoras

- Cards con <Reveal direction='up' delay={i*0.1}> staggered.
- Añadir estados hover en cards con border sutil animado.
- Secciones expandibles: click para editar (inline editing) con AnimatePresence para el
    formulario.
- Status indicators animados: punto verde pulsante para CRM conectado, rojo para no
    configurado.
- Botón de guardar cambios: loading spinner + animación de éxito (check que
    aparece).
- Theme toggle mejorado: añadir transición con morph del icono (Sun → Moon con
    motion path).


## 9. Páginas Legales (/legal/terms, /legal/privacy)

**Estado actual:** Contenido en prose con clase de Tailwind Typography. Funcional pero sin
personalidad.

- Hero mínimo con <TextSplit> en el título.
- Contenido con <Reveal> suave en cada sección (h2).
- Table of contents lateral (sticky) en desktop que resalta la sección activa con
    IntersectionObserver.
- Smooth scroll al hacer click en el TOC.


## 10. Transiciones Globales entre Páginas

Para lograr el nivel de pulido de Dialedweb, las transiciones entre páginas son críticas.

### 10.1. Implementación con Next.js + framer-motion

- **Crear src/components/layout/PageTransition.tsx** — Wrapper que usa
    AnimatePresence + motion.div envolviendo {children} en cada layout.
- Efecto de transición: fade-out rápido (200ms) con slight scale(0.98), seguido de
    fade-in del nuevo contenido con slide-up sutil.
- Alternativa premium: page wipe con div absoluto que se desliza cubriendo la pantalla
    en naranja, luego se retira revelando la nueva página.
- Usar usePathname() para detectar cambios de ruta y triggerear la transición.

### 10.2. Loading states

- Skeleton screens animados para todas las páginas que cargan datos (dashboard,
    leads, settings).
- Shimmer effect: background linear-gradient animado que se desplaza
    horizontalmente.
- Los skeletons deben replicar la estructura real de la página (número correcto de
    cards, filas de tabla, etc.).


## 11. Hoja de Ruta de Implementación

Orden sugerido de desarrollo, agrupado en sprints de 1 semana:
**Sprint Alcance Esfuerzo est. Dependencia**
Sprint 1 Fase 0: Instalar deps + crear utilidades de
animación + refactor route groups
3-4 días Ninguna
Sprint 2 Landing: Header + Hero + Logo Ticker 4-5 días Sprint 1
Sprint 3 Landing: Features + Stats + Cómo Funciona 4-5 días Sprint 1
Sprint 4 Landing: Vídeo + Pricing preview + CTA +
Footer
3-4 días Sprint 1
Sprint 5 Auth: Rediseño login/register 2-3 días Sprint 1
Sprint 6 Dashboard: Sidebar + Métricas + Actividad 3-4 días Sprint 1
Sprint 7 Prospección: Formulario + Estados de carga 2-3 días Sprint 6
Sprint 8 Leads: Tabla + Filtros + Vista detalle 4-5 días Sprint 6
Sprint 9 Settings + Legales + Sobre Nosotros + Blog 3-4 días Sprint 1
Sprint 10 Transiciones de página + Skeletons + Polish
final
3-4 días Todo lo
anterior
**Estimación total:** 8-10 semanas de desarrollo a ritmo moderado (1 persona, ~4h/día).


## 12. Inventario de Ficheros a Crear / Modificar

### 12.1. Ficheros nuevos

```
Fichero Propósito
src/lib/animations/scroll-provider.tsx Provider global de Lenis smooth
scroll
src/lib/animations/reveal.tsx Componente <Reveal> reutilizable
src/lib/animations/magnetic.tsx Efecto magnético en botones
src/lib/animations/text-split.tsx Text splitting con animación GSAP
src/lib/animations/parallax.tsx Efecto parallax basado en scroll
src/lib/animations/counter.tsx CountUp animado
src/lib/animations/cursor.tsx Cursor personalizado global
src/components/layout/PageTransition.tsx Wrapper de transiciones entre
páginas
src/app/(public)/layout.tsx Layout para páginas públicas con
Header/Footer
```
### 12.2. Ficheros a modificar significativamente

```
Fichero Cambio principal
src/app/layout.tsx Quitar Header/Footer, dejar solo
html/body + ThemeScript
src/components/layout/Header.tsx Reescritura: glassmorphism +
animaciones
src/components/layout/Footer.tsx Reescritura: 4 columnas +
animaciones
src/app/page.tsx Reescritura total de la landing
src/app/auth/login/page.tsx Split-screen + animaciones + colores
LeadBy
src/app/auth/register/page.tsx Split-screen + animaciones + colores
LeadBy
src/app/dashboard/page.tsx CountUp + Reveal + sparklines +
actividad
src/components/layout/Sidebar.tsx layoutId indicator + tooltips +
responsive
src/components/prospecting/SearchForm.tsx Floating labels + stepper loading +
colores
src/components/leads/LeadsTable.tsx AnimatePresence rows + layoutId
tabs
src/app/leads/[leadId]/page.tsx Reveal animations + success
animation
```

**Fichero Cambio principal**
src/components/leads/EmailApprovalPanel.tsx Modal confirmación + success
feedback
src/app/settings/page.tsx Reveal + inline editing + status
indicators
src/app/sobre-nosotros/page.tsx TextSplit + tech grid + icon draw
animations
src/app/precios/page.tsx TextSplit + card animations + hover
effects
src/app/blog/page.tsx Card stagger + image zoom +
shared layout
tailwind.config.ts Nuevos keyframes/animations
globals.css Clases .glass, .glow-orb,
.text-gradient, .noise-overlay



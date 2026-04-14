# instructions.md — LeadBy

> Instrucciones para el agente de código (GitHub Copilot / Copilot Workspace).  
> Este archivo es la fuente de verdad sobre cómo trabajar en este repositorio.

---

## 1. Descripción del proyecto

LeadBy es una plataforma B2B SaaS que automatiza la prospección comercial mediante IA. Permite a directores comerciales descubrir empresas objetivo, generar correos hiperpersonalizados con IA generativa y sincronizar todo con su CRM.

La arquitectura es **serverless unificada**: toda la lógica reside en API Routes de Next.js, con Supabase como backend (PostgreSQL + Auth + RLS + Vault) y despliegue en Vercel.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Next.js (Pages/App Router) | Next 14.2.x, React 18 |
| Estilos | Tailwind CSS | 3.4.x |
| State/Forms | React Hook Form + Zod + TanStack React Query | RHF 7.x, Zod 4.x, RQ 5.x |
| Iconos | Lucide React | 1.7.x |
| Utils | clsx + tailwind-merge (vía `cn()`) | — |
| BaaS / BD | Supabase (PostgreSQL, Auth, RLS, Vault) | supabase-js 2.x |
| Descubrimiento B2B | Apollo.io API | REST |
| IA Generativa | Google Gemini 2.0 Flash | @google/generative-ai SDK |
| Email transaccional | Resend | REST |
| CRM | HubSpot API v3 | REST |
| Hosting | Vercel | Serverless Functions (10s timeout) |
| Lenguaje | TypeScript estricto | 5.x |

---

## 3. Estructura del repositorio

```
/
├── frontend/                    # Aplicación Next.js (raíz del proyecto Vercel)
│   ├── src/
│   │   ├── app/                 # App Router de Next.js
│   │   │   ├── api/             # API Routes (lógica de negocio server-side)
│   │   │   │   ├── webhooks/    # Endpoints de orquestación (scrape, enrich, send-email)
│   │   │   │   ├── prospecting/ # Endpoints de búsqueda (search, lookalike)
│   │   │   │   └── crm/         # Endpoints de integración CRM (verify)
│   │   │   ├── auth/            # Páginas de login/registro
│   │   │   ├── dashboard/       # Dashboard principal
│   │   │   ├── prospecting/     # UI de prospección
│   │   │   ├── leads/           # Bandeja de leads y detalle
│   │   │   └── settings/        # Configuración del tenant
│   │   ├── components/          # Componentes React reutilizables
│   │   │   ├── leads/           # LeadsTable, EmailApprovalPanel, EmailDrawer...
│   │   │   ├── prospecting/     # SearchForm, ManualSearchForm, LookalikeTrigger...
│   │   │   ├── settings/        # CrmIntegrationForm, AiToneForm, TeamManager...
│   │   │   ├── dashboard/       # DashboardClient, MetricsCards...
│   │   │   └── ui/              # Componentes genéricos (Button, Input, Badge...)
│   │   ├── lib/
│   │   │   ├── supabase/        # Clientes Supabase (server.ts, client.ts, middleware.ts)
│   │   │   ├── services/        # Clientes de APIs externas (apollo.ts, gemini.ts, hubspot.ts, resend.ts, data-moat.ts)
│   │   │   ├── types/           # Tipos TypeScript (app.types.ts, database.types.ts)
│   │   │   └── utils/           # Utilidades (cn.ts, etc.)
│   │   └── middleware.ts        # Middleware de autenticación Next.js
│   ├── public/                  # Assets estáticos
│   ├── package.json
│   └── tsconfig.json
├── database/                    # Scripts SQL (no se ejecutan desde código)
│   ├── 00_extensions.sql        # Extensiones PostgreSQL (uuid-ossp, pgcrypto, vault)
│   ├── 01_schema.sql            # Esquema completo de tablas
│   ├── 02_rls_policies.sql      # Políticas Row Level Security
│   ├── 03_triggers.sql          # Triggers y funciones auxiliares
│   └── 04_vault_helpers.sql     # Funciones RPC para Supabase Vault
├── docs/
│   └── Plan_Desarrollo_MVP.md   # Plan de desarrollo con tareas y progreso
└── .github/
    └── copilot-instructions.md  # (este archivo)
```

---

## 4. Plan de desarrollo

El plan de desarrollo completo está en `docs/Plan_Desarrollo_MVP.md`. Contiene 10 fases con 67 tareas totales, 52 del agente y 15 del usuario.

### Reglas de seguimiento del plan

1. **Antes de empezar cualquier tarea**, lee `docs/Plan_Desarrollo_MVP.md` para saber en qué fase estamos.
2. **Al completar una tarea**, actualiza el plan marcando la tarea como completada con `[x]` en lugar de `[ ]`.
3. **No te saltes fases**. Respeta el orden de dependencias: Fase 0 → 1 → [2,3,4,5 paralelo] → 6 → [7,8,9 paralelo].
4. **Las tareas marcadas como (USUARIO)** no son tu responsabilidad. Si necesitas el resultado de una tarea de usuario (ej. una API key), pregunta al usuario antes de continuar.
5. **No inventes tareas nuevas** a menos que el usuario lo solicite explícitamente.

---

## 5. Convenciones de código

### 5.1. TypeScript

- TypeScript estricto siempre. Sin `any` salvo casos extremos documentados con `// eslint-disable-next-line`.
- Interfaces para objetos de datos, types para uniones y alias.
- Los tipos de la BD se generan con `npx supabase gen types typescript` → `database.types.ts`. No editarlos manualmente.
- Los tipos de la UI están en `app.types.ts` y sí se editan manualmente.

### 5.2. React y Next.js

- Componentes funcionales con hooks. No clases.
- Server Components por defecto. Usar `"use client"` solo cuando se necesiten hooks de estado, efectos o event handlers.
- Los datos se cargan en Server Components (page.tsx) y se pasan como props a Client Components.
- Formularios con React Hook Form + Zod para validación.
- Data fetching del servidor con TanStack React Query solo en Client Components que necesiten revalidación.

### 5.3. Estilos

- Tailwind CSS exclusivamente. No CSS modules, no styled-components, no CSS-in-JS.
- Usar la utilidad `cn()` de `lib/utils/cn.ts` (clsx + tailwind-merge) para clases condicionales.
- Iconos solo de Lucide React.

### 5.4. API Routes

- Toda API Route sigue este patrón de seguridad antes de procesar:
  1. Verificar autenticación: `supabase.auth.getUser()`
  2. Verificar membresía: consultar `miembros_equipo` con `user_id` + `organizacion_id`
  3. Verificar estado del recurso si aplica (ej. estado del lead)
- Usar `createClient()` para operaciones con permisos del usuario.
- Usar `createServiceClient()` (Service Role Key) solo para operaciones que requieran bypass de RLS (ej. escribir en tablas globales, leer Vault). Verificar siempre la sesión del usuario ANTES de usar Service Client.
- Respuestas siempre en JSON con `NextResponse.json()`.
- Errores con códigos HTTP semánticos: 400, 401, 403, 404, 500.

### 5.5. Servicios externos (`lib/services/`)

- Cada integración externa tiene su propio archivo: `apollo.ts`, `gemini.ts`, `hubspot.ts`, `resend.ts`.
- La lógica de caché (Data Moat) va en `data-moat.ts`.
- Todos los clientes deben ser tipados: parámetros de entrada y respuesta con interfaces TypeScript.
- Nunca hardcodear API keys. Siempre `process.env.VARIABLE`.
- Los tokens de CRM del tenant se leen de Supabase Vault, nunca de variables de entorno.

### 5.6. Base de datos y SQL

- Los archivos SQL en `database/` son referencia. Las migraciones se ejecutan manualmente por el usuario en Supabase Dashboard.
- Cuando el agente necesite crear o modificar SQL, debe generar el archivo en `database/` y avisar al usuario para que lo ejecute.
- Respetar los tres dominios del schema: Tenant (organizaciones, miembros, config), Global (Data Moat: empresas, contactos), Transaccional (leads_prospectados).
- El campo `dominio` en `global_empresas` es la clave de deduplicación del Data Moat.

---

## 6. Patrones de arquitectura

### 6.1. Data Moat (Caché global)

Antes de llamar a Apollo.io, siempre consultar primero la caché local:
1. Buscar en `global_empresas` por dominio o criterios similares.
2. Si hay cache hit → usar datos locales (0 créditos de Apollo).
3. Si hay cache miss → llamar a Apollo → guardar resultado en `global_empresas` + `global_contactos`.
4. Crear el lead en `leads_prospectados` vinculando empresa + contacto + organización.

### 6.2. Human-in-the-Loop

Ningún correo se envía sin aprobación humana explícita. El flujo de estados es:
```
nuevo → enriqueciendo → pendiente_aprobacion → aprobado → enviado
                                              → descartado
```
- `nuevo`: lead recién descubierto.
- `enriqueciendo`: Gemini está generando el borrador.
- `pendiente_aprobacion`: borrador listo para revisión del comercial.
- `aprobado`: comercial validó el correo (puede haberlo editado).
- `enviado`: correo enviado vía Resend + registrado en HubSpot.
- `descartado`: comercial rechazó el lead.

### 6.3. Multitenancy

- Toda tabla transaccional tiene `organizacion_id`.
- Las políticas RLS garantizan aislamiento: un usuario solo ve datos de sus organizaciones.
- La función `get_user_organizacion_ids()` es el helper principal para RLS.
- `es_admin_de_org(org_id)` verifica permisos de administrador.

### 6.4. Gestión de secretos

- Secretos de la plataforma (Apollo, Gemini, Resend) → variables de entorno (`.env.local` en dev, Vercel en prod).
- Secretos del tenant (token HubSpot) → Supabase Vault. La tabla `configuracion_tenant` solo almacena el UUID de referencia al secreto, nunca el token en texto plano.
- Funciones RPC: `guardar_hubspot_token()`, `obtener_hubspot_token()`, `rotar_hubspot_token()`.

---

## 7. Restricciones del MVP

- **Máximo 10 empresas por búsqueda.** Parámetro `per_page=10` en Apollo. No se necesita paginación, batching ni procesamiento en background.
- **Sin Edge Functions de Supabase.** Todo cabe en los 10 segundos de Vercel.
- **Sin polling ni realtime.** Las búsquedas son síncronas: la API Route responde directamente con los resultados.
- **HubSpot parte vacío.** No se necesita lógica compleja de deduplicación contra datos preexistentes.
- **Un solo tenant activo** (el del desarrollador).
- **Sin tests automatizados.** Es un MVP de validación.

---

## 8. Buenas prácticas obligatorias

### Seguridad
- Nunca exponer la Service Role Key al cliente. Solo usarla en API Routes server-side.
- Nunca enviar tokens o API keys en respuestas al frontend.
- Siempre validar autenticación + membresía antes de cualquier operación en API Routes.
- Usar `getUser()` (no `getSession()`) para validar JWT contra Supabase servers.

### Código limpio
- Nombres de variables y funciones en camelCase.
- Nombres de tablas y columnas SQL en snake_case.
- Comentarios en español para documentar lógica de negocio.
- JSDoc en funciones exportadas de `lib/services/`.
- Un archivo, una responsabilidad. No mezclar lógica de Apollo con lógica de Gemini.
- DRY: si la misma lógica de validación se repite en varias API Routes, extraerla a un helper en `lib/utils/`.

### Rendimiento
- No hacer llamadas a APIs externas innecesarias. Siempre verificar la caché primero (Data Moat).
- En componentes React, evitar re-renders innecesarios: memoizar con `useMemo`/`useCallback` solo cuando haya un problema medible, no preventivamente.

### Commits
- Mensajes de commit descriptivos en español.
- Formato: `tipo(alcance): descripción` — ej: `feat(apollo): implementar cliente tipado con cache`, `fix(leads): corregir estado tras aprobación`, `refactor(api): extraer validación de membresía a helper`.
- Un commit por tarea completada del plan cuando sea posible.

---

## 9. Variables de entorno

Referencia completa en `.env.example`. Las variables necesarias son:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Apollo.io
APOLLO_API_KEY=

# Google Gemini
GEMINI_API_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Nota:** Los tokens de HubSpot NO van en variables de entorno. Se almacenan en Supabase Vault por tenant.

---

## 10. Cómo empezar a trabajar

1. Lee `docs/Plan_Desarrollo_MVP.md` para saber la fase y tarea actual.
2. Identifica la siguiente tarea del agente (las que NO tienen etiqueta `(USUARIO)`).
3. Lee los archivos relevantes del repositorio antes de modificar nada.
4. Implementa la tarea siguiendo las convenciones de este documento.
5. Verifica que el código compila sin errores: `cd frontend && npm run build`.
6. Actualiza `docs/Plan_Desarrollo_MVP.md` marcando la tarea como completada.
7. Haz commit con mensaje descriptivo.
8. Si la siguiente tarea es de `(USUARIO)`, detente y avisa al usuario.
# Plan de Desarrollo MVP — LeadBy

> **Proyecto:** Transformación de equipos comerciales mediante automatización e IA  
> **Autor:** Antonio López Belinchón  
> **Última actualización:** 2026-04-14  
> **Contexto MVP:** Uso personal, máximo 10 empresas por búsqueda, BD vacía, HubSpot nuevo desde cero.

---

## Convención de roles

- **(USUARIO)** → Tareas manuales fuera del código: crear recursos en Supabase, obtener API keys, configurar servicios externos, configurar Vercel, etc.
- Sin etiqueta → Tareas del **agente**: creación de código, refactoring, depuración, todo lo ejecutable desde VS Code.

---

## FASE 0: Limpieza y preparación del repositorio

| # | Tarea |
|---|-------|
| 0.1 | [x] Eliminar carpeta `scraper/` (Python, Docker, venv) |
| 0.2 | [x] Eliminar `render.yaml` de la raíz |
| 0.3 | [x] Eliminar todas las referencias a n8n en API Routes (`N8N_WEBHOOK_*`) |
| 0.4 | [x] Crear estructura `frontend/src/lib/services/` para clientes de APIs externas |
| 0.5 | [x] Crear archivo `.env.example` documentando todas las variables de entorno necesarias |
| 0.6 | [x] Actualizar `frontend/package.json` con dependencias nuevas (Google Generative AI SDK, Resend, HubSpot client) |

**Tareas: 6** · Usuario: 0 · Agente: 6

---

## FASE 1: Actualización del esquema de base de datos

| # | Tarea |
|---|-------|
| 1.1 | [x] Definir `global_empresas` con fuente final (`apollo`/`manual`) y campos Apollo clave (apollo_org_id, linkedin_url, tecnologias, ingresos_rango) |
| 1.2 | [x] Actualizar tabla `global_contactos`: añadir campos Apollo (apollo_contact_id, email_status, seniority, departamento) |
| 1.3 | [x] Definir tabla final `trabajos_busqueda` con tipos válidos `apollo_search` y `apollo_lookalike` |
| 1.4 | [x] Definir `leads_prospectados` con `trabajo_busqueda_id`, `borrador_email` y estados finales del flujo Human-in-the-Loop |
| 1.5 | [x] Consolidar cambios SQL directamente en los archivos base de `database/` (sin archivo de migración separado) |
| 1.6 | [x] **(USUARIO)** Ejecutar el schema SQL actualizado en el SQL Editor de Supabase Dashboard |
| 1.7 | [x] Actualizar `frontend/src/lib/types/app.types.ts` con los nuevos tipos TypeScript |

**Tareas: 7** · Usuario: 1 · Agente: 6

---

## FASE 2: Mock inteligente de descubrimiento B2B (Gemini)

Apollo.io fue descartado: todos los endpoints de búsqueda requieren plan de pago ($49/mes mínimo).
Decisión: reemplazar con mock dinámico basado en Gemini que genera datos ficticios pero realistas.
El flujo de cara al usuario es idéntico. En producción real, se sustituiría apollo-mock.ts por apollo.ts con credenciales de pago.

| # | Tarea |
|---|-------|
| 2.1 | [x] ~~(USUARIO) Crear cuenta en Apollo.io~~ — DESCARTADO |
| 2.2 | [x] ~~(USUARIO) Añadir APOLLO_API_KEY~~ — DESCARTADO |
| 2.3 | [x] Eliminar apollo.ts y todas sus referencias |
| 2.4 | [x] Crear apollo-mock.ts: genera personas+empresas via Gemini según sector/ubicación/tamaño |
| 2.5 | [x] Actualizar prospecting.ts: importar apollo-mock en lugar de apollo |
| 2.6 | [x] Restaurar SearchForm.tsx: campos sector + ubicación + tamaño (flujo original) |
| 2.7 | [x] Actualizar route.ts de prospecting/search: nuevos parámetros |

**Tareas: 7** · Usuario: 2 · Agente: 5

---

## FASE 3: Integración con Google Gemini (IA Generativa)

| # | Tarea |
|---|-------|
| 3.1 | [x] **(USUARIO)** Crear proyecto en Google Cloud Console, activar Gemini API y obtener API Key |
| 3.2 | [x] **(USUARIO)** Añadir `GEMINI_API_KEY` al archivo `.env.local` |
| 3.3 | [x] Crear `lib/services/gemini.ts`: cliente tipado para Google Gemini 2.0 Flash (15 RPM free tier) |
| 3.4 | [x] Implementar prompt de Lookalike: recibir historial CRM, generar 5 términos de búsqueda en JSON |
| 3.5 | [x] Reescribir `api/prospecting/lookalike/route.ts`: extraer clientes ganados de HubSpot → Gemini → Apollo → leads |
| 3.6 | [x] Implementar prompt de hiperpersonalización de emails: contexto prospecto + web empresa + tono tenant → correo máx. 150 palabras |
| 3.7 | [x] Reescribir `api/webhooks/enrich/route.ts`: eliminar n8n, implementar flujo Gemini directo con contexto completo |
| 3.8 | [x] Integrar preferencias de IA del tenant (`configuracion_tenant.preferencias_ia`) en los prompts |

**Tareas: 8** · Usuario: 2 · Agente: 6

---

## FASE 4: Integración con HubSpot CRM

HubSpot parte vacío, instancia nueva desde cero.

| # | Tarea |
|---|-------|
| 4.1 | [x] **(USUARIO)** Crear cuenta gratuita en HubSpot y crear una Private App con scopes: crm.objects.contacts, crm.objects.companies, crm.objects.deals, timeline |
| 4.2 | [x] **(USUARIO)** Copiar el Access Token de la Private App de HubSpot |
| 4.3 | [x] **(USUARIO)** Almacenar el token en Supabase Vault ejecutando la función `guardar_hubspot_token()` desde el SQL Editor de Supabase |
| 4.4 | [x] Crear `lib/services/hubspot.ts`: cliente tipado para HubSpot API v3 (Companies, Contacts, Deals, Engagements) |
| 4.5 | [x] Implementar mapeo de campos: global_empresas → HubSpot Company, global_contactos → HubSpot Contact |
| 4.6 | [x] Implementar creación de Company + Contact al aprobar lead |
| 4.7 | [x] Implementar creación de Deal en etapa inicial del pipeline al aprobar lead |
| 4.8 | [x] Implementar registro de email en Timeline del contacto (Engagements API) tras envío |
| 4.9 | [x] Reescribir `api/crm/verify/route.ts`: verificar token HubSpot via Vault y testear conexión |
| 4.10 | [x] Implementar descifrado seguro de tokens desde Supabase Vault en las API Routes |

**Tareas: 10** · Usuario: 3 · Agente: 7

---

## FASE 5: Integración con Resend (Email Transaccional)

| # | Tarea |
|---|-------|
| 5.1 | [x] **(USUARIO)** Crear cuenta en Resend y obtener API Key |
| 5.2 | [x] **(USUARIO)** Configurar dominio de envío en Resend: añadir registros DNS (SPF, DKIM, DMARC) en el proveedor de dominio |
| 5.3 | [x] **(USUARIO)** Añadir `RESEND_API_KEY` al archivo `.env.local` |
| 5.4 | [x] Crear `lib/services/resend.ts`: cliente tipado para Resend API |
| 5.5 | [x] Reescribir `api/webhooks/send-email/route.ts`: eliminar n8n, implementar flujo Resend + HubSpot directo |
| 5.6 | [x] Implementar plantilla HTML base para los correos (responsive, con enlace opt-out RGPD) |
| 5.7 | [x] Implementar lógica: enviar vía Resend → registrar en HubSpot → actualizar estado a 'enviado' |

**Tareas: 7** · Usuario: 3 · Agente: 4

---

## FASE 6: Frontend SaaS — Conexión con datos reales

| # | Tarea |
|---|-------|
| 6.1 | Actualizar `ManualSearchForm.tsx` y `SearchForm.tsx`: conectar con nueva API de prospecting (respuesta síncrona) |
| 6.2 | Actualizar `LookalikeTrigger.tsx`: conectar con API de lookalike |
| 6.3 | Actualizar `LeadsTable.tsx` y `LeadsClient.tsx`: reflejar nuevos campos de Apollo (linkedin, seniority) |
| 6.4 | Actualizar `EmailDrawer.tsx` y `EmailApprovalPanel.tsx`: flujo completo de revisión/edición/envío del borrador Gemini |
| 6.5 | Actualizar `DashboardClient.tsx`: integrar métricas reales de HubSpot |
| 6.6 | Actualizar `CrmIntegrationForm.tsx`: formulario para guardar token HubSpot en Vault |
| 6.7 | Actualizar `AiToneForm.tsx`: guardar preferencias de IA en configuracion_tenant |
| 6.8 | Actualizar `SettingsTabs.tsx` y `TeamManager.tsx`: verificar funcionalidad de gestión de equipo |
| 6.9 | Actualizar página de detalle de lead (`leads/[leadId]`) con datos Apollo enriquecidos |

**Tareas: 9** · Usuario: 0 · Agente: 9

---

## FASE 7: Landing Page y Web Pública

| # | Tarea |
|---|-------|
| 7.1 | Revisar y pulir Hero Section con vídeo corporativo embebido |
| 7.2 | Verificar página de Pricing con planes de suscripción |
| 7.3 | Revisar blog: verificar pre-renderizado SSG de artículos Markdown |
| 7.4 | Verificar páginas legales (RGPD, Términos) con contenido completo |
| 7.5 | Optimizar Core Web Vitals y meta tags SEO |

**Tareas: 5** · Usuario: 0 · Agente: 5

---

## FASE 8: Seguridad, RGPD y auditorías

| # | Tarea |
|---|-------|
| 8.1 | Auditar políticas RLS: verificar aislamiento total entre tenants |
| 8.2 | Verificar que los correos generados incluyen enlace opt-out funcional |
| 8.3 | Verificar cifrado de tokens en Vault y que ningún secreto viaja en texto plano |
| 8.4 | Verificar que el flujo Human-in-the-Loop impide envíos automáticos sin aprobación |
| 8.5 | Revisar variables de entorno: ninguna API key hardcodeada en el código |

**Tareas: 5** · Usuario: 0 · Agente: 5

---

## FASE 9: Despliegue en Vercel y DevOps

| # | Tarea |
|---|-------|
| 9.1 | **(USUARIO)** Crear proyecto en Vercel y vincularlo al repositorio GitHub |
| 9.2 | **(USUARIO)** Configurar variables de entorno en el panel de Vercel (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, RESEND_API_KEY) |
| 9.3 | **(USUARIO)** Verificar que el despliegue automático funciona en cada push a main |
| 9.4 | **(USUARIO)** Test end-to-end manual en producción: registro → búsqueda → aprobación → envío |

**Tareas: 4** · Usuario: 4 · Agente: 0

Nota: GEMINI_API_KEY ahora se usa tanto para la generación de emails como para el mock de prospección B2B.

---

## Progreso Global

| Fase | Descripción | Tareas | Usuario | Agente |
|------|-------------|--------|---------|--------|
| 0 | Limpieza y preparación | 6 | 0 | 6 |
| 1 | Schema base de datos | 7 | 1 | 6 |
| 2 | Mock Gemini B2B | 7 | 2 | 5 |
| 3 | Google Gemini | 8 | 2 | 6 |
| 4 | HubSpot CRM | 10 | 3 | 7 |
| 5 | Resend Email | 7 | 3 | 4 |
| 6 | Frontend SaaS | 9 | 0 | 9 |
| 7 | Landing Page | 5 | 0 | 5 |
| 8 | Seguridad y RGPD | 5 | 0 | 5 |
| 9 | Despliegue Vercel | 4 | 4 | 0 |
| **TOTAL** | | **68** | **15** | **53** |

---

## Grafo de dependencias

```
Fase 0 → Fase 1 → [Fase 2, Fase 3, Fase 4, Fase 5] (paralelo)
                           |         |         |         |
                           +----+----+----+----+
                                |
                             Fase 6
                                |
                    [Fase 7, Fase 8, Fase 9] (paralelo)
```

---

## Resumen de tareas USUARIO por fase

El usuario necesitará intervenir en estos momentos clave:

1. **Fase 1** → Ejecutar el schema SQL actualizado en Supabase Dashboard
2. **Fase 2** → Sin acción de usuario: Apollo fue descartado y sustituido por mock Gemini
3. **Fase 3** → Crear proyecto Google Cloud + activar Gemini API + pegar API Key en `.env.local`
4. **Fase 4** → Crear cuenta HubSpot + Private App + guardar token en Vault via SQL Editor
5. **Fase 5** → Crear cuenta Resend + configurar DNS (SPF/DKIM/DMARC) + pegar API Key en `.env.local`
6. **Fase 9** → Crear proyecto Vercel + configurar env vars + test final en producción

---

## Decisiones clave del MVP

- **Sin Edge Functions:** 10 empresas por búsqueda = 1 llamada al mock Gemini = cabe en 10s de Vercel.
- **Sin polling/realtime:** La búsqueda es síncrona. El frontend espera la respuesta directa de la API Route.
- **Sin anti-duplicados en HubSpot:** La instancia parte vacía.
- **Sin tests automatizados:** MVP de validación personal.
- **Apollo.io reemplazado por mock Gemini:** La API de búsqueda de Apollo requiere plan de pago. Para el MVP se usa un mock dinámico (apollo-mock.ts) que llama a Gemini para generar datos B2B realistas. La interfaz de tipos es idéntica, por lo que migrar a Apollo real en producción solo requiere cambiar el import en prospecting.ts.
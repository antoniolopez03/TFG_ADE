import { createServiceClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const EMPRESA_SELECT =
  "id, nombre, dominio, apollo_org_id, linkedin_url, sector, empleados_rango, ingresos_rango, tecnologias, descripcion, ciudad, provincia, pais, telefono, fuente, ultima_verificacion, created_at, updated_at";

const CONTACTO_SELECT =
  "id, empresa_id, apollo_contact_id, nombre, apellidos, cargo, seniority, departamento, email, email_status, linkedin_url, telefono, fuente, created_at, updated_at";

interface DbRecord {
  [key: string]: unknown;
}

export interface EmpresaGlobal {
  id: string;
  nombre: string;
  dominio: string | null;
  apollo_org_id: string | null;
  linkedin_url: string | null;
  sector: string | null;
  empleados_rango: string | null;
  ingresos_rango: string | null;
  tecnologias: string[];
  descripcion: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais: string;
  telefono: string | null;
  fuente: "apollo" | "manual";
  ultima_verificacion: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactoGlobal {
  id: string;
  empresa_id: string;
  apollo_contact_id: string | null;
  nombre: string | null;
  apellidos: string | null;
  cargo: string | null;
  seniority: string | null;
  departamento: string | null;
  email: string | null;
  email_status: string | null;
  linkedin_url: string | null;
  telefono: string | null;
  fuente: "apollo" | "manual";
  created_at: string;
  updated_at: string;
}

export interface EmpresaCacheLookup {
  dominio?: string | null;
  apolloOrgId?: string | null;
  nombre?: string | null;
}

export interface ContactoCacheLookup {
  empresaId?: string;
  apolloContactId?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
}

export interface UpsertEmpresaInput {
  nombre?: string | null;
  dominio?: string | null;
  apolloOrgId?: string | null;
  linkedinUrl?: string | null;
  sector?: string | null;
  empleadosRango?: string | null;
  ingresosRango?: string | null;
  tecnologias?: string[] | null;
  descripcion?: string | null;
  ciudad?: string | null;
  provincia?: string | null;
  pais?: string | null;
  telefono?: string | null;
  fuente?: "apollo" | "manual";
  ultimaVerificacion?: string | null;
}

export interface UpsertContactoInput {
  empresaId: string;
  apolloContactId?: string | null;
  nombre?: string | null;
  apellidos?: string | null;
  cargo?: string | null;
  seniority?: string | null;
  departamento?: string | null;
  email?: string | null;
  emailStatus?: string | null;
  linkedinUrl?: string | null;
  telefono?: string | null;
  fuente?: "apollo" | "manual";
}

export interface DataMoatLookupResult<T> {
  hit: boolean;
  data: T | null;
}

export function normalizeDomain(domain?: string | null): string | null {
  if (!domain || typeof domain !== "string") {
    return null;
  }

  const trimmed = domain.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const [host] = withoutProtocol.split("/");

  return host || null;
}

function normalizeEmail(email?: string | null): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized || null;
}

function normalizeText(value?: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeTecnologias(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function mapEmpresa(row: DbRecord): EmpresaGlobal {
  return {
    id: String(row.id),
    nombre: String(row.nombre ?? "Empresa sin nombre"),
    dominio: normalizeDomain(row.dominio as string | null),
    apollo_org_id: normalizeText(row.apollo_org_id as string | null),
    linkedin_url: normalizeText(row.linkedin_url as string | null),
    sector: normalizeText(row.sector as string | null),
    empleados_rango: normalizeText(row.empleados_rango as string | null),
    ingresos_rango: normalizeText(row.ingresos_rango as string | null),
    tecnologias: normalizeTecnologias(row.tecnologias),
    descripcion: normalizeText(row.descripcion as string | null),
    ciudad: normalizeText(row.ciudad as string | null),
    provincia: normalizeText(row.provincia as string | null),
    pais: String(row.pais ?? "ES"),
    telefono: normalizeText(row.telefono as string | null),
    fuente: row.fuente === "manual" ? "manual" : "apollo",
    ultima_verificacion: normalizeText(row.ultima_verificacion as string | null),
    created_at: String(row.created_at ?? new Date(0).toISOString()),
    updated_at: String(row.updated_at ?? new Date(0).toISOString()),
  };
}

function mapContacto(row: DbRecord): ContactoGlobal {
  return {
    id: String(row.id),
    empresa_id: String(row.empresa_id),
    apollo_contact_id: normalizeText(row.apollo_contact_id as string | null),
    nombre: normalizeText(row.nombre as string | null),
    apellidos: normalizeText(row.apellidos as string | null),
    cargo: normalizeText(row.cargo as string | null),
    seniority: normalizeText(row.seniority as string | null),
    departamento: normalizeText(row.departamento as string | null),
    email: normalizeEmail(row.email as string | null),
    email_status: normalizeText(row.email_status as string | null),
    linkedin_url: normalizeText(row.linkedin_url as string | null),
    telefono: normalizeText(row.telefono as string | null),
    fuente: row.fuente === "manual" ? "manual" : "apollo",
    created_at: String(row.created_at ?? new Date(0).toISOString()),
    updated_at: String(row.updated_at ?? new Date(0).toISOString()),
  };
}

/**
 * Consulta empresas en caché global por dominio o id de Apollo.
 */
export async function lookupEmpresaEnCache(
  supabase: SupabaseClient,
  criteria: EmpresaCacheLookup
): Promise<DataMoatLookupResult<EmpresaGlobal>> {
  const dominio = normalizeDomain(criteria.dominio);
  if (dominio) {
    const { data, error } = await supabase
      .from("global_empresas")
      .select(EMPRESA_SELECT)
      .ilike("dominio", dominio)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Error consultando cache de empresas por dominio: ${error.message}`);
    }

    if (data) {
      return { hit: true, data: mapEmpresa(data as DbRecord) };
    }
  }

  const apolloOrgId = normalizeText(criteria.apolloOrgId);
  if (apolloOrgId) {
    const { data, error } = await supabase
      .from("global_empresas")
      .select(EMPRESA_SELECT)
      .eq("apollo_org_id", apolloOrgId)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Error consultando cache de empresas por apollo_org_id: ${error.message}`);
    }

    if (data) {
      return { hit: true, data: mapEmpresa(data as DbRecord) };
    }
  }

  return { hit: false, data: null };
}

/**
 * Busca un contacto cacheado por id Apollo, email o LinkedIn.
 */
export async function lookupContactoEnCache(
  supabase: SupabaseClient,
  criteria: ContactoCacheLookup
): Promise<DataMoatLookupResult<ContactoGlobal>> {
  const apolloContactId = normalizeText(criteria.apolloContactId);
  if (apolloContactId) {
    let query = supabase
      .from("global_contactos")
      .select(CONTACTO_SELECT)
      .eq("apollo_contact_id", apolloContactId)
      .limit(1);

    if (criteria.empresaId) {
      query = query.eq("empresa_id", criteria.empresaId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Error consultando cache de contactos por apollo_contact_id: ${error.message}`);
    }

    if (data) {
      return { hit: true, data: mapContacto(data as DbRecord) };
    }
  }

  const email = normalizeEmail(criteria.email);
  if (email) {
    let query = supabase
      .from("global_contactos")
      .select(CONTACTO_SELECT)
      .ilike("email", email)
      .limit(1);

    if (criteria.empresaId) {
      query = query.eq("empresa_id", criteria.empresaId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Error consultando cache de contactos por email: ${error.message}`);
    }

    if (data) {
      return { hit: true, data: mapContacto(data as DbRecord) };
    }
  }

  const linkedinUrl = normalizeText(criteria.linkedinUrl);
  if (linkedinUrl) {
    let query = supabase
      .from("global_contactos")
      .select(CONTACTO_SELECT)
      .eq("linkedin_url", linkedinUrl)
      .limit(1);

    if (criteria.empresaId) {
      query = query.eq("empresa_id", criteria.empresaId);
    }

    const { data, error } = await query.maybeSingle();
    if (error) {
      throw new Error(`Error consultando cache de contactos por linkedin_url: ${error.message}`);
    }

    if (data) {
      return { hit: true, data: mapContacto(data as DbRecord) };
    }
  }

  return { hit: false, data: null };
}

/**
 * Devuelve un contacto ya cacheado para una empresa concreta.
 */
export async function lookupPrimerContactoEmpresaEnCache(
  supabase: SupabaseClient,
  empresaId: string
): Promise<ContactoGlobal | null> {
  const { data, error } = await supabase
    .from("global_contactos")
    .select(CONTACTO_SELECT)
    .eq("empresa_id", empresaId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Error consultando contactos por empresa: ${error.message}`);
  }

  return data ? mapContacto(data as DbRecord) : null;
}

/**
 * Inserta o actualiza una empresa en el Data Moat global.
 */
export async function upsertEmpresaEnCache(
  input: UpsertEmpresaInput
): Promise<EmpresaGlobal> {
  const serviceClient = createServiceClient();
  const dominio = normalizeDomain(input.dominio);
  const apolloOrgId = normalizeText(input.apolloOrgId);

  const existing = await lookupEmpresaEnCache(serviceClient, {
    dominio,
    apolloOrgId,
  });

  if (existing.hit && existing.data) {
    const current = existing.data;
    const { data, error } = await serviceClient
      .from("global_empresas")
      .update({
        nombre: normalizeText(input.nombre) ?? current.nombre,
        dominio: dominio ?? current.dominio,
        apollo_org_id: apolloOrgId ?? current.apollo_org_id,
        linkedin_url: normalizeText(input.linkedinUrl) ?? current.linkedin_url,
        sector: normalizeText(input.sector) ?? current.sector,
        empleados_rango: normalizeText(input.empleadosRango) ?? current.empleados_rango,
        ingresos_rango: normalizeText(input.ingresosRango) ?? current.ingresos_rango,
        tecnologias: input.tecnologias ?? current.tecnologias,
        descripcion: normalizeText(input.descripcion) ?? current.descripcion,
        ciudad: normalizeText(input.ciudad) ?? current.ciudad,
        provincia: normalizeText(input.provincia) ?? current.provincia,
        pais: normalizeText(input.pais) ?? current.pais,
        telefono: normalizeText(input.telefono) ?? current.telefono,
        fuente: input.fuente ?? current.fuente,
        ultima_verificacion:
          input.ultimaVerificacion ?? new Date().toISOString(),
      })
      .eq("id", current.id)
      .select(EMPRESA_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Error actualizando empresa en Data Moat: ${error?.message ?? "sin datos"}`);
    }

    return mapEmpresa(data as DbRecord);
  }

  const { data, error } = await serviceClient
    .from("global_empresas")
    .insert({
      nombre: normalizeText(input.nombre) ?? dominio ?? "Empresa sin nombre",
      dominio,
      apollo_org_id: apolloOrgId,
      linkedin_url: normalizeText(input.linkedinUrl),
      sector: normalizeText(input.sector),
      empleados_rango: normalizeText(input.empleadosRango),
      ingresos_rango: normalizeText(input.ingresosRango),
      tecnologias: input.tecnologias ?? [],
      descripcion: normalizeText(input.descripcion),
      ciudad: normalizeText(input.ciudad),
      provincia: normalizeText(input.provincia),
      pais: normalizeText(input.pais) ?? "ES",
      telefono: normalizeText(input.telefono),
      fuente: input.fuente ?? "apollo",
      ultima_verificacion: input.ultimaVerificacion ?? new Date().toISOString(),
    })
    .select(EMPRESA_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Error insertando empresa en Data Moat: ${error?.message ?? "sin datos"}`);
  }

  return mapEmpresa(data as DbRecord);
}

/**
 * Inserta o actualiza un contacto en el Data Moat global.
 */
export async function upsertContactoEnCache(
  input: UpsertContactoInput
): Promise<ContactoGlobal> {
  const serviceClient = createServiceClient();
  const existing = await lookupContactoEnCache(serviceClient, {
    empresaId: input.empresaId,
    apolloContactId: input.apolloContactId,
    email: input.email,
    linkedinUrl: input.linkedinUrl,
  });

  if (existing.hit && existing.data) {
    const current = existing.data;
    const { data, error } = await serviceClient
      .from("global_contactos")
      .update({
        empresa_id: input.empresaId,
        apollo_contact_id: normalizeText(input.apolloContactId) ?? current.apollo_contact_id,
        nombre: normalizeText(input.nombre) ?? current.nombre,
        apellidos: normalizeText(input.apellidos) ?? current.apellidos,
        cargo: normalizeText(input.cargo) ?? current.cargo,
        seniority: normalizeText(input.seniority) ?? current.seniority,
        departamento: normalizeText(input.departamento) ?? current.departamento,
        email: normalizeEmail(input.email) ?? current.email,
        email_status: normalizeText(input.emailStatus) ?? current.email_status,
        linkedin_url: normalizeText(input.linkedinUrl) ?? current.linkedin_url,
        telefono: normalizeText(input.telefono) ?? current.telefono,
        fuente: input.fuente ?? current.fuente,
      })
      .eq("id", current.id)
      .select(CONTACTO_SELECT)
      .single();

    if (error || !data) {
      throw new Error(`Error actualizando contacto en Data Moat: ${error?.message ?? "sin datos"}`);
    }

    return mapContacto(data as DbRecord);
  }

  const { data, error } = await serviceClient
    .from("global_contactos")
    .insert({
      empresa_id: input.empresaId,
      apollo_contact_id: normalizeText(input.apolloContactId),
      nombre: normalizeText(input.nombre),
      apellidos: normalizeText(input.apellidos),
      cargo: normalizeText(input.cargo),
      seniority: normalizeText(input.seniority),
      departamento: normalizeText(input.departamento),
      email: normalizeEmail(input.email),
      email_status: normalizeText(input.emailStatus),
      linkedin_url: normalizeText(input.linkedinUrl),
      telefono: normalizeText(input.telefono),
      fuente: input.fuente ?? "apollo",
    })
    .select(CONTACTO_SELECT)
    .single();

  if (error || !data) {
    throw new Error(`Error insertando contacto en Data Moat: ${error?.message ?? "sin datos"}`);
  }

  return mapContacto(data as DbRecord);
}

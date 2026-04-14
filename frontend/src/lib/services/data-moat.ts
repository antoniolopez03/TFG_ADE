export interface EmpresaCacheLookup {
  dominio?: string | null;
  nombre?: string | null;
}

export interface ContactoCacheLookup {
  email?: string | null;
  linkedinUrl?: string | null;
}

export interface DataMoatLookupResult<T> {
  hit: boolean;
  data: T | null;
}

/**
 * Punto de entrada para consultas de cache global (Data Moat).
 * Se completara en Fase 2 con lectura/escritura en tablas globales.
 */
export async function lookupEmpresaEnCache(
  _criteria: EmpresaCacheLookup
): Promise<DataMoatLookupResult<unknown>> {
  return { hit: false, data: null };
}

/**
 * Punto de entrada para busqueda de contactos en cache global.
 */
export async function lookupContactoEnCache(
  _criteria: ContactoCacheLookup
): Promise<DataMoatLookupResult<unknown>> {
  return { hit: false, data: null };
}

import { Client as HubSpotClient } from "@hubspot/api-client";

export interface HubSpotClientOptions {
  accessToken: string;
}

/**
 * Construye un cliente tipado de HubSpot API v3.
 * El token debe obtenerse desde Supabase Vault por tenant.
 */
export function createHubSpotClient(options: HubSpotClientOptions): HubSpotClient {
  if (!options.accessToken) {
    throw new Error("HubSpot access token no configurado");
  }

  return new HubSpotClient({ accessToken: options.accessToken });
}

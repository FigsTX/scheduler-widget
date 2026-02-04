import { Client } from "@microsoft/microsoft-graph-client";
import { getAccessToken } from "./tokenStore";

/**
 * Create a Graph client using a specific access token.
 */
export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

/**
 * Get a Graph client using the stored admin token.
 * Used by widget API routes where no user session exists.
 * Automatically refreshes expired tokens.
 */
export async function getWidgetGraphClient(): Promise<Client> {
  const accessToken = await getAccessToken();
  return getGraphClient(accessToken);
}

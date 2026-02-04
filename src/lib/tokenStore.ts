import fs from "fs";
import path from "path";

const TOKEN_FILE = path.join(process.cwd(), ".tokens.json");

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in seconds
}

export function saveTokens(tokens: StoredTokens): void {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8");
}

export function loadTokens(): StoredTokens | null {
  try {
    if (!fs.existsSync(TOKEN_FILE)) return null;
    const raw = fs.readFileSync(TOKEN_FILE, "utf-8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

/**
 * Refresh the access token using the stored refresh token.
 * Returns a fresh access token and updates the stored tokens.
 */
async function refreshAccessToken(
  refreshToken: string
): Promise<StoredTokens> {
  const params = new URLSearchParams({
    client_id: process.env.AZURE_AD_CLIENT_ID!,
    client_secret: process.env.AZURE_AD_CLIENT_SECRET!,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    scope:
      "openid profile email User.Read Calendars.ReadWrite Sites.Read.All offline_access",
  });

  const res = await fetch(
    `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Token refresh failed: ${error}`);
  }

  const data = await res.json();
  const tokens: StoredTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
  };

  saveTokens(tokens);
  return tokens;
}

/**
 * Get a valid access token for Graph API calls.
 * Automatically refreshes if expired. Throws if no tokens are stored.
 */
export async function getAccessToken(): Promise<string> {
  const tokens = loadTokens();
  if (!tokens) {
    throw new Error(
      "No stored tokens. An admin must sign in at /api/auth/signin first."
    );
  }

  // Refresh if token expires within the next 5 minutes
  const bufferSeconds = 300;
  const now = Math.floor(Date.now() / 1000);

  if (tokens.expiresAt - now < bufferSeconds) {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    return refreshed.accessToken;
  }

  return tokens.accessToken;
}

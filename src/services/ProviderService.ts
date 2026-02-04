import { getWidgetGraphClient } from "@/lib/graph";
import type { Client } from "@microsoft/microsoft-graph-client";

export interface ProviderProfile {
  id: string;
  slug: string;
  name: string;
  email: string;
  schedulingSource: "Outlook" | "External";
  externalId?: string;
  isActive: boolean;
  specialty: string;
  bio: string;
  avatarUrl: string;
  languages: string[];
  location: string;
  // Override fields
  overrideStartHour?: number;
  overrideEndHour?: number;
  overrideWorkDays?: number[];
}

// ──── SharePoint List ID Cache ────
const listIdCache = new Map<string, string>();

async function getListId(
  client: Client,
  siteId: string,
  listName: string
): Promise<string> {
  const cacheKey = `${siteId}:${listName}`;
  if (listIdCache.has(cacheKey)) {
    return listIdCache.get(cacheKey)!;
  }

  const lists = await client
    .api(`/sites/${siteId}/lists`)
    .select("id,displayName")
    .get();

  const match = lists.value.find(
    (l: { displayName: string }) =>
      l.displayName.toLowerCase() === listName.toLowerCase()
  );

  if (!match) {
    throw new Error(`List "${listName}" not found on site ${siteId}.`);
  }

  listIdCache.set(cacheKey, match.id);
  return match.id;
}

// ──── Site ID Cache ────
let cachedSiteId: string | null = null;

async function getSiteId(client: Client): Promise<string> {
  if (cachedSiteId) return cachedSiteId;

  const hostname = process.env.SHAREPOINT_SITE_HOSTNAME!;
  const site = await client
    .api(`/sites/${hostname}:`)
    .select("id")
    .get();

  cachedSiteId = site.id;
  return site.id;
}

// ──── Parse a SharePoint list item into a ProviderProfile ────
function parseProviderItem(item: Record<string, unknown>): ProviderProfile {
  const fields = item.fields as Record<string, unknown>;

  // Parse location — can be a complex object or simple string
  let location = "";
  const loc = fields.Location;
  if (typeof loc === "string") {
    location = loc;
  } else if (loc && typeof loc === "object") {
    const locObj = loc as Record<string, unknown>;
    const address = locObj.address as Record<string, unknown> | undefined;
    if (address) {
      const parts = [address.city, address.state].filter(Boolean);
      location = parts.join(", ");
    }
  }

  // Parse languages — can be string[] or comma-separated string
  let languages: string[] = [];
  const langs = fields.Languages;
  if (Array.isArray(langs)) {
    languages = langs;
  } else if (typeof langs === "string") {
    languages = langs.split(",").map((s: string) => s.trim());
  }

  // Parse override work days
  let overrideWorkDays: number[] | undefined;
  const owdRaw = fields.OverrideWorkDays;
  if (typeof owdRaw === "string" && owdRaw.trim()) {
    overrideWorkDays = owdRaw.split(",").map((s: string) => parseInt(s.trim(), 10));
  }

  return {
    id: item.id as string,
    slug: (fields.Slug as string) ?? "",
    name: (fields.Title as string) ?? "",
    email: (fields.Email as string) ?? "",
    schedulingSource: (fields.SchedulingSource as "Outlook" | "External") ?? "Outlook",
    externalId: (fields.ExternalID as string) || undefined,
    isActive: fields.IsActive !== false,
    specialty: (fields.Specialty as string) ?? "",
    bio: (fields.Bio as string) ?? "",
    avatarUrl: (fields.AvatarUrl as string) ?? "",
    languages,
    location,
    overrideStartHour:
      fields.OverrideStartHour != null
        ? Number(fields.OverrideStartHour)
        : undefined,
    overrideEndHour:
      fields.OverrideEndHour != null
        ? Number(fields.OverrideEndHour)
        : undefined,
    overrideWorkDays,
  };
}

// ──── Public API ────

export async function getAllProviders(): Promise<ProviderProfile[]> {
  const client = await getWidgetGraphClient();
  const siteId = await getSiteId(client);
  const listId = await getListId(client, siteId, "Providers");

  const result = await client
    .api(`/sites/${siteId}/lists/${listId}/items`)
    .expand("fields")
    .get();

  const providers = (result.value as Record<string, unknown>[])
    .map(parseProviderItem)
    .filter((p) => p.isActive);

  return providers;
}

export async function getProviderBySlug(
  slug: string
): Promise<ProviderProfile | null> {
  const providers = await getAllProviders();
  return providers.find((p) => p.slug === slug) ?? null;
}

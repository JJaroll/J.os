/**
 * Strapi v5 Service Layer
 *
 * Strapi v5 wraps all responses in { data: [...] } and uses
 * `documentId` as the stable identifier (instead of numeric `id`).
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

export interface StrapiSingleResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: StrapiMeta;
}

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

/** Strapi v5 media format entry */
export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  name: string;
  hash: string;
  ext: string;
  mime: string;
}

/** Strapi v5 media field */
export interface StrapiMedia {
  documentId: string;
  name: string;
  url: string;
  width: number;
  height: number;
  formats?: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  alternativeText?: string | null;
  caption?: string | null;
}

// desktop-apps

export interface StrapiDesktopApp {
  documentId: string;
  appId: string;        // 'readme' | 'projects' | 'terminal' | …
  label: string;        // Nombre de display con locale
  iconName: string;     // Nombre del ícono de Lucide, ej. 'FileText', 'Folder'
  iconColor?: string;   // Clase Tailwind opcional, ej. 'text-blue-500'
  showInDock: boolean;  // Si la app aparece en el BottomDock
  order: number;        // Orden de renderizado (ascendente)
  locale?: string;
}

export async function getDesktopApps(locale: string): Promise<StrapiDesktopApp[]> {
  try {
    const url = `${STRAPI_URL}/api/desktop-apps?locale=${locale}&pagination[pageSize]=100`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.warn(`[Strapi] getDesktopApps failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: StrapiListResponse<StrapiDesktopApp> = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error('[Strapi] getDesktopApps error:', err);
    return [];
  }
}

// top-bar-items

export interface StrapiTopBarItem {
  documentId: string;
  menuKey: string;      // Menú principal al que pertenece, ej. 'products'
  category?: string;    // Sub-grupo dentro del menú, ej. 'popular', 'categories'
  label: string;        // Etiqueta con locale
  href?: string;        // URL o enlace interno opcional
  iconName?: string;    // Ícono de Lucide opcional
  iconColor?: string;   // Clase de color Tailwind opcional
  order: number;        // Orden de renderizado dentro del menú (ascendente)
  locale?: string;
}

export type GroupedTopBarItems = Record<string, StrapiTopBarItem[]>;

export async function getTopBarItems(locale: string): Promise<StrapiTopBarItem[]> {
  try {
    const url = `${STRAPI_URL}/api/top-bar-items?locale=${locale}&pagination[pageSize]=200`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.warn(`[Strapi] getTopBarItems failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: StrapiListResponse<StrapiTopBarItem> = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error('[Strapi] getTopBarItems error:', err);
    return [];
  }
}

export function groupTopBarItemsByMenu(items: StrapiTopBarItem[]): GroupedTopBarItems {
  return items.reduce<GroupedTopBarItems>((acc, item) => {
    const key = item.category ?? 'misc';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

// projects

export interface StrapiProject {
  documentId: string;
  title: string;
  slug: string;
  description?: string;
  githuburl?: string;
  coverimage?: any;
  coverImageUrl?: string;
  iconName?: string;
  iconColor?: string;
  locale?: string;
  category?: string;
}


export async function getProjects(locale: string): Promise<StrapiProject[]> {
  try {
    const url = `${STRAPI_URL}/api/projects?locale=${locale}&populate=*&pagination[pageSize]=100`;
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) {
      console.warn(`[Strapi] getProjects failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const json: StrapiListResponse<StrapiProject> = await res.json();
    return json.data ?? [];
  } catch (err) {
    console.error('[Strapi] getProjects error:', err);
    return [];
  }
}

export function getStrapiMediaUrl(media: any): string | null {
  if (!media) return null;

  const mediaObj = Array.isArray(media) ? media[0] : media;

  if (!mediaObj) return null;

  let url = mediaObj?.url;

  if (!url && mediaObj?.data?.attributes?.url) {
    url = mediaObj.data.attributes.url;
  }
  if (!url && mediaObj?.attributes?.url) {
    url = mediaObj.attributes.url;
  }

  if (!url) return null;
  if (url.startsWith('http')) return url;

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://127.0.0.1:1337';
  return `${STRAPI_URL}${url}`;
}
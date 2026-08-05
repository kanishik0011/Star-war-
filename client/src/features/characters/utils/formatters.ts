import { format, isValid, parseISO } from 'date-fns';

export function isUnknownValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '' || normalized === 'unknown' || normalized === 'n/a';
}

export function normalizeUnknown(value: unknown): string {
  return isUnknownValue(value) ? 'Unknown' : String(value);
}

export function extractSwapiId(url: string): string | null {
  const match = /\/(\d+)\/?$/.exec(url.trim());
  return match?.[1] ?? null;
}

export function heightToMeters(height: string | null | undefined): string {
  if (isUnknownValue(height)) return 'Unknown';
  const centimeters = Number(String(height).replace(',', '').trim());
  if (!Number.isFinite(centimeters) || centimeters <= 0) return 'Unknown';
  return `${(centimeters / 100).toFixed(2).replace(/\.?0+$/, '')} m`;
}

export function formatMass(mass: string | null | undefined): string {
  if (isUnknownValue(mass)) return 'Unknown';
  const raw = String(mass).trim();
  const parsed = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(parsed) || parsed <= 0) return normalizeUnknown(raw);
  return `${parsed.toLocaleString('en-US')} kg`;
}

export function formatPopulation(population: string | null | undefined): string {
  if (isUnknownValue(population)) return 'Unknown';
  const parsed = Number(String(population).replace(/,/g, '').trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed.toLocaleString('en-US') : 'Unknown';
}

export function formatCreatedDate(created: string | null | undefined): string {
  if (isUnknownValue(created)) return 'Unknown';
  const date = parseISO(String(created));
  return isValid(date) ? format(date, 'dd-MM-yyyy') : 'Unknown';
}

export function getSpeciesName(species?: { name: string } | null): string {
  return species?.name?.trim() || 'Human';
}

export function calculatePageCount(count: number, pageSize = 10): number {
  return Math.max(1, Math.ceil(Math.max(0, count) / pageSize));
}

export function safePicsumSeed(name: string, sessionSeed: string): string {
  const safeName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${safeName || 'character'}-${sessionSeed}`;
}

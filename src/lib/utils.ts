import type { Units } from '../types';

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const KG_PER_LB = 0.45359237;

export function toDisplayWeight(kg: number | undefined, units: Units): number | undefined {
  if (kg === undefined) return undefined;
  const v = units === 'kg' ? kg : kg / KG_PER_LB;
  return Math.round(v * 10) / 10;
}

export function fromDisplayWeight(v: number | undefined, units: Units): number | undefined {
  if (v === undefined || Number.isNaN(v)) return undefined;
  return units === 'kg' ? v : v * KG_PER_LB;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export const formatDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

export const formatShortDate = (t: number) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseNum(v: string): number | undefined {
  if (v.trim() === '') return undefined;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}

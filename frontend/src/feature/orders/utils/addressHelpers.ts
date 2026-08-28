import type { PlaceOption } from '../types';

export function normalizePlace(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function stripPlacePrefix(name: string): string {
  const s = String(name || '').trim();
  // Tỉnh/Thành phố
  if (s.startsWith('Thành phố ')) return s.slice('Thành phố '.length).trim();
  if (s.startsWith('Tỉnh ')) return s.slice('Tỉnh '.length).trim();
  // Quận/Huyện/Thị xã/Thành phố thuộc tỉnh
  if (s.startsWith('Quận ')) return s.slice('Quận '.length).trim();
  if (s.startsWith('Huyện ')) return s.slice('Huyện '.length).trim();
  if (s.startsWith('Thị xã ')) return s.slice('Thị xã '.length).trim();
  if (s.startsWith('Thành phố ')) return s.slice('Thành phố '.length).trim();
  // Phường/Xã/Thị trấn
  if (s.startsWith('Phường ')) return s.slice('Phường '.length).trim();
  if (s.startsWith('Xã ')) return s.slice('Xã '.length).trim();
  if (s.startsWith('Thị trấn ')) return s.slice('Thị trấn '.length).trim();
  return s;
}

export function findPlaceByName(list: PlaceOption[], name: string): PlaceOption | null {
  const target = normalizePlace(name);
  if (!target) return null;
  return (
    list.find((x) => normalizePlace(x.name) === target) ||
    list.find((x) => normalizePlace(stripPlacePrefix(x.name)) === target) ||
    null
  );
}

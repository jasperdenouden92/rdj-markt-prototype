/**
 * Simple module-level store to share markt-toewijzing state across pages
 * during a prototype session (no persistence across reloads).
 */
const store: Record<string, { marktTonnage: number; subpartijTonnage: number }> = {};

export function setMarktToewijzing(subpartijId: string, marktTonnage: number, subpartijTonnage: number) {
  store[subpartijId] = { marktTonnage, subpartijTonnage };
}

export function getMarktToewijzing(subpartijId: string) {
  return store[subpartijId];
}

import { colors } from '../src/mvp/palette.mjs';
export { colors };
export const documentPalette = ':root{' + Object.entries(colors).map(([key,value]) => `--zt-${key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase())}:${value}`).join(';') + '}';
export function applyDocumentPalette(template) {
  return template.replace('/*__PALETTE__*/', documentPalette);
}

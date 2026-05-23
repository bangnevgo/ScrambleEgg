/**
 * Design Token Utilities
 * Provides functions to get CSS custom property (design token) values in JavaScript
 */

// Helper to get computed style of an element (usually document.documentElement)
const getRootStyle = () =>
  typeof document !== 'undefined' ?
    getComputedStyle(document.documentElement) :
    {} as CSSStyleDeclaration;

/**
 * Get a CSS custom property value by name
 * @param token - Token name without the '--' prefix (e.g., 'color-primary')
 * @returns The token value as string, or empty string if not found
 */
export function getToken(token: string): string {
  const root = getRootStyle();
  return root.getPropertyValue(`--${token}`).trim() || '';
}

/**
 * Get a CSS custom property value as a number
 * @param token - Token name without the '--' prefix
 * @returns The token value as number, or NaN if not found/not a number
 */
export function getTokenNumber(token: string): number {
  const value = getToken(token);
  const num = parseFloat(value);
  return isNaN(num) ? NaN : num;
}

/**
 * Get a CSS custom property value as Oklch color object
 * @param token - Token name without the '--' prefix (e.g., 'color-primary')
 * @returns Object with l, c, h, alpha properties
 */
export function getTokenColor(token: string): { l: number; c: number; h: number; alpha?: number } | null {
  const value = getToken(token);
  if (!value) return null;

  // Parse oklch(l c h) or oklch(l c h / alpha)
  const oklchMatch = value.match(/oklch\(([^)]+)\)/);
  if (!oklchMatch) return null;

  const [, params] = oklchMatch;
  const [lStr, cStr, hStr, alphaStr] = params.split(/\s+\/\s+| /);

  const l = parseFloat(lStr);
  const c = parseFloat(cStr);
  const h = parseFloat(hStr);
  const alpha = alphaStr ? parseFloat(alphaStr) : undefined;

  if (isNaN(l) || isNaN(c) || isNaN(h)) return null;

  return { l, c, h, ...(alpha !== undefined ? { alpha } : {}) };
}

/**
 * Get token value with fallback
 * @param token - Token name without the '--' prefix
 * @param fallback - Fallback value if token not found
 * @returns Token value or fallback
 */
export function getTokenOr<T>(token: string, fallback: T): string | T {
  const value = getToken(token);
  return value !== '' ? value : fallback;
}

export default {
  getToken,
  getTokenNumber,
  getTokenColor,
  getTokenOr
};
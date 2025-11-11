/**
 * Browser-compatible UUID generator
 * Uses crypto.randomUUID() when available (modern browsers),
 * falls back to a custom implementation for older environments
 */

/**
 * Generate a v4 UUID
 * @returns A valid v4 UUID string
 */
export function generateUUID(): string {
  // Use native crypto.randomUUID if available (modern browsers and Node 15+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation for older browsers
  // Based on RFC 4122 v4 UUID specification
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

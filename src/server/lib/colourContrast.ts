/**
 * WCAG AA colour contrast utilities.
 * Pure functions — no database or server dependencies.
 */

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '')
    const num = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
}

function relativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function contrastRatio(hex1: string, hex2: string): number {
    const l1 = relativeLuminance(...hexToRgb(hex1))
    const l2 = relativeLuminance(...hexToRgb(hex2))
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Darken a hex colour by a factor (0-1).
 */
function darken(hex: string, amount: number): string {
    const [r, g, b] = hexToRgb(hex)
    return rgbToHex(r * (1 - amount), g * (1 - amount), b * (1 - amount))
}

/**
 * Lighten a hex colour by mixing with white.
 */
export function lighten(hex: string, amount: number): string {
    const [r, g, b] = hexToRgb(hex)
    return rgbToHex(
        r + (255 - r) * amount,
        g + (255 - g) * amount,
        b + (255 - b) * amount,
    )
}

/**
 * Add alpha transparency to a hex colour (returns hex with alpha).
 */
export function withAlpha(hex: string, alpha: number): string {
    return hex + Math.round(alpha * 255).toString(16).padStart(2, '0')
}

/**
 * Ensure a colour has WCAG AA contrast (4.5:1) against white.
 * If it doesn't, darken it incrementally until it does.
 * Returns the adjusted colour.
 */
export function ensureContrastWithWhite(hex: string): string {
    const MIN_RATIO = 4.5
    let colour = hex
    for (let i = 0; i < 20; i++) {
        if (contrastRatio(colour, '#FFFFFF') >= MIN_RATIO) {
            return colour
        }
        colour = darken(colour, 0.08)
    }
    return colour
}

/**
 * Generate a full brand colour palette from a single primary colour.
 */
export function generateBrandPalette(primaryHex: string) {
    const adjusted = ensureContrastWithWhite(primaryHex)
    return {
        primary: adjusted,
        primaryDeep: darken(adjusted, 0.25),
        primaryMild: lighten(adjusted, 0.3),
        primarySubtle: withAlpha(adjusted, 0.1),
    }
}

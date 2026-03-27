/**
 * Pure utility functions for leave calculations.
 * No 'use server' — safe to import from both server and client code.
 */

export function countWorkingDays(start: Date, end: Date): number {
    let count = 0
    const current = new Date(start)
    while (current <= end) {
        const day = current.getDay()
        if (day !== 0 && day !== 6) count += 1
        current.setDate(current.getDate() + 1)
    }
    return Math.max(count, 1)
}

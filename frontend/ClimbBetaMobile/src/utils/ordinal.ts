/**
 * @file ordinal.ts
 * @description Utilitário para converter números em ordinais (ex.: 1 -> 1st / 1º, conforme a implementação).
 *
 * Observações:
 *  - Função pequena e pura; ideal para testes unitários simples.
 */
/**
 * Returns the English ordinal suffix for a positive integer.
 *
 * Handles the 11/12/13 exception (which are always 'th', e.g. 11th, 112th):
 *   1 -> 'st', 2 -> 'nd', 3 -> 'rd', 4 -> 'th', 11 -> 'th', 21 -> 'st', 22 -> 'nd'.
 */
export function getOrdinalSuffix(n: number): string {
    const r = n % 100;
    if (r >= 11 && r <= 13) return 'th';
    switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

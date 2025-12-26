import { NumberGeneratorOptions } from '../types';

/**
 * Generate application/loan numbers in format: PREFIX-YEAR-SEQUENCE
 * Examples: LA-2025-00001, LN-2025-00001, ORD-2025-00001
 */
export function generateNumber(options: NumberGeneratorOptions): string {
    const { prefix, sequence } = options;
    const year = options.year || new Date().getFullYear();
    const paddedSequence = String(sequence).padStart(5, '0');

    return `${prefix}-${year}-${paddedSequence}`;
}

/**
 * Generate a random API key for partners
 * Format: 1fi_pk_<32 random chars>
 */
export function generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `1fi_pk_${key}`;
}

/**
 * Get the next sequence number for a given prefix
 * In production, this would query the database for the max sequence
 */
export async function getNextSequence(
    prefix: string,
    currentMax: number
): Promise<number> {
    return currentMax + 1;
}

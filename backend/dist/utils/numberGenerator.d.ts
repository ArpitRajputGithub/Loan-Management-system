import { NumberGeneratorOptions } from '../types';
/**
 * Generate application/loan numbers in format: PREFIX-YEAR-SEQUENCE
 * Examples: LA-2025-00001, LN-2025-00001, ORD-2025-00001
 */
export declare function generateNumber(options: NumberGeneratorOptions): string;
/**
 * Generate a random API key for partners
 * Format: 1fi_pk_<32 random chars>
 */
export declare function generateApiKey(): string;
/**
 * Get the next sequence number for a given prefix
 * In production, this would query the database for the max sequence
 */
export declare function getNextSequence(prefix: string, currentMax: number): Promise<number>;
//# sourceMappingURL=numberGenerator.d.ts.map
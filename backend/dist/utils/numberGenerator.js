"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNumber = generateNumber;
exports.generateApiKey = generateApiKey;
exports.getNextSequence = getNextSequence;
/**
 * Generate application/loan numbers in format: PREFIX-YEAR-SEQUENCE
 * Examples: LA-2025-00001, LN-2025-00001, ORD-2025-00001
 */
function generateNumber(options) {
    const { prefix, sequence } = options;
    const year = options.year || new Date().getFullYear();
    const paddedSequence = String(sequence).padStart(5, '0');
    return `${prefix}-${year}-${paddedSequence}`;
}
/**
 * Generate a random API key for partners
 * Format: 1fi_pk_<32 random chars>
 */
function generateApiKey() {
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
async function getNextSequence(prefix, currentMax) {
    return currentMax + 1;
}
//# sourceMappingURL=numberGenerator.js.map
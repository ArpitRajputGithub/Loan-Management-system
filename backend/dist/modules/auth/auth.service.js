"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../../config/database"));
const env_1 = require("../../config/env");
/**
 * Auth Service
 * Handles user authentication and registration.
 */
class AuthService {
    /**
     * Register a new user
     */
    async register(input) {
        const { name, email, password, phone, pan } = input;
        // Check if email already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        // Check if PAN already exists (if provided)
        if (pan) {
            const existingPan = await database_1.default.user.findUnique({
                where: { pan },
            });
            if (existingPan) {
                throw new Error('PAN already registered');
            }
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone,
                pan,
                role: 'BORROWER', // Default role
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                pan: true,
                role: true,
                createdAt: true,
            },
        });
        // Generate JWT
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return { user, token };
    }
    /**
     * Login user
     */
    async login(input) {
        const { email, password } = input;
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        // Generate JWT
        const token = this.generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                pan: user.pan,
                role: user.role,
            },
            token,
        };
    }
    /**
     * Get current user by ID
     */
    async getCurrentUser(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                pan: true,
                role: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    /**
     * Generate JWT token
     */
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
        });
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map
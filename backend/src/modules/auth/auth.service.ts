import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schema';
import { JwtPayload } from '../../types';

/**
 * Auth Service
 * Handles user authentication and registration.
 */
export class AuthService {

    /**
     * Register a new user
     */
    async register(input: RegisterInput) {
        const { name, email, password, phone, pan } = input;

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Check if PAN already exists (if provided)
        if (pan) {
            const existingPan = await prisma.user.findUnique({
                where: { pan },
            });

            if (existingPan) {
                throw new Error('PAN already registered');
            }
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
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
    async login(input: LoginInput) {
        const { email, password } = input;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);

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
    async getCurrentUser(userId: string) {
        const user = await prisma.user.findUnique({
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
    private generateToken(payload: JwtPayload): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
        });
    }
}

export const authService = new AuthService();

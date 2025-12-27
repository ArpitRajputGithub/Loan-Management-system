import { RegisterInput, LoginInput } from './auth.schema';
/**
 * Auth Service
 * Handles user authentication and registration.
 */
export declare class AuthService {
    /**
     * Register a new user
     */
    register(input: RegisterInput): Promise<{
        user: {
            name: string;
            email: string;
            phone: string | null;
            pan: string | null;
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            createdAt: Date;
        };
        token: string;
    }>;
    /**
     * Login user
     */
    login(input: LoginInput): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string | null;
            pan: string | null;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    /**
     * Get current user by ID
     */
    getCurrentUser(userId: string): Promise<{
        name: string;
        email: string;
        phone: string | null;
        pan: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
    }>;
    /**
     * Generate JWT token
     */
    private generateToken;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map
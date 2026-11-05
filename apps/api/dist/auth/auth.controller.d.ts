import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
type AuthenticatedRequest = ExpressRequest & {
    user?: {
        sub?: string;
    };
};
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(data: {
        name: string;
        email: string;
        password: string;
        role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(data: {
        email: string;
        password: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
        };
    }>;
    getCurrentUser(req: AuthenticatedRequest): Promise<({
        profile: {
            id: bigint;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            phone: string | null;
            address: string | null;
            city: string | null;
        } | null;
    } & {
        id: bigint;
        email: string;
        googleId: string | null;
        name: string;
        passwordHash: string | null;
        avatarUrl: string | null;
        emailVerifiedAt: Date | null;
        role: import(".prisma/client").$Enums.UserRole;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
}
export {};

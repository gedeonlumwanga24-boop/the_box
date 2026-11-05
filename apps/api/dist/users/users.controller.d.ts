import type { Request as ExpressRequest } from 'express';
import { UsersService } from './users.service';
type AuthenticatedRequest = ExpressRequest & {
    user?: {
        sub?: string;
    };
};
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: AuthenticatedRequest): Promise<({
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
    updateProfile(req: AuthenticatedRequest, data: {
        name?: string;
        phone?: string;
        address?: string;
        city?: string;
    }): Promise<{
        user: {
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
        };
        profile: {
            id: bigint;
            createdAt: Date;
            updatedAt: Date;
            userId: bigint;
            phone: string | null;
            address: string | null;
            city: string | null;
        };
    } | null>;
    getAllUsers(): Promise<({
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
    })[]>;
    updateUserRole(id: string, role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'): Promise<{
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
    }>;
    restoreUser(id: string): Promise<{
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
    }>;
    deleteUser(id: string): Promise<{
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
    }>;
}
export {};

import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<({
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
    findByEmail(email: string): Promise<({
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
    create(data: {
        name: string;
        email: string;
        passwordHash: string;
        role: 'CUSTOMER' | 'MANAGER' | 'ADMIN';
    }): Promise<{
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
    createClientProfile(userId: string): Promise<{
        id: bigint;
        createdAt: Date;
        updatedAt: Date;
        userId: bigint;
        phone: string | null;
        address: string | null;
        city: string | null;
    }>;
    updateProfile(userId: string, data: {
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
    }>;
    getAllUsers(includeDeleted?: boolean): Promise<({
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
    updateUserRole(userId: string, role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'): Promise<{
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
    softDeleteUser(userId: string): Promise<{
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
    restoreUser(userId: string): Promise<{
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

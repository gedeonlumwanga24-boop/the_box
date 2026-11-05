import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<{
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
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
            avatarUrl: string | null;
        };
    }>;
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
    validateToken(token: string): Promise<{
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
    }>;
}

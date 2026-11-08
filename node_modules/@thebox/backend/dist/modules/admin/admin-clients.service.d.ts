import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminClientsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        email: string;
        telephone: string | null;
        ville: string | null;
        deletedAt: Date | null;
        createdAt: Date;
    }[]>;
    remove(id: number): Promise<{
        role: string;
        id: number;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerifiedAt: Date | null;
        password: string | null;
        rememberToken: string | null;
        googleId: string | null;
        avatar: string | null;
        deletedAt: Date | null;
    }>;
}

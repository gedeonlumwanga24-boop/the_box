import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminMessagesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string | null;
        email: string | null;
        subject: string | null;
        message: string | null;
        status: string;
        adminResponse: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        name: string | null;
        email: string | null;
        subject: string | null;
        message: string | null;
        status: string;
        adminResponse: string | null;
        respondedAt: Date | null;
        createdAt: Date;
    }>;
    reply(id: number, reply: string): Promise<{
        message: string | null;
        id: number;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: number | null;
        statut: string | null;
        email: string | null;
        isAdmin: boolean | null;
        subject: string | null;
        status: string | null;
        adminNotes: string | null;
        readAt: Date | null;
        adminResponse: string | null;
        respondedAt: Date | null;
        responseReadAt: Date | null;
        reply: string | null;
        clientRead: Date | null;
    }>;
}

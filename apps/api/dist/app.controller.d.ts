import { PrismaService } from "./prisma.service";
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: string;
        service: string;
        database: string;
    }>;
}

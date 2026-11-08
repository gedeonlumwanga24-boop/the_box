import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminConfigService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Record<string, string>>;
    update(values: Record<string, string | null | undefined>): Promise<Record<string, string>>;
}

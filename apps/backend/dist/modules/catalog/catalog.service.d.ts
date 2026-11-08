import { PrismaService } from "../../prisma/prisma.service";
export declare class CatalogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getCategories(): Promise<any[]>;
    getProducts(filters?: {
        category?: string;
        q?: string;
    }): Promise<{
        data: ({
            category: {
                id: number;
                name: string;
                slug: string;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
                parentId: number | null;
                displayOrder: number;
            };
        } & {
            id: number;
            name: string;
            slug: string;
            description: string | null;
            price: number;
            stock: number;
            image: string | null;
            gallery: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pagination: {
            total: number;
        };
    }>;
    getPublicConfig(): Promise<Record<string, string>>;
}

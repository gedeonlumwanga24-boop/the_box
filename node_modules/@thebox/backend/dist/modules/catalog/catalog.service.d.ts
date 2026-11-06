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
                parentId: number | null;
                name: string;
                slug: string;
                displayOrder: number;
                image: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            name: string;
            slug: string;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            stock: number;
            gallery: import("@prisma/client/runtime/library").JsonValue | null;
            categoryId: number;
        })[];
        pagination: {
            total: number;
        };
    }>;
}

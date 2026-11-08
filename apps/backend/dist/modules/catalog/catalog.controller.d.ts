import { CatalogService } from "./catalog.service";
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    getCategories(): Promise<any[]>;
    getProducts(category?: string, q?: string): Promise<{
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
    getConfig(): Promise<Record<string, string>>;
}

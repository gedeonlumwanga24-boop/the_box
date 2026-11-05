import { PrismaService } from "../prisma.service";
export type ProductSort = "newest" | "price-asc" | "price-desc";
export declare class ProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findActive(options: {
        category?: string;
        query?: string;
        page: number;
        pageSize: number;
        sort: ProductSort;
    }): Promise<{
        data: {
            id: string;
            name: string;
            slug: string;
            description: string | null;
            price: string;
            currency: string;
            stock: number;
            category: {
                id: string;
                name: string;
                slug: string;
            };
            images: {
                id: string;
                url: string;
                altText: string | null;
                sortOrder: number;
            }[];
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findActiveBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: string;
        currency: string;
        stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            altText: string | null;
            sortOrder: number;
        }[];
    } | null>;
    createOne(input: {
        name: string;
        category: string;
        price: number;
        stock: number;
        description?: string;
        image?: string;
        gallery?: string[];
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: string;
        currency: string;
        stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            altText: string | null;
            sortOrder: number;
        }[];
    }>;
    updateOne(id: string, input: {
        name?: string;
        category?: string;
        price?: number;
        stock?: number;
        description?: string;
        image?: string;
        gallery?: string[];
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: string;
        currency: string;
        stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            altText: string | null;
            sortOrder: number;
        }[];
    }>;
    removeOne(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        price: string;
        currency: string;
        stock: number;
        category: {
            id: string;
            name: string;
            slug: string;
        };
        images: {
            id: string;
            url: string;
            altText: string | null;
            sortOrder: number;
        }[];
    }>;
    private toSlug;
    private toPublicProduct;
}

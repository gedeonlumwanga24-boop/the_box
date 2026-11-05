import { ProductsService } from "./products.service";
export declare class ProductsController {
    private readonly products;
    constructor(products: ProductsService);
    findActive(category: string | undefined, query: string | undefined, page: string | undefined, pageSize: string | undefined, sort: string | undefined): Promise<{
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
    }>;
    create(body: {
        name: string;
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
    update(id: string, body: {
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
    remove(id: string): Promise<{
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
}

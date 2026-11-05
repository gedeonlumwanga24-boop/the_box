import { AdminProductsService } from './admin-products.service';
export declare class AdminProductsController {
    private readonly adminProductsService;
    constructor(adminProductsService: AdminProductsService);
    findAll(): Promise<({
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
    })[]>;
    create(body: {
        name: string;
        category?: string;
        price?: number;
        stock?: number;
        description?: string;
        imageUrl?: string;
    }): Promise<{
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
    }>;
    update(id: number, body: {
        name?: string;
        category?: string;
        price?: number;
        stock?: number;
        description?: string;
        imageUrl?: string;
    }): Promise<{
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
    }>;
    remove(id: number): Promise<{
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
    }>;
}

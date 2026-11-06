import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminProductsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    create(input: {
        name: string;
        category?: string;
        categoryId?: number;
        price: number;
        stock: number;
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
    update(id: number, input: {
        name?: string;
        category?: string;
        categoryId?: number;
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
    private slugify;
}

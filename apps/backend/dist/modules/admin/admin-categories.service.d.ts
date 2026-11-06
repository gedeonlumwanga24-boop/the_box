import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminCategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        slug: string;
        parentId: number | null;
        parentName: string | null;
        displayOrder: number;
        image: string | null;
        productsCount: number;
    }[]>;
    private slugify;
    create(input: {
        name: string;
        slug?: string;
        parentId?: number | null;
        displayOrder?: number;
        image?: string | null;
    }): Promise<{
        id: number;
        parentId: number | null;
        name: string;
        slug: string;
        displayOrder: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, input: {
        name?: string;
        slug?: string;
        parentId?: number | null;
        displayOrder?: number;
        image?: string | null;
    }): Promise<{
        id: number;
        parentId: number | null;
        name: string;
        slug: string;
        displayOrder: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        parentId: number | null;
        name: string;
        slug: string;
        displayOrder: number;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

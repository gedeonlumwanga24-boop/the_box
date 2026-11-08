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
        name: string;
        slug: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
        displayOrder: number;
    }>;
    update(id: number, input: {
        name?: string;
        slug?: string;
        parentId?: number | null;
        displayOrder?: number;
        image?: string | null;
    }): Promise<{
        id: number;
        name: string;
        slug: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
        displayOrder: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        slug: string;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        parentId: number | null;
        displayOrder: number;
    }>;
}

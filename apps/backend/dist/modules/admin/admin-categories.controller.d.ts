import { AdminCategoriesService } from "./admin-categories.service";
export declare class AdminCategoriesController {
    private readonly service;
    constructor(service: AdminCategoriesService);
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
    create(body: {
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
    update(id: number, body: {
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

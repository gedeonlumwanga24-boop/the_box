import { CategoriesService } from "./categories.service";
export declare class CategoriesController {
    private readonly categories;
    constructor(categories: CategoriesService);
    findActive(): Promise<{
        id: string;
        parentId: string | null;
        children: {
            id: string;
            parentId: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            imageUrl: string | null;
            displayOrder: number;
            isActive: boolean;
        }[];
        name: string;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        imageUrl: string | null;
        displayOrder: number;
        isActive: boolean;
    }[]>;
}

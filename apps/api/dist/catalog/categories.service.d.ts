import { PrismaService } from "../prisma.service";
export declare class CategoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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

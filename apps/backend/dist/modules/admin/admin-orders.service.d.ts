import { PrismaService } from "../../prisma/prisma.service";
export declare class AdminOrdersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        client: string;
        clientEmail: string | null;
        userId: number | null;
        date: Date;
        statut: string;
        paymentStatus: string;
        total: number;
        items: {
            productId: number;
            name: string;
            image: string | null;
            quantity: number;
            unitPrice: number;
        }[];
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        client: string;
        clientEmail: string | null;
        userId: number | null;
        date: Date;
        statut: string;
        paymentStatus: string;
        paymentMethod: string | null;
        paymentPhone: string | null;
        paymentReference: string | null;
        paymentProof: string | null;
        adresse: string | null;
        total: number;
        items: {
            productId: number;
            name: string;
            image: string | null;
            quantity: number;
            unitPrice: number;
        }[];
    }>;
}

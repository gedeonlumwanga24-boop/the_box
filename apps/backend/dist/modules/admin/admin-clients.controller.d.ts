import { AdminClientsService } from "./admin-clients.service";
export declare class AdminClientsController {
    private readonly service;
    constructor(service: AdminClientsService);
    findAll(): Promise<{
        id: number;
        name: string;
        email: string;
        telephone: string | null;
        ville: string | null;
        deletedAt: Date | null;
        createdAt: Date;
    }[]>;
    remove(id: number): Promise<{
        id: number;
        name: string;
        email: string;
        emailVerifiedAt: Date | null;
        password: string | null;
        role: string;
        rememberToken: string | null;
        googleId: string | null;
        avatar: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

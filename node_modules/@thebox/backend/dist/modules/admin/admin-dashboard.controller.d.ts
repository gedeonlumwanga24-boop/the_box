import { AdminDashboardService } from "./admin-dashboard.service";
export declare class AdminDashboardController {
    private readonly service;
    constructor(service: AdminDashboardService);
    getDashboard(): Promise<{
        kpis: {
            chiffreAffaires: number;
            totalCommandes: number;
            totalProduits: number;
            totalClients: number;
        };
        market: {
            panierMoyen: number;
            topCategorie: string | null;
            tauxConversion: number;
        };
        charts: {
            sales: {
                labels: string[];
                data: number[];
            };
            traffic: {
                labels: string[];
                visitors: number[];
                pageViews: number[];
            };
            orders: {
                labels: string[];
                data: number[];
            };
        };
        recentOrders: {
            id: number;
            client: string;
            date: Date;
            statut: string;
            total: number;
            itemsCount: number;
        }[];
    }>;
}

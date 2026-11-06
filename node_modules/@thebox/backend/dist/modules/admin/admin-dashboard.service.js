"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminDashboardService = class AdminDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard() {
        const [totalCommandes, totalProduits, totalClients, paidOrders, topCategoryAgg, ordersByStatus, recentOrders, monthlySales,] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.product.count(),
            this.prisma.user.count({ where: { role: "client" } }),
            this.prisma.order.findMany({
                where: { paymentStatus: "payee" },
                select: { total: true },
            }),
            this.prisma.category.findFirst({
                orderBy: { products: { _count: "desc" } },
                select: { name: true, _count: { select: { products: true } } },
            }),
            this.prisma.order.groupBy({
                by: ["statut"],
                _count: { _all: true },
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    items: { include: { product: { select: { name: true } } } },
                },
            }),
            this.monthlySales(),
        ]);
        const chiffreAffaires = paidOrders.reduce((sum, o) => sum + o.total, 0);
        const panierMoyen = paidOrders.length > 0 ? chiffreAffaires / paidOrders.length : 0;
        const tauxConversion = totalClients > 0
            ? Math.min(100, (totalCommandes / totalClients) * 100)
            : 0;
        return {
            kpis: {
                chiffreAffaires,
                totalCommandes,
                totalProduits,
                totalClients,
            },
            market: {
                panierMoyen,
                topCategorie: topCategoryAgg?.name ?? null,
                tauxConversion,
            },
            charts: {
                sales: monthlySales,
                traffic: {
                    labels: monthlySales.labels,
                    visitors: monthlySales.data.map((v) => Math.round(v / 50000)),
                    pageViews: monthlySales.data.map((v) => Math.round(v / 30000)),
                },
                orders: {
                    labels: ordersByStatus.map((s) => s.statut
                        .split("_")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")),
                    data: ordersByStatus.map((s) => s._count._all),
                },
            },
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                client: order.user?.name ?? "Client inconnu",
                date: order.createdAt,
                statut: order.statut,
                total: order.total,
                itemsCount: order.items.length,
            })),
        };
    }
    async monthlySales() {
        const now = new Date();
        const labels = [];
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            labels.push(`Mois ${start.getMonth() + 1}`);
            months.push({
                start,
                end,
                label: `Mois ${start.getMonth() + 1}`,
            });
        }
        const orders = await this.prisma.order.findMany({
            where: {
                paymentStatus: "payee",
                createdAt: { gte: months[0].start },
            },
            select: { total: true, createdAt: true },
        });
        const data = months.map((m) => orders
            .filter((o) => o.createdAt >= m.start && o.createdAt < m.end)
            .reduce((sum, o) => sum + o.total, 0));
        return { labels, data };
    }
};
exports.AdminDashboardService = AdminDashboardService;
exports.AdminDashboardService = AdminDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminDashboardService);

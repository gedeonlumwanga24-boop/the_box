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
exports.AdminOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminOrdersService = class AdminOrdersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const orders = await this.prisma.order.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { product: { select: { name: true, image: true } } } },
            },
        });
        return orders.map((o) => ({
            id: o.id,
            client: o.user?.name ?? "Utilisateur inconnu",
            clientEmail: o.user?.email ?? null,
            userId: o.userId,
            date: o.createdAt,
            statut: o.statut,
            paymentStatus: o.paymentStatus,
            total: o.total,
            items: o.items.map((item) => ({
                productId: item.productId,
                name: item.product?.name ?? "Produit",
                image: item.product?.image ?? null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        }));
    }
    async findOne(id) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: {
                    include: {
                        product: { select: { id: true, name: true, image: true, price: true } },
                    },
                },
            },
        });
        if (!order)
            throw new common_1.NotFoundException("Commande introuvable");
        return {
            id: order.id,
            client: order.user?.name ?? "Utilisateur inconnu",
            clientEmail: order.user?.email ?? null,
            userId: order.userId,
            date: order.createdAt,
            statut: order.statut,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            paymentPhone: order.paymentPhone,
            paymentReference: order.paymentReference,
            paymentProof: order.paymentProof,
            adresse: order.adresse,
            total: order.total,
            items: order.items.map((item) => ({
                productId: item.productId,
                name: item.product?.name ?? "Produit",
                image: item.product?.image ?? null,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        };
    }
};
exports.AdminOrdersService = AdminOrdersService;
exports.AdminOrdersService = AdminOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminOrdersService);

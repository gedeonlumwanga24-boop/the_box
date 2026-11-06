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
exports.AdminProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminProductsService = class AdminProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.product.findMany({
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
    }
    async create(input) {
        let category = null;
        if (input.categoryId != null) {
            category = await this.prisma.category.findUnique({
                where: { id: input.categoryId },
                select: { id: true },
            });
        }
        if (!category) {
            const categoryName = input.category?.trim() || "Autre";
            const categorySlug = this.slugify(categoryName) || "autre";
            category = await this.prisma.category.findUnique({
                where: { slug: categorySlug },
            });
            if (!category) {
                category = await this.prisma.category.create({
                    data: {
                        name: categoryName,
                        slug: categorySlug,
                    },
                });
            }
        }
        const name = input.name?.trim() || "Produit sans nom";
        return this.prisma.product.create({
            data: {
                name,
                slug: `${this.slugify(name)}-${Date.now()}`,
                description: input.description?.trim() || null,
                price: Number(input.price ?? 0),
                stock: Number(input.stock ?? 0),
                image: input.imageUrl?.trim() || null,
                categoryId: category.id,
            },
            include: { category: true },
        });
    }
    async update(id, input) {
        const current = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
        if (!current) {
            throw new Error("Product not found");
        }
        let category = null;
        if (input.categoryId != null) {
            category = await this.prisma.category.findUnique({
                where: { id: input.categoryId },
                select: { id: true },
            });
        }
        if (!category) {
            const categoryName = input.category?.trim() || current.category?.name || "Autre";
            const categorySlug = this.slugify(categoryName) || "autre";
            category = await this.prisma.category.findUnique({
                where: { slug: categorySlug },
            });
            if (!category) {
                category = await this.prisma.category.create({
                    data: {
                        name: categoryName,
                        slug: categorySlug,
                    },
                });
            }
        }
        return this.prisma.product.update({
            where: { id },
            data: {
                name: input.name?.trim() || current.name,
                description: input.description !== undefined
                    ? input.description.trim() || null
                    : current.description,
                price: input.price !== undefined ? Number(input.price) : current.price,
                stock: input.stock !== undefined ? Number(input.stock) : current.stock,
                image: input.imageUrl !== undefined
                    ? input.imageUrl.trim() || null
                    : current.image,
                categoryId: category.id,
                slug: input.name && input.name.trim()
                    ? `${this.slugify(input.name)}-${id}`
                    : current.slug,
            },
            include: { category: true },
        });
    }
    async remove(id) {
        return this.prisma.product.delete({
            where: { id },
            include: { category: true },
        });
    }
    slugify(value) {
        return (value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 120);
    }
};
exports.AdminProductsService = AdminProductsService;
exports.AdminProductsService = AdminProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminProductsService);

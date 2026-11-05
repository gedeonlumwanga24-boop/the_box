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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findActive(options) {
        const where = {
            isActive: true,
            category: { isActive: true },
        };
        if (options.category) {
            where.category = { isActive: true, slug: options.category };
        }
        const query = options.query?.trim();
        if (query) {
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
            ];
        }
        const orderBy = options.sort === "price-asc"
            ? [{ price: "asc" }, { name: "asc" }]
            : options.sort === "price-desc"
                ? [{ price: "desc" }, { name: "asc" }]
                : [{ createdAt: "desc" }, { name: "asc" }];
        const [products, total] = await this.prisma.$transaction([
            this.prisma.product.findMany({
                where,
                skip: (options.page - 1) * options.pageSize,
                take: options.pageSize,
                orderBy,
                include: {
                    category: true,
                    images: { orderBy: { sortOrder: "asc" } },
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        return {
            data: products.map((product) => this.toPublicProduct(product)),
            pagination: {
                page: options.page,
                pageSize: options.pageSize,
                total,
                totalPages: Math.ceil(total / options.pageSize),
            },
        };
    }
    async findActiveBySlug(slug) {
        const product = await this.prisma.product.findFirst({
            where: { slug, isActive: true, category: { isActive: true } },
            include: {
                category: true,
                images: { orderBy: { sortOrder: "asc" } },
            },
        });
        return product ? this.toPublicProduct(product) : null;
    }
    async createOne(input) {
        const categoryName = input.category?.trim() || "Autre";
        const categorySlug = this.toSlug(categoryName);
        const productName = input.name?.trim() || "Produit sans nom";
        let category = await this.prisma.category.findFirst({
            where: { slug: categorySlug },
        });
        if (!category) {
            category = await this.prisma.category.create({
                data: {
                    name: categoryName,
                    slug: categorySlug,
                    displayOrder: 0,
                    isActive: true,
                },
            });
        }
        const gallery = (input.gallery ?? []).filter(Boolean);
        const images = [input.image, ...gallery].filter(Boolean);
        const product = await this.prisma.product.create({
            data: {
                categoryId: category.id,
                name: productName,
                slug: `${this.toSlug(productName)}-${Date.now().toString().slice(-6)}`,
                description: input.description?.trim() || null,
                price: new client_1.Prisma.Decimal(String(Number(input.price ?? 0))),
                currency: "CDF",
                stock: Number(input.stock ?? 0),
                isActive: true,
                images: {
                    create: images.map((url, index) => ({
                        url: url.trim(),
                        altText: productName,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                category: true,
                images: { orderBy: { sortOrder: "asc" } },
            },
        });
        return this.toPublicProduct(product);
    }
    async updateOne(id, input) {
        const productId = Number(id);
        if (!Number.isInteger(productId)) {
            throw new Error("Invalid product id");
        }
        const current = await this.prisma.product.findUnique({
            where: { id: BigInt(productId) },
            include: { category: true, images: true },
        });
        if (!current) {
            throw new Error("Product not found");
        }
        const categoryName = input.category?.trim() || current.category.name;
        const categorySlug = this.toSlug(categoryName);
        let category = await this.prisma.category.findFirst({
            where: { slug: categorySlug },
        });
        if (!category) {
            category = await this.prisma.category.create({
                data: {
                    name: categoryName,
                    slug: categorySlug,
                    displayOrder: 0,
                    isActive: true,
                },
            });
        }
        const gallery = (input.gallery ?? current.images.map((image) => image.url)).filter(Boolean);
        const images = [input.image ?? current.images[0]?.url, ...gallery].filter(Boolean);
        const updated = await this.prisma.product.update({
            where: { id: BigInt(productId) },
            data: {
                categoryId: category.id,
                name: input.name?.trim() || current.name,
                slug: input.name
                    ? `${this.toSlug(input.name)}-${productId}`
                    : current.slug,
                description: input.description !== undefined
                    ? input.description.trim() || null
                    : current.description,
                price: input.price !== undefined
                    ? new client_1.Prisma.Decimal(String(Number(input.price)))
                    : current.price,
                stock: input.stock !== undefined ? Number(input.stock) : current.stock,
                isActive: true,
                images: {
                    deleteMany: {},
                    create: images.map((url, index) => ({
                        url: url.trim(),
                        altText: input.name?.trim() || current.name,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                category: true,
                images: { orderBy: { sortOrder: "asc" } },
            },
        });
        return this.toPublicProduct(updated);
    }
    async removeOne(id) {
        const productId = Number(id);
        if (!Number.isInteger(productId)) {
            throw new Error("Invalid product id");
        }
        const product = await this.prisma.product.findUnique({
            where: { id: BigInt(productId) },
            include: { category: true, images: true },
        });
        if (!product) {
            throw new Error("Product not found");
        }
        await this.prisma.product.delete({
            where: { id: BigInt(productId) },
        });
        return this.toPublicProduct(product);
    }
    toSlug(value) {
        return (value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 120) || "item");
    }
    toPublicProduct(product) {
        return {
            id: product.id.toString(),
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price.toFixed(2),
            currency: product.currency.trim(),
            stock: product.stock,
            category: {
                id: product.category.id.toString(),
                name: product.category.name,
                slug: product.category.slug,
            },
            images: product.images.map((image) => ({
                id: image.id.toString(),
                url: image.url,
                altText: image.altText,
                sortOrder: image.sortOrder,
            })),
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map
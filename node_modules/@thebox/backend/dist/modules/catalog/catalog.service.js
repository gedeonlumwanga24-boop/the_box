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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCategories() {
        const rows = await this.prisma.category.findMany({
            include: {
                children: {
                    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
                },
            },
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        });
        const categoryMap = new Map();
        for (const row of rows) {
            categoryMap.set(row.id, {
                ...row,
                children: [],
            });
        }
        for (const row of rows) {
            if (row.parentId !== null && row.parentId !== undefined) {
                const parent = categoryMap.get(row.parentId);
                if (parent) {
                    parent.children.push(categoryMap.get(row.id));
                }
            }
        }
        return rows
            .filter((row) => row.parentId === null || row.parentId === undefined)
            .map((row) => categoryMap.get(row.id));
    }
    async getProducts(filters = {}) {
        const where = {};
        if (filters.category) {
            const allCategories = await this.prisma.category.findMany({
                select: { id: true, slug: true, parentId: true },
            });
            const slugToId = new Map(allCategories.map((c) => [c.slug, c.id]));
            const childrenByParent = new Map();
            for (const category of allCategories) {
                if (category.parentId != null) {
                    const siblings = childrenByParent.get(category.parentId) ?? [];
                    siblings.push(category);
                    childrenByParent.set(category.parentId, siblings);
                }
            }
            const slugs = new Set([filters.category]);
            const queue = [];
            const rootId = slugToId.get(filters.category);
            if (rootId != null)
                queue.push(rootId);
            while (queue.length > 0) {
                const parentId = queue.pop();
                for (const child of childrenByParent.get(parentId) ?? []) {
                    slugs.add(child.slug);
                    queue.push(child.id);
                }
            }
            where.category = { slug: { in: [...slugs] } };
        }
        if (filters.q) {
            where.OR = [
                { name: { contains: filters.q } },
                { description: { contains: filters.q } },
            ];
        }
        const products = await this.prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: "desc" },
        });
        return {
            data: products,
            pagination: {
                total: products.length,
            },
        };
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);

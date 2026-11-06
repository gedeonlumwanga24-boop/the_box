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
exports.AdminCategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminCategoriesService = class AdminCategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const categories = await this.prisma.category.findMany({
            include: {
                parent: { select: { id: true, name: true } },
                _count: { select: { products: true } },
            },
            orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        });
        return categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentId: c.parentId,
            parentName: c.parent?.name ?? null,
            displayOrder: c.displayOrder,
            image: c.image,
            productsCount: c._count.products,
        }));
    }
    slugify(value) {
        return value
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    }
    async create(input) {
        const name = input.name?.trim();
        if (!name)
            throw new common_1.BadRequestException("Le nom est requis");
        const slug = input.slug?.trim() || this.slugify(name);
        if (!slug)
            throw new common_1.BadRequestException("Slug invalide");
        const existing = await this.prisma.category.findUnique({ where: { slug } });
        if (existing)
            throw new common_1.BadRequestException("Ce slug existe déjà");
        if (input.parentId != null) {
            const parent = await this.prisma.category.findUnique({
                where: { id: input.parentId },
            });
            if (!parent)
                throw new common_1.BadRequestException("Catégorie parente introuvable");
            if (parent.parentId != null) {
                throw new common_1.BadRequestException("Impossible d'imbriquer au-delà d'un niveau");
            }
        }
        return this.prisma.category.create({
            data: {
                name,
                slug,
                parentId: input.parentId ?? null,
                displayOrder: input.displayOrder ?? 0,
                image: input.image?.trim() || null,
            },
        });
    }
    async update(id, input) {
        const current = await this.prisma.category.findUnique({ where: { id } });
        if (!current)
            throw new common_1.NotFoundException("Catégorie introuvable");
        const data = {};
        if (input.name !== undefined) {
            const name = input.name.trim();
            if (!name)
                throw new common_1.BadRequestException("Le nom est requis");
            data.name = name;
        }
        if (input.slug !== undefined) {
            const slug = input.slug.trim() || this.slugify(String(data.name ?? current.name));
            if (!slug)
                throw new common_1.BadRequestException("Slug invalide");
            const clash = await this.prisma.category.findUnique({ where: { slug } });
            if (clash && clash.id !== id)
                throw new common_1.BadRequestException("Ce slug existe déjà");
            data.slug = slug;
        }
        if (input.parentId !== undefined) {
            if (input.parentId === id) {
                throw new common_1.BadRequestException("Une catégorie ne peut pas être son propre parent");
            }
            if (input.parentId != null) {
                const parent = await this.prisma.category.findUnique({
                    where: { id: input.parentId },
                });
                if (!parent)
                    throw new common_1.BadRequestException("Catégorie parente introuvable");
                if (parent.parentId != null) {
                    throw new common_1.BadRequestException("Impossible d'imbriquer au-delà d'un niveau");
                }
            }
            data.parentId = input.parentId;
        }
        if (input.displayOrder !== undefined)
            data.displayOrder = input.displayOrder;
        if (input.image !== undefined)
            data.image = input.image?.trim() || null;
        return this.prisma.category.update({ where: { id }, data });
    }
    async remove(id) {
        const current = await this.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true, children: true } } },
        });
        if (!current)
            throw new common_1.NotFoundException("Catégorie introuvable");
        if (current._count.products > 0 || current._count.children > 0) {
            throw new common_1.BadRequestException("Impossible de supprimer : la catégorie contient des produits ou des sous-catégories");
        }
        return this.prisma.category.delete({ where: { id } });
    }
};
exports.AdminCategoriesService = AdminCategoriesService;
exports.AdminCategoriesService = AdminCategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminCategoriesService);

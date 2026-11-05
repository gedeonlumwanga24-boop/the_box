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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const parsePositiveInteger = (value, fallback) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};
let ProductsController = class ProductsController {
    products;
    constructor(products) {
        this.products = products;
    }
    findActive(category, query, page, pageSize, sort) {
        const allowedSorts = ["newest", "price-asc", "price-desc"];
        return this.products.findActive({
            category: category?.trim() || undefined,
            query,
            page: parsePositiveInteger(page, 1),
            pageSize: Math.min(parsePositiveInteger(pageSize, 12), 48),
            sort: allowedSorts.includes(sort)
                ? sort
                : "newest",
        });
    }
    async findActiveBySlug(slug) {
        const product = await this.products.findActiveBySlug(slug);
        if (!product) {
            throw new common_1.NotFoundException("Product not found");
        }
        return product;
    }
    async create(body) {
        return this.products.createOne({
            name: body.name,
            category: body.category ?? "Autre",
            price: Number(body.price ?? 0),
            stock: Number(body.stock ?? 0),
            description: body.description,
            image: body.image,
            gallery: body.gallery,
        });
    }
    async update(id, body) {
        return this.products.updateOne(id, body);
    }
    async remove(id) {
        return this.products.removeOne(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)("category")),
    __param(1, (0, common_1.Query)("q")),
    __param(2, (0, common_1.Query)("page")),
    __param(3, (0, common_1.Query)("pageSize")),
    __param(4, (0, common_1.Query)("sort")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(":slug"),
    __param(0, (0, common_1.Param)("slug")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "findActiveBySlug", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "remove", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)("products"),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map
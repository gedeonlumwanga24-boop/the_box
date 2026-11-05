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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const userId = BigInt(id);
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { profile: true },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email.toLowerCase(),
                passwordHash: data.passwordHash,
                role: data.role,
            },
        });
    }
    async createClientProfile(userId) {
        const userBigInt = BigInt(userId);
        return this.prisma.client.create({
            data: {
                userId: userBigInt,
            },
        });
    }
    async updateProfile(userId, data) {
        const userBigInt = BigInt(userId);
        const userUpdate = {};
        if (data.name) {
            userUpdate.name = data.name;
        }
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.update({
                where: { id: userBigInt },
                data: userUpdate,
            });
            const profile = await tx.client.upsert({
                where: { userId: userBigInt },
                create: {
                    userId: userBigInt,
                    phone: data.phone ?? null,
                    address: data.address ?? null,
                    city: data.city ?? null,
                },
                update: {
                    phone: data.phone ?? null,
                    address: data.address ?? null,
                    city: data.city ?? null,
                },
            });
            return { user, profile };
        });
    }
    async getAllUsers(includeDeleted = false) {
        return this.prisma.user.findMany({
            where: includeDeleted ? undefined : { deletedAt: null },
            include: { profile: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateUserRole(userId, role) {
        const userBigInt = BigInt(userId);
        return this.prisma.user.update({
            where: { id: userBigInt },
            data: { role },
        });
    }
    async softDeleteUser(userId) {
        const userBigInt = BigInt(userId);
        return this.prisma.user.update({
            where: { id: userBigInt },
            data: { deletedAt: new Date() },
        });
    }
    async restoreUser(userId) {
        const userBigInt = BigInt(userId);
        return this.prisma.user.update({
            where: { id: userBigInt },
            data: { deletedAt: null },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map
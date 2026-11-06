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
exports.AdminMessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminMessagesService = class AdminMessagesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const messages = await this.prisma.message.findMany({
            orderBy: { createdAt: "desc" },
        });
        return messages.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            subject: m.subject,
            message: m.message,
            status: m.status ?? "pending",
            adminResponse: m.adminResponse,
            createdAt: m.createdAt,
        }));
    }
    async findOne(id) {
        const message = await this.prisma.message.findUnique({ where: { id } });
        if (!message)
            throw new common_1.NotFoundException("Message introuvable");
        if (message.status !== "lu" && message.status !== "répondu") {
            await this.prisma.message.update({
                where: { id },
                data: { status: "lu", readAt: new Date() },
            });
        }
        return {
            id: message.id,
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            status: message.status ?? "pending",
            adminResponse: message.adminResponse,
            respondedAt: message.respondedAt,
            createdAt: message.createdAt,
        };
    }
    async reply(id, reply) {
        const text = reply.trim();
        if (!text)
            throw new common_1.BadRequestException("La réponse est requise");
        const message = await this.prisma.message.findUnique({ where: { id } });
        if (!message)
            throw new common_1.NotFoundException("Message introuvable");
        return this.prisma.message.update({
            where: { id },
            data: {
                adminResponse: text,
                respondedAt: new Date(),
                status: "répondu",
            },
        });
    }
};
exports.AdminMessagesService = AdminMessagesService;
exports.AdminMessagesService = AdminMessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminMessagesService);

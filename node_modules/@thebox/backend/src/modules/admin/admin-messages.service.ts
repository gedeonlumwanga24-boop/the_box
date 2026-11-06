import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminMessagesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: number) {
    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException("Message introuvable");

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

  async reply(id: number, reply: string) {
    const text = reply.trim();
    if (!text) throw new BadRequestException("La réponse est requise");

    const message = await this.prisma.message.findUnique({ where: { id } });
    if (!message) throw new NotFoundException("Message introuvable");

    return this.prisma.message.update({
      where: { id },
      data: {
        adminResponse: text,
        respondedAt: new Date(),
        status: "répondu",
      },
    });
  }
}

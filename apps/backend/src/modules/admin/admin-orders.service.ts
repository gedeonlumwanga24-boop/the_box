import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findOne(id: number) {
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

    if (!order) throw new NotFoundException("Commande introuvable");

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
}

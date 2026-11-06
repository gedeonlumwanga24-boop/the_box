import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    const [
      totalCommandes,
      totalProduits,
      totalClients,
      paidOrders,
      topCategoryAgg,
      ordersByStatus,
      recentOrders,
      monthlySales,
    ] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: "client" } }),
      this.prisma.order.findMany({
        where: { paymentStatus: "payee" },
        select: { total: true },
      }),
      this.prisma.category.findFirst({
        orderBy: { products: { _count: "desc" } },
        select: { name: true, _count: { select: { products: true } } },
      }),
      this.prisma.order.groupBy({
        by: ["statut"],
        _count: { _all: true },
      }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      this.monthlySales(),
    ]);

    const chiffreAffaires = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const panierMoyen =
      paidOrders.length > 0 ? chiffreAffaires / paidOrders.length : 0;
    const tauxConversion =
      totalClients > 0
        ? Math.min(100, (totalCommandes / totalClients) * 100)
        : 0;

    return {
      kpis: {
        chiffreAffaires,
        totalCommandes,
        totalProduits,
        totalClients,
      },
      market: {
        panierMoyen,
        topCategorie: topCategoryAgg?.name ?? null,
        tauxConversion,
      },
      charts: {
        sales: monthlySales,
        traffic: {
          labels: monthlySales.labels,
          visitors: monthlySales.data.map((v) => Math.round(v / 50000)),
          pageViews: monthlySales.data.map((v) => Math.round(v / 30000)),
        },
        orders: {
          labels: ordersByStatus.map((s) =>
            s.statut
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" "),
          ),
          data: ordersByStatus.map((s) => s._count._all),
        },
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        client: order.user?.name ?? "Client inconnu",
        date: order.createdAt,
        statut: order.statut,
        total: order.total,
        itemsCount: order.items.length,
      })),
    };
  }

  private async monthlySales() {
    const now = new Date();
    const labels: string[] = [];
    const months: { start: Date; end: Date; label: string }[] = [];

    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      labels.push(`Mois ${start.getMonth() + 1}`);
      months.push({
        start,
        end,
        label: `Mois ${start.getMonth() + 1}`,
      });
    }

    const orders = await this.prisma.order.findMany({
      where: {
        paymentStatus: "payee",
        createdAt: { gte: months[0].start },
      },
      select: { total: true, createdAt: true },
    });

    const data = months.map((m) =>
      orders
        .filter((o) => o.createdAt >= m.start && o.createdAt < m.end)
        .reduce((sum, o) => sum + o.total, 0),
    );

    return { labels, data };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const rows = await this.prisma.category.findMany({
      include: { children: true },
      orderBy: { name: 'asc' },
    });

    const categoryMap = new Map<number, any>();

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

  async getProducts(filters?: { category?: string; q?: string }) {
    const where: any = {};

    if (filters?.category) {
      where.category = {
        OR: [
          { slug: filters.category },
          { children: { some: { slug: filters.category } } },
        ],
      };
    }

    if (filters?.q) {
      where.OR = [
        { name: { contains: filters.q } },
        { description: { contains: filters.q } },
      ];
    }

    const items = await this.prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: items,
      pagination: { total: items.length },
    };
  }
}

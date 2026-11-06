import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const rows = await this.prisma.category.findMany({
      include: {
        children: {
          orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
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

  async getProducts(filters: { category?: string; q?: string } = {}) {
    const where: Record<string, any> = {};

    if (filters.category) {
      const allCategories = await this.prisma.category.findMany({
        select: { id: true, slug: true, parentId: true },
      });

      const slugToId = new Map(allCategories.map((c) => [c.slug, c.id]));
      const childrenByParent = new Map<number, typeof allCategories>();
      for (const category of allCategories) {
        if (category.parentId != null) {
          const siblings = childrenByParent.get(category.parentId) ?? [];
          siblings.push(category);
          childrenByParent.set(category.parentId, siblings);
        }
      }

      const slugs = new Set<string>([filters.category]);
      const queue: number[] = [];
      const rootId = slugToId.get(filters.category);
      if (rootId != null) queue.push(rootId);

      while (queue.length > 0) {
        const parentId = queue.pop() as number;
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
}

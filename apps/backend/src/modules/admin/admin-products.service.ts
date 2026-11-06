import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(input: {
    name: string;
    category?: string;
    categoryId?: number;
    price: number;
    stock: number;
    description?: string;
    imageUrl?: string;
  }) {
    let category: { id: number } | null = null;

    if (input.categoryId != null) {
      category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
    }

    if (!category) {
      const categoryName = input.category?.trim() || "Autre";
      const categorySlug = this.slugify(categoryName) || "autre";

      category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
          },
        });
      }
    }

    const name = input.name?.trim() || "Produit sans nom";

    return this.prisma.product.create({
      data: {
        name,
        slug: `${this.slugify(name)}-${Date.now()}`,
        description: input.description?.trim() || null,
        price: Number(input.price ?? 0),
        stock: Number(input.stock ?? 0),
        image: input.imageUrl?.trim() || null,
        categoryId: category.id,
      },
      include: { category: true },
    });
  }

  async update(
    id: number,
    input: {
      name?: string;
      category?: string;
      categoryId?: number;
      price?: number;
      stock?: number;
      description?: string;
      imageUrl?: string;
    },
  ) {
    const current = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!current) {
      throw new Error("Product not found");
    }

    let category: { id: number } | null = null;

    if (input.categoryId != null) {
      category = await this.prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { id: true },
      });
    }

    if (!category) {
      const categoryName =
        input.category?.trim() || current.category?.name || "Autre";
      const categorySlug = this.slugify(categoryName) || "autre";

      category = await this.prisma.category.findUnique({
        where: { slug: categorySlug },
      });

      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: categoryName,
            slug: categorySlug,
          },
        });
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: input.name?.trim() || current.name,
        description:
          input.description !== undefined
            ? input.description.trim() || null
            : current.description,
        price: input.price !== undefined ? Number(input.price) : current.price,
        stock: input.stock !== undefined ? Number(input.stock) : current.stock,
        image:
          input.imageUrl !== undefined
            ? input.imageUrl.trim() || null
            : current.image,
        categoryId: category.id,
        slug:
          input.name && input.name.trim()
            ? `${this.slugify(input.name)}-${id}`
            : current.slug,
      },
      include: { category: true },
    });
  }

  async remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
      include: { category: true },
    });
  }

  private slugify(value: string) {
    return (value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120);
  }
}

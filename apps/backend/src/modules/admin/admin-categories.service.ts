import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

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

  private slugify(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async create(input: {
    name: string;
    slug?: string;
    parentId?: number | null;
    displayOrder?: number;
    image?: string | null;
  }) {
    const name = input.name?.trim();
    if (!name) throw new BadRequestException("Le nom est requis");

    const slug = input.slug?.trim() || this.slugify(name);
    if (!slug) throw new BadRequestException("Slug invalide");

    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) throw new BadRequestException("Ce slug existe déjà");

    if (input.parentId != null) {
      const parent = await this.prisma.category.findUnique({
        where: { id: input.parentId },
      });
      if (!parent) throw new BadRequestException("Catégorie parente introuvable");
      if (parent.parentId != null) {
        throw new BadRequestException("Impossible d'imbriquer au-delà d'un niveau");
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

  async update(
    id: number,
    input: {
      name?: string;
      slug?: string;
      parentId?: number | null;
      displayOrder?: number;
      image?: string | null;
    },
  ) {
    const current = await this.prisma.category.findUnique({ where: { id } });
    if (!current) throw new NotFoundException("Catégorie introuvable");

    const data: Record<string, unknown> = {};
    if (input.name !== undefined) {
      const name = input.name.trim();
      if (!name) throw new BadRequestException("Le nom est requis");
      data.name = name;
    }
    if (input.slug !== undefined) {
      const slug = input.slug.trim() || this.slugify(String(data.name ?? current.name));
      if (!slug) throw new BadRequestException("Slug invalide");
      const clash = await this.prisma.category.findUnique({ where: { slug } });
      if (clash && clash.id !== id) throw new BadRequestException("Ce slug existe déjà");
      data.slug = slug;
    }
    if (input.parentId !== undefined) {
      if (input.parentId === id) {
        throw new BadRequestException("Une catégorie ne peut pas être son propre parent");
      }
      if (input.parentId != null) {
        const parent = await this.prisma.category.findUnique({
          where: { id: input.parentId },
        });
        if (!parent) throw new BadRequestException("Catégorie parente introuvable");
        if (parent.parentId != null) {
          throw new BadRequestException("Impossible d'imbriquer au-delà d'un niveau");
        }
      }
      data.parentId = input.parentId;
    }
    if (input.displayOrder !== undefined) data.displayOrder = input.displayOrder;
    if (input.image !== undefined) data.image = input.image?.trim() || null;

    return this.prisma.category.update({ where: { id }, data });
  }

  async remove(id: number) {
    const current = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!current) throw new NotFoundException("Catégorie introuvable");
    if (current._count.products > 0 || current._count.children > 0) {
      throw new BadRequestException(
        "Impossible de supprimer : la catégorie contient des produits ou des sous-catégories",
      );
    }
    return this.prisma.category.delete({ where: { id } });
  }
}

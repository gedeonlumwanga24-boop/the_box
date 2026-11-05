import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const shoes = await prisma.category.upsert({
    where: { slug: 'chaussures' },
    update: {},
    create: { name: 'Chaussures', slug: 'chaussures' },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: 'vetements' },
    update: {},
    create: { name: 'Vêtements', slug: 'vetements' },
  });

  const accessories = await prisma.category.upsert({
    where: { slug: 'accessoires' },
    update: {},
    create: { name: 'Accessoires', slug: 'accessoires' },
  });

  const subcats = [
    { name: 'Sneakers', slug: 'sneakers', parentId: shoes.id },
    { name: 'Baskets', slug: 'baskets', parentId: shoes.id },
    { name: 'Sandales', slug: 'sandales', parentId: shoes.id },
    { name: 'Mocassins', slug: 'mocassins', parentId: shoes.id },
    { name: 'Bottes', slug: 'bottes', parentId: shoes.id },
    { name: 'T-shirts', slug: 't-shirts', parentId: clothing.id },
    { name: 'Polos', slug: 'polos', parentId: clothing.id },
    { name: 'Pantalons', slug: 'pantalons', parentId: clothing.id },
    { name: 'Vestes', slug: 'vestes', parentId: clothing.id },
    { name: 'Pulls', slug: 'pulls', parentId: clothing.id },
    { name: 'Sacs', slug: 'sacs', parentId: accessories.id },
    { name: 'Montres', slug: 'montres', parentId: accessories.id },
    { name: 'Casquettes', slug: 'casquettes', parentId: accessories.id },
    { name: 'Lunettes', slug: 'lunettes', parentId: accessories.id },
    { name: 'Bijoux', slug: 'bijoux', parentId: accessories.id },
  ];

  const created = [] as any[];
  for (const item of subcats) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        name: item.name,
        slug: item.slug,
        parentId: item.parentId,
      },
    });
    created.push(category);
  }

  const products = [
    { name: 'Air Luxe Runner', slug: 'air-luxe-runner', price: 179000, categorySlug: 'sneakers' },
    { name: 'Urban Drift', slug: 'urban-drift', price: 149000, categorySlug: 'baskets' },
    { name: 'Soleo Sandal', slug: 'soleo-sandal', price: 99000, categorySlug: 'sandales' },
    { name: 'Cairo Moc', slug: 'cairo-moc', price: 129000, categorySlug: 'mocassins' },
    { name: 'Alto Boot', slug: 'alto-boot', price: 189000, categorySlug: 'bottes' },
    { name: 'Signature Tee', slug: 'signature-tee', price: 45000, categorySlug: 't-shirts' },
    { name: 'Monarch Polo', slug: 'monarch-polo', price: 52000, categorySlug: 'polos' },
    { name: 'Linea Trouser', slug: 'linea-trouser', price: 62000, categorySlug: 'pantalons' },
    { name: 'Noir Aero Jacket', slug: 'noir-aero-jacket', price: 84000, categorySlug: 'vestes' },
    { name: 'Core Knit Pull', slug: 'core-knit-pull', price: 76000, categorySlug: 'pulls' },
    { name: 'Levo Tote', slug: 'levo-tote', price: 68000, categorySlug: 'sacs' },
    { name: 'Aster Watch', slug: 'aster-watch', price: 210000, categorySlug: 'montres' },
    { name: 'Milan Cap', slug: 'milan-cap', price: 39000, categorySlug: 'casquettes' },
    { name: 'Apex Sunglasses', slug: 'apex-sunglasses', price: 115000, categorySlug: 'lunettes' },
    { name: 'Halo Necklace', slug: 'halo-necklace', price: 138000, categorySlug: 'bijoux' },
  ];

  for (const product of products) {
    const category = await prisma.category.findUnique({ where: { slug: product.categorySlug } });
    if (!category) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        categoryId: category.id,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: 'Produit premium sélectionné pour cette sous-catégorie.',
        price: product.price,
        imageUrl: 'https://images.unsplash.com/…',
        categoryId: category.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

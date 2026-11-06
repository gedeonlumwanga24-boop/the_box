import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  // Nettoyage des données de test Prisma
  await prisma.product.deleteMany({
    where: { category: { slug: 'electronics' } },
  });
  await prisma.category.deleteMany({
    where: { slug: 'electronics' },
  });

  const chaussures = await prisma.category.upsert({
    where: { slug: 'chaussures' },
    update: { name: 'Chaussures', displayOrder: 1 },
    create: { name: 'Chaussures', slug: 'chaussures', displayOrder: 1 },
  });

  const vetements = await prisma.category.upsert({
    where: { slug: 'vetements' },
    update: { name: 'Vêtements', displayOrder: 2 },
    create: { name: 'Vêtements', slug: 'vetements', displayOrder: 2 },
  });

  const accessoires = await prisma.category.upsert({
    where: { slug: 'accessoires' },
    update: { name: 'Accessoires', displayOrder: 3 },
    create: { name: 'Accessoires', slug: 'accessoires', displayOrder: 3 },
  });

  const subcategories = [
    { name: 'Lifestyle', slug: 'lifestyle', parentId: chaussures.id, displayOrder: 1 },
    { name: 'Jordan', slug: 'jordan', parentId: chaussures.id, displayOrder: 2 },
    { name: 'Basketball', slug: 'basketball', parentId: chaussures.id, displayOrder: 3 },
    { name: 'Sneakers', slug: 'sneakers', parentId: chaussures.id, displayOrder: 4 },
    { name: 'Sweats à capuche et sweats', slug: 'sweats-a-capuche-et-sweats', parentId: vetements.id, displayOrder: 1 },
    { name: 'Pantalons et leggings', slug: 'pantalons-et-leggings', parentId: vetements.id, displayOrder: 2 },
    { name: 'Survêtements', slug: 'survetements', parentId: vetements.id, displayOrder: 3 },
    { name: 'Vestes', slug: 'vestes', parentId: vetements.id, displayOrder: 4 },
    { name: 'Hauts et t-shirts', slug: 'hauts-et-t-shirts', parentId: vetements.id, displayOrder: 5 },
    { name: 'Shorts', slug: 'shorts', parentId: vetements.id, displayOrder: 6 },
    { name: 'Tenues et maillots d’équipe', slug: 'tenues-et-maillots-equipe', parentId: vetements.id, displayOrder: 7 },
    { name: 'Chaussettes', slug: 'chaussettes', parentId: accessoires.id, displayOrder: 1 },
    { name: 'Sacs et sacs à dos', slug: 'sacs-et-sacs-a-dos', parentId: accessoires.id, displayOrder: 2 },
    { name: 'Casquettes', slug: 'casquettes', parentId: accessoires.id, displayOrder: 3 },
    { name: 'Lunettes de soleil', slug: 'lunettes-de-soleil', parentId: accessoires.id, displayOrder: 4 },
  ];

  const categoryIds = new Map<string, number>();
  for (const item of subcategories) {
    const category = await prisma.category.upsert({
      where: { slug: item.slug },
      update: { name: item.name, parentId: item.parentId, displayOrder: item.displayOrder },
      create: {
        name: item.name,
        slug: item.slug,
        parentId: item.parentId,
        displayOrder: item.displayOrder,
      },
    });
    categoryIds.set(item.slug, category.id);
  }

  const products = [
    {
      name: 'Air Max Noir',
      slug: 'air-max-noir',
      price: 196000,
      stock: 12,
      categorySlug: 'sneakers',
      image: unsplash('photo-1542291026-7eec264c27ff'),
      description: 'Sneaker premium pensée pour le quotidien, alliant style et confort.',
    },
    {
      name: 'Basket Speed',
      slug: 'basket-speed',
      price: 214000,
      stock: 8,
      categorySlug: 'sneakers',
      image: unsplash('photo-1600185365483-26d7a4cc7519'),
      description: 'Confort et style pour les journées intenses.',
    },
    {
      name: 'Runner Pro Blanc',
      slug: 'runner-pro-blanc',
      price: 178000,
      stock: 15,
      categorySlug: 'lifestyle',
      image: unsplash('photo-1608231387042-66d1773070a5'),
      description: 'Silhouette épurée et semelle amortie pour un look casual premium.',
    },
    {
      name: 'Jordan Elevate',
      slug: 'jordan-elevate',
      price: 245000,
      stock: 6,
      categorySlug: 'jordan',
      image: unsplash('photo-1552346154-21d32810baa3'),
      description: 'Édition basketball inspirée des icônes du streetwear.',
    },
    {
      name: 'Court Classic',
      slug: 'court-classic',
      price: 189000,
      stock: 10,
      categorySlug: 'basketball',
      image: unsplash('photo-1549298916-b41d501d3772'),
      description: 'La basket de terrain revisitée avec des matériaux premium.',
    },
    {
      name: 'Sweat Oversize Noir',
      slug: 'sweat-oversize-noir',
      price: 89000,
      stock: 20,
      categorySlug: 'sweats-a-capuche-et-sweats',
      image: unsplash('photo-1556821840-3a63f95609a7'),
      description: 'Sweat premium coupe droite, idéal pour un look urbain.',
    },
    {
      name: 'Hoodie Essential Gris',
      slug: 'hoodie-essential-gris',
      price: 95000,
      stock: 18,
      categorySlug: 'sweats-a-capuche-et-sweats',
      image: unsplash('photo-1503341504253-dff4815485f1'),
      description: 'Hoodie doux et chaud, coupe oversize confortable.',
    },
    {
      name: 'Pantalon Tech Slim',
      slug: 'pantalon-tech-slim',
      price: 72000,
      stock: 25,
      categorySlug: 'pantalons-et-leggings',
      image: unsplash('photo-1620799140408-edc6dcb6d633'),
      description: 'Pantalon slim aux finitions techniques, parfait au quotidien.',
    },
    {
      name: 'Legging Performance',
      slug: 'legging-performance',
      price: 48000,
      stock: 30,
      categorySlug: 'pantalons-et-leggings',
      image: unsplash('photo-1518459031867-a89b944bffe4'),
      description: 'Legging respirant pensé pour le sport et la ville.',
    },
    {
      name: 'Survêtement City',
      slug: 'survetement-city',
      price: 110000,
      stock: 14,
      categorySlug: 'survetements',
      image: unsplash('photo-1556906781-9a412961c28c'),
      description: 'Ensemble survêtement premium pour un style affirmé.',
    },
    {
      name: 'Veste Tech Noire',
      slug: 'veste-tech-noire',
      price: 145000,
      stock: 9,
      categorySlug: 'vestes',
      image: unsplash('photo-1551028719-00167b16eac5'),
      description: 'Veste technique légère, coupe moderne et imperméable.',
    },
    {
      name: 'T-Shirt Logo Blanc',
      slug: 'tshirt-logo-blanc',
      price: 35000,
      stock: 40,
      categorySlug: 'hauts-et-t-shirts',
      image: unsplash('photo-1521572163474-6864f9cf17ab'),
      description: 'T-shirt premium en coton peigné, col renforcé.',
    },
    {
      name: 'Polo City',
      slug: 'polo-city',
      price: 42000,
      stock: 22,
      categorySlug: 'hauts-et-t-shirts',
      image: unsplash('photo-1621072156002-e2fccdc0b176'),
      description: 'Polo élégant, matière respirante et coupe ajustée.',
    },
    {
      name: 'Short Training',
      slug: 'short-training',
      price: 38000,
      stock: 28,
      categorySlug: 'shorts',
      image: unsplash('photo-1591195853828-11db59a44f6b'),
      description: 'Short de sport polyvalent, léger et rapide à séchage.',
    },
    {
      name: 'Maillot Equipe',
      slug: 'maillot-equipe',
      price: 58000,
      stock: 16,
      categorySlug: 'tenues-et-maillots-equipe',
      image: unsplash('photo-1579952363873-27f3bade9f55'),
      description: 'Maillot d’équipe respirant, prêt pour la performance.',
    },
    {
      name: 'Chaussettes Premium x3',
      slug: 'chaussettes-premium-x3',
      price: 15000,
      stock: 60,
      categorySlug: 'chaussettes',
      image: unsplash('photo-1586350977771-b3b0abd50c82'),
      description: 'Lot de 3 paires de chaussettes techniques anti-odeur.',
    },
    {
      name: 'Sac à dos Urban',
      slug: 'sac-a-dos-urban',
      price: 95000,
      stock: 11,
      categorySlug: 'sacs-et-sacs-a-dos',
      image: unsplash('photo-1553062407-98eeb64c6a62'),
      description: 'Sac à dos urbain avec compartiment ordinateur.',
    },
    {
      name: 'Casquette City',
      slug: 'casquette-city',
      price: 28000,
      stock: 35,
      categorySlug: 'casquettes',
      image: unsplash('photo-1588850561400-8f8a5e5f1c1f'),
      description: 'Casquette structurée en coton bio, logo brodé.',
    },
    {
      name: 'Lunettes Soleil Noires',
      slug: 'lunettes-soleil-noires',
      price: 88000,
      stock: 13,
      categorySlug: 'lunettes-de-soleil',
      image: unsplash('photo-1577803947579-9faaed0a5b8d'),
      description: 'Lunettes de soleil premium aux verres polarisés.',
    },
  ];

  for (const product of products) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        image: product.image,
        categoryId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId,
      },
    });
  }

  console.log('Seed terminé : catégories et produits The Box insérés.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type { NavCategory } from "./components/StorefrontNavbar";
import { apiOrigin } from "../shared/api";

export const resolveMediaUrl = (src?: string | null): string => {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${apiOrigin}${src}`;
  if (src.startsWith("uploads/")) return `${apiOrigin}/${src}`;
  return src;
};

export const defaultProductImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

export type CategoryNode = NavCategory & {
  parentId?: string | number | null;
  image?: string | null;
};

export type ProductItem = {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  imageUrl?: string | null;
  gallery?: unknown;
  stock?: number;
  createdAt?: string;
  category?: {
    id: string | number;
    name: string;
    slug: string;
  } | null;
  sizes?: { label?: string; available?: boolean }[] | string[];
  promotion?: boolean;
  promo?: boolean;
  oldPrice?: number | string | null;
  compareAtPrice?: number | string | null;
};

export type SortOption = "recent" | "price_asc" | "price_desc";

export const fallbackCategories: CategoryNode[] = [
  {
    id: "chaussures",
    name: "Chaussures",
    slug: "chaussures",
    parentId: null,
    children: [
      { id: "lifestyle", name: "Lifestyle", slug: "lifestyle", parentId: "chaussures" },
      { id: "jordan", name: "Jordan", slug: "jordan", parentId: "chaussures" },
      { id: "basketball", name: "Basketball", slug: "basketball", parentId: "chaussures" },
      { id: "sneakers", name: "Sneakers", slug: "sneakers", parentId: "chaussures" },
    ],
  },
  {
    id: "vetements",
    name: "Vêtements",
    slug: "vetements",
    parentId: null,
    children: [
      { id: "sweats", name: "Sweats à capuche et sweats", slug: "sweats-a-capuche-et-sweats", parentId: "vetements" },
      { id: "pantalons", name: "Pantalons et leggings", slug: "pantalons-et-leggings", parentId: "vetements" },
      { id: "survetements", name: "Survêtements", slug: "survetements", parentId: "vetements" },
      { id: "vestes", name: "Vestes", slug: "vestes", parentId: "vetements" },
      { id: "hauts", name: "Hauts et t-shirts", slug: "hauts-et-t-shirts", parentId: "vetements" },
      { id: "shorts", name: "Shorts", slug: "shorts", parentId: "vetements" },
      { id: "tenues", name: "Tenues et maillots d'équipe", slug: "tenues-et-maillots-equipe", parentId: "vetements" },
    ],
  },
  {
    id: "accessoires",
    name: "Accessoires",
    slug: "accessoires",
    parentId: null,
    children: [
      { id: "chaussettes", name: "Chaussettes", slug: "chaussettes", parentId: "accessoires" },
      { id: "sacs", name: "Sacs et sacs à dos", slug: "sacs-et-sacs-a-dos", parentId: "accessoires" },
      { id: "casquettes", name: "Casquettes", slug: "casquettes", parentId: "accessoires" },
      { id: "lunettes", name: "Lunettes de soleil", slug: "lunettes-de-soleil", parentId: "accessoires" },
    ],
  },
];

export const fallbackProducts: ProductItem[] = [
  {
    id: "shoe-1",
    name: "Air Max Noir",
    slug: "air-max-noir",
    description: "Sneaker premium pensée pour le quotidien.",
    price: 196000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    category: { id: "sneakers", name: "Sneakers", slug: "sneakers" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "shoe-2",
    name: "Basket Speed",
    slug: "basket-speed",
    description: "Confort et style pour les journées intenses.",
    price: 214000,
    image:
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
    category: { id: "baskets", name: "Baskets", slug: "baskets" },
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "shoe-3",
    name: "Runner Pro Blanc",
    slug: "runner-pro-blanc",
    description: "Silhouette épurée, semelle amortie.",
    price: 178000,
    image:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
    category: { id: "sneakers", name: "Sneakers", slug: "sneakers" },
    createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
  },
  {
    id: "cloth-1",
    name: "Sweat Oversize Noir",
    slug: "sweat-oversize-noir",
    description: "Sweat premium coupe droite.",
    price: 89000,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    category: { id: "sweats", name: "Sweats", slug: "sweats-a-capuche-et-sweats" },
    createdAt: new Date().toISOString(),
  },
  {
    id: "glass-1",
    name: "Sunglasses Noir",
    slug: "sunglasses-noir",
    description: "Accessoire premium pour un look clean.",
    price: 98000,
    image:
      "https://images.unsplash.com/photo-1577803947579-9faaed0a5b8d?auto=format&fit=crop&w=900&q=80",
    category: { id: "lunettes", name: "Lunettes", slug: "lunettes-de-soleil" },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "bag-1",
    name: "Sac de sport",
    slug: "sac-de-sport",
    description: "Une finition premium et un espace pratique.",
    price: 156000,
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
    category: { id: "sacs", name: "Sacs", slug: "sacs-et-sacs-a-dos" },
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const SIZE_OPTIONS = [
  "38", "39", "40", "41", "42", "43", "44", "45", "XS", "S", "M", "L", "XL",
];

export const productPrice = (product: ProductItem) => Number(product.price ?? 0);

export const productImage = (product: ProductItem) => {
  const raw = (() => {
    if (product.image) return product.image;
    if (product.imageUrl) return product.imageUrl;
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      const first = product.gallery[0];
      if (typeof first === "string") return first;
      if (first && typeof first === "object" && "src" in first) {
        return String((first as { src?: string }).src ?? defaultProductImage);
      }
      if (first && typeof first === "object" && "url" in first) {
        return String((first as { url?: string }).url ?? defaultProductImage);
      }
    }
    return defaultProductImage;
  })();
  return resolveMediaUrl(raw) || defaultProductImage;
};

export const isRecentProduct = (product: ProductItem) => {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 1000 * 60 * 60 * 24 * 30;
};

export const cardSubtitle = (categoryName?: string | null) => {
  const label = (categoryName ?? "").toLowerCase();
  if (label.includes("vêtement") || label.includes("vetement")) {
    return "Vêtement The Box";
  }
  if (label.includes("accessoire")) {
    return "Accessoire The Box";
  }
  return "Chaussure The Box";
};

export const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} CDF`;

export const buildCategoryTree = (categories: CategoryNode[]): CategoryNode[] => {
  const nodes = new Map<string, CategoryNode>();

  const collect = (items: CategoryNode[]) => {
    items.forEach((item) => {
      if (!nodes.has(String(item.id))) {
        nodes.set(String(item.id), {
          ...item,
          image: item.image ? resolveMediaUrl(item.image) : item.image,
          children: [],
        });
      }
      if (item.children?.length) collect(item.children);
    });
  };
  collect(categories);

  const roots: CategoryNode[] = [];
  nodes.forEach((node) => {
    const parent =
      node.parentId != null ? nodes.get(String(node.parentId)) : undefined;
    if (parent) {
      parent.children = parent.children ?? [];
      if (!parent.children.some((child) => String(child.id) === String(node.id))) {
        parent.children.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
};

export const buildCategoryParentNames = (
  tree: CategoryNode[],
): Map<string, string> => {
  const map = new Map<string, string>();
  const walk = (nodes: CategoryNode[], parentName = "") => {
    nodes.forEach((node) => {
      map.set(node.slug, parentName);
      if (node.children?.length) walk(node.children, node.name);
    });
  };
  walk(tree);
  return map;
};

import { useEffect, useMemo, useState } from "react";
import { StorefrontNavbar, type NavCategory } from "../components/StorefrontNavbar";
import { SiteFooter } from "../components/SiteFooter";
import { ProductPage } from "./ProductPage";
import { apiRequest } from "../../shared/api";

const defaultProductImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

type CategoryNode = NavCategory & {
  parentId?: string | number | null;
};

type ProductItem = {
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

type SortOption = "recent" | "price_asc" | "price_desc";

const fallbackCategories: CategoryNode[] = [
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

const fallbackProducts: ProductItem[] = [
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

const SIZE_OPTIONS = ["38", "39", "40", "41", "42", "43", "44", "45", "XS", "S", "M", "L", "XL"];

const productPrice = (product: ProductItem) => Number(product.price ?? 0);

const productImage = (product: ProductItem) => {
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
};

const isRecentProduct = (product: ProductItem) => {
  if (!product.createdAt) return false;
  const created = new Date(product.createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 1000 * 60 * 60 * 24 * 30;
};

const cardSubtitle = (categoryName?: string | null) => {
  const label = (categoryName ?? "").toLowerCase();
  if (label.includes("vêtement") || label.includes("vetement")) {
    return "Vêtement The Box";
  }
  if (label.includes("accessoire")) {
    return "Accessoire The Box";
  }
  return "Chaussure The Box";
};

const formatPrice = (value: number) =>
  `${value.toLocaleString("fr-FR")} CDF`;

export function StorefrontPage() {
  const [categories, setCategories] =
    useState<CategoryNode[]>(fallbackCategories);
  const [products, setProducts] = useState<ProductItem[]>(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [promotionOnly, setPromotionOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiRequest<{ data?: CategoryNode[] } | CategoryNode[]>(
          "/catalog/categories",
        );
        const nextCategories = Array.isArray(response)
          ? response
          : (response.data ?? []);
        setCategories(
          nextCategories.length > 0 ? nextCategories : fallbackCategories,
        );
      } catch (error) {
        console.error("Failed to load categories", error);
        setCategories(fallbackCategories);
      }
    };

    const loadProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set("category", selectedCategory);
        if (query.trim()) params.set("q", query.trim());

        const response = await apiRequest<{ data?: ProductItem[] } | ProductItem[]>(
          "/catalog/products" + (params.toString() ? `?${params.toString()}` : ""),
        );
        const nextProducts = Array.isArray(response)
          ? response
          : (response.data ?? []);
        setProducts(nextProducts.length > 0 ? nextProducts : fallbackProducts);
      } catch (error) {
        console.error("Failed to load products", error);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };

    void loadCategories();
    void loadProducts();
  }, [query, selectedCategory]);

  const categoryTree = useMemo(() => {
    const nodes = new Map<string, CategoryNode>();

    const collect = (items: CategoryNode[]) => {
      items.forEach((item) => {
        if (!nodes.has(String(item.id))) {
          nodes.set(String(item.id), { ...item, children: [] });
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
  }, [categories]);

  const categoryParentNames = useMemo(() => {
    const map = new Map<string, string>();
    const walk = (nodes: CategoryNode[], parentName = "") => {
      nodes.forEach((node) => {
        map.set(node.slug, parentName);
        if (node.children?.length) walk(node.children, node.name);
      });
    };
    walk(categoryTree);
    return map;
  }, [categoryTree]);

  const categoryBySlug = useMemo(() => {
    const map = new Map<string, CategoryNode>();
    const walk = (nodes: CategoryNode[]) => {
      nodes.forEach((node) => {
        map.set(node.slug, node);
        if (node.children?.length) walk(node.children);
      });
    };
    walk(categoryTree);
    return map;
  }, [categoryTree]);

  const selectedCategorySlugs = useMemo(() => {
    if (!selectedCategory) return new Set<string>();
    const selected = categoryBySlug.get(selectedCategory);
    const slugs = new Set<string>([selectedCategory]);
    if (!selected) return slugs;
    const walk = (node: CategoryNode) => {
      node.children?.forEach((child) => {
        slugs.add(child.slug);
        walk(child);
      });
    };
    walk(selected);
    return slugs;
  }, [categoryBySlug, selectedCategory]);

  const sliderMax = useMemo(() => {
    const maxPrice = products.reduce((max, product) => Math.max(max, productPrice(product)), 0);
    return Math.max(50000, Math.ceil(maxPrice / 10000) * 10000);
  }, [products]);

  const effectivePrixMax = prixMax ?? sliderMax;

  const hasSizeData = useMemo(
    () =>
      products.some(
        (product) =>
          Array.isArray(product.sizes) &&
          product.sizes.length > 0 &&
          product.sizes.some((size) =>
            typeof size === "string" ? size.length > 0 : Boolean(size.label),
          ),
      ),
    [products],
  );

  const hasPromoData = useMemo(
    () =>
      products.some(
        (product) =>
          product.promotion === true ||
          product.promo === true ||
          product.oldPrice != null ||
          product.compareAtPrice != null,
      ),
    [products],
  );

  const sizeLabel = (size: { label?: string } | string): string =>
    typeof size === "string" ? size : (size?.label ?? "");

  const visibleProducts = useMemo(() => {
    const searched = query.trim().toLowerCase();

    let filtered = products.filter((product) => {
      if (selectedCategorySlugs.size > 0) {
        const slug = product.category?.slug ?? "";
        const idMatch = selectedCategory
          ? String(product.category?.id ?? "") === selectedCategory
          : false;
        if (!selectedCategorySlugs.has(slug) && !idMatch) return false;
      }

      if (effectivePrixMax < sliderMax && productPrice(product) > effectivePrixMax) {
        return false;
      }

      if (selectedSize && hasSizeData) {
        const sizes = product.sizes ?? [];
        const match = sizes.some((size) => sizeLabel(size) === selectedSize);
        if (!match) return false;
      }

      if (promotionOnly && hasPromoData) {
        const isPromo =
          product.promotion === true ||
          product.promo === true ||
          product.oldPrice != null ||
          product.compareAtPrice != null;
        if (!isPromo) return false;
      }

      if (searched) {
        const name = product.name.toLowerCase();
        const description = (product.description ?? "").toLowerCase();
        if (!name.includes(searched) && !description.includes(searched)) {
          return false;
        }
      }

      return true;
    });

    if (sort === "price_asc") {
      filtered = [...filtered].sort((a, b) => productPrice(a) - productPrice(b));
    } else if (sort === "price_desc") {
      filtered = [...filtered].sort((a, b) => productPrice(b) - productPrice(a));
    }

    return filtered;
  }, [
    products,
    query,
    selectedCategory,
    selectedCategorySlugs,
    effectivePrixMax,
    sliderMax,
    selectedSize,
    hasSizeData,
    promotionOnly,
    hasPromoData,
    sort,
  ]);

  const selectedProduct = useMemo(
    () =>
      products.find((product) => String(product.id) === String(selectedProductId)) ??
      fallbackProducts.find((product) => String(product.id) === String(selectedProductId)) ??
      null,
    [products, selectedProductId],
  );

  const handleSelectCategory = (slug?: string) => {
    setSelectedCategory(slug || undefined);
    setSelectedProductId(null);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedProductId(null);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setQuery("");
    setPrixMax(null);
    setSelectedSize(null);
    setPromotionOnly(false);
    setSort("recent");
    setSelectedProductId(null);
  };

  const closeFilters = () => setFiltersOpen(false);

  return (
    <div className="storefront-shell">
      <StorefrontNavbar
        categories={categoryTree}
        selectedCategory={selectedCategory}
        query={query}
        onSelectCategory={handleSelectCategory}
        onSearch={handleSearch}
      />

      {selectedProduct ? (
        <>
          <ProductPage
            product={selectedProduct}
            parentCategoryName={
              selectedProduct.category && typeof selectedProduct.category === "object"
                ? (categoryParentNames.get(selectedProduct.category.slug ?? "") ?? "")
                : ""
            }
          />
          <SiteFooter
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
          />
        </>
      ) : (
        <div className="catalog-page">
          <div className="catalog-header">
            <div>
              <p className="catalog-eyebrow">Catalogue chaussures</p>
              {query.trim() ? (
                <>
                  <h1 className="catalog-title">
                    Résultats pour &laquo;&nbsp;{query.trim()}&nbsp;&raquo;
                  </h1>
                  <p className="catalog-copy">
                    Nous avons trouvé {visibleProducts.length} modèles
                    correspondant à votre recherche.{" "}
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        handleSearch("");
                      }}
                    >
                      Effacer la recherche
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="catalog-title">
                    Sélection premium de baskets et sneakers
                  </h1>
                  <p className="catalog-copy">
                    Un assortiment trié sur le volet, conçu pour offrir une
                    expérience claire, moderne et haut de gamme.
                  </p>
                </>
              )}
            </div>

            <div className="catalog-quick-info">
              <span>
                {loading
                  ? "Chargement..."
                  : `${visibleProducts.length} modèles disponibles`}
              </span>
              <label htmlFor="tri" className="sr-only">
                Trier par
              </label>
              <select
                id="tri"
                name="tri"
                className="catalog-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
              >
                <option value="recent">Plus récents</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          <div className="catalog-layout">
            <div
              className={
                filtersOpen ? "filters-overlay open" : "filters-overlay"
              }
              id="filtersOverlay"
              aria-hidden="true"
              onClick={closeFilters}
            />

            <button
              type="button"
              className="mobile-filter-btn"
              id="mobileFilterBtn"
              onClick={() => setFiltersOpen(true)}
            >
              Filtres et tri
            </button>

            <aside
              className={
                filtersOpen ? "catalog-sidebar open" : "catalog-sidebar"
              }
              id="catalogSidebar"
            >
              <button
                type="button"
                className="filters-close-btn"
                aria-label="Fermer les filtres"
                onClick={closeFilters}
              >
                &times;
              </button>
              <div className="sidebar-form">
                <div className="filter-section">
                  <div className="filter-panel-header">
                    <span>Affiner</span>
                    <strong>Filtres</strong>
                  </div>

                  <div className="filter-group filter-group--categories">
                    <p className="filter-label">Catégorie</p>

                    {categoryTree.map((category) => (
                      <div key={String(category.id)}>
                        <label className="filter-option filter-option--parent">
                          <input
                            type="radio"
                            name="categorie"
                            checked={selectedCategory === category.slug}
                            onChange={() => handleSelectCategory(category.slug)}
                          />
                          <span>{category.name}</span>
                        </label>

                        {(category.children ?? []).map((child) => (
                          <label
                            className="filter-option filter-option--child"
                            key={String(child.id)}
                          >
                            <input
                              type="radio"
                              name="categorie"
                              checked={selectedCategory === child.slug}
                              onChange={() => handleSelectCategory(child.slug)}
                            />
                            <span>{child.name}</span>
                          </label>
                        ))}
                      </div>
                    ))}

                    <label className="filter-option">
                      <input
                        type="radio"
                        name="categorie"
                        checked={!selectedCategory}
                        onChange={() => handleSelectCategory(undefined)}
                      />
                      <span>Toutes</span>
                    </label>
                  </div>

                  <div className="filter-group">
                    <p className="filter-label">Prix max</p>
                    <div className="price-value" id="prixMaxValue">
                      {formatPrice(effectivePrixMax)}
                    </div>
                    <input
                      id="prixMax"
                      type="range"
                      name="prixMax"
                      min={0}
                      max={sliderMax}
                      step={1000}
                      value={effectivePrixMax}
                      onChange={(event) => setPrixMax(Number(event.target.value))}
                      className="filter-range"
                    />
                  </div>

                  <div className="filter-group">
                    <p className="filter-label">Taille / Pointure</p>
                    <div className="filter-tags">
                      {SIZE_OPTIONS.map((size) => (
                        <label className="filter-chip" key={size}>
                          <input
                            type="radio"
                            name="taille"
                            checked={selectedSize === size}
                            onChange={() => setSelectedSize(size)}
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                      <label className="filter-chip filter-chip--all">
                        <input
                          type="radio"
                          name="taille"
                          checked={!selectedSize}
                          onChange={() => setSelectedSize(null)}
                        />
                        <span>Toutes</span>
                      </label>
                    </div>
                  </div>

                  <div className="filter-group">
                    <p className="filter-label">Filtres</p>
                    <label className="filter-option filter-option--checkbox">
                      <input
                        type="checkbox"
                        name="promotion"
                        checked={promotionOnly}
                        onChange={(event) => setPromotionOnly(event.target.checked)}
                      />
                      <span>En promotion</span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>

            <main className="catalog-main">
              <div className="produits-grid">
                {visibleProducts.length === 0 && !loading ? (
                  <p className="catalog-empty">
                    Aucun produit ne correspond à votre recherche.{" "}
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        clearFilters();
                      }}
                    >
                      Voir tout le catalogue
                    </a>
                  </p>
                ) : (
                  visibleProducts.map((product) => (
                    <CatalogProductCard
                      key={String(product.id)}
                      product={product}
                      onView={() => setSelectedProductId(product.id)}
                    />
                  ))
                )}
              </div>
            </main>
          </div>
        </div>
      )}

      <SiteFooter onSelectCategory={handleSelectCategory} onSearch={handleSearch} />
    </div>
  );
}

function CatalogProductCard({
  product,
  onView,
}: {
  product: ProductItem;
  onView: () => void;
}) {
  const categoryLabel = product.category?.name ?? "Sneakers";
  const tag = isRecentProduct(product) ? "Dernières sorties" : categoryLabel;

  return (
    <a
      href="#"
      className="product-card"
      onClick={(event) => {
        event.preventDefault();
        onView();
      }}
    >
      <div className="product-img-wrapper">
        <img
          src={productImage(product)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            event.currentTarget.src = defaultProductImage;
          }}
        />
      </div>
      <div className="product-card-info">
        <p className="product-card-tag">{tag}</p>
        <h3 className="product-card-title">{product.name}</h3>
        <p className="product-card-desc">
          {cardSubtitle(product.category?.name)}
        </p>
        <p className="product-card-price">{formatPrice(productPrice(product))}</p>
      </div>
    </a>
  );
}

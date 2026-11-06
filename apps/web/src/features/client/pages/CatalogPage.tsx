import { useMemo, useState } from "react";
import {
  SIZE_OPTIONS,
  cardSubtitle,
  defaultProductImage,
  formatPrice,
  isRecentProduct,
  productImage,
  productPrice,
  type CategoryNode,
  type ProductItem,
  type SortOption,
} from "../catalog-shared";

type CatalogPageProps = {
  categoryTree: CategoryNode[];
  products: ProductItem[];
  selectedCategory?: string;
  query: string;
  loading: boolean;
  onSelectCategory: (slug?: string) => void;
  onSearch: (query: string) => void;
  onOpenProduct: (product: ProductItem) => void;
};

const sizeLabel = (size: { label?: string } | string): string =>
  typeof size === "string" ? size : (size?.label ?? "");

export function CatalogPage({
  categoryTree,
  products,
  selectedCategory,
  query,
  loading,
  onSelectCategory,
  onSearch,
  onOpenProduct,
}: CatalogPageProps) {
  const [sort, setSort] = useState<SortOption>("recent");
  const [prixMax, setPrixMax] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [promotionOnly, setPromotionOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
    const maxPrice = products.reduce(
      (max, product) => Math.max(max, productPrice(product)),
      0,
    );
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

  const visibleProducts = useMemo(() => {
    const searched = query.trim().toLowerCase();

    let filtered = products.filter((product) => {
      if (selectedCategorySlugs.size > 0) {
        const slug = product.category?.slug ?? "";
        if (!selectedCategorySlugs.has(slug)) return false;
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
    selectedCategorySlugs,
    effectivePrixMax,
    sliderMax,
    selectedSize,
    hasSizeData,
    promotionOnly,
    hasPromoData,
    sort,
  ]);

  const clearFilters = () => {
    onSelectCategory(undefined);
    onSearch("");
    setPrixMax(null);
    setSelectedSize(null);
    setPromotionOnly(false);
    setSort("recent");
  };

  const closeFilters = () => setFiltersOpen(false);

  return (
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
                    onSearch("");
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
                        onChange={() => onSelectCategory(category.slug)}
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
                          onChange={() => onSelectCategory(child.slug)}
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
                    onChange={() => onSelectCategory(undefined)}
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
                    onChange={(event) =>
                      setPromotionOnly(event.target.checked)
                    }
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
                  onView={() => onOpenProduct(product)}
                />
              ))
            )}
          </div>
        </main>
      </div>
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

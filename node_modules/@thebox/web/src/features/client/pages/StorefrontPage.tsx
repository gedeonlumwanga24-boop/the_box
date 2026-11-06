import { useEffect, useMemo, useState } from "react";
import { StorefrontNavbar } from "../components/StorefrontNavbar";
import { SiteFooter } from "../components/SiteFooter";
import { HomePage } from "./HomePage";
import { CatalogPage } from "./CatalogPage";
import { ProductPage } from "./ProductPage";
import { CartPage } from "./CartPage";
import { apiRequest } from "../../shared/api";
import {
  buildCategoryParentNames,
  buildCategoryTree,
  fallbackCategories,
  fallbackProducts,
  type CategoryNode,
  type ProductItem,
} from "../catalog-shared";

type StorefrontView = "home" | "catalog" | "product" | "cart";

export function StorefrontPage() {
  const [categories, setCategories] =
    useState<CategoryNode[]>(fallbackCategories);
  const [products, setProducts] = useState<ProductItem[]>(fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<StorefrontView>("home");
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiRequest<
          { data?: CategoryNode[] } | CategoryNode[]
        >("/catalog/categories");
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

        const response = await apiRequest<
          { data?: ProductItem[] } | ProductItem[]
        >(
          "/catalog/products" +
            (params.toString() ? `?${params.toString()}` : ""),
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

  const categoryTree = useMemo(
    () => buildCategoryTree(categories),
    [categories],
  );

  const categoryParentNames = useMemo(
    () => buildCategoryParentNames(categoryTree),
    [categoryTree],
  );

  const handleSelectCategory = (slug?: string) => {
    setSelectedCategory(slug || undefined);
    setSelectedProduct(null);
    setView("catalog");
    window.scrollTo({ top: 0 });
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    setSelectedProduct(null);
    setView("catalog");
    window.scrollTo({ top: 0 });
  };

  const handleGoHome = () => {
    setSelectedProduct(null);
    setView("home");
    window.scrollTo({ top: 0 });
  };

  const handleGoToCatalog = () => {
    setSelectedProduct(null);
    setView("catalog");
    window.scrollTo({ top: 0 });
  };

  const handleGoToCart = () => {
    setSelectedProduct(null);
    setView("cart");
    window.scrollTo({ top: 0 });
  };

  const handleOpenProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setView("product");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="storefront-shell">
      <StorefrontNavbar
        categories={categoryTree}
        selectedCategory={selectedCategory}
        query={query}
        onSelectCategory={handleSelectCategory}
        onSearch={handleSearch}
        onNavigateHome={handleGoHome}
        onGoToCart={handleGoToCart}
      />

      {view === "product" && selectedProduct ? (
        <>
          <ProductPage
            product={selectedProduct}
            parentCategoryName={
              selectedProduct.category &&
              typeof selectedProduct.category === "object"
                ? (categoryParentNames.get(
                    selectedProduct.category.slug ?? "",
                  ) ?? "")
                : ""
            }
            onGoToCart={handleGoToCart}
          />
          <SiteFooter
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
          />
        </>
      ) : view === "cart" ? (
        <>
          <CartPage onBackToCatalog={handleGoToCatalog} />
          <SiteFooter
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
          />
        </>
      ) : view === "home" ? (
        <>
          <HomePage
            categories={categoryTree}
            onSelectCategory={handleSelectCategory}
            onGoToCatalog={handleGoToCatalog}
          />
          <SiteFooter
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
          />
        </>
      ) : (
        <>
          <CatalogPage
            categoryTree={categoryTree}
            products={products}
            selectedCategory={selectedCategory}
            query={query}
            loading={loading}
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
            onOpenProduct={handleOpenProduct}
          />
          <SiteFooter
            onSelectCategory={handleSelectCategory}
            onSearch={handleSearch}
          />
        </>
      )}
    </div>
  );
}

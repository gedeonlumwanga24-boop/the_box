import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../shared/api';
import './StorefrontPage.css';

type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  children?: CategoryNode[];
};

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number | string;
  image?: string | null;
  imageUrl?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
};

const normalizePrice = (value: number | string) => Number(value ?? 0);

export function StorefrontPage() {
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiRequest<{ data?: CategoryNode[] }>('/catalog/categories');
        setCategories(Array.isArray(response) ? response : response.data ?? []);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    const loadProducts = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory) params.set('category', selectedCategory);
        if (query.trim()) params.set('q', query.trim());

        const response = await apiRequest<{ data?: ProductItem[] }>('/catalog/products' + (params.toString() ? `?${params.toString()}` : ''));
        setProducts(Array.isArray(response) ? response : response.data ?? []);
      } catch (error) {
        console.error('Failed to load products', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void loadCategories();
    void loadProducts();
  }, [query, selectedCategory]);

  const rootCategories = useMemo(
    () => categories.filter((category) => !category.parentId),
    [categories],
  );

  const visibleProducts = useMemo(() => {
    const searched = query.trim().toLowerCase();
    if (!searched) return products;

    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const description = (product.description ?? '').toLowerCase();
      return name.includes(searched) || description.includes(searched);
    });
  }, [products, query]);

  return (
    <div className="shop-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">▣</div>
          <span className="brand-name">THE BOX</span>
        </div>

        <nav className="nav-menu" aria-label="Navigation principale">
          {rootCategories.map((category) => (
            <div key={category.id} className="nav-item-group">
              <button
                type="button"
                className="nav-link"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </button>

              {(category.children ?? []).length > 0 && (
                <div className="nav-dropdown">
                  {category.children?.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className="nav-dropdown-item"
                      onClick={() => setSelectedCategory(child.slug)}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button type="button" className="nav-link muted">
            À propos
          </button>
        </nav>

        <div className="nav-actions">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            className="search-input"
            placeholder="Rechercher..."
          />
          <button type="button" className="cart-button">Panier</button>
        </div>
      </header>

      <main className="catalog-main">
        <section className="catalog-hero">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1>{selectedCategory ? selectedCategory : 'Toute la collection'}</h1>
          </div>

          <div className="catalog-meta">
            <span>{loading ? 'Chargement...' : `${visibleProducts.length} modèles`}</span>
            <button type="button" className="filter-button">
              Filtres
            </button>
          </div>
        </section>

        <div className="category-pills">
          <button
            type="button"
            className={!selectedCategory ? 'pill active' : 'pill'}
            onClick={() => setSelectedCategory(undefined)}
          >
            Toutes
          </button>

          {rootCategories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={selectedCategory === category.slug ? 'pill active' : 'pill'}
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="products-grid">
          {visibleProducts.length === 0 && !loading ? (
            <div className="empty-state">Aucun produit trouvé pour cette sélection.</div>
          ) : (
            visibleProducts.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-image-wrap">
                  <img
                    src={product.image ?? product.imageUrl ?? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'}
                    alt={product.name}
                    className="product-image"
                  />
                </div>

                <div className="product-content">
                  <p className="product-category">{product.category?.name ?? 'Collection'}</p>
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description ?? 'Produit de la collection The Box.'}</p>
                  <div className="product-footer">
                    <span>{normalizePrice(product.price).toLocaleString('fr-CD')} CDF</span>
                    <button type="button" className="product-button">Voir</button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

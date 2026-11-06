import { useEffect, useMemo, useRef, useState } from "react";

type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

type ProductPageInput = {
  id?: string | number;
  name?: string;
  category?: string | { name?: string; slug?: string; id?: string | number } | null;
  price?: number | string;
  stock?: number;
  image?: string | null;
  imageUrl?: string | null;
  gallery?: unknown;
  description?: string;
};

type ProductPageProps = {
  product?: ProductPageInput;
  parentCategoryName?: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80";

const shoeSizes: { label: string; available: boolean }[] = [
  { label: "38.5", available: false },
  { label: "39", available: false },
  { label: "40", available: true },
  { label: "40.5", available: true },
  { label: "41", available: true },
  { label: "42", available: true },
  { label: "42.5", available: true },
  { label: "43", available: true },
  { label: "44", available: true },
  { label: "44.5", available: false },
  { label: "45", available: false },
  { label: "45.5", available: true },
  { label: "46", available: false },
  { label: "47", available: true },
  { label: "47.5", available: false },
  { label: "48.5", available: false },
  { label: "49.5", available: false },
];

const clothingSizes: { label: string; available: boolean }[] = [
  { label: "XS", available: true },
  { label: "S", available: true },
  { label: "M", available: true },
  { label: "L", available: true },
  { label: "XL", available: true },
  { label: "XXL", available: false },
];

const colorOptions = [
  { name: "Noir", value: "#333333" },
  { name: "Bleu", value: "#4682B4" },
  { name: "Rouge", value: "#DC143C" },
  { name: "Or", value: "#FFD700" },
];

const galleryEntryToUrl = (entry: unknown): string | null => {
  if (typeof entry === "string" && entry.trim()) return entry;
  if (entry && typeof entry === "object") {
    const record = entry as Record<string, unknown>;
    for (const key of ["src", "url", "image", "path"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return null;
};

export function ProductPage({ product, parentCategoryName = "" }: ProductPageProps) {
  const name = product?.name ?? "Produit";
  const categoryName =
    typeof product?.category === "string"
      ? product.category
      : (product?.category?.name ?? "Chaussure");
  const price = Number(product?.price ?? 0);
  const stock = product?.stock ?? 0;
  const description =
    product?.description ??
    "Découvrez une sélection premium de baskets et chaussures pour tous les styles. Confortable, durable et à la mode.";
  const productId = product?.id ?? "-";

  const slides = useMemo(() => {
    const urls: string[] = [];
    const main = product?.image ?? product?.imageUrl ?? fallbackImage;
    if (main) urls.push(main);
    if (Array.isArray(product?.gallery)) {
      product.gallery.forEach((entry) => {
        const url = galleryEntryToUrl(entry);
        if (url && !urls.includes(url)) urls.push(url);
      });
    }
    return urls.length > 0 ? urls : [fallbackImage];
  }, [product?.image, product?.imageUrl, product?.gallery]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].name);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const categorySlug =
    product?.category && typeof product.category === "object"
      ? (product.category.slug ?? "")
      : "";
  const normalizedCategory = categoryName.toLowerCase();
  const normalizedParent = parentCategoryName.toLowerCase();

  const shoeCategoryNames = ["chaussures", "lifestyle", "jordan", "basketball", "sneakers"];
  const accessoryCategoryNames = [
    "accessoires",
    "chaussettes",
    "sacs et sacs à dos",
    "casquettes",
    "lunettes de soleil",
  ];

  const isShoe =
    shoeCategoryNames.includes(normalizedCategory) ||
    shoeCategoryNames.includes(categorySlug) ||
    normalizedParent === "chaussures";
  const isAccessory =
    accessoryCategoryNames.includes(normalizedCategory) ||
    normalizedParent === "accessoires";

  const sizes = isShoe ? shoeSizes : clothingSizes;
  const sizeLabel = isShoe ? "Sélectionner la pointure" : "Sélectionner la taille";

  const badge =
    stock <= 0
      ? { label: "Rupture de stock", extra: " product-badge--outofstock" }
      : price > 150000
        ? { label: "Premium", extra: "" }
        : { label: "En stock", extra: "" };

  const goToSlide = (index: number) => {
    const slider = sliderRef.current;
    if (!slider) {
      setActiveIndex(index);
      return;
    }
    const wrapped = ((index % slides.length) + slides.length) % slides.length;
    slider.scrollTo({ left: slider.clientWidth * wrapped, behavior: "smooth" });
    setActiveIndex(wrapped);
  };

  const navigateGallery = (direction: number) => {
    goToSlide(activeIndex + direction);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") navigateGallery(-1);
      if (event.key === "ArrowRight") navigateGallery(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    const onScroll = () => {
      const slideWidth = slider.clientWidth;
      if (slideWidth > 0) {
        setActiveIndex(
          ((Math.round(slider.scrollLeft / slideWidth) % slides.length) +
            slides.length) %
            slides.length,
        );
      }
    };
    slider.addEventListener("scroll", onScroll, { passive: true });
    return () => slider.removeEventListener("scroll", onScroll);
  }, [slides.length]);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const variant = [
    selectedSize ? `Taille: ${selectedSize}` : null,
    `Couleur: ${selectedColor}`,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <div className="product-show-container">
        <div className="product-show-layout">
          <div className="product-gallery">
            <div className="product-thumbnails-container">
              {slides.map((src, index) => (
                <div
                  key={`thumb-${index}`}
                  className={
                    index === activeIndex
                      ? "product-thumbnail active"
                      : "product-thumbnail"
                  }
                  onClick={() => goToSlide(index)}
                >
                  <img src={src} alt={name} loading="lazy" />
                </div>
              ))}
            </div>

            <div className="product-main-image-wrapper">
              <div className="product-main-image">
                <span className={`product-badge${badge.extra}`}>{badge.label}</span>

                <button
                  type="button"
                  className="gallery-nav-btn prev"
                  onClick={() => navigateGallery(-1)}
                  aria-label="Image précédente"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>

                <div
                  className="product-image-slider"
                  id="imageSlider"
                  ref={sliderRef}
                >
                  {slides.map((src, index) => (
                    <img
                      key={`slide-${index}`}
                      src={src}
                      alt={name}
                      className="product-image-slide"
                      draggable={false}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="gallery-nav-btn next"
                  onClick={() => navigateGallery(1)}
                  aria-label="Image suivante"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>

              <div className="product-gallery-dots">
                {slides.map((_, index) => (
                  <span
                    key={`dot-${index}`}
                    className={
                      index === activeIndex ? "gallery-dot active" : "gallery-dot"
                    }
                    onClick={() => goToSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="product-info-panel">
            <span className="product-category-tag">{categoryName}</span>

            <h1 className="product-show-title">{name}</h1>

            <p className="product-tagline">Chaussure pour homme</p>

            <div className="product-price-section">
              <span className="product-price">
                {price.toLocaleString("fr-FR")} CDF
              </span>
            </div>

            {!isAccessory && (
              <div className="product-size-section">
                <div
                  className="size-header-wrapper"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: "0.75rem",
                  }}
                >
                  <label className="size-label" style={{ fontWeight: 700, marginBottom: 0 }}>
                    {sizeLabel}
                  </label>
                  <a
                    href="#"
                    className="size-guide"
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#111",
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                    onClick={(event) => event.preventDefault()}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0z" />
                      <line x1="7.5" y1="10.5" x2="9.5" y2="8.5" />
                      <line x1="10.5" y1="13.5" x2="12.5" y2="11.5" />
                      <line x1="13.5" y1="16.5" x2="15.5" y2="14.5" />
                    </svg>
                    Guide des tailles
                  </a>
                </div>
                <div className="size-grid">
                  {sizes.map((size) => (
                    <button
                      key={size.label}
                      type="button"
                      className={
                        selectedSize === size.label
                          ? "size-btn active"
                          : size.available
                            ? "size-btn"
                            : "size-btn unavailable"
                      }
                      disabled={!size.available}
                      onClick={() =>
                        size.available && setSelectedSize(size.label)
                      }
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-color-section">
              <label className="color-label">Couleur</label>
              <div className="color-options">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={
                      selectedColor === color.name
                        ? "color-btn active"
                        : "color-btn"
                    }
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    onClick={() => setSelectedColor(color.name)}
                  />
                ))}
              </div>
            </div>

            <div className="product-action-buttons">
              <button
                type="button"
                className="btn-add-to-cart pill-btn"
                id="addToCartBtn"
                onClick={openDrawer}
              >
                Ajouter au panier
              </button>
              <button type="button" className="btn-wishlist pill-btn">
                Ajouter aux favoris{" "}
                <i className="fa-regular fa-heart" style={{ marginLeft: "0.5rem", fontSize: "1.1rem" }} />
              </button>
            </div>

            <div className="product-info-box">
              <p>
                <strong>Livraison gratuite</strong>
                <br />
                Traceur en magasin
              </p>
            </div>

            <div className="product-info-box">
              <p>
                <strong>Retour gratuit</strong>
                <br />
                Traceur en magasin
              </p>
            </div>

            <div className="product-description-section">
              <p>{description}</p>
            </div>

            <details className="product-details-accordion">
              <summary className="details-summary">
                Afficher les détails du produit
              </summary>
              <div className="details-content">
                <ul>
                  <li>
                    <strong>Catégorie :</strong> {categoryName}
                  </li>
                  <li>
                    <strong>Code produit :</strong> #{productId}
                  </li>
                  <li>
                    <strong>Stock disponible :</strong> {stock} unités
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>

        <div className="product-additional-section">
          <h2>À propos de ce produit</h2>
          <p>
            Découvrez une sélection premium de baskets et chaussures pour tous
            les styles. Confortable, durable et à la mode.
          </p>
        </div>
      </div>

      <div
        className={
          drawerOpen ? "cart-success-overlay active" : "cart-success-overlay"
        }
        id="cartSuccessOverlay"
        onClick={closeDrawer}
      />
      <div
        className={
          drawerOpen ? "cart-success-drawer active" : "cart-success-drawer"
        }
        id="cartSuccessDrawer"
      >
        <div className="drawer-header">
          <div className="drawer-title">
            <svg viewBox="0 0 24 24" fill="#10b981" width="20" height="20" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Ajouté au panier
          </div>
          <button
            type="button"
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>

        <div className="drawer-product">
          <img src={slides[activeIndex] ?? fallbackImage} alt={name} />
          <div className="drawer-product-info">
            <h4>{categoryName}</h4>
            <h3>{name}</h3>
            <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "0.2rem" }}>
              {variant}
            </p>
            <p style={{ fontWeight: 800, marginTop: "0.4rem", color: "#111" }}>
              {price.toLocaleString("fr-FR")} CDF
            </p>
          </div>
        </div>

        <div className="drawer-actions">
          <a href="#" className="drawer-btn drawer-btn-outline" onClick={(event) => event.preventDefault()}>
            Voir le panier (<span id="drawerCartCount">1</span>)
          </a>
          <a href="#" className="drawer-btn drawer-btn-solid" onClick={(event) => event.preventDefault()}>
            Paiement
          </a>
        </div>
      </div>
    </>
  );
}

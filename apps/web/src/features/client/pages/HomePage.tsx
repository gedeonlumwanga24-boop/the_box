import { useEffect, useMemo, useRef } from "react";
import type { CategoryNode } from "../catalog-shared";

type HomePageProps = {
  categories: CategoryNode[];
  onSelectCategory: (slug?: string) => void;
  onGoToCatalog: () => void;
};

const heroImage =
  "https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=2000&auto=format&fit=crop";

const videoBannerFallback =
  "https://images.unsplash.com/photo-1556906781-9a412961a28c?q=80&w=1600&auto=format&fit=crop";

const subcategoryFallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=500&auto=format&fit=crop";

const categoryFallbackImage = (slug: string) => {
  switch (slug) {
    case "chaussures":
      return "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop";
    case "vetements":
      return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop";
    case "accessoires":
      return "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop";
    default:
      return "https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=800&auto=format&fit=crop";
  }
};

const stats = [
  { value: "2021", label: "Fondation", sup: null as string | null },
  { value: "500", label: "Références", sup: "+" },
  { value: "12K", label: "Clients", sup: "+" },
  { value: "100%", label: "Authentique", sup: null },
];

const brands = [
  "Nike", "Adidas", "Jordan", "New Balance", "Puma", "Reebok", "Converse", "Vans",
];

const BrandMarquee = () => (
  <div className="home-brands-inner">
    {brands.map((brand, index) => (
      <span key={`${brand}-${index}`}>
        {brand}
        <span className="home-brands-sep">·</span>
      </span>
    ))}
    {brands.map((brand, index) => (
      <span key={`${brand}-bis-${index}`}>
        {brand}
        <span className="home-brands-sep">·</span>
      </span>
    ))}
  </div>
);

export function HomePage({
  categories,
  onSelectCategory,
  onGoToCatalog,
}: HomePageProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const iconicSliderRef = useRef<HTMLDivElement | null>(null);

  const subcategories = useMemo(
    () =>
      categories.flatMap((category) => category.children ?? []),
    [categories],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.1 },
    );
    root.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [categories]);

  const scrollIconic = (direction: number) => {
    const slider = iconicSliderRef.current;
    if (!slider) return;
    const card = slider.querySelector<HTMLElement>(".iconic-product-card");
    const gap = parseFloat(window.getComputedStyle(slider).gap) || 24;
    const amount = (card ? card.offsetWidth : 340) + gap;
    slider.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <div ref={rootRef}>
      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-section">
        <div className="hero-media">
          <img
            src={heroImage}
            alt="The Box"
            className="hero-bg animate-zoom"
          />
        </div>
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="hero-tagline animate-fade-in">
            {"NOUVELLE COLLECTION"}
          </p>
          <h1 className="hero-title animate-slide-up">
            {"L'ÉLÉGANCE À CHAQUE PAS."}
          </h1>
          <p className="hero-desc animate-fade-in-delay">
            Découvrez notre sélection de sneakers premium. Authenticité
            garantie. Style inégalé.
          </p>
          <button
            type="button"
            className="hero-btn animate-slide-up-delay"
            onClick={onGoToCatalog}
          >
            Découvrir la collection
          </button>
        </div>
        <div className="hero-scroll-hint">
          <div className="hero-scroll-line" />
          Défiler
        </div>
      </section>

      {/* ═══════════ COLLECTIONS ═══════════ */}
      <section className="home-section reveal">
        <div className="section-header">
          <div>
            <span className="section-tag">Explorer</span>
            <h2 className="section-title">Collections</h2>
          </div>
          <div className="slider-controls">
            <button
              type="button"
              className="slider-btn prev"
              aria-label="Précédent"
              onClick={() => {
                const slider = rootRef.current?.querySelector<HTMLElement>("#categoriesSlider");
                const card = slider?.querySelector<HTMLElement>(".category-card");
                slider?.scrollBy({
                  left: -((card ? card.offsetWidth : 400) + 24),
                  behavior: "smooth",
                });
              }}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="slider-btn next"
              aria-label="Suivant"
              onClick={() => {
                const slider = rootRef.current?.querySelector<HTMLElement>("#categoriesSlider");
                const card = slider?.querySelector<HTMLElement>(".category-card");
                slider?.scrollBy({
                  left: (card ? card.offsetWidth : 400) + 24,
                  behavior: "smooth",
                });
              }}
            >
              <i className="fa-solid fa-chevron-next" />
            </button>
          </div>
        </div>
        <div className="categories-slider-wrapper">
          <div className="categories-slider marquee-content" id="categoriesSlider">
            {[...categories, ...categories].map((category, index) => (
              <button
                key={`${category.slug}-${index}`}
                type="button"
                className="category-card"
                onClick={() => onSelectCategory(category.slug)}
                style={{ border: "none", cursor: "pointer", textAlign: "left" }}
              >
                <img
                  src={category.image || categoryFallbackImage(category.slug)}
                  alt={category.name}
                  loading="lazy"
                />
                <div className="category-overlay" />
                <div className="category-content">
                  <h3 className="category-title">{category.name}</h3>
                  <span className="category-btn">Acheter</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VIDEO BANNER ═══════════ */}
      <section className="video-banner-section reveal">
        <div className="video-banner-media">
          <img
            src={videoBannerFallback}
            alt="Tendances The Box"
            className="video-banner-video"
            style={{ objectFit: "cover" }}
          />
          <div className="video-banner-overlay" />
        </div>
        <div className="video-banner-content">
          <p className="video-banner-tagline">Les essentiels de la saison</p>
          <h2 className="video-banner-title">
            Pour ceux
            <br />
            qui bougent.
          </h2>
          <button
            type="button"
            className="video-banner-btn"
            onClick={onGoToCatalog}
          >
            Voir la collection <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </section>

      {/* ═══════════ MODÈLES ICONIQUES ═══════════ */}
      <section className="home-section iconic-section reveal bg-light">
        <div className="section-header">
          <div>
            <span className="section-tag">Catégories</span>
            <h2 className="section-title">Nos modèles iconiques</h2>
          </div>
          <div className="iconic-controls">
            <button
              type="button"
              className="slider-btn prev"
              aria-label="Précédent"
              onClick={() => scrollIconic(-1)}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="slider-btn next"
              aria-label="Suivant"
              onClick={() => scrollIconic(1)}
            >
              <i className="fa-solid fa-chevron-next" />
            </button>
          </div>
        </div>
        <div className="iconic-slider-wrapper">
          <div className="iconic-slider" id="iconicSlider" ref={iconicSliderRef}>
            {subcategories.length > 0 ? (
              subcategories.map((subcat) => (
                <button
                  key={String(subcat.id)}
                  type="button"
                  className="iconic-product-card"
                  onClick={() => onSelectCategory(subcat.slug)}
                  style={{ border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div className="iconic-img-wrapper">
                    <img
                      src={subcat.image || subcategoryFallbackImage}
                      alt={subcat.name}
                      className="iconic-product-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="iconic-product-pill">{subcat.name}</span>
                </button>
              ))
            ) : (
              [1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  type="button"
                  className="iconic-product-card"
                  onClick={onGoToCatalog}
                  style={{ border: "none", cursor: "pointer", padding: 0 }}
                >
                  <div className="iconic-img-wrapper">
                    <img
                      src={subcategoryFallbackImage}
                      alt="Sneaker"
                      className="iconic-product-img"
                      loading="lazy"
                    />
                  </div>
                  <span className="iconic-product-pill">
                    The Box Air {index}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <div className="home-stats-bar">
        {stats.map((stat) => (
          <div className="home-stat" key={stat.label}>
            <span className="home-stat-num">
              {stat.value}
              {stat.sup ? <sup>{stat.sup}</sup> : null}
            </span>
            <span className="home-stat-lbl">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ═══════════ BRANDS MARQUEE ═══════════ */}
      <div className="home-brands-marquee">
        <BrandMarquee />
      </div>

      {/* ═══════════ BRAND STATEMENT ═══════════ */}
      <section className="brand-statement reveal">
        <div className="brand-statement__inner">
          <header className="brand-statement__header">
            <p className="brand-statement__label">The Box</p>
            <h2 className="brand-statement__title">
              Conçu pour la rue.
              <br />
              Pensé pour le confort.
            </h2>
          </header>
          <div className="brand-statement__grid">
            <article className="brand-statement__item">
              <h3 className="brand-statement__item-title">
                Livraison express
              </h3>
              <p className="brand-statement__item-text">
                Expédition rapide partout en RDC avec suivi dès la prise en
                charge de votre commande.
              </p>
            </article>
            <article className="brand-statement__item">
              <h3 className="brand-statement__item-title">
                Retours sous 30 jours
              </h3>
              <p className="brand-statement__item-text">
                Échange ou retour simplifié si la taille ou le modèle ne
                convient pas.
              </p>
            </article>
            <article className="brand-statement__item">
              <h3 className="brand-statement__item-title">
                Authenticité garantie
              </h3>
              <p className="brand-statement__item-text">
                Chaque paire est contrôlée avant expédition pour garantir
                qualité et conformité.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

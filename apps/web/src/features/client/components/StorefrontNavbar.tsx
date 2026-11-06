import { useEffect, useState } from "react";

export type NavCategory = {
  id: string | number;
  name: string;
  slug: string;
  parentId?: string | number | null;
  image?: string | null;
  children?: NavCategory[];
};

type StorefrontNavbarProps = {
  categories: NavCategory[];
  selectedCategory?: string;
  query: string;
  onSelectCategory: (slug?: string) => void;
  onSearch: (query: string) => void;
};

const fallbackNavCategories: NavCategory[] = [
  {
    id: "chaussures",
    name: "Chaussures",
    slug: "chaussures",
    children: [
      { id: "lifestyle", name: "Lifestyle", slug: "lifestyle" },
      { id: "jordan", name: "Jordan", slug: "jordan" },
      { id: "basketball", name: "Basketball", slug: "basketball" },
      { id: "sneakers", name: "Sneakers", slug: "sneakers" },
    ],
  },
  {
    id: "vetements",
    name: "Vêtements",
    slug: "vetements",
    children: [
      { id: "sweats", name: "Sweats à capuche et sweats", slug: "sweats-a-capuche-et-sweats" },
      { id: "pantalons", name: "Pantalons et leggings", slug: "pantalons-et-leggings" },
      { id: "survetements", name: "Survêtements", slug: "survetements" },
      { id: "vestes", name: "Vestes", slug: "vestes" },
      { id: "hauts", name: "Hauts et t-shirts", slug: "hauts-et-t-shirts" },
      { id: "shorts", name: "Shorts", slug: "shorts" },
      { id: "tenues", name: "Tenues et maillots d'équipe", slug: "tenues-et-maillots-equipe" },
    ],
  },
  {
    id: "accessoires",
    name: "Accessoires",
    slug: "accessoires",
    children: [
      { id: "chaussettes", name: "Chaussettes", slug: "chaussettes" },
      { id: "sacs", name: "Sacs et sacs à dos", slug: "sacs-et-sacs-a-dos" },
      { id: "casquettes", name: "Casquettes", slug: "casquettes" },
      { id: "lunettes", name: "Lunettes de soleil", slug: "lunettes-de-soleil" },
    ],
  },
];

const megaFallbackImages: Record<string, string> = {
  chaussures:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop",
  vetements:
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop",
  accessoires:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop",
};

const megaDefaultImage =
  "https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=600&auto=format&fit=crop";

const allLabelFor = (slug: string) => {
  switch (slug) {
    case "chaussures":
      return "Toutes les chaussures";
    case "vetements":
      return "Tous les vêtements";
    case "accessoires":
      return "Tous les accessoires";
    default:
      return "Tout voir";
  }
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MessageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export function StorefrontNavbar({
  categories,
  selectedCategory,
  query,
  onSelectCategory,
  onSearch,
}: StorefrontNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(query);

  const navCategories =
    categories.length > 0
      ? categories.filter((category) => !category.parentId)
      : fallbackNavCategories;

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", menuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        setMenuOpen(false);
        setMobileSearchOpen(false);
        setOpenAccordion(null);
      }
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => {
    setMenuOpen(false);
    setMobileSearchOpen(false);
    setOpenAccordion(null);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchValue.trim());
  };

  const selectCategory = (slug?: string) => {
    onSelectCategory(slug);
    closeMenu();
  };

  return (
    <>
      <nav className={scrolled ? "navbar scrolled" : "navbar"} id="mainNavbar">
        <div className="nav-inner">
          <div className="nav-brand">
            <a
              href="#"
              className="logo"
              aria-label="The Box — accueil"
              onClick={(event) => {
                event.preventDefault();
                selectCategory(undefined);
                onSearch("");
              }}
            >
              <img src="/logo.jpg" alt="The Box" />
            </a>
          </div>

          <div className="desktop-nav-list">
            {navCategories.map((category) => {
              const children = category.children ?? [];
              const megaImg =
                category.image ||
                megaFallbackImages[category.slug] ||
                megaDefaultImage;

              return (
                <div className="nav-menu-item" key={String(category.id)}>
                  <a
                    href="#"
                    className={
                      selectedCategory === category.slug
                        ? "nav-menu-trigger active"
                        : "nav-menu-trigger"
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      selectCategory(category.slug);
                    }}
                  >
                    {category.name}
                  </a>
                  <div className="nav-mega-menu">
                    <div className="nav-mega-inner">
                      <div
                        className="nav-mega-feature"
                        style={{
                          backgroundImage: `url('${megaImg}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.85) 100%)",
                          }}
                        />
                        <span style={{ position: "relative", zIndex: 1 }}>
                          Collection
                        </span>
                        <strong style={{ position: "relative", zIndex: 1 }}>
                          {category.name}
                        </strong>
                        <p style={{ position: "relative", zIndex: 1 }}>
                          Découvre une sélection pensée pour le style, le
                          confort et le quotidien.
                        </p>
                      </div>
                      <div className="nav-mega-links">
                        <a
                          href="#"
                          className="nav-mega-link nav-mega-link--all"
                          onClick={(event) => {
                            event.preventDefault();
                            selectCategory(category.slug);
                          }}
                        >
                          {allLabelFor(category.slug)}
                        </a>
                        {children.map((child) => (
                          <a
                            href="#"
                            className="nav-mega-link"
                            key={String(child.id)}
                            onClick={(event) => {
                              event.preventDefault();
                              selectCategory(child.slug);
                            }}
                          >
                            {child.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <a href="#" className="nav-menu-trigger nav-link-simple" onClick={(event) => event.preventDefault()}>
              À propos
            </a>
          </div>

          <form
            action="#"
            method="GET"
            className="nav-search desktop-search"
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <label htmlFor="nav-search-input" className="sr-only">
              Rechercher
            </label>
            <input
              id="nav-search-input"
              name="q"
              type="search"
              placeholder="Rechercher…"
              className="search-input"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button type="submit" className="search-button" aria-label="Chercher">
              <SearchIcon />
            </button>
          </form>

          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn icon-btn--pill mobile-search-btn"
              aria-label="Rechercher"
              onClick={() => setMobileSearchOpen((open) => !open)}
            >
              <SearchIcon />
            </button>

            <a href="#" className="icon-btn icon-btn--pill" aria-label="Messagerie" onClick={(event) => event.preventDefault()}>
              <MessageIcon />
              <span className="account-badge account-badge--hidden" id="navMessageBadge" style={{ backgroundColor: "#dc2626" }}>
                0
              </span>
            </a>

            <a href="#" className="icon-btn icon-btn--pill nav-account-btn" aria-label="Compte" id="navAccountLink" onClick={(event) => event.preventDefault()}>
              <UserIcon />
            </a>

            <a href="#" className="icon-btn icon-btn--pill nav-cart-btn" aria-label="Panier" id="navCartLink" onClick={(event) => event.preventDefault()}>
              <CartIcon />
              <span className="cart-badge cart-badge--hidden" id="navCartBadge">0</span>
            </a>

            <button
              type="button"
              className="icon-btn icon-btn--pill mobile-menu-btn"
              id="mobileMenuBtn"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobileNavShell"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>
        </div>

        <div className={mobileSearchOpen ? "mobile-search-bar open" : "mobile-search-bar"} id="mobileSearchBar">
          <form role="search" onSubmit={handleSearchSubmit}>
            <input
              name="q"
              type="search"
              placeholder="Rechercher des sneakers…"
              className="mobile-search-input"
              ref={(element) => {
                if (element && mobileSearchOpen) element.focus();
              }}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button type="submit" aria-label="Chercher">
              <SearchIcon />
            </button>
          </form>
        </div>
      </nav>

      <div
        className={menuOpen ? "mobile-nav-overlay open" : "mobile-nav-overlay"}
        id="mobileNavOverlay"
        aria-hidden="true"
        onClick={closeMenu}
      />

      <div
        className={menuOpen ? "mobile-nav-shell open" : "mobile-nav-shell"}
        id="mobileNavShell"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="mobile-nav-topbar">
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Fermer le menu"
            onClick={closeMenu}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="mobile-nav-body">
          <div className="mobile-category-list">
            {navCategories.map((category) => {
              const children = category.children ?? [];
              const isOpen = openAccordion === String(category.id);

              if (children.length === 0) {
                return (
                  <a
                    href="#"
                    className="mobile-category-card mobile-category-card--link"
                    key={String(category.id)}
                    onClick={(event) => {
                      event.preventDefault();
                      selectCategory(category.slug);
                    }}
                  >
                    <span>{category.name}</span>
                    <ChevronIcon />
                  </a>
                );
              }

              return (
                <div
                  className={isOpen ? "mobile-category-card is-open" : "mobile-category-card"}
                  key={String(category.id)}
                >
                  <button
                    type="button"
                    className="mobile-category-trigger"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenAccordion(isOpen ? null : String(category.id))
                    }
                  >
                    <span>{category.name}</span>
                    <ChevronIcon className="mobile-category-chevron" />
                  </button>
                  <div className="mobile-accordion-panel" hidden={!isOpen}>
                    <a
                      href="#"
                      className="mobile-sub-link mobile-sub-link--all"
                      onClick={(event) => {
                        event.preventDefault();
                        selectCategory(category.slug);
                      }}
                    >
                      {allLabelFor(category.slug)}
                    </a>
                    {children.map((child) => (
                      <a
                        href="#"
                        className="mobile-sub-link"
                        key={String(child.id)}
                        onClick={(event) => {
                          event.preventDefault();
                          selectCategory(child.slug);
                        }}
                      >
                        {child.name}
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mobile-promo-text">
            Deviens membre The Box pour accéder au meilleur des produits et
            découvrir des contenus inspirants sur le sport.{" "}
            <strong>En savoir plus</strong>
          </p>

          <div className="mobile-auth-buttons">
            <a href="#" className="mobile-btn-dark" onClick={(event) => event.preventDefault()}>
              S'inscrire
            </a>
            <a href="#" className="mobile-btn-light" onClick={(event) => event.preventDefault()}>
              S'identifier
            </a>
          </div>

          <div className="mobile-bottom-links">
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Aide
            </a>
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <CartIcon />
              Panier
            </a>
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <MessageIcon />
              Messagerie
            </a>
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Compte &amp; Commandes
            </a>
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 8v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                <polyline points="3 8 12 13 21 8" />
              </svg>
              Contact
            </a>
            <a href="#" className="mobile-bottom-link" onClick={(event) => event.preventDefault()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              À propos
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

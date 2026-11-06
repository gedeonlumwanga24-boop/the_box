import { useEffect, useRef } from "react";

type AboutPageProps = {
  onGoToCatalog: () => void;
};

const heroImg =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1920&auto=format&fit=crop";

const img1 =
  "https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=900&auto=format&fit=crop";

const img2 =
  "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=700&auto=format&fit=crop";

const stats = [
  { value: "2021", label: "Année de fondation", sup: null as string | null, delay: null as string | null },
  { value: "500", label: "Références en stock", sup: "+", delay: "delay1" },
  { value: "12K", label: "Clients satisfaits", sup: "+", delay: "delay2" },
  { value: "100%", label: "Produits authentiques", sup: null, delay: "delay3" },
];

const values = [
  {
    num: "01",
    title: "Authenticité",
    text: "Chaque paire que nous vendons est 100% originale. Nos experts contrôlent chaque article avant expédition. Zéro tolérance pour le faux.",
    delay: null as string | null,
  },
  {
    num: "02",
    title: "Accessibilité",
    text: "Le style de la rue ne devrait pas être réservé à quelques-uns. Nous sélectionnons des prix justes et livrons partout en RDC.",
    delay: "delay1",
  },
  {
    num: "03",
    title: "Communauté",
    text: "The Box, c'est aussi une famille de passionnés. Des sneakerheads, des étudiants, des athlètes — unis par l'amour du mouvement.",
    delay: "delay2",
  },
];

const brands = [
  "Nike", "Adidas", "Jordan", "New Balance", "Puma", "Reebok", "Converse", "Vans",
];

export function AboutPage({ onGoToCatalog }: AboutPageProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    root.querySelectorAll("[data-ap-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="ap-page" ref={rootRef}>
      {/* HERO */}
      <section className="ap-hero">
        <img className="ap-hero-img" src={heroImg} alt="The Box — L'esprit de la rue" />
        <div className="ap-hero-overlay" />
        <div className="ap-hero-content">
          <p className="ap-hero-tag">Depuis 2021 · Lubumbashi, RDC</p>
          <h1 className="ap-hero-title">
            La rue
            <br />
            nous
            <br />
            <em>définit.</em>
          </h1>
          <p className="ap-hero-desc">
            Plus qu'une boutique, un mouvement. Chaque paire que nous proposons
            raconte une histoire d'authenticité, de style et de culture urbaine.
          </p>
        </div>
      </section>

      {/* STATS BAR */}
      <div className="ap-stats">
        {stats.map((stat) => (
          <div
            className="ap-stat"
            key={stat.label}
            {...(stat.delay ? { "data-ap-reveal": stat.delay } : { "data-ap-reveal": true })}
          >
            <span className="ap-stat-num">
              {stat.value}
              {stat.sup ? <sup>{stat.sup}</sup> : null}
            </span>
            <span className="ap-stat-lbl">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* STORY SECTION */}
      <section className="ap-story">
        <div className="ap-story-visual">
          <img src={img1} alt="Notre histoire The Box" />
          <div className="ap-story-visual-badge">
            <strong>01</strong>
            <span>
              Authenticité
              <br />
              certifiée
            </span>
          </div>
        </div>
        <div className="ap-story-text">
          <p className="ap-section-tag" data-ap-reveal>
            Nos Racines
          </p>
          <h2 className="ap-story-title" data-ap-reveal="delay1">
            Né de la rue,
            <br />
            fait pour durer.
          </h2>
          <div className="ap-story-body" data-ap-reveal="delay2">
            <p>
              The Box est né d'une obsession simple : rendre accessibles les
              meilleures paires de sneakers à ceux qui les portent au quotidien
              — pas seulement pour le style, mais pour ce qu'elles
              représentent.
            </p>
            <p>
              Fondé à Lubumbashi en 2021, nous avons commencé avec une idée et
              quelques cartons. Aujourd'hui, nous sommes le point de référence
              pour tous ceux qui cherchent une paire authentique, livrée
              rapidement, sans compromis sur la qualité.
            </p>
          </div>
          <button
            type="button"
            className="ap-story-cta"
            data-ap-reveal="delay3"
            onClick={onGoToCatalog}
          >
            Explorer la boutique <span>→</span>
          </button>
        </div>
      </section>

      {/* SECOND VISUAL */}
      <section className="ap-story">
        <div className="ap-story-text" style={{ background: "#fff" }}>
          <p className="ap-section-tag" data-ap-reveal>
            Notre Sélection
          </p>
          <h2 className="ap-story-title" data-ap-reveal="delay1">
            Une curation
            <br />
            sans compromis.
          </h2>
          <div className="ap-story-body" data-ap-reveal="delay2">
            <p>
              Notre sélection est pensée avec soin : Nike, Adidas, Jordan, New
              Balance, Puma et bien d'autres. Chaque modèle est inspecté,
              vérifié, certifié avant de partir chez vous.
            </p>
            <p>
              Nous travaillons uniquement avec des fournisseurs officiels pour
              garantir 100% d'authenticité sur chaque commande.
            </p>
          </div>
          <a
            href="#"
            className="ap-story-cta"
            data-ap-reveal="delay3"
            onClick={(event) => event.preventDefault()}
          >
            Nous contacter <span>→</span>
          </a>
        </div>
        <div className="ap-story-visual">
          <img src={img2} alt="Sélection The Box" />
        </div>
      </section>

      {/* VALUES */}
      <section className="ap-values">
        <div className="ap-values-header">
          <h2 className="ap-values-title" data-ap-reveal>
            Nos
            <br />
            Engagements
          </h2>
          <p
            style={{
              maxWidth: 320,
              color: "rgba(255,255,255,.45)",
              fontSize: "1rem",
              lineHeight: 1.6,
            }}
            data-ap-reveal="delay1"
          >
            Ces principes guident chacune de nos décisions, chaque jour, sans
            exception.
          </p>
        </div>
        <div className="ap-values-grid">
          {values.map((value) => (
            <div
              className="ap-value-card"
              key={value.num}
              {...(value.delay
                ? { "data-ap-reveal": value.delay }
                : { "data-ap-reveal": true })}
            >
              <span className="ap-value-num">{value.num}</span>
              <h3 className="ap-value-title">{value.title}</h3>
              <p className="ap-value-text">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE */}
      <div className="ap-marquee-wrap">
        <div className="ap-marquee">
          {brands.map((brand, index) => (
            <span key={`${brand}-${index}`}>
              {brand}
              <span className="ap-marquee-sep">·</span>
            </span>
          ))}
          {brands.map((brand, index) => (
            <span key={`${brand}-bis-${index}`}>
              {brand}
              <span className="ap-marquee-sep">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <section className="ap-cta">
        <h2 className="ap-cta-title" data-ap-reveal>
          Prêt à trouver
          <br />
          ta <em>prochaine paire</em>&nbsp;?
        </h2>
        <div className="ap-cta-actions" data-ap-reveal="delay1">
          <button type="button" className="ap-btn-solid" onClick={onGoToCatalog}>
            Explorer la boutique
          </button>
          <a
            href="#"
            className="ap-btn-ghost"
            onClick={(event) => event.preventDefault()}
          >
            Nous contacter
          </a>
        </div>
      </section>
    </div>
  );
}

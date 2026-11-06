import { useState } from "react";

type SiteFooterProps = {
  onSelectCategory?: (slug: string) => void;
  onSearch?: (query: string) => void;
};

type FooterLink = {
  label: string;
  category?: string;
  query?: string;
};

const selection: FooterLink[][] = [
  [
    { label: "Sneakers", category: "sneakers" },
    { label: "Lifestyle", category: "lifestyle" },
    { label: "Jordan", category: "jordan" },
    { label: "Basketball", category: "basketball" },
    { label: "Chaussures", category: "chaussures" },
  ],
  [
    { label: "Nike", query: "Nike" },
    { label: "Adidas", query: "Adidas" },
    { label: "Puma", query: "Puma" },
    { label: "New Balance", query: "New Balance" },
    { label: "Jordan", query: "Jordan" },
  ],
  [
    { label: "Vêtements", category: "vetements" },
    { label: "Sweats & hoodies", category: "sweats-a-capuche-et-sweats" },
    { label: "Pantalons", category: "pantalons-et-leggings" },
    { label: "Accessoires", category: "accessoires" },
    { label: "Nouveautés" },
  ],
  [
    { label: "Sacs & sacs à dos", category: "sacs-et-sacs-a-dos" },
    { label: "Casquettes", category: "casquettes" },
    { label: "Chaussettes", category: "chaussettes" },
    { label: "Meilleures ventes" },
    { label: "Promotions" },
  ],
];

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Aide",
    links: [
      { label: "Assistance client" },
      { label: "Suivi de commande" },
      { label: "Livraison & retours" },
      { label: "Modes de paiement" },
      { label: "FAQ" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Qui sommes-nous ?" },
      { label: "Nos valeurs" },
      { label: "Nos partenaires" },
      { label: "Carrières" },
      { label: "Éthique" },
    ],
  },
  {
    title: "Offres",
    links: [
      { label: "Toute la collection" },
      { label: "Nouveautés" },
      { label: "Promotions" },
      { label: "Meilleures ventes" },
    ],
  },
];

const legal = [
  { label: "Guides" },
  { label: "Conditions d'utilisation" },
  { label: "Politique de confidentialité" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/",
    icon: "fa-brands fa-facebook-f",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/",
    icon: "fa-brands fa-instagram",
  },
  {
    label: "X",
    href: "https://x.com/",
    icon: "fa-brands fa-x-twitter",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/243970297987",
    icon: "fa-brands fa-whatsapp",
  },
  {
    label: "Telegram",
    href: "https://t.me/",
    icon: "fa-brands fa-telegram",
  },
];

export function SiteFooter({ onSelectCategory, onSearch }: SiteFooterProps) {
  const handleLink = (event: React.MouseEvent, link: FooterLink) => {
    if (link.category && onSelectCategory) {
      event.preventDefault();
      onSelectCategory(link.category);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (link.query && onSearch) {
      event.preventDefault();
      onSearch(link.query);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    event.preventDefault();
  };

  const renderLink = (link: FooterLink, key: string) => (
    <a key={key} href="#" onClick={(event) => handleLink(event, link)}>
      {link.label}
    </a>
  );

  return (
    <footer className="footer">
      <div className="footer-top">
        <h3 className="footer-top-title">Sélection The Box</h3>

        <div className="footer-categories">
          {selection.map((column, columnIndex) => (
            <ul key={columnIndex}>
              {column.map((link, linkIndex) => (
                <li key={linkIndex}>{renderLink(link, `${columnIndex}-${linkIndex}`)}</li>
              ))}
            </ul>
          ))}
        </div>

        <p className="footer-description">
          Découvrez les sneakers et chaussures tendance sur{" "}
          <strong>The Box</strong>. Du streetwear au sport, une sélection
          pensée pour le style, le confort et le quotidien en RDC.
        </p>
      </div>

      <div className="footer-socials">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
          >
            <i className={social.icon} />
          </a>
        ))}
      </div>

      <div className="footer-bottom footer-bottom--desktop">
        {columns.map((column) => (
          <div className="footer-column" key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map((link, index) => (
                <li key={index}>{renderLink(link, `col-${column.title}-${index}`)}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-column">
          <h4>Pays</h4>
          <p className="footer-country">Vous êtes en RDC</p>
          <a href="#" className="change-country" onClick={(event) => event.preventDefault()}>
            Nous contacter
          </a>
        </div>
      </div>

      <div className="footer-bottom footer-bottom--mobile">
        {columns.map((column) => (
          <FooterAccordion key={column.title} title={column.title}>
            <ul>
              {column.links.map((link, index) => (
                <li key={index}>{renderLink(link, `mcol-${column.title}-${index}`)}</li>
              ))}
            </ul>
          </FooterAccordion>
        ))}

        <FooterAccordion title="Pays">
          <p className="footer-country">Vous êtes en RDC</p>
          <a href="#" className="change-country" onClick={(event) => event.preventDefault()}>
            Nous contacter
          </a>
        </FooterAccordion>
      </div>

      <div className="footer-copy-container">
        <div className="footer-copy">
          © {new Date().getFullYear()} The Box — Tous droits réservés.
        </div>
        <div className="footer-legal">
          {legal.map((link) => (
            <a key={link.label} href="#" onClick={(event) => event.preventDefault()}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={open ? "footer-accordion is-open" : "footer-accordion"}>
      <button
        type="button"
        className="footer-accordion-trigger"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className="footer-accordion-panel" hidden={!open}>
        {children}
      </div>
    </div>
  );
}

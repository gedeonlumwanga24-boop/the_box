import { useProfile } from "../profile-store";

type OrderProduct = {
  name: string;
  image?: string | null;
  taille?: string | null;
  quantite: number;
};

type Order = {
  id: string | number;
  createdAt?: string;
  total: number;
  paymentStatus: "non_paye" | "en_verification" | "payee" | "refusee";
  paymentMethodLabel?: string;
  statut: "en_attente" | "payee" | "expediee" | "terminee" | "livree" | "annulee";
  items: OrderProduct[];
};

type AccountPageProps = {
  onGoToCatalog: () => void;
  onGoToMessages: () => void;
  onEditProfile: () => void;
};

const fallbackOrderImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80";

const formatOrderDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatOrderTotal = (value: number) =>
  `${value.toLocaleString("fr-FR")} CDF`;

function paymentStatus(order: Order) {
  switch (order.paymentStatus) {
    case "payee":
      return {
        iconCls: "icon-success",
        icon: "M5 13l4 4L19 7",
        text: "Paiement validé",
        desc: order.paymentMethodLabel
          ? `Payé via ${order.paymentMethodLabel}`
          : "Transaction confirmée",
      };
    case "en_verification":
      return {
        iconCls: "icon-warning",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        text: "Paiement en vérification",
        desc: "Validation de la transaction en cours...",
      };
    case "refusee":
      return {
        iconCls: "icon-error",
        icon: "M6 18L18 6M6 6l12 12",
        text: "Paiement échoué",
        desc: "Le paiement a été refusé ou annulé.",
      };
    default:
      return {
        iconCls: "icon-neutral",
        icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        text: "En attente de paiement",
        desc: "Veuillez finaliser votre paiement.",
      };
  }
}

function deliveryStatus(order: Order) {
  switch (order.statut) {
    case "payee":
      return {
        iconCls: "icon-info",
        icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
        text: "En préparation",
        desc: "Vos articles sont en cours d'emballage.",
      };
    case "expediee":
      return {
        iconCls: "icon-info",
        icon: "M13 10V3L4 14h7v7l9-11h-7z",
        text: "Colis expédié",
        desc: "Votre commande est en route.",
      };
    case "terminee":
    case "livree":
      return {
        iconCls: "icon-success",
        icon: "M5 13l4 4L19 7",
        text: "Colis livré",
        desc: "La commande a été remise avec succès.",
      };
    case "annulee":
      return {
        iconCls: "icon-error",
        icon: "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636",
        text: "Annulée",
        desc: "Cette commande a été annulée.",
      };
    default:
      return {
        iconCls: "icon-neutral",
        icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        text: "Livraison en attente",
        desc: "En attente de paiement",
      };
  }
}

function StatusCell({ label, status }: { label: string; status: ReturnType<typeof paymentStatus> }) {
  return (
    <div className="status-cell">
      <div className={`status-icon ${status.iconCls}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={status.icon} />
        </svg>
      </div>
      <div className="status-content">
        <p className="status-label">{label}</p>
        <p className="status-value">{status.text}</p>
        <p className="status-desc">{status.desc}</p>
      </div>
    </div>
  );
}

export function AccountPage({
  onGoToCatalog,
  onGoToMessages,
  onEditProfile,
}: AccountPageProps) {
  const profile = useProfile();
  const orders: Order[] = [];

  return (
    <div className="acct-wrap">
      <div className="acct-header">
        <div className="acct-title-group">
          <h1 className="acct-title">Mon Compte</h1>
          <p className="acct-subtitle">Bienvenue, {profile.name}</p>
        </div>
        <button type="button" className="btn-logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Déconnexion
        </button>
      </div>

      <div className="acct-layout">
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "2rem" }}>
          <div className="acct-card">
            <div className="acct-card-header">
              <h3 className="acct-card-title">Mes Informations</h3>
              <button type="button" className="btn-edit" onClick={onEditProfile}>
                Modifier
              </button>
            </div>
            <div className="acct-card-body">
              <div className="info-row">
                <span className="info-label">Nom complet</span>
                <p className="info-val">{profile.name || "—"}</p>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <p className="info-val">{profile.email || "—"}</p>
              </div>
              <div className="info-row">
                <span className="info-label">Téléphone</span>
                <p className="info-val">{profile.telephone || "—"}</p>
              </div>
              <div className="info-row">
                <span className="info-label">Adresse de livraison</span>
                <p className="info-val">{profile.adresse || "—"}</p>
              </div>
              <div className="info-row">
                <span className="info-label">Ville</span>
                <p className="info-val">{profile.ville || "—"}</p>
              </div>
            </div>
          </div>

          <div className="acct-card">
            <div className="acct-card-body" style={{ background: "#f8fafc", textAlign: "center", padding: "2rem 1.5rem" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 0.75rem", display: "block" }}>
                <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p style={{ fontSize: "0.95rem", color: "#475569", margin: "0 0 1.25rem", fontWeight: 600 }}>
                Une question sur votre commande ?
              </p>
              <button
                type="button"
                onClick={onGoToMessages}
                style={{ display: "inline-block", background: "#fff", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 700, fontSize: "0.9rem", padding: "0.6rem 1.2rem", borderRadius: 8, textDecoration: "none", transition: "all 0.15s", width: "100%", cursor: "pointer", fontFamily: "inherit" }}
              >
                Contacter le support
              </button>
            </div>
          </div>
        </aside>

        <main>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.5rem" }}>
            Historique des commandes
          </h2>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="empty-msg">Vous n'avez passé aucune commande pour le moment.</p>
              <button type="button" className="btn-shop" onClick={onGoToCatalog}>
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <div className="orders-container">
              {orders.map((order) => {
                const payment = paymentStatus(order);
                const delivery = deliveryStatus(order);
                return (
                  <div className="order-card" key={String(order.id)}>
                    <div className="order-head">
                      <div className="order-id-group">
                        <p className="order-id">
                          Commande #{String(order.id).padStart(5, "0")}
                        </p>
                        <p className="order-date">{formatOrderDate(order.createdAt)}</p>
                      </div>
                      <div className="order-total-block">
                        <p className="order-total">{formatOrderTotal(order.total)}</p>
                      </div>
                    </div>

                    <div className="order-status-bar">
                      <StatusCell label="Paiement" status={payment} />
                      <StatusCell label="Livraison" status={delivery} />
                    </div>

                    <div className="order-body">
                      {order.items.map((item, index) => (
                        <div className="order-item" key={`${order.id}-${index}`}>
                          <img
                            src={item.image || fallbackOrderImage}
                            alt={item.name}
                            className="order-item-img"
                          />
                          <div className="order-item-details">
                            <p className="order-item-name">{item.name}</p>
                            {item.taille ? (
                              <p className="order-item-meta">Taille : {item.taille}</p>
                            ) : null}
                          </div>
                          <div className="order-item-qty">&times; {item.quantite}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

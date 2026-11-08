import { useCallback, useEffect, useState, type ReactNode } from "react";
import { adminApi } from "./admin-api";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminProduitsPage } from "./pages/AdminProduitsPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminCommandesPage } from "./pages/AdminCommandesPage";
import { AdminClientsPage } from "./pages/AdminClientsPage";
import { AdminMessagesPage } from "./pages/AdminMessagesPage";
import { AdminConfigPage } from "./pages/AdminConfigPage";
import { AdminPlaceholderPage } from "./pages/AdminPlaceholderPage";

export type AdminView =
  | "dashboard"
  | "produits"
  | "categories"
  | "commandes"
  | "paiements"
  | "clients"
  | "messages"
  | "notifications"
  | "config"
  | "errors"
  | "admins";

const viewTitles: Record<AdminView, string> = {
  dashboard: "Tableau de bord",
  produits: "Gestion des Produits",
  categories: "Gestion des Catégories",
  commandes: "Gestion des Commandes",
  paiements: "Paiements en attente",
  clients: "Gestion des Clients",
  messages: "Boîte de réception (Messages)",
  notifications: "Notifications",
  config: "Configuration",
  errors: "Gestion des erreurs",
  admins: "Administrateurs",
};

type AdminAppProps = {
  onExit: () => void;
};

export function AdminApp({ onExit }: AdminAppProps) {
  const [view, setView] = useState<AdminView>("dashboard");
  const [collapsed, setCollapsed] = useState(
    () =>
      window.localStorage.getItem("admin-sidebar-collapsed") === "true" ||
      window.innerWidth < 900,
  );
  const [pendingPayments, setPendingPayments] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const [orders, messages] = await Promise.all([
          adminApi.orders.list(),
          adminApi.messages.list(),
        ]);
        setPendingPayments(
          orders.filter((o) => o.paymentStatus === "en_verification").length,
        );
        setUnreadMessages(
          messages.filter((m) => m.status !== "lu" && m.status !== "répondu")
            .length,
        );
      } catch {
        // badges indisponibles
      }
    };
    void loadBadges();
  }, [refreshKey]);

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("admin-sidebar-collapsed", String(next));
      return next;
    });
  };

  const navItem = (
    target: AdminView,
    icon: string,
    label: string,
    options?: { sub?: boolean; badge?: number; badgeColor?: string; iconColor?: string },
  ) => (
    <a
      href="#"
      key={target}
      className={
        "admin-nav-item" +
        (options?.sub ? " sub-item" : "") +
        (view === target ? " active" : "")
      }
      style={{ display: "flex", alignItems: "center" }}
      onClick={(event) => {
        event.preventDefault();
        setView(target);
        window.scrollTo({ top: 0 });
      }}
    >
      <i
        className={`fa-solid ${icon}`}
        style={{
          marginRight: 10,
          width: 20,
          textAlign: "center",
          ...(options?.iconColor ? { color: options.iconColor } : {}),
        }}
      />
      <span
        className="nav-text"
        style={
          options?.iconColor
            ? { color: options.iconColor, fontSize: "0.88rem" }
            : undefined
        }
      >
        {label}
      </span>
      {options?.badge != null && options.badge > 0 && (
        <span
          className="badge-count"
          style={{
            background: options.badgeColor ?? "#dc2626",
            color: "white",
            padding: "0.1rem 0.4rem",
            borderRadius: 999,
            fontSize: "0.7rem",
            fontWeight: "bold",
            marginLeft: "auto",
          }}
        >
          {options.badge}
        </span>
      )}
    </a>
  );

  const renderView = (): ReactNode => {
    switch (view) {
      case "dashboard":
        return <AdminDashboardPage key={refreshKey} onNavigate={setView} />;
      case "produits":
        return <AdminProduitsPage key={refreshKey} onChanged={refresh} />;
      case "categories":
        return <AdminCategoriesPage key={refreshKey} onChanged={refresh} />;
      case "commandes":
      case "paiements":
        return (
          <AdminCommandesPage
            key={`${view}-${refreshKey}`}
            pendingOnly={view === "paiements"}
            onChanged={refresh}
          />
        );
      case "clients":
        return <AdminClientsPage key={refreshKey} onChanged={refresh} />;
      case "messages":
        return <AdminMessagesPage key={refreshKey} onChanged={refresh} />;
      case "config":
        return <AdminConfigPage />;
      default:
        return <AdminPlaceholderPage title={viewTitles[view]} />;
    }
  };

  return (
    <div className={collapsed ? "admin-body sidebar-collapsed" : "admin-body"}>
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a
            href="#"
            className="admin-brand"
            onClick={(event) => {
              event.preventDefault();
              setView("dashboard");
            }}
          >
            THE BOX ADMIN
          </a>
          <button
            type="button"
            className="btn-sidebar-toggle"
            id="sidebarToggle"
            onClick={toggleSidebar}
            aria-label="Basculer le menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
        <nav className="admin-nav">
          {navItem("dashboard", "fa-chart-line", "Dashboard")}
          {navItem("produits", "fa-box", "Produits")}
          {navItem("categories", "fa-folder", "Catégories")}
          {navItem("commandes", "fa-cart-shopping", "Commandes")}
          {navItem("paiements", "fa-clock", "Paiements en attente", {
            sub: true,
            badge: pendingPayments,
            iconColor: pendingPayments > 0 ? "#dc2626" : undefined,
          })}
          {navItem("clients", "fa-users", "Clients")}
          {navItem("messages", "fa-envelope", "Messages", {
            badge: unreadMessages,
            badgeColor: "#3b82f6",
          })}
          {navItem("notifications", "fa-paper-plane", "Notifications")}
          {navItem("config", "fa-gear", "Configuration")}
          {navItem("errors", "fa-bug", "Gestion des erreurs")}
          {navItem("admins", "fa-user-shield", "Administrateurs")}
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-logout-form">
            <button type="button" onClick={onExit} title="Retour à la boutique">
              <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: 8 }} />
              <span>Retour au site</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">{viewTitles[view]}</h1>
          <div className="admin-topbar-actions">
            <button
              type="button"
              className="btn-visit-site"
              style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
              onClick={onExit}
            >
              <i className="fa-solid fa-globe" /> Voir le site
            </button>
          </div>
        </header>

        <div className="admin-content">{renderView()}</div>
      </main>
    </div>
  );
}

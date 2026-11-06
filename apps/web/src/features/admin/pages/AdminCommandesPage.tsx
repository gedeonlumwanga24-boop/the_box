import { useEffect, useState } from "react";
import { adminApi, type AdminOrder } from "../admin-api";

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80";

type AdminCommandesPageProps = {
  pendingOnly?: boolean;
  onChanged: () => void;
};

const formatCDF = (value: number) =>
  `${Math.round(value).toLocaleString("fr-FR")} CDF`;

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const paymentBadge = (status: string) => {
  switch (status) {
    case "payee":
      return { cls: "badge-success", label: "Paiement: Payé" };
    case "en_verification":
      return { cls: "badge-pending", label: "Paiement: En vérif" };
    case "refusee":
      return { cls: "badge-error", label: "Paiement: Refusé" };
    default:
      return { cls: "", label: "Paiement: Non payé", style: { background: "#f3f4f6" } };
  }
};

const deliveryBadge = (statut: string) => {
  switch (statut) {
    case "payee":
      return { cls: "", label: "Livraison: Préparation", style: { background: "#e0e7ff", color: "#3730a3" } };
    case "expediee":
      return { cls: "", label: "Livraison: Expédiée", style: { background: "#cffafe", color: "#164e63" } };
    case "terminee":
    case "livree":
      return { cls: "badge-success", label: "Livraison: Livrée" };
    case "annulee":
      return { cls: "badge-error", label: "Livraison: Annulée" };
    default:
      return null;
  }
};

export function AdminCommandesPage({ pendingOnly, onChanged }: AdminCommandesPageProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.orders.list();
      setOrders(data);
      setError(null);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openDetail = async (id: number) => {
    try {
      setSelected(await adminApi.orders.get(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const visible = pendingOnly
    ? orders.filter((o) => o.paymentStatus === "en_verification")
    : orders;

  if (selected) {
    const pay = paymentBadge(selected.paymentStatus);
    const del = deliveryBadge(selected.statut);
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Commande #{String(selected.id).padStart(5, "0")}
          </h3>
          <button
            type="button"
            className="btn-primary-sm"
            style={{ border: "none", cursor: "pointer", font: "inherit", background: "#6b7280" }}
            onClick={() => setSelected(null)}
          >
            Retour
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>Client</span>
              <p style={{ margin: "0.25rem 0", fontWeight: 700 }}>{selected.client}</p>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>{selected.clientEmail}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>Date</span>
              <p style={{ margin: "0.25rem 0", fontWeight: 700 }}>{formatDateTime(selected.date)}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>Total</span>
              <p style={{ margin: "0.25rem 0", fontWeight: 800, fontSize: "1.1rem" }}>{formatCDF(selected.total)}</p>
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase" }}>Adresse</span>
              <p style={{ margin: "0.25rem 0" }}>{selected.adresse ?? "—"}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <span className={`badge ${pay.cls}`} style={pay.style}>{pay.label}</span>
            {del && <span className={`badge ${del.cls}`} style={del.style}>{del.label}</span>}
            {selected.paymentMethod && (
              <span className="badge" style={{ background: "#f3f4f6" }}>
                {selected.paymentMethod}
                {selected.paymentPhone ? ` — ${selected.paymentPhone}` : ""}
              </span>
            )}
            {selected.paymentReference && (
              <span className="badge" style={{ background: "#f3f4f6" }}>
                Réf: {selected.paymentReference}
              </span>
            )}
          </div>

          <h4 style={{ margin: "0 0 0.75rem" }}>Articles</h4>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selected.items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <img
                        src={item.image || fallbackImage}
                        alt={item.name}
                        style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 6 }}
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage;
                        }}
                      />
                    </td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.quantity}</td>
                    <td>{formatCDF(item.unitPrice)}</td>
                    <td>{formatCDF(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="admin-card-title">
          {pendingOnly ? "Paiements en attente" : "Toutes les commandes"}
        </h3>
        {pendingOnly && (
          <span style={{ fontSize: "0.85rem", color: "#92400e", fontWeight: 700 }}>
            {visible.length} en vérification
          </span>
        )}
      </div>

      {error && <div className="admin-alert admin-alert-error" style={{ margin: "1rem 1.5rem 0" }}>{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Client</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  Chargement...
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  {pendingOnly ? "Aucun paiement en attente." : "Aucune commande trouvée."}
                </td>
              </tr>
            ) : (
              visible.map((order) => {
                const pay = paymentBadge(order.paymentStatus);
                const del = deliveryBadge(order.statut);
                return (
                  <tr key={order.id}>
                    <td>
                      <strong>#{String(order.id).padStart(5, "0")}</strong>
                    </td>
                    <td>
                      {order.client}
                      <br />
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {order.clientEmail}
                      </span>
                    </td>
                    <td>{formatDateTime(order.date)}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div>
                          <span className={`badge ${pay.cls}`} style={{ fontSize: "0.7rem", ...pay.style }}>
                            {pay.label}
                          </span>
                        </div>
                        {del && (
                          <div>
                            <span className={`badge ${del.cls}`} style={{ fontSize: "0.7rem", ...del.style }}>
                              {del.label}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong>{formatCDF(order.total)}</strong>
                    </td>
                    <td>
                      <div className="admin-action-links">
                        <button
                          type="button"
                          className="btn-icon text-blue"
                          title="Gérer"
                          onClick={() => void openDetail(order.id)}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

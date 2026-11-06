import { useEffect, useState } from "react";
import { adminApi, type AdminClient } from "../admin-api";

type AdminClientsPageProps = {
  onChanged: () => void;
};

export function AdminClientsPage({ onChanged }: AdminClientsPageProps) {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setClients(await adminApi.clients.list());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (client: AdminClient) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${client.name} ?`)) return;
    try {
      await adminApi.clients.remove(client.id);
      setNotice("Client supprimé.");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  const visible = showDeleted
    ? clients.filter((c) => c.deletedAt != null)
    : clients.filter((c) => c.deletedAt == null);

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="admin-card-title">Base de données Clients</h3>
        <button
          type="button"
          onClick={() => setShowDeleted((v) => !v)}
          style={{
            padding: "0.5rem 1rem",
            background: showDeleted ? "#000" : "#fef2f2",
            color: showDeleted ? "#fff" : "#dc2626",
            border: showDeleted ? "none" : "1px solid #fecaca",
            textDecoration: "none",
            borderRadius: 4,
            cursor: "pointer",
            font: "inherit",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {showDeleted ? "Voir actifs" : "Voir supprimés"}
        </button>
      </div>

      {notice && <div className="admin-alert admin-alert-success" style={{ margin: "1rem 1.5rem 0" }}>{notice}</div>}
      {error && <div className="admin-alert admin-alert-error" style={{ margin: "1rem 1.5rem 0" }}>{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom Complet</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Ville</th>
              <th>Date d'inscription</th>
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
                  Aucun client trouvé.
                </td>
              </tr>
            ) : (
              visible.map((client) => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.name}</strong>
                    {client.deletedAt != null && (
                      <span
                        style={{
                          background: "#fee2e2",
                          color: "#991b1b",
                          padding: "0.1rem 0.4rem",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                          marginLeft: "0.5rem",
                        }}
                      >
                        Supprimé
                      </span>
                    )}
                  </td>
                  <td>
                    <a href={`mailto:${client.email}`} style={{ color: "#2563eb" }}>
                      {client.email}
                    </a>
                  </td>
                  <td>{client.telephone ?? "-"}</td>
                  <td>{client.ville ?? "-"}</td>
                  <td>
                    {new Date(client.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>
                    {client.deletedAt == null && (
                      <button
                        type="button"
                        onClick={() => void handleDelete(client)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fecaca",
                          borderRadius: 4,
                          cursor: "pointer",
                          font: "inherit",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

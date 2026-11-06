import { useEffect, useState } from "react";
import { adminApi, type AdminMessage } from "../admin-api";

type AdminMessagesPageProps = {
  onChanged: () => void;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusBadge = (status: string | null) => {
  if (status === "pending" || status === "non lu") {
    return (
      <span
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "0.1rem 0.5rem",
          borderRadius: 4,
          fontSize: "0.75rem",
          fontWeight: "bold",
        }}
      >
        Non lu
      </span>
    );
  }
  if (status === "lu") {
    return (
      <span
        style={{
          background: "#fef9c3",
          color: "#854d0e",
          padding: "0.1rem 0.5rem",
          borderRadius: 4,
          fontSize: "0.75rem",
          fontWeight: "bold",
        }}
      >
        Lu
      </span>
    );
  }
  if (status === "répondu") {
    return (
      <span
        style={{
          background: "#dcfce7",
          color: "#166534",
          padding: "0.1rem 0.5rem",
          borderRadius: 4,
          fontSize: "0.75rem",
          fontWeight: "bold",
        }}
      >
        Répondu
      </span>
    );
  }
  return null;
};

export function AdminMessagesPage({ onChanged }: AdminMessagesPageProps) {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminMessage | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setMessages(await adminApi.messages.list());
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

  const openConversation = async (id: number) => {
    try {
      const message = await adminApi.messages.get(id);
      setSelected(message);
      setReply(message.adminResponse ?? "");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  };

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const updated = await adminApi.messages.reply(selected.id, reply.trim());
      setSelected({ ...selected, ...updated });
      setReply(updated.adminResponse ?? reply);
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  if (selected) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Conversation — {selected.name ?? "Expéditeur inconnu"}
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
        <div style={{ padding: "1.5rem", maxWidth: 720 }}>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}

          <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#6b7280" }}>
            {formatDateTime(selected.createdAt)}
            {selected.subject ? ` — ${selected.subject}` : ""}
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              whiteSpace: "pre-wrap",
            }}
          >
            <strong>{selected.name}</strong>
            {selected.email ? ` (${selected.email})` : ""}
            <p style={{ margin: "0.5rem 0 0" }}>{selected.message}</p>
          </div>

          {selected.adminResponse && (
            <div
              style={{
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: 12,
                padding: "1rem 1.25rem",
                marginBottom: "1.5rem",
                whiteSpace: "pre-wrap",
              }}
            >
              <strong>Votre réponse</strong>
              <p style={{ margin: "0.5rem 0 0" }}>{selected.adminResponse}</p>
              {selected.respondedAt && (
                <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#6b7280" }}>
                  Envoyée le {formatDateTime(selected.respondedAt)}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleReply}>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="reply">
                {selected.adminResponse ? "Modifier la réponse" : "Répondre"}
              </label>
              <textarea
                id="reply"
                className="admin-textarea"
                rows={5}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Écrivez votre réponse au client..."
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary-sm"
              style={{ padding: "0.75rem 2rem", border: "none", cursor: "pointer" }}
              disabled={sending}
            >
              {sending ? "Envoi..." : "Envoyer la réponse"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Messages de contact</h3>
      </div>

      {error && <div className="admin-alert admin-alert-error" style={{ margin: "1rem 1.5rem 0" }}>{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Statut</th>
              <th>Expéditeur</th>
              <th>Email</th>
              <th>Message</th>
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
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  Aucun message reçu pour le moment.
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr
                  key={message.id}
                  style={
                    message.status !== "lu" && message.status !== "répondu"
                      ? { backgroundColor: "#f0f9ff" }
                      : undefined
                  }
                >
                  <td style={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(message.createdAt)}
                  </td>
                  <td>{statusBadge(message.status)}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <strong>{message.name ?? "-"}</strong>
                  </td>
                  <td>
                    {message.email ? (
                      <a href={`mailto:${message.email}`} style={{ color: "#2563eb" }}>
                        {message.email}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td
                    style={{
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {message.message}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => void openConversation(message.id)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "#000",
                        color: "#fff",
                        border: "none",
                        textDecoration: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                        font: "inherit",
                        fontSize: "0.8rem",
                      }}
                    >
                      Conversation
                    </button>
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

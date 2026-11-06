import { useEffect, useState } from "react";
import { adminApi, type AdminCategory } from "../admin-api";

type AdminCategoriesPageProps = {
  onChanged: () => void;
};

type CategoryForm = {
  name: string;
  slug: string;
  parentId: string;
  displayOrder: string;
  image: string;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  parentId: "",
  displayOrder: "0",
  image: "",
};

export function AdminCategoriesPage({ onChanged }: AdminCategoriesPageProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await adminApi.categories.list());
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

  const roots = categories.filter((c) => c.parentId == null);

  const openCreate = () => {
    setForm(emptyForm);
    setEditing("new");
  };

  const openEdit = (category: AdminCategory) => {
    setForm({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ? String(category.parentId) : "",
      displayOrder: String(category.displayOrder),
      image: category.image ?? "",
    });
    setEditing(category);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom est requis");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        parentId: form.parentId ? Number(form.parentId) : null,
        displayOrder: Number(form.displayOrder) || 0,
        image: form.image.trim() || null,
      };
      if (editing === "new") {
        await adminApi.categories.create(payload);
        setNotice("Catégorie créée avec succès.");
      } else if (editing) {
        await adminApi.categories.update(editing.id, payload);
        setNotice("Catégorie mise à jour avec succès.");
      }
      setEditing(null);
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!window.confirm(`Supprimer la catégorie « ${category.name} » ?`)) return;
    try {
      await adminApi.categories.remove(category.id);
      setNotice("Catégorie supprimée.");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  if (editing) {
    return (
      <div className="admin-card" style={{ maxWidth: 640 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            {editing === "new" ? "Nouvelle catégorie" : `Modifier « ${editing.name} »`}
          </h3>
          <button
            type="button"
            className="btn-primary-sm"
            style={{ border: "none", cursor: "pointer", font: "inherit", background: "#6b7280" }}
            onClick={() => setEditing(null)}
          >
            Retour
          </button>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {error && <div className="admin-alert admin-alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="c-name">Nom</label>
              <input
                id="c-name"
                type="text"
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="c-slug">Slug (optionnel)</label>
              <input
                id="c-slug"
                type="text"
                className="admin-input"
                placeholder="genere-automatiquement"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label" htmlFor="c-parent">Catégorie parente</label>
              <select
                id="c-parent"
                className="admin-select"
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
              >
                <option value="">— Aucune (racine) —</option>
                {roots
                  .filter((c) => editing !== "new" || String(c.id) !== form.parentId)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="c-order">Ordre d'affichage</label>
                <input
                  id="c-order"
                  type="number"
                  className="admin-input"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="c-image">Image (URL)</label>
                <input
                  id="c-image"
                  type="url"
                  className="admin-input"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary-sm"
              style={{ padding: "0.75rem 2rem", fontSize: "1rem", border: "none", cursor: "pointer" }}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Toutes les catégories</h3>
        <button
          type="button"
          className="btn-primary-sm"
          style={{ border: "none", cursor: "pointer", font: "inherit" }}
          onClick={openCreate}
        >
          Nouvelle Catégorie
        </button>
      </div>

      {notice && <div className="admin-alert admin-alert-success" style={{ margin: "1rem 1.5rem 0" }}>{notice}</div>}
      {error && <div className="admin-alert admin-alert-error" style={{ margin: "1rem 1.5rem 0" }}>{error}</div>}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Nom</th>
              <th>Parent</th>
              <th>Produits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  Chargement...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                  Aucune catégorie.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td>
                    {category.image ? (
                      <img
                        src={category.image}
                        alt=""
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 4,
                          fontSize: "0.7rem",
                          color: "#999",
                        }}
                      >
                        Pas d'image
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{category.name}</td>
                  <td>{category.parentName ?? "-"}</td>
                  <td>{category.productsCount}</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn-icon text-blue"
                        title="Modifier"
                        onClick={() => openEdit(category)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        type="button"
                        className="btn-icon text-red"
                        title="Supprimer"
                        style={{ border: "none", background: "transparent", cursor: "pointer" }}
                        onClick={() => void handleDelete(category)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </div>
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

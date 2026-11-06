import { useEffect, useState } from "react";
import { adminApi, type AdminCategory, type AdminProduct } from "../admin-api";

const fallbackImage =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=100&q=80";

type AdminProduitsPageProps = {
  onChanged: () => void;
};

type ProductForm = {
  name: string;
  categoryId: string;
  price: string;
  stock: string;
  description: string;
  imageUrl: string;
};

const emptyForm: ProductForm = {
  name: "",
  categoryId: "",
  price: "",
  stock: "0",
  description: "",
  imageUrl: "",
};

export function AdminProduitsPage({ onChanged }: AdminProduitsPageProps) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        adminApi.products.list(),
        adminApi.categories.list(),
      ]);
      setProducts(prods);
      setCategories(cats);
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

  const openCreate = () => {
    setForm(emptyForm);
    setEditing("new");
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      price: String(product.price),
      stock: String(product.stock),
      description: product.description ?? "",
      imageUrl: product.image ?? "",
    });
    setEditing(product);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Le nom du produit est requis");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        description: form.description.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      if (editing === "new") {
        await adminApi.products.create(payload);
        setNotice("Produit créé avec succès.");
      } else if (editing) {
        await adminApi.products.update(editing.id, payload);
        setNotice("Produit mis à jour avec succès.");
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

  const handleDelete = async (product: AdminProduct) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer « ${product.name} » ?`)) return;
    try {
      await adminApi.products.remove(product.id);
      setNotice("Produit supprimé.");
      await load();
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    }
  };

  if (editing) {
    return (
      <div className="admin-card" style={{ maxWidth: 720 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            {editing === "new" ? "Nouveau produit" : `Modifier « ${editing.name} »`}
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
              <label className="admin-label" htmlFor="p-name">
                Nom du produit
              </label>
              <input
                id="p-name"
                type="text"
                className="admin-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="p-category">
                Catégorie
              </label>
              <select
                id="p-category"
                className="admin-select"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                required
              >
                <option value="">— Choisir une catégorie —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentName ? `${cat.parentName} › ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="p-price">
                  Prix (CDF)
                </label>
                <input
                  id="p-price"
                  type="number"
                  className="admin-input"
                  min="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label" htmlFor="p-stock">
                  Stock disponible
                </label>
                <input
                  id="p-stock"
                  type="number"
                  className="admin-input"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="p-desc">
                Description
              </label>
              <textarea
                id="p-desc"
                className="admin-textarea"
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label" htmlFor="p-image">
                Image (URL)
              </label>
              <input
                id="p-image"
                type="url"
                className="admin-input"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />
              <small style={{ color: "#6b7280" }}>
                L'envoi de fichier n'est pas encore branché — collez une URL d'image.
              </small>
            </div>

            <button
              type="submit"
              className="btn-primary-sm"
              style={{ padding: "0.75rem 2rem", fontSize: "1rem", border: "none", cursor: "pointer" }}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer le produit"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">Tous les produits</h3>
        <button
          type="button"
          className="btn-primary-sm"
          style={{ border: "none", cursor: "pointer", font: "inherit", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
          onClick={openCreate}
        >
          <i className="fa-solid fa-plus" /> Nouveau Produit
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
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Stock</th>
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                  Aucun produit trouvé.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image || fallbackImage}
                      alt={product.name}
                      style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 6 }}
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                  </td>
                  <td>{product.category?.name ?? "N/A"}</td>
                  <td>{Number(product.price).toLocaleString("fr-FR")} CDF</td>
                  <td>
                    {product.stock > 0 ? (
                      <span className="badge badge-success">{product.stock} en stock</span>
                    ) : (
                      <span className="badge badge-error">Rupture</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-action-links">
                      <button
                        type="button"
                        className="btn-icon text-blue"
                        title="Modifier"
                        onClick={() => openEdit(product)}
                      >
                        <i className="fa-solid fa-pen" />
                      </button>
                      <button
                        type="button"
                        className="btn-icon text-red"
                        title="Supprimer"
                        style={{ border: "none", background: "transparent", cursor: "pointer" }}
                        onClick={() => void handleDelete(product)}
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

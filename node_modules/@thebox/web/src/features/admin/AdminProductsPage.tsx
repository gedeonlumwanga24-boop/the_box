import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiRequest } from "../shared/api";
import "./AdminProductsPage.css";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  imageUrl: string;
};

type ProductFormState = {
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  imageUrl: string;
};

const defaultForm: ProductFormState = {
  name: "",
  category: "Chaussures",
  price: "",
  stock: "",
  description: "",
  imageUrl: "",
};

const normalizeProduct = (item: any): ProductRow => ({
  id: String(item.id),
  name: item.name ?? "Produit",
  category: item.category?.name ?? "Autre",
  price: Number(item.price ?? 0),
  stock: Number(item.stock ?? 0),
  description: item.description ?? "",
  imageUrl: item.image ?? item.imageUrl ?? "",
});

export function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<any>("/admin/products");
      setProducts(
        Array.isArray(response) ? response.map(normalizeProduct) : [],
      );
    } catch (error) {
      console.error("Failed to load products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: keyof ProductFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const handleEdit = (product: ProductRow) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
      description: product.description,
      imageUrl: product.imageUrl,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      category: form.category || "Autre",
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
    };

    try {
      const url = editingId
        ? `/admin/products/${editingId}`
        : "/admin/products";
      const method = editingId ? "PATCH" : "POST";

      const response = await apiRequest<any>(url, {
        method,
        body: JSON.stringify(payload),
      });

      const nextProduct = normalizeProduct(response);
      setProducts((current) => {
        if (editingId) {
          return current.map((product) =>
            product.id === editingId ? nextProduct : product,
          );
        }
        return [nextProduct, ...current];
      });

      resetForm();
    } catch (error) {
      console.error("Failed to save product", error);
      alert(
        "Impossible d’enregistrer le produit. Vérifie le backend et les données.",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiRequest(`/admin/products/${id}`, { method: "DELETE" });
      setProducts((current) => current.filter((product) => product.id !== id));
    } catch (error) {
      console.error("Failed to delete product", error);
      alert("Suppression impossible.");
    }
  };

  return (
    <div className="admin-page-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">THE BOX ADMIN</div>
        <nav className="sidebar-nav" aria-label="Menu admin">
          <button type="button" className="sidebar-item active">
            Produits
          </button>
          <button type="button" className="sidebar-item">
            Catégories
          </button>
          <button type="button" className="sidebar-item">
            Commandes
          </button>
          <button type="button" className="sidebar-item">
            Clients
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <section className="admin-form-panel">
          <div className="panel-header">
            <h2>{editingId ? "Modifier le produit" : "Nouveau produit"}</h2>
            {editingId && (
              <button
                type="button"
                className="ghost-button"
                onClick={resetForm}
              >
                Annuler
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <label className="field-group">
              <span>Nom</span>
              <input
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
              />
            </label>

            <div className="two-column-fields">
              <label className="field-group">
                <span>Catégorie</span>
                <input
                  value={form.category}
                  onChange={(event) => setField("category", event.target.value)}
                />
              </label>

              <label className="field-group">
                <span>Prix</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(event) => setField("price", event.target.value)}
                />
              </label>
            </div>

            <label className="field-group">
              <span>Stock</span>
              <input
                type="number"
                value={form.stock}
                onChange={(event) => setField("stock", event.target.value)}
              />
            </label>

            <label className="field-group">
              <span>Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                rows={4}
              />
            </label>

            <label className="field-group">
              <span>Image principale</span>
              <input
                value={form.imageUrl}
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </label>

            {form.imageUrl && (
              <div className="preview-box">
                <img src={form.imageUrl} alt="Preview" />
              </div>
            )}

            <div className="submit-row">
              <button
                type="submit"
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Enregistrement..."
                  : editingId
                    ? "Mettre à jour"
                    : "Ajouter le produit"}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-list-panel">
          <div className="panel-header">
            <h3>Liste des produits</h3>
            <button type="button" className="ghost-button" onClick={resetForm}>
              Nouveau
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Nom</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={
                          product.imageUrl ||
                          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={product.name}
                        className="thumb"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.price.toLocaleString("fr-FR")} CDF</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="actions-row">
                        <button
                          type="button"
                          className="small-button edit"
                          onClick={() => handleEdit(product)}
                        >
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="small-button delete"
                          onClick={() => handleDelete(product.id)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { adminApi, resolveMedia } from "../admin-api";

type Configs = Record<string, string>;

const defaultHeroImage =
  "https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=2000&auto=format&fit=crop";

const MediaPreview = ({
  kind,
  src,
}: {
  kind: "image" | "video";
  src?: string;
}) => {
  const resolved = resolveMedia(src);
  if (!resolved) {
    return (
      <div
        style={{
          width: "100%",
          height: 160,
          background: "#f3f4f6",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "0.75rem",
          border: "1px dashed #d1d5db",
        }}
      >
        <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Aucun média</span>
      </div>
    );
  }
  return kind === "video" ? (
    <video
      src={resolved}
      autoPlay
      loop
      muted
      playsInline
      style={{
        width: "100%",
        height: 200,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid var(--admin-border)",
        marginBottom: "0.75rem",
      }}
    />
  ) : (
    <img
      src={resolved}
      alt="Aperçu"
      style={{
        width: "100%",
        height: 200,
        objectFit: "cover",
        borderRadius: 8,
        border: "1px solid var(--admin-border)",
        marginBottom: "0.75rem",
      }}
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );
};

const UrlField = ({
  label,
  hint,
  value,
  onChange,
  placeholder = "https://...",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) => (
  <div className="admin-form-group">
    <label className="admin-label">{label}</label>
    <input
      type="url"
      className="admin-input"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {hint && (
      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.5rem" }}>{hint}</p>
    )}
  </div>
);

const FilePicker = ({
  accept,
  uploading,
  onFile,
}: {
  accept: string;
  uploading: boolean;
  onFile: (file: File | undefined) => void;
}) => (
  <div className="admin-form-group">
    <label className="admin-label">Depuis votre ordinateur</label>
    <input
      type="file"
      className="admin-input"
      accept={accept}
      disabled={uploading}
      onChange={(e) => {
        onFile(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
    {uploading && (
      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "0.4rem" }}>
        Upload en cours...
      </p>
    )}
  </div>
);

const SaveButton = ({
  saving,
  label = "Enregistrer les modifications",
  onClick,
}: {
  saving: boolean;
  label?: string;
  onClick: () => void;
}) => (
  <div
    style={{
      marginTop: "2rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid var(--admin-border)",
      textAlign: "right",
    }}
  >
    <button
      type="button"
      className="btn-primary-sm"
      style={{ padding: "0.75rem 2rem", fontSize: "1rem", border: "none", cursor: "pointer" }}
      onClick={onClick}
      disabled={saving}
    >
      <i className="fa-solid fa-save" style={{ marginRight: 5 }} />
      {saving ? "Enregistrement..." : label}
    </button>
  </div>
);

export function AdminConfigPage() {
  const [configs, setConfigs] = useState<Configs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .config.get()
      .then(setConfigs)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur de chargement"),
      )
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setConfigs((current) => ({ ...current, [key]: value }));

  const uploadAndSet = async (key: string, file: File | undefined) => {
    if (!file) return;
    setUploadingKey(key);
    setError(null);
    try {
      const path = await adminApi.upload(file);
      set(key, path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploadingKey(null);
    }
  };

  const save = async (keys: string[], label: string) => {
    setSaving(label);
    setError(null);
    setNotice(null);
    try {
      const payload: Record<string, string | null> = {};
      for (const key of keys) payload[key] = configs[key] ?? "";
      const updated = await adminApi.config.update(payload);
      setConfigs(updated);
      setNotice(`${label} enregistré avec succès.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return <p style={{ color: "#6b7280" }}>Chargement de la configuration...</p>;
  }

  return (
    <>
      {notice && (
        <div className="admin-alert admin-alert-success">{notice}</div>
      )}
      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {/* HERO */}
      <div className="admin-card" style={{ maxWidth: 900 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Paramètres du Hero (Bannière d'accueil)
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">Slogan (Tagline)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={configs.hero_tagline ?? ""}
                  onChange={(e) => set("hero_tagline", e.target.value)}
                  placeholder="Ex: Nouvelle Collection"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Titre Principal</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Ex: L'élégance à chaque pas."
                  value={configs.hero_title ?? ""}
                  onChange={(e) => set("hero_title", e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">
                  Image de fond (fallback si pas de vidéo)
                </label>
                <MediaPreview
                  kind="image"
                  src={configs.hero_image || defaultHeroImage}
                />
                <FilePicker
                  accept="image/*"
                  uploading={uploadingKey === "hero_image"}
                  onFile={(f) => void uploadAndSet("hero_image", f)}
                />
                <UrlField
                  label="URL de l'image"
                  hint="Affichée par défaut. Utilisée aussi comme poster pendant le chargement de la vidéo."
                  value={configs.hero_image ?? ""}
                  onChange={(v) => set("hero_image", v)}
                />
              </div>
              <div className="admin-form-group" style={{ marginTop: "1.5rem" }}>
                <label className="admin-label">
                  Vidéo de fond Hero (MP4 recommandé)
                </label>
                <MediaPreview kind="video" src={configs.hero_video} />
                {configs.hero_video && (
                  <button
                    type="button"
                    onClick={() => set("hero_video", "")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      padding: 0,
                      marginBottom: "0.75rem",
                    }}
                  >
                    Supprimer la vidéo hero (l'image sera affichée)
                  </button>
                )}
                <FilePicker
                  accept="video/mp4,video/webm,video/quicktime"
                  uploading={uploadingKey === "hero_video"}
                  onFile={(f) => void uploadAndSet("hero_video", f)}
                />
                <UrlField
                  label="URL de la vidéo"
                  hint="Si une vidéo est configurée, elle remplace l'image sur la bannière d'accueil. Taille max recommandée : 20 Mo."
                  value={configs.hero_video ?? ""}
                  onChange={(v) => set("hero_video", v)}
                />
              </div>
            </div>
          </div>
          <SaveButton
            saving={saving === "Hero"}
            onClick={() =>
              void save(
                ["hero_tagline", "hero_title", "hero_image", "hero_video"],
                "Hero",
              )
            }
          />
        </div>
      </div>

      {/* TRENDING */}
      <div className="admin-card" style={{ maxWidth: 900, marginTop: "2rem" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            Paramètres de la Bannière Vidéo (Tendances)
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">
                  Slogan Vidéo (ex: Les essentiels de l'été)
                </label>
                <input
                  type="text"
                  className="admin-input"
                  value={configs.trending_tagline ?? ""}
                  onChange={(e) => set("trending_tagline", e.target.value)}
                  placeholder="Ex: Les essentiels de l'été"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">
                  Titre Vidéo (ex: Pour ceux qui bougent.)
                </label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Ex: Pour ceux qui bougent."
                  value={configs.trending_title ?? ""}
                  onChange={(e) => set("trending_title", e.target.value)}
                />
              </div>
            </div>
            <div>
              <div className="admin-form-group">
                <label className="admin-label">Vidéo de fond (MP4 recommandé)</label>
                <MediaPreview kind="video" src={configs.trending_video} />
                {configs.trending_video && (
                  <button
                    type="button"
                    onClick={() => set("trending_video", "")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#dc2626",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      padding: 0,
                      marginBottom: "0.75rem",
                    }}
                  >
                    Supprimer la vidéo tendances
                  </button>
                )}
                <FilePicker
                  accept="video/mp4,video/webm,video/quicktime"
                  uploading={uploadingKey === "trending_video"}
                  onFile={(f) => void uploadAndSet("trending_video", f)}
                />
                <UrlField
                  label="URL de la vidéo"
                  hint="L'URL d'une nouvelle vidéo remplacera la vidéo actuelle. Taille max recommandée : 15 Mo."
                  value={configs.trending_video ?? ""}
                  onChange={(v) => set("trending_video", v)}
                />
              </div>
            </div>
          </div>
          <SaveButton
            saving={saving === "Tendances"}
            label="Enregistrer la bannière vidéo"
            onClick={() =>
              void save(
                ["trending_tagline", "trending_title", "trending_video"],
                "Tendances",
              )
            }
          />
        </div>
      </div>

      {/* ANIMATIONS INFO */}
      <div className="admin-card" style={{ maxWidth: 900, marginTop: "2rem" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">Aperçu des Animations</h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <p>Les animations suivantes sont actives sur la page d'accueil :</p>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {[
              "Vidéo ou image en arrière-plan du Hero (configurable depuis l'admin).",
              "Zoom progressif sur le média de fond du Hero.",
              "Apparition en cascade (Fade in & Slide up) des textes du Hero.",
              "Révélation au défilement (Scroll Reveal) pour les sections Collections, Tendances et Valeurs.",
              "Bannière vidéo en arrière-plan dans la section Tendances.",
            ].map((text) => (
              <li key={text} style={{ marginBottom: "0.5rem" }}>
                <i
                  className="fa-solid fa-check"
                  style={{ color: "#10b981", marginRight: 10 }}
                />{" "}
                <strong>{text.split("(")[0].trim()}</strong>
                {text.includes("(") ? text.slice(text.indexOf("(")) : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ABOUT IMAGES */}
      <div className="admin-card" style={{ maxWidth: 900, marginTop: "2rem" }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">
            <i
              className="fa-solid fa-image"
              style={{ marginRight: 8, color: "#6366f1" }}
            />
            Images de la Page "À Propos"
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            {(
              [
                {
                  key: "about_hero_image",
                  label: "Image principale (Hero)",
                  icon: "fa-panorama",
                  color: "#6366f1",
                  hint: "Plein écran en haut de la page",
                },
                {
                  key: "about_image_1",
                  label: "Image secondaire 1 (grande)",
                  icon: "fa-image",
                  color: "#10b981",
                  hint: 'Section "Nos Racines" (grande visuel gauche)',
                },
                {
                  key: "about_image_2",
                  label: "Image secondaire 2 (petite)",
                  icon: "fa-image",
                  color: "#f97316",
                  hint: 'Section "Notre Sélection" (visuel droit)',
                },
              ] as const
            ).map((field) => (
              <div key={field.key}>
                <label
                  className="admin-label"
                  style={{ marginBottom: "0.75rem", display: "block" }}
                >
                  <i
                    className={`fa-solid ${field.icon}`}
                    style={{ marginRight: 5, color: field.color }}
                  />
                  {field.label}
                </label>
                <MediaPreview kind="image" src={configs[field.key]} />
                <FilePicker
                  accept="image/*"
                  uploading={uploadingKey === field.key}
                  onFile={(f) => void uploadAndSet(field.key, f)}
                />
                <UrlField
                  label="URL de l'image"
                  hint={field.hint}
                  value={configs[field.key] ?? ""}
                  onChange={(v) => set(field.key, v)}
                />
              </div>
            ))}
          </div>
          <SaveButton
            saving={saving === "À propos"}
            label="Enregistrer les images À Propos"
            onClick={() =>
              void save(
                ["about_hero_image", "about_image_1", "about_image_2"],
                "À propos",
              )
            }
          />
        </div>
      </div>
    </>
  );
}

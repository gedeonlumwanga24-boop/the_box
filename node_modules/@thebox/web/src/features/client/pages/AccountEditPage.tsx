import { useState } from "react";
import { profileStore, useProfile, type Profile } from "../profile-store";

type AccountEditPageProps = {
  onBackToAccount: () => void;
};

export function AccountEditPage({ onBackToAccount }: AccountEditPageProps) {
  const profile = useProfile();
  const [form, setForm] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);

  const update = (field: keyof Profile) => (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    profileStore.saveProfile(form);
    setSaved(true);
  };

  return (
    <div className="compte-page">
      <div className="compte-header">
        <div>
          <h1 className="compte-title">Modifier mon profil</h1>
          <p className="compte-subtitle">
            <button
              type="button"
              onClick={onBackToAccount}
              style={{
                color: "inherit",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
                font: "inherit",
                padding: 0,
              }}
            >
              ← Retour à mon compte
            </button>
          </p>
        </div>
      </div>

      {saved && (
        <div className="alert-success" style={{ maxWidth: 600, margin: "0 auto 1.5rem" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Profil mis à jour avec succès.
        </div>
      )}

      <div className="compte-layout" style={{ display: "block", maxWidth: 600, margin: "0 auto" }}>
        <div className="compte-card">
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="name" className="auth-label">
                Nom complet
              </label>
              <input
                type="text"
                id="name"
                className="auth-input"
                value={form.name}
                onChange={update("name")}
                required
              />
            </div>

            <div className="auth-form-group">
              <label className="auth-label">Email (non modifiable ici)</label>
              <input
                type="email"
                className="auth-input"
                value={form.email}
                disabled
                style={{ background: "#e5e7eb", cursor: "not-allowed" }}
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="telephone" className="auth-label">
                Téléphone
              </label>
              <input
                type="text"
                id="telephone"
                className="auth-input"
                value={form.telephone}
                onChange={update("telephone")}
                placeholder="+243 ..."
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="adresse" className="auth-label">
                Adresse de livraison
              </label>
              <input
                type="text"
                id="adresse"
                className="auth-input"
                value={form.adresse}
                onChange={update("adresse")}
                placeholder="Avenue, Quartier, Commune..."
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="ville" className="auth-label">
                Ville
              </label>
              <input
                type="text"
                id="ville"
                className="auth-input"
                value={form.ville}
                onChange={update("ville")}
                placeholder="Kinshasa, Lubumbashi..."
              />
            </div>

            <button type="submit" className="auth-submit" style={{ marginTop: "1.5rem" }}>
              Enregistrer les modifications
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

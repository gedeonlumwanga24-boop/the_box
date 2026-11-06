type AdminPlaceholderPageProps = {
  title: string;
};

export function AdminPlaceholderPage({ title }: AdminPlaceholderPageProps) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3 className="admin-card-title">{title}</h3>
      </div>
      <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: "#6b7280" }}>
        <i className="fa-solid fa-screwdriver-wrench" style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }} />
        Ce module sera disponible prochainement.
      </div>
    </div>
  );
}

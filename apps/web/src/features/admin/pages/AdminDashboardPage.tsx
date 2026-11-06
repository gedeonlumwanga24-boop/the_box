import { useEffect, useRef, useState } from "react";
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { adminApi, type DashboardData } from "../admin-api";

Chart.register(
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type AdminDashboardPageProps = {
  onNavigate: (view: "commandes") => void;
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

const statutBadge = (statut: string) => {
  if (statut === "en_attente") return { cls: "badge-pending", label: "En attente" };
  if (statut === "terminee" || statut === "livree")
    return { cls: "badge-success", label: "Terminée" };
  if (statut === "annulee") return { cls: "badge-error", label: "Annulée" };
  return { cls: "", label: statut.charAt(0).toUpperCase() + statut.slice(1) };
};

export function AdminDashboardPage({ onNavigate }: AdminDashboardPageProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const salesRef = useRef<HTMLCanvasElement | null>(null);
  const trafficRef = useRef<HTMLCanvasElement | null>(null);
  const ordersRef = useRef<HTMLCanvasElement | null>(null);
  const chartsRef = useRef<{ destroy: () => void }[]>([]);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur"));
  }, []);

  useEffect(() => {
    if (!data) return;
    chartsRef.current.forEach((chart) => chart.destroy());
    chartsRef.current = [];

    if (salesRef.current) {
      chartsRef.current.push(
        new Chart(salesRef.current, {
          type: "bar",
          data: {
            labels: data.charts.sales.labels,
            datasets: [
              {
                label: "Ventes (CDF)",
                data: data.charts.sales.data,
                backgroundColor: "rgba(37, 99, 235, 0.6)",
                borderColor: "rgb(37, 99, 235)",
                borderWidth: 1,
                borderRadius: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } } },
          },
        }),
      );
    }

    if (trafficRef.current) {
      chartsRef.current.push(
        new Chart(trafficRef.current, {
          type: "line",
          data: {
            labels: data.charts.traffic.labels,
            datasets: [
              {
                label: "Visiteurs Uniques",
                data: data.charts.traffic.visitors,
                borderColor: "rgb(37, 99, 235)",
                backgroundColor: "rgba(37, 99, 235, 0.08)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "rgb(37, 99, 235)",
              },
              {
                label: "Vues de pages",
                data: data.charts.traffic.pageViews,
                borderColor: "rgb(16, 185, 129)",
                backgroundColor: "rgba(16, 185, 129, 0.08)",
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "rgb(16, 185, 129)",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "top" } },
            scales: { y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.05)" } } },
          },
        }),
      );
    }

    if (ordersRef.current) {
      chartsRef.current.push(
        new Chart(ordersRef.current, {
          type: "doughnut",
          data: {
            labels: data.charts.orders.labels,
            datasets: [
              {
                data: data.charts.orders.data,
                backgroundColor: [
                  "rgba(245, 158, 11, 0.75)",
                  "rgba(16, 185, 129, 0.75)",
                  "rgba(239, 68, 68, 0.75)",
                  "rgba(37, 99, 235, 0.75)",
                ],
                borderWidth: 2,
                borderColor: "#ffffff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom", labels: { padding: 16 } },
            },
            cutout: "65%",
          },
        }),
      );
    }

    return () => {
      chartsRef.current.forEach((chart) => chart.destroy());
      chartsRef.current = [];
    };
  }, [data]);

  if (error) {
    return <div className="admin-alert admin-alert-error">{error}</div>;
  }

  if (!data) {
    return <p style={{ color: "#6b7280" }}>Chargement du tableau de bord...</p>;
  }

  return (
    <>
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-icon bg-blue">
            <i className="fa-solid fa-coins" />
          </div>
          <div className="admin-kpi-info">
            <h4>Chiffre d'Affaires</h4>
            <p>{formatCDF(data.kpis.chiffreAffaires)}</p>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon bg-green">
            <i className="fa-solid fa-cart-shopping" />
          </div>
          <div className="admin-kpi-info">
            <h4>Commandes</h4>
            <p>{data.kpis.totalCommandes}</p>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon bg-purple">
            <i className="fa-solid fa-box" />
          </div>
          <div className="admin-kpi-info">
            <h4>Produits</h4>
            <p>{data.kpis.totalProduits}</p>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-icon bg-yellow">
            <i className="fa-solid fa-users" />
          </div>
          <div className="admin-kpi-info">
            <h4>Clients</h4>
            <p>{data.kpis.totalClients}</p>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <i className="fa-solid fa-newspaper" style={{ marginRight: 8 }} />
              Bulletin du Marché
            </h3>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Panier Moyen
              </span>
              <h4 style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>
                {formatCDF(data.market.panierMoyen)}
              </h4>
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Top Collection
              </span>
              <h4 style={{ fontSize: "1.25rem", margin: "0.25rem 0" }}>
                {data.market.topCategorie ?? "N/A"}
              </h4>
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "#6b7280",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Taux de Conversion
              </span>
              <h4 style={{ fontSize: "1.5rem", margin: "0.25rem 0", color: "#10b981" }}>
                {data.market.tauxConversion.toFixed(1)}%
              </h4>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Analyse du Trafic</h3>
          </div>
          <div style={{ padding: "1rem", height: 300 }}>
            <canvas ref={trafficRef} />
          </div>
        </div>
      </div>

      <div
        className="admin-charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Évolution des Ventes</h3>
          </div>
          <div style={{ padding: "1rem", height: 300 }}>
            <canvas ref={salesRef} />
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Répartition des Commandes</h3>
          </div>
          <div style={{ padding: "1rem", height: 300 }}>
            <canvas ref={ordersRef} />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Dernières commandes</h3>
          <button
            type="button"
            className="btn-primary-sm"
            style={{ border: "none", cursor: "pointer", font: "inherit" }}
            onClick={() => onNavigate("commandes")}
          >
            Voir tout
          </button>
        </div>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Commande</th>
                <th>Client</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    Aucune commande pour le moment.
                  </td>
                </tr>
              ) : (
                data.recentOrders.map((order) => {
                  const badge = statutBadge(order.statut);
                  return (
                    <tr key={order.id}>
                      <td>#{String(order.id).padStart(5, "0")}</td>
                      <td>{order.client}</td>
                      <td>{formatDateTime(order.date)}</td>
                      <td>
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      </td>
                      <td>
                        <strong>{formatCDF(order.total)}</strong>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon text-blue"
                          title="Voir les détails"
                          onClick={() => onNavigate("commandes")}
                        >
                          <i className="fa-solid fa-eye" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

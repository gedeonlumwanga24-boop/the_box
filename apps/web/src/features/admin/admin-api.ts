import { apiRequest, apiOrigin } from "../shared/api";

export const resolveMedia = (src?: string | null): string => {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return `${apiOrigin}${src}`;
  if (src.startsWith("uploads/")) return `${apiOrigin}/${src}`;
  return src;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock: number;
  image?: string | null;
  categoryId: number;
  category?: { id: number; name: string; slug: string } | null;
  createdAt?: string;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parentName: string | null;
  displayOrder: number;
  image: string | null;
  productsCount: number;
};

export type AdminOrder = {
  id: number;
  client: string;
  clientEmail: string | null;
  userId: number | null;
  date: string;
  statut: string;
  paymentStatus: string;
  paymentMethod?: string | null;
  paymentPhone?: string | null;
  paymentReference?: string | null;
  paymentProof?: string | null;
  adresse?: string | null;
  total: number;
  items: {
    productId: number;
    name: string;
    image: string | null;
    quantity: number;
    unitPrice: number;
  }[];
};

export type AdminClient = {
  id: number;
  name: string;
  email: string;
  telephone: string | null;
  ville: string | null;
  deletedAt: string | null;
  createdAt: string;
};

export type AdminMessage = {
  id: number;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  status: string | null;
  adminResponse?: string | null;
  respondedAt?: string | null;
  createdAt: string;
};

export type DashboardData = {
  kpis: {
    chiffreAffaires: number;
    totalCommandes: number;
    totalProduits: number;
    totalClients: number;
  };
  market: {
    panierMoyen: number;
    topCategorie: string | null;
    tauxConversion: number;
  };
  charts: {
    sales: { labels: string[]; data: number[] };
    traffic: { labels: string[]; visitors: number[]; pageViews: number[] };
    orders: { labels: string[]; data: number[] };
  };
  recentOrders: {
    id: number;
    client: string;
    date: string;
    statut: string;
    total: number;
    itemsCount: number;
  }[];
};

export const adminApi = {
  upload: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await apiRequest<{ path: string }>("/admin/upload", {
      method: "POST",
      body: form,
    });
    return res.path;
  },

  dashboard: () => apiRequest<DashboardData>("/admin/dashboard"),

  products: {
    list: () => apiRequest<AdminProduct[]>("/admin/products"),
    create: (body: Record<string, unknown>) =>
      apiRequest<AdminProduct>("/admin/products", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: Record<string, unknown>) =>
      apiRequest<AdminProduct>(`/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number) =>
      apiRequest(`/admin/products/${id}`, { method: "DELETE" }),
  },

  categories: {
    list: () => apiRequest<AdminCategory[]>("/admin/categories"),
    create: (body: Record<string, unknown>) =>
      apiRequest<AdminCategory>("/admin/categories", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: number, body: Record<string, unknown>) =>
      apiRequest<AdminCategory>(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: number) =>
      apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
  },

  orders: {
    list: () => apiRequest<AdminOrder[]>("/admin/orders"),
    get: (id: number) => apiRequest<AdminOrder>(`/admin/orders/${id}`),
  },

  clients: {
    list: () => apiRequest<AdminClient[]>("/admin/clients"),
    remove: (id: number) =>
      apiRequest(`/admin/clients/${id}`, { method: "DELETE" }),
  },

  config: {
    get: () => apiRequest<Record<string, string>>("/admin/config"),
    update: (values: Record<string, string | null>) =>
      apiRequest<Record<string, string>>("/admin/config", {
        method: "PUT",
        body: JSON.stringify(values),
      }),
  },

  messages: {
    list: () => apiRequest<AdminMessage[]>("/admin/messages"),
    get: (id: number) => apiRequest<AdminMessage>(`/admin/messages/${id}`),
    reply: (id: number, reply: string) =>
      apiRequest<AdminMessage>(`/admin/messages/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      }),
  },
};

import { useSyncExternalStore } from "react";

export type CartItem = {
  key: string;
  productId: string | number;
  name: string;
  slug?: string;
  price: number;
  image?: string | null;
  category?: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
};

type CartState = {
  items: CartItem[];
};

const STORAGE_KEY = "thebox-cart";

const listeners = new Set<() => void>();

const readStorage = (): CartItem[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
};

let state: CartState = { items: readStorage() };

const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  } catch {
    // stockage indisponible
  }
  listeners.forEach((listener) => listener());
};

export const cartStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getItems(): CartItem[] {
    return state.items;
  },

  getCount(): number {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotal(): number {
    return state.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  },

  addItem(input: {
    productId: string | number;
    name: string;
    slug?: string;
    price: number | string;
    image?: string | null;
    category?: string;
    quantity?: number;
    size?: string | null;
    color?: string | null;
  }) {
    const key = `${input.productId}|${input.size ?? ""}|${input.color ?? ""}`;
    const existing = state.items.find((item) => item.key === key);

    if (existing) {
      state.items = state.items.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + (input.quantity ?? 1) } : item,
      );
    } else {
      state.items.push({
        key,
        productId: input.productId,
        name: input.name,
        slug: input.slug,
        price: Number(input.price ?? 0),
        image: input.image ?? null,
        category: input.category,
        quantity: input.quantity ?? 1,
        size: input.size ?? null,
        color: input.color ?? null,
      });
    }

    persist();
  },

  setQuantity(key: string, quantity: number) {
    if (quantity <= 0) {
      state.items = state.items.filter((item) => item.key !== key);
    } else {
      state.items = state.items.map((item) =>
        item.key === key ? { ...item, quantity } : item,
      );
    }
    persist();
  },

  removeItem(key: string) {
    state.items = state.items.filter((item) => item.key !== key);
    persist();
  },

  clear() {
    state.items = [];
    persist();
  },
};

const useCartSnapshot = () =>
  useSyncExternalStore(cartStore.subscribe, () => state.items);

export function useCartItems() {
  return useCartSnapshot();
}

export function useCartCount() {
  const items = useCartSnapshot();
  return items.reduce((total, item) => total + item.quantity, 0);
}

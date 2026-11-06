import { useSyncExternalStore } from "react";

export type Profile = {
  name: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
};

const STORAGE_KEY = "thebox-profile";

const defaultProfile: Profile = {
  name: "Client The Box",
  email: "client@thebox.cd",
  telephone: "",
  adresse: "",
  ville: "",
};

const listeners = new Set<() => void>();

const readStorage = (): Profile => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile;
    return { ...defaultProfile, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return defaultProfile;
  }
};

let state: Profile = readStorage();

const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // stockage indisponible
  }
  listeners.forEach((listener) => listener());
};

export const profileStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getProfile(): Profile {
    return state;
  },

  saveProfile(profile: Profile) {
    state = { ...profile };
    persist();
  },
};

export function useProfile(): Profile {
  return useSyncExternalStore(profileStore.subscribe, () => state);
}

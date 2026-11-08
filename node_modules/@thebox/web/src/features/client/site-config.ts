import { useEffect, useState } from "react";
import { apiRequest } from "../shared/api";
import { resolveMediaUrl } from "./catalog-shared";

let cached: Record<string, string> | null = null;

export function useSiteConfig(): Record<string, string> {
  const [configs, setConfigs] = useState<Record<string, string>>(cached ?? {});

  useEffect(() => {
    if (cached) {
      setConfigs(cached);
      return;
    }
    apiRequest<Record<string, string>>("/catalog/config")
      .then((data) => {
        const resolved = Object.fromEntries(
          Object.entries(data).map(([key, value]) => [
            key,
            resolveMediaUrl(value),
          ]),
        );
        cached = resolved;
        setConfigs(resolved);
      })
      .catch(() => {
        // configuration indisponible : fallbacks utilisés
      });
  }, []);

  return configs;
}

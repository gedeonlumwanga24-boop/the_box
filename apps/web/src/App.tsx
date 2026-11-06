import { useEffect, useState } from "react";
import { StorefrontPage } from "./features/client/pages/StorefrontPage";
import { AdminApp } from "./features/admin/AdminApp";

const isAdminHash = () => window.location.hash.startsWith("#admin");

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash);

  useEffect(() => {
    const onHashChange = () => setAdmin(isAdminHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (admin) {
    return (
      <AdminApp
        onExit={() => {
          window.location.hash = "";
          setAdmin(false);
        }}
      />
    );
  }

  return <StorefrontPage />;
}

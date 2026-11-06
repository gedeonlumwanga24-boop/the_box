import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import "./styles/navbar.css";
import "./styles/catalog.css";
import "./styles/filters.css";
import "./styles/cards.css";
import "./styles/footer.css";
import "./styles/product.css";
import "./styles/home.css";
import "./styles/home-premium.css";
import "./styles/apropos.css";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import App from "./App.tsx";
import "./index.css";
import { ensureReactLoaded } from "./lib/react-fix";

// Ensure React is loaded first
ensureReactLoaded();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <App />
  </ThemeProvider>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((reg) => {
        console.log("✅ Service Worker registered:", reg);

        reg.onupdatefound = () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.onstatechange = () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                console.log("🔄 New version found! Reloading...");
                window.location.reload();
              }
            };
          }
        };
      })
      .catch((err) => console.error("❌ SW registration failed:", err));
  });
}

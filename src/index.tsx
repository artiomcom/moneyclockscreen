import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { I18nProvider } from "./i18n";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Missing #root element');
}
createRoot(rootEl).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
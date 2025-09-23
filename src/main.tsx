// import React from 'react'
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import "./i18n";
import { AuthProvider } from "./auth/AuthProvider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Restricted mode is temporarily disabled because it causes issues with keycloak-js
  // see here: https://github.com/react-keycloak/react-keycloak/issues/93
  // <React.StrictMode>
  <AuthProvider>
    <App />
  </AuthProvider>,
  // </React.StrictMode>,
);

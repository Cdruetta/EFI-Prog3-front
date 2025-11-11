import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import GlobalLoader from "./components/GlobalLoader";
import App from "./App";
import "primereact/resources/themes/lara-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./App.css";

createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <GlobalLoader />
        <App />
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);
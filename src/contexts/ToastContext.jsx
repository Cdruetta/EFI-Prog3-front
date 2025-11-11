import { createContext, useContext, useMemo, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const toastRef = useRef(null);

  const api = useMemo(() => ({
    showToast: ({ severity = "info", summary, detail, life = 3000 }) => {
      toastRef.current?.show({ severity, summary, detail, life });
    }
  }), []);

  return (
    <ToastContext.Provider value={api}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}



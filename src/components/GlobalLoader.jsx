import { useEffect, useState, useRef } from "react";
import { onLoadingChange } from "../core/loading-bus";
import { ProgressSpinner } from "primereact/progressspinner";

export default function GlobalLoader() {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const cleanup = onLoadingChange((isVisible) => {
      setVisible(isVisible);
      
      // Timeout de seguridad: si el loader está visible por más de 30 segundos, ocultarlo
      if (isVisible) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setVisible(false);
        }, 30000); // 30 segundos máximo
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    });
    
    return () => {
      cleanup();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  if (!visible) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/20 backdrop-blur-sm"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(4px)"
      }}
    >
      <div 
        className="p-6 rounded-2xl bg-white/80 shadow-lg flex items-center gap-3"
        style={{
          padding: "1.5rem",
          borderRadius: "1rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}
      >
        <ProgressSpinner strokeWidth="4" style={{ width: 36, height: 36 }} />
        <span className="font-medium text-gray-800" style={{ fontWeight: 500, color: "#1F2937" }}>Cargando…</span>
      </div>
    </div>
  );
}

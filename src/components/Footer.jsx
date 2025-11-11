import { Divider } from "primereact/divider";

export default function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-6"
      style={{
        background: "linear-gradient(135deg, #0D3B66 0%, #1E5A8A 100%)",
        color: "white",
        boxShadow: "0 -4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="p-5">
        <div className="grid">
          <div className="col-12 md:col-4 flex flex-column align-items-center md:align-items-start gap-3">
            <div className="flex align-items-center gap-2">
              <i className="pi pi-car" style={{ fontSize: "2rem", color: "#60A5FA" }} />
              <h3 className="m-0" style={{ color: "#E0E7FF" }}>AlquilerAutos</h3>
            </div>
            <p className="m-0 text-300" style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
              Tu solución confiable para alquiler de vehículos. 
              Encuentra el auto perfecto para tu viaje.
            </p>
          </div>

          <div className="col-12 md:col-4 flex flex-column align-items-center gap-3">
            <h4 className="m-0" style={{ color: "#E0E7FF", fontSize: "1.1rem" }}>Enlaces Rápidos</h4>
            <div className="flex flex-column gap-2 align-items-center">
              <a href="/" className="no-underline text-300 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
                Inicio
              </a>
              <a href="/vehicles" className="no-underline text-300 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
                Vehículos
              </a>
              <a href="/about" className="no-underline text-300 hover:text-white transition-colors" style={{ fontSize: "0.9rem" }}>
                Sobre Nosotros
              </a>
            </div>
          </div>

          <div className="col-12 md:col-4 flex flex-column align-items-center md:align-items-end gap-3">
            <h4 className="m-0" style={{ color: "#E0E7FF", fontSize: "1.1rem" }}>Contacto</h4>
            <div className="flex flex-column gap-2 align-items-center md:align-items-end">
              <div className="flex align-items-center gap-2 text-300" style={{ fontSize: "0.9rem" }}>
                <i className="pi pi-envelope" />
                <span>info@alquilerautos.com</span>
              </div>
              <div className="flex align-items-center gap-2 text-300" style={{ fontSize: "0.9rem" }}>
                <i className="pi pi-phone" />
                <span>+54 11 1234-5678</span>
              </div>
              <div className="flex align-items-center gap-2 text-300" style={{ fontSize: "0.9rem" }}>
                <i className="pi pi-map-marker" />
                <span>Buenos Aires, Argentina</span>
              </div>
            </div>
          </div>
        </div>

        <Divider className="my-4" style={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />

        <div className="flex flex-column md:flex-row align-items-center justify-content-between gap-3">
          <span className="text-300" style={{ fontSize: "0.85rem" }}>
            © {year} AlquilerAutos. Todos los derechos reservados.
          </span>
          <div className="flex gap-3">
            <a 
              href="#" 
              className="no-underline text-300 hover:text-white transition-colors"
              style={{ fontSize: "1.5rem" }}
              title="Facebook"
            >
              <i className="pi pi-facebook" />
            </a>
            <a 
              href="#" 
              className="no-underline text-300 hover:text-white transition-colors"
              style={{ fontSize: "1.5rem" }}
              title="Instagram"
            >
              <i className="pi pi-instagram" />
            </a>
            <a 
              href="#" 
              className="no-underline text-300 hover:text-white transition-colors"
              style={{ fontSize: "1.5rem" }}
              title="Twitter"
            >
              <i className="pi pi-twitter" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

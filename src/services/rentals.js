import { resource } from "./api";

// El backend usa "rentals" (minúscula, plural) aunque la tabla en DB sea "Rentals"
export const rentalsService = resource("rentals", "Alquiler");

// Ejemplos de endpoints "de acción" típicos en alquileres:
// rentalsService.post("start", { clientId, carId, from, to });
// rentalsService.post("return", { rentalId, fuelLevel, kilometers });

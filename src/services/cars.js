import { resource } from "./api";

export const carsService = resource("Car", "Auto");

// Ejemplos:
// carsService.list({ params: { page: 1, brand: "Ford" } });
// carsService.create({ plate: "ABC123", model: "Fiesta" });

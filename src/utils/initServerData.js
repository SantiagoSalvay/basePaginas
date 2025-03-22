import { initializeStore } from "./productStore";

export function initServerData() {
  // La inicialización ahora ocurre automáticamente al importar productStore.js
  // No es necesario inicializar con un objeto vacío ya que el sistema ahora
  // carga automáticamente los datos del archivo si existe
  
  console.log("[Server] Inicialización del servidor completada");
  console.log("[Server] Los productos con descuentos se cargan automáticamente desde el almacenamiento persistente");
} 
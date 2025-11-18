import { toggleSidebar } from "/public/js/main.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global
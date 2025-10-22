
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global
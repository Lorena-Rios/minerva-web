import { supabase } from "/public/js/configs/config.js";
import { loadSidebar, loadModalTema } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";



loadSidebar(); // Carrega o partial
loadModalTema(); // Carrega o modal de tema
window.toggleSidebar = toggleSidebar; // Garante acesso global

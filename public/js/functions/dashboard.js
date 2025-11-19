import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js"

window.toggleSidebar = toggleSidebar; // Garante acesso global
loadSidebar(); // Carrega o partial

// --- ESTILOS PADRÃO ---
const toastError = {
    background: "#C84A5B", // Vermelho Suave
    borderRadius: "8px"
};

const toastSuccess = {
    background: "#B5CA8A", // Verde Suave
    borderRadius: "8px",
    color: "white",
    fontWeight: "bold"
};

async function loadUserData() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
        console.error("Erro ao buscar sessão:", sessionError);
        return;
    }

    // ==========================================================
    //  A "GUARDA" DE AUTENTICAÇÃO
    // ==========================================================
    if (!session) {
        // SUBSTITUIÇÃO 1: Redirecionamento por falta de login
        Toastify({
            text: "Você precisa estar logado para acessar esta página.",
            duration: 3000,
            gravity: "top",
            position: "center",
            style: toastError
        }).showToast();

        // Espera 2s para o usuário ler antes de chutar ele para o login
        setTimeout(() => {
            window.location.href = "../login/index.html";
        }, 2000);
        
        return;
    }

    const user = session.user;

    const { data: profile, error: profileError } = await supabase
        .from("user_profile")
        .select("nome") 
        .eq("id", user.id) 
        .single(); 

    if (profileError) {
        console.error("Erro ao buscar perfil do usuário:", profileError.message);
        
        // SUBSTITUIÇÃO 2: Erro de perfil
        Toastify({
            text: "Não foi possível carregar seu perfil.",
            duration: 3000,
            style: toastError
        }).showToast();
        
        return;
    }

    // Logs para debug (pode remover depois)
    console.log("Sessão atual:", session);
    console.log("Usuário:", user);
    console.log("Perfil:", profile);

    
    if (profile) {
        // Assumindo que você tem um elemento no HTML com id="user-name"
        const userNameElement = document.getElementById("user-name");
        if (userNameElement) {
            userNameElement.textContent = profile.nome;
        } else {
            console.warn("Elemento #user-name não encontrado no HTML.");
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadUserData();
});
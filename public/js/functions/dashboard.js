
import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";

loadSidebar(); // Carrega o partial




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
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "../login/index.html";
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
        alert("Não foi possível carregar seu perfil.");
        return;
    }
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

// 5. [BÔNUS] Função de Logout
async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Erro ao fazer logout:", error);
    } else {
        // Envia o usuário de volta para o login após o logout
        alert("Logout realizado com sucesso!");
        window.location.href = "../login/index.html";
    }
}


window.handleLogout = handleLogout; // Permite chamar 'handleLogout()' de um botão no HTML

document.addEventListener("DOMContentLoaded", () => {
    loadUserData();
});



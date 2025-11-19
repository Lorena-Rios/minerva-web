import { supabase } from "/public/js/configs/config.js";

// Função de Navegação para o Dashboard
function openDashboard() {
    window.location.href = "../dashboard/index.html"; 
}




// Login
// Login
async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // 1. Validação de campos vazios
  if (!email || !password) {
      Toastify({
          text: "Por favor, preencha o email e a senha.",
          duration: 3000,
          style: { background: "#C84A5B" } // Vermelho erro
      }).showToast();
      return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  // 2. Erro no Supabase (senha errada, etc)
  if (error) {
    Toastify({
        text: "Erro no login: " + error.message,
        duration: 3000,
        style: { background: "#C84A5B" } // Vermelho erro
    }).showToast();
    return;
  }

  const user = data.user;
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("nome, nivel")
      .eq("id", user.id)
      .single();

    // 3. Erro ao buscar perfil
    if (profileError || !profile) {
      console.error("Erro ao buscar perfil:", profileError);
      
      Toastify({
          text: "Login feito, mas houve um erro ao carregar o perfil.",
          duration: 3000,
          style: { background: "#C87A4A" } // Laranja de aviso
      }).showToast();

      // Redireciona mesmo com erro no perfil após 2 segundos
      setTimeout(() => openDashboard(), 2000);
      return;
    }

    // 4. SUCESSO TOTAL!
    Toastify({
        text: `Bem-vindo de volta, ${profile.nome}! 🚀`,
        duration: 2000,
        close: true,
        gravity: "top", 
        position: "right", 
        style: {
            // Gradiente Roxo/Verde do Minerva
            background: "#B5CA8A",
            borderRadius: "10px",
            fontWeight: "bold",
            boxShadow: "0px 4px 15px rgba(0,0,0,0.1)"
        }
    }).showToast();

    // IMPORTANTE: Espera 2 segundos (2000ms) para o usuário ler o toast antes de mudar de página
    setTimeout(() => {
        openDashboard();
    }, 2000);
  }
}
window.handleLogin = handleLogin;


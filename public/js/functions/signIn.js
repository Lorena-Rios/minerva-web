import { createClient } from "https://esm.sh/@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '/public/js/configs/config.js';


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função de Navegação para o Dashboard
function openDashboard() {
    window.location.href = "../dashboard/index.html"; 
}




// Login
async function handleLogin() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // Verifica se os campos não estão vazios
  if (!email || !password) {
      alert("Por favor, preencha o email e a senha.");
      return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Erro no login: " + error.message);
    return;
  }

  const user = data.user;
  if (user) {
    // A verificação de perfil é uma ótima prática!
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("nome, nivel")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Erro ao buscar perfil:", profileError);
      alert("Login realizado, mas houve um erro ao carregar seu perfil.");
      // Mesmo com erro de perfil, podemos redirecionar
      openDashboard(); 
      return;
    }

    // Sucesso! Exibe um alerta e redireciona.
    alert(`Bem-vindo de volta, ${profile.nome}!`);
    openDashboard(); // <-- CHAMANDO A FUNÇÃO DE REDIRECIONAMENTO
  }
}

window.handleLogin = handleLogin;


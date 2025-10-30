import { supabase } from "/public/js/configs/config.js";

// Função de Navegação para o Dashboard
function openDashboard() {
    window.location.href = "../dashboard/index.html"; 
}

// ===========================================
// CADASTRO (SIGN UP)
// ===========================================

async function handleSignUp() {
    // 1. Coleta e Validação dos dados
    const users = document.getElementById("users").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("confirm-password").value;
    

    if (!users) {
        alert("Por favor, preencha o nome.");
        return;
    }

    if (!email) {
        alert("Por favor, preencha o email.");
        return;
    }

    if (!password) {
        alert("Por favor, preencha a senha.");
        return;
    }

    // Verifica se as senhas são iguais
    if (password !== passwordConfirm) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
    }
    console.log({ email, password, users });

    // 2. Tenta cadastrar o usuário no Auth (autenticação) do Supabase
    // O resto da sua lógica permanece igual...
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { 
                display_name: users // Armazena o nome no metadata do usuário
            }
        }
    });

    if (error) {
        alert("Erro no Cadastro: " + error.message);
        return;
    }

    const user = data.user;
    if (user) {
        // Lógica de perfil...
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Verifica se o perfil foi criado
        const { data: profile, error: checkError } = await supabase
            .from("user_profile")
            .select("nome, nivel")
            .eq("id", user.id)
            .single();

        if (checkError || !profile) {
            // Se o trigger falhou ou demorou, cria o perfil manualmente
            const { error: profileError } = await supabase
                .from("user_profile")
                .insert([{ 
                    id: user.id, 
                    nome: users,
                    nivel: 0  // Nível inicial 0
                }]);

            if (profileError) {
                console.error("Erro ao criar perfil:", profileError);
                alert("Erro ao salvar o perfil. O usuário foi criado, mas houve um problema.");
                return;
            }
        }
        
        // 4. Cadastro concluído com sucesso e redirecionamento
        alert("Cadastro realizado com sucesso! Redirecionando para o Dashboard.");
        openDashboard(); // Assumindo que esta função exista em outro lugar
    }
}

window.handleSignUp = handleSignUp;


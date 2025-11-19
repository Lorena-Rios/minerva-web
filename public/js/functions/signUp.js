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
    const cargo = document.getElementById('cargo').value;

    // Configuração padrão para erros (Vermelho Suave)
    const errorStyle = {
        background: "#C84A5B",
        borderRadius: "8px"
    };

    // Validações Individuais
    if (!users) {
        Toastify({
            text: "Por favor, preencha o nome.",
            duration: 3000,
            style: errorStyle
        }).showToast();
        return;
    }
    if (!email) {
        Toastify({
            text: "Por favor, preencha o email.",
            duration: 3000,
            style: errorStyle
        }).showToast();
        return;
    }
    if (!password) {
        Toastify({
            text: "Por favor, preencha a senha.",
            duration: 3000,
            style: errorStyle
        }).showToast();
        return;
    }
    if (!cargo) {
        Toastify({
            text: "Por favor, selecione o cargo.",
            duration: 3000,
            style: errorStyle
        }).showToast();
        return;
    }

    // Verifica se as senhas são iguais
    if (password !== passwordConfirm) {
        Toastify({
            text: "As senhas não coincidem. Tente novamente.",
            duration: 3000,
            style: errorStyle
        }).showToast();
        return;
    }

    console.log({ email, password, users });

    // 2. Tenta cadastrar o usuário no Auth (autenticação) do Supabase
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
            data: { 
                display_name: users, // Armazena o nome no metadata
                cargo: cargo         // Armazena o cargo no metadata
            }
        }
    });

    if (error) {
        Toastify({
            text: "Erro no Cadastro: " + error.message,
            duration: 4000,
            style: errorStyle
        }).showToast();
        return;
    }

    const user = data.user;
    if (user) {
        // Aguarda um momento para o trigger do banco rodar (se houver)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Verifica se o perfil foi criado
        const { data: profile, error: checkError } = await supabase
            .from("user_profile")
            .select("nome, nivel")
            .eq("id", user.id)
            .single();

        if (checkError || !profile) {
            // Se o trigger falhou, tenta criar manualmente
            const { error: profileError } = await supabase
                .from("user_profile")
                .insert([{ 
                    id: user.id, 
                    nome: users,
                    nivel: 0 
                }]);

            if (profileError) {
                console.error("Erro ao criar perfil:", profileError);
                
                // Toast de Erro Crítico (Vermelho)
                Toastify({
                    text: "Erro ao salvar o perfil. O usuário foi criado, mas houve um problema.",
                    duration: 4000,
                    style: errorStyle
                }).showToast();
                return;
            }
        }
        
        // 4. Cadastro concluído com sucesso! (Verde Suave)
        Toastify({
            text: "Cadastro realizado com sucesso! Redirecionando... 🚀",
            duration: 2000,
            close: true,
            gravity: "top",
            position: "right", // Centralizado para destaque
            style: {
                background: "#9A5CAD",
                borderRadius: "10px",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
            }
        }).showToast();

        // Redireciona após 2 segundos
        setTimeout(() => {
            openDashboard(); 
        }, 2000);
    }
}

window.handleSignUp = handleSignUp;


import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global

const PONTOS_POR_NIVEL = 100;


async function loadProfileData() {
    // Encontra os elementos do DOM que vamos preencher
    const nomeEl = document.getElementById('profile-nome');
    const nivelEl = document.getElementById('profile-nivel');
    const pontosEl = document.getElementById('profile-pontos');
    const progressBarEl = document.getElementById('profile-progress-bar');
    const profileRole = document.getElementById('profile-role');

    // Pega o usuário logado
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Se não houver usuário, é uma página protegida. Redireciona para o login.
    if (userError || !user) {
        console.error('Usuário não logado.', userError);
        alert('Você precisa estar logado para ver seu perfil.');
        // Ajuste o caminho para sua página de login
        window.location.href = '/src/login/index.html'; 
        return;
    }

    // Busca os dados do 'user_profile' no Supabase
    const { data: profile, error: profileError } = await supabase
        .from('user_profile')
        .select('nome, nivel, pontos, cargo') // Pega os 4 campos
        .eq('id', user.id)
        .single(); // Espera apenas um resultado

    if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        nomeEl.textContent = 'Erro ao carregar';
        return;
    }

    if (profile) {
        // Preenche os dados na tela
        nomeEl.textContent = profile.nome || 'Usuário';
        nivelEl.textContent = profile.nivel || 0;
        pontosEl.textContent = profile.pontos || 0;
        profileRole.textContent = profile.cargo || 'Aluno';


        // Calcula e preenche a barra de progresso
        const pontosAtuais = parseInt(profile.pontos) || 0;
        
        // Usamos o Módulo (%) para encontrar quantos pontos o usuário tem *neste* nível.

        const pontosNesteNivel = pontosAtuais % PONTOS_POR_NIVEL; 
        
        const progressoPercent = (pontosNesteNivel / PONTOS_POR_NIVEL) * 100;

        progressBarEl.style.width = `${progressoPercent}%`;


    if (profile.cargo === 'Professor') {
        const actions = document.getElementById('profile-actions');

        const btnModulo = document.createElement('button');
        btnModulo.textContent = 'Adicionar Módulo';
        btnModulo.classList.add(
            'bg-[#9A5CAD]', 'text-white', 'font-medium',
            'rounded-xl', 'px-6', 'py-3', 'w-full', 'shadow-md',
            'hover:bg-[#8445a0]', 'transition',
        );
        btnModulo.onclick = () => window.location.href = '/src/profile/criar-modulo/index.html';

        actions.appendChild(btnModulo);
    }
}
}

/**
 * Função para inicializar a página
 */
function initializePage() {
    loadSidebar(); // Carrega o partial da sidebar
    window.toggleSidebar = toggleSidebar; // Torna o toggle global
    loadProfileData(); // Carrega os dados do perfil
}



// Roda a inicialização
initializePage();
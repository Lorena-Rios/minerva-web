import { supabase } from "/public/js/configs/config.js";
import { loadSidebar, loadModalTema } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js"

window.toggleSidebar = toggleSidebar; // Garante acesso global



let currentUser = null;
let userProgress = []; // Array de IDs de temas concluídos
let currentTemas = []; // Array de objetos de temas deste módulo

// INICIALIZA A PÁGINA
async function initializePage() {

    await Promise.all([
        loadSidebar(),
        loadModalTema()   
    ]);

    // Torna as funções globais acessíveis para o HTML (onclick)
    window.toggleSidebar = toggleSidebar;
    window.closeModal = closeModal;
    window.handleProsseguirClick = handleProsseguirClick;

    // Pega o ID do Módulo da URL
    const urlParams = new URLSearchParams(window.location.search);
    const moduloId = urlParams.get('modulo');

    if (!moduloId) {
        document.getElementById('temas-grid').innerHTML = "<p class='text-red-500'>Erro: ID do Módulo não encontrado.</p>";
        return;
    }

    // Pega o usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    // Busca todos os dados do Supabase em paralelo
    await Promise.all([
        fetchModuloDetails(moduloId), // Busca o nome "Fluxogramas"
        fetchUserProgress(),          // Busca o progresso do usuário
        fetchTemas(moduloId)          // Busca os 4 cards brancos
    ]);

    // Finalmente, desenha os cards na tela
    renderTemas();
}

// FUNÇÕES DE BUSCA (FETCH)
async function fetchModuloDetails(moduloId) {
    const { data: modulo, error } = await supabase
        .from('modulos')
        .select('nome')
        .eq('id', moduloId)
        .single();

    if (error) {
        console.error("Erro ao buscar detalhes do módulo:", error);
        document.getElementById('modulo-nome').textContent = "Módulo Inválido";
    } else if (modulo) {
        // ATUALIZA O H1
        document.getElementById('modulo-nome').textContent = modulo.nome;
    }
}

async function fetchTemas(moduloId) {
    const { data: temas, error } = await supabase
        .from('temas')
        .select('id, nome, conteudo, ordem') // Pega o conteúdo do modal
        .eq('modulo_id', moduloId)
        .order('ordem', { ascending: true }); // Ordena os cards

    if (error) {
        console.error('Erro ao buscar temas:', error);
    } else {
        currentTemas = temas || []; // Salva na variável global
    }
}

async function fetchUserProgress() {
    if (!currentUser) return; // Se não há usuário, não há progresso

    const { data: progress, error } = await supabase
        .from('user_temas_concluidos')
        .select('tema_id') // Pega só os IDs
        .eq('user_id', currentUser.id);

    if (error) {
        console.error("Erro ao buscar progresso:", error);
    } else if (progress) {
        // Salva na variável global (ex: ['uuid1', 'uuid2'])
        userProgress = progress.map(item => item.tema_id);
    }
}

function renderTemas() {
    const temasGrid = document.getElementById('temas-grid');
    if (!currentTemas.length) {
        temasGrid.innerHTML = "<p>Nenhum tema encontrado para este módulo.</p>";
        return;
    }

    temasGrid.innerHTML = ""; // Limpa a grade
    let completedCount = 0;

    // Loop para renderizar os cards de TEMA (igual ao que você já tinha)
    currentTemas.forEach(tema => {
        const isCompleted = userProgress.includes(tema.id);
        if (isCompleted) completedCount++;

        const card = document.createElement('button');
        card.type = "button";
        card.className = "bg-white rounded-2xl p-8 shadow-lg h-56 lg:h-64 flex items-center justify-start text-left transition hover:shadow-xl hover:-translate-y-1 relative";
        
        card.dataset.temaId = tema.id;
        card.dataset.nome = tema.nome;
        card.dataset.conteudo = tema.conteudo; 
        
        card.onclick = () => openTemaModal(card); 

        card.innerHTML = `
            <h2 class="text-3xl font-bold text-[#9A5CAD] flex items-center gap-4">
                ${tema.nome}
                ${isCompleted ? `
                    <div class="text-white bg-[#6A9850] rounded-full p-2 text-lg flex items-center justify-center">
                        <i class="ph-check"></i>
                    </div>
                ` : ''}
            </h2>
        `;
        temasGrid.appendChild(card);
    });

    // ATUALIZA O CONTADOR DE PROGRESSO (igual ao que você já tinha)
    document.getElementById('modulo-progresso').textContent = `${completedCount}/${currentTemas.length} Missões Concluídas`;
    
    // 1. Verifica se tudo foi concluído
    const allComplete = (completedCount === currentTemas.length && currentTemas.length > 0);
    
    // 2. Pega o moduloId da URL para construir o link do quiz
    const urlParams = new URLSearchParams(window.location.search);
    const moduloId = urlParams.get('modulo');

    // 3. Cria o elemento do botão (usamos <a> para ser um link)
    const challengeCard = document.createElement('a');
    
    // Faz o card ocupar a largura total no grid
    challengeCard.className = "col-span-1 lg:col-span-2 rounded-2xl p-8 shadow-lg h-56 lg:h-64 flex flex-col items-center justify-center text-center transition relative";

if (allComplete) {
        // ESTADO DESBLOQUEADO (Verde)
        challengeCard.href = `/src/quiz/index.html?modulo=${moduloId}`; // Link para o quiz
        challengeCard.className += " bg-[#6A9850] text-white hover:shadow-xl hover:-translate-y-1";
        
        // NOVO HTML (Ícone de coroa e texto)
        challengeCard.innerHTML = `
            <img src="/public/icon/crown.png" class="h-10" alt="Coroa">
            
            <h2 class="text-2xl font-bold text-white mt-4">
                Desafio Final
            </h2>
        `;
    } else {
        // ESTADO BLOQUEADO (Cinza)
        challengeCard.href = "#"; // Não leva a lugar nenhum
        challengeCard.onclick = (e) => e.preventDefault(); // Impede o clique
        challengeCard.className += " bg-gray-200 text-gray-400 cursor-not-allowed";
        
        // NOVO HTML (Ícone de coroa cinza)
        challengeCard.innerHTML = `
            <img src="/public/icon/crown.png" class="h-10" alt="Coroa">

            <h2 class="text-3xl font-bold text-[#9A5CAD] flex items-center gap-4">
                Desafio Final
            </h2>
        `;
    }

    // 6. Adiciona o botão de desafio ao final da grade
    temasGrid.appendChild(challengeCard);


    // ATUALIZA O CONTADOR DE PROGRESSO
    document.getElementById('modulo-progresso').textContent = `${completedCount}/${currentTemas.length} Missões Concluídas`;
};




//FUNÇÕES DO MODAL
window.openTemaModal = function(cardElement) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const prosseguirBtn = document.getElementById('modal-prosseguir-btn');

    // Pega os dados do card que foi clicado
    const temaId = cardElement.dataset.temaId;
    const nome = cardElement.dataset.nome;
    const conteudo = cardElement.dataset.conteudo;

    // Preenche o modal
    modalTitle.textContent = nome;
    modalBody.innerHTML = marked.parse(conteudo); // innerHTML renderiza o HTML do seu banco
    modalBody.classList.add('text-left', 'leading-relaxed');
    prosseguirBtn.dataset.temaId = temaId; // Passa o ID para o botão "Prosseguir"

    modal.classList.remove('hidden');
}

window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
}

window.handleProsseguirClick = async function(buttonElement) {
    const temaId = buttonElement.dataset.temaId;

    if (!currentUser) {
        closeModal(); // Se não estiver logado, apenas fecha
        return;
    }

    // 1. Salva o progresso no Supabase
    const { error } = await supabase
        .from('user_temas_concluidos')
        .upsert({ 
            user_id: currentUser.id, 
            tema_id: temaId 
        }, { onConflict: 'user_id, tema_id' }); // 'upsert' previne duplicatas

    if (error) {
        console.error("Erro ao salvar progresso:", error);
    } else {
        // 2. Atualiza o estado local e re-desenha os cards
        if (!userProgress.includes(temaId)) {
            userProgress.push(temaId);
        }
        renderTemas(); // Re-renderiza para adicionar o "check" e atualizar o contador
    }

    // 3. Fecha o modal
    closeModal();
}

// INICIA A PÁGINA
initializePage();
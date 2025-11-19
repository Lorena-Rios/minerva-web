import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global

// --- 1. VARIÁVEIS DE ESTADO ---
let currentUser = null;
let moduloId = null;
let currentQuizId = null;
let perguntas = []; 
let currentQuestionIndex = 0; 
let selectedAlternativaId = null; 
let isAnswered = false; 
let initialUserPoints = 0;
let finalUserPoints = 0; 
let acertosNesteQuiz = 0;
let saldoPontosSessao = 0;

// --- 2. ELEMENTOS DO DOM (para não repetir getElementById) ---
let quizCounterEl, quizTitleEl, perguntaDescricaoEl, alternativasContainerEl, mainActionBtnEl;

// --- 3. FUNÇÃO DE INICIALIZAÇÃO ---
async function initializePage() {
    // Carrega partials e define funções globais (para modal e sidebar)
    loadSidebar();
    window.toggleSidebar = toggleSidebar;
    window.openModal = openModal;
    window.closeModal = closeModal;

    // Cacheia os elementos do DOM
    quizCounterEl = document.getElementById('quiz-counter');
    quizTitleEl = document.getElementById('quiz-title');
    perguntaDescricaoEl = document.getElementById('pergunta-descricao');
    alternativasContainerEl = document.getElementById('alternativas-container');
    mainActionBtnEl = document.getElementById('main-action-btn');

    // Pega o ID do Módulo da URL
    const urlParams = new URLSearchParams(window.location.search);
    moduloId = urlParams.get('modulo');

    if (!moduloId) {
        perguntaDescricaoEl.textContent = "Erro: Módulo não encontrado.";
        return;
    }

    // Pega o usuário
    const { data: { user } } = await supabase.auth.getUser();
    currentUser = user;

    if (!currentUser) {
        alert("Você precisa estar logado para fazer o quiz.");
        window.location.href = "/src/login/index.html"; // Redireciona para o login
        return;
    }

    // Carrega os dados do quiz
    await loadQuizData();
}

// --- 4. CARREGAMENTO DOS DADOS ---
async function loadQuizData() {
    try {
        // 1. Encontra o quiz (e o título) pelo modulo_id
        const { data: quizData, error: quizError } = await supabase
            .from('quizzes')
            .select('id, titulo')
            .eq('modulo_id', moduloId)
            .single();

        if (quizError) throw quizError;
        
        currentQuizId = quizData.id;
        quizTitleEl.textContent = quizData.titulo;

        // 2. Busca as perguntas E suas alternativas (usando a mágica do Supabase)
        const { data: perguntasData, error: perguntasError } = await supabase
            .from('perguntas')
            .select(`
                id,
                descricao,
                alternativas ( id, descricao, is_correta )
            `)
            .eq('quiz_id', currentQuizId)
            .limit(5); // 5 perguntas como solicitado

        if (perguntasError) throw perguntasError;

        perguntas = perguntasData;

        // 3. Inicia o quiz renderizando a primeira pergunta
        renderQuestion();

    } catch (error) {
        console.error("Erro ao carregar o quiz:", error);
        perguntaDescricaoEl.textContent = "Erro ao carregar dados do quiz.";
    }
}

// --- 5. RENDERIZAÇÃO DA PERGUNTA ---
function renderQuestion() {
    // Se o quiz acabou, mostra o modal final
    if (currentQuestionIndex >= perguntas.length) {
        showFinalModal();
        return;
    }

    // Reseta o estado para a nova pergunta
    isAnswered = false;
    selectedAlternativaId = null;

    // Pega a pergunta atual
    const pergunta = perguntas[currentQuestionIndex];
    const letras = ['a)', 'b)', 'c)', 'd)'];

    // Atualiza o DOM
    quizCounterEl.textContent = `Questão ${currentQuestionIndex + 1}/${perguntas.length}`;
    perguntaDescricaoEl.textContent = pergunta.descricao;
    alternativasContainerEl.innerHTML = ""; // Limpa as alternativas anteriores

    // Cria os botões de alternativa
    pergunta.alternativas.forEach((alt, index) => {
        const button = document.createElement('button');
        button.className = `w-full text-left border border-gray-300 rounded-xl p-4 transition duration-300 
                             hover:bg-gray-100 hover:border-[#9A5CAD] 
                             focus:outline-none focus:ring-2 focus:ring-[#9A5CAD] focus:bg-purple-50`;
        // Guarda os dados no próprio botão
        button.dataset.id = alt.id;
        button.dataset.correta = alt.is_correta;
        
        button.innerHTML = `
            <span class="font-bold mr-2 text-[#9A5CAD]">${letras[index] || ''}</span> 
            <span class="text-gray-700">${alt.descricao}</span>
        `;
        
        // Adiciona o evento de clique
        button.onclick = handleAlternativeClick;
        alternativasContainerEl.appendChild(button);
    });

    // Reseta o botão principal
    mainActionBtnEl.textContent = "RESPONDER";
    mainActionBtnEl.disabled = true; // Desabilita até uma resposta ser selecionada
    mainActionBtnEl.onclick = handleSubmitAnswer;
}

// --- 6. HANDLERS (GERENCIADORES DE EVENTOS) ---

function handleAlternativeClick(event) {
    if (isAnswered) return; // Trava o clique se já respondeu

    const clickedBtn = event.currentTarget;
    selectedAlternativaId = clickedBtn.dataset.id;

    // Remove o "selecionado" de todos os botões
    Array.from(alternativasContainerEl.children).forEach(btn => {
        btn.classList.remove('ring-2', 'ring-[#9A5CAD]', 'bg-purple-50');
    });

    // Adiciona "selecionado" ao botão clicado
    clickedBtn.classList.add('ring-2', 'ring-[#9A5CAD]', 'bg-purple-50');

    // Habilita o botão "RESPONDER"
    mainActionBtnEl.disabled = false;
}

async function handleSubmitAnswer() {
    if (isAnswered || !selectedAlternativaId) return; // Segurança
    isAnswered = true;
    mainActionBtnEl.disabled = true; // Trava o botão enquanto processa

    // 1. CHAMA A SUA FUNÇÃO `grade_answer` NO SUPABASE
    const { data: gradeData, error: gradeError } = await supabase.rpc('grade_answer', {
        p_quiz: currentQuizId,
        p_pergunta: perguntas[currentQuestionIndex].id,
        p_alternativa: selectedAlternativaId
    });

    if (gradeError) {
        console.error("Erro ao salvar resposta:", gradeError);
        alert("Houve um erro ao salvar sua resposta. Tente novamente.");
        isAnswered = false;
        mainActionBtnEl.disabled = false;
        return;
    }

    finalUserPoints = gradeData.pontos;

    // --- CORREÇÃO AQUI ---
    // Se o banco retornou uma variação (ganhou ou perdeu pontos), soma ao saldo da sessão
    if (gradeData.variacao_pontos) {
        saldoPontosSessao += gradeData.variacao_pontos;
    }

    // Sua função 'grade_answer' retorna o *novo total* de pontos do usuário.
    finalUserPoints = gradeData.pontos;

    // Revela as respostas (lógica de highlight)
    const isCorreta = gradeData.is_correta;

    if (isCorreta) {
        acertosNesteQuiz++; 
    }
    
    Array.from(alternativasContainerEl.children).forEach(btn => {
        const isSelected = (btn.dataset.id === selectedAlternativaId);
        const isCorrectAnswer = (btn.dataset.correta === 'true');

        // Desabilita todos os botões
        btn.disabled = true;
        // Remove anéis de foco
        btn.classList.remove('ring-2', 'ring-[#9A5CAD]', 'bg-purple-50', 'hover:bg-gray-100');

        if (isCorrectAnswer) {
             // Destaca a resposta CORRETA (Verde)
             btn.style.backgroundColor = '#DCFCE7'; // bg-green-100
             btn.style.borderColor = '#4ADE80';     // border-green-400
        } else if (isSelected && !isCorrectAnswer) {
             // Destaca a resposta ERRADA que o usuário escolheu (Vermelho)
             btn.style.backgroundColor = '#FEE2E2'; // bg-red-100
             btn.style.borderColor = '#F87171';     // border-red-400
        }
    });

    // 3. Muda o botão principal para "Próxima Pergunta" ou "Finalizar"
    const isLastQuestion = (currentQuestionIndex === perguntas.length - 1);
    
    if (isLastQuestion) {
        mainActionBtnEl.textContent = "Finalizar Quiz";
        mainActionBtnEl.onclick = showFinalModal; // Chama o modal "Parabéns"
    } else {
        mainActionBtnEl.textContent = "Próxima Pergunta";
        mainActionBtnEl.onclick = handleNextQuestion;
    }
    
    mainActionBtnEl.disabled = false; // Reabilita o botão
}

function handleNextQuestion() {
    currentQuestionIndex++; // Avança para a próxima pergunta
    renderQuestion(); // Renderiza a nova pergunta
}

// --- FUNÇÕES DO MODAL ---
function showFinalModal() {
    const prosseguirLink = document.getElementById('modal-prosseguir-link');
    const feedbackText = document.getElementById('modal-feedback-text');

    // Define o link de "Prosseguir"
    if (prosseguirLink && moduloId) {
        prosseguirLink.href = `/src/mission-page/mission-content/index.html?modulo=${moduloId}`;
    } else {
        prosseguirLink.href = '/src/dashboard/index.html'; 
    }
    
    // LÓGICA NOVA DE PONTOS
    if (feedbackText) {
            // Agora 'saldoPontosSessao' existe e funciona!
            if (saldoPontosSessao > 0) {
                feedbackText.textContent = `+${saldoPontosSessao} pontos nesta sessão!`;
                feedbackText.classList.add('text-green-600');
                feedbackText.classList.remove('text-red-600');
            } else if (saldoPontosSessao < 0) {
                feedbackText.textContent = `${saldoPontosSessao} pontos. (Você revisou e errou algumas)`;
                feedbackText.classList.add('text-red-600');
                feedbackText.classList.remove('text-green-600');
            } else {
                feedbackText.textContent = "Sua pontuação não mudou.";
                feedbackText.classList.remove('text-green-600', 'text-red-600');
            }
        }
        
        openModal();
    }
    
function openModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('hidden');
}

// --- INICIA A PÁGINA ---
initializePage();
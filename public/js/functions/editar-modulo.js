import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

// --- Inicialização ---
loadSidebar();
window.toggleSidebar = toggleSidebar;

// --- Seletores do DOM ---
const form = document.getElementById('form-editar-modulo');
const loadingIndicator = document.getElementById('loading-indicator');
const moduloIdInput = document.getElementById('modulo-id');
const moduloNomeInput = document.getElementById('modulo-nome');
const moduloLevelInput = document.getElementById('modulo-level');
const quizTituloInput = document.getElementById('quiz-titulo');
const temasContainer = document.getElementById('temas-container');
const perguntasContainer = document.getElementById('perguntas-container');
const btnAddTema = document.getElementById('btn-add-tema');
const btnAddPergunta = document.getElementById('btn-add-pergunta');
const btnExcluir = document.getElementById('btn-excluir');

let temaCount = 0;
let perguntaCount = 0;

// --- Carregamento de Dados ---

// Função principal: Pega o ID da URL e carrega os dados
async function carregarDadosDoModulo() {
    // 1. Pega o 'id' da URL (ex: ...?id=uuid-vai-aqui)
    const params = new URLSearchParams(window.location.search);
    const moduloId = params.get('id');

    if (!moduloId) {
        loadingIndicator.textContent = "Erro: ID do módulo não encontrado na URL.";
        loadingIndicator.classList.add('text-red-500');
        return;
    }

    try {
        // 2. Busca o módulo e TODOS os seus filhos
        const { data: modulo, error } = await supabase
            .from('modulos')
            .select(`
                *,
                temas ( * ),
                quizzes (
                    *,
                    perguntas (
                        *,
                        alternativas ( * )
                    )
                )
            `)
            .eq('id', moduloId)
            .single(); // Espera um único resultado

        if (error) throw error;

        if (modulo) {
            // 3. Preenche o formulário com os dados
            populateForm(modulo);
            // 4. Mostra o formulário e esconde o "Carregando..."
            form.classList.remove('hidden');
            loadingIndicator.classList.add('hidden');
        } else {
            throw new Error('Módulo não encontrado ou você não tem permissão.');
        }

    } catch (error) {
        console.error('Erro ao carregar módulo:', error);
        loadingIndicator.textContent = `Erro: ${error.message}`;
        loadingIndicator.classList.add('text-red-500');
    }
}

// Preenche o formulário com os dados do módulo
function populateForm(modulo) {
    // 1. Dados simples do módulo
    moduloIdInput.value = modulo.id;
    moduloNomeInput.value = modulo.nome;
    moduloLevelInput.value = modulo.level_require;

    // 2. Preenche os Temas
    // Ordena os temas pela 'ordem'
    const temasOrdenados = modulo.temas.sort((a, b) => a.ordem - b.ordem);
    temasOrdenados.forEach(tema => {
        addTemaBlock(tema.ordem, tema.nome, tema.conteudo);
    });

    // 3. Preenche o Quiz (assumindo 1 quiz por módulo)
    if (modulo.quizzes && modulo.quizzes.length > 0) {
        const quiz = modulo.quizzes[0];
        quizTituloInput.value = quiz.titulo;

        // 4. Preenche as Perguntas
        quiz.perguntas.forEach(pergunta => {
            // Encontra qual alternativa é a correta
            const corretaIndex = pergunta.alternativas.findIndex(alt => alt.is_correta);
            
            // Coleta as descrições das 4 alternativas
            const descricoes = pergunta.alternativas.map(alt => alt.descricao);
            
            addPerguntaBlock(pergunta.descricao, descricoes, corretaIndex);
        });
    }
}

// --- Funções Dinâmicas de Adição de Bloco ---
// (Modificadas para aceitar valores iniciais)

function addTemaBlock(ordem, nome = '', conteudo = '') {
    temaCount = ordem > temaCount ? ordem : temaCount + 1;
    const temaId = ordem || temaCount;

    const div = document.createElement('div');
    div.className = 'tema-block border p-3 rounded-md bg-gray-50';
    div.innerHTML = `
        <h4 class="font-semibold">Conteúdo ${temaId} (Ordem: ${temaId})</h4>
        <input type="hidden" class="tema-ordem" value="${temaId}">
        <label class="block text-sm font-medium">Título</label>
        <input type="text" class="tema-nome w-full border rounded p-2" value="${nome}" required>
        <label class="block text-sm font-medium mt-2">Conteúdo</label>
        <textarea class="tema-conteudo w-full border rounded p-2" rows="5" required>${conteudo}</textarea>
    `;
    temasContainer.appendChild(div);
}

function addPerguntaBlock(descricao = '', alternativas = ['', '', '', ''], corretaIndex = -1) {
    perguntaCount++;
    const perguntaId = perguntaCount;

    const div = document.createElement('div');
    div.className = 'pergunta-block border p-3 rounded-md bg-gray-50';
    div.innerHTML = `
        <h4 class="font-semibold">Pergunta ${perguntaId}</h4>
        <label class="block text-sm font-medium">Enunciado</label>
        <input type="text" class="pergunta-descricao w-full border rounded p-2" value="${descricao}" required>
        <h5 class="font-medium mt-3 mb-1">Alternativas (Marque a correta)</h5>
        <div class="alternativas-container space-y-2">
            ${criarAlternativaInput(perguntaId, 1, alternativas[0], corretaIndex === 0)}
            ${criarAlternativaInput(perguntaId, 2, alternativas[1], corretaIndex === 1)}
            ${criarAlternativaInput(perguntaId, 3, alternativas[2], corretaIndex === 2)}
            ${criarAlternativaInput(perguntaId, 4, alternativas[3], corretaIndex === 3)}
        </div>
    `;
    perguntasContainer.appendChild(div);
}

function criarAlternativaInput(perguntaId, altIndex, descricao = '', isCorreta = false) {
    const checked = isCorreta ? 'checked' : '';
    return `
        <div class="alternativa-item flex items-center gap-2">
            <input type="radio" name="correta-pergunta-${perguntaId}" class="alternativa-correta" value="${altIndex}" ${checked} required>
            <input type="text" class="alternativa-descricao w-full border rounded p-2" placeholder="Descrição da alternativa ${altIndex}" value="${descricao}" required>
        </div>
    `;
}

// Botões para adicionar NOVOS temas/perguntas
btnAddTema.addEventListener('click', () => addTemaBlock(0)); // 0 indica que é novo
btnAddPergunta.addEventListener('click', () => {
    if (perguntaCount >= 5) {
        // Você pode usar um modal customizado aqui
        console.warn('Limite de 5 perguntas atingido.');
        return;
    }
    addPerguntaBlock();
});


// --- Lógica de Salvar (UPDATE) ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validação
    if (perguntaCount !== 5) {
        // Use um modal customizado
        console.error('São necessárias exatamente 5 perguntas.');
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Salvando...';

    try {
        const payload = buildPayload(); // Reutiliza a função de "criar-modulo"
        const moduloId = moduloIdInput.value;

        // Chama a NOVA RPC de atualização
        const { error } = await supabase.rpc('atualizar_modulo_completo', {
            module_id: moduloId,
            data: payload
        });

        if (error) throw error;

        // Sucesso
        // Use um modal customizado para "Salvo com sucesso!"
        console.log('Módulo atualizado com sucesso!');
        window.location.href = '/src/profile/meus-modulos/index.html'; // Volta para a lista

    } catch (error) {
        console.error('Erro ao salvar módulo:', error);
        // Use um modal customizado para o erro
        submitButton.disabled = false;
        submitButton.textContent = 'Salvar Alterações';
    }
});

// --- Lógica de EXCLUIR (DELETE) ---

btnExcluir.addEventListener('click', async () => {
    const moduloId = moduloIdInput.value;
    const moduloNome = moduloNomeInput.value;

    // ATENÇÃO: Substitua 'prompt' por um modal customizado!
    const confirmacao = prompt(`Para confirmar a exclusão, digite o nome do módulo: "${moduloNome}"`);

    if (confirmacao !== moduloNome) {
        // Use um modal para "Nome incorreto"
        console.warn('Exclusão cancelada. Nome não confere.');
        return;
    }

    btnExcluir.disabled = true;
    btnExcluir.textContent = 'Excluindo...';

    try {
        // Chama a NOVA RPC de exclusão
        const { error } = await supabase.rpc('excluir_modulo', {
            module_id: moduloId
        });

        if (error) throw error;

        // Sucesso
        console.log('Módulo excluído com sucesso!');
        window.location.href = '/src/profile/meus-modulos/index.html'; // Volta para a lista

    } catch (error) {
        console.error('Erro ao excluir módulo:', error);
        // Use um modal para o erro
        btnExcluir.disabled = false;
        btnExcluir.textContent = 'Excluir Módulo';
    }
});


// --- Função Helper: Build Payload ---
// (Exatamente a mesma de 'criar-modulo.js')
function buildPayload() {
    const payload = {};
    payload.nome = document.getElementById('modulo-nome').value;
    payload.level_require = parseInt(document.getElementById('modulo-level').value, 10);
    
    payload.temas = [];
    document.querySelectorAll('.tema-block').forEach(temaDiv => {
        payload.temas.push({
            nome: temaDiv.querySelector('.tema-nome').value,
            conteudo: temaDiv.querySelector('.tema-conteudo').value,
            ordem: parseInt(temaDiv.querySelector('.tema-ordem').value, 10)
        });
    });

    payload.quiz = {
        titulo: document.getElementById('quiz-titulo').value,
        perguntas: []
    };

    document.querySelectorAll('.pergunta-block').forEach((perguntaDiv) => {
        const pergunta = {
            descricao: perguntaDiv.querySelector('.pergunta-descricao').value,
            alternativas: []
        };
        perguntaDiv.querySelectorAll('.alternativa-item').forEach((altItem) => {
            pergunta.alternativas.push({
                descricao: altItem.querySelector('.alternativa-descricao').value,
                is_correta: altItem.querySelector('.alternativa-correta').checked
            });
        });
        payload.quiz.perguntas.push(pergunta);
    });
    return payload;
}

// --- Inicia o carregamento ---
document.addEventListener('DOMContentLoaded', carregarDadosDoModulo);
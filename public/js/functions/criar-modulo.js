import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global

// /public/js/functions/criar-modulo.js

// --- Seletores do DOM ---
const form = document.getElementById('form-criar-modulo');
const temasContainer = document.getElementById('temas-container');
const perguntasContainer = document.getElementById('perguntas-container');
const btnAddTema = document.getElementById('btn-add-tema');
const btnAddPergunta = document.getElementById('btn-add-pergunta');

let temaCount = 0;
let perguntaCount = 0;

// --- Funções de Adição Dinâmica ---

// Adiciona um novo bloco de "Tema"
btnAddTema.addEventListener('click', () => {
    temaCount++;
    const temaId = temaCount;
    
    const div = document.createElement('div');
    div.className = 'tema-block border p-3 rounded-md bg-gray-50';
    div.innerHTML = `
        <h4 class="font-semibold">Conteúdo ${temaId} (Ordem: ${temaId})</h4>
        <input type="hidden" class="tema-ordem" value="${temaId}">
        
        <label class="block text-sm font-medium">Título</label>
        <input type="text" class="tema-nome w-full border rounded p-2" required>
        
        <label class="block text-sm font-medium mt-2">Conteúdo</label>
        <textarea class="tema-conteudo w-full border rounded p-2" rows="5" required></textarea>
    `;
    temasContainer.appendChild(div);
});

// Adiciona um novo bloco de "Pergunta" (com 4 alternativas)
btnAddPergunta.addEventListener('click', () => {
    // Verifica ANTES de adicionar
    if (perguntaCount >= 5) {
        alert('Você já atingiu o limite de 5 perguntas.');
        return; // Para a execução da função aqui
    }


    perguntaCount++;
    const perguntaId = perguntaCount;

    const div = document.createElement('div');
    div.className = 'pergunta-block border p-3 rounded-md bg-gray-50';
    div.innerHTML = `
        <h4 class="font-semibold">Pergunta ${perguntaId}</h4>
        <label class="block text-sm font-medium">Enunciado</label>
        <input type="text" class="pergunta-descricao w-full border rounded p-2" required>
        
        <h5 class="font-medium mt-3 mb-1">Alternativas (Marque a correta)</h5>
        <div class="alternativas-container space-y-2">
            ${criarAlternativaInput(perguntaId, 1)}
            ${criarAlternativaInput(perguntaId, 2)}
            ${criarAlternativaInput(perguntaId, 3)}
            ${criarAlternativaInput(perguntaId, 4)}
        </div>
    `;
    perguntasContainer.appendChild(div);
});

// Helper para criar os 4 inputs de alternativa
function criarAlternativaInput(perguntaId, altIndex) {
    return `
        <div class="alternativa-item flex items-center gap-2">
            <input type="radio" name="correta-pergunta-${perguntaId}" class="alternativa-correta" value="${altIndex}" required>
            <input type="text" class="alternativa-descricao w-full border rounded p-2" placeholder="Descrição da alternativa ${altIndex}" required>
        </div>
    `;
}


// --- Submissão do Formulário (Versão Supabase) ---

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    // Validação
    if (perguntaCount !== 5) {
        alert('Você deve criar exatamente 5 perguntas para o quiz.');
        return;
    }
    
    // Desabilita o botão para evitar cliques duplos
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Criando...';

    try {
        // 1. Construir o Payload (o JSON)
        // (Esta função é da resposta anterior)
        const payload = buildPayload(); 

        // 2. Enviar a Requisição via RPC (Remote Procedure Call)
        // 'criar_modulo_completo' -> nome da sua função SQL
        // { data: payload }       -> argumentos da função
        const { data, error } = await supabase.rpc('criar_modulo_completo', { 
            data: payload 
        });

        if (error) {
            // Se o erro for da nossa checagem de 'professor', será amigável
            throw error; // Lança o erro para o catch
        }

        // 3. Sucesso!
        alert(`Missão criada com sucesso! (ID: ${data})`);
        window.location.href = '/src/dashboard/index.html'; // Redireciona

    } catch (error) {
        console.error('Erro ao criar missão:', error);
        alert(`Erro: ${error.message}`);
        
        // Reabilita o botão em caso de erro
        submitButton.disabled = false;
        submitButton.textContent = 'Criar Missão Completa';
    }
});


// --- Função Principal: Ler o DOM e construir o JSON ---
// (Esta função é da resposta anterior, cole-a aqui)

function buildPayload() {
    // ... (Cole o código da função buildPayload da resposta anterior aqui)
    const payload = {};

    // 1. Dados do Módulo
    payload.nome = document.getElementById('modulo-nome').value;
    payload.level_require = parseInt(document.getElementById('modulo-level').value, 10);

    // 2. Dados dos Temas
    payload.temas = [];
    document.querySelectorAll('.tema-block').forEach(temaDiv => {
        payload.temas.push({
            nome: temaDiv.querySelector('.tema-nome').value,
            conteudo: temaDiv.querySelector('.tema-conteudo').value,
            ordem: parseInt(temaDiv.querySelector('.tema-ordem').value, 10)
        });
    });

    // 3. Dados do Quiz
    payload.quiz = {
        titulo: document.getElementById('quiz-titulo').value,
        perguntas: []
    };

    // 4. Dados das Perguntas
    document.querySelectorAll('.pergunta-block').forEach((perguntaDiv, pIndex) => {
        const pergunta = {
            descricao: perguntaDiv.querySelector('.pergunta-descricao').value,
            alternativas: []
        };

        // 5. Dados das Alternativas
        perguntaDiv.querySelectorAll('.alternativa-item').forEach((altItem, aIndex) => {
            pergunta.alternativas.push({
                descricao: altItem.querySelector('.alternativa-descricao').value,
                is_correta: altItem.querySelector('.alternativa-correta').checked
            });
        });
        
        payload.quiz.perguntas.push(pergunta);
    });

    return payload;
}
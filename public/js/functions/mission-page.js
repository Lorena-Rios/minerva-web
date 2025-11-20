// /public/js/functions/mission-content.js
import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar();
window.toggleSidebar = toggleSidebar;

// --- Constantes e Variáveis Globais ---
const missionsContainerId = "missionsList";
const container = document.getElementById(missionsContainerId);
let allModulos = []; // Armazena TODOS os módulos do Supabase
let currentUserNivel = 0; // Armazena o nível do usuário

// --- Funções Principais (Carregamento e Renderização) ---

/**
 * Carrega todos os módulos e o perfil do usuário na inicialização.
 */
async function loadMission() {
  if (!container) {
    console.error(`Container com id="${missionsContainerId}" não encontrado.`);
    return;
  }
  container.innerHTML = `<div class="text-center py-12 text-gray-500">Carregando módulos...</div>`;

  // 1. Pega o perfil do usuário
  const { profile } = await getCurrentUserProfile();
  currentUserNivel = profile?.nivel ?? 0;

  // 2. Busca todos os módulos
  const { data: modulos, error } = await supabase
    .from("modulos")
    .select("id, nome, level_require");

  if (error) {
    console.error("Erro ao carregar módulos:", error);
    container.innerHTML = `<div class="text-red-500 py-6 text-center">Erro ao carregar módulos.</div>`;
    return;
  }

  if (!modulos || modulos.length === 0) {
    container.innerHTML = `<div class="text-gray-600 py-6 text-center">Nenhum módulo disponível.</div>`;
    return;
  }

  // 3. Salva os módulos na variável global
  allModulos = modulos.map((m) => ({
    id: m.id,
    nome: m.nome ?? "Sem título",
    level_require: m.level_require ?? 0,
  }));

  // 4. Renderiza "Todas" por padrão
  renderMissions(allModulos);
}

/**
 * Renderiza uma lista de cards de módulo no container.
 * @param {Array} modulesToRender - A lista de módulos a ser exibida.
 */
function renderMissions(modulesToRender) {
  if (!container) return;
  container.innerHTML = ""; // Limpa o container

  if (modulesToRender.length === 0) {
    container.innerHTML = `<div class="text-gray-600 py-6 text-center">Nenhum módulo encontrado para este filtro.</div>`;
    return;
  }
  
  modulesToRender.forEach((modulo) => {
    const unlocked = currentUserNivel >= modulo.level_require;
    const card = createModuleCard(modulo, unlocked);

    // se bloqueado, evita ação de link e adiciona estilo
    if (!unlocked) {
      card.querySelector("div.bg-white").classList.add("opacity-60", "cursor-not-allowed");
      card.querySelector("div.bg-white").classList.remove("hover:shadow-lg");
      card.title = `Requer nível ${modulo.level_require}`;
    }

    container.appendChild(card);
  });
}

// --- Funções de Filtro ---

/**
 * Configura os event listeners para os botões de filtro.
 */
function setupFilters() {
  const filterTodas = document.getElementById('filter-todas');
  const filterAbertas = document.getElementById('filter-abertas');
  const filterBloqueadas = document.getElementById('filter-bloqueadas');

  if (filterTodas) {
    filterTodas.addEventListener('click', () => {
      renderMissions(allModulos);
      updateActiveButton(filterTodas);
    });
  }
  
  if (filterAbertas) {
    filterAbertas.addEventListener('click', () => {
      const abertas = allModulos.filter(m => currentUserNivel >= m.level_require);
      renderMissions(abertas);
      updateActiveButton(filterAbertas);
    });
  }

  if (filterBloqueadas) {
    filterBloqueadas.addEventListener('click', () => {
      const bloqueadas = allModulos.filter(m => currentUserNivel < m.level_require);
      renderMissions(bloqueadas);
      updateActiveButton(filterBloqueadas);
    });
  }
}

/**
 * Atualiza o estilo visual do botão de filtro ativo.
 * @param {HTMLElement} activeButton - O botão que foi clicado.
 */
function updateActiveButton(activeButton) {
    const filterButtons = document.querySelectorAll('#filter-buttons button');
    
    filterButtons.forEach(btn => {
        // Reseta todos os botões para o estilo inativo
        btn.classList.remove('bg-[#6A9850]', 'text-white');
        btn.classList.add('bg-white', 'text-[#6A9850]');
    });

    // Define o botão clicado como ativo
    activeButton.classList.remove('bg-white', 'text-[#6A9850]');
    activeButton.classList.add('bg-[#6A9850]', 'text-white');
}

// --- Funções Utilitárias (Seu código original) ---

async function getCurrentUserProfile() {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.warn("Erro ao obter user:", userErr);
      return { user: null, profile: null };
    }
    const user = userData?.user ?? null;
    if (!user) return { user: null, profile: null };

    const { data: profile, error: profileErr } = await supabase
      .from("user_profile")
      .select("nivel, pontos")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      console.warn("Erro ao carregar user_profile:", profileErr);
      return { user, profile: null, profileErr };
    }
    return { user, profile };
  } catch (err) {
    console.error("Erro inesperado ao buscar user/profile:", err);
    return { user: null, profile: null };
  }
}

function createModuleCard(modulo, unlocked) {
  const a = document.createElement("a");
  a.className = "p-3 block";
  a.href = unlocked
    ? `/src/mission-page/mission-content/index.html?modulo=${modulo.id}`
    : "#";

  // Pequena correção: Adicionado 'data-id' para debug e 'role'
  a.setAttribute('data-id', modulo.id);
  a.setAttribute('role', 'button');

a.innerHTML = `
    <div class="bg-white rounded-2xl p-4 md:p-6 flex items-center justify-between hover:shadow-lg transition max-w-4xl mx-auto">
      
      <div class="flex items-center gap-3 md:gap-3 flex-1">
        
        <div class="w-12 h-16 md:w-20 md:h-24 bg-[#9A5CAD] rounded-md flex-shrink-0"></div>
        
        <div class="flex-col">
          <h3 class="text-base md:text-xl font-bold text-gray-800 leading-tight">
            ${escapeHtml(modulo.nome)}
          </h3>
          <p class="text-xs text-gray-400 mt-1">
            Nível requerido: ${modulo.level_require ?? 0}
          </p>
        </div>
      </div>

      <div class="flex-shrink-0 ml-3">
        ${unlocked 
          ? '' 
          : '<img src="/public/icon/padlock1.png" alt="Locked" class="w-8 h-8 md:w-14 md:h-14 object-contain opacity-60">' 
        }
      </div>

    </div>
  `;
  return a;
}

function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// --- Inicialização ---
loadMission();
setupFilters();
// /public/js/functions/mission-content.js
import { supabase } from "/public/js/configs/config.js";
import { loadSidebar, loadMissionCard } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar();
loadMissionCard();
window.toggleSidebar = toggleSidebar;


const missionsContainerId = "missionsList";

async function getCurrentUserProfile() {
  try {
    // supabase-js v2: getUser() returns { data: { user }, error }
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      console.warn("Erro ao obter user:", userErr);
      return { user: null, profile: null };
    }
    const user = userData?.user ?? null;
    if (!user) return { user: null, profile: null };

    // Pega o profile do usuário (assume user_profile.id = auth.users.id)
    const { data: profile, error: profileErr } = await supabase
      .from("user_profile")
      .select("nivel, pontos")
      .eq("id", user.id)
      .single();

    if (profileErr) {
      // pode ser RLS; log para diagnóstico
      console.warn("Erro ao carregar user_profile (RLS ou não encontrado):", profileErr);
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
  a.className = "p-6 block";
  a.href = unlocked
    ? `/src/mission-page/mission-content/index.html?modulo=${modulo.id}`
    : "#";

  a.innerHTML = `
    <div class="bg-white rounded-2xl p-6 flex items-center gap-6 hover:shadow-lg transition max-w-4xl mx-auto">
      <div class="w-[20%] h-24 bg-[#9A5CAD] rounded-md flex-shrink-0"></div>
      <div class="flex-1">
        <h3 class="text-xl font-bold text-gray-800">${escapeHtml(modulo.nome)}</h3>
        ${modulo.description ? `<p class="text-gray-500 text-sm mt-1">${escapeHtml(modulo.description)}</p>` : ""}
        <p class="text-xs text-gray-400 mt-1">Nível requerido: ${modulo.level_require ?? 0}</p>
      </div>
      <div class="rounded-lg flex items-center justify-center flex-shrink-0">
        ${unlocked ? '' : '<img src="/public/icon/padlock1.png" alt="Locked" class="w-16 h-16">'}
      </div>
    </div>
  `;
  return a;
}

// proteção simples contra XSS se algum campo vier com HTML
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadMission() {
  const container = document.getElementById(missionsContainerId);
  if (!container) {
    console.error(`Container com id="${missionsContainerId}" não encontrado no DOM.`);
    return;
  }

  container.innerHTML = `<div class="text-center py-12 text-gray-500">Carregando módulos...</div>`;

  // pega user/profile (pode retornar profile=null se anon)
  const { user, profile, profileErr } = await getCurrentUserProfile();
  const userNivel = profile?.nivel ?? 0;

  // Fetch módulos — selecione colunas corretas (nome + level_require)
  const { data: modulos, error } = await supabase
    .from("modulos")
    .select("id, nome, level_require");

  if (error) {
    console.error("Erro ao carregar módulos:", error);
    // diagnóstico comum: RLS bloqueando SELECT; se so aparecer erro de permissao, verifique policies
    container.innerHTML = `<div class="text-red-500 py-6 text-center">Erro ao carregar módulos. Verifique RLS/policies e chave do cliente.</div>`;
    return;
  }

  if (!modulos || modulos.length === 0) {
    container.innerHTML = `<div class="text-gray-600 py-6 text-center">Nenhum módulo disponível.</div>`;
    return;
  }

  container.innerHTML = ""; // limpa

  // Normaliza nomes dos campos (por segurança): seu campo se chama level_require
  modulos.forEach((m) => {
    const modulo = {
      id: m.id,
      nome: m.nome ?? "Sem título",
      level_require: m.level_require ?? 0,
      // se quiser usar descrição mas tabela nao tem, mantemos vazio
      description: m.description ?? ""
    };

    const unlocked = user ? (userNivel >= modulo.level_require) : (modulo.level_require <= 0);
    const card = createModuleCard({ id: modulo.id, nome: modulo.nome, description: modulo.description, level_require: modulo.level_require }, unlocked);

    // se bloqueado, evita ação de link e adiciona estilo
    if (!unlocked) {
      card.querySelector("div.bg-white").classList.add("opacity-80");
      // opcional: tooltip
      card.title = `Requer nível ${modulo.level_require}`;
    }

    container.appendChild(card);
  });
}

loadMission();

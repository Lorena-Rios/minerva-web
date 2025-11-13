// Função para carregar o conteúdo parcial do sidebar


export async function loadSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  try {
    const response = await fetch("/src/partials/sidebar.html");
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar sidebar:", err);
  }
}


// Função para carregar o conteúdo parcial do modal tema
export async function loadModalTema() {
  const container = document.getElementById("modal-tema");
  if (!container) return;

  try {
    const response = await fetch("/src/partials/modalTema.html");
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error("Erro ao carregar modal tema:", err);
  }
}
function openLogin() {
    window.location.href = "./login/index.html"; 
}


// Garante que a função esteja disponível globalmente para o 'onclick'
window.toggleSidebar = function() {
    console.log("toggleSidebar foi chamada!"); // Teste para ver se a função roda

    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const toggleIcon = document.getElementById('toggle-icon');

    if (sidebar && toggleBtn && toggleIcon) {
        // Oculta/Exibe a sidebar
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-0');
        sidebar.classList.toggle('p-6');
        sidebar.classList.toggle('p-0');

        // Verifica o estado ATUAL (após o toggle)
        // Se a sidebar AGORA TEM w-0, ela está oculta.
        if (sidebar.classList.contains('w-0')) {
            // Mover o botão para a borda da tela
            toggleBtn.classList.remove('-left-4');
            toggleBtn.classList.add('left-4');
            // Mudar o ícone para "abrir" (seta para a direita)
            toggleIcon.classList.remove('ph-caret-left');
            toggleIcon.classList.add('ph-caret-right');
        } else {
            // Mover o botão de volta para a posição original
            toggleBtn.classList.remove('left-4');
            toggleBtn.classList.add('-left-4');
            // Mudar o ícone para "fechar" (seta para a esquerda)
            toggleIcon.classList.remove('ph-caret-right');
            toggleIcon.classList.add('ph-caret-left');
        }
    } else {
        console.error("Erro: Um dos elementos (sidebar, toggleBtn, toggleIcon) não foi encontrado.");
    }
}


// =======================================================
// ================ FUNÇÕES DO MODAL ===================
// =======================================================

// Função para ABRIR o modal de missão (CONTEÚDO FIXO)
window.openModal = function() {
    const modal = document.getElementById('modal');

    if (modal) {
        // Apenas exibe o modal, o conteúdo já está no HTML
        modal.classList.remove('hidden');
    } else {
        console.error("Elemento do modal #modal não encontrado.");
    }
}

// Função para FECHAR o modal (permanece igual)
window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}
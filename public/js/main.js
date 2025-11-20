import { supabase } from "/public/js/configs/config.js";

// Garante que a função esteja disponível globalmente para o 'onclick'
export function toggleSidebar() {
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



document.addEventListener('DOMContentLoaded', () => {
    // 1. Procura TODOS os botões que tenham a classe 'toggle-pass-btn'
    const toggleButtons = document.querySelectorAll('.toggle-pass-btn');

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 2. Descobre qual input esse botão controla (pelo atributo data-target)
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);

            // 3. Encontra os ícones DENTRO deste botão específico
            const eyeOpen = button.querySelector('.eye-open');
            const eyeClosed = button.querySelector('.eye-closed');

            if (input && eyeOpen && eyeClosed) {
                // 4. Alterna o tipo do input
                const isPassword = input.type === 'password';
                input.type = isPassword ? 'text' : 'password';

                // 5. Alterna a visibilidade dos ícones
                if (isPassword) {
                    eyeOpen.classList.add('hidden');
                    eyeClosed.classList.remove('hidden');
                } else {
                    eyeOpen.classList.remove('hidden');
                    eyeClosed.classList.add('hidden');
                }
            }
        });
    });
});



// Função de Logout
async function handleLogout(event) {
    // PULO DO GATO 1: Impede que o link recarregue a página na hora
    if (event) event.preventDefault(); 

    const { error } = await supabase.auth.signOut();
    
    if (error) {
        console.error("Erro ao fazer logout:", error);
        Toastify({
            text: "Erro ao sair: " + error.message,
            duration: 3000,
            style: { background: "#C84A5B", borderRadius: "8px" }
        }).showToast();
    } else {
        // Mostra o Toast
        Toastify({
            text: "Saindo do sistema... Até logo! 👋",
            duration: 2000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: "#9A5CAD", // Verde Suave
                borderRadius: "8px",
                fontWeight: "bold",
                color: "white"
            }
        }).showToast();

        // PULO DO GATO 2: O redirecionamento FICA AQUI DENTRO
        // Só muda de página depois de 2 segundos (2000ms)
        setTimeout(() => {
            window.location.href = "/index.html";
        }, 2000);
    }
}

window.handleLogout = handleLogout;
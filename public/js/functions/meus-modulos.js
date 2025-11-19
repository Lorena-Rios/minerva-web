import { supabase } from "/public/js/configs/config.js";
import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

// Carrega a sidebar e torna a função de toggle global
loadSidebar();
window.toggleSidebar = toggleSidebar;

// Seletores do DOM
const modulosContainer = document.getElementById('modulos-container');
const loadingIndicator = document.getElementById('loading-modulos');

// Função principal para buscar e renderizar os módulos
async function carregarMeusModulos() {
    try {
        // 1. Pega o usuário logado
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Erro ao buscar usuário:', authError);
            Toastify({
                text: "Você precisa estar logado para ver seus módulos.",
                duration: 3000,
                close: true,
                gravity: "top", 
                position: "right", // Centralizado chama mais atenção neste caso
                style: {
                    background: "#C84A5B", // Vermelho Erro (Sua paleta)
                    borderRadius: "8px",
                    fontWeight: "bold"
                }
            }).showToast();

            // Aguarda 2 segundos para o usuário ler antes de redirecionar
            setTimeout(() => {
                window.location.href = '/src/login/index.html'; 
            }, 2000);
            
            return;
        }


        // 2. Busca os módulos criados por este usuário
        // Usamos .select() para pegar as colunas que queremos
        const { data: modulos, error: fetchError } = await supabase
            .from('modulos')
            .select('id, nome, level_require') // Pede ID, nome e nível
            .eq('criado_por', user.id) // A CONDIÇÃO: onde 'criado_por' é o ID do usuário

        if (fetchError) {
            throw fetchError; // Joga o erro para o catch
        }

        // 3. Renderiza os módulos na tela
        renderizarModulos(modulos);

    } catch (error) {
        console.error('Erro ao carregar módulos:', error.message);
        loadingIndicator.textContent = `Erro ao carregar módulos: ${error.message}`;
        loadingIndicator.classList.add('text-red-500');
    }
}

// Função para colocar os módulos no HTML
function renderizarModulos(modulos) {
    // Limpa o indicador de "Carregando..."
    loadingIndicator.remove();

    // 4. Verifica se não há módulos
    if (modulos.length === 0) {
        modulosContainer.innerHTML = `
            <div class="col-span-full text-center p-8 bg-white rounded-lg shadow">
                <h3 class="font-semibold text-lg text-gray-700">Nenhum módulo encontrado</h3>
                <p class="text-gray-500">Você ainda não criou nenhum módulo.</p>
                <a href="/src/profile/criar-modulo/index.html" class="mt-4 inline-block bg-[#9A5CAD] text-white font-semibold py-2 px-4 rounded-xl hover:bg-opacity-80 transition">
                    Criar meu primeiro módulo
                </a>
            </div>
        `;
        return;
    }

    // 5. Cria um card para cada módulo
    modulos.forEach(modulo => {
        const moduloCard = document.createElement('div');
        moduloCard.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col justify-between';
        
        moduloCard.innerHTML = `
            <div>
                <h3 class="text-xl font-bold text-[#9A5CAD]">${modulo.nome}</h3>
                <span class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    Nível Req.: ${modulo.level_require}
                </span>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-100">
                <a href="/src/profile/editar-modulo/index.html?id=${modulo.id}" 
                   class="text-sm font-medium text-[#81A86B] hover:underline">
                    Editar
                </a>
                </div>
        `;
        
        modulosContainer.appendChild(moduloCard);
    });
}

// Roda a função principal quando a página carrega
document.addEventListener('DOMContentLoaded', carregarMeusModulos);

import { loadSidebar } from "/public/js/utils/loadPartial.js";
import { toggleSidebar } from "/public/js/main.js";

loadSidebar(); // Carrega o partial
window.toggleSidebar = toggleSidebar; // Garante acesso global

async function fetchQuizByTema(temaId) {
  // busca quiz que pertence ao tema e suas perguntas em ordem
  const { data, error } = await supabase
    .from('quizzes')
    .select(`
      id,
      nome,
      quiz_perguntas (
        ordem,
        pergunta:pergunta_id (
          id,
          descricao,
          alternativas ( id, descricao ) 
        )
      )
    `)
    .eq('tema_id', temaId)
    .limit(1);

  if (error) { console.error(error); return null; }
  return data?.[0] || null;
}

async function answerQuestion(quizId, perguntaId, alternativaId) {
  // supabase.rpc invoca a função grade_answer
  const { data, error } = await supabase
    .rpc('grade_answer', {
      p_quiz: quizId,
      p_pergunta: perguntaId,
      p_alternativa: alternativaId
    });

  if (error) {
    console.error('grade rpc error', error);
    throw error;
  }
  // data: jsonb retornado pela função
  return data;
}

async function getUserProfile() {
  const user = supabase.auth.getUser(); // supabase-js v2: use getUser() or onAuthStateChange
  const userId = (await user).data?.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from('user_profile')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

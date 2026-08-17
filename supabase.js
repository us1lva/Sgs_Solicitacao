// ============================================================================
// Camada de acesso ao Supabase.
// Requer que a biblioteca oficial do Supabase (window.supabase) já esteja
// carregada via <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// ANTES deste arquivo, e que este arquivo seja carregado ANTES do script.js.
// ============================================================================

const SUPABASE_URL = 'https://nstyvsaolpwpqpigqsou.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZOU6Hpt3lUmQVBcPKL7Wyg_mxaLxEjx';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Objeto único com todas as operações de dados usadas pela aplicação.
// Mantém o script.js livre de detalhes de tabelas/RLS/RPC.
const db = {

  // ---- Autenticação -------------------------------------------------------

  async getSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  },

  onAuthStateChange(callback) {
    // Repassa também o "event" (ex: 'PASSWORD_RECOVERY', 'SIGNED_IN') — o app
    // precisa saber quando o motivo da mudança de sessão foi um clique no
    // link de recuperação de senha, para mostrar a tela certa.
    return supabaseClient.auth.onAuthStateChange((event, session) => callback(session, event));
  },

  async signUp(email, senha) {
    // emailRedirectTo garante que, ao confirmar o e-mail, a pessoa volte para
    // ESTE app (e não para o "Site URL" padrão configurado no Supabase, que
    // pode ser o domínio de outro sistema, como o backoffice).
    return await supabaseClient.auth.signUp({
      email,
      password: senha,
      options: { emailRedirectTo: window.location.origin + window.location.pathname }
    });
  },

  async signIn(email, senha) {
    return await supabaseClient.auth.signInWithPassword({ email, password: senha });
  },

  // Envia o e-mail de "esqueci minha senha". O link dentro do e-mail traz um
  // token que, ao ser aberto, dispara o evento PASSWORD_RECOVERY no app.
  async resetPasswordForEmail(email) {
    return await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });
  },

  // Define a nova senha. Só funciona dentro da sessão temporária criada pelo
  // link de recuperação (ou por um usuário já logado trocando a própria senha).
  async updatePassword(novaSenha) {
    return await supabaseClient.auth.updateUser({ password: novaSenha });
  },

  async signOut() {
    return await supabaseClient.auth.signOut();
  },

  // ---- Perfil (tabela "usuarios") -----------------------------------------

  // Busca o registro de perfil ligado ao usuário autenticado no momento.
  async getUsuarioAtual(authUserId) {
    const { data, error } = await supabaseClient
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
    return data;
  },

  // Atualiza os dados de perfil do próprio usuário (RLS garante que só o dono edita).
  async atualizarUsuario(authUserId, dados) {
    const { error } = await supabaseClient
      .from('usuarios')
      .update({
        nome: dados.nome,
        matricula: dados.matricula,
        setor: dados.setor,
        centro_custo: dados.centroCusto,
        atualizado_em: new Date().toISOString()
      })
      .eq('auth_user_id', authUserId);

    if (error) {
      console.error('Erro ao salvar perfil:', error);
    }
    return !error;
  },

  // ---- Catálogo (tabela "produtos") ---------------------------------------

  async listarProdutos() {
    const { data, error } = await supabaseClient
      .from('produtos')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
    return data || [];
  },

  // ---- Solicitações ---------------------------------------------------------

  // Carrega as solicitações do usuário e já anexa os itens de catálogo de cada uma.
  async listarSolicitacoes(usuarioId) {
    const { data: solicitacoes, error } = await supabaseClient
      .from('solicitacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao carregar solicitações:', error);
      return [];
    }

    const ids = (solicitacoes || []).map(s => s.id);
    let itens = [];
    if (ids.length > 0) {
      const { data: itensData, error: itensError } = await supabaseClient
        .from('solicitacao_itens')
        .select('*')
        .in('solicitacao_id', ids);
      if (itensError) {
        console.error('Erro ao carregar itens das solicitações:', itensError);
      } else {
        itens = itensData || [];
      }
    }

    return (solicitacoes || []).map(row => ({
      id: row.id,
      nome: row.nome,
      email: row.email,
      matricula: row.matricula,
      setor: row.setor,
      centroCusto: row.centro_custo,
      item: row.item,
      quantidade: row.quantidade,
      urgencia: row.urgencia,
      motivo: row.motivo,
      endereco: row.endereco,
      status: row.status,
      dataCriacao: row.data_criacao,
      // Itens do catálogo com a quantidade individual de cada um (não mais um valor único).
      itens: itens.filter(i => i.solicitacao_id === row.id).map(i => ({ produtoId: i.produto_id, quantidade: i.quantidade }))
    }));
  },

  // Cria a solicitação inteira (registro + itens + baixa de estoque) numa única
  // transação no banco, via função RPC "criar_solicitacao". Evita condição de
  // corrida e impede que o cliente manipule estoque diretamente.
  //
  // itens: [{ produtoId, quantidade }, ...] — cada item do catálogo com sua própria quantidade.
  // Para item fora do catálogo, deixe itens=[] e preencha itemCustomizado + quantidadeCustomizada.
  async criarSolicitacao({ itens, itemCustomizado, quantidadeCustomizada, urgencia, motivo, endereco }) {
    const itensPayload = (itens || []).map(i => ({ produto_id: i.produtoId, quantidade: i.quantidade }));
    return await supabaseClient.rpc('criar_solicitacao', {
      p_itens: itensPayload,
      p_item_customizado: itemCustomizado || null,
      p_quantidade_customizado: quantidadeCustomizada || null,
      p_urgencia: urgencia,
      p_motivo: motivo,
      p_endereco: endereco
    });
  },

  // Cancela e estorna estoque, também via função RPC segura.
  async cancelarSolicitacao(solicitacaoId) {
    return await supabaseClient.rpc('cancelar_solicitacao', {
      p_solicitacao_id: solicitacaoId
    });
  },

  // ---- Tempo real -----------------------------------------------------------

  // Reage a qualquer mudança de estoque (feita por qualquer usuário) em tempo real.
  subscribeProdutos(onChange) {
    return supabaseClient
      .channel('produtos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, onChange)
      .subscribe();
  },

  // Reage a mudanças nas solicitações (ex: status alterado por um administrador).
  subscribeSolicitacoes(onChange) {
    return supabaseClient
      .channel('solicitacoes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitacoes' }, onChange)
      .subscribe();
  }
};

window.db = db;
window.supabaseClient = supabaseClient;
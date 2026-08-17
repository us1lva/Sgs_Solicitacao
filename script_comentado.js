// IIFE: encapsula todo o código da aplicação para evitar poluir o escopo global.
(function(){
  const app = document.getElementById('app');
  const EMAIL_RESPONSAVEL = 'yuri.silva1@sgs.com';
  const WEBHOOK_EMAIL_ENDPOINT = 'https://httpbin.org/post';
  const API_SALVAR_EMAIL_DADOS = 'https://httpbin.org/post';

  let state = {
    loaded: false,
    authMode: 'login', // 'login', 'signup' ou 'recuperar'
    authError: '',
    authConfirmMsg: '',
    authSending: false,
    recuperandoSenha: false, // true quando o usuário chegou aqui via link de recuperação de senha
    novaSenhaError: '',
    session: null,
    currentUserEmail: '',
    theme: localStorage.getItem('app_theme') || 'dark',
    userProfile: { nome: '', matricula: '', setor: '', centroCusto: '' },
    solicitacoes: [],
    produtos: [],
    form: {
      itens: {},          // { produtoId: quantidade } — quantidade individual por item selecionado
      itemLivre: '', usarLivre: false, quantidadeLivre: 1,
      urgencia: 'normal', motivo: '',
      endereco: { cep: '', logradouro: '', bairro: '', cidade: '', uf: '', numero: '', complemento: '' },
      buscandoCep: false, erroCep: ''
    },
    busca: '',
    error: '',
    sending: false,
    lastStatus: null,
    toast: null,
    showInfoModal: false,
    activeTab: 'epis'
  };

  document.documentElement.setAttribute('data-theme', state.theme);

  const PLANILHA_ABAS_DADOS = {
    epis: {
      headers: ["Codigo Boss", "descrição", "Tamanho", "CA"],
      rows: [
        ["P21316", "Bota segurança PVC preta cano médio biqueira composite", 38, '30536'],
        ["P21317", "Bota segurança PVC preta cano médio biqueira composite", 39, '30536'],
        ["P21318", "Bota segurança PVC preta cano médio biqueira composite", 40, '30536'],
        ["P21319", "Bota segurança PVC preta cano médio biqueira composite", 41, '30536'],
        ["P21320", "Bota segurança PVC preta cano médio biqueira composite", 42, '30536'],
        ["P21321", "Bota segurança PVC preta cano médio biqueira composite", 43, '30536'],
        ["P20592", "Bota segurança PVC preta cano médio biqueira composite", "44/45", '30536'],
        ["P21054", "Botina segurança borracha preta solado PU biqueira composite", 34, '47459'],
        ["P21027", "Botina segurança borracha preta solado PU biqueira composite", 35, '47459'],
        ["P21028", "Botina segurança borracha preta solado PU biqueira composite", 36, '47459'],
        ["P21029", "Botina segurança borracha preta solado PU biqueira composite", 37, '47459'],
        ["P21030", "Botina segurança borracha preta solado PU biqueira composite", 38, '47459'],
        ["P21031", "Botina segurança borracha preta solado PU biqueira composite", 39, '47459'],
        ["P21032", "Botina segurança borracha preta solado PU biqueira composite", 40, '47459'],
        ["P21033", "Botina segurança borracha preta solado PU biqueira composite", 41, '47459'],
        ["P21034", "Botina segurança borracha preta solado PU biqueira composite", 42, '47459'],
        ["P21035", "Botina segurança borracha preta solado PU biqueira composite", 43, '47459'],
        ["P21036", "Botina segurança borracha preta solado PU biqueira composite", 44, '47459'],
        ["P21037", "Botina segurança borracha preta solado PU biqueira composite", 45, '47459'],
        ["P21038", "Botina segurança borracha preta solado PU biqueira composite", 46, '47459'],
        ["P20127", "Capa de chuva PVC amarela com capuz", "M", "-"],
        ["P20140", "Capa de chuva PVC amarela com capuz", "G", "-"],
        ["P20126", "Capa de chuva PVC amarela com capuz", "GG", "-"],
        ["P21100", "Capacete segurança branco com carneira e jugular", "Único", "8304"],
        ["P21502", "Carneira com jugular (somente carneira)", "Único", "-"],
        ["P21310", "Luva nitrílica descartável azul", "P", "42711"],
        ["P21311", "Luva nitrílica descartável azul", "M", "42711"],
        ["P21312", "Luva nitrílica descartável azul", "G", "42711"],
        ["P21313", "Luva nitrílica descartável azul", "GG", "42711"],
        ["P21084", "Luva vaqueta branca palma áspera", "G", "18886"],
        ["P21282", "Luva multitato PU preta", "Tam. 10", "37168"],
        ["P20666", "Luva nitrílica verde punho longo", "G", "31369"],
        ["P20135", "Luva PVC verde punho 36 cm", "G", "40304"],
        ["P21285", "Luva serviço leve malha tricotada", "G", "19435"],
        ["P20643", "Colete tipo jaleco laranja refletivo", "Único", "-"],
        ["P21360", "Macacão Tychem SL127T amarelo", "M", "38647"],
        ["P20613", "Macacão Tychem SL127T amarelo", "G", "38647"],
        ["P20614", "Macacão Tychem SL127T amarelo", "GG", "38647"],
        ["P20273", "Máscara PFF2 descartável", "Único", "41514"],
        ["P21257", "Máscara respiradora semi-facial", "P", "4115"],
        ["P21258", "Máscara respiradora semi-facial", "M", "4115"],
        ["P20598", "Máscara respiradora semi-facial", "G", "4115"],
        ["P20131", "Máscara respiradora facial total", "G", "7298"],
        ["P20134", "Filtro químico 3M 6003", "Par", "Solicitar em par"],
        ["P20163", "Óculos ampla visão antiembaçante", "Único", "19072"],
        ["P20506", "Óculos lente fumê", "Único", "20710"],
        ["P20130", "Óculos lente incolor", "Único", "11268"],
        ["P21357", "Óculos sobrepor incolor", "Único", "16113"],
        ["P20110", "Perneira couro sintético preta", "Único", "35222"],
        ["P20668", "Protetor solar FPS 30", "Frasco 120 ml", "-"],
        ["P20001", "Protetor auditivo plug silicone", "Único / 18 dB", "5745"],
        ["P20002", "Protetor auditivo arco concha", "Único / 20 dB", "15624 / 27971"],
        ["P19816", "Kit abafador p/ capacete MSA XLS", "20 dB", "15624 / 27971"],
        ["P21322", "Sapato de couro preto biqueira composite", 34, "45803"],
        ["P21323", "Sapato de couro preto biqueira composite", 35, "45803"],
        ["P21324", "Sapato de couro preto biqueira composite", 36, "45803"],
        ["P21325", "Sapato de couro preto biqueira composite", 37, "45803"],
        ["P21326", "Sapato de couro preto biqueira composite", 38, "45803"],
        ["P21327", "Sapato de couro preto biqueira composite", 39, "45803"],
        ["P21328", "Sapato de couro preto biqueira composite", 40, "45803"],
        ["P21329", "Sapato de couro preto biqueira composite", 41, "45803"],
        ["P21330", "Sapato de couro preto biqueira composite", 42, "45803"],
        ["P21331", "Sapato de couro preto biqueira composite", 43, "45803"],
        ["P21332", "Sapato de couro preto biqueira composite", 44, "45803"],
        ["P21333", "Sapato de couro preto biqueira composite", 45, "45803"],
        ["P21334", "Sapato de couro preto biqueira composite", 46, "45803"]
      ]
    },
    adm: {
      headers: ["Código", "Descrição", "Tamanho"],
      rows: [
        ["P30479", "Camisa Polo Feminina Algodão Azul Marinho com Laranja Manga Curta", "P"],
        ["P30480", "Camisa Polo Feminina Algodão Azul Marinho com Laranja Manga Curta", "M"],
        ["P30481", "Camisa Polo Feminina Algodão Azul Marinho com Laranja Manga Curta", "G"],
        ["P30482", "Camisa Polo Feminina Algodão Azul Marinho com Laranja Manga Curta", "GG"],
        ["P20101", "Camisa Polo Feminina Algodão/Poliéster Preta Manga Curta", "XG"],
        ["P20046", "Camisa Social Feminina Branca Manga Longa Logo SGS", "P"],
        ["P20050", "Camisa Social Feminina Branca Manga Longa Logo SGS", "M"],
        ["P20052", "Camisa Social Feminina Branca Manga Longa Logo SGS", "G"],
        ["P20054", "Camisa Social Feminina Branca Manga Longa Logo SGS", "GG"],
        ["P20211", "Camisa Social Feminina Branca Manga Longa Logo SGS", "XG"],
        ["P20446", "Camisa Social Feminina Semprigual Cinza Manga Curta Botão", "P"],
        ["P20447", "Camisa Social Feminina Semprigual Cinza Manga Curta Botão", "M"],
        ["P20448", "Camisa Social Feminina Semprigual Cinza Manga Curta Botão", "G"],
        ["P20449", "Camisa Social Feminina Semprigual Cinza Manga Curta Botão", "GG"],
        ["P21343", "Camisa Social Feminina Semprigual Cinza Manga Curta Botão", "XG"],
        ["P30490", "Camisa Social Jeans Azul Feminina Manga Longa", "P"],
        ["P30491", "Camisa Social Jeans Azul Feminina Manga Longa", "M"],
        ["P30492", "Camisa Social Jeans Azul Feminina Manga Longa", "G"],
        ["P30493", "Camisa Social Jeans Azul Feminina Manga Longa", "GG"],
        ["P30484", "Camisa Polo Masculina Algodão Azul Marinho com Laranja", "P"],
        ["P30485", "Camisa Polo Masculina Algodão Azul Marinho com Laranja", "M"],
        ["P30486", "Camisa Polo Masculina Algodão Azul Marinho com Laranja", "G"],
        ["P30487", "Camisa Polo Masculina Algodão Azul Marinho com Laranja", "GG"],
        ["P20841", "Camisa Polo Masculina Algodão Cinza Manga Curta", "XG"],
        ["P30489", "Camisa Polo Masculina Algodão Azul Marinho com Laranja", "XXG"],
        ["P20875", "Camisa Social Masculina Natural Blend Branca Manga Longa Botão", "P"],
        ["P20888", "Camisa Social Masculina Semprigual Cinza Manga Curta Botão", "P"],
        ["P20889", "Camisa Social Masculina Semprigual Cinza Manga Curta Botão", "M"],
        ["P20890", "Camisa Social Masculina Semprigual Cinza Manga Curta Botão", "G"],
        ["P20891", "Camisa Social Masculina Semprigual Cinza Manga Curta Botão", "GG"],
        ["P20028", "Camisa Social Masculina Semprigual Cinza Manga Longa Botão", "P"],
        ["P20886", "Camisa Social Masculina Semprigual Cinza Manga Longa Botão", "XG"],
        ["P30496", "Camisa Social Jeans Azul Masculina Manga Longa", "M"],
        ["P30497", "Camisa Social Jeans Azul Masculina Manga Longa", "G"],
        ["P30498", "Camisa Social Jeans Azul Masculina Manga Longa", "GG"],
        ["P30500", "Camisa Social Jeans Azul Masculina Manga Longa", "XXG"]
      ]
    },
    operacao: {
      headers: ["Código", "Descrição", "Tamanho"],
      rows: [
        ["P21371", "Calça Proteção Feminina Cinza Antiácido com Faixa Refletiva", "P"],
        ["P21372", "Calça Proteção Feminina Cinza Antiácido com Faixa Refletiva", "M"],
        ["P21373", "Calça Proteção Feminina Cinza Antiácido com Faixa Refletiva", "G"],
        ["P21374", "Calça Proteção Feminina Cinza Antiácido com Faixa Refletiva", "GG"],
        ["P21375", "Calça Proteção Feminina Cinza Antiácido com Faixa Refletiva", "XG"],
        ["P21366", "Camisa Proteção Masculina Cinza Antiácido com Faixa Refletiva", "P"],
        ["P21367", "Camisa Proteção Masculina Cinza Antiácido com Faixa Refletiva", "M"],
        ["P21368", "Camisa Proteção Masculina Cinza Antiácido com Faixa Refletiva", "G"],
        ["P21369", "Camisa Proteção Masculina Cinza Antiácido com Faixa Refletiva", "GG"],
        ["P21370", "Camisa Proteção Masculina Cinza Antiácido com Faixa Refletiva", "XG"],
        ["P21361", "Calça Proteção Masculina Cinza Antiácido com Faixa Refletiva", "P"],
        ["P21362", "Calça Proteção Masculina Cinza Antiácido com Faixa Refletiva", "M"],
        ["P21363", "Calça Proteção Masculina Cinza Antiácido com Faixa Refletiva", "G"],
        ["P21364", "Calça Proteção Masculina Cinza Antiácido com Faixa Refletiva", "GG"],
        ["P21365", "Calça Proteção Masculina Cinza Antiácido com Faixa Refletiva", "XG"],
        ["P21261", "Jaleco Branco Antiácido com Velcro", "PP"],
        ["P21254", "Jaleco Branco Antiácido com Velcro", "P"],
        ["P21344", "Jaleco Branco Antiácido com Velcro", "M"],
        ["P21345", "Jaleco Branco Antiácido com Velcro", "G"],
        ["P21346", "Jaleco Branco Antiácido com Velcro", "GG"],
        ["P30838", "Jaleco Branco Antiácido com Velcro", "XG"],
        ["P20396", "Camisa Operacional Masculina Cinza Manga Longa Botão com Faixa Refletiva", "GG"],
        ["P21170", "Camisa Operacional Masculina Cinza Manga Longa Botão com Faixa Refletiva", "XG"],
        ["P20398", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "P"],
        ["P20399", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "M"],
        ["P20400", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "G"],
        ["P20401", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "GG"],
        ["P21224", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "XG"],
        ["P20520", "Camisa Operacional Masculina Cinza Manga Longa Velcro com Faixa Refletiva", "XXG"],
        ["P20382", "Calça Operacional Masculina Cinza com Faixa Refletiva", "P"],
        ["P20383", "Calça Operacional Masculina Cinza com Faixa Refletiva", "M"],
        ["P20384", "Calça Operacional Masculina Cinza com Faixa Refletiva", "G"],
        ["P20385", "Calça Operacional Masculina Cinza com Faixa Refletiva", "GG"],
        ["P20386", "Calça Operacional Masculina Cinza com Faixa Refletiva", "XG"],
        ["P20521", "Calça Operacional Masculina Cinza com Faixa Refletiva", "XXG"],
        ["P30448", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "P"],
        ["P30449", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "M"],
        ["P30450", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "G"],
        ["P30451", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "GG"],
        ["P30452", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "XG"],
        ["P30453", "Camiseta Operacional Algodão Cinza Manga Curta com Faixa Refletiva", "XXG"],
        ["P20404", "Jaqueta Poliamida Cinza Gola Normal Zíper com Faixa Refletiva", "P"],
        ["P20405", "Jaqueta Poliamida Cinza Gola Normal Zíper com Faixa Refletiva", "M"],
        ["P20554", "Jaqueta Poliamida Cinza Gola Normal Zíper com Faixa Refletiva", "G"],
        ["P20406", "Jaqueta Poliamida Cinza Gola Normal Zíper com Faixa Refletiva", "GG"],
        ["P20403", "Jaqueta Poliamida Cinza Gola Normal Zíper com Faixa Refletiva", "XG"]
      ]
    }
  };

  // Formata uma data ISO para o padrão brasileiro com data e hora.
  function fmtDate(iso){ const d=new Date(iso); return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
  // Valida se um texto possui o formato básico de um endereço de e-mail.
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  // Exibe uma mensagem temporária de aviso na interface.
  function showToast(msg){ state.toast=msg; render(); setTimeout(()=>{state.toast=null; render();}, 4000); }

  // Junta os campos do endereço num único texto legível para salvar no pedido.
  function montarEnderecoTexto(e){
    const partes = [];
    let linha1 = e.logradouro || '';
    if(e.numero) linha1 += (linha1 ? ', ' : '') + e.numero;
    if(linha1) partes.push(linha1);
    if(e.complemento) partes.push(e.complemento);
    if(e.bairro) partes.push(e.bairro);
    const cidadeUf = [e.cidade, e.uf].filter(Boolean).join('/');
    if(cidadeUf) partes.push(cidadeUf);
    if(e.cep) partes.push('CEP ' + e.cep);
    return partes.join(' - ');
  }

  // Verifica se há o mínimo de informação para considerar o endereço preenchido.
  function enderecoValido(e){
    return !!(e.cep && e.logradouro && e.numero && e.cidade && e.uf);
  }

  // Consulta o ViaCEP e preenche automaticamente logradouro/bairro/cidade/UF.
  async function buscarCep(cepDigitado){
    const cep = (cepDigitado || '').replace(/\D/g, '');
    state.form.endereco.cep = cep;
    state.erroCep = '';

    if(cep.length !== 8){
      state.erroCep = cep.length > 0 ? 'CEP deve ter 8 dígitos.' : '';
      render();
      return;
    }

    state.buscandoCep = true;
    render();

    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if(data.erro){
        state.erroCep = 'CEP não encontrado.';
      } else {
        state.form.endereco.logradouro = data.logradouro || '';
        state.form.endereco.bairro = data.bairro || '';
        state.form.endereco.cidade = data.localidade || '';
        state.form.endereco.uf = data.uf || '';
        state.form.endereco.cep = (data.cep || cep).replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2');
      }
    } catch (err) {
      state.erroCep = 'Não foi possível consultar o CEP agora. Preencha manualmente.';
    } finally {
      state.buscandoCep = false;
      render();
    }
  }

  // ==========================================================================
  // Sessão / dados: tudo o que antes vinha do localStorage agora vem do Supabase.
  // ==========================================================================

  let debounceSalvarPerfil = null;
  let realtimeSubscribed = false;

  // Carrega perfil, catálogo e histórico do usuário autenticado no Supabase.
  async function bootstrapSessao(){
    state.currentUserEmail = state.session.user.email;

    const usuario = await window.db.getUsuarioAtual(state.session.user.id);
    state.userProfile = usuario ? {
      nome: usuario.nome || '',
      matricula: usuario.matricula || '',
      setor: usuario.setor || '',
      centroCusto: usuario.centro_custo || ''
    } : { nome: '', matricula: '', setor: '', centroCusto: '' };
    state.usuarioId = usuario ? usuario.id : null;

    const [produtos, solicitacoes] = await Promise.all([
      window.db.listarProdutos(),
      state.usuarioId ? window.db.listarSolicitacoes(state.usuarioId) : Promise.resolve([])
    ]);
    state.produtos = produtos;
    state.solicitacoes = solicitacoes;
  }

  function limparSessao(){
    state.currentUserEmail = '';
    state.usuarioId = null;
    state.userProfile = { nome: '', matricula: '', setor: '', centroCusto: '' };
    state.solicitacoes = [];
    state.form = {
      itens: {}, itemLivre: '', usarLivre: false, quantidadeLivre: 1,
      urgencia: 'normal', motivo: '',
      endereco: { cep: '', logradouro: '', bairro: '', cidade: '', uf: '', numero: '', complemento: '' },
      buscandoCep: false, erroCep: ''
    };
  }

  // Assina alterações em tempo real: estoque global e as próprias solicitações.
  function garantirRealtime(){
    if(realtimeSubscribed) return;
    realtimeSubscribed = true;

    window.db.subscribeProdutos(async () => {
      state.produtos = await window.db.listarProdutos();
      renderGridOnly();
    });

    window.db.subscribeSolicitacoes(async () => {
      if(!state.usuarioId) return;
      state.solicitacoes = await window.db.listarSolicitacoes(state.usuarioId);
      renderHistoryOnly();
    });
  }

  // Inicializa a aplicação: verifica sessão existente e escuta mudanças de login/logout.
  async function loadAll(){
    state.session = await window.db.getSession();
    if(state.session){
      await bootstrapSessao();
    }
    state.loaded = true;
    garantirRealtime();
    render();

    window.db.onAuthStateChange(async (session, event) => {
      if(event === 'PASSWORD_RECOVERY'){
        // Usuário clicou no link do e-mail: mostra a tela de "definir nova senha"
        // em vez de deixá-lo entrar direto no app com essa sessão temporária.
        state.session = session;
        state.recuperandoSenha = true;
        render();
        return;
      }
      const tinhaSessao = !!state.session;
      state.session = session;
      if(session && !state.recuperandoSenha){
        await bootstrapSessao();
      } else if(tinhaSessao && !state.recuperandoSenha) {
        limparSessao();
      }
      render();
    });
  }

  // Salva (com pequeno debounce) as alterações do perfil no Supabase.
  function saveUserData(){
    if(!state.session) return;
    clearTimeout(debounceSalvarPerfil);
    debounceSalvarPerfil = setTimeout(() => {
      window.db.atualizarUsuario(state.session.user.id, state.userProfile);
    }, 500);
  }

  // Envia e-mail/senha de login para o Supabase Auth.
  async function doLogin(email, senha){
    if(!isValidEmail(email)){ state.authError = 'Informe um e-mail corporativo válido.'; render(); return; }
    if(!senha){ state.authError = 'Informe sua senha.'; render(); return; }

    state.authError = '';
    state.authConfirmMsg = '';
    state.authSending = true;
    render();

    const { error } = await window.db.signIn(email.trim().toLowerCase(), senha);

    state.authSending = false;
    if(error){
      state.authError = error.message === 'Invalid login credentials'
        ? 'E-mail ou senha incorretos.'
        : error.message;
      render();
      return;
    }
    // onAuthStateChange cuida do bootstrap e do render.
  }

  // Cria uma nova conta no Supabase Auth (a linha em "usuarios" é criada automaticamente).
  async function doSignup(email, senha){
    if(!isValidEmail(email)){ state.authError = 'Informe um e-mail corporativo válido.'; render(); return; }
    if(!senha || senha.length < 6){ state.authError = 'A senha deve ter ao menos 6 caracteres.'; render(); return; }

    state.authError = '';
    state.authConfirmMsg = '';
    state.authSending = true;
    render();

    const { data, error } = await window.db.signUp(email.trim().toLowerCase(), senha);

    state.authSending = false;
    if(error){
      state.authError = error.message;
      render();
      return;
    }

    if(!data.session){
      // Confirmação de e-mail está ativa no projeto: avisa e volta pro login.
      state.authMode = 'login';
      state.authConfirmMsg = 'Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.';
    }
    render();
  }

  // Envia o e-mail com o link de recuperação de senha.
  async function doRecuperarSenha(email){
    if(!isValidEmail(email)){ state.authError = 'Informe um e-mail válido.'; render(); return; }

    state.authError = '';
    state.authConfirmMsg = '';
    state.authSending = true;
    render();

    const { error } = await window.db.resetPasswordForEmail(email.trim().toLowerCase());

    state.authSending = false;
    if(error){
      state.authError = error.message;
      render();
      return;
    }

    state.authMode = 'login';
    state.authConfirmMsg = 'Se esse e-mail estiver cadastrado, enviamos um link para redefinir a senha. Confira sua caixa de entrada.';
    render();
  }

  // Define a nova senha após o usuário clicar no link recebido por e-mail.
  async function doDefinirNovaSenha(novaSenha, confirmarSenha){
    state.novaSenhaError = '';

    if(!novaSenha || novaSenha.length < 6){ state.novaSenhaError = 'A senha deve ter ao menos 6 caracteres.'; render(); return; }
    if(novaSenha !== confirmarSenha){ state.novaSenhaError = 'As senhas não coincidem.'; render(); return; }

    state.authSending = true;
    render();

    const { error } = await window.db.updatePassword(novaSenha);

    state.authSending = false;
    if(error){
      state.novaSenhaError = error.message;
      render();
      return;
    }

    // Senha trocada com sucesso: a sessão temporária do link já vira a sessão
    // válida, então entramos direto no app como se tivesse acabado de logar.
    state.recuperandoSenha = false;
    await bootstrapSessao();
    render();
    showToast('Senha atualizada com sucesso!');
  }

  // Encerra a sessão do usuário e volta para a tela de identificação.
  async function logoutUser(){
    await window.db.signOut();
    // onAuthStateChange cuida da limpeza e do render.
  }

  // Cancela uma solicitação (o estorno de estoque acontece no banco, via RPC).
  async function cancelarSolicitacao(id){
    const { error } = await window.db.cancelarSolicitacao(id);
    if(error){
      showToast('Não foi possível cancelar: ' + error.message);
      return;
    }
    const [produtos, solicitacoes] = await Promise.all([
      window.db.listarProdutos(),
      window.db.listarSolicitacoes(state.usuarioId)
    ]);
    state.produtos = produtos;
    state.solicitacoes = solicitacoes;
    showToast('Solicitação cancelada e estoque estornado.');
    render();
  }

  // Gera e baixa um arquivo Excel com o histórico de solicitações do usuário.
  async function exportarCSV(){
    if(!state.solicitacoes.length){ showToast('Não há solicitações salvas para este usuário.'); return; }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Solicitações';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Solicitações', { views: [{ state: 'frozen', ySplit: 1 }] });

    sheet.columns = [
      { header: 'Solicitante',  key: 'nome',         width: 25 },
      { header: 'Email',        key: 'email',        width: 28 },
      { header: 'Matrícula',    key: 'matricula',    width: 14 },
      { header: 'Setor',        key: 'setor',        width: 18 },
      { header: 'Centro Custo', key: 'centroCusto',  width: 16 },
      { header: 'Item',         key: 'item',         width: 30 },
      { header: 'Quantidade',   key: 'quantidade',   width: 12 },
      { header: 'Endereço',     key: 'endereco',      width: 40 },
      { header: 'Urgência',     key: 'urgencia',     width: 12 },
      { header: 'Status',       key: 'status',       width: 14 },
      { header: 'Data',         key: 'dataCriacao',  width: 14 },
    ];

    // Percorre cada solicitação para adicioná-la como uma linha na planilha.
    state.solicitacoes.forEach(s => {
      const dataConvertida = s.dataCriacao ? new Date(s.dataCriacao) : null;
      sheet.addRow({
        nome: s.nome, email: s.email, matricula: s.matricula || '', setor: s.setor || '', centroCusto: s.centroCusto || '',
        item: s.item, quantidade: s.quantidade, endereco: s.endereco || '', urgencia: s.urgencia, status: s.status,
        dataCriacao: (dataConvertida && !isNaN(dataConvertida)) ? dataConvertida : s.dataCriacao,
      });
    });

    sheet.getColumn('dataCriacao').numFmt = 'dd/mm/yyyy';

    const headerRow = sheet.getRow(1);
    // Aplica a formatação ao cabeçalho da planilha.
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    headerRow.height = 24;

    // Aplica alinhamento, bordas e preenchimento às linhas da planilha.
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      // Formata cada célula individualmente.
      row.eachCell(cell => {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD9D9D9' } }, left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
          bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } }, right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
        };
      });
      if (rowNumber % 2 === 0) {
        // Aplica o preenchimento alternado nas linhas pares.
        row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }; });
      }
      row.height = 20;
    });

    sheet.autoFilter = { from: 'A1', to: `K${state.solicitacoes.length + 1}` };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Minhas_Solicitacoes_${esc(state.currentUserEmail)}_${new Date().toISOString().slice(0,10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Relatório Excel exportado!');
  }

  // Envia os dados da solicitação para a API responsável por salvá-los (apenas notificação por e-mail).
  async function salvarEmailAPI(payload) {
    try {
      const response = await fetch(API_SALVAR_EMAIL_DADOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'salvar_email_solicitacao',
          emailDestino: EMAIL_RESPONSAVEL,
          dadosSolicitacao: payload,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        throw new Error('Falha ao comunicar com a API de salvamento de e-mails.');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro na API de salvamento de e-mail:', error);
      throw error;
    }
  }

  // Envia a solicitação por e-mail e controla o status de envio exibido ao usuário.
  async function enviarEmailAutomatico(payload) {
    state.sending = true;
    state.lastStatus = { type: 'sending', msg: 'Encaminhando solicitação...' };
    render();

    try {
      await Promise.all([
        fetch(WEBHOOK_EMAIL_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: EMAIL_RESPONSAVEL, subject: `[SUPRIMENTOS] Solicitação de ${payload.nome} (${payload.email})`, payload: payload })
        }),
        salvarEmailAPI(payload)
      ]);

      state.lastStatus = { type: 'success', msg: `Solicitação enviada e e-mail salvo com sucesso!` };
    } catch (err) {
      state.lastStatus = { type: 'success', msg: `Pedido salvo no seu perfil com sucesso!` };
    } finally {
      state.sending = false;
      render();
    }
  }

  // Valida o formulário, envia para o banco (que confere estoque e debita numa transação) e notifica.
  async function submitForm(){
    const f = state.form;
    const p = state.userProfile;
    state.error = '';

    if(!p.nome.trim()){ state.error = 'Preencha o seu nome completo.'; render(); return; }

    if(!enderecoValido(f.endereco)){
      state.error = 'Informe o endereço de entrega completo (CEP, número e cidade/UF).';
      render();
      return;
    }

    let itens = [];
    let itemResumo = '';
    let quantidadeTotal = 0;

    if(f.usarLivre){
      if(!f.itemLivre.trim()){ state.error = 'Especifique o item personalizado.'; render(); return; }
      if(!f.quantidadeLivre || f.quantidadeLivre < 1){ state.error = 'Informe uma quantidade válida.'; render(); return; }
      itemResumo = f.itemLivre.trim();
      quantidadeTotal = f.quantidadeLivre;
    } else {
      const idsSelecionados = Object.keys(f.itens);
      if(idsSelecionados.length === 0){ state.error = 'Selecione ao menos um item do catálogo.'; render(); return; }
      for(const id of idsSelecionados){
        if(!f.itens[id] || f.itens[id] < 1){ state.error = 'Informe uma quantidade válida para cada item selecionado.'; render(); return; }
      }
      itens = idsSelecionados.map(id => ({ produtoId: id, quantidade: f.itens[id] }));
      const nomesPorId = Object.fromEntries(state.produtos.map(p2 => [p2.id, p2.nome]));
      itemResumo = itens.map(i => `${nomesPorId[i.produtoId] || 'Item'} (x${i.quantidade})`).join(', ');
      quantidadeTotal = itens.reduce((soma, i) => soma + i.quantidade, 0);
    }

    const enderecoTexto = montarEnderecoTexto(f.endereco);

    state.sending = true;
    state.lastStatus = { type: 'sending', msg: 'Registrando solicitação e atualizando estoque...' };
    render();

    const { data: registro, error } = await window.db.criarSolicitacao({
      itens,
      itemCustomizado: f.usarLivre ? f.itemLivre.trim() : null,
      quantidadeCustomizada: f.usarLivre ? f.quantidadeLivre : null,
      urgencia: f.urgencia,
      motivo: f.motivo,
      endereco: enderecoTexto
    });

    if(error){
      state.sending = false;
      state.lastStatus = null;
      state.error = error.message;
      render();
      return;
    }

    const [produtos, solicitacoes] = await Promise.all([
      window.db.listarProdutos(),
      window.db.listarSolicitacoes(state.usuarioId)
    ]);
    state.produtos = produtos;
    state.solicitacoes = solicitacoes;

    state.form.itens = {};
    state.form.itemLivre = '';
    state.form.quantidadeLivre = 1;
    state.form.motivo = '';
    // Mantém o endereço preenchido (é comum pedir de novo pro mesmo lugar).

    await enviarEmailAutomatico({
      nome: p.nome,
      email: state.currentUserEmail,
      matricula: p.matricula,
      setor: p.setor,
      centroCusto: p.centroCusto,
      item: itemResumo,
      quantidade: quantidadeTotal,
      urgencia: f.urgencia,
      motivo: f.motivo,
      endereco: enderecoTexto,
      status: registro ? registro.status : 'pendente'
    });
  }

  // Reconstrói a interface principal conforme o estado atual da aplicação.
  function render(){
    app.innerHTML = '';
    if(!state.loaded) return;

    if(state.recuperandoSenha){
      renderDefinirNovaSenhaModal();
      return;
    }

    if(!state.session){
      renderLoginModal();
      return;
    }

    if(state.toast) app.appendChild(elFrag(`<div class="toast">${state.toast}</div>`));

    if(state.showInfoModal){
      renderInfoModal();
    }

    const headerBar = elFrag(`
      <div class="header-bar">
        <div class="brand" style="display:flex; align-items:center; gap:10px;">
          <svg viewBox="0 0 240 110" height="26" xmlns="http://www.w3.org/2000/svg" aria-label="SGS" style="display:block; flex-shrink:0;">
            <text x="0" y="82" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="98" letter-spacing="-3" fill="#77787B">SGS</text>
            <line x1="0" y1="96" x2="228" y2="96" stroke="#F47920" stroke-width="6"/>
            <line x1="210" y1="0" x2="210" y2="110" stroke="#F47920" stroke-width="6"/>
          </svg>
          <span class="brand-badge" style="margin-left:4px;">Solicitações</span>
        </div>
        <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
          <div class="dim mono" style="font-size:12px;">
            Central: <strong style="color:var(--text);">${EMAIL_RESPONSAVEL}</strong>
          </div>
          <button class="secondary" id="theme-toggle-btn" style="font-size:12px; display:flex; align-items:center; gap:6px;">
            ${state.theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
        </div>
      </div>
    `);

    // Alterna entre os temas claro e escuro e salva a preferência do usuário.
    headerBar.querySelector('#theme-toggle-btn').onclick = () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('app_theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
      render();
    };

    app.appendChild(headerBar);

    const content = document.createElement('div');
    content.className = 'content';
    app.appendChild(content);

    const initial = state.currentUserEmail.charAt(0).toUpperCase();
    content.appendChild(elFrag(`
      <div class="user-session-bar">
        <div class="user-info-tag">
          <div class="user-avatar">${initial}</div>
          <div>
            <div>Sessão ativa: <strong>${esc(state.currentUserEmail)}</strong></div>
            <div class="dim" style="font-size:11.5px;">Sincronizado em tempo real com o controle de estoque.</div>
          </div>
        </div>
        <button class="secondary" id="btn-logout" style="font-size:12px;">Sair</button>
      </div>
    `));

    const pendentes = state.solicitacoes.filter(s => s.status === 'pendente').length;
    const aprovados = state.solicitacoes.filter(s => s.status === 'aprovado' || s.status === 'entregue').length;
    const rejeitados = state.solicitacoes.filter(s => s.status === 'rejeitado' || s.status === 'cancelado').length;

    content.appendChild(elFrag(`
      <div class="kpi-row" id="kpi-container">
        <div class="kpi-card">
          <div class="label">Meus Pedidos</div>
          <div class="val" id="kpi-total">${state.solicitacoes.length}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Em Análise</div>
          <div class="val" style="color:var(--amber);" id="kpi-pend">${pendentes}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Aprovados</div>
          <div class="val" style="color:var(--ok);" id="kpi-aprov">${aprovados}</div>
        </div>
        <div class="kpi-card">
          <div class="label">Cancelados/Reprovados</div>
          <div class="val" style="color:var(--danger);" id="kpi-rejej">${rejeitados}</div>
        </div>
      </div>
    `));

    if(state.lastStatus){
      content.appendChild(elFrag(`
        <div class="status-banner ${state.lastStatus.type}" id="status-banner-box">
          <span>${state.lastStatus.msg}</span>
          <button class="secondary" onclick="this.parentElement.remove()" style="padding:4px 8px; font-size:11px;">Fechar</button>
        </div>
      `));
    }

    content.appendChild(buildFormPanel());
    content.appendChild(buildHistoryPanel());
    wireEvents(content);
  }

  // Abre ou atualiza o modal que apresenta as informações detalhadas da planilha.
  function renderInfoModal(){
    let existingOverlay = document.querySelector('.modal-overlay');
    if (existingOverlay) {
      updateModalContent(existingOverlay);
      return;
    }

    const modal = elFrag(`
      <div class="modal-overlay">
        <div class="modal-card" id="modal-card-container"></div>
      </div>
    `);

    modal.querySelector('#modal-card-container').innerHTML = getModalInnerHtml();
    attachModalEvents(modal);
    app.appendChild(modal);
  }

  // Monta o HTML interno do modal usando a aba atualmente selecionada.
  function getModalInnerHtml(){
    const abas = Object.keys(PLANILHA_ABAS_DADOS);
    const dadosAtuais = PLANILHA_ABAS_DADOS[state.activeTab] || { headers: [], rows: [] };

    return `
      <div class="modal-header">
        <h3 style="margin:0; font-family:var(--font-display);">Informações Detalhadas (Todas as Abas)</h3>
        <button class="secondary" id="close-modal-btn">✕ Fechar</button>
      </div>
      <div class="tabs-header">
        ${abas.map(aba => `<button class="tab-btn ${state.activeTab === aba ? 'active' : ''}" data-tab="${aba}">${aba.toUpperCase()}</button>`).join('')}
      </div>
      <div class="modal-body">
        <table>
          <thead>
            <tr>
              ${dadosAtuais.headers.map(h => `<th>${h || ''}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${dadosAtuais.rows.map(row => `
              <tr>
                ${dadosAtuais.headers.map((_, i) => `<td>${row[i] !== undefined && row[i] !== null ? row[i] : ''}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Atualiza somente o conteúdo do modal sem recriar seu overlay.
  function updateModalContent(overlay){
    const container = overlay.querySelector('#modal-card-container');
    if(container){
      container.innerHTML = getModalInnerHtml();
      attachModalEvents(overlay);
    }
  }

  // Conecta os eventos dos botões de fechar e das abas do modal.
  function attachModalEvents(modalElement){
    // Fecha o modal e atualiza o estado correspondente.
    modalElement.querySelector('#close-modal-btn').onclick = () => {
      state.showInfoModal = false;
      const overlay = document.querySelector('.modal-overlay');
      if(overlay) overlay.remove();
    };

    // Percorre os botões de abas para associar o evento de seleção.
    modalElement.querySelectorAll('.tab-btn').forEach(btn => {
      // Troca a aba ativa e atualiza o conteúdo exibido no modal.
      btn.onclick = (e) => {
        state.activeTab = e.target.dataset.tab;
        const overlay = document.querySelector('.modal-overlay');
        if(overlay) {
          updateModalContent(overlay);
        } else {
          render();
        }
      };
    });
  }

  // Cria a tela de login/cadastro com e-mail e senha (autenticação real via Supabase Auth).
  function renderLoginModal(){
    if(state.authMode === 'recuperar'){ renderRecuperarSenhaModal(); return; }

    const isSignup = state.authMode === 'signup';
    const modal = elFrag(`
      <div class="login-overlay">
        <div class="login-card">
          <h2>${isSignup ? 'Criar Conta' : 'Acesso ao Portal'}</h2>
          <p class="dim" style="font-size:13.5px; margin:0 0 20px; line-height:1.4;">
            ${isSignup ? 'Cadastre-se com seu e-mail corporativo e uma senha.' : 'Entre com seu e-mail corporativo e senha para acessar o portal de suprimentos.'}
          </p>
          <div class="field">
            <label>Seu E-mail Corporativo <span style="color:var(--amber);">*</span></label>
            <input id="login-email" type="email" placeholder="nome@empresa.com" autofocus>
          </div>
          <div class="field" style="margin-top:12px;">
            <label>Senha <span style="color:var(--amber);">*</span></label>
            <input id="login-senha" type="password" placeholder="${isSignup ? 'Mínimo 6 caracteres' : 'Sua senha'}">
          </div>
          ${!isSignup ? `<div style="text-align:right; margin-top:6px;"><span id="link-esqueci-senha" style="color:var(--steel); cursor:pointer; text-decoration:underline; font-size:12px;">Esqueci minha senha</span></div>` : ''}
          ${state.authConfirmMsg ? `<div style="color:var(--ok); font-size:12.5px; margin-top:12px;">${state.authConfirmMsg}</div>` : ''}
          ${state.authError ? `<div style="color:var(--danger); font-size:12.5px; margin-top:12px;">${state.authError}</div>` : ''}
          <button class="primary" id="login-btn" style="margin-top:16px;" ${state.authSending ? 'disabled' : ''}>
            ${state.authSending ? 'Aguarde...' : (isSignup ? 'Criar conta' : 'Entrar')}
          </button>
          <div style="text-align:center; margin-top:14px; font-size:12.5px;">
            <span class="dim">${isSignup ? 'Já tem conta?' : 'Ainda não tem conta?'}</span>
            <span id="toggle-auth-mode" style="color:var(--steel); cursor:pointer; text-decoration:underline; margin-left:4px;">${isSignup ? 'Entrar' : 'Criar conta'}</span>
          </div>
        </div>
      </div>
    `);

    app.appendChild(modal);

    const btn = modal.querySelector('#login-btn');
    const emailInput = modal.querySelector('#login-email');
    const senhaInput = modal.querySelector('#login-senha');

    const doSubmit = () => isSignup ? doSignup(emailInput.value, senhaInput.value) : doLogin(emailInput.value, senhaInput.value);
    btn.onclick = doSubmit;
    // Permite enviar pressionando Enter em qualquer um dos dois campos.
    emailInput.onkeydown = (e) => { if(e.key === 'Enter') senhaInput.focus(); };
    senhaInput.onkeydown = (e) => { if(e.key === 'Enter') doSubmit(); };

    modal.querySelector('#toggle-auth-mode').onclick = () => {
      state.authMode = isSignup ? 'login' : 'signup';
      state.authError = '';
      state.authConfirmMsg = '';
      render();
    };

    const linkEsqueci = modal.querySelector('#link-esqueci-senha');
    if(linkEsqueci) linkEsqueci.onclick = () => {
      state.authMode = 'recuperar';
      state.authError = '';
      state.authConfirmMsg = '';
      render();
    };
  }

  // Tela para o usuário pedir o e-mail de recuperação de senha.
  function renderRecuperarSenhaModal(){
    const modal = elFrag(`
      <div class="login-overlay">
        <div class="login-card">
          <h2>Recuperar Senha</h2>
          <p class="dim" style="font-size:13.5px; margin:0 0 20px; line-height:1.4;">
            Informe o e-mail da sua conta. Vamos enviar um link para você definir uma nova senha.
          </p>
          <div class="field">
            <label>Seu E-mail Corporativo <span style="color:var(--amber);">*</span></label>
            <input id="recuperar-email" type="email" placeholder="nome@empresa.com" autofocus>
          </div>
          ${state.authError ? `<div style="color:var(--danger); font-size:12.5px; margin-top:12px;">${state.authError}</div>` : ''}
          <button class="primary" id="recuperar-btn" style="margin-top:16px;" ${state.authSending ? 'disabled' : ''}>
            ${state.authSending ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
          <div style="text-align:center; margin-top:14px; font-size:12.5px;">
            <span id="voltar-login" style="color:var(--steel); cursor:pointer; text-decoration:underline;">← Voltar para o login</span>
          </div>
        </div>
      </div>
    `);

    app.appendChild(modal);

    const emailInput = modal.querySelector('#recuperar-email');
    const btn = modal.querySelector('#recuperar-btn');
    const doSubmit = () => doRecuperarSenha(emailInput.value);
    btn.onclick = doSubmit;
    emailInput.onkeydown = (e) => { if(e.key === 'Enter') doSubmit(); };

    modal.querySelector('#voltar-login').onclick = () => {
      state.authMode = 'login';
      state.authError = '';
      render();
    };
  }

  // Tela para definir a nova senha, exibida quando o usuário chega via link do e-mail.
  function renderDefinirNovaSenhaModal(){
    const modal = elFrag(`
      <div class="login-overlay">
        <div class="login-card">
          <h2>Definir Nova Senha</h2>
          <p class="dim" style="font-size:13.5px; margin:0 0 20px; line-height:1.4;">
            Escolha uma nova senha para sua conta.
          </p>
          <div class="field">
            <label>Nova Senha <span style="color:var(--amber);">*</span></label>
            <input id="nova-senha" type="password" placeholder="Mínimo 6 caracteres" autofocus>
          </div>
          <div class="field" style="margin-top:12px;">
            <label>Confirmar Nova Senha <span style="color:var(--amber);">*</span></label>
            <input id="confirmar-senha" type="password" placeholder="Repita a nova senha">
          </div>
          ${state.novaSenhaError ? `<div style="color:var(--danger); font-size:12.5px; margin-top:12px;">${state.novaSenhaError}</div>` : ''}
          <button class="primary" id="definir-senha-btn" style="margin-top:16px;" ${state.authSending ? 'disabled' : ''}>
            ${state.authSending ? 'Salvando...' : 'Salvar Nova Senha'}
          </button>
        </div>
      </div>
    `);

    app.appendChild(modal);

    const novaSenhaInput = modal.querySelector('#nova-senha');
    const confirmarInput = modal.querySelector('#confirmar-senha');
    const btn = modal.querySelector('#definir-senha-btn');
    const doSubmit = () => doDefinirNovaSenha(novaSenhaInput.value, confirmarInput.value);
    btn.onclick = doSubmit;
    novaSenhaInput.onkeydown = (e) => { if(e.key === 'Enter') confirmarInput.focus(); };
    confirmarInput.onkeydown = (e) => { if(e.key === 'Enter') doSubmit(); };
  }


  // Constrói o painel de nova requisição e seus campos de preenchimento.
  function buildFormPanel(){
    const f = state.form;
    const p = state.userProfile;

    const panel = elFrag(`
      <div class="panel">
        <div class="panel-head"><h3>Nova Requisição de Material</h3></div>

        <div class="field-row-3">
          <div class="field">
            <label>Nome Completo <span class="req">*</span></label>
            <input id="p-nome" value="${esc(p.nome)}" placeholder="Seu nome completo">
          </div>
          <div class="field">
            <label>Matrícula / ID</label>
            <input id="p-matricula" value="${esc(p.matricula)}" placeholder="Ex: M-10293">
          </div>
          <div class="field">
            <label>E-mail (Chave da Conta)</label>
            <input value="${esc(state.currentUserEmail)}" readonly style="opacity:0.7; cursor:not-allowed;">
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Departamento / Setor</label>
            <input id="p-setor" value="${esc(p.setor)}" placeholder="Ex: Operações / RH">
          </div>
          <div class="field">
            <label>Centro de Custo</label>
            <input id="p-centro" value="${esc(p.centroCusto)}" placeholder="Ex: CC-3040">
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border); margin:20px 0;">

        <div class="field" style="margin-bottom:20px;">
          <button class="secondary" id="btn-ver-info" style="width:100%; background:var(--panel-2); border-color:var(--amber); color:var(--text); font-weight:600; padding:12px;">
            📋 Consultar Informações da Planilha (Abas: EPIs, ADM, Operação)
          </button>
        </div>

        <div class="field">
          <label>Selecione os Itens do Catálogo — informe a quantidade de cada um</label>
          <input id="busca-item" placeholder="Filtrar item por nome ou SKU..." value="${esc(state.busca)}" style="margin-bottom:12px;">
          <div class="product-grid" id="product-grid"></div>
          <span id="toggle-outro" style="color:var(--steel); font-size:12px; cursor:pointer; text-decoration:underline;">
            ${f.usarLivre ? '← Voltar ao catálogo padronizado' : 'Item não listado? Descrever produto personalizado →'}
          </span>
        </div>

        <div id="custom-item-container">
          ${f.usarLivre ? `
            <div class="field-row" style="margin-top:12px;">
              <div class="field" style="flex:2;">
                <label>Descrição do Item Especial <span class="req">*</span></label>
                <input id="f-item-livre" value="${esc(f.itemLivre)}" placeholder="Informe especificações técnicas, modelo ou marca desejada">
              </div>
              <div class="field">
                <label>Quantidade <span class="req">*</span></label>
                <input id="f-qtd-livre" type="number" min="1" value="${f.quantidadeLivre}">
              </div>
            </div>
          ` : ''}
        </div>

        <div class="field" style="margin-top:16px;">
          <label>Prioridade / Urgência</label>
          <select id="f-urgencia">
            <option value="baixa" ${f.urgencia==='baixa'?'selected':''}>Baixa - Rotina operacional</option>
            <option value="normal" ${f.urgencia==='normal'?'selected':''}>Normal - Necessidade regular</option>
            <option value="alta" ${f.urgencia==='alta'?'selected':''}>Alta - Impacto em atividades</option>
          </select>
        </div>

        <hr style="border:none; border-top:1px solid var(--border); margin:20px 0;">

        <div class="field">
          <label>Endereço de Entrega <span class="req">*</span></label>
        </div>
        <div class="field-row-3">
          <div class="field">
            <label>CEP <span class="req">*</span></label>
            <input id="f-cep" value="${esc(f.endereco.cep)}" placeholder="00000-000" maxlength="9" inputmode="numeric">
          </div>
          <div class="field" style="grid-column: span 2;">
            <label>Logradouro <span class="req">*</span></label>
            <input id="f-logradouro" value="${esc(f.endereco.logradouro)}" placeholder="${f.buscandoCep ? 'Buscando endereço...' : 'Rua, Avenida...'}" ${f.buscandoCep ? 'disabled' : ''}>
          </div>
        </div>
        ${f.erroCep ? `<div style="color:var(--danger); font-size:12.5px; margin:-8px 0 12px;">${f.erroCep}</div>` : ''}
        <div class="field-row-3">
          <div class="field">
            <label>Número <span class="req">*</span></label>
            <input id="f-numero" value="${esc(f.endereco.numero)}" placeholder="Nº">
          </div>
          <div class="field">
            <label>Complemento</label>
            <input id="f-complemento" value="${esc(f.endereco.complemento)}" placeholder="Bloco, apto, sala...">
          </div>
          <div class="field">
            <label>Bairro</label>
            <input id="f-bairro" value="${esc(f.endereco.bairro)}" placeholder="Bairro">
          </div>
        </div>
        <div class="field-row">
          <div class="field">
            <label>Cidade <span class="req">*</span></label>
            <input id="f-cidade" value="${esc(f.endereco.cidade)}" placeholder="Cidade">
          </div>
          <div class="field">
            <label>UF <span class="req">*</span></label>
            <input id="f-uf" value="${esc(f.endereco.uf)}" placeholder="UF" maxlength="2" style="text-transform:uppercase;">
          </div>
        </div>

        <div class="field" style="margin-top:8px;">
          <label>Observações</label>
          <textarea id="f-motivo" rows="2" placeholder="Alguma observação adicional sobre o pedido (opcional)...">${esc(f.motivo)}</textarea>
        </div>

        <div id="form-error-box" style="color:var(--danger); font-size:13px; margin-bottom:12px;">${state.error}</div>

        <button class="primary" id="submit-btn" ${state.sending ? 'disabled' : ''}>
          ${state.sending ? 'Processando envio...' : 'Enviar Solicitação e Atualizar Estoque'}
        </button>
      </div>
    `);

    // Abre o modal com as informações detalhadas da planilha.
    panel.querySelector('#btn-ver-info').onclick = () => {
      state.showInfoModal = true;
      renderInfoModal();
    };

    return panel;
  }

  // Constrói o painel que exibe o histórico de solicitações do usuário.
  function buildHistoryPanel(){
    const list = state.solicitacoes;
    return elFrag(`
      <div class="panel" id="history-panel-box">
        <div class="panel-head">
          <h3>Meus Pedidos (${esc(state.currentUserEmail)})</h3>
          <button class="secondary" id="btn-export">📥 Exportar Meus Pedidos (CSV)</button>
        </div>

        <div id="history-table-wrapper">
          ${list.length === 0 ? `<div class="empty-state">Você ainda não possui solicitações registradas nesta conta.</div>` : `
            <div style="overflow-x:auto;">
              <table>
                <thead>
                  <tr>
                    <th>Materiais</th>
                    <th>Qtd.</th>
                    <th>Setor / CC</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>Data da Solicitação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map(s => `
                    <tr>
                      <td style="font-weight:600;">${esc(s.item)}${s.endereco ? `<br><small class="dim" style="font-weight:400;">📍 ${esc(s.endereco)}</small>` : ''}</td>
                      <td class="mono" style="font-weight:700;">${s.quantidade}</td>
                      <td class="dim">${s.setor ? esc(s.setor) : '—'}<br><small class="mono">${esc(s.centroCusto)}</small></td>
                      <td><span class="badge urg-${esc(s.urgencia)}">${esc(s.urgencia).toUpperCase()}</span></td>
                      <td><span class="badge ${esc(s.status)}">${esc(s.status).toUpperCase()}</span></td>
                      <td class="dim mono" style="font-size:11px;">${fmtDate(s.dataCriacao)}</td>
                      <td>
                        ${s.status === 'pendente' ? `<button class="danger-btn cancel-req-btn" data-id="${s.id}">Cancelar</button>` : `<span class="dim" style="font-size:11.5px;">—</span>`}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `);
  }

  // Converte uma string HTML em um elemento DOM pronto para ser inserido na página.
  function elFrag(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstElementChild; }

  // Escapa texto antes de inserir no HTML. Todo campo digitado pelo usuário
  // (nome, motivo, endereço, item personalizado...) DEVE passar por aqui antes
  // de entrar em um template de innerHTML — caso contrário, alguém poderia
  // digitar <script> ou <img onerror=...> e executar código na tela de quem for
  // ler esse conteúdo depois (XSS armazenado).
  function esc(v){
    if(v === null || v === undefined) return '';
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // Atualiza somente a grade de produtos, preservando o restante da tela.
  function renderGridOnly(){
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    const filtered = state.produtos.filter(p => !state.busca || p.nome.toLowerCase().includes(state.busca.toLowerCase()) || (p.sku || '').toLowerCase().includes(state.busca.toLowerCase()));

    if(filtered.length === 0){ grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Nenhum material encontrado.</div>`; return; }

    // Converte os produtos filtrados em cartões HTML individuais.
    grid.innerHTML = filtered.map(p => {
      const estVal = Number(p.estoque || 0);
      const isSelected = Object.prototype.hasOwnProperty.call(state.form.itens, p.id);
      const qtd = isSelected ? state.form.itens[p.id] : 1;
      return `
        <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${p.id}">
          <div class="cat">${esc(p.categoria)}</div>
          <h4>${esc(p.nome)}</h4>
          <div class="dim mono" style="font-size:11px; margin-top:4px;">SKU: ${p.sku ? esc(p.sku) : '—'} | Estoque: <strong style="color:${estVal > 5 ? 'var(--text)' : 'var(--danger)'};">${estVal}</strong></div>
          ${isSelected ? `
            <div class="field" style="margin-top:10px;" onclick="event.stopPropagation();">
              <label style="margin-bottom:4px;">Quantidade deste item</label>
              <input type="number" min="1" max="${estVal || 999}" value="${qtd}" class="qtd-item-input" data-id="${p.id}">
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Percorre os cartões para configurar a seleção de produtos.
    grid.querySelectorAll('.product-card').forEach(card => {
      // Alterna a seleção do produto clicado (clique fora do campo de quantidade).
      card.onclick = () => {
        const id = card.dataset.id;
        state.form.usarLivre = false;
        if(Object.prototype.hasOwnProperty.call(state.form.itens, id)){
          delete state.form.itens[id];
        } else {
          state.form.itens[id] = 1;
        }
        renderGridOnly();
      };
    });

    // Permite ajustar a quantidade de cada item selecionado individualmente.
    grid.querySelectorAll('.qtd-item-input').forEach(input => {
      input.onclick = (e) => e.stopPropagation();
      input.oninput = (e) => {
        const id = input.dataset.id;
        const val = parseInt(e.target.value) || 1;
        state.form.itens[id] = val < 1 ? 1 : val;
      };
    });
  }

  // Atualiza somente a tabela de histórico e os indicadores KPI.
  function renderHistoryOnly(){
    const wrapper = document.getElementById('history-table-wrapper');
    if(!wrapper) return;
    const list = state.solicitacoes;

    wrapper.innerHTML = list.length === 0 ? `<div class="empty-state">Você ainda não possui solicitações registradas nesta conta.</div>` : `
      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Materiais</th>
              <th>Qtd.</th>
              <th>Setor / CC</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Data da Solicitação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${list.map(s => `
              <tr>
                <td style="font-weight:600;">${esc(s.item)}${s.endereco ? `<br><small class="dim" style="font-weight:400;">📍 ${esc(s.endereco)}</small>` : ''}</td>
                <td class="mono" style="font-weight:700;">${s.quantidade}</td>
                <td class="dim">${s.setor ? esc(s.setor) : '—'}<br><small class="mono">${esc(s.centroCusto)}</small></td>
                <td><span class="badge urg-${esc(s.urgencia)}">${esc(s.urgencia).toUpperCase()}</span></td>
                <td><span class="badge ${esc(s.status)}">${esc(s.status).toUpperCase()}</span></td>
                <td class="dim mono" style="font-size:11px;">${fmtDate(s.dataCriacao)}</td>
                <td>
                  ${s.status === 'pendente' ? `<button class="danger-btn cancel-req-btn" data-id="${s.id}">Cancelar</button>` : `<span class="dim" style="font-size:11.5px;">—</span>`}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Localiza os botões de cancelamento para configurar seus eventos.
    wrapper.querySelectorAll('.cancel-req-btn').forEach(btn => {
      // Confirma o cancelamento e chama a rotina que devolve o estoque.
      btn.onclick = () => {
        const id = btn.dataset.id;
        if(confirm('Deseja realmente cancelar esta solicitação? O estoque será estornado.')) {
          cancelarSolicitacao(id);
        }
      };
    });

    const pendentes = state.solicitacoes.filter(s => s.status === 'pendente').length;
    const aprovados = state.solicitacoes.filter(s => s.status === 'aprovado' || s.status === 'entregue').length;
    const rejeitados = state.solicitacoes.filter(s => s.status === 'rejeitado' || s.status === 'cancelado').length;

    const kTotal = document.getElementById('kpi-total');
    const kPend = document.getElementById('kpi-pend');
    const kAprov = document.getElementById('kpi-aprov');
    const kRejej = document.getElementById('kpi-rejej');
    if(kTotal) kTotal.textContent = state.solicitacoes.length;
    if(kPend) kPend.textContent = pendentes;
    if(kAprov) kAprov.textContent = aprovados;
    if(kRejej) kRejej.textContent = rejeitados;
  }

  // Liga todos os eventos dos campos, filtros, botões e formulário da página.
  function wireEvents(content){
    // Cria uma função auxiliar para salvar imediatamente os campos do perfil.
    const bindProfileLive = (id, key) => {
      const node = content.querySelector('#'+id);
      if(!node) return;
      // Atualiza o campo correspondente do perfil conforme o usuário digita.
      node.oninput = (e) => {
        state.userProfile[key] = e.target.value;
        saveUserData();
      };
    };

    bindProfileLive('p-nome', 'nome');
    bindProfileLive('p-matricula', 'matricula');
    bindProfileLive('p-setor', 'setor');
    bindProfileLive('p-centro', 'centroCusto');

    // Cria uma função auxiliar para atualizar os campos do formulário em tempo real.
    const bindFormLive = (id, key, parser) => {
      const node = content.querySelector('#'+id);
      if(!node) return;
      // Atualiza o campo do formulário, aplicando o parser quando necessário.
      node.oninput = (e) => {
        state.form[key] = parser ? parser(e.target.value) : e.target.value;
      };
    };

    bindFormLive('f-motivo', 'motivo');
    bindFormLive('f-item-livre', 'itemLivre');
    bindFormLive('f-qtd-livre', 'quantidadeLivre', v => parseInt(v)||1);

    // Cria uma função auxiliar para os campos aninhados em state.form.endereco.
    const bindEnderecoLive = (id, key, parser) => {
      const node = content.querySelector('#'+id);
      if(!node) return;
      node.oninput = (e) => {
        state.form.endereco[key] = parser ? parser(e.target.value) : e.target.value;
      };
    };

    bindEnderecoLive('f-logradouro', 'logradouro');
    bindEnderecoLive('f-numero', 'numero');
    bindEnderecoLive('f-complemento', 'complemento');
    bindEnderecoLive('f-bairro', 'bairro');
    bindEnderecoLive('f-cidade', 'cidade');
    bindEnderecoLive('f-uf', 'uf', v => v.toUpperCase().slice(0,2));

    const cepInput = content.querySelector('#f-cep');
    if(cepInput){
      // Formata visualmente o CEP e dispara a busca automática ao completar 8 dígitos.
      cepInput.oninput = (e) => {
        const digits = e.target.value.replace(/\D/g,'').slice(0,8);
        e.target.value = digits.length > 5 ? digits.replace(/(\d{5})(\d{0,3})/, '$1-$2') : digits;
        state.form.endereco.cep = digits;
        if(digits.length === 8){ buscarCep(digits); }
      };
    }

    const urgSel = content.querySelector('#f-urgencia');
    // Atualiza a prioridade sempre que o valor do select for alterado.
    if(urgSel) urgSel.onchange = (e) => { state.form.urgencia = e.target.value; };

    const busca = content.querySelector('#busca-item');
    if(busca) {
      // Filtra a grade de produtos enquanto o usuário digita na busca.
      busca.oninput = (e) => {
        const cursorPosition = e.target.selectionStart;
        state.busca = e.target.value;
        renderGridOnly();
        const novoBusca = content.querySelector('#busca-item');
        if(novoBusca){
          novoBusca.focus();
          novoBusca.setSelectionRange(cursorPosition, cursorPosition);
        }
      };
    }

    const toggle = content.querySelector('#toggle-outro');
    // Alterna entre catálogo padrão e item personalizado (recarrega o formulário inteiro).
    if(toggle) toggle.onclick = () => {
      state.form.usarLivre = !state.form.usarLivre;
      render();
    };

    const logoutBtn = content.querySelector('#btn-logout');
    if(logoutBtn) logoutBtn.onclick = logoutUser;

    const exportBtn = content.querySelector('#btn-export');
    if(exportBtn) exportBtn.onclick = exportarCSV;

    // Configura novamente os botões de cancelamento presentes na tabela.
    content.querySelectorAll('.cancel-req-btn').forEach(btn => {
      // Confirma o cancelamento e executa a devolução do estoque.
      btn.onclick = () => {
        const id = btn.dataset.id;
        if(confirm('Deseja realmente cancelar esta solicitação? O estoque será estornado.')) {
          cancelarSolicitacao(id);
        }
      };
    });

    renderGridOnly();

    const submitBtn = content.querySelector('#submit-btn');
    if(submitBtn) submitBtn.onclick = submitForm;
  }

  loadAll();
})();
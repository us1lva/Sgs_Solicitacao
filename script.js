// IIFE: encapsula todo o código da aplicação para evitar poluir o escopo global.
(function(){
  const app = document.getElementById('app');
  const EMAIL_RESPONSAVEL = 'yuri.silva1@sgs.com';
  const WEBHOOK_EMAIL_ENDPOINT = 'https://httpbin.org/post';
  const API_SALVAR_EMAIL_DADOS = 'https://httpbin.org/post';

  let state = {
    loaded: false,
    currentUserEmail: '',
    theme: localStorage.getItem('app_theme') || 'dark',
    userProfile: { nome: '', matricula: '', setor: '', centroCusto: '' },
    solicitacoes: [],
    produtos: [],
    form: { produtoIds: [], itemLivre: '', usarLivre: false, quantidade: 1, urgencia: 'normal', motivo: '' },
    busca: '',
    error: '',
    sending: false,
    lastStatus: null,
    toast: null,
    showInfoModal: false,
    activeTab: 'epis'
  };

  document.documentElement.setAttribute('data-theme', state.theme);

  const STORAGE_CATALOGO_KEY = 'enterprise_shared_catalogo';
  const STORAGE_GLOBAL_PEDIDOS = 'enterprise_global_solicitacoes';

  const CATALOGO_PADRAO = [
    { id: '1', sku: 'P21316', nome: 'Bota segurança preta cano médio', categoria: 'EPIs', estoque: 30 },
    { id: '2', sku: 'P30479', nome: 'Camisa Polo Feminina Algodão Azul', categoria: 'ADM', estoque: 15 },
    { id: '3', sku: 'P21371', nome: 'Calça Proteção Feminina Cinza Antiácido', categoria: 'Operação', estoque: 20 }
  ];

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

  // Obtém o catálogo de produtos salvo no localStorage ou retorna o catálogo padrão.
  function getCatalogo(){
    const stored = localStorage.getItem(STORAGE_CATALOGO_KEY);
    if(stored){
      try { 
        const parsed = JSON.parse(stored);
        return parsed.map(p => ({
          ...p,
          estoque: (p.estoque !== null && p.estoque !== undefined && !isNaN(p.estoque)) ? Number(p.estoque) : Number(p.quantidade || 0),
          quantidade: (p.quantidade !== null && p.quantidade !== undefined && !isNaN(p.quantidade)) ? Number(p.quantidade) : Number(p.estoque || 0)
        }));
      } catch(e){}
    }
    localStorage.setItem(STORAGE_CATALOGO_KEY, JSON.stringify(CATALOGO_PADRAO));
    return CATALOGO_PADRAO;
  }

  // Salva o catálogo de produtos no localStorage e avisa outras instâncias da aplicação.
  function saveCatalogo(produtos){
    const sanitized = produtos.map(p => ({
      ...p,
      estoque: (p.estoque !== null && p.estoque !== undefined && !isNaN(p.estoque)) ? Number(p.estoque) : 0,
      quantidade: (p.quantidade !== null && p.quantidade !== undefined && !isNaN(p.quantidade)) ? Number(p.quantidade) : Number(p.estoque || 0)
    }));
    const serialized = JSON.stringify(sanitized);
    localStorage.setItem(STORAGE_CATALOGO_KEY, serialized);
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_CATALOGO_KEY, newValue: serialized }));
  }

  // Reage a alterações de catálogo ou solicitações feitas em outra aba/janela.
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_CATALOGO_KEY) {
      if(event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          state.produtos = parsed.map(p => ({
            ...p,
            estoque: (p.estoque !== null && p.estoque !== undefined && !isNaN(p.estoque)) ? Number(p.estoque) : Number(p.quantidade || 0),
            quantidade: (p.quantidade !== null && p.quantidade !== undefined && !isNaN(p.quantidade)) ? Number(p.quantidade) : Number(p.estoque || 0)
          }));
          showToast('Catálogo sincronizado com o estoque!');
          renderGridOnly();
        } catch(e){}
      }
    }
    
    if (event.key === STORAGE_GLOBAL_PEDIDOS) {
      if(event.newValue) {
        try {
          state.solicitacoes = JSON.parse(event.newValue);
          renderHistoryOnly();
        } catch(e){}
      }
    }
  });

  // Gera um identificador único para cada solicitação.
  function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
  // Formata uma data ISO para o padrão brasileiro com data e hora.
  function fmtDate(iso){ const d=new Date(iso); return d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}); }
  // Valida se um texto possui o formato básico de um endereço de e-mail.
  function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  // Exibe uma mensagem temporária de aviso na interface.
  function showToast(msg){ state.toast=msg; render(); setTimeout(()=>{state.toast=null; render();}, 4000); }

  // Monta a chave usada para armazenar os dados de um usuário no localStorage.
  function getUserStorageKey(email){ return `user_data_${email.trim().toLowerCase()}`; }

  // Carrega do localStorage o perfil e o histórico de solicitações do usuário.
  function loadUserData(email){
    if(!email) return;
    const key = getUserStorageKey(email);
    try {
      const stored = localStorage.getItem(key);
      if(stored){
        const parsed = JSON.parse(stored);
        state.userProfile = parsed.profile || { nome: '', matricula: '', setor: '', centroCusto: '' };
        state.solicitacoes = parsed.solicitacoes || [];
      } else {
        state.userProfile = { nome: '', matricula: '', setor: '', centroCusto: '' };
        state.solicitacoes = [];
      }
    } catch(e) {
      state.userProfile = { nome: '', matricula: '', setor: '', centroCusto: '' };
      state.solicitacoes = [];
    }
  }

  // Salva o perfil e as solicitações do usuário e sincroniza o histórico global.
  function saveUserData(){
    if(!state.currentUserEmail) return;
    const key = getUserStorageKey(state.currentUserEmail);
    const dataToSave = { profile: state.userProfile, solicitacoes: state.solicitacoes };
    localStorage.setItem(key, JSON.stringify(dataToSave));
    localStorage.setItem('last_active_user', state.currentUserEmail);

    const globalPedidos = JSON.parse(localStorage.getItem(STORAGE_GLOBAL_PEDIDOS) || '[]');
    // Percorre as solicitações do usuário para atualizar a lista global de pedidos.
    state.solicitacoes.forEach(s => {
      const index = globalPedidos.findIndex(item => item.id === s.id);
      if(index >= 0) { globalPedidos[index] = s; } else { globalPedidos.unshift(s); }
    });
    localStorage.setItem(STORAGE_GLOBAL_PEDIDOS, JSON.stringify(globalPedidos));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_GLOBAL_PEDIDOS, newValue: JSON.stringify(globalPedidos) }));
  }

  // Inicializa catálogo, usuário ativo e estado visual da aplicação.
  function loadAll(){
    state.produtos = getCatalogo();
    const lastUser = localStorage.getItem('last_active_user');
    if(lastUser && isValidEmail(lastUser)){
      state.currentUserEmail = lastUser;
      loadUserData(lastUser);
    }
    state.loaded = true;
    render();
  }

  // Valida o e-mail e inicia a sessão do usuário.
  function loginUser(email){
    if(!isValidEmail(email)){
      state.error = 'Por favor, informe um e-mail corporativo válido.';
      render();
      return;
    }
    state.error = '';
    state.currentUserEmail = email.trim().toLowerCase();
    loadUserData(state.currentUserEmail);
    saveUserData();
    render();
  }

  // Encerra a sessão do usuário e volta para a tela de identificação.
  function logoutUser(){
    state.currentUserEmail = '';
    localStorage.removeItem('last_active_user');
    render();
  }

  // Cancela uma solicitação e, quando aplicável, devolve a quantidade ao estoque.
  function cancelarSolicitacao(id){
    const index = state.solicitacoes.findIndex(s => s.id === id);
    if(index >= 0){
      const solicitacao = state.solicitacoes[index];
      
      if(solicitacao.status === 'pendente'){
        if(solicitacao.produtoIds && solicitacao.produtoIds.length > 0){
          state.produtos = getCatalogo();
          // Percorre os produtos associados à solicitação para estornar o estoque.
          solicitacao.produtoIds.forEach(pId => {
            let prod = state.produtos.find(p => p.id === pId);
            if(prod){
              const estAtual = Number(prod.estoque !== null && prod.estoque !== undefined ? prod.estoque : prod.quantidade || 0);
              const novoEstoque = estAtual + Number(solicitacao.quantidade || 1);
              prod.estoque = novoEstoque;
              prod.quantidade = novoEstoque;
            }
          });
          saveCatalogo(state.produtos);
        }
        solicitacao.status = 'cancelado';
        saveUserData();
        showToast('Solicitação cancelada e estoque retornado.');
      } else {
        solicitacao.status = 'cancelado';
        saveUserData();
        showToast('Solicitação marcada como cancelada.');
      }
      render();
    }
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
      { header: 'Urgência',     key: 'urgencia',     width: 12 },
      { header: 'Status',       key: 'status',       width: 14 },
      { header: 'Data',         key: 'dataCriacao',  width: 14 },
    ];

    // Percorre cada solicitação para adicioná-la como uma linha na planilha.
    state.solicitacoes.forEach(s => {
      const dataConvertida = s.dataCriacao ? new Date(s.dataCriacao) : null;
      sheet.addRow({
        nome: s.nome, email: s.email, matricula: s.matricula || '', setor: s.setor || '', centroCusto: s.centroCusto || '',
        item: s.item, quantidade: s.quantidade, urgencia: s.urgencia, status: s.status,
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
    link.download = `Minhas_Solicitacoes_${state.currentUserEmail}_${new Date().toISOString().slice(0,10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('Relatório Excel exportado!');
  }

  // Envia os dados da solicitação para a API responsável por salvá-los.
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

  // Valida o formulário, verifica o estoque, registra a solicitação e inicia o envio.
  async function submitForm(){
    const f = state.form;
    const p = state.userProfile;
    state.error = '';

    if(!p.nome.trim()){ state.error = 'Preencha o seu nome completo.'; render(); return; }
    
    state.produtos = getCatalogo();

    let itensSelecionadosNomes = [];
    if(f.usarLivre){
      if(!f.itemLivre.trim()){ state.error = 'Especifique o item personalizado.'; render(); return; }
      itensSelecionadosNomes.push(f.itemLivre.trim());
    } else {
      if(!f.produtoIds || f.produtoIds.length === 0){ state.error = 'Selecione ao menos um item do catálogo.'; render(); return; }
      
      for(let id of f.produtoIds){
        let prod = state.produtos.find(prod => prod.id === id);
        if(prod){
          const stockVal = Number(prod.estoque !== null && prod.estoque !== undefined ? prod.estoque : prod.quantidade || 0);
          if(stockVal < f.quantidade){
            state.error = `Estoque insuficiente para o item "${prod.nome}"! Disponível: ${stockVal} unidades.`;
            render();
            return;
          }
        }
      }

      for(let id of f.produtoIds){
        let prod = state.produtos.find(prod => prod.id === id);
        if(prod){
          const stockVal = Number(prod.estoque !== null && prod.estoque !== undefined ? prod.estoque : prod.quantidade || 0);
          const novoEstoque = stockVal - f.quantidade;
          prod.estoque = novoEstoque;
          prod.quantidade = novoEstoque;
          itensSelecionadosNomes.push(prod.nome);
        }
      }
      saveCatalogo(state.produtos);
    }

    const itemNomeFinal = itensSelecionadosNomes.join(', ');

    const registro = {
      id: uid(), nome: p.nome.trim(), email: state.currentUserEmail, matricula: p.matricula.trim(),
      setor: p.setor.trim(), centroCusto: p.centroCusto.trim(), produtoIds: f.usarLivre ? [] : f.produtoIds,
      item: itemNomeFinal, quantidade: f.quantidade, urgencia: f.urgencia, motivo: f.motivo.trim(),
      status: 'pendente', dataCriacao: new Date().toISOString()
    };

    state.solicitacoes.unshift(registro);
    saveUserData();

    state.form.produtoIds = [];
    state.form.itemLivre = '';
    state.form.quantidade = 1;
    state.form.motivo = '';

    await enviarEmailAutomatico(registro);
  }

  // Reconstrói a interface principal conforme o estado atual da aplicação.
  function render(){
    app.innerHTML = '';
    if(!state.loaded) return;

    if(!state.currentUserEmail){
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
            <div>Sessão ativa: <strong>${state.currentUserEmail}</strong></div>
            <div class="dim" style="font-size:11.5px;">Sincronizado em tempo real com o controle de estoque.</div>
          </div>
        </div>
        <button class="secondary" id="btn-logout" style="font-size:12px;">Trocar de Usuário</button>
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

  // Cria a tela de identificação do colaborador e configura o login.
  function renderLoginModal(){
    const modal = elFrag(`
      <div class="login-overlay">
        <div class="login-card">
          <h2>Identificação do Colaborador</h2>
          <p class="dim" style="font-size:13.5px; margin:0 0 20px; line-height:1.4;">
            Informe seu e-mail corporativo para acessar o portal de suprimentos.
          </p>
          <div class="field">
            <label>Seu E-mail Corporativo <span style="color:var(--amber);">*</span></label>
            <input id="login-email" type="email" placeholder="nome@empresa.com" autofocus>
          </div>
          ${state.error ? `<div style="color:var(--danger); font-size:12.5px; margin-bottom:12px;">${state.error}</div>` : ''}
          <button class="primary" id="login-btn">Acessar Portal</button>
        </div>
      </div>
    `);

    app.appendChild(modal);

    const btn = modal.querySelector('#login-btn');
    const input = modal.querySelector('#login-email');
    const doLogin = () => loginUser(input.value);
    btn.onclick = doLogin;
    // Permite enviar o login pressionando a tecla Enter.
    input.onkeydown = (e) => { if(e.key === 'Enter') doLogin(); };
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
            <input id="p-nome" value="${p.nome}" placeholder="Seu nome completo">
          </div>
          <div class="field">
            <label>Matrícula / ID</label>
            <input id="p-matricula" value="${p.matricula}" placeholder="Ex: M-10293">
          </div>
          <div class="field">
            <label>E-mail (Chave da Conta)</label>
            <input value="${state.currentUserEmail}" readonly style="opacity:0.7; cursor:not-allowed;">
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label>Departamento / Setor</label>
            <input id="p-setor" value="${p.setor}" placeholder="Ex: Operações / RH">
          </div>
          <div class="field">
            <label>Centro de Custo</label>
            <input id="p-centro" value="${p.centroCusto}" placeholder="Ex: CC-3040">
          </div>
        </div>

        <hr style="border:none; border-top:1px solid var(--border); margin:20px 0;">

        <div class="field" style="margin-bottom:20px;">
          <button class="secondary" id="btn-ver-info" style="width:100%; background:var(--panel-2); border-color:var(--amber); color:var(--text); font-weight:600; padding:12px;">
            📋 Consultar Informações da Planilha (Abas: EPIs, ADM, Operação)
          </button>
        </div>

        <div class="field">
          <label>Selecione os Itens do Catálogo (Múltipla Escolha)</label>
          <input id="busca-item" placeholder="Filtrar item por nome ou SKU..." value="${state.busca}" style="margin-bottom:12px;">
          <div class="product-grid" id="product-grid"></div>
          <span id="toggle-outro" style="color:var(--steel); font-size:12px; cursor:pointer; text-decoration:underline;">
            ${f.usarLivre ? '← Voltar ao catálogo padronizado' : 'Item não listado? Descrever produto personalizado →'}
          </span>
        </div>

        <div id="custom-item-container">
          ${f.usarLivre ? `
            <div class="field" style="margin-top:12px;">
              <label>Descrição do Item Especial <span class="req">*</span></label>
              <input id="f-item-livre" value="${f.itemLivre}" placeholder="Informe especificações técnicas, modelo ou marca desejada">
            </div>
          ` : ''}
        </div>

        <div class="field-row" style="margin-top:16px;">
          <div class="field">
            <label>Quantidade por Item <span class="req">*</span></label>
            <input id="f-qtd" type="number" min="1" value="${f.quantidade}">
          </div>
          <div class="field">
            <label>Prioridade / Urgência</label>
            <select id="f-urgencia">
              <option value="baixa" ${f.urgencia==='baixa'?'selected':''}>Baixa - Rotina operacional</option>
              <option value="normal" ${f.urgencia==='normal'?'selected':''}>Normal - Necessidade regular</option>
              <option value="alta" ${f.urgencia==='alta'?'selected':''}>Alta - Impacto em atividades</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>Endereço / Observações</label>
          <textarea id="f-motivo" rows="2" placeholder="Descreva brevemente a necessidade destes produtos...">${f.motivo}</textarea>
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
          <h3>Meus Pedidos (${state.currentUserEmail})</h3>
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
                      <td style="font-weight:600;">${s.item}</td>
                      <td class="mono" style="font-weight:700;">${s.quantidade}</td>
                      <td class="dim">${s.setor || '—'}<br><small class="mono">${s.centroCusto || ''}</small></td>
                      <td><span class="badge urg-${s.urgencia}">${s.urgencia.toUpperCase()}</span></td>
                      <td><span class="badge ${s.status}">${s.status.toUpperCase()}</span></td>
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

  // Atualiza somente a grade de produtos, preservando o restante da tela.
  function renderGridOnly(){
    const grid = document.getElementById('product-grid');
    if(!grid) return;
    state.produtos = getCatalogo();
    const filtered = state.produtos.filter(p => !state.busca || p.nome.toLowerCase().includes(state.busca.toLowerCase()) || p.sku.toLowerCase().includes(state.busca.toLowerCase()));
    
    if(filtered.length === 0){ grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">Nenhum material encontrado.</div>`; return; }

    // Converte os produtos filtrados em cartões HTML individuais.
    grid.innerHTML = filtered.map(p => {
      const estVal = Number(p.estoque !== null && p.estoque !== undefined && !isNaN(p.estoque) ? p.estoque : p.quantidade || 0);
      const isSelected = state.form.produtoIds.includes(p.id);
      return `
        <div class="product-card ${isSelected ? 'selected' : ''}" data-id="${p.id}">
          <div class="cat">${p.categoria}</div>
          <h4>${p.nome}</h4>
          <div class="dim mono" style="font-size:11px; margin-top:4px;">SKU: ${p.sku} | Estoque: <strong style="color:${estVal > 5 ? 'var(--text)' : 'var(--danger)'};">${estVal}</strong></div>
        </div>
      `;
    }).join('');

    // Percorre os cartões para configurar a seleção de produtos.
    grid.querySelectorAll('.product-card').forEach(card => {
      // Alterna a seleção do produto clicado e atualiza a grade.
      card.onclick = () => {
        const id = card.dataset.id;
        state.form.usarLivre = false;
        const index = state.form.produtoIds.indexOf(id);
        if (index > -1) { state.form.produtoIds.splice(index, 1); } else { state.form.produtoIds.push(id); }
        renderGridOnly();
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
                <td style="font-weight:600;">${s.item}</td>
                <td class="mono" style="font-weight:700;">${s.quantidade}</td>
                <td class="dim">${s.setor || '—'}<br><small class="mono">${s.centroCusto || ''}</small></td>
                <td><span class="badge urg-${s.urgencia}">${s.urgencia.toUpperCase()}</span></td>
                <td><span class="badge ${s.status}">${s.status.toUpperCase()}</span></td>
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

    bindFormLive('f-qtd', 'quantidade', v => parseInt(v)||0);
    bindFormLive('f-motivo', 'motivo');
    bindFormLive('f-item-livre', 'itemLivre');

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
    // Alterna entre catálogo padrão e item personalizado.
    if(toggle) toggle.onclick = () => { 
      state.form.usarLivre = !state.form.usarLivre; 
      const container = content.querySelector('#custom-item-container');
      if(container){
        container.innerHTML = state.form.usarLivre ? `
          <div class="field" style="margin-top:12px;">
            <label>Descrição do Item Especial <span class="req">*</span></label>
            <input id="f-item-livre" value="${state.form.itemLivre}" placeholder="Informe especificações técnicas, modelo ou marca desejada">
          </div>
        ` : '';
        bindFormLive('f-item-livre', 'itemLivre');
      }
      toggle.textContent = state.form.usarLivre ? '← Voltar ao catálogo padronizado' : 'Item não listado? Descrever produto personalizado →';
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
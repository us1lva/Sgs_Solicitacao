/* efeitos.js — interações extras. Carregue DEPOIS do app.js. Não mexe no código do app. */
(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const app = document.getElementById('app');
  if(!app) return;

  /* Brilho que segue o mouse + inclinação 3D dos cartões */
  let tilted = null;
  addEventListener('pointermove', e => {
    if(reduce) return;
    root.style.setProperty('--mx', e.clientX + 'px');
    root.style.setProperty('--my', e.clientY + 'px');
    const card = e.target.closest && e.target.closest('.product-card');
    if(tilted && tilted !== card){ tilted.style.setProperty('--rx','0deg'); tilted.style.setProperty('--ry','0deg'); }
    tilted = card;
    if(!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--ry', ((px - .5) * 8) + 'deg');
    card.style.setProperty('--rx', ((.5 - py) * 8) + 'deg');
    card.style.setProperty('--gx', (px * 100) + '%');
    card.style.setProperty('--gy', (py * 100) + '%');
  }, { passive:true });

  /* Ondulação nos botões */
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('button');
    if(!b || b.disabled || reduce) return;
    const r = b.getBoundingClientRect(), d = Math.max(r.width, r.height) * 2;
    const s = document.createElement('span');
    s.className = 'fx-ripple';
    s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d/2}px;top:${e.clientY - r.top - d/2}px`;
    b.appendChild(s);
    setTimeout(() => s.remove(), 650);
  });

  /* Barra de progresso + pílula do pedido */
  const bar = document.createElement('div'); bar.id = 'fx-progress'; document.body.appendChild(bar);
  const cart = document.createElement('div'); cart.id = 'fx-cart'; document.body.appendChild(cart);
  cart.onclick = () => { const b = document.getElementById('submit-btn'); if(b) b.scrollIntoView({ behavior:'smooth', block:'center' }); };
  let lastCount = 0;

  function filled(id){ const n = document.getElementById(id); return !!(n && n.value.trim()); }
  function updateForm(){
    const hasForm = !!document.getElementById('submit-btn');
    bar.style.opacity = hasForm ? 1 : 0;
    cart.classList.toggle('show', false);
    if(!hasForm){ bar.style.width = '0'; lastCount = 0; return; }

    app.querySelectorAll('input:not([readonly]), textarea').forEach(n => n.classList.toggle('fx-filled', !!n.value.trim() && n.type !== 'number'));

    const itens = app.querySelectorAll('.product-card.selected').length;
    const livre = filled('f-item-livre');
    const checks = ['p-nome','f-cep','f-logradouro','f-numero','f-cidade','f-uf'].map(filled).concat([itens > 0 || livre]);
    bar.style.width = Math.round(checks.filter(Boolean).length / checks.length * 100) + '%';

    if(itens > 0){
      cart.innerHTML = `<b>${itens}</b> ${itens === 1 ? 'item no pedido' : 'itens no pedido'}`;
      cart.classList.add('show');
      if(itens !== lastCount){ cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump'); }
    }
    lastCount = itens;
  }
  document.addEventListener('input', updateForm);

  /* KPIs com contagem animada */
  const lastKpi = {};
  function animateKpi(el){
    const to = parseInt(el.textContent, 10);
    if(isNaN(to) || el.dataset.w === el.textContent) return;
    const from = lastKpi[el.id] || 0;
    if(from === to || reduce){ el.dataset.w = String(to); lastKpi[el.id] = to; return; }
    const t0 = performance.now(), dur = 700;
    el.classList.remove('fx-bump'); void el.offsetWidth; el.classList.add('fx-bump');
    (function step(t){
      const k = Math.min(1, (t - t0) / dur), v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      el.dataset.w = String(v); el.textContent = v; lastKpi[el.id] = v;
      if(k < 1 && el.isConnected) requestAnimationFrame(step);
    })(t0);
  }

  /* Confete ao enviar com sucesso */
  function confetti(){
    if(reduce) return;
    const cores = ['#FF7F11','#0284C7','#10B981','#A855F7','#F4F1EA'];
    for(let i = 0; i < 42; i++){
      const c = document.createElement('i');
      c.className = 'fx-confetti';
      c.style.cssText = `left:${Math.random()*100}vw;background:${cores[i % cores.length]};--x:${(Math.random()-.5)*240}px;--r:${Math.random()*900}deg;--d:${1.4+Math.random()*1.2}s;animation-delay:${Math.random()*.25}s`;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }

  /* Mostrar/ocultar senha */
  function addEyes(){
    app.querySelectorAll('.login-card input[type=password]:not(.fx-has-eye)').forEach(inp => {
      inp.classList.add('fx-has-eye');
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'fx-eye'; b.textContent = '👁'; b.title = 'Mostrar senha';
      b.style.top = inp.offsetTop + 'px'; b.style.height = inp.offsetHeight + 'px';
      b.onclick = () => { const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; b.textContent = show ? '🙈' : '👁'; b.title = show ? 'Ocultar senha' : 'Mostrar senha'; inp.focus(); };
      inp.parentElement.appendChild(b);
    });
  }

  /* Varredura a cada mudança de tela */
  let intro = false, queued = false, knownIds = null;
  function scan(){
    queued = false;
    const logged = !!app.querySelector('.content');
    if(!logged){ intro = false; knownIds = null; }
    else if(!intro){
      intro = true;
      app.querySelectorAll('.user-session-bar, .kpi-card, .panel').forEach((n, i) => { n.style.setProperty('--i', i); n.classList.add('fx-intro'); });
    }
    app.querySelectorAll('[id^="kpi-"]').forEach(animateKpi);

    const ban = app.querySelector('.status-banner.success:not([data-fx])');
    if(ban){ ban.dataset.fx = 1; if(!ban.textContent.includes('não pôde')) confetti(); }

    /* destaca a linha do pedido novo no histórico */
    const rows = [...app.querySelectorAll('#history-table-wrapper tbody tr')];
    const ids = rows.map(r => r.querySelector('[data-id]')?.dataset.id || r.textContent.slice(0, 60));
    if(knownIds && ids.length > knownIds.length && rows[0] && !ids.slice(0,1).every(i => knownIds.includes(i))) rows[0].classList.add('fx-newrow');
    if(logged) knownIds = ids;

    document.querySelectorAll('.modal-body tbody tr').forEach((r, i) => r.style.setProperty('--r', Math.min(i, 30)));
    addEyes();
    updateForm();
  }
  new MutationObserver(() => { if(!queued){ queued = true; requestAnimationFrame(scan); } })
    .observe(document.body, { childList:true, subtree:true });
  scan();

  /* Chacoalha o botão quando o formulário volta com erro */
  new MutationObserver(() => {
    const e = document.getElementById('form-error-box');
    if(e && e.textContent.trim()) e.scrollIntoView({ behavior:'smooth', block:'center' });
  }).observe(app, { childList:true, subtree:true });
})();

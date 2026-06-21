// =========================================================
// PensePapel — catalogo.js
// Renderiza a grade de produtos, busca, filtros e modal de detalhe
// =========================================================

let filtroAtual = 'todos';
let limiteExibicao = null; // null = mostra todos; usado na home para mostrar só uma amostra

function estrelasHtml(nota){
  const cheias = '★'.repeat(nota);
  const vazias = '☆'.repeat(5 - nota);
  return cheias + vazias;
}

function svgSeloBio(){
  return `
  <svg viewBox="0 0 70 70" xmlns="http://www.w3.org/2000/svg" aria-label="Produto biodegradável">
    <circle cx="35" cy="35" r="32" fill="#3D7A5C" stroke="#FDF8F1" stroke-width="2.5" transform="rotate(-6 35 35)"/>
    <path d="M35 18c6 4 10 10 10 16 0 6-4.5 10.5-10 10.5S25 40 25 34c0-6 4-12 10-16z" fill="#FDF8F1" opacity=".95"/>
    <path d="M35 24v18M35 24c-4 3-6 7-6 10M35 24c4 3 6 7 6 10" stroke="#3D7A5C" stroke-width="1.4" fill="none"/>
    <text x="35" y="58" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="6.4" fill="#FDF8F1" font-weight="700">BIODEGRADÁVEL</text>
  </svg>`;
}

function cartaoProdutoHtml(p){
  const tagFlutuante = p.selo === 'vendido'
    ? `<span class="tag-flutuante tag-vendido">Mais vendido</span>`
    : p.selo === 'lancamento'
      ? `<span class="tag-flutuante tag-lancamento">Lançamento</span>`
      : '';

  const estoqueClasse = p.estoque <= 10 ? 'estoque-baixo' : '';
  const estoqueTexto = p.estoque <= 10 ? `Só ${p.estoque} no estoque` : `${p.estoque} em estoque`;

  return `
    <div class="card" data-categoria="${p.categoria}" data-nome="${p.nome.toLowerCase()}" data-id="${p.id}">
      <div class="card-foto">
        <div class="fita"></div>
        ${tagFlutuante}
        <img src="${p.imagem}" alt="${p.nome}" loading="lazy">
        <div class="selo-bio">${svgSeloBio()}</div>
      </div>
      <div class="card-corpo">
        <span class="card-cat">${p.categoriaNome}</span>
        <h3>${p.nome}</h3>
        <div class="estrelas" aria-label="Avaliação ${p.avaliacao} de 5">${estrelasHtml(p.avaliacao)}</div>
        <div class="card-preco-linha">
          <span class="preco">${formatarPreco(p.preco)}</span>
          <span class="estoque-info ${estoqueClasse}">${estoqueTexto}</span>
        </div>
        <div class="card-botoes">
          <button class="btn-ver" onclick="abrirModalProduto(${p.id})">Ver detalhes</button>
          <button class="btn-add" id="add-${p.id}" onclick="adicionarRapido(${p.id}, this)">Adicionar</button>
        </div>
      </div>
    </div>
  `;
}

function renderizarProdutos(){
  const grade = document.getElementById('gradeProdutos');
  if(!grade) return;

  const termoBusca = (document.getElementById('campoBusca')?.value || '').toLowerCase().trim();

  let lista = PRODUTOS.filter(p => {
    const passaCategoria = filtroAtual === 'todos' || p.categoria === filtroAtual;
    const passaBusca = !termoBusca || p.nome.toLowerCase().includes(termoBusca) || p.material.toLowerCase().includes(termoBusca);
    return passaCategoria && passaBusca;
  });

  if(limiteExibicao){
    lista = lista.slice(0, limiteExibicao);
  }

  const semResultado = document.getElementById('semResultado');

  if(lista.length === 0){
    grade.innerHTML = '';
    if(semResultado) semResultado.style.display = 'block';
    return;
  }

  if(semResultado) semResultado.style.display = 'none';
  grade.innerHTML = lista.map(cartaoProdutoHtml).join('');
}

function filtrarCategoria(categoria, botaoClicado){
  filtroAtual = categoria;
  document.querySelectorAll('.filtros button').forEach(b => b.classList.remove('selecionado'));
  botaoClicado?.classList.add('selecionado');
  renderizarProdutos();
}

function buscarProdutos(){
  renderizarProdutos();
}

function adicionarRapido(produtoId, botao){
  adicionarAoCarrinho(produtoId, 1);
  botao.textContent = '✓ Adicionado';
  botao.classList.add('feito');
  setTimeout(() => {
    botao.textContent = 'Adicionar';
    botao.classList.remove('feito');
  }, 1400);
}

// ---------- modal de detalhe ----------

let produtoModalAtual = null;
let qtdModal = 1;

function abrirModalProduto(produtoId){
  const p = PRODUTOS.find(x => x.id === produtoId);
  if(!p) return;

  produtoModalAtual = p;
  qtdModal = 1;

  const caracteristicas = [
    p.material,
    'Embalagem mínima e reciclável',
    'Certificação de origem sustentável',
    `Avaliação ${p.avaliacao} de 5 estrelas`
  ];

  document.getElementById('conteudoModal').innerHTML = `
    <div class="modal-grade">
      <div class="modal-foto">
        <img src="${p.imagem}" alt="${p.nome}">
      </div>
      <div class="modal-info">
        <span class="card-cat">${p.categoriaNome}</span>
        <h2>${p.nome}</h2>
        <div class="estrelas">${estrelasHtml(p.avaliacao)}</div>
        <p class="desc">${p.descricao}</p>
        <ul class="lista-caracteristicas">
          ${caracteristicas.map(c => `<li><span class="bolinha"></span>${c}</li>`).join('')}
        </ul>
        <div class="modal-preco">${formatarPreco(p.preco)}</div>
        <div class="seletor-qtd">
          <button onclick="alterarQtdModal(-1)" aria-label="Diminuir">−</button>
          <span id="qtdModalValor">1</span>
          <button onclick="alterarQtdModal(1)" aria-label="Aumentar">+</button>
        </div>
        <button class="btn-modal-add" id="btnModalAdd" onclick="confirmarAdicaoModal()">Adicionar ao carrinho</button>
      </div>
    </div>
  `;

  document.getElementById('modalProduto').classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function alterarQtdModal(delta){
  qtdModal = Math.max(1, qtdModal + delta);
  document.getElementById('qtdModalValor').textContent = qtdModal;
}

function confirmarAdicaoModal(){
  if(!produtoModalAtual) return;
  adicionarAoCarrinho(produtoModalAtual.id, qtdModal);

  const botao = document.getElementById('btnModalAdd');
  botao.textContent = '✓ Adicionado ao carrinho';
  botao.classList.add('feito');
  setTimeout(() => {
    fecharModalProduto();
  }, 900);
}

function fecharModalProduto(){
  document.getElementById('modalProduto').classList.remove('aberto');
  document.body.style.overflow = '';
  produtoModalAtual = null;
}

document.addEventListener('DOMContentLoaded', renderizarProdutos);

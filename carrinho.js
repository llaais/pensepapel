const CHAVE_CARRINHO = 'pensepapel_carrinho';

function obterCarrinho(){
  try{
    const dados = localStorage.getItem(CHAVE_CARRINHO);
    return dados ? JSON.parse(dados) : [];
  }catch(e){
    return [];
  }
}

function salvarCarrinho(carrinho){
  localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  atualizarContadorCarrinho();
}

function adicionarAoCarrinho(produtoId, quantidade = 1){
  const produto = PRODUTOS.find(p => p.id === produtoId);
  if(!produto) return;

  const carrinho = obterCarrinho();
  const existente = carrinho.find(item => item.id === produtoId);

  if(existente){
    existente.quantidade += quantidade;
  }else{
    carrinho.push({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      imagem: produto.imagem,
      quantidade: quantidade
    });
  }

  salvarCarrinho(carrinho);
  mostrarToast(`"${produto.nome}" adicionado ao carrinho`);
}

function removerDoCarrinho(produtoId){
  let carrinho = obterCarrinho();
  carrinho = carrinho.filter(item => item.id !== produtoId);
  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function alterarQuantidade(produtoId, delta){
  const carrinho = obterCarrinho();
  const item = carrinho.find(i => i.id === produtoId);
  if(!item) return;

  item.quantidade += delta;

  if(item.quantidade <= 0){
    removerDoCarrinho(produtoId);
    return;
  }

  salvarCarrinho(carrinho);
  renderizarCarrinho();
}

function totalItensCarrinho(){
  return obterCarrinho().reduce((soma, item) => soma + item.quantidade, 0);
}

function totalValorCarrinho(){
  return obterCarrinho().reduce((soma, item) => soma + (item.preco * item.quantidade), 0);
}

function atualizarContadorCarrinho(){
  const contadores = document.querySelectorAll('.contador-carrinho');
  const total = totalItensCarrinho();
  contadores.forEach(c => {
    c.textContent = total;
    c.style.display = total > 0 ? 'flex' : 'none';
  });
}

function formatarPreco(valor){
  return valor.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
}

function renderizarCarrinho(){
  const lista = document.getElementById('listaCarrinho');
  const rodape = document.getElementById('rodapeCarrinho');
  if(!lista) return;

  const carrinho = obterCarrinho();

  if(carrinho.length === 0){
    lista.innerHTML = `
      <div class="carrinho-vazio">
        <div class="emoji-vazio">📦</div>
        <p>Seu carrinho está vazio.<br>Que tal dar uma olhada nos nossos produtos?</p>
      </div>
    `;
    if(rodape){
      rodape.querySelector('.linha-total span:last-child').textContent = formatarPreco(0);
      rodape.querySelector('.btn-finalizar').setAttribute('disabled','disabled');
    }
    return;
  }

  lista.innerHTML = carrinho.map(item => `
    <div class="item-carrinho">
      <img src="${item.imagem}" alt="${item.nome}" loading="lazy">
      <div class="item-info">
        <h4>${item.nome}</h4>
        <div class="item-qtd-controle">
          <button onclick="alterarQuantidade(${item.id}, -1)" aria-label="Diminuir quantidade">−</button>
          <span>${item.quantidade}</span>
          <button onclick="alterarQuantidade(${item.id}, 1)" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <div class="item-preco-remove">
        <span class="preco">${formatarPreco(item.preco * item.quantidade)}</span>
        <button class="remover-item" onclick="removerDoCarrinho(${item.id})">Remover</button>
      </div>
    </div>
  `).join('');

  if(rodape){
    rodape.querySelector('.linha-total span:last-child').textContent = formatarPreco(totalValorCarrinho());
    rodape.querySelector('.btn-finalizar').removeAttribute('disabled');
  }
}

function abrirCarrinho(){
  renderizarCarrinho();
  document.getElementById('carrinhoFundo')?.classList.add('aberto');
  document.getElementById('carrinhoPainel')?.classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function fecharCarrinho(){
  document.getElementById('carrinhoFundo')?.classList.remove('aberto');
  document.getElementById('carrinhoPainel')?.classList.remove('aberto');
  document.body.style.overflow = '';
}

function irParaCheckout(){
  if(totalItensCarrinho() === 0) return;
  window.location.href = 'checkout.html';
}

let temporizadorToast = null;
function mostrarToast(mensagem){
  let toast = document.getElementById('toastGlobal');
  if(!toast){
    toast = document.createElement('div');
    toast.id = 'toastGlobal';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `✓ ${mensagem}`;
  toast.classList.add('mostrar');

  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(() => {
    toast.classList.remove('mostrar');
  }, 2600);
}

document.addEventListener('DOMContentLoaded', atualizarContadorCarrinho);
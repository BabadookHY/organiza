// Seleciona elementos
const form = document.getElementById('form-tarefa');
const tabelaTarefas = document.getElementById('tabela-tarefas').querySelector('tbody');

// Adiciona evento ao formulário
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Pega os valores do formulário
  const desc = document.getElementById('tarefa').value;
  const responsavel = document.getElementById('responsavel').value;
  const prazo = document.getElementById('prazo').value;
  const status = document.getElementById('status').value;

  // Cria nova linha
  const novaLinha = document.createElement('tr');

  novaLinha.innerHTML = `
    <td contenteditable="true">${desc}</td>
    <td contenteditable="true">${responsavel}</td>
    <td contenteditable="true">${prazo}</td>
    <td contenteditable="true">${status}</td>
    <td><button class="excluir">Excluir</button></td>
  `;

  // Adiciona a linha na tabela
  tabelaTarefas.appendChild(novaLinha);

  // Limpa os campos do formulário
  form.reset();
});

// Evento de clique para excluir tarefas
tabelaTarefas.addEventListener('click', function (e) {
  if (e.target.classList.contains('excluir')) {
    const linha = e.target.closest('tr');
    linha.remove();
  }
});

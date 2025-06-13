// Referências Firebase
const db = firebase.database();

// Elementos DOM
const form = document.getElementById('form-tarefa');
const tabelaTarefas = document.getElementById('tabela-tarefas').querySelector('tbody');
const selectEquipe = document.getElementById('select-equipe');
const tabelaEquipesBody = document.getElementById('tabela-equipes').querySelector('tbody');

// Função para carregar equipes do Firebase e popular select e tabela
function carregarEquipes() {
  db.ref('equipes').on('value', snapshot => {
    const equipes = snapshot.val();
    selectEquipe.innerHTML = '<option value="" disabled selected>Selecione a equipe</option>';
    tabelaEquipesBody.innerHTML = '';

    for (const equipeId in equipes) {
      const equipe = equipes[equipeId];

      // Popula o select
      const option = document.createElement('option');
      option.value = equipeId;
      option.textContent = equipe.nome;
      selectEquipe.appendChild(option);

      // Popula a tabela de equipes
      const tr = document.createElement('tr');

      // Membros viram string separados por vírgula
      const membrosStr = equipe.membros ? equipe.membros.join(', ') : '';

      tr.innerHTML = `
        <td>${equipe.nome}</td>
        <td contenteditable="true" data-equipeid="${equipeId}">${membrosStr}</td>
      `;

      tabelaEquipesBody.appendChild(tr);
    }
  });
}

// Função para carregar tarefas da equipe selecionada
function carregarTarefas(equipeId) {
  if (!equipeId) {
    tabelaTarefas.innerHTML = '';
    return;
  }

  db.ref(`equipes/${equipeId}/tarefas`).on('value', snapshot => {
    tabelaTarefas.innerHTML = '';
    const tarefas = snapshot.val();

    if (!tarefas) return;

    for (const tarefaId in tarefas) {
      const t = tarefas[tarefaId];
      const tr = document.createElement('tr');
      tr.dataset.tarefaId = tarefaId;

      tr.innerHTML = `
        <td contenteditable="true">${t.descricao}</td>
        <td contenteditable="true">${t.responsavel}</td>
        <td contenteditable="true">${t.prazo}</td>
        <td contenteditable="true">${t.status}</td>
        <td><button class="excluir">Excluir</button></td>
      `;

      tabelaTarefas.appendChild(tr);
    }
  });
}

// Evento ao mudar seleção da equipe
selectEquipe.addEventListener('change', () => {
  carregarTarefas(selectEquipe.value);
});

// Evento ao enviar formulário para adicionar tarefa
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const descricao = document.getElementById('tarefa').value.trim();
  const responsavel = document.getElementById('responsavel').value.trim();
  const prazo = document.getElementById('prazo').value;
  const status = document.getElementById('status').value;
  const equipeId = selectEquipe.value;

  if (!equipeId) {
    alert('Selecione uma equipe!');
    return;
  }

  // Cria uma nova tarefa no Firebase
  const novaTarefaRef = db.ref(`equipes/${equipeId}/tarefas`).push();

  novaTarefaRef.set({
    descricao,
    responsavel,
    prazo,
    status
  });

  form.reset();
});

// Evento para excluir tarefa
tabelaTarefas.addEventListener('click', e => {
  if (e.target.classList.contains('excluir')) {
    const tr = e.target.closest('tr');
    const tarefaId = tr.dataset.tarefaId;
    const equipeId = selectEquipe.value;

    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      db.ref(`equipes/${equipeId}/tarefas/${tarefaId}`).remove();
    }
  }
});

// Carregar equipes na inicialização
carregarEquipes();

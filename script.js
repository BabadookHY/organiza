const db = firebase.database();

const form = document.getElementById('form-tarefa');
const tabelaTarefas = document.getElementById('tabela-tarefas').querySelector('tbody');
const selectEquipe = document.getElementById('select-equipe');
const tabelaEquipesBody = document.getElementById('tabela-equipes').querySelector('tbody');

// Carrega as equipes e atualiza o select e tabela
function carregarEquipes() {
  db.ref('equipes').on('value', snapshot => {
    const equipes = snapshot.val() || {};
    selectEquipe.innerHTML = '<option value="" disabled selected>Selecione a equipe</option>';
    tabelaEquipesBody.innerHTML = '';

    let primeiraEquipeId = null;

    for (const equipeId in equipes) {
      const equipe = equipes[equipeId];

      const option = document.createElement('option');
      option.value = equipeId;
      option.textContent = equipe.nome;
      selectEquipe.appendChild(option);

      const membrosStr = equipe.membros ? equipe.membros.join(', ') : '';
      const representante = equipe.representante || '';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${equipe.nome}</td>
        <td contenteditable="true" data-tipo="membros" data-equipeid="${equipeId}">${membrosStr}</td>
        <td contenteditable="true" data-tipo="representante" data-equipeid="${equipeId}">${representante}</td>
      `;
      tabelaEquipesBody.appendChild(tr);
    }

    if (Object.keys(equipes).length > 0) {
      const primeiraId = Object.keys(equipes)[0];
      selectEquipe.value = primeiraId;
      carregarTarefas(primeiraId);
    } else {
      tabelaTarefas.innerHTML = '';
    }
  });
}

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

selectEquipe.addEventListener('change', () => {
  carregarTarefas(selectEquipe.value);
});

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

  const novaTarefaRef = db.ref(`equipes/${equipeId}/tarefas`).push();
  novaTarefaRef.set({ descricao, responsavel, prazo, status });

  form.reset();
});

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

// Edição dos membros e representantes
tabelaEquipesBody.addEventListener('blur', (e) => {
  const cell = e.target;
  const equipeId = cell.dataset.equipeid;
  const tipo = cell.dataset.tipo;
  const texto = cell.innerText.trim();

  if (!equipeId || !tipo) return;

  if (tipo === 'membros') {
    const listaMembros = texto.split(',').map(m => m.trim()).filter(Boolean);
    db.ref(`equipes/${equipeId}/membros`).set(listaMembros);
  } else if (tipo === 'representante') {
    db.ref(`equipes/${equipeId}/representante`).set(texto);
  }
}, true);

// Criação de nova equipe
document.getElementById('form-equipe').addEventListener('submit', (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome-equipe').value.trim();
  const integrantesStr = document.getElementById('integrantes-equipe').value.trim();
  const representante = document.getElementById('representante-equipe').value.trim();

  if (!nome || !integrantesStr) {
    alert("Preencha o nome da equipe e os integrantes.");
    return;
  }

  const membros = integrantesStr.split(',').map(m => m.trim()).filter(Boolean);

  const novaEquipeRef = db.ref('equipes').push();
  novaEquipeRef.set({ nome, membros, representante });

  e.target.reset();
});

carregarEquipes();

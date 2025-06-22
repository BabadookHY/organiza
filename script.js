const firebaseConfig = {
  apiKey: "AIzaSyAlsfMXLxQt5v7awej24qZO_HMn6Pa2NZE",
  authDomain: "organiza-d4214.firebaseapp.com",
  databaseURL: "https://organiza-d4214-default-rtdb.firebaseio.com",
  projectId: "organiza-d4214",
  storageBucket: "organiza-d4214.appspot.com",
  messagingSenderId: "1035574288615",
  appId: "1:1035574288615:web:de65023b21c335a1a20242",
  measurementId: "G-TM90W9D7NQ"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Equipes iniciais (opcional)
const equipesIniciais = [
  { nome: "Planejamento", membros: ["Bruno", "Eduarda F", "Anahlince", "Mikaelly"], representante: "Bruno" },
  { nome: "Network", membros: ["Iris", "Raziel", "Charles", "Gabriel", "Gabi", "Fabricio"], representante: "Iris" },
  { nome: "Decoração", membros: ["Ana", "Elaine", "João", "Eduarda H", "David", "Heloa"], representante: "Ana" },
  { nome: "Coffee Break", membros: ["Ester", "Madu", "Julia", "Daiane", "Claudilene", "Jhemyson", "Werillon", "Guilherme"], representante: "Julia" }
];

function inserirEquipesIniciais() {
  db.ref("equipes").once("value", (snapshot) => {
    if (!snapshot.exists()) {
      equipesIniciais.forEach(equipe => db.ref("equipes").push(equipe));
    }
  });
}
inserirEquipesIniciais();

// DOM elements
const formEquipe = document.getElementById('form-equipe');
const tabelaEquipesBody = document.querySelector('#tabela-equipes tbody');
const selectEquipe = document.getElementById('select-equipe');

const formTarefa = document.getElementById('form-tarefa');
const tabelaTarefas = document.querySelector('#tabela-tarefas tbody');

const formCronograma = document.getElementById('form-cronograma');
const tabelaCronograma = document.querySelector('#tabela-cronograma tbody');

// Carregar equipes e popular select e tabela
function carregarEquipes() {
  db.ref('equipes').on('value', snapshot => {
    const equipes = snapshot.val() || {};
    tabelaEquipesBody.innerHTML = '';
    selectEquipe.innerHTML = '<option value="" disabled selected>Selecione a equipe</option>';

    let primeiraEquipeId = null;
    for (const id in equipes) {
      const equipe = equipes[id];
      const membrosStr = equipe.membros ? equipe.membros.join(', ') : '';
      const representante = equipe.representante || '';

      // Option select
      const option = document.createElement('option');
      option.value = id;
      option.textContent = equipe.nome;
      selectEquipe.appendChild(option);

      // Tabela equipes
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${equipe.nome}</td>
        <td contenteditable="true" data-tipo="membros" data-id="${id}">${membrosStr}</td>
        <td contenteditable="true" data-tipo="representante" data-id="${id}">${representante}</td>
        <td><button class="excluir-equipe" data-id="${id}">Excluir</button></td>
      `;

      // Atualizar membros e representante no blur
      tr.querySelectorAll('[contenteditable]').forEach(cell => {
        cell.addEventListener('blur', e => {
          const tipo = e.target.dataset.tipo;
          const id = e.target.dataset.id;
          const valor = e.target.textContent.trim();

          if (tipo === 'membros') {
            const membros = valor.split(',').map(m => m.trim()).filter(Boolean);
            db.ref(`equipes/${id}/membros`).set(membros);
          } else if (tipo === 'representante') {
            db.ref(`equipes/${id}/representante`).set(valor);
          }
        });
      });

      tabelaEquipesBody.appendChild(tr);

      if (!primeiraEquipeId) primeiraEquipeId = id;
    }

    // Seleciona primeira equipe para carregar tarefas
    if (primeiraEquipeId) {
      selectEquipe.value = primeiraEquipeId;
      carregarTarefas(primeiraEquipeId);
    } else {
      tabelaTarefas.innerHTML = '';
    }
  });
}

// Excluir equipe
tabelaEquipesBody.addEventListener('click', e => {
  if (e.target.classList.contains('excluir-equipe')) {
    const id = e.target.dataset.id;
    if (confirm('Tem certeza que deseja excluir essa equipe e todas as tarefas dela?')) {
      db.ref(`equipes/${id}`).remove();
    }
  }
});

// Carregar tarefas da equipe selecionada
function carregarTarefas(equipeId) {
  if (!equipeId) {
    tabelaTarefas.innerHTML = '';
    return;
  }
  db.ref(`equipes/${equipeId}/tarefas`).on('value', snapshot => {
    tabelaTarefas.innerHTML = '';
    const tarefas = snapshot.val() || {};

    for (const tarefaId in tarefas) {
      const t = tarefas[tarefaId];
      const tr = document.createElement('tr');
      tr.dataset.tarefaId = tarefaId;

      tr.innerHTML = `
        <td contenteditable="true">${t.descricao}</td>
        <td contenteditable="true">${t.responsavel}</td>
        <td contenteditable="true">${t.prazo}</td>
        <td contenteditable="true">${t.status}</td>
        <td><button class="excluir-tarefa">Excluir</button></td>
      `;

      // Atualizar tarefa
      tr.querySelectorAll('[contenteditable]').forEach((cell, i) => {
        cell.addEventListener('blur', () => {
          const campos = ['descricao', 'responsavel', 'prazo', 'status'];
          const campo = campos[i];
          const novoValor = cell.textContent.trim();
          db.ref(`equipes/${equipeId}/tarefas/${tarefaId}/${campo}`).set(novoValor);
        });
      });

      tabelaTarefas.appendChild(tr);
    }
  });
}

selectEquipe.addEventListener('change', () => {
  carregarTarefas(selectEquipe.value);
});

// nova equipe
formEquipe.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('nome-equipe').value.trim();
  const integrantesStr = document.getElementById('integrantes-equipe').value.trim();
  const representante = document.getElementById('representante-equipe').value.trim();

  if (!nome || !integrantesStr) {

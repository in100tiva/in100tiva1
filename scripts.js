// Função para calcular o valor proporcional aos dias trabalhados
function calcularValor(diasTrabalhados, valorFixoContrato) {
    return (valorFixoContrato / 30) * diasTrabalhados;
  }
  
  // Função para exibir mensagens de feedback
  function exibirMensagem(tipo, texto) {
    const mensagemDiv = document.getElementById('mensagem');
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.textContent = texto;
    mensagemDiv.style.display = 'block';
    setTimeout(() => {
      mensagemDiv.style.display = 'none';
    }, 3000);
  }
  
  // Função para adicionar um prestador ao LocalStorage
  function adicionarPrestador(nome, valorFixo) {
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const novoPrestador = {
      id: Date.now().toString(),
      nome: nome,
      valorFixoContrato: parseFloat(valorFixo),
      contratos: []
    };
    prestadores.push(novoPrestador);
    localStorage.setItem('prestadores', JSON.stringify(prestadores));
    atualizarSelectPrestadores();
    atualizarSelectHistorico();
    atualizarSelectRelatorio();
    gerarResumo();
    exibirMensagem('sucesso', 'Prestador adicionado com sucesso!');
  }
  
  // Função para adicionar um contrato ao prestador selecionado
  function adicionarContrato(prestadorId, cliente, diasTrabalhados, dataContrato) {
    if (!prestadorId || !cliente || !diasTrabalhados || !dataContrato) {
      exibirMensagem('erro', 'Por favor, preencha todos os campos.');
      return;
    }
  
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const prestador = prestadores.find(p => p.id === prestadorId);
    const novoContrato = {
      cliente: cliente,
      diasTrabalhados: parseInt(diasTrabalhados, 10),
      dataContrato: dataContrato
    };
    prestador.contratos.push(novoContrato);
    localStorage.setItem('prestadores', JSON.stringify(prestadores));
    
    // Resetar os campos
    document.getElementById('prestador').value = '';
    document.getElementById('cliente').value = '';
    document.getElementById('dias-trabalhados').value = '';
    document.getElementById('data-contrato').value = '';
  
    gerarResumo();
    exibirMensagem('sucesso', 'Contrato adicionado com sucesso!');
  }
  
  // Função para atualizar o select de prestadores
  function atualizarSelectPrestadores() {
    const prestadorSelect = document.getElementById('prestador');
    prestadorSelect.innerHTML = '<option value="">Nenhum</option>';
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    prestadores.forEach(prestador => {
      const option = document.createElement('option');
      option.value = prestador.id;
      option.textContent = prestador.nome;
      prestadorSelect.appendChild(option);
    });
  }
  
  // Função para atualizar o select de clientes
  function atualizarSelectClientes() {
    const clienteSelect = document.getElementById('cliente');
    clienteSelect.innerHTML = '<option value="">Nenhum</option>';
    fetch('data/clientes.json')
      .then(response => response.json())
      .then(clientes => {
        clientes.forEach(cliente => {
          const option = document.createElement('option');
          option.value = cliente.nome;
          option.textContent = cliente.nome;
          clienteSelect.appendChild(option);
        });
      });
  }
  
  // Função para atualizar o select de prestadores no histórico
  function atualizarSelectHistorico() {
    const prestadorHistoricoSelect = document.getElementById('prestador-historico');
    prestadorHistoricoSelect.innerHTML = '<option value="">Nenhum</option>';
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    prestadores.forEach(prestador => {
      const option = document.createElement('option');
      option.value = prestador.id;
      option.textContent = prestador.nome;
      prestadorHistoricoSelect.appendChild(option);
    });
  }
  
  // Função para atualizar o select de prestadores e clientes no relatório
  function atualizarSelectRelatorio() {
    const prestadorRelatorioSelect = document.getElementById('relatorio-prestador');
    const clienteRelatorioSelect = document.getElementById('relatorio-cliente');
    prestadorRelatorioSelect.innerHTML = '<option value="">Todos</option>';
    clienteRelatorioSelect.innerHTML = '<option value="">Todos</option>';
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
  
    prestadores.forEach(prestador => {
      const option = document.createElement('option');
      option.value = prestador.id;
      option.textContent = prestador.nome;
      prestadorRelatorioSelect.appendChild(option);
    });
  
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.nome;
      option.textContent = cliente.nome;
      clienteRelatorioSelect.appendChild(option);
    });
  }
  
  // Função para gerar a página de extrato
  function gerarExtrato(prestadorId) {
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const prestador = prestadores.find(p => p.id === prestadorId);
    if (!prestador) return;
  
    let extrato = `
      <div class="invoice-container">
        <h1>Extrato de Serviços</h1>
        <div class="invoice-header">
          <p><strong>Prestador:</strong> ${prestador.nome}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Data</th>
              <th>Dias Trabalhados</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
    `;
  
    let total = 0;
    prestador.contratos.forEach(contrato => {
      let valor = calcularValor(contrato.diasTrabalhados, prestador.valorFixoContrato);
      total += valor;
      extrato += `
        <tr>
          <td>${contrato.cliente}</td>
          <td>${contrato.dataContrato}</td>
          <td>${contrato.diasTrabalhados}</td>
          <td>R$${valor.toFixed(2)}</td>
        </tr>
      `;
    });
  
    extrato += `
          </tbody>
        </table>
        <div class="invoice-total">
          <p><strong>Total a ser pago: R$${total.toFixed(2)}</strong></p>
        </div>
      </div>
    `;
  
    let novaPagina = window.open();
    novaPagina.document.write(`
      <html>
        <head>
          <title>Extrato de Serviços</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background-color: #121212;
              color: #fff;
            }
            .invoice-container {
              background: #1e1e1e;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
              padding: 20px;
              max-width: 800px;
              width: 100%;
              margin: 20px;
              color: #e0e0e0;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .invoice-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .invoice-table th, .invoice-table td {
              border: 1px solid #333333;
              padding: 10px;
              text-align: left;
            }
            .invoice-table th {
              background-color: #1a73e8;
              color: white;
            }
            .invoice-total {
              text-align: right;
              font-size: 1.2em;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          ${extrato}
        </body>
      </html>
    `);
    novaPagina.document.close();
  }
  
  // Função para exibir o histórico de contratos
  function exibirHistorico(prestadorId) {
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const prestador = prestadores.find(p => p.id === prestadorId);
    const historicoContainer = document.getElementById('historico-prestador');
    historicoContainer.innerHTML = '';
  
    if (!prestador) return;
  
    prestador.contratos.forEach((contrato, index) => {
      const valor = calcularValor(contrato.diasTrabalhados, prestador.valorFixoContrato);
      const card = document.createElement('div');
      card.className = 'historico-card';
      card.innerHTML = `
        <h3>Cliente: ${contrato.cliente}</h3>
        <p>Data: ${contrato.dataContrato}</p>
        <p>Dias Trabalhados: ${contrato.diasTrabalhados}</p>
        <p>Valor: R$${valor.toFixed(2)}</p>
        <button onclick="deletarContrato('${prestador.id}', ${index})">Deletar</button>
      `;
      historicoContainer.appendChild(card);
    });
  }
  
  // Função para deletar um contrato
  function deletarContrato(prestadorId, contratoIndex) {
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const prestador = prestadores.find(p => p.id === prestadorId);
    if (!prestador) return;
  
    prestador.contratos.splice(contratoIndex, 1);
    localStorage.setItem('prestadores', JSON.stringify(prestadores));
    exibirHistorico(prestadorId);
    gerarResumo();
  }
  
  // Função para gerar um relatório personalizado
  function gerarRelatorio() {
    const prestadorId = document.getElementById('relatorio-prestador').value;
    const clienteNome = document.getElementById('relatorio-cliente').value;
    const periodo = document.getElementById('relatorio-periodo').value;
  
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const relatorioContainer = document.getElementById('relatorio-resultados');
    relatorioContainer.innerHTML = '';
  
    let contratosFiltrados = [];
  
    prestadores.forEach(prestador => {
      if (prestadorId === '' || prestador.id === prestadorId) {
        prestador.contratos.forEach(contrato => {
          if ((clienteNome === '' || contrato.cliente === clienteNome) &&
              (periodo === '' || contrato.dataContrato === periodo)) {
            contratosFiltrados.push({
              prestador: prestador.nome,
              cliente: contrato.cliente,
              diasTrabalhados: contrato.diasTrabalhados,
              dataContrato: contrato.dataContrato,
              valor: calcularValor(contrato.diasTrabalhados, prestador.valorFixoContrato)
            });
          }
        });
      }
    });
  
    contratosFiltrados.forEach(contrato => {
      const card = document.createElement('div');
      card.className = 'relatorio-card';
      card.innerHTML = `
        <h3>Prestador: ${contrato.prestador}</h3>
        <p>Cliente: ${contrato.cliente}</p>
        <p>Data: ${contrato.dataContrato}</p>
        <p>Dias Trabalhados: ${contrato.diasTrabalhados}</p>
        <p>Valor: R$${contrato.valor.toFixed(2)}</p>
      `;
      relatorioContainer.appendChild(card);
    });
  }
  
  // Dados iniciais dos prestadores de serviço
  const prestadoresIniciais = [
    { id: "1", nome: "Lorena", valorFixoContrato: 595, contratos: [] },
    { id: "2", nome: "Leticia", valorFixoContrato: 420, contratos: [] },
    { id: "3", nome: "Deived", valorFixoContrato: 682, contratos: [] },
    { id: "4", nome: "Josue", valorFixoContrato: 548, contratos: [] },
    { id: "5", nome: "Matheus", valorFixoContrato: 1205, contratos: [] },
    { id: "6", nome: "Maria Vitoria", valorFixoContrato: 464, contratos: [] },
    { id: "7", nome: "Rodrigo", valorFixoContrato: 510, contratos: [] }
  ];
  
  // Dados iniciais dos clientes de serviço
  const clientesIniciais = [
    { id: "1", nome: "Azulli Di Mare", valorContrato: 2500.00, dataInicio: "Maio" },
    { id: "2", nome: "Laudo e Vistoria", valorContrato: 1500.00, dataInicio: "Junho" },
    { id: "3", nome: "Neta Souza Make Up", valorContrato: 1700.00, dataInicio: "Junho" }
  ];
  
  // Função para inicializar os dados no LocalStorage
  function inicializarPrestadores() {
    const prestadores = JSON.parse(localStorage.getItem('prestadores'));
    if (!prestadores || prestadores.length === 0) {
      localStorage.setItem('prestadores', JSON.stringify(prestadoresIniciais));
    }
    const clientes = JSON.parse(localStorage.getItem('clientes'));
    if (!clientes || clientes.length === 0) {
      localStorage.setItem('clientes', JSON.stringify(clientesIniciais));
    }
    atualizarSelectPrestadores();
    atualizarSelectClientes();
    atualizarSelectHistorico();
    atualizarSelectRelatorio();
    gerarResumo();
  }
  
  // Função para gerar o resumo dos prestadores de serviço
  function gerarResumo() {
    const prestadores = JSON.parse(localStorage.getItem('prestadores')) || [];
    const resumoContainer = document.getElementById('resumo-prestadores');
    resumoContainer.innerHTML = '';
  
    prestadores.forEach(prestador => {
      const totalContratos = prestador.contratos.length;
      const totalValor = prestador.contratos.reduce((acc, contrato) => acc + calcularValor(contrato.diasTrabalhados, prestador.valorFixoContrato), 0);
  
      const card = document.createElement('div');
      card.className = 'resumo-card';
      card.innerHTML = `
        <h3>${prestador.nome}</h3>
        <p>Contratos: ${totalContratos}</p>
        <p>Total a Ser Pago: R$${totalValor.toFixed(2)}</p>
        <div class="resumo-detalhes"></div>
      `;
  
      card.addEventListener('click', () => {
        const detalhes = card.querySelector('.resumo-detalhes');
        if (detalhes.style.display === 'block') {
          detalhes.style.display = 'none';
        } else {
          detalhes.innerHTML = '';
          prestador.contratos.forEach(contrato => {
            const valor = calcularValor(contrato.diasTrabalhados, prestador.valorFixoContrato);
            detalhes.innerHTML += `<p>Cliente: ${contrato.cliente} - Data: ${contrato.dataContrato} - Dias Trabalhados: ${contrato.diasTrabalhados} - Valor: R$${valor.toFixed(2)}</p>`;
          });
          detalhes.style.display = 'block';
        }
      });
  
      resumoContainer.appendChild(card);
    });
  }
  
  // Função para abrir o modal com animação
  function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    const span = modal.getElementsByClassName("close")[0];
  
    modal.style.display = "block";
    setTimeout(() => {
      modal.classList.add('show');
      modal.getElementsByClassName('modal-content')[0].classList.add('show');
    }, 10);
  
    // Fechar o modal ao clicar no "x"
    span.onclick = function() {
      fecharModal(modal);
    }
  
    // Fechar o modal ao clicar fora do conteúdo do modal
    window.onclick = function(event) {
      if (event.target == modal) {
        fecharModal(modal);
      }
    }
  }
  
  // Função para fechar o modal com animação
  function fecharModal(modal) {
    modal.classList.remove('show');
    modal.getElementsByClassName('modal-content')[0].classList.remove('show');
    setTimeout(() => {
      modal.style.display = "none";
    }, 300);
  }
  
  // Event listeners
  document.getElementById('add-prestador').addEventListener('click', () => {
    const nome = document.getElementById('nome').value;
    const valorFixo = document.getElementById('valor-fixo').value;
    adicionarPrestador(nome, valorFixo);
  });
  
  document.getElementById('add-contrato').addEventListener('click', () => {
    const prestadorId = document.getElementById('prestador').value;
    const cliente = document.getElementById('cliente').value;
    const diasTrabalhados = document.getElementById('dias-trabalhados').value;
    const dataContrato = document.getElementById('data-contrato').value;
    adicionarContrato(prestadorId, cliente, diasTrabalhados, dataContrato);
  });
  
  document.getElementById('gerar-extrato').addEventListener('click', () => {
    const prestadorId = document.getElementById('prestador').value;
    gerarExtrato(prestadorId);
  });
  
  document.getElementById('prestador-historico').addEventListener('change', () => {
    const prestadorId = document.getElementById('prestador-historico').value;
    exibirHistorico(prestadorId);
  });
  
  document.getElementById('gerar-relatorio').addEventListener('click', gerarRelatorio);
  
  document.getElementById('open-relatorio-modal').addEventListener('click', () => abrirModal('relatorio-modal'));
  document.getElementById('open-historico-modal').addEventListener('click', () => abrirModal('historico-modal'));
  
  // Inicializar a aplicação
  document.addEventListener('DOMContentLoaded', inicializarPrestadores);
  
let assentosSelecionadosNestaCompra = []; 
let vooSelecionado = null;
let voltaSelecionadaConfirmada = false;
let tipoVoo = 'idavolta';

// Objeto auxiliar para o modal guardar os dados temporariamente antes de confirmar a poltrona
let assentoEmProcessamentoModal = null;

document.addEventListener('click', () => {
    document.getElementById('calendar-dropdown')?.classList.add('hidden');
    document.getElementById('calendar-back-dropdown')?.classList.add('hidden');
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('origem')?.addEventListener('input', resetarSelecaoVoo);
    document.getElementById('input-destino')?.addEventListener('input', resetarSelecaoVoo);
});

function resetarSelecaoVoo() {
    vooSelecionado = null;
    voltaSelecionadaConfirmada = false;
    assentosSelecionadosNestaCompra = [];
    document.getElementById('data-display').innerText = "Selecione a partida";
    document.getElementById('data-volta-display').innerText = "Selecione o retorno";
    document.getElementById('passenger-display').innerText = "Nenhum selecionado";
    document.getElementById('passenger-display').style.background = "#eef2f7";
    document.getElementById('passenger-display').style.color = "#555";
    document.getElementById('mapa-assentos-section').classList.add('hidden');
    document.getElementById('ia-box').classList.add('hidden');
}

// ALTERAÇÃO DO GRID: Ajusta e estica as colunas dinamicamente para não quebrar a ordem visual anterior
function mudarTipoVoo(tipo) {
    tipoVoo = tipo;
    const btnIdaVolta = document.getElementById('tab-idavolta');
    const btnSomenteIda = document.getElementById('tab-somenteida');
    const boxVolta = document.getElementById('box-data-volta');
    const gridCelulas = document.getElementById('search-grid-id');

    if (tipo === 'somenteida') {
        btnSomenteIda.classList.add('active');
        btnIdaVolta.classList.remove('active');
        if (boxVolta) boxVolta.style.display = 'none'; // Some por completo redistribuindo o espaço
        if (gridCelulas) gridCelulas.style.gridTemplateColumns = "1fr 1fr 1.5fr 1.5fr"; 
        voltaSelecionadaConfirmada = true; 
    } else {
        btnIdaVolta.classList.add('active');
        btnSomenteIda.classList.remove('active');
        if (boxVolta) boxVolta.style.display = 'flex'; // Retorna na posição exata
        if (gridCelulas) gridCelulas.style.gridTemplateColumns = "1fr 1fr 1.2fr 1.2fr 1.6fr"; 
        if (document.getElementById('data-volta-display').innerText === "Selecione o retorno") {
            voltaSelecionadaConfirmada = false;
        }
    }
}

function toggleDropdown(id) {
    event.stopPropagation();
    const dropdown = document.getElementById(id);
    const estadoAtual = dropdown.classList.contains('hidden');
    
    document.getElementById('calendar-dropdown')?.classList.add('hidden');
    document.getElementById('calendar-back-dropdown')?.classList.add('hidden');
    
    if (estadoAtual) {
        dropdown.classList.remove('hidden');
        if(id === 'calendar-dropdown') carregarDatasDisponiveis();
        if(id === 'calendar-back-dropdown') carregarDatasVoltaDisponiveis();
    }
}

function carregarDatasDisponiveis() {
    const lista = document.getElementById('calendar-list');
    if (!lista) return;
    lista.innerHTML = "";
    
    const origemPesquisada = document.getElementById('origem').value.toUpperCase().trim();
    const destinoPesquisado = document.getElementById('input-destino').value.toUpperCase().trim();

    if (origemPesquisada.length !== 3 || destinoPesquisado.length !== 3) {
        lista.innerHTML = "<div class='calendar-item' style='color: #c0392b; font-weight: bold;'>Digite as siglas da Origem e Destino primeiro!</div>";
        return;
    }
    
    const voosAdmin = JSON.parse(localStorage.getItem('voos')) || [];
    const voosFiltrados = voosAdmin.filter(voo => {
        return (voo.origem || "").toUpperCase().trim() === origemPesquisada && 
               (voo.destino || "").toUpperCase().trim() === destinoPesquisado;
    });

    if (voosFiltrados.length === 0) {
        lista.innerHTML = `<div class='calendar-item'>Nenhum voo de <b>${origemPesquisada}</b> para <b>${destinoPesquisado}</b>.</div>`;
        return;
    }

    voosFiltrados.forEach((voo) => {
        const item = document.createElement('div');
        item.className = "calendar-item";
        item.innerHTML = `<strong>Voo: ${voo.numero}</strong><br>Partida: ${voo.data}`;
        
        item.onclick = () => {
            vooSelecionado = voo;
            document.getElementById('data-display').innerText = `${voo.data}`;
            document.getElementById('calendar-dropdown').classList.add('hidden');
            
            document.getElementById('data-volta-display').innerText = "Selecione o retorno";
            if (tipoVoo === 'idavolta') voltaSelecionadaConfirmada = false;

            document.getElementById('mapa-assentos-section').classList.add('hidden');
            document.getElementById('ia-box').classList.add('hidden');
            assentosSelecionadosNestaCompra = [];
            document.getElementById('passenger-display').innerText = "Nenhum selecionado";
        };
        lista.appendChild(item);
    });
}

function carregarDatasVoltaDisponiveis() {
    const lista = document.getElementById('calendar-back-list');
    if (!lista) return;
    lista.innerHTML = "";

    if (!vooSelecionado) {
        lista.innerHTML = "<div class='calendar-item' style='color: #c0392b; font-weight: bold;'>Selecione primeiro a Data de Ida!</div>";
        return;
    }

    const item = document.createElement('div');
    item.className = "calendar-item";
    item.innerHTML = `<strong>Retorno do Voo ${vooSelecionado.numero}</strong><br>Data: ${vooSelecionado.dataVolta || 'Não informada'}`;
    
    item.onclick = () => {
        document.getElementById('data-volta-display').innerText = vooSelecionado.dataVolta || "Não informada";
        document.getElementById('calendar-back-dropdown').classList.add('hidden');
        voltaSelecionadaConfirmada = true;
    };
    lista.appendChild(item);
}

function buscarPassagemReal() {
    const orig = document.getElementById('origem').value.toUpperCase().trim();
    const dest = document.getElementById('input-destino').value.toUpperCase().trim();

    if (orig.length !== 3 || dest.length !== 3) {
        alert("Digite as siglas de 3 letras da rota!");
        return;
    }

    if (!vooSelecionado) {
        alert("Por favor, selecione uma Data de Ida válida!");
        return;
    }

    if (vooSelecionado.origem.toUpperCase().trim() !== orig || vooSelecionado.destino.toUpperCase().trim() !== dest) {
        alert("A rota digitada mudou! Reescolha o voo.");
        resetarSelecaoVoo();
        return;
    }

    if (tipoVoo === 'idavolta' && !voltaSelecionadaConfirmada) {
        alert("Por favor, clique no campo 'Data de Volta' e selecione o retorno do voo!");
        return;
    }

    const sectionMapa = document.getElementById('mapa-assentos-section');
    sectionMapa.classList.remove('hidden');
    renderizarMapaAviao();
    sectionMapa.scrollIntoView({ behavior: 'smooth' });
}

function renderizarMapaAviao() {
    const gridPri = document.getElementById('grid-primeira');
    const gridExe = document.getElementById('grid-executiva');
    const gridEco = document.getElementById('grid-economica');

    if(!gridPri || !gridExe || !gridEco || !vooSelecionado) return;
    gridPri.innerHTML = ""; gridExe.innerHTML = ""; gridEco.innerHTML = "";

    const assentosOcupadosDoVoo = JSON.parse(localStorage.getItem(`ocupados_${vooSelecionado.numero}`)) || [];

    const maxPrimeira = parseInt(vooSelecionado.classes?.primeira?.qtd) || 0;
    const maxExecutiva = parseInt(vooSelecionado.classes?.executiva?.qtd) || 0;
    const maxEconomica = parseInt(vooSelecionado.classes?.economica?.qtd) || 0;

    gridPri.parentElement.style.display = maxPrimeira === 0 ? "none" : "block";
    gridExe.parentElement.style.display = maxExecutiva === 0 ? "none" : "block";
    gridEco.parentElement.style.display = maxEconomica === 0 ? "none" : "block";

    for(let i = 1; i <= maxPrimeira; i++) criarPoltronaDOM(gridPri, 'A' + i, 'primeira', 'purple', assentosOcupadosDoVoo);
    for(let i = 1; i <= maxExecutiva; i++) criarPoltronaDOM(gridExe, 'B' + i, 'executiva', 'darkblue', assentosOcupadosDoVoo);
    for(let i = 1; i <= maxEconomica; i++) criarPoltronaDOM(gridEco, 'C' + i, 'economica', '#7f8c8d', assentosOcupadosDoVoo);
}

function criarPoltronaDOM(container, nomeAssento, classe, corOriginal, assentosOcupados) {
    const div = document.createElement('div');
    div.className = "poltrona-item";
    div.innerText = nomeAssento;
    div.setAttribute('data-assento', nomeAssento);
    div.setAttribute('data-classe', classe);

    if (assentosOcupados.includes(nomeAssento)) {
        div.style.background = "#2c3e50"; 
        div.style.cursor = "not-allowed"; 
        div.style.opacity = "0.4";
    } 
    else if (assentosSelecionadosNestaCompra.some(a => a.nome === nomeAssento)) {
        div.style.background = '#2ecc71'; // Cor verde de selecionado ativa
        div.onclick = function() {
            // Se clicar de novo em um assento verde, remove ele do carrinho direto
            const index = assentosSelecionadosNestaCompra.findIndex(a => a.nome === nomeAssento);
            if(index > -1) assentosSelecionadosNestaCompra.splice(index, 1);
            renderizarMapaAviao();
            atualizarDisplayAssentosTxt();
        };
    }
    else {
        div.style.background = corOriginal;
        div.onclick = function() {
            // Dispara o Modal Seletor de Idade em vez de marcar direto
            let precoReal = 0;
            if(classe === 'primeira') precoReal = parseFloat(vooSelecionado.classes?.primeira?.preco) || 0;
            if(classe === 'executiva') precoReal = parseFloat(vooSelecionado.classes?.executiva?.preco) || 0;
            if(classe === 'economica') precoReal = parseFloat(vooSelecionado.classes?.economica?.preco) || 0;

            assentoEmProcessamentoModal = { nome: nomeAssento, classe: classe.charAt(0).toUpperCase() + classe.slice(1), preco: precoReal };
            
            document.getElementById('modal-titulo-assento').innerText = `Poltrona ${nomeAssento}`;
            document.getElementById('modal-passageiro').style.display = 'flex';
        };
    }
    container.appendChild(div);
}

// FUNÇÃO DO MODAL: Salva a poltrona associada com a idade/tipo escolhida
function definirPassageiro(tipoIdade) {
    if(assentoEmProcessamentoModal) {
        assentosSelecionadosNestaCompra.push({
            ...assentoEmProcessamentoModal,
            categoria: tipoIdade
        });
    }
    fecharModal();
    renderizarMapaAviao();
    atualizarDisplayAssentosTxt();
}

function fecharModal() {
    document.getElementById('modal-passageiro').style.display = 'none';
    assentoEmProcessamentoModal = null;
}

function atualizarDisplayAssentosTxt() {
    if (assentosSelecionadosNestaCompra.length === 0) {
        document.getElementById('passenger-display').innerText = "Nenhum selecionado";
        document.getElementById('passenger-display').style.background = "#eef2f7"; 
        document.getElementById('passenger-display').style.color = "#555"; 
        return;
    }
    // Mostra o assento e uma sigla para a categoria: (A)dulto, (C)riança, (B)ebê
    const resumoTxt = assentosSelecionadosNestaCompra.map(a => `${a.nome}(${a.categoria[0]})`).join(', ');
    const totalPreco = assentosSelecionadosNestaCompra.reduce((soma, a) => soma + a.preco, 0);
    
    document.getElementById('passenger-display').innerText = `${resumoTxt} | Total: R$ ${totalPreco.toFixed(2)}`;
    document.getElementById('passenger-display').style.background = "#fff5f5"; 
    document.getElementById('passenger-display').style.color = "var(--nexus-blue)";
}

function finalizarSelecaoAssentos() {
    if (assentosSelecionadosNestaCompra.length === 0) { alert("Selecione pelo menos uma poltrona!"); return; }
    const querContinuarComprando = confirm("Deseja escolher mais alguma poltrona para este voo?");
    if (querContinuarComprando) return;

    const assentosOcupadosDoVoo = JSON.parse(localStorage.getItem(`ocupados_${vooSelecionado.numero}`)) || [];
    assentosSelecionadosNestaCompra.forEach(a => { assentosOcupadosDoVoo.push(a.nome); });
    localStorage.setItem(`ocupados_${vooSelecionado.numero}`, JSON.stringify(assentosOcupadosDoVoo));
    dispararRelatorioFinalC_IA();
}

function dispararRelatorioFinalC_IA() {
    const box = document.getElementById('ia-box');
    const textoElemento = document.getElementById('ia-texto');
    const orig = document.getElementById('origem').value.toUpperCase().trim();
    const dest = document.getElementById('input-destino').value.toUpperCase().trim();

    box.classList.remove('hidden');
    textoElemento.innerHTML = "Gerando relátorio...";

    // Peso base invariável do avião herdado do motor em C
    let pesoBaseAeronave = (tipoVoo === 'somenteida' ? 24000 : 40000);
    
    // CALCULO EXATO EM C POR CATEGORIA DE IDADE: Adulto (85kg), Criança (40kg) e Bebê (10kg no colo)
    let pesoPassageirosEAeronave = assentosSelecionadosNestaCompra.reduce((soma, a) => {
        let p = (a.categoria === 'Adulto' ? 85 : (a.categoria === 'Criança' ? 40 : 10));
        return soma + p;
    }, pesoBaseAeronave);
    
    let totalPreco = assentosSelecionadosNestaCompra.reduce((soma, a) => soma + a.preco, 0);
    const detalheAssentosComIdade = assentosSelecionadosNestaCompra.map(a => `Assento ${a.nome} [${a.categoria}]`).join(', ');

    let infoDatas = `Partida: ${vooSelecionado.data}`;
    if (tipoVoo === 'idavolta') infoDatas += ` | Retorno: ${vooSelecionado.dataVolta}`;
    else infoDatas += ` | Tipo: Somente Ida`;

    setTimeout(() => {
        const respostaIAN = `COMPRA FINALIZADA COM SUCESSO NA AERONEXUS!\n\n` +
        `Itinerário Consolidado: ${orig} - ${dest} | ${infoDatas}.\n` +
        `Especificação dos Bilhetes: ${detalheAssentosComIdade}.\n` +
        `Valor Total Faturado: R$ ${totalPreco.toFixed(2)}.\n\n` +
        `AeroNexus C-Engine Flight Log: O motor em C registrou o bloqueio definitivo dessas posições. Aplicando a pesagem fracionada por categoria de idade (Adulto: 85kg / Criança: 40kg / Bebê: 10kg), a carga total calculada de decolagem equivale a exatamente ${pesoPassageirosEAeronave} kg. Obrigado por voar com a AeroNexus, boa viagem!.\n\n` +
        `AERONEXUS, CONECTANDO SONHOS COM REALIDADE.`;

        efeitoDigitar(respostaIAN, textoElemento);
        box.scrollIntoView({ behavior: 'smooth' });
        renderizarMapaAviao(); 
        assentosSelecionadosNestaCompra = []; 
    }, 1200);
}

function efeitoDigitar(texto, elemento) {
    elemento.innerHTML = ""; let i = 0;
    const interval = setInterval(() => {
        if (i < texto.length) {
            if (texto.charAt(i) === '\n') { elemento.innerHTML += "<br>"; } else { elemento.innerHTML += texto.charAt(i); }
            i++;
        } else { clearInterval(interval); }
    }, 20);
}
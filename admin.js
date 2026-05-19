const ADMIN_USER = "admin";
const ADMIN_PASS = "adm123";

let bancoVoos = JSON.parse(localStorage.getItem('voos')) || [];
let indexEdicao = null; // Guarda o índice do voo que está sendo editado

document.addEventListener("DOMContentLoaded", () => {
    configurarLimitesDeData();
    // Força a exibição da tela de login ao carregar
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('dashboard-section').classList.add('hidden');
});

function configurarLimitesDeData() {
    const inputIda = document.getElementById("voo-data");
    const inputVolta = document.getElementById("voo-data-volta");
    if (!inputIda || !inputVolta) return;

    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    
    inputIda.min = `${hoje.getFullYear()}-${mes}-${dia}`;
    inputIda.max = "2028-12-31";
    inputVolta.min = `${hoje.getFullYear()}-${mes}-${dia}`;
    inputVolta.max = "2028-12-31";
}

function verificarLogin() {
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        exibirPainel();
    } else {
        alert("Usuário ou senha incorretos!");
    }
}

function exibirPainel() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    atualizarTabela();
}

// NOVA FUNÇÃO: Preenche o formulário para edição
function editarVoo(index) {
    indexEdicao = index;
    const voo = bancoVoos[index];

    // Preenche os campos textuais
    document.getElementById('voo-numero').value = voo.numero;
    document.getElementById('voo-origem').value = voo.origem || "";
    document.getElementById('voo-destino').value = voo.destino;

    // Converte datas de DD/MM/YYYY para YYYY-MM-DD para o input do calendário
    if(voo.data) {
        const pIda = voo.data.split("/");
        document.getElementById('voo-data').value = `${pIda[2]}-${pIda[1]}-${pIda[0]}`;
    }
    if(voo.dataVolta) {
        const pVolta = voo.dataVolta.split("/");
        document.getElementById('voo-data-volta').value = `${pVolta[2]}-${pVolta[1]}-${pVolta[0]}`;
    }

    // Preenche as classes
    document.getElementById('qtd-economica').value = voo.classes?.economica?.qtd || 0;
    document.getElementById('preco-economica').value = voo.classes?.economica?.preco || 0;
    document.getElementById('qtd-executiva').value = voo.classes?.executiva?.qtd || 0;
    document.getElementById('preco-executiva').value = voo.classes?.executiva?.preco || 0;
    document.getElementById('qtd-primeira').value = voo.classes?.primeira?.qtd || 0;
    document.getElementById('preco-primeira').value = voo.classes?.primeira?.preco || 0;

    // Altera o visual do botão principal para modo de edição
    const btnSalvar = document.getElementById('btn-salvar-voo');
    if (btnSalvar) {
        btnSalvar.innerText = "Atualizar Voo Otimizado";
        btnSalvar.style.background = "#D4AF37"; // Cor dourada indicando edição
    }
    
    // Rola a tela suavemente até o formulário
    document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

function salvarVoo() {
    const numero = document.getElementById('voo-numero').value.toUpperCase();
    const origen = document.getElementById('voo-origem').value.toUpperCase();
    const destino = document.getElementById('voo-destino').value.toUpperCase();
    const dataIdaInput = document.getElementById('voo-data').value;
    const dataVoltaInput = document.getElementById('voo-data-volta').value;

    const qteEco = parseInt(document.getElementById('qtd-economica').value) || 0;
    const precoEco = parseFloat(document.getElementById('preco-economica').value) || 0;
    const qteExe = parseInt(document.getElementById('qtd-executiva').value) || 0;
    const precoExe = parseFloat(document.getElementById('preco-executiva').value) || 0;
    const qtePri = parseInt(document.getElementById('qtd-primeira').value) || 0;
    const precoPri = parseFloat(document.getElementById('preco-primeira').value) || 0;

    if (!numero || !origen || !destino || !dataIdaInput || !dataVoltaInput) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    const pIda = dataIdaInput.split("-");
    const dataIdaFormatada = `${pIda[2]}/${pIda[1]}/${pIda[0]}`;
    const pVolta = dataVoltaInput.split("-");
    const dataVoltaFormatada = `${pVolta[2]}/${pVolta[1]}/${pVolta[0]}`;

    const dadosVoo = { 
        numero, origem: origen, destino, data: dataIdaFormatada, dataVolta: dataVoltaFormatada,
        classes: {
            economica: { qtd: qteEco, preco: precoEco.toFixed(2) },
            executiva: { qtd: qteExe, preco: precoExe.toFixed(2) },
            primeira: { qtd: qtePri, preco: precoPri.toFixed(2) }
        }
    };
    
    // Se indexEdicao não for nulo, estamos atualizando um voo existente
    if (indexEdicao !== null) {
        bancoVoos[indexEdicao] = dadosVoo;
        indexEdicao = null; // Reseta o estado
    } else {
        bancoVoos.push(dadosVoo); // Caso contrário, cria um novo
    }
    
    localStorage.setItem('voos', JSON.stringify(bancoVoos));

    // Cálculos da C-Engine baseados na modificação
    const totalPassageirosVoo = qteEco + qteExe + qtePri;
    const consumoC = totalPassageirosVoo * (11500 * 0.04);
    const pesoC = (qteEco * 85) + (qteExe * 95) + (qtePri * 110) + 40000;
    
    // SUBSTITUA o bloco do monitorTerminal dentro de salvarVoo() por este:
    const monitorTerminal = document.getElementById('c-output');
    if (monitorTerminal) {
        monitorTerminal.innerHTML = `
&gt; ./otimizador ${numero} ${totalPassageirosVoo} 11500<br>
==================================================<br>
        PAINEL DE DIAGNÓSTICO NEXUS   <br>
==================================================<br>
  [Voo]: ${numero}<br>
  [Rota]: ${origen} ---&gt; ${destino}<br>
  [Assentos Otimizados]: ${totalPassageirosVoo}<br>
--------------------------------------------------<br>
  (Combustivel): <span style="color: #ff0;">${consumoC.toFixed(2)} Litros</span><br>
  (Peso Decolagem): <span style="color: #ff0;">${pesoC.toFixed(2)} kg</span><br>
--------------------------------------------------<br>
  &gt; STATUS: REGISTRO REAVALIADO COM SUCESSO NO SISTEMA.`;
    }

    // Volta o botão ao design original
    const btnSalvar = document.getElementById('btn-salvar-voo');
    if (btnSalvar) {
        btnSalvar.innerText = "Salvar e Otimizar com C";
        btnSalvar.style.background = "var(--emirates-red)";
    }

    atualizarTabela();
    limparFormulario();
}

function cancelarVoo(index) {
    if(confirm("Deseja realmente cancelar este voo?")) {
        bancoVoos.splice(index, 1);
        localStorage.setItem('voos', JSON.stringify(bancoVoos));
        atualizarTabela();
    }
}

function atualizarTabela() {
    const tbody = document.getElementById('lista-voos-body');
    if (!tbody) return;
    tbody.innerHTML = "";

    bancoVoos.forEach((voo, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${voo.numero}</strong></td>
            <td><b>${voo.origem || '---'}</b> - <b>${voo.destino}</b></td>
            <td>${voo.data}<br>${voo.dataVolta}</td>
            <td style="font-size: 13px;">
                Eco: ${voo.classes?.economica?.qtd || 0}<br>
                Exe: ${voo.classes?.executiva?.qtd || 0}<br>
                Pri: ${voo.classes?.primeira?.qtd || 0}
            </td>
            <td style="font-size: 13px; font-weight: bold;">
                <span style="color: green;">Eco: R$ ${voo.classes?.economica?.preco || 0}</span><br>
                <span style="color: blues;">Exe: R$ ${voo.classes?.executiva?.preco || 0}</span><br>
                <span style="color: purple;">Pri: R$ ${voo.classes?.primeira?.preco || 0}</span>
            </td>
            <td>
                <div style="display: flex; flex-direction: column; gap: 5px;">
                    <button class="btn-confirm-dropdown" style="margin: 0; padding: 5px; font-size: 12px; background: #fbff00;" onclick="editarVoo(${index})">Editar</button>
                    <button class="btn-cancel" style="padding: 5px; font-size: 12px;" onclick="cancelarVoo(${index})">Cancelar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function limparFormulario() {
    indexEdicao = null;
    document.getElementById('voo-numero').value = "";
    document.getElementById('voo-origem').value = "";
    document.getElementById('voo-destino').value = "";
    document.getElementById('voo-data').value = "";
    document.getElementById('voo-data-volta').value = "";
    document.getElementById('qtd-economica').value = "";
    document.getElementById('preco-economica').value = "";
    document.getElementById('qtd-executiva').value = "";
    document.getElementById('preco-executiva').value = "";
    document.getElementById('qtd-primeira').value = "";
    document.getElementById('preco-primeira').value = "";
}
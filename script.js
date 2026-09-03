/* Utils */

function pegarNumero(id) {
    return parseFloat(document.getElementById(id).value);
}

function pegarTexto(id) {
    return document.getElementById(id).value.trim();
}

function moeda(valor) {
    return "R$ " + Number(valor).toFixed(2).replace(".", ",");
}

function numero(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
}

/* Adiciona uma linha na lista de itens cadastrados */
function adicionarItem(idLista, texto) {
    const lista = document.getElementById(idLista);
    if (lista.getElementsByClassName("muted").length > 0) {
        lista.innerHTML = "";
    }
    lista.innerHTML = "<p>" + texto + "</p>" + lista.innerHTML;
}

/* Diz se já existe um item com aquele código na lista (usa for) */
function jaExiste(lista, campo, valor) {
    for (let i = 0; i < lista.length; i++) {
        if (lista[i][campo] === valor) {
            return true;
        }
    }
    return false;
}

/* Pede outro código enquanto o digitado já estiver cadastrado (while + prompt) */
function garantirCodigoUnico(lista, campo, valor) {
    let codigo = valor;
    while (jaExiste(lista, campo, codigo)) {
        const nova = prompt('Código "' + codigo + '" já cadastrado. Digite outro código:');
        if (nova === null || nova.trim() === "") {
            return null;
        }
        codigo = Number(nova);
    }
    return codigo;
}

/* =========================================================
   EXERCÍCIO 1 — FRETE
   ========================================================= */
const pedidos = [];

function precoPorPeca(regiao) {
    switch (regiao) {
        case "Sudeste": return 1.20;
        case "Sul": return 1.30;
        case "Centro-Oeste": return 1.50;
        default: return 0;
    }
}

function calcularFrete(combustivel, distancia, quantidade, regiao, rastreio) {
    let valor = combustivel * distancia; // 1 km = 1 litro
    if (rastreio) {
        valor += 200;
    }

    const preco = precoPorPeca(regiao);
    if (quantidade > 1000) {
        const excedente = quantidade - 1000;
        valor += 1000 * preco + excedente * preco * 0.88; // 12% de desconto no excedente
    } else {
        valor += quantidade * preco;
    }
    return valor;
}

function cadastrarPedido(evento) {
    evento.preventDefault();

    const combustivel = pegarNumero("e1_comb");
    let id = parseInt(document.getElementById("e1_id").value, 10);
    const regiao = pegarTexto("e1_reg");
    const distancia = pegarNumero("e1_dis");
    const quantidade = parseInt(document.getElementById("e1_qtd").value, 10);
    const rastreio = document.getElementById("e1_resp").checked;

    if (!combustivel || combustivel <= 0) {
        avisar("e1_lista", "Informe o preço do litro de combustível.");
        return;
    }
    if (!id || !regiao || !distancia || !quantidade) {
        avisar("e1_lista", "Preencha código, região, distância e quantidade.");
        return;
    }

    id = garantirCodigoUnico(pedidos, "id", id);
    if (id === null) {
        return;
    }

    const valor = calcularFrete(combustivel, distancia, quantidade, regiao, rastreio);
    pedidos.push({ id: id, regiao: regiao, valor: valor });

    adicionarItem("e1_lista", "Pedido " + id + " (" + regiao + "): " + moeda(valor));
    document.getElementById("form1").reset();
}

function relatorioPedidos() {
    if (pedidos.length === 0) {
        avisar("e1_lista", "Cadastre pelo menos um pedido.");
        return;
    }

    let total = 0;
    let totalSudeste = 0;
    let totalSul = 0;
    let totalCentroOeste = 0;
    let maisCaro = pedidos[0];
    let maisBarato = pedidos[0];

    for (let i = 0; i < pedidos.length; i++) {
        const p = pedidos[i];
        total += p.valor;
        if (p.regiao === "Sudeste") {
            totalSudeste += p.valor;
        } else if (p.regiao === "Sul") {
            totalSul += p.valor;
        } else {
            totalCentroOeste += p.valor;
        }
        if (p.valor > maisCaro.valor) {
            maisCaro = p;
        }
        if (p.valor < maisBarato.valor) {
            maisBarato = p;
        }
    }

    const media = total / pedidos.length;

    let html = "";
    html += '<div class="row"><span>Total de pedidos</span><span>' + pedidos.length + "</span></div>";
    html += '<div class="row"><span>Valor médio por pedido</span><span>' + moeda(media) + "</span></div>";
    html += '<p class="sub">Total acumulado por região</p>';
    html += '<div class="row"><span>Sudeste</span><span>' + moeda(totalSudeste) + "</span></div>";
    html += '<div class="row"><span>Sul</span><span>' + moeda(totalSul) + "</span></div>";
    html += '<div class="row"><span>Centro-Oeste</span><span>' + moeda(totalCentroOeste) + "</span></div>";
    html += '<p class="sub">Extremos</p>';
    html += '<div class="row"><span>Pedido mais caro</span><span>Cód. ' + maisCaro.id + " — " + moeda(maisCaro.valor) + "</span></div>";
    html += '<div class="row"><span>Pedido mais barato</span><span>Cód. ' + maisBarato.id + " — " + moeda(maisBarato.valor) + "</span></div>";

    document.getElementById("e1_result").innerHTML = '<div class="panel"><h4>Relatório final</h4>' + html + "</div>";
}

/* =========================================================
   EXERCÍCIO 2 — FOLHA DE PAGAMENTO
   ========================================================= */
const funcionarios = [];

function percentualHora(categoria, turno) {
    if (categoria === "F") {
        switch (turno) {
            case "M": return 0.10;
            case "V": return 0.15;
            case "N": return 0.20;
        }
    } else if (categoria === "G") {
        switch (turno) {
            case "M": return 0.30;
            case "V": return 0.35;
            case "N": return 0.40;
        }
    }
    return 0;
}

function calcularAuxilio(salarioInicial) {
    if (salarioInicial <= 800) {
        return salarioInicial * 0.25;
    }
    if (salarioInicial <= 1200) {
        return salarioInicial * 0.20;
    }
    return salarioInicial * 0.15;
}

function calcularBonus(nota, salarioInicial) {
    if (nota >= 9) {
        return { valor: salarioInicial * 0.10, faixa: "10%" };
    }
    if (nota >= 7) {
        return { valor: salarioInicial * 0.05, faixa: "5%" };
    }
    if (nota >= 5) {
        return { valor: salarioInicial * 0.02, faixa: "2%" };
    }
    return { valor: 0, faixa: "Nenhum" };
}

function cadastrarFuncionario(evento) {
    evento.preventDefault();

    const salMin = pegarNumero("e2_salmin");
    let id = parseInt(document.getElementById("e2_id").value, 10);
    const horas = pegarNumero("e2_ht");
    const categoria = pegarTexto("e2_cat");
    const turno = pegarTexto("e2_turno");
    const nota = pegarNumero("e2_av");

    if (!salMin || salMin <= 0) {
        avisar("e2_lista", "Informe o salário mínimo atual.");
        return;
    }
    if (!id || !horas || !categoria || !turno) {
        avisar("e2_lista", "Preencha código, horas, categoria e turno.");
        return;
    }
    if (isNaN(nota) || nota < 0 || nota > 10) {
        avisar("e2_lista", "A avaliação deve ser um número de 0 a 10.");
        return;
    }

    id = garantirCodigoUnico(funcionarios, "id", id);
    if (id === null) {
        return;
    }

    const salarioInicial = horas * (salMin * percentualHora(categoria, turno));
    const auxilio = calcularAuxilio(salarioInicial);
    const bonus = calcularBonus(nota, salarioInicial);
    const salarioFinal = salarioInicial + auxilio + bonus.valor;

    funcionarios.push({
        id: id, categoria: categoria, turno: turno,
        salarioFinal: salarioFinal, faixaBonus: bonus.faixa
    });

    adicionarItem("e2_lista", "Funcionário " + id + " (" + categoria + "/" + turno + "): " + moeda(salarioFinal));
    document.getElementById("form2").reset();
}

function relatorioFolha() {
    if (funcionarios.length === 0) {
        avisar("e2_lista", "Cadastre pelo menos um funcionário.");
        return;
    }

    let total = 0;
    let totalF = 0;
    let totalG = 0;
    let qtdF = 0;
    let qtdG = 0;
    let faixa10 = 0;
    let faixa5 = 0;
    let faixa2 = 0;
    let faixaNenhum = 0;
    let maior = funcionarios[0];
    let menor = funcionarios[0];

    for (let i = 0; i < funcionarios.length; i++) {
        const f = funcionarios[i];
        total += f.salarioFinal;
        if (f.categoria === "F") {
            totalF += f.salarioFinal;
            qtdF++;
        } else {
            totalG += f.salarioFinal;
            qtdG++;
        }
        if (f.faixaBonus === "10%") {
            faixa10++;
        } else if (f.faixaBonus === "5%") {
            faixa5++;
        } else if (f.faixaBonus === "2%") {
            faixa2++;
        } else {
            faixaNenhum++;
        }
        if (f.salarioFinal > maior.salarioFinal) {
            maior = f;
        }
        if (f.salarioFinal < menor.salarioFinal) {
            menor = f;
        }
    }

    let mediaF = 0;
    if (qtdF > 0) {
        mediaF = totalF / qtdF;
    }
    let mediaG = 0;
    if (qtdG > 0) {
        mediaG = totalG / qtdG;
    }

    let html = "";
    html += '<div class="row"><span>Funcionários cadastrados</span><span>' + funcionarios.length + "</span></div>";
    html += '<div class="row"><span>Média salarial geral</span><span>' + moeda(total / funcionarios.length) + "</span></div>";
    html += '<div class="row"><span>Média — operacionais (F)</span><span>' + moeda(mediaF) + "</span></div>";
    html += '<div class="row"><span>Média — gerentes (G)</span><span>' + moeda(mediaG) + "</span></div>";
    html += '<p class="sub">Extremos</p>';
    html += '<div class="row"><span>Maior salário</span><span>Cód. ' + maior.id + " · " + maior.categoria + "/" + maior.turno + " · " + moeda(maior.salarioFinal) + "</span></div>";
    html += '<div class="row"><span>Menor salário</span><span>Cód. ' + menor.id + " · " + menor.categoria + "/" + menor.turno + " · " + moeda(menor.salarioFinal) + "</span></div>";
    html += '<p class="sub">Funcionários por faixa de bônus</p>';
    html += '<div class="row"><span>Bônus 10%</span><span>' + faixa10 + "</span></div>";
    html += '<div class="row"><span>Bônus 5%</span><span>' + faixa5 + "</span></div>";
    html += '<div class="row"><span>Bônus 2%</span><span>' + faixa2 + "</span></div>";
    html += '<div class="row"><span>Sem bônus</span><span>' + faixaNenhum + "</span></div>";

    document.getElementById("e2_result").innerHTML = '<div class="panel"><h4>Relatório mensal</h4>' + html + "</div>";
}

/* =========================================================
   EXERCÍCIO 3 — PRODUÇÃO E ESTOQUE
   ========================================================= */
const ordens = [];

function ajustarCusto(tipo, custoBase) {
    switch (tipo) {
        case 1: return custoBase;          // Padrão
        case 2: return custoBase * 1.10;   // Premium
        case 3: return custoBase * 1.20;   // Sob encomenda
        default: return custoBase;
    }
}

function classificarEstoque(estoqueFinal) {
    if (estoqueFinal > 5000) {
        return "alto";
    }
    if (estoqueFinal < 500) {
        return "critico";
    }
    return "normal";
}

function cadastrarOrdem(evento) {
    evento.preventDefault();

    let idOrdem = parseInt(document.getElementById("e3_ordem").value, 10);
    const idProduto = parseInt(document.getElementById("e3_produto").value, 10);
    const tipo = parseInt(document.getElementById("e3_cat").value, 10);
    const qtd = parseInt(document.getElementById("e3_qtd").value, 10);
    const custoBase = pegarNumero("e3_custo");
    const estoqueInicial = parseInt(document.getElementById("e3_ini").value, 10);

    if (!idOrdem || !idProduto || !tipo || !qtd || !custoBase || isNaN(estoqueInicial)) {
        avisar("e3_lista", "Preencha todos os campos da ordem.");
        return;
    }

    idOrdem = garantirCodigoUnico(ordens, "idOrdem", idOrdem);
    if (idOrdem === null) {
        return;
    }

    const custoAjustado = ajustarCusto(tipo, custoBase);
    const estoqueFinal = estoqueInicial + qtd;
    const alerta = classificarEstoque(estoqueFinal);
    const custoTotal = qtd * custoAjustado;

    ordens.push({
        idOrdem: idOrdem, idProduto: idProduto, tipo: tipo,
        estoqueFinal: estoqueFinal, custoTotal: custoTotal, alerta: alerta
    });

    let msg = "Ordem " + idOrdem + " · produto " + idProduto + " · " + moeda(custoTotal);
    if (alerta === "alto") {
        msg += " · ⚠ estoque alto";
    }
    if (alerta === "critico") {
        msg += " · ⚠ estoque crítico";
    }
    adicionarItem("e3_lista", msg);
    document.getElementById("form3").reset();
}

function relatorioProducao() {
    if (ordens.length === 0) {
        avisar("e3_lista", "Registre pelo menos uma ordem.");
        return;
    }

    let estoquePadrao = 0;
    let estoquePremium = 0;
    let estoqueEncomenda = 0;
    let totalCusto = 0;
    let alertasAlto = 0;
    let alertasCritico = 0;
    let maior = ordens[0];
    let menor = ordens[0];
    const porProduto = [];

    for (let i = 0; i < ordens.length; i++) {
        const o = ordens[i];
        totalCusto += o.custoTotal;
        if (o.tipo === 1) {
            estoquePadrao += o.estoqueFinal;
        } else if (o.tipo === 2) {
            estoquePremium += o.estoqueFinal;
        } else {
            estoqueEncomenda += o.estoqueFinal;
        }
        if (o.alerta === "alto") {
            alertasAlto++;
        }
        if (o.alerta === "critico") {
            alertasCritico++;
        }
        if (o.custoTotal > maior.custoTotal) {
            maior = o;
        }
        if (o.custoTotal < menor.custoTotal) {
            menor = o;
        }

        let prod = null;
        for (let j = 0; j < porProduto.length; j++) {
            if (porProduto[j].codigo === o.idProduto) {
                prod = porProduto[j];
            }
        }
        if (prod === null) {
            prod = { codigo: o.idProduto, estoque: 0, investido: 0 };
            porProduto.push(prod);
        }
        prod.estoque += o.estoqueFinal;
        prod.investido += o.custoTotal;
    }

    let html = "";
    html += '<div class="row"><span>Total de ordens</span><span>' + ordens.length + "</span></div>";
    html += '<div class="row"><span>Média de custo por ordem</span><span>' + moeda(totalCusto / ordens.length) + "</span></div>";
    html += '<p class="sub">Estoque final por tipo</p>';
    html += '<div class="row"><span>Padrão</span><span>' + estoquePadrao + "</span></div>";
    html += '<div class="row"><span>Premium</span><span>' + estoquePremium + "</span></div>";
    html += '<div class="row"><span>Sob encomenda</span><span>' + estoqueEncomenda + "</span></div>";
    html += '<p class="sub">Extremos e alertas</p>';
    html += '<div class="row"><span>Maior custo</span><span>Ordem ' + maior.idOrdem + " — " + moeda(maior.custoTotal) + "</span></div>";
    html += '<div class="row"><span>Menor custo</span><span>Ordem ' + menor.idOrdem + " — " + moeda(menor.custoTotal) + "</span></div>";
    html += '<div class="row"><span>Alertas de estoque alto</span><span>' + alertasAlto + "</span></div>";
    html += '<div class="row"><span>Alertas de estoque crítico</span><span>' + alertasCritico + "</span></div>";
    html += '<p class="sub">Consolidado por produto</p>';
    for (let k = 0; k < porProduto.length; k++) {
        html += '<div class="row"><span>Produto ' + porProduto[k].codigo + "</span><span>estoque " +
            porProduto[k].estoque + " · " + moeda(porProduto[k].investido) + "</span></div>";
    }

    document.getElementById("e3_result").innerHTML = '<div class="panel"><h4>Relatório consolidado</h4>' + html + "</div>";
}

/* =========================================================
   EXERCÍCIO 4 — RESERVAS DE HOTEL
   ========================================================= */
const reservas = [];

function multiplicadorQuarto(tipo) {
    switch (tipo) {
        case "S": return 1.0;
        case "L": return 1.5;
        case "P": return 2.0;
        default: return 1.0;
    }
}

function ajusteTemporada(temp) {
    switch (temp) {
        case "B": return 0;
        case "A": return 0.25;
        case "F": return 0.40;
        default: return 0;
    }
}

function calcularReserva(base, tipo, temp, dias, hospedes, valorCafe, temCafe) {
    const diariaFinal = base * multiplicadorQuarto(tipo) * (1 + ajusteTemporada(temp));
    let cafeTotal = 0;
    if (temCafe) {
        cafeTotal = valorCafe * hospedes * dias;
    }
    return diariaFinal * dias + cafeTotal;
}

function cadastrarReserva(evento) {
    evento.preventDefault();

    const base = pegarNumero("e4_diaria");
    const valorCafe = pegarNumero("e4_cafe");
    let id = parseInt(document.getElementById("e4_id").value, 10);
    const tipo = pegarTexto("e4_cat");
    const temp = pegarTexto("e4_temp");
    const dias = parseInt(document.getElementById("e4_dias").value, 10);
    const hospedes = parseInt(document.getElementById("e4_hosp").value, 10);
    const temCafe = document.getElementById("e4_cafeIncl").checked;

    if (!base || isNaN(valorCafe) || !id || !tipo || !temp || !dias || !hospedes) {
        avisar("e4_lista", "Preencha todos os campos da reserva.");
        return;
    }

    id = garantirCodigoUnico(reservas, "id", id);
    if (id === null) {
        return;
    }

    const valor = calcularReserva(base, tipo, temp, dias, hospedes, valorCafe, temCafe);
    reservas.push({
        id: id, tipo: tipo, temp: temp, dias: dias,
        hospedes: hospedes, temCafe: temCafe, valor: valor
    });

    adicionarItem("e4_lista", "Reserva " + id + " (" + tipo + "/" + temp + "): " + moeda(valor));
    document.getElementById("form4").reset();
}

function relatorioReservas() {
    if (reservas.length === 0) {
        avisar("e4_lista", "Cadastre pelo menos uma reserva.");
        return;
    }

    let tipoS = 0;
    let tipoL = 0;
    let tipoP = 0;
    let tempB = 0;
    let tempA = 0;
    let tempF = 0;
    let total = 0;
    let comCafe = 0;
    let semCafe = 0;
    let ocupacao = 0;
    let maior = reservas[0];
    let menor = reservas[0];

    for (let i = 0; i < reservas.length; i++) {
        const r = reservas[i];
        total += r.valor;
        if (r.tipo === "S") {
            tipoS += r.valor;
        } else if (r.tipo === "L") {
            tipoL += r.valor;
        } else {
            tipoP += r.valor;
        }
        if (r.temp === "B") {
            tempB += r.valor;
        } else if (r.temp === "A") {
            tempA += r.valor;
        } else {
            tempF += r.valor;
        }
        ocupacao += r.dias * r.hospedes;
        if (r.temCafe) {
            comCafe++;
        } else {
            semCafe++;
        }
        if (r.valor > maior.valor) {
            maior = r;
        }
        if (r.valor < menor.valor) {
            menor = r;
        }
    }

    let html = "";
    html += '<div class="row"><span>Total de reservas</span><span>' + reservas.length + "</span></div>";
    html += '<div class="row"><span>Valor médio por reserva</span><span>' + moeda(total / reservas.length) + "</span></div>";
    html += '<p class="sub">Faturamento por tipo de quarto</p>';
    html += '<div class="row"><span>Standard</span><span>' + moeda(tipoS) + "</span></div>";
    html += '<div class="row"><span>Luxo</span><span>' + moeda(tipoL) + "</span></div>";
    html += '<div class="row"><span>Premium</span><span>' + moeda(tipoP) + "</span></div>";
    html += '<p class="sub">Faturamento por temporada</p>';
    html += '<div class="row"><span>Baixa</span><span>' + moeda(tempB) + "</span></div>";
    html += '<div class="row"><span>Alta</span><span>' + moeda(tempA) + "</span></div>";
    html += '<div class="row"><span>Feriado</span><span>' + moeda(tempF) + "</span></div>";
    html += '<p class="sub">Extremos e café da manhã</p>';
    html += '<div class="row"><span>Reserva mais cara</span><span>Cód. ' + maior.id + " · " + maior.tipo + "/" + maior.temp + " · " + maior.hospedes + " hósp. · " + moeda(maior.valor) + "</span></div>";
    html += '<div class="row"><span>Reserva mais barata</span><span>Cód. ' + menor.id + " · " + menor.tipo + "/" + menor.temp + " · " + menor.hospedes + " hósp. · " + moeda(menor.valor) + "</span></div>";
    html += '<div class="row"><span>Com café / sem café</span><span>' + comCafe + " / " + semCafe + "</span></div>";
    html += '<div class="row"><span>Ocupação total (diárias × hóspedes)</span><span>' + ocupacao + "</span></div>";
    html += '<div class="row"><span>Valor médio por hóspede</span><span>' + moeda(total / ocupacao) + "</span></div>";

    document.getElementById("e4_result").innerHTML = '<div class="panel"><h4>Relatório de ocupação</h4>' + html + "</div>";
}

/* =========================================================
   EXERCÍCIO 5 — TREINOS ESPORTIVOS
   ========================================================= */
const treinos = [];
const jogadores = [];

function multiplicadorTreino(tipo) {
    switch (tipo) {
        case "F": return 1.5;
        case "T": return 1.2;
        case "E": return 1.0;
        default: return 1.0;
    }
}

function calcularCarga(duracao, intensidade, tipo) {
    return (duracao / 10) * intensidade * multiplicadorTreino(tipo);
}

function buscarJogador(nome) {
    for (let i = 0; i < jogadores.length; i++) {
        if (jogadores[i].nome === nome) {
            return jogadores[i];
        }
    }
    return null;
}

function cadastrarTreino(evento) {
    evento.preventDefault();

    const cargaMax = pegarNumero("e5_carga");
    const codigo = pegarTexto("e5_codigo");
    const nome = pegarTexto("e5_nome");
    const posicao = pegarTexto("e5_pos");
    const tipo = pegarTexto("e5_tipo");
    const duracao = parseInt(document.getElementById("e5_dur").value, 10);
    let intensidade = parseInt(document.getElementById("e5_int").value, 10);

    if (!cargaMax || !codigo || !nome || !posicao || !tipo || !duracao) {
        avisar("e5_lista", "Preencha todos os campos do treino.");
        return;
    }

    // validação da intensidade com laço while (1 a 10)
    while (isNaN(intensidade) || intensidade < 1 || intensidade > 10) {
        const nova = prompt("Intensidade inválida. Digite um valor de 1 a 10:");
        if (nova === null) {
            return;
        }
        intensidade = parseInt(nova, 10);
    }

    if (jaExiste(treinos, "codigo", codigo)) {
        avisar("e5_lista", 'Código de treino "' + codigo + '" já cadastrado.');
        return;
    }

    const carga = calcularCarga(duracao, intensidade, tipo);

    let jog = buscarJogador(nome);
    if (jog === null) {
        jog = { nome: nome, posicao: posicao, cargaSemanal: 0, treinos: 0, risco: false };
        jogadores.push(jog);
    }
    jog.cargaSemanal += carga;
    jog.treinos++;
    if (jog.cargaSemanal > cargaMax) {
        jog.risco = true;
    }

    treinos.push({ codigo: codigo, nome: nome, posicao: posicao, tipo: tipo, carga: carga });

    adicionarItem("e5_lista", "Treino " + codigo + " · " + nome + " · carga " + numero(carga));
    document.getElementById("form5").reset();
}

function relatorioTreinos() {
    if (treinos.length === 0) {
        avisar("e5_lista", "Cadastre pelo menos um treino.");
        return;
    }

    let cargaF = 0;
    let cargaT = 0;
    let cargaE = 0;
    let qtdF = 0;
    let qtdT = 0;
    let qtdE = 0;
    let trGoleiro = 0;
    let cgGoleiro = 0;
    let trZagueiro = 0;
    let cgZagueiro = 0;
    let trMeio = 0;
    let cgMeio = 0;
    let trAtacante = 0;
    let cgAtacante = 0;

    for (let i = 0; i < treinos.length; i++) {
        const t = treinos[i];
        if (t.tipo === "F") {
            cargaF += t.carga;
            qtdF++;
        } else if (t.tipo === "T") {
            cargaT += t.carga;
            qtdT++;
        } else {
            cargaE += t.carga;
            qtdE++;
        }
        if (t.posicao === "G") {
            trGoleiro++;
            cgGoleiro += t.carga;
        } else if (t.posicao === "Z") {
            trZagueiro++;
            cgZagueiro += t.carga;
        } else if (t.posicao === "M") {
            trMeio++;
            cgMeio += t.carga;
        } else {
            trAtacante++;
            cgAtacante += t.carga;
        }
    }

    let maior = null;
    let menor = null;
    let comRisco = 0;
    for (let j = 0; j < jogadores.length; j++) {
        const jg = jogadores[j];
        if (maior === null || jg.cargaSemanal > maior.cargaSemanal) {
            maior = jg;
        }
        if (menor === null || jg.cargaSemanal < menor.cargaSemanal) {
            menor = jg;
        }
        if (jg.risco) {
            comRisco++;
        }
    }

    let mediaFisico = cargaF;
    if (qtdF > 0) {
        mediaFisico = cargaF / qtdF;
    }
    let mediaTecnico = cargaT;
    if (qtdT > 0) {
        mediaTecnico = cargaT / qtdT;
    }
    let mediaEstrategico = cargaE;
    if (qtdE > 0) {
        mediaEstrategico = cargaE / qtdE;
    }

    let mediaGoleiro = 0;
    if (trGoleiro > 0) {
        mediaGoleiro = cgGoleiro / trGoleiro;
    }
    let mediaZagueiro = 0;
    if (trZagueiro > 0) {
        mediaZagueiro = cgZagueiro / trZagueiro;
    }
    let mediaMeio = 0;
    if (trMeio > 0) {
        mediaMeio = cgMeio / trMeio;
    }
    let mediaAtacante = 0;
    if (trAtacante > 0) {
        mediaAtacante = cgAtacante / trAtacante;
    }

    let html = "";
    html += '<div class="row"><span>Total de treinos</span><span>' + treinos.length + "</span></div>";
    html += '<div class="row"><span>Jogadores cadastrados</span><span>' + jogadores.length + "</span></div>";
    html += '<div class="row"><span>Jogadores com risco de lesão</span><span>' + comRisco + "</span></div>";
    html += '<p class="sub">Extremos</p>';
    html += '<div class="row"><span>Maior carga semanal</span><span>' + maior.nome + " (" + maior.posicao + ") · " + maior.treinos + " treinos · " + numero(maior.cargaSemanal) + "</span></div>";
    html += '<div class="row"><span>Menor carga semanal</span><span>' + menor.nome + " (" + menor.posicao + ") · " + menor.treinos + " treinos · " + numero(menor.cargaSemanal) + "</span></div>";
    html += '<p class="sub">Carga média por tipo de treino</p>';
    html += '<div class="row"><span>Físico</span><span>' + numero(mediaFisico) + "</span></div>";
    html += '<div class="row"><span>Técnico</span><span>' + numero(mediaTecnico) + "</span></div>";
    html += '<div class="row"><span>Estratégico</span><span>' + numero(mediaEstrategico) + "</span></div>";
    html += '<p class="sub">Por posição (treinos · carga média)</p>';
    html += '<div class="row"><span>Goleiro</span><span>' + trGoleiro + " · " + numero(mediaGoleiro) + "</span></div>";
    html += '<div class="row"><span>Zagueiro</span><span>' + trZagueiro + " · " + numero(mediaZagueiro) + "</span></div>";
    html += '<div class="row"><span>Meio-campo</span><span>' + trMeio + " · " + numero(mediaMeio) + "</span></div>";
    html += '<div class="row"><span>Atacante</span><span>' + trAtacante + " · " + numero(mediaAtacante) + "</span></div>";

    document.getElementById("e5_result").innerHTML = '<div class="panel"><h4>Relatório de treinos</h4>' + html + "</div>";
}

/* =========================================================
   EXERCÍCIO 6 — VENDAS E COMISSÕES
   ========================================================= */
const vendas = [];
const vendedores = [];

function bonusCliente(tipo, valor) {
    if (tipo === "PF") {
        return valor * 0.02;
    }
    if (tipo === "PJ") {
        return valor * 0.03;
    }
    return 0;
}

function bonusRegiao(regiao, valor) {
    switch (regiao) {
        case "1":
        case "2": return valor * 0.01;   // Norte / Nordeste
        case "3": return 0;              // Sudeste
        case "4": return valor * 0.005;  // Sul
        default: return 0;
    }
}

function buscarVendedor(codigo) {
    for (let i = 0; i < vendedores.length; i++) {
        if (vendedores[i].codigo === codigo) {
            return vendedores[i];
        }
    }
    return null;
}

function cadastrarVenda(evento) {
    evento.preventDefault();

    const meta = pegarNumero("e6_meta");
    const percentual = pegarNumero("e6_perc") / 100;
    const codVenda = pegarTexto("e6_venda");
    const codVendedor = pegarTexto("e6_vendedor");
    const regiao = pegarTexto("e6_regiao");
    const valor = pegarNumero("e6_valor");
    const tipoCliente = pegarTexto("e6_tipo");

    if (!meta || isNaN(percentual) || !codVenda || !codVendedor || !regiao || !valor || !tipoCliente) {
        avisar("e6_lista", "Preencha todos os campos da venda.");
        return;
    }

    if (jaExiste(vendas, "codVenda", codVenda)) {
        avisar("e6_lista", 'Código de venda "' + codVenda + '" já cadastrado.');
        return;
    }

    const comissao = valor * percentual + bonusCliente(tipoCliente, valor) + bonusRegiao(regiao, valor);

    vendas.push({ codVenda: codVenda, regiao: regiao, valor: valor, tipoCliente: tipoCliente, comissao: comissao });

    let vd = buscarVendedor(codVendedor);
    if (vd === null) {
        vd = { codigo: codVendedor, vendido: 0, comissao: 0, meta: meta };
        vendedores.push(vd);
    }
    vd.vendido += valor;
    vd.comissao += comissao;

    adicionarItem("e6_lista", "Venda " + codVenda + " · vendedor " + codVendedor + " · comissão " + moeda(comissao));
    document.getElementById("form6").reset();
}

function relatorioVendas() {
    if (vendas.length === 0) {
        avisar("e6_lista", "Cadastre pelo menos uma venda.");
        return;
    }

    let valorNorte = 0;
    let comNorte = 0;
    let qtdNorte = 0;
    let valorNordeste = 0;
    let comNordeste = 0;
    let qtdNordeste = 0;
    let valorSudeste = 0;
    let comSudeste = 0;
    let qtdSudeste = 0;
    let valorSul = 0;
    let comSul = 0;
    let qtdSul = 0;
    let valorPF = 0;
    let valorPJ = 0;
    let comissaoGeral = 0;

    for (let i = 0; i < vendas.length; i++) {
        const v = vendas[i];
        if (v.regiao === "1") {
            valorNorte += v.valor;
            comNorte += v.comissao;
            qtdNorte++;
        } else if (v.regiao === "2") {
            valorNordeste += v.valor;
            comNordeste += v.comissao;
            qtdNordeste++;
        } else if (v.regiao === "3") {
            valorSudeste += v.valor;
            comSudeste += v.comissao;
            qtdSudeste++;
        } else {
            valorSul += v.valor;
            comSul += v.comissao;
            qtdSul++;
        }
        if (v.tipoCliente === "PF") {
            valorPF += v.valor;
        } else {
            valorPJ += v.valor;
        }
        comissaoGeral += v.comissao;
    }

    let maiorVenda = null;
    let maiorComissao = null;
    let bateramMeta = 0;
    for (let j = 0; j < vendedores.length; j++) {
        const vd = vendedores[j];
        if (maiorVenda === null || vd.vendido > maiorVenda.vendido) {
            maiorVenda = vd;
        }
        if (maiorComissao === null || vd.comissao > maiorComissao.comissao) {
            maiorComissao = vd;
        }
        if (vd.vendido >= vd.meta) {
            bateramMeta++;
        }
    }

    let mediaComNorte = 0;
    if (qtdNorte > 0) {
        mediaComNorte = comNorte / qtdNorte;
    }
    let mediaComNordeste = 0;
    if (qtdNordeste > 0) {
        mediaComNordeste = comNordeste / qtdNordeste;
    }
    let mediaComSudeste = 0;
    if (qtdSudeste > 0) {
        mediaComSudeste = comSudeste / qtdSudeste;
    }
    let mediaComSul = 0;
    if (qtdSul > 0) {
        mediaComSul = comSul / qtdSul;
    }

    let html = "";
    html += '<div class="row"><span>Total de vendas</span><span>' + vendas.length + "</span></div>";
    html += '<div class="row"><span>Comissão média geral</span><span>' + moeda(comissaoGeral / vendas.length) + "</span></div>";
    html += '<div class="row"><span>Vendedores que bateram a meta</span><span>' + bateramMeta + "</span></div>";
    html += '<p class="sub">Valor vendido por região</p>';
    html += '<div class="row"><span>Norte</span><span>' + moeda(valorNorte) + "</span></div>";
    html += '<div class="row"><span>Nordeste</span><span>' + moeda(valorNordeste) + "</span></div>";
    html += '<div class="row"><span>Sudeste</span><span>' + moeda(valorSudeste) + "</span></div>";
    html += '<div class="row"><span>Sul</span><span>' + moeda(valorSul) + "</span></div>";
    html += '<p class="sub">Valor vendido por tipo de cliente</p>';
    html += '<div class="row"><span>Pessoa Física</span><span>' + moeda(valorPF) + "</span></div>";
    html += '<div class="row"><span>Pessoa Jurídica</span><span>' + moeda(valorPJ) + "</span></div>";
    html += '<p class="sub">Destaques</p>';
    html += '<div class="row"><span>Maior valor de vendas</span><span>' + maiorVenda.codigo + " — " + moeda(maiorVenda.vendido) + "</span></div>";
    html += '<div class="row"><span>Maior comissão total</span><span>' + maiorComissao.codigo + " — " + moeda(maiorComissao.comissao) + "</span></div>";
    html += '<p class="sub">Comissão média por região</p>';
    html += '<div class="row"><span>Norte</span><span>' + moeda(mediaComNorte) + "</span></div>";
    html += '<div class="row"><span>Nordeste</span><span>' + moeda(mediaComNordeste) + "</span></div>";
    html += '<div class="row"><span>Sudeste</span><span>' + moeda(mediaComSudeste) + "</span></div>";
    html += '<div class="row"><span>Sul</span><span>' + moeda(mediaComSul) + "</span></div>";

    document.getElementById("e6_result").innerHTML = '<div class="panel"><h4>Relatório de performance</h4>' + html + "</div>";
}




function iniciar() {
    // cada formulário chama a sua função ao ser enviado
    document.getElementById("form1").addEventListener("submit", cadastrarPedido);
    document.getElementById("form2").addEventListener("submit", cadastrarFuncionario);
    document.getElementById("form3").addEventListener("submit", cadastrarOrdem);
    document.getElementById("form4").addEventListener("submit", cadastrarReserva);
    document.getElementById("form5").addEventListener("submit", cadastrarTreino);
    document.getElementById("form6").addEventListener("submit", cadastrarVenda);

    // cada botão "Gerar relatório"
    document.getElementById("rel1").addEventListener("click", relatorioPedidos);
    document.getElementById("rel2").addEventListener("click", relatorioFolha);
    document.getElementById("rel3").addEventListener("click", relatorioProducao);
    document.getElementById("rel4").addEventListener("click", relatorioReservas);
    document.getElementById("rel5").addEventListener("click", relatorioTreinos);
    document.getElementById("rel6").addEventListener("click", relatorioVendas);

    // menu (aparece no celular)
    document.getElementById("navToggle").addEventListener("click", abrirFecharMenu);

}

document.addEventListener("DOMContentLoaded", iniciar);
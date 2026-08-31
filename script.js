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

/* Mostra uma mensagem de aviso (vermelha, ou verde quando ok = true) */
function avisar(idLista, mensagem, ok) {
    const lista = document.getElementById(idLista);
    if (lista.getElementsByClassName("muted").length > 0) {
        lista.innerHTML = "";
    }
    let classe = "flash";
    if (ok) {
        classe = "flash ok";
    }
    lista.innerHTML = '<p class="' + classe + '">' + mensagem + "</p>" + lista.innerHTML;
}

/* Adiciona uma linha na lista de itens cadastrados */
function adicionarItem(idLista, texto) {
    const lista = document.getElementById(idLista);
    if (lista.getElementsByClassName("muted").length > 0) {
        lista.innerHTML = "";
    }
    lista.innerHTML = "<p>" + texto + "</p>" + lista.innerHTML;
}

/* Peças usadas para montar os relatórios */
function linha(rotulo, valor) {
    return '<div class="row"><span>' + rotulo + "</span><span>" + valor + "</span></div>";
}

function subtitulo(texto) {
    return '<p class="sub">' + texto + "</p>";
}

function painel(titulo, conteudo) {
    return '<div class="panel"><h4>' + titulo + "</h4>" + conteudo + "</div>";
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
    const ehTexto = isNaN(Number(valor));
    while (jaExiste(lista, campo, codigo)) {
        const nova = prompt('Código "' + codigo + '" já cadastrado. Digite outro código:');
        if (nova === null || nova.trim() === "") {
            return null;
        }
        if (ehTexto) {
            codigo = nova.trim();
        } else {
            codigo = Number(nova);
        }
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
    html += linha("Total de pedidos", pedidos.length);
    html += linha("Valor médio por pedido", moeda(media));
    html += subtitulo("Total acumulado por região");
    html += linha("Sudeste", moeda(totalSudeste));
    html += linha("Sul", moeda(totalSul));
    html += linha("Centro-Oeste", moeda(totalCentroOeste));
    html += subtitulo("Extremos");
    html += linha("Pedido mais caro", "Cód. " + maisCaro.id + " — " + moeda(maisCaro.valor));
    html += linha("Pedido mais barato", "Cód. " + maisBarato.id + " — " + moeda(maisBarato.valor));

    document.getElementById("e1_result").innerHTML = painel("Relatório final", html);
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
    html += linha("Funcionários cadastrados", funcionarios.length);
    html += linha("Média salarial geral", moeda(total / funcionarios.length));
    html += linha("Média — operacionais (F)", moeda(mediaF));
    html += linha("Média — gerentes (G)", moeda(mediaG));
    html += subtitulo("Extremos");
    html += linha("Maior salário", "Cód. " + maior.id + " · " + maior.categoria + "/" + maior.turno + " · " + moeda(maior.salarioFinal));
    html += linha("Menor salário", "Cód. " + menor.id + " · " + menor.categoria + "/" + menor.turno + " · " + moeda(menor.salarioFinal));
    html += subtitulo("Funcionários por faixa de bônus");
    html += linha("Bônus 10%", faixa10);
    html += linha("Bônus 5%", faixa5);
    html += linha("Bônus 2%", faixa2);
    html += linha("Sem bônus", faixaNenhum);

    document.getElementById("e2_result").innerHTML = painel("Relatório mensal", html);
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
    html += linha("Total de ordens", ordens.length);
    html += linha("Média de custo por ordem", moeda(totalCusto / ordens.length));
    html += subtitulo("Estoque final por tipo");
    html += linha("Padrão", estoquePadrao);
    html += linha("Premium", estoquePremium);
    html += linha("Sob encomenda", estoqueEncomenda);
    html += subtitulo("Extremos e alertas");
    html += linha("Maior custo", "Ordem " + maior.idOrdem + " — " + moeda(maior.custoTotal));
    html += linha("Menor custo", "Ordem " + menor.idOrdem + " — " + moeda(menor.custoTotal));
    html += linha("Alertas de estoque alto", alertasAlto);
    html += linha("Alertas de estoque crítico", alertasCritico);
    html += subtitulo("Consolidado por produto");
    for (let k = 0; k < porProduto.length; k++) {
        html += linha("Produto " + porProduto[k].codigo,
            "estoque " + porProduto[k].estoque + " · " + moeda(porProduto[k].investido));
    }

    document.getElementById("e3_result").innerHTML = painel("Relatório consolidado", html);
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
    html += linha("Total de reservas", reservas.length);
    html += linha("Valor médio por reserva", moeda(total / reservas.length));
    html += subtitulo("Faturamento por tipo de quarto");
    html += linha("Standard", moeda(tipoS));
    html += linha("Luxo", moeda(tipoL));
    html += linha("Premium", moeda(tipoP));
    html += subtitulo("Faturamento por temporada");
    html += linha("Baixa", moeda(tempB));
    html += linha("Alta", moeda(tempA));
    html += linha("Feriado", moeda(tempF));
    html += subtitulo("Extremos e café da manhã");
    html += linha("Reserva mais cara", "Cód. " + maior.id + " · " + maior.tipo + "/" + maior.temp + " · " + maior.hospedes + " hósp. · " + moeda(maior.valor));
    html += linha("Reserva mais barata", "Cód. " + menor.id + " · " + menor.tipo + "/" + menor.temp + " · " + menor.hospedes + " hósp. · " + moeda(menor.valor));
    html += linha("Com café / sem café", comCafe + " / " + semCafe);
    html += linha("Ocupação total (diárias × hóspedes)", ocupacao);
    html += linha("Valor médio por hóspede", moeda(total / ocupacao));

    document.getElementById("e4_result").innerHTML = painel("Relatório de ocupação", html);
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
    html += linha("Total de treinos", treinos.length);
    html += linha("Jogadores cadastrados", jogadores.length);
    html += linha("Jogadores com risco de lesão", comRisco);
    html += subtitulo("Extremos");
    html += linha("Maior carga semanal", maior.nome + " (" + maior.posicao + ") · " + maior.treinos + " treinos · " + numero(maior.cargaSemanal));
    html += linha("Menor carga semanal", menor.nome + " (" + menor.posicao + ") · " + menor.treinos + " treinos · " + numero(menor.cargaSemanal));
    html += subtitulo("Carga média por tipo de treino");
    html += linha("Físico", numero(mediaFisico));
    html += linha("Técnico", numero(mediaTecnico));
    html += linha("Estratégico", numero(mediaEstrategico));
    html += subtitulo("Por posição (treinos · carga média)");
    html += linha("Goleiro", trGoleiro + " · " + numero(mediaGoleiro));
    html += linha("Zagueiro", trZagueiro + " · " + numero(mediaZagueiro));
    html += linha("Meio-campo", trMeio + " · " + numero(mediaMeio));
    html += linha("Atacante", trAtacante + " · " + numero(mediaAtacante));

    document.getElementById("e5_result").innerHTML = painel("Relatório de treinos", html);
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
    html += linha("Total de vendas", vendas.length);
    html += linha("Comissão média geral", moeda(comissaoGeral / vendas.length));
    html += linha("Vendedores que bateram a meta", bateramMeta);
    html += subtitulo("Valor vendido por região");
    html += linha("Norte", moeda(valorNorte));
    html += linha("Nordeste", moeda(valorNordeste));
    html += linha("Sudeste", moeda(valorSudeste));
    html += linha("Sul", moeda(valorSul));
    html += subtitulo("Valor vendido por tipo de cliente");
    html += linha("Pessoa Física", moeda(valorPF));
    html += linha("Pessoa Jurídica", moeda(valorPJ));
    html += subtitulo("Destaques");
    html += linha("Maior valor de vendas", maiorVenda.codigo + " — " + moeda(maiorVenda.vendido));
    html += linha("Maior comissão total", maiorComissao.codigo + " — " + moeda(maiorComissao.comissao));
    html += subtitulo("Comissão média por região");
    html += linha("Norte", moeda(mediaComNorte));
    html += linha("Nordeste", moeda(mediaComNordeste));
    html += linha("Sudeste", moeda(mediaComSudeste));
    html += linha("Sul", moeda(mediaComSul));

    document.getElementById("e6_result").innerHTML = painel("Relatório de performance", html);
}

/* =========================================================
   LIGAÇÃO DOS EVENTOS + NAVEGAÇÃO
   ========================================================= */
function abrirFecharMenu() {
    const nav = document.getElementById("nav");
    const botao = document.getElementById("navToggle");
    if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        botao.setAttribute("aria-expanded", "false");
    } else {
        nav.classList.add("open");
        botao.setAttribute("aria-expanded", "true");
    }
}

function fecharMenu() {
    document.getElementById("nav").classList.remove("open");
}

function atualizarNavegacao() {
    const toTop = document.getElementById("toTop");
    if (window.scrollY > 500) {
        toTop.classList.add("show");
    } else {
        toTop.classList.remove("show");
    }

    const secoes = document.getElementsByClassName("ex");
    let atual = "";
    for (let i = 0; i < secoes.length; i++) {
        if (window.scrollY >= secoes[i].offsetTop - 120) {
            atual = secoes[i].id;
        }
    }

    const links = document.getElementById("nav").getElementsByTagName("a");
    for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute("href") === "#" + atual) {
            links[i].classList.add("active");
        } else {
            links[i].classList.remove("active");
        }
    }
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

    const linksMenu = document.getElementById("nav").getElementsByTagName("a");
    for (let i = 0; i < linksMenu.length; i++) {
        linksMenu[i].addEventListener("click", fecharMenu);
    }

    // botão "voltar ao topo" + link ativo do menu conforme a rolagem
    window.addEventListener("scroll", atualizarNavegacao);

    // ano no rodapé
    document.getElementById("ano").textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", iniciar);

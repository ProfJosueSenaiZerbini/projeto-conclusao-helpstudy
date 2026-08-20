<<<<<<< HEAD
// =====================================================================
// Lógica da página Dashboard
// =====================================================================

const ICONES_MATERIA = {
    'fa-square-root-variable': 'fa-solid fa-square-root-variable',
    'fa-language': 'fa-solid fa-language',
    'fa-landmark': 'fa-solid fa-landmark',
    'fa-earth-americas': 'fa-solid fa-earth-americas',
    'fa-flask': 'fa-solid fa-flask',
    'fa-comments': 'fa-solid fa-comments'
};

function iconeClasse(icone) {
    return ICONES_MATERIA[icone] || 'fa-solid fa-book';
}

function desenharAnelProgresso(percentual) {
    const raio = 46;
    const circunferencia = 2 * Math.PI * raio;
    const offset = circunferencia - (percentual / 100) * circunferencia;
    return `
        <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="${raio}" fill="none" stroke="var(--surface-soft)" stroke-width="12"/>
            <circle cx="60" cy="60" r="${raio}" fill="none" stroke="url(#gradRing)" stroke-width="12"
                stroke-linecap="round" stroke-dasharray="${circunferencia}" stroke-dashoffset="${offset}"
                transform="rotate(-90 60 60)" style="transition: stroke-dashoffset 1s ease"/>
            <defs>
                <linearGradient id="gradRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#FF7CB4"/>
                    <stop offset="100%" stop-color="#C1157A"/>
                </linearGradient>
            </defs>
        </svg>`;
}

async function carregarDashboard() {
    const gridMaterias = document.getElementById('grid-materias');
    const painelPlano = document.getElementById('mini-plano');
    const painelAnel = document.getElementById('progresso-anel');
    const saudacaoHora = document.getElementById('saudacao-hora');

    const hora = new Date().getHours();
    saudacaoHora.textContent = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

    // Matérias
    const respMaterias = await API.chamar('/api/materias');
    if (respMaterias && respMaterias.sucesso) {
        gridMaterias.innerHTML = respMaterias.materias
            .map(
                (m) => `
            <a class="card materia-card" href="/exercicios?materia=${m.slug}">
                <div class="materia-card__icon" style="background:${m.cor}">
                    <i class="${iconeClasse(m.icone)}"></i>
                </div>
                <div>
                    <h3>${m.nome}</h3>
                    <p>${m.descricao || ''}</p>
                </div>
                <div class="materia-card__footer">
                    <span><i class="fa-regular fa-circle-question"></i> ${m.total_questoes} questões</span>
                    <i class="fa-solid fa-arrow-right"></i>
                </div>
            </a>`
            )
            .join('');
    }

    // Progresso geral
    const respProgresso = await API.chamar('/api/progresso');
    if (respProgresso && respProgresso.sucesso) {
        const { percentual } = respProgresso.geral;
        painelAnel.innerHTML = `
            ${desenharAnelProgresso(percentual)}
            <div class="progress-ring-label">
                <strong>${percentual}%</strong>
                <span>Progresso geral</span>
            </div>`;

        document.getElementById('stat-respondidas').textContent = respProgresso.geral.total;
        document.getElementById('stat-corretas').textContent = respProgresso.geral.corretas;
    }

    // Plano de estudos (mini resumo)
    const respPlano = await API.chamar('/api/progresso/plano');
    if (respPlano && respPlano.sucesso) {
        if (respPlano.plano.length === 0) {
            painelPlano.innerHTML = `<div class="empty-state"><i class="fa-regular fa-face-smile"></i>Responda algumas questões para gerar seu plano.</div>`;
        } else {
            painelPlano.innerHTML = respPlano.plano
                .slice(0, 4)
                .map(
                    (p) => `
                <div class="mini-plano-item">
                    <div class="mini-plano-item__icon" style="background:${p.cor}">
                        <i class="${iconeClasse(p.icone)}"></i>
                    </div>
                    <div class="mini-plano-item__text">
                        <strong>${p.materia_nome}</strong>
                        <span>${p.motivo}</span>
                    </div>
                    <span class="badge badge-${p.prioridade === 'alta' ? 'danger' : p.prioridade === 'media' ? 'neutral' : 'success'}">${p.prioridade}</span>
                </div>`
                )
                .join('');
        }
    }
}

document.addEventListener('DOMContentLoaded', carregarDashboard);
=======
// ==========================================
// HELP STUDY
// DASHBOARD
// ==========================================

// ---------- USUÁRIO ----------

const usuario = JSON.parse(localStorage.getItem("usuario"));

if (usuario) {

    document.getElementById("nomeUsuario").innerHTML =
        `Olá, ${usuario.nome} 👋`;

}

// ---------- PROGRESSO ----------

// Cada matéria possui 5 lições

const TOTAL_LICOES = 5;

// Se não existir progresso salvo,
// cria tudo zerado.

if (!localStorage.getItem("progresso")) {

    const progressoInicial = {

        matematica:0,
        portugues:0,
        historia:0,
        geografia:0,
        ciencias:0,
        ingles:0

    };

    localStorage.setItem(
        "progresso",
        JSON.stringify(progressoInicial)
    );

}

const progresso = JSON.parse(
    localStorage.getItem("progresso")
);

// ---------- ATUALIZA UMA MATÉRIA ----------

function atualizarMateria(nome){

    const concluidas = progresso[nome];

    const porcentagem =
        Math.round((concluidas / TOTAL_LICOES) * 100);

    document.getElementById(
        `licoes-${nome}`
    ).innerHTML =
        `${concluidas} de ${TOTAL_LICOES} lições concluídas`;

    document.getElementById(
        `barra-${nome}`
    ).style.width =
        porcentagem + "%";

    document.getElementById(
        `porcentagem-${nome}`
    ).innerHTML =
        porcentagem + "%";

}

// ---------- ATUALIZA TODAS ----------

atualizarMateria("matematica");
atualizarMateria("portugues");
atualizarMateria("historia");
atualizarMateria("geografia");
atualizarMateria("ciencias");
atualizarMateria("ingles");

// ---------- PROGRESSO GERAL ----------

function atualizarProgressoGeral(){

    let soma = 0;

    for(let materia in progresso){

        soma += progresso[materia];

    }

    const totalLicoes =
        TOTAL_LICOES * 6;

    const porcentagem =
        Math.round((soma / totalLicoes) * 100);

    document.getElementById(
        "progressoTotal"
    ).innerHTML =
        porcentagem + "%";

}

atualizarProgressoGeral();

// ---------- CONTINUAR ESTUDANDO ----------

const materias = [

    "matematica",
    "portugues",
    "historia",
    "geografia",
    "ciencias",
    "ingles"

];

let proxima = null;

for(const materia of materias){

    if(progresso[materia] < TOTAL_LICOES){

        proxima = materia;

        break;

    }

}

const texto = document.getElementById("proximaLicao");
const botao = document.getElementById("btnContinuar");

if(proxima){

    texto.innerHTML =
        `Próxima matéria: ${proxima.charAt(0).toUpperCase() + proxima.slice(1)}`;

    botao.disabled = false;

    botao.onclick = function(){

        window.location.href =
            `materia.html?materia=${proxima}`;

    }

}else{

    texto.innerHTML =
        "Parabéns! Você concluiu todas as matérias.";

    botao.innerHTML =
        "Concluído";

}

// ---------- DARK MODE ----------

const btnTema = document.getElementById("btnTema");

const temaSalvo = localStorage.getItem("tema");

if(temaSalvo === "dark"){

    document.body.classList.add("dark");

    btnTema.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

}

btnTema.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("tema","dark");

        btnTema.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    }else{

        localStorage.setItem("tema","light");

        btnTema.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

});

// ---------- LOGOUT ----------

document
.getElementById("logout")
.addEventListener("click",()=>{

    localStorage.removeItem("usuario");

    window.location.href = "login.html";

});
>>>>>>> 2d02819e18d0c0429f28a9337756c2d567c01165

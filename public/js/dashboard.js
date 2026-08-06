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
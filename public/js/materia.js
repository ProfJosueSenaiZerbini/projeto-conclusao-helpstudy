// ===============================
// HELP STUDY
// MATÉRIAS
// ===============================

const TOTAL_LICOES = 5;

// Qual matéria foi escolhida?

const parametros = new URLSearchParams(window.location.search);

const materia = parametros.get("materia");

// Nome da matéria

const nomes = {

    matematica:"Matemática",

    portugues:"Português",

    historia:"História",

    geografia:"Geografia",

    ciencias:"Ciências",

    ingles:"Inglês"

};

document.getElementById("tituloMateria").innerHTML =
nomes[materia];

// -------------------------------
// Progresso

const progresso = JSON.parse(
localStorage.getItem("progresso")
);

const concluidas = progresso[materia];

const porcentagem =
Math.round((concluidas/TOTAL_LICOES)*100);

document.getElementById("textoProgresso").innerHTML =
porcentagem+"%";

document.getElementById("barraProgresso").style.width =
porcentagem+"%";

// -------------------------------
// Desbloquear lições

for(let i=2;i<=5;i++){

    if(concluidas >= (i-1)){

        document.getElementById("status"+i).innerHTML="Disponível";

        document.getElementById("status"+i).className="status disponivel";

        document.getElementById("btn"+i).disabled=false;

        document.getElementById("btn"+i).className="btn btn-primary";

        document.getElementById("btn"+i).innerHTML="Iniciar";

        document.getElementById("btn"+i).onclick=function(){

            abrirLicao(i);

        }

    }

}

// -------------------------------

function abrirLicao(numero){

    localStorage.setItem(

        "licaoAtual",

        JSON.stringify({

            materia:materia,

            licao:numero

        })

    );

    window.location.href="exercicios.html";

}
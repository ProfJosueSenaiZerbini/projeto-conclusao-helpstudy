// ======================================
// HELP STUDY
// EXERCÍCIOS
// ======================================

// Recupera a lição atual
const licaoAtual = JSON.parse(localStorage.getItem("licaoAtual"));

if (!licaoAtual) {
    window.location.href = "dashboard.html";
}

// Matéria

document.getElementById("nomeMateria").textContent =
    licaoAtual.materia.charAt(0).toUpperCase() +
    licaoAtual.materia.slice(1);

// ===============================
// QUESTÕES
// ===============================

const questoes = [

{
pergunta:"Quanto é 5 + 8?",

alternativas:[
"10",
"11",
"12",
"13"
],

correta:3

},

{
pergunta:"Quanto é 12 - 4?",

alternativas:[
"6",
"8",
"9",
"10"
],

correta:1

},

{
pergunta:"Quanto é 7 x 6?",

alternativas:[
"40",
"42",
"44",
"48"
],

correta:1

},

{
pergunta:"Quanto é 36 ÷ 6?",

alternativas:[
"5",
"6",
"7",
"8"
],

correta:1

},

{
pergunta:"Quanto é 15 + 20?",

alternativas:[
"35",
"30",
"25",
"40"
],

correta:0

},

{
pergunta:"Quanto é 18 - 9?",

alternativas:[
"7",
"8",
"9",
"10"
],

correta:2

},

{
pergunta:"Quanto é 9 x 8?",

alternativas:[
"72",
"70",
"74",
"76"
],

correta:0

},

{
pergunta:"Quanto é 81 ÷ 9?",

alternativas:[
"7",
"8",
"9",
"10"
],

correta:2

},

{
pergunta:"Quanto é 30 + 12?",

alternativas:[
"40",
"41",
"42",
"43"
],

correta:2

},

{
pergunta:"Quanto é 50 - 25?",

alternativas:[
"20",
"25",
"30",
"35"
],

correta:1

}

];

let indice = 0;

let respostas = new Array(questoes.length).fill(null);

// ===============================
// MOSTRAR QUESTÃO
// ===============================

function mostrarQuestao(){

    const q = questoes[indice];

    document.getElementById("numeroQuestao").innerHTML =
    `Questão ${indice+1} de ${questoes.length}`;

    document.getElementById("pergunta").innerHTML =
    q.pergunta;

    const form =
    document.getElementById("formAlternativas");

    form.innerHTML="";

    q.alternativas.forEach((texto,i)=>{

        form.innerHTML +=

        `
        <div class="alternativa">

            <input
                type="radio"
                name="resposta"
                id="alt${i}"
                value="${i}"
                ${respostas[indice]===i?"checked":""}>

            <label for="alt${i}">
                ${texto}
            </label>

        </div>
        `;

    });

    document.getElementById("barraQuestao").style.width =
    ((indice+1)/questoes.length)*100+"%";

}

mostrarQuestao();

// ===============================
// SALVAR RESPOSTA
// ===============================

function salvarResposta(){

    const marcada =
    document.querySelector("input[name='resposta']:checked");

    if(marcada){

        respostas[indice] =
        Number(marcada.value);

    }

}

// Próxima

document
.getElementById("proximo")
.onclick = ()=>{

    salvarResposta();

    if(indice < questoes.length-1){

        indice++;

        mostrarQuestao();

    }else{

        finalizar();

    }

};

// Anterior

document
.getElementById("anterior")
.onclick = ()=>{

    salvarResposta();

    if(indice>0){

        indice--;

        mostrarQuestao();

    }

};

// ===============================
// CRONÔMETRO
// ===============================

let tempo = 600;

const relogio =
document.getElementById("tempo");

const cronometro =
setInterval(()=>{

tempo--;

const min =
String(Math.floor(tempo/60))
.padStart(2,"0");

const seg =
String(tempo%60)
.padStart(2,"0");

relogio.innerHTML =
`${min}:${seg}`;

if(tempo<=0){

clearInterval(cronometro);

finalizar();

}

},1000);

// ===============================
// FINALIZAR
// ===============================

function finalizar(){

salvarResposta();

clearInterval(cronometro);

let acertos=0;

questoes.forEach((q,i)=>{

if(respostas[i]===q.correta){

acertos++;

}

});

const erros =
questoes.length-acertos;

// Salva resultado

localStorage.setItem(

"resultado",

JSON.stringify({

acertos,

erros,

nota:acertos,

materia:licaoAtual.materia,

licao:licaoAtual.licao

})

);

// Atualiza progresso

let progresso =
JSON.parse(localStorage.getItem("progresso"));

if(progresso[licaoAtual.materia] < licaoAtual.licao){

progresso[licaoAtual.materia] =
licaoAtual.licao;

localStorage.setItem(

"progresso",

JSON.stringify(progresso)

);

}

window.location.href =
"resultado.html";

}
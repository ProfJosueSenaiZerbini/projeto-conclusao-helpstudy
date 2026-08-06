const resultado =
JSON.parse(
localStorage.getItem("resultado")
);

if(!resultado){

    window.location.href="dashboard.html";

}

document.getElementById("acertos").innerHTML =
resultado.acertos;

document.getElementById("erros").innerHTML =
resultado.erros;

document.getElementById("nota").innerHTML =
resultado.nota.toFixed(1);

document
.getElementById("voltar")
.onclick=()=>{

window.location.href="dashboard.html";

};
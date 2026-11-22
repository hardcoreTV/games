/* =====================================================================
   GAMES TV - lista de jogos
   Para adicionar um jogo, copie um bloco abaixo e troque os dados.

   id        -> nome curto, sem espaço (ex: "cobrinha"). Não repita.
   nome      -> nome que aparece na tela
   url       -> link do Dropbox terminando em dl=1 (arquivo .html OU .zip)
   versao    -> mude (ex: "1.1") quando enviar um jogo novo no mesmo link:
                o app baixa de novo sozinho na próxima vez que abrir
   icone     -> um emoji
   descricao -> texto pequeno
   ===================================================================== */
const JOGOS = [
  {
    id: "jogo1",
    nome: "ESTRELA SOMBRIA: A GUARDIÃ DO CRISTAL DO SOL",
    url: "https://www.dropbox.com/scl/fi/xhz5to3me16n97zy0sp1s/ESTRELA-SOMBRIA-A-GUARDI-DO-CRISTAL-DO-SOL.html?rlkey=9yntf7tioqcc0jpgw2ejh25tu&st=hb3b7m1i&dl=1",
    versao: "1.0",
    icone: "🚀",
    descricao: "Pilote a nave da Capitã Cleo, enfrente chefões únicos, desvie de meteoros e recupere o Cristal do Sol. Tiro automático, só setas e OK."
  },
  {
    id: "jogo2",
    nome: "Road Fury",
    url: "https://www.dropbox.com/scl/fi/yban0wonfg4gf2dipli6n/Road-Fury.html?rlkey=vs6vy4byvc507bq7psaaxh9ac&st=meh9rlak&dl=1",
    versao: "1.0",
    icone: "🏍️",
    descricao: "Corrida de moto de ação para TV box: desvie, pegue nitro, atire mísseis e chegue em 1º entre 12 pilotos."
  },
  {
    id: "jogo3",
    nome: "Nome do Jogo 2",
    url: "COLE_AQUI_O_LINK_DO_DROPBOX_COM_dl=1",
    versao: "1.0",
    icone: "🚀",
    descricao: "Descrição curta do jogo."
  }
];

/* ------------------------- código (não precisa mexer) ------------------------- */

const noApp = typeof window.GamesTV !== "undefined";
let ultimoId = null;

const grade = document.getElementById("grade");

JOGOS.forEach(function (j) {
  const b = document.createElement("button");
  b.className = "card";
  b.setAttribute("data-nav", "");
  b.setAttribute("data-id", j.id);

  const ic = document.createElement("span");
  ic.className = "icone";
  ic.textContent = j.icone || "🎮";
  const nm = document.createElement("span");
  nm.className = "nome";
  nm.textContent = j.nome;
  const ds = document.createElement("span");
  ds.className = "desc";
  ds.textContent = j.descricao || "";
  const bd = document.createElement("span");
  bd.className = "badge";

  b.append(ic, nm, ds, bd);
  b.addEventListener("click", function () { jogar(j); });
  grade.appendChild(b);
});

document.getElementById("btnSair").addEventListener("click", function () {
  if (noApp) window.GamesTV.sair();
  else aviso("O botão Sair funciona só dentro do app Games TV");
});

function jogar(j) {
  ultimoId = j.id;
  if (noApp) window.GamesTV.jogar(j.id, j.nome, j.url, j.versao || "");
  else aviso("Abra esta página pelo app Games TV para jogar");
}

function baixados() {
  try { return JSON.parse(window.GamesTV.baixados()); } catch (e) { return {}; }
}

function atualizarBadges() {
  const lista = noApp ? baixados() : {};
  JOGOS.forEach(function (j) {
    const card = grade.querySelector('[data-id="' + j.id + '"]');
    const bd = card.querySelector(".badge");
    if (lista[j.id] === undefined) {
      bd.textContent = "⬇ Baixar";
      bd.className = "badge";
    } else if ((j.versao || "") !== lista[j.id]) {
      bd.textContent = "↻ Atualização";
      bd.className = "badge upd";
    } else {
      bd.textContent = "✓ Baixado";
      bd.className = "badge ok";
    }
  });
}

/* o app chama estas funções */
window.onJogoBaixado = function () { atualizarBadges(); };
window.onJogoApagado = function () { atualizarBadges(); };
window.onVoltouDosJogos = function () {
  atualizarBadges();
  const el = ultimoId && grade.querySelector('[data-id="' + ultimoId + '"]');
  (el || document.querySelector("[data-nav]")).focus();
};

/* ---------- navegação pelo controle remoto ---------- */

function mover(dir) {
  const els = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  const atual = document.activeElement;
  if (els.indexOf(atual) < 0) { els[0].focus(); return; }

  const r = atual.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let melhor = null, menor = 1e9;

  els.forEach(function (el) {
    if (el === atual) return;
    const b = el.getBoundingClientRect();
    const dx = b.left + b.width / 2 - cx, dy = b.top + b.height / 2 - cy;
    let ok, d;
    if (dir === "ArrowRight")      { ok = dx > 10 && Math.abs(dy) < r.height; d = Math.abs(dx) + Math.abs(dy) * 2; }
    else if (dir === "ArrowLeft")  { ok = dx < -10 && Math.abs(dy) < r.height; d = Math.abs(dx) + Math.abs(dy) * 2; }
    else if (dir === "ArrowDown")  { ok = dy > 10; d = Math.abs(dy) + Math.abs(dx) * 2; }
    else                           { ok = dy < -10; d = Math.abs(dy) + Math.abs(dx) * 2; }
    if (ok && d < menor) { menor = d; melhor = el; }
  });

  if (melhor) {
    melhor.focus();
    melhor.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}

const TECLAS = { 37: "ArrowLeft", 38: "ArrowUp", 39: "ArrowRight", 40: "ArrowDown" };

document.addEventListener("keydown", function (e) {
  const dir = (e.key && e.key.indexOf("Arrow") === 0) ? e.key : TECLAS[e.keyCode];
  if (dir) { e.preventDefault(); mover(dir); return; }

  // OK / Enter do controle
  if (e.key === "Enter" || e.keyCode === 13 || e.keyCode === 23) {
    const a = document.activeElement;
    if (a && a.hasAttribute && a.hasAttribute("data-nav")) {
      e.preventDefault();
      if (!e.repeat) a.click();
    }
  }
});

let tAviso;
function aviso(txt) {
  const el = document.getElementById("aviso");
  el.textContent = txt;
  el.classList.add("show");
  clearTimeout(tAviso);
  tAviso = setTimeout(function () { el.classList.remove("show"); }, 3500);
}

atualizarBadges();
document.querySelector("[data-nav]").focus();

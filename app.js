/* ============ CONFIGURAÇÃO (edite aqui) ============ */
var CONFIG = {
  title: "APP Store",
  splash: "https://www.dropbox.com/scl/fi/4iy6g1nmm778o2ke89xnr/APP-Store01.jpg?rlkey=ho5j8y8ffrf39v2xx31ke0swy&st=3ppdxj3x&dl=1",
  splashSeconds: 5,
  password: "1289",
  lockSeconds: 7
};

/* Para adicionar um app, copie uma linha e troque os dados.
   Links do Dropbox devem terminar com dl=1 */
var APPS = [
  {
    name: "PlayPulse",
    apk: "https://www.dropbox.com/scl/fi/as94m0vc84x9hfmrpkt8a/PlayPulse-IPTV.apk?rlkey=rr83h9t9poaxvdt2e607pw5kb&st=y7zwnk6a&dl=1",
    icon: "https://www.dropbox.com/scl/fi/2gtewn86q2sr2rpcroo9l/PlayPulse-IPTV.png?rlkey=jfhy7hbk8npcatbhw2bkt9fyr&st=dh8m2e9k&dl=1"
  },
  { name: "App Exemplo 2", apk: "", icon: "" },
  { name: "App Exemplo 3", apk: "", icon: "" },
  { name: "App Exemplo 4", apk: "", icon: "" },
  { name: "App Exemplo 5", apk: "", icon: "" },
  { name: "App Exemplo 6", apk: "", icon: "" }
];
/* Seção "Apps" (abre com a senha). Mesmo formato da lista acima. */
var APPS2 = [];
for (var n = 1; n <= 20; n++) {
  APPS2.push({ name: "App " + (n < 10 ? "0" + n : n), apk: "", icon: "" });
}
/* =================================================== */

var cardsStore = [];
var cardsApps = [];
var keyEls = [];
var view = "splash";
var toastTimer = null, lockTimer = null, errTimer = null;
var pin = "";

function $(id) { return document.getElementById(id); }

$("title").innerHTML = CONFIG.title;
document.title = CONFIG.title;

function toast(msg) {
  var t = $("toast");
  t.innerHTML = msg;
  t.className = "show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { t.className = ""; }, 3000);
}

function download(app) {
  if (!app.apk) { toast("Link do APK ainda não configurado"); return; }
  toast("Baixando " + app.name + "...");
  window.location.href = app.apk;
}

function buildGrid(gridId, list, store) {
  var grid = $(gridId);
  for (var i = 0; i < list.length; i++) {
    (function (app) {
      var card = document.createElement("div");
      card.className = "card";
      card.setAttribute("tabindex", "0");
      var icon = document.createElement("div");
      icon.className = "icon";
      var letter = app.name.charAt(0).toUpperCase();
      if (app.icon) {
        var img = document.createElement("img");
        img.alt = "";
        img.onerror = function () { icon.removeChild(img); icon.innerHTML = letter; };
        img.src = app.icon;
        icon.appendChild(img);
      } else {
        icon.innerHTML = letter;
      }
      var name = document.createElement("div");
      name.className = "name";
      name.appendChild(document.createTextNode(app.name));
      card.appendChild(icon);
      card.appendChild(name);
      card.onclick = function () { download(app); };
      grid.appendChild(card);
      store.push(card);
    })(list[i]);
  }
}

/* ---------- navegação por setas ---------- */
function focusList() {
  if (view === "store") return [$("btnApps")].concat(cardsStore);
  if (view === "apps") return [$("btnBack")].concat(cardsApps);
  if (view === "lock") return keyEls;
  if (view === "exit") return [$("btnStay"), $("btnExit")];
  return [];
}

function move(dir) {
  var list = focusList();
  var idx = -1;
  for (var i = 0; i < list.length; i++) if (list[i] === document.activeElement) idx = i;
  if (idx < 0) { if (list.length) list[0].focus(); return; }
  var cur = list[idx].getBoundingClientRect();
  var cx = cur.left + cur.width / 2, cy = cur.top + cur.height / 2;
  var best = -1, bestScore = 1e9;
  for (var j = 0; j < list.length; j++) {
    if (j === idx) continue;
    var r = list[j].getBoundingClientRect();
    var dx = (r.left + r.width / 2) - cx, dy = (r.top + r.height / 2) - cy;
    var main, side;
    if (dir === "left")  { if (dx > -10) continue; main = -dx; side = Math.abs(dy); if (side > cur.height / 2) continue; }
    if (dir === "right") { if (dx < 10)  continue; main = dx;  side = Math.abs(dy); if (side > cur.height / 2) continue; }
    if (dir === "up")    { if (dy > -10) continue; main = -dy; side = Math.abs(dx); }
    if (dir === "down")  { if (dy < 10)  continue; main = dy;  side = Math.abs(dx); }
    var score = main + side * 2;
    if (score < bestScore) { bestScore = score; best = j; }
  }
  if (best > -1) list[best].focus();
}

/* ---------- tela de senha ---------- */
function buildKeys() {
  var labels = ["1","2","3","4","5","6","7","8","9","APAGAR","0","SAIR"];
  var box = $("keys");
  for (var i = 0; i < labels.length; i++) {
    (function (lb) {
      var k = document.createElement("div");
      k.className = "key" + (lb.length > 1 ? " small" : "");
      k.setAttribute("tabindex", "0");
      k.innerHTML = "<div>" + lb + "</div>";
      k.onclick = function () {
        if (lb === "APAGAR") { pin = pin.slice(0, -1); drawDots(); }
        else if (lb === "SAIR") { closeLock(); }
        else { press(lb); }
      };
      box.appendChild(k);
      keyEls.push(k);
    })(labels[i]);
  }
}

function drawDots() {
  var d = $("dots").getElementsByTagName("i");
  for (var i = 0; i < d.length; i++) d[i].className = i < pin.length ? "on" : "";
}

function setMsg(text, err) {
  var m = $("lockMsg");
  m.innerHTML = text;
  m.className = err ? "err" : "";
}

function openLock() {
  pin = "";
  drawDots();
  setMsg("Digite a senha para entrar", false);
  $("lock").className = "";
  view = "lock";
  var bar = $("barfill");
  bar.style.transition = "none";
  bar.style.width = "100%";
  void bar.offsetWidth;
  bar.style.transition = "width " + CONFIG.lockSeconds + "s linear";
  bar.style.width = "0%";
  clearTimeout(lockTimer);
  lockTimer = setTimeout(closeLock, CONFIG.lockSeconds * 1000);
  keyEls[4].focus();
}

function closeLock() {
  clearTimeout(lockTimer);
  clearTimeout(errTimer);
  $("lock").className = "hidden";
  view = "store";
  $("btnApps").focus();
}

function press(d) {
  if (pin.length >= 4) return;
  pin += d;
  drawDots();
  setMsg("Digite a senha para entrar", false);
  if (pin.length === 4) {
    if (pin === CONFIG.password) {
      clearTimeout(lockTimer);
      $("lock").className = "hidden";
      showApps();
    } else {
      setMsg("Senha incorreta", true);
      errTimer = setTimeout(function () { pin = ""; drawDots(); }, 350);
    }
  }
}

/* ---------- troca de seções ---------- */
function showApps() {
  $("store").className = "hidden";
  $("apps").className = "";
  view = "apps";
  window.scrollTo(0, 0);
  if (cardsApps.length) cardsApps[0].focus();
}

function backToStore() {
  $("apps").className = "hidden";
  $("store").className = "";
  view = "store";
  window.scrollTo(0, 0);
  $("btnApps").focus();
}

var exiting = false;

function openExit() {
  $("exit").className = "";
  view = "exit";
  $("btnStay").focus();
}

function closeExit() {
  $("exit").className = "hidden";
  view = "store";
  $("btnApps").focus();
}

function doExit(fromPop) {
  exiting = true;
  try { window.close(); } catch (e) {}
  setTimeout(function () { try { history.go(fromPop ? -1 : -2); } catch (e) {} }, 150);
  setTimeout(function () { location.replace("about:blank"); }, 700);
}

/* voltar: fecha a senha, volta da seção Apps, depois pergunta se quer sair */
function goBack(fromPop) {
  if (view === "lock") closeLock();
  else if (view === "apps") backToStore();
  else if (view === "store") openExit();
  else if (view === "exit") doExit(fromPop);
}

/* botão voltar do próprio navegador/aparelho */
try {
  history.replaceState({ b: 0 }, "");
  history.pushState({ b: 1 }, "");
  window.onpopstate = function () {
    if (exiting || view === "splash") { if (view === "splash") history.pushState({ b: 1 }, ""); return; }
    goBack(true);
    if (!exiting) history.pushState({ b: 1 }, "");
  };
} catch (e) {}

$("btnStay").onclick = closeExit;
$("btnExit").onclick = function () { doExit(false); };
$("btnApps").onclick = openLock;
$("btnBack").onclick = backToStore;

/* ---------- teclado / controle ---------- */
document.onkeydown = function (e) {
  var k = e.keyCode;
  if (view === "splash") return;

  if (view === "lock") {
    var digit = -1;
    if (k >= 48 && k <= 57) digit = k - 48;
    if (k >= 96 && k <= 105) digit = k - 96;
    if (digit > -1) { press(String(digit)); e.preventDefault(); return; }
    if (k === 8) { pin = pin.slice(0, -1); drawDots(); e.preventDefault(); return; }
  }
  if (k === 27 || k === 4 || k === 8) { goBack(false); e.preventDefault(); return; }

  if (k === 37) { move("left"); e.preventDefault(); }
  else if (k === 39) { move("right"); e.preventDefault(); }
  else if (k === 38) { move("up"); e.preventDefault(); }
  else if (k === 40) { move("down"); e.preventDefault(); }
  else if (k === 13 || k === 23 || k === 66) {
    var el = document.activeElement;
    if (el && el.click) el.click();
    e.preventDefault();
  }
};

function openStore() {
  var splash = $("splash");
  splash.className = "out";
  $("store").className = "";
  view = "store";
  setTimeout(function () { splash.style.display = "none"; }, 500);
  if (cardsStore.length) cardsStore[0].focus();
}

buildGrid("grid", APPS, cardsStore);
buildGrid("grid2", APPS2, cardsApps);
buildKeys();
$("splash").style.backgroundImage = "url('" + CONFIG.splash + "')";
setTimeout(openStore, CONFIG.splashSeconds * 1000);

/* ===== Personalização para clínicas: preencha e mude ativo para true ===== */
const CLINICA = { ativo: false, nome: "Nome da clínica", telefone: "", whatsapp: "", site: "" };

/* ===== Estado ===== */
const KEY = "missao-bigode-jogo-v1", URG = ["Agora", "Ainda hoje", "Nesta semana", "Só observar"], URGI = ["I30_01c", "I30_02c", "I30_03c", "I30_04c"];
let P = { lupas: 6, total: 0, casos: {}, calma: false, som: true, voz: true, abertura: false, saga: false, cosm: "", conq: {}, rot: {}, st: { pistas: 0, raras: 0, seq: 0, seqMax: 0, semDica: 0, rapido: 0, plantoes: 0, plantaoMax: 0, rotinaDias: 0, diarios: 0, emerg: 0, perfeitos: 0 } };
try { const g = JSON.parse(localStorage.getItem(KEY) || "{}"); P = Object.assign(P, g, { st: Object.assign(P.st, g.st || {}) }); } catch (e) {}
const salvar = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
let V = {}, tick = null;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const im = n => "img/" + n + ".webp", p2 = n => String(n).padStart(2, "0");
const foto_ = (n, alt = "", cl = "") => `<img class="${cl}" src="${im(n)}" alt="${alt}" draggable="false" decoding="async">`;
const caso = id => CASOS.find(c => c.id === id), feitos = () => CASOS.filter(c => P.casos[c.id]).length;
const nivel = () => Math.min(4, Math.floor(feitos() / 3)), liberado = k => k === 0 || !!P.casos[CASOS[k - 1].id];
const diaHoje = () => { const d = new Date(); return d.getFullYear() + "-" + p2(d.getMonth() + 1) + "-" + p2(d.getDate()); };
const semente = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
const PEDE_CALMA = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
const R = () => document.documentElement.classList.contains("calmo");
function aplicarMovimento() { document.documentElement.classList.toggle("calmo", PEDE_CALMA && !P.movimento); }
aplicarMovimento();
function tela(h, cl) { const a = $("#app"); a.className = cl || ""; a.innerHTML = h; a.scrollTop = 0; const t = a.querySelector("h1"); if (t) { t.tabIndex = -1; t.focus({ preventScroll: true }); } }
function parar() { if (tick) { clearInterval(tick); tick = null; } }
const vib = n => { if (navigator.vibrate) try { navigator.vibrate(n); } catch (e) {} };
const filaT = []; let tOn = false, tT;
function toast(m, img) { filaT.push([m, img]); if (!tOn) proxT(); }
function limparT() { filaT.length = 0; $("#toast").innerHTML = ""; tOn = false; clearTimeout(tT); }
function proxT() { const m = filaT.shift(); if (!m) { tOn = false; return; } tOn = true; const e = document.createElement("div"); e.className = "t"; e.innerHTML = (m[1] ? foto_(m[1]) : "") + "<span></span>"; e.querySelector("span").textContent = m[0]; $("#toast").appendChild(e); tT = setTimeout(() => { e.remove(); proxT(); }, 2500); }
function barra(ativa) { const n = $("#nav"); n.hidden = !ativa; if (!ativa) return; n.innerHTML = [["agencia", "I26_01c", "Agência"], ["mapa", "I28_01c", "Casos"], ["rotina", "I26_02c", "Rotina"], ["diario", "I26_03c", "Diário"], ["conquistas", "I26_04c", "Medalhas"]].map(a => `<button data-act="ir" data-r="${a[0]}" ${a[0] === ativa ? 'aria-current="page"' : ""}>${foto_(a[1])}<span>${a[2]}</span></button>`).join(""); }

/* ===== Conquistas ===== */
const REGRAS = { pista1: () => P.st.pistas >= 1, caso1: () => feitos() >= 1, perfeito: () => P.st.perfeitos >= 1, raro1: () => P.st.raras >= 1, raro5: () => P.st.raras >= 5, seq3: () => P.st.seqMax >= 3, seq5: () => P.st.seqMax >= 5, seq10: () => P.st.seqMax >= 10, nv2: () => nivel() >= 1, nv3: () => nivel() >= 2, nv4: () => nivel() >= 3, nv5: () => feitos() >= CASOS.length, rapido: () => P.st.rapido >= 1, semdica: () => P.st.semDica >= 5, plantao: () => P.st.plantoes >= 1, plantao6: () => P.st.plantaoMax >= 6, rotina1: () => P.st.rotinaDias >= 1, rotina7: () => P.st.rotinaDias >= 7, dia: () => P.st.diarios >= 1, prevenido: () => P.st.emerg >= 1 };
function conferir() { CONQ.forEach((c, k) => { if (!P.conq[c.id] && REGRAS[c.id]()) { P.conq[c.id] = diaHoje(); toast("Medalha: " + c.n, "R" + p2(k + 1) + "_01c"); } }); salvar(); }

/* ===== Narração gravada: Santa narra, Dora orienta. Sem áudio, valem as legendas ===== */
const FALA = { el: new Audio(), vez: 0, fim: null, vigia: null };
FALA.el.preload = "auto";
/* A história espera enquanto o guia do veterinário está aberto ou o jogo está fora da tela. */
const ESPERA = () => document.hidden || !!V.emerg;
function calar() { FALA.vez++; clearTimeout(FALA.fim); clearInterval(FALA.vigia); FALA.el.onended = FALA.el.onerror = null; try { FALA.el.pause(); } catch (e) {} abaixarMusica(false); }
function falar(txt, pronto) {
  calar(); const vez = FALA.vez, lista = Array.isArray(txt) ? txt : [txt], el = FALA.el; let i = 0;
  const prox = () => {
    if (vez !== FALA.vez) return; clearTimeout(FALA.fim); clearInterval(FALA.vigia); el.onended = el.onerror = null;
    if (i >= lista.length) { abaixarMusica(false); if (pronto) pronto(); return; }
    const t = lista[i++], arq = typeof VOZES !== "undefined" && VOZES[t]; let saiu = false, s = 0;
    const segue = () => { if (!saiu && vez === FALA.vez) { saiu = true; FALA.fim = setTimeout(prox, 180); clearInterval(FALA.vigia); } };
    const vigiar = dur => { FALA.vigia = setInterval(() => { if (vez !== FALA.vez) return clearInterval(FALA.vigia); if (!ESPERA() && (s += .25) > dur) segue(); }, 250); };
    if (!P.voz || !arq) return vigiar(Math.max(.9, t.length * .058));
    abaixarMusica(true); el.onended = segue; el.onerror = () => { if (vez === FALA.vez) { clearInterval(FALA.vigia); vigiar(t.length * .058); } };
    el.src = urlVoz(arq[0]); const r = el.play(); if (r) r.catch(e => { if (vez === FALA.vez && e.name !== "AbortError") el.onerror(); });
    vigiar(arq[1] + 4);
  };
  prox();
}
const urlVoz = n => (typeof VOZ_DADOS !== "undefined" && VOZ_DADOS[n]) || "voz/" + n + ".mp3";
function pausarVoz() { FALA.volta = !FALA.el.paused && !FALA.el.ended; try { FALA.el.pause(); } catch (e) {} }
function voltarVoz() { if (FALA.volta) { FALA.volta = false; const r = FALA.el.play(); if (r) r.catch(() => {}); } }
const dizer = k => falar(FRASES[k][0]);
/* Frases gerais só nas primeiras vezes, para não cansar. */
function dizerPouco(k, max) { P.ouviu = P.ouviu || {}; P.ouviu[k] = (P.ouviu[k] || 0) + 1; salvar(); if (P.ouviu[k] <= max) dizer(k); else calar(); }

/* ===== Cenas da história ===== */
let C = null;
const MUS = { abertura: { pad: .8, vibra: .8 }, caso: { pad: .7, baixo: .8, vibra: .5, escova: .7 }, inv: { pad: .45, baixo: 1, escova: 1, tensao: .1 }, dossie: { pad: .8, vibra: .6, baixo: .35 }, fim: { pad: .9, vibra: 1, baixo: .5, escova: .4 }, casa: { pad: .7, vibra: .6, baixo: .4 } };
function arte(b) {
  const fx = b.fx || "", a = b.a, alto = a[1] === "H02_03";
  return `<div class="arte ${fx.split(" ").filter(Boolean).map(x => "fx-" + x).join(" ")}"><div class="fundo" style="background-image:url(${im(a[a.length - 1])})"></div><div class="q">${foto_(a[0], "", "c1a")}${a[1] && !alto ? foto_(a[1], "", "c2a") : ""}</div>${alto ? foto_(a[1], "", "c2a cheia") : ""}${/chuva/.test(fx) ? '<i class="gotas"></i><i class="gotas b"></i>' : ""}${/raio/.test(fx) ? '<i class="relampago"></i>' : ""}</div>`;
}
function rodarCena(beats, fim, mus, chuva) { calar(); limparT(); barra(null); C = { beats, i: 0, fim, gen: 0 }; musica(mus, chuva); beats.forEach(b => { b.a.forEach(n => { new Image().src = im(n); }); const z = typeof VOZES !== "undefined" && VOZES[b.txt]; if (z && P.voz && typeof VOZ_DADOS === "undefined") { const s = new Audio(); s.preload = "auto"; s.src = urlVoz(z[0]); FALA.pre = (FALA.pre || []).concat(s).slice(-6); } }); mostrar(); }
function mostrar() {
  const b = C.beats[C.i], g = ++C.gen; calar(); C.feito = C.falou = C.digitou = C.gesto = false; C.letras = [];
  tela(`<div class="cine"><h1 class="sr">${b.txt}</h1><div class="panel entra" id="pn" data-act="tocar">${arte(b)}${b.extra === "titulo" ? '<div class="titulo"><div class="carimbo">Missão<br>Bigode</div><small>O Detetive dos Sinais</small></div>' : ""}${b.extra === "tempo" ? `<div class="num">${V.c ? V.c.tempo : 80} s</div>` : ""}${b.extra === "cair" ? '<div class="parede-txt" id="pt"></div>' : ""}</div>
  <div class="ctrl"><button data-act="alternaVoz" aria-pressed="${P.voz}" aria-label="Narração">${foto_(P.voz ? "I27_05c" : "I27_06c")}</button><button data-act="alternaSom" aria-pressed="${P.som}" aria-label="Som">${foto_(P.som ? "I27_03c" : "I27_04c")}</button><button data-act="pular" aria-label="Pular história">${foto_("I27_07c")}</button></div>
  <div class="legenda ${b.v === "v" ? "vil" : b.v === "d" ? "dra" : ""}" data-act="tocar">${b.quem ? `<span class="quem">${b.quem}</span>` : ""}<p class="fala" id="fl" aria-hidden="true"></p><span class="sr" aria-live="polite">${b.quem ? b.quem + ": " : ""}${b.txt}</span><span class="mais" id="mais" aria-hidden="true">▶</span></div></div>`, "semrolar");
  if (b.extra === "cair") paredeCaindo();
  if (b.extra === "confete" && !R()) confeteFim();
  if (b.gesto) { C.gesto = true; GESTOS[b.gesto](() => { if (C && g === C.gen) { C.gesto = false; falaDoQuadro(b, g); } }); if (b.instr) { const i = document.createElement("div"); i.className = "instrui"; i.id = "ins"; i.textContent = b.instr; $("#pn").appendChild(i); } return; }
  setTimeout(() => { if (C && g === C.gen) { if (b.som) sfx(b.som); if (b.extra === "titulo") tremer(); } }, b.atraso || 0);
  falaDoQuadro(b, g);
}
function tremer() { const s = $("#shell"); if (R()) return; s.classList.remove("treme"); void s.offsetWidth; s.classList.add("treme"); setTimeout(() => s.classList.remove("treme"), 480); }
function falaDoQuadro(b, g) { digitar($("#fl"), b.txt, () => { if (C && g === C.gen) { C.digitou = true; talvezSiga(g); } }, g); falar(b.txt, () => { if (C && g === C.gen) { C.falou = true; talvezSiga(g); } }); }
function digitar(el, txt, pronto, g) {
  el.innerHTML = txt.split(" ").map(w => `<span class="tw">${[...w].map(c => `<i>${c}</i>`).join("")}</span>`).join(" ");
  const ls = [...el.querySelectorAll("i")], arq = typeof VOZES !== "undefined" && VOZES[txt]; let n = 0; C.letras = ls;
  const vel = R() ? 1 : P.voz && arq ? Math.max(22, Math.min(60, arq[1] * 920 / ls.length)) : 38;
  const t = setInterval(() => { if (!C || g !== C.gen || C.digitou) { clearInterval(t); return; } if (ESPERA()) return; if (n >= ls.length) { clearInterval(t); pronto(); return; } ls[n++].className = "on"; if (n % 3 === 0 && !(P.voz && arq)) sfx("tecla"); }, vel);
}
function talvezSiga(g) { if (!C || g !== C.gen || !C.digitou || !C.falou) return; C.feito = true; const m = $("#mais"); if (m) m.classList.add("on"); const ir = () => { if (!C || g !== C.gen) return; if (ESPERA()) setTimeout(ir, 400); else avancar(); }; setTimeout(ir, 1500); }
function tocarQuadro() { if (!C || C.gesto) return; if (!C.digitou) { (C.letras || []).forEach(l => l.className = "on"); C.digitou = true; const m = $("#mais"); if (m) m.classList.add("on"); talvezSiga(C.gen); return; } avancar(); }
function avancar() { C.gen++; calar(); C.i++; if (C.i < C.beats.length) mostrar(); else { const f = C.fim; C = null; f(); } }
function pularCena() { if (!C) return; C.gen++; calar(); const f = C.fim; C = null; f(); }
function paredeCaindo() { const t = "Gatos escondem sinais.", el = $("#pt"); el.innerHTML = t.split(" ").map(w => `<span class="pal">${[...w].map(c => `<span class="c">${c}</span>`).join("")}</span>`).join(" "); el.querySelectorAll(".c").forEach((s, i) => setTimeout(() => { if (!R()) s.classList.add("cai"); }, 2300 + i * 85)); }

/* Gestos: todos têm alternativa por toque ou teclado. */
const GESTOS = {
  envelope(ok) {
    const pn = $("#pn"), e = document.createElement("div"); e.className = "env"; e.innerHTML = `<div class="corpo"></div><div class="carta">“Juno não sossega. Todos dizem que é manha. Venha logo: vou apagar as pistas.”<br>— O Silencioso</div><div class="aba"></div><button class="selo" aria-label="Abrir o envelope">${foto_("H04_04c")}</button>`; pn.appendChild(e);
    const s = e.querySelector(".selo"); let y0 = null; const abrir = () => { if (e.classList.contains("aberta")) return; e.classList.add("aberta"); sfx("papel"); const i = $("#ins"); if (i) i.remove(); setTimeout(ok, 500); };
    s.addEventListener("pointerdown", ev => { y0 = ev.clientY; s.setPointerCapture(ev.pointerId); }); s.addEventListener("pointermove", ev => { if (y0 === null) return; const d = Math.min(0, ev.clientY - y0); s.style.transform = `translateY(${d}px)`; if (d < -36) abrir(); }); s.addEventListener("pointerup", () => { y0 = null; s.style.transform = ""; }); s.addEventListener("click", ev => { ev.stopPropagation(); abrir(); }); sfx("papel");
  },
  foto(ok) {
    const pn = $("#pn"), m = document.createElement("div"); m.className = "moldura"; m.innerHTML = `<div class="foto-in">${foto_("H08_02", "Juno no sofá, um mês atrás")}<canvas width="280" height="280" aria-label="Foto coberta de poeira"></canvas></div>`; pn.appendChild(m);
    const b = document.createElement("button"); b.className = "semgesto"; b.textContent = "Limpar de uma vez"; pn.appendChild(b);
    const cv = m.querySelector("canvas"), x = cv.getContext("2d"), gr = x.createLinearGradient(0, 0, 280, 280); gr.addColorStop(0, "#8d95a6"); gr.addColorStop(.5, "#c4cad6"); gr.addColorStop(1, "#7d8698"); x.fillStyle = gr; x.fillRect(0, 0, 280, 280); for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(${Math.random() < .5 ? "50,58,78" : "230,234,242"},${Math.random() * .35})`; x.fillRect(Math.random() * 280, Math.random() * 280, Math.random() * 6 + 1, Math.random() * 2 + 1); } x.globalCompositeOperation = "destination-out";
    const vistas = new Set(); let baixo = false, feito = false, ult = 0; const concluir = () => { if (feito) return; feito = true; cv.style.opacity = 0; b.remove(); const i = $("#ins"); if (i) i.remove(); sfx("vitoria"); setTimeout(() => { cv.remove(); ok(); }, 450); };
    const raspa = ev => { const r = cv.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width * 280, py = (ev.clientY - r.top) / r.height * 280; x.beginPath(); x.arc(px, py, 27, 0, 7); x.fill(); vistas.add(Math.floor(px / 40) + "-" + Math.floor(py / 40)); const n = performance.now(); if (n - ult > 70) { ult = n; ruidoEsfrega(); } if (vistas.size >= 26) concluir(); };
    cv.addEventListener("pointerdown", ev => { baixo = true; cv.setPointerCapture(ev.pointerId); raspa(ev); }); cv.addEventListener("pointermove", ev => { if (baixo) raspa(ev); }); cv.addEventListener("pointerup", () => baixo = false); cv.addEventListener("click", ev => ev.stopPropagation()); b.addEventListener("click", ev => { ev.stopPropagation(); concluir(); });
  },
  lanterna(ok) {
    const pn = $("#pn"), q = pn.querySelector(".q"); q.insertAdjacentHTML("beforeend", foto_("P12_03c", "", "juno-luz"));
    const d = document.createElement("div"); d.className = "escuro"; pn.appendChild(d); const b = document.createElement("button"); b.className = "semgesto"; b.textContent = "Acender a luz"; pn.appendChild(b); let feito = false;
    const alvo = () => { const r = pn.getBoundingClientRect(), k = q.querySelector(".juno-luz").getBoundingClientRect(); return { x: k.left + k.width * .4 - r.left, y: k.top + k.height / 2 - r.top, r }; };
    const achou = () => { if (feito) return; feito = true; d.classList.add("acesa"); b.remove(); const i = $("#ins"); if (i) i.remove(); sfx("miau"); setTimeout(ok, 650); };
    const mover = ev => { const a = alvo(), x = ev.clientX - a.r.left, y = ev.clientY - a.r.top; d.style.setProperty("--x", x + "px"); d.style.setProperty("--y", y + "px"); if (Math.hypot(x - a.x, y - a.y) < 50) achou(); };
    d.addEventListener("pointerdown", ev => { d.setPointerCapture(ev.pointerId); mover(ev); }); d.addEventListener("pointermove", ev => { if (ev.pressure > 0 || ev.pointerType === "mouse") mover(ev); }); d.addEventListener("click", ev => ev.stopPropagation()); b.addEventListener("click", ev => { ev.stopPropagation(); achou(); });
  }
};
function ruidoEsfrega() { const c = SOM.ctx; if (c) ruido(c.currentTime, .08, .07, SOM.fx, "highpass", 3200); }

/* ===== Entrada ===== */
function inicio() {
  parar(); limparT(); C = null; calar(); V = {}; barra(null);
  tela(`<div class="entrada" style="background-image:url(${im("M04_01")})"><div class="veu"></div><div class="logo"><div class="carimbo">Missão<br>Bigode</div><small>O Detetive dos Sinais</small></div>
  <div class="baixo stack"><p class="center">Gatos escondem sinais.<br>Observar cedo pode salvar vidas.</p>
  ${P.abertura ? `<button class="btn" data-act="entrar">▶ Continuar</button><button class="btn ghost" data-act="comecarHist">Rever a abertura</button>` : `<button class="btn" data-act="comecarHist">▶ Começar a história</button>`}
  ${PEDE_CALMA ? `<label class="check"><input type="checkbox" data-mov ${P.movimento ? "checked" : ""}><span>Ligar animações</span></label>` : ""}
  <p class="small center">🎧 Melhor com som. O jogo orienta, mas não substitui a consulta veterinária.</p></div></div>`, "semrolar");
}
function comecarHist() { iniciarAudio(); V.c = CASOS[0]; rodarCena(ABERTURA, () => { P.abertura = true; salvar(); if (P.casos.juno) agencia(); else abrirCaso("juno"); }, MUS.abertura, 1); }
function rodapeClinica() { if (!CLINICA.ativo) return ""; const z = CLINICA.whatsapp ? `https://wa.me/${CLINICA.whatsapp.replace(/\D/g, "")}` : CLINICA.site; return `<p class="small center muted">Oferecido por <b>${CLINICA.nome}</b>${z ? ` · <a href="${z}" target="_blank" rel="noopener">falar com a clínica</a>` : ""}</p>`; }

/* ===== Agência ===== */
const diaCaso = () => { const l = CASOS.filter((c, k) => liberado(k)); return l[semente() % l.length]; };
const detetive = () => P.cosm ? "R26_0" + (COSMETICOS.findIndex(c => c.id === P.cosm) + 1) + "c" : "P02_01c";
function agencia() {
  parar(); limparT(); C = null; calar(); V = {}; musica(MUS.casa, .4); barra("agencia");
  const n = nivel(), f = feitos(), prox = CASOS.find((c, k) => liberado(k) && !P.casos[c.id]), dc = diaCaso();
  tela(`<div class="ag"><div class="sala" style="background-image:url(${im("C20_01")})">${["30% 8% 15%", "84% 0% 24%", "50% 62% 19%", "12% 2% 17%", "66% 2% 17%"].map((q, i) => { const [l, b, w] = q.split(" "); return f > 0 && i <= n ? `<img class="movel" src="${im("R23_0" + (i + 1) + "c")}" alt="" style="left:${l};bottom:${b};width:${w}">` : ""; }).join("")}<img class="heroi" src="${im(detetive())}" alt="Detetive"><div class="balao"><b>Dica do dia</b><br>${DICAS[semente() % DICAS.length]}</div><button class="engr" data-act="ir" data-r="ajustes" aria-label="Ajustes">${foto_("I27_01c")}</button></div>
  <div class="pad stack"><div class="nivelbox">${foto_("R22_0" + (n + 1) + "c")}<div><h1>${NIVEIS[n]}</h1><p class="small muted">${f >= CASOS.length ? "Todos os casos resolvidos" : `${f} de ${CASOS.length} casos · ${n < 4 ? `faltam ${3 - f % 3} para subir` : "nível máximo"}`}</p><div class="bar"><i style="width:${f / CASOS.length * 100}%"></i></div></div><div class="lup">${foto_("I33_01c")}<b>${P.lupas}</b></div></div>
  ${prox ? `<button class="caso-grande" data-act="caso" data-id="${prox.id}">${foto_("I41_" + p2(prox.n))}<span><small>${f ? "Próximo caso" : "Primeiro caso"}</small><b>${prox.titulo}</b><em>${prox.gato} · ${prox.tema}</em></span></button>` : `<button class="btn" data-act="saga">▶ Rever o final da história</button>`}
  <div class="duo"><button class="tile" data-act="caso" data-id="${dc.id}" data-dia="1">${foto_("R19_01c")}<b>Caso do dia</b><small>${P.dia === diaHoje() ? "Feito hoje" : dc.gato + " · +2 lupas"}</small></button><button class="tile" data-act="ir" data-r="plantao">${foto_("R15_01c")}<b>Plantão</b><small>6 decisões rápidas</small></button></div>
  <div class="duo"><button class="tile" data-act="ir" data-r="mapa">${foto_("I28_01c")}<b>Mapa do bairro</b><small>Todos os casos</small></button><button class="tile" data-act="ir" data-r="trajes">${foto_("R05_01c")}<b>Guarda-roupa</b><small>Ganhe com lupas</small></button></div>${rodapeClinica()}</div></div>`);
}
function trajes() {
  barra("agencia");
  tela(`<div class="pad stack"><h1>Guarda-roupa</h1><p class="muted small">Você já ganhou ${P.total} lupas investigando.</p><div class="grade2"><button class="tile ${P.cosm ? "" : "on"}" data-act="vestir" data-id="">${foto_("P02_01c")}<b>Clássico</b></button>${COSMETICOS.map((c, k) => { const ok = P.total >= c.lupas; return `<button class="tile ${P.cosm === c.id ? "on" : ""}" data-act="vestir" data-id="${c.id}" ${ok ? "" : "disabled"}>${foto_(ok ? "R26_0" + (k + 1) + "c" : "R25_0" + (k + 1) + "c", "", ok ? "" : "apagado")}<b>${c.nome}</b><small>${ok ? "Vestir" : `Com ${c.lupas} lupas`}</small></button>`; }).join("")}</div><button class="btn ghost" data-act="ir" data-r="agencia">Voltar</button></div>`);
}

/* ===== Mapa do bairro ===== */
function mapa() {
  parar(); calar(); V = {}; musica(MUS.casa, .2); barra("mapa");
  const h = Math.ceil(CASOS.length / 2) * 168 + 120;
  tela(`<div class="mapa" style="height:${h}px;background-image:url(${im("C25_01")})"><h1>Mapa do bairro</h1>${CASOS.map((c, k) => { const lb = liberado(k), r = P.casos[c.id]; return `<button class="casa ${lb ? "" : "fech"} ${lb && !r ? "nova" : ""}" style="left:${k % 2 ? 73 : 27}%;top:${90 + k * 84}px" data-act="${lb ? "caso" : "trancado"}" data-id="${c.id}" aria-label="${lb ? c.titulo : "Caso bloqueado"}">${foto_("C26_" + p2(c.n) + "c")}<span>${lb ? c.gato : "?"}</span>${r ? `<i class="selo-n n${r.nota}">${r.nota}</i>` : lb ? "" : foto_("I29_02c", "", "cad")}</button>`; }).join("")}</div>`);
  const nv = $(".casa.nova"); if (nv) nv.scrollIntoView({ block: "center" });
}

/* ===== Dossiê do caso ===== */
function abrirCaso(id, dia) {
  parar(); limparT(); calar(); const c = caso(id); V = { c, dia: !!dia }; barra("mapa"); const r = P.casos[id];
  tela(`<div class="pad stack dossie"><div class="capa">${foto_("I41_" + p2(c.n), "Dossiê de " + c.gato)}<span class="etq">${c.gato}</span>${r ? `<i class="selo-n n${r.nota}">${r.nota}</i>` : ""}</div><h1 class="center">${c.titulo}</h1><p class="center muted small">${c.tema}</p><p class="papel">${c.brief}</p>
  <button class="btn" data-act="verHist">▶ ${r ? "Rever história e investigar" : "Ouvir a história"}</button><button class="btn ghost" data-act="soCaso">Ir direto à investigação</button>
  <label class="check"><input type="checkbox" data-calma ${P.calma ? "checked" : ""}><span>Modo sem pressa<br><small class="muted">Sem relógio e sem pistas apagadas.</small></span></label><button class="btn ghost" data-act="ir" data-r="mapa">Voltar ao mapa</button></div>`);
}
function verHist() { iniciarAudio(); rodarCena(historiaDe(V.c), comecarInv, MUS.caso, .6); }
function comecarInv() { iniciarAudio(); calar(); barra(null); musica(MUS.inv, 0); const c = V.c; Object.assign(V, { t: 0, st: {}, salvas: {}, perdidas: {}, avisados: {}, dicas: 0, erros: 0, foto: false, pausa: false, stage: "inv", passou: false, esc: [], op: undefined, ordem: null, tempoAcabou: false, sheet: undefined, disse: false }); c.rooms.forEach(n => { new Image().src = im(n); }); inv(); if (!P.calma) relogio(); sfx("carimbo"); if (!P.tutorial) tutorial(); }
function tutorial() {
  V.pausa = true; const passos = [["I43_01", "Toque nos objetos para examinar. Nada está marcado."], ["I43_02", "Guarde no dossiê só o que importa. Guardar tudo tira pontos."], ["I43_03", "Use a foto de 30 dias atrás para comparar."], ["I43_04", "No fim, ligue as duas evidências que decidem o caso."], ["I43_05", "Escolha a urgência e a conduta. E aposte com calma."]]; let k = 0;
  const e = document.createElement("div"); e.className = "overlay center stack tut"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Como jogar"); $("#inv").appendChild(e);
  const pinta = () => { e.innerHTML = `<h2>Como investigar</h2>${foto_(passos[k][0], "", "tutimg")}<p>${passos[k][1]}</p><p class="small muted">${k + 1} de ${passos.length}</p><button class="btn">${k < passos.length - 1 ? "Próximo" : "Começar"}</button>`; const b = e.querySelector("button"); b.onclick = () => { sfx("papel"); if (++k < passos.length) pinta(); else { e.remove(); V.pausa = false; P.tutorial = true; salvar(); } }; b.focus(); }; pinta();
}

/* ===== Investigação ===== */
function mundo(c) {
  return c.rooms.map((r, k) => `<div class="rm" style="left:${k * 33.3334}%;background-image:url(${im(r)})${k && r !== "C03_01" ? ";--tom:" + [0, -28, 34, -50][c.n % 4] + "deg" : ""}"></div>`).join("") + '<i class="umbral" style="left:33.333%"></i><i class="umbral" style="left:66.666%"></i>' +
    c.itens.map(it => { const o = it[4] || {}; return `<img class="it ${o.only ? "only-" + o.only : ""} ${o.oculto ? "sumiu" : ""}" ${o.id ? `data-id="${o.id}"` : ""} data-x="${it[1]}" data-y="${it[2]}" src="${im(it[0])}" alt="" draggable="false" style="left:${it[1] / 10.8}%;bottom:${(330 - it[2]) / 3.3}%;height:${it[3] / 3.3}%">`; }).join("");
}
function ativa(p) { const t = V.t; if (P.calma) return !p.desde; if (p.desde && t < p.desde) return false; if (p.some && t >= p.some) return false; return true; }
function inv() {
  const c = V.c, n = Object.keys(V.salvas).length;
  const spots = c.pistas.map((p, k) => `<button class="spot ${ativa(p) ? "" : "fora"} ${V.st[p.id] ? "vista" : ""} ${V.salvas[p.id] ? "salva" : ""}" style="left:${p.x / 10.8}%;top:${p.y / 3.3}%" data-act="pista" data-k="${k}" aria-label="${p.t}"></button>`).join("");
  tela(`<div class="inv" id="inv"><div class="top"><button class="icon" data-act="pausar" aria-label="Pausar">${foto_("I27_08c")}</button><div class="clock" id="ck">${P.calma ? '<div class="l"><span>Sem pressa</span></div>' : `<div class="l"><span>O Silencioso</span><b id="tx">${Math.ceil(c.tempo - V.t)} s</b></div><div class="bar"><i id="tb" style="width:${100 - V.t / c.tempo * 100}%"></i></div>`}</div><img class="olhos" src="${im("P08_01c")}" alt=""><h1 class="sr">Investigação: ${c.titulo}</h1></div>
  <div class="scene-box"><div class="pan" id="pan"><div class="world" id="world" data-v="hoje">${mundo(c)}${spots}</div></div></div>
  <div class="tabs" role="group" aria-label="Cômodos">${c.nomes.map((r, i) => `<button data-act="sala" data-r="${i}" class="${i === 0 ? "on" : ""}">${r}</button>`).join("")}</div>
  <div class="tools"><button data-act="foto" aria-pressed="false">${foto_("I28_03c")} Há 30 dias</button><button data-act="dica">${foto_("I28_05c")} Dica${P.calma ? "" : " (−8 s)"}</button></div>
  <p class="status" id="st" aria-live="polite">Toque nos objetos para examinar. Nada está marcado.</p>
  <div class="close-inv"><button class="btn mint" data-act="fechar">Fechar investigação · <span id="cnt">${n}</span> no dossiê</button></div></div>`, "semrolar");
  aplicarEstado(); ligarPan();
}
const MUDA = { juno: { caixa: [["clump"], ["limpa"]], juno: [["gato"], ["rabo"]] }, bigodes: { fezes: [["fezes"], []] }, frida: { buque: [["buque"], ["nolixo"]], frida: [["polen"], ["limpaF"]] } };
function aplicarEstado() {
  if (P.calma) return; const c = V.c, m = MUDA[c.id] || {}, set = (id, h) => { const e = document.querySelector(`[data-id="${id}"]`); if (e) e.classList.toggle("sumiu", h); };
  c.pistas.forEach(p => { if (!p.some || V.t < p.some) return; if (m[p.id]) { m[p.id][0].forEach(i => set(i, true)); m[p.id][1].forEach(i => set(i, false)); } else $$(".it.only-hoje").forEach(e => { if (Math.abs(e.dataset.x - p.x) < 14 && Math.abs(e.dataset.y - p.y) < 34) e.classList.add("sumiu"); }); });
}
function relogio() {
  parar(); let ult = -1;
  tick = setInterval(() => {
    if (V.stage !== "inv" || V.pausa || V.emerg || document.hidden) return; V.t += .25; const c = V.c, left = c.tempo - V.t, b = $("#tb"), x = $("#tx"); if (b) b.style.width = Math.max(0, left / c.tempo * 100) + "%"; if (x) x.textContent = Math.max(0, Math.ceil(left)) + " s";
    if (left <= 15) { const k = $("#ck"); if (k) k.classList.add("urg"); const s = Math.ceil(left); if (s !== ult) { ult = s; tom(660, .05); if (s <= 5) vib(25); } }
    tensao(Math.min(1, .1 + V.t / c.tempo * .9)); if (V.t >= 24 && !V.passou) { V.passou = true; sombraPassa(false); } eventos(); if (left <= 0) { parar(); fecharSheet(); V.tempoAcabou = true; passo1(); }
  }, 250);
}
function eventos() {
  V.c.pistas.forEach((p, k) => {
    if (p.some && p.aviso && !V.avisados[p.id] && V.t >= p.some - 8) { V.avisados[p.id] = 1; if (!V.st[p.id]) { toast(p.aviso, "P08_02c"); sfx("whoosh"); vib(30); } }
    const el = document.querySelector(`.spot[data-k="${k}"]`); if (!el) return; const on = ativa(p);
    if (!on && !el.classList.contains("fora")) { el.classList.add("fora"); if (p.some) { if (!V.st[p.id]) { V.perdidas[p.id] = 1; silencioApaga(p.perdeu || "Uma evidência se perdeu."); vib([30, 50, 30]); } if (V.sheet === k) fecharSheet(); aplicarEstado(); } }
    if (on && el.classList.contains("fora")) { el.classList.remove("fora"); aplicarEstado(); }
  });
}
/* Imagem da pista: a arte própria ou um recorte ampliado do cômodo */
function visual(p, cl) {
  if (p.i) return `<div class="vis ${cl || ""}" style="background-image:url(${im(p.i)})"></div>`;
  const c = V.c, r = Math.min(2, Math.floor(p.x / 360)), z = 2.6, fx = (p.x - r * 360) / 360, fy = (p.y + 15) / 360, pos = f => Math.max(0, Math.min(100, (f * z - .5) / (z - 1) * 100)).toFixed(1);
  return `<div class="vis ${cl || ""}" style="background-image:url(${im(c.rooms[r])});background-size:${z * 100}%;background-position:${pos(fx)}% ${pos(fy)}%"></div>`;
}
function abrir(k) {
  const p = V.c.pistas[k]; if (V.foto) return; if (!V.st[p.id]) { V.st[p.id] = "vista"; P.st.pistas++; } const b = document.querySelector(`.spot[data-k="${k}"]`); b.classList.add("vista"); sfx("papel"); vib(10); fecharSheet(true); V.sheet = k;
  const el = document.createElement("div"); el.className = "sheet"; el.id = "sheet"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", p.t);
  el.innerHTML = `<button class="x" data-act="xsheet" aria-label="Fechar">✕</button><div class="linha">${visual(p, "polaroid")}<div><h2>${p.t}</h2><p>${p.d}</p></div></div><div class="row"><button class="btn a" data-act="guardar" data-s="1">📌 ${V.salvas[p.id] ? "Manter" : "Guardar"}</button><button class="btn b" data-act="guardar" data-s="0">${V.salvas[p.id] ? "Tirar" : "Descartar"}</button></div>`;
  $("#inv").appendChild(el); el.querySelector(".a").focus({ preventScroll: true });
}
function fecharSheet(manter) { const e = $("#sheet"); if (e) e.remove(); if (!manter) V.sheet = undefined; }
function guardar(s) {
  const k = V.sheet, p = V.c.pistas[k], b = document.querySelector(`.spot[data-k="${k}"]`);
  if (+s) { V.salvas[p.id] = 1; sfx("pino"); vib(14); b.classList.add("salva"); const nc = $("#cnt"); nc.classList.remove("pop"); void nc.offsetWidth; nc.classList.add("pop"); } else { delete V.salvas[p.id]; b.classList.remove("salva"); }
  fecharSheet(); $("#cnt").textContent = Object.keys(V.salvas).length; $("#st").textContent = +s ? `“${p.t}” está no dossiê.` : `“${p.t}” ficou de fora.`; b.focus({ preventScroll: true });
}
function ligarPan() {
  const pan = $("#pan"), w = $("#world"); let down = false, sx = 0, sl = 0; V.moveu = false;
  pan.addEventListener("pointerdown", e => { V.moveu = false; if (e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = pan.scrollLeft; });
  window.onpointermove = e => { if (!down) return; const d = e.clientX - sx; if (Math.abs(d) > 6) V.moveu = true; pan.scrollLeft = sl - d; }; window.onpointerup = () => { down = false; };
  pan.addEventListener("click", e => { if (V.moveu) { e.stopPropagation(); e.preventDefault(); return; } if (e.target.closest(".spot") || V.foto || V.sheet !== undefined || P.calma || V.pausa) return; const r = w.getBoundingClientRect(); V.t += 1; V.erros++; tom(180, .06); const m = document.createElement("span"); m.className = "miss"; m.textContent = "−1 s"; m.style.left = (e.clientX - r.left) + "px"; m.style.top = (e.clientY - r.top) + "px"; w.appendChild(m); setTimeout(() => m.remove(), 700); }, true);
  pan.addEventListener("scroll", () => { const r = Math.round(pan.scrollLeft / (w.offsetWidth / 3)); $$(".tabs button").forEach((b, i) => b.classList.toggle("on", i === Math.min(2, r))); }, { passive: true });
}
function irSala(r) { const pan = $("#pan"), w = $("#world"); pan.scrollTo({ left: r * w.offsetWidth / 3, behavior: R() ? "auto" : "smooth" }); }
function foto(btn) {
  V.foto = !V.foto; fecharSheet(); const w = $("#world"); w.dataset.v = V.foto ? "antes" : "hoje"; w.classList.toggle("antes", V.foto); btn.setAttribute("aria-pressed", V.foto);
  const old = $(".foto"); if (old) old.remove(); if (V.foto) { const t = document.createElement("div"); t.className = "foto"; t.textContent = "Foto de 30 dias atrás"; $(".scene-box").appendChild(t); $("#st").textContent = "Compare com a casa de hoje. O relógio continua correndo!"; } else $("#st").textContent = "De volta à casa de hoje."; sfx("papel");
}
function dica() {
  const c = V.c; let k = c.pistas.findIndex(p => p.k === "d" && ativa(p) && !V.st[p.id]); if (k < 0) k = c.pistas.findIndex(p => p.k === "s" && ativa(p) && !V.st[p.id]); if (k < 0) { $("#st").textContent = "Não há mais o que indicar. Pense bem no que guardou."; return; }
  if (V.foto) foto($("[data-act=foto]")); if (!P.calma) V.t += 8; V.dicas++; const b = document.querySelector(`.spot[data-k="${k}"]`), pan = $("#pan"); pan.scrollTo({ left: b.offsetLeft - pan.clientWidth / 2, behavior: "smooth" }); b.classList.add("hint"); setTimeout(() => b.classList.remove("hint"), 3000); $("#st").textContent = "O ponto brilhante merece um olhar.";
}
function pausar() { V.pausa = true; const e = document.createElement("div"); e.className = "overlay stack center"; e.id = "pz"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Pausa"); e.innerHTML = `${foto_("C33_02", "", "tutimg")}<h2>Investigação pausada</h2><p>A casa fica escondida até você voltar.</p><button class="btn" data-act="voltar">Continuar</button><button class="btn ghost" data-act="ir" data-r="mapa">Abandonar caso</button>`; $("#inv").appendChild(e); e.querySelector("button").focus(); }
function sombraPassa(forte) { const box = $(".scene-box"); if (!box || R()) { if (forte) sfx("silencio"); return; } const s = document.createElement("div"); s.className = "sombra-voa"; s.innerHTML = foto_(forte ? "P09_01c" : "P07_01c"); box.appendChild(s); setTimeout(() => s.remove(), 1500); sfx(forte ? "silencio" : "whoosh"); if (forte) { box.classList.add("perda"); setTimeout(() => box.classList.remove("perda"), 720); tremer(); } }
function silencioApaga(msg) { sombraPassa(true); const st = $("#st"); if (st) { const velho = st.textContent; st.innerHTML = [...velho].map((c, i) => `<span class="${R() ? "" : "cai"}" style="animation-delay:${i * 12}ms">${c === " " ? "&nbsp;" : c}</span>`).join(""); setTimeout(() => { if ($("#st")) $("#st").textContent = msg; }, 700); } falar(msg); }

/* ===== Quadro de pistas ===== */
const salvasL = () => V.c.pistas.filter(p => V.salvas[p.id]);
function verDossie() { const l = salvasL(); return `<details><summary>Rever dossiê (${l.length})</summary><div><ul style="margin:0;padding-left:18px" class="small">${l.map(p => `<li><b>${p.t}:</b> ${p.d}</li>`).join("") || "<li>Vazio.</li>"}</ul></div></details>`; }
function passo1() {
  parar(); limparT(); calar(); V.stage = "p1"; V.esc = (V.esc || []).filter(i => V.salvas[i]); if (V.esc.length < 2) V.esc = []; V.focoFio = null; fecharSheet(); musica(MUS.dossie, 0); const l = salvasL(), ok = V.esc.length >= 2 || l.length < 2;
  tela(`<div class="pad stack">${V.tempoAcabou ? '<div class="warn">Tempo esgotado! O Silencioso fechou a casa. Decida com o que você tem.</div>' : ""}<span class="step">Decisão 1 de 3</span><h1>Ligue as 2 evidências que decidem o caso</h1><p class="muted small">Toque em uma e depois em outra, ou arraste o fio de um pino até outra nota.</p>
  ${l.length ? `<div class="quadro" id="qd"><svg class="fios" id="fs" aria-hidden="true"></svg>${l.map(p => `<button class="nt" data-act="ntTocar" data-id="${p.id}" aria-pressed="${V.esc.includes(p.id)}"><span class="pino" data-pino="${p.id}" aria-hidden="true">${foto_("pino")}</span>${visual(p, "mini")}<b>${p.t}</b>${p.d}</button>`).join("")}</div>` : `<div class="card center">${foto_("P07_06c", "", "meio")}<p>Seu quadro está vazio. O Silencioso sorri no escuro…</p></div>`}
  <button class="btn" id="cont" data-act="p2" ${ok ? "" : "disabled"}>${ok ? "Fechar a teoria →" : "Ligue 2 evidências"}</button>${(!V.tempoAcabou && V.t < V.c.tempo) || P.calma ? '<button class="btn ghost" data-act="reabrir">← Voltar à casa</button>' : ""}</div>`);
  if (V.tempoAcabou && !V.disse) dizer("tempo"); else if (!V.disse) dizerPouco("quadro", 2); else calar(); V.disse = true; desenharFios(false); ligarPinos();
}
function centroNota(id) { const qd = $("#qd"), n = document.querySelector(`.nt[data-id="${id}"]`); if (!qd || !n) return null; const a = qd.getBoundingClientRect(), b = n.getBoundingClientRect(); return { x: b.left - a.left + b.width / 2, y: b.top - a.top + 6 }; }
const curva = (a, b) => `M${a.x} ${a.y}Q${(a.x + b.x) / 2} ${Math.max(a.y, b.y) + 30} ${b.x} ${b.y}`;
function desenharFios(novo, temp) { const fs = $("#fs"); if (!fs) return; let h = ""; if (V.esc.length === 2) { const a = centroNota(V.esc[0]), b = centroNota(V.esc[1]); if (a && b) h += `<path class="${novo ? "novo" : ""}" d="${curva(a, b)}"/>`; } if (temp) h += `<path d="${curva(temp.a, temp.b)}"/>`; fs.innerHTML = h; }
function ligar(a, b) { V.esc = [a, b]; V.focoFio = null; sfx("fio"); vib(18); $$(".nt").forEach(n => { n.setAttribute("aria-pressed", V.esc.includes(n.dataset.id)); n.classList.remove("foco"); }); desenharFios(true); const c = $("#cont"); c.disabled = false; c.textContent = "Fechar a teoria →"; }
function ntTocar(id) {
  const limpa = () => $$(".nt").forEach(n => { n.setAttribute("aria-pressed", "false"); n.classList.remove("foco"); }), c = $("#cont"), trava = t => { if (salvasL().length < 2) return; c.disabled = true; c.textContent = t; };
  if (V.esc.includes(id) && V.esc.length === 2) { V.esc = []; V.focoFio = null; limpa(); desenharFios(false); trava("Ligue 2 evidências"); return; }
  if (V.focoFio && V.focoFio !== id) return ligar(V.focoFio, id); if (V.focoFio === id) { V.focoFio = null; limpa(); return; }
  V.esc = []; desenharFios(false); limpa(); V.focoFio = id; document.querySelector(`.nt[data-id="${id}"]`).classList.add("foco"); sfx("pino"); vib(10); trava("Escolha a segunda evidência");
}
function ligarPinos() {
  $$(".pino").forEach(p => {
    let on = false, arr = false, x0 = 0, y0 = 0; const id = p.dataset.pino;
    p.addEventListener("pointerdown", ev => { on = true; arr = false; x0 = ev.clientX; y0 = ev.clientY; p.setPointerCapture(ev.pointerId); ev.stopPropagation(); });
    p.addEventListener("pointermove", ev => { if (!on) return; if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) arr = true; if (!arr) return; const q = $("#qd").getBoundingClientRect(); desenharFios(false, { a: centroNota(id), b: { x: ev.clientX - q.left, y: ev.clientY - q.top } }); });
    p.addEventListener("pointerup", ev => { if (!on) return; on = false; if (!arr) return; ev.preventDefault(); ev.stopPropagation(); p.dataset.ignorar = "1"; const d = document.elementFromPoint(ev.clientX, ev.clientY), n = d && d.closest(".nt"); if (n && n.dataset.id !== id) ligar(id, n.dataset.id); else desenharFios(false); });
  });
}
function passo2() { V.stage = "p2"; tela(`<div class="pad stack"><span class="step">Decisão 2 de 3</span><h1>Quanta urgência este caso pede?</h1><p class="muted small">Exagerar e subestimar custam pontos. Sem relógio aqui: pense.</p><div class="grade2">${URG.map((u, i) => `<button class="tile" data-act="urg" data-u="${i}">${foto_(URGI[i])}<b>${u}</b></button>`).join("")}</div>${verDossie()}</div>`); dizerPouco("urg", 2); }
function passo3() {
  V.stage = "p3"; const c = V.c, t = V.op !== undefined; V.ordem = V.ordem || c.ops.map((_, i) => i).sort(() => Math.random() - .5);
  tela(`<div class="pad stack"><span class="step">Decisão 3 de 3</span><h1>${c.q}</h1><div class="stack" role="radiogroup" aria-label="Alternativas">${V.ordem.map(o => `<button class="ev" role="radio" data-act="op" data-o="${o}" aria-checked="${V.op === o}">${c.ops[o]}</button>`).join("")}</div>
  ${t ? `<h2>Quanto você aposta nessa decisão?</h2><div class="bets">${[[1, "Talvez"], [2, "Bastante"], [3, "Certeza"]].map(([n, l]) => `<button class="btn ${n === 3 ? "" : "ghost"}" data-act="apostar" data-n="${n}" ${P.lupas < n ? "disabled" : ""}><span>${l}</span><small>${n} ${n === 1 ? "lupa" : "lupas"}</small></button>`).join("")}</div>${P.lupas < 1 ? '<button class="btn" data-act="apostar" data-n="0">Decidir sem aposta</button>' : ""}<p class="small muted center">Acertou? Ganha o dobro. Errou? Perde a aposta. Você tem ${P.lupas} lupas.</p>` : '<p class="small muted center">Escolha uma alternativa para fazer sua aposta.</p>'}${verDossie()}</div>`);
}
function escolherOp(o) { V.op = o; vib(10); calar(); const y = $("#app").scrollTop; passo3(); $("#app").scrollTop = y; const h = $(".bets"); if (h) h.scrollIntoView({ behavior: R() ? "auto" : "smooth", block: "center" }); }

/* ===== Resultado ===== */
function resultado(n) {
  parar(); calar(); const c = V.c; V.stage = "fim";
  const rel = c.pistas.filter(p => p.k !== "x" && p.k !== "r" && !p.desde), falsas = c.pistas.filter(p => p.k === "x"), risc = c.pistas.filter(p => p.k === "r"), achou = rel.filter(p => V.salvas[p.id]).length, caiu = falsas.filter(p => V.salvas[p.id]);
  const sEv = Math.max(0, achou / rel.length - caiu.length * .12), dec = c.pistas.filter(p => p.k === "d"), certas = (V.esc || []).filter(id => dec.some(p => p.id === id)).length, sDec = certas / 2, dif = V.urgE - c.urg, sUrg = dif === 0 ? 1 : (c.urg === 0 ? 0 : Math.max(0, 1 - .3 * Math.abs(dif))), okC = V.op === c.c, sCon = okC ? 1 : 0;
  let pct = Math.round(sEv * 25 + sDec * 25 + sUrg * 25 + sCon * 25); const sobra = P.calma ? 0 : Math.max(0, c.tempo - V.t); if (sobra > c.tempo * .25 && pct >= 60) pct = Math.min(100, pct + 5);
  const perigo = c.urg === 0 && dif > 0;
  /* Tetos: errar a conduta ou subestimar emergência limita a C; guardar quase tudo sem critério limita a B. */
  if (perigo || !okC) pct = Math.min(pct, 54); else if (sEv < .5) pct = Math.min(pct, 74); else if (dif !== 0) pct = Math.min(pct, 89);
  const nota = pct >= 90 ? "S" : pct >= 75 ? "A" : pct >= 55 ? "B" : "C", win = okC && dif === 0, bonus = V.dia && P.dia !== diaHoje() ? 2 : 0, delta = win ? n * 2 : -n;
  P.lupas = Math.max(0, P.lupas + delta + 1 + bonus); P.total += (win ? n * 2 : 0) + 1 + bonus; const antesF = feitos(), ord = "CBAS", r = P.casos[c.id];
  if (okC && !perigo) { if (!r || ord.indexOf(nota) > ord.indexOf(r.nota)) P.casos[c.id] = { nota, em: diaHoje() }; } const passou = okC && !perigo;
  P.st.seq = okC ? P.st.seq + 1 : 0; P.st.seqMax = Math.max(P.st.seqMax, P.st.seq); if (win && !V.dicas) P.st.semDica++; if (win && !P.calma && sobra >= c.tempo * .5) P.st.rapido++; if (nota === "S") P.st.perfeitos++; if (V.dia) { P.dia = diaHoje(); P.st.diarios++; }
  P.raras = P.raras || {}; c.pistas.forEach(p => { if (p.raro && V.salvas[p.id] && !P.raras[c.id + p.id]) { P.raras[c.id + p.id] = 1; P.st.raras++; } });
  salvar(); musica(MUS.fim, 0); sfx("carimbo"); setTimeout(() => sfx(win ? "vitoria" : "queda"), 350); if (win && !R()) confeteFim();
  const linha = p => { const salva = V.salvas[p.id], perd = V.perdidas[p.id]; if (p.k === "x") return salva ? '<span class="bad">Caiu aqui:</span>' : '<span class="good">Não caiu:</span>'; if (salva) return '<span class="good">Guardou:</span>'; if (perd) return '<span class="bad">O Silencioso apagou:</span>'; return '<span class="bad">Ficou de fora:</span>'; }, vis = p => !p.desde || V.st[p.id];
  const item = p => `<li>${visual(p, "nano")}<span class="tx">${linha(p)} ${p.t}${p.k === "d" ? " ★" : ""}. <em>${p.w}</em></span></li>`;
  const cena = c.id === "juno" ? (win ? "H17_01" : perigo ? "H14_01" : "H13_01") : win || passou ? "H" + (16 + c.n) + "_03" : c.urg <= 1 ? "H13_01" : (c.id === "mia" ? "O85_07" : "H" + (16 + c.n) + "_02");
  const selo = { S: "I18_01c", A: "I18_02c", B: "I18_03c", C: "I18_03c" }[nota], rec = win ? "venceu" : "perdeu", k = CASOS.indexOf(c), prox = CASOS[k + 1], acabou = feitos() === CASOS.length && antesF < CASOS.length;
  tela(`<div class="fimcaso"><div class="cenafim">${foto_(cena)}<div class="grade n${nota}" aria-hidden="true">${foto_(selo)}<b>${nota}</b></div></div><div class="pad stack"><h1 class="center">${passou ? "Caso encerrado" : "O Silencioso escapou"} · Nota ${nota}</h1>
  ${perigo ? '<div class="warn">Este caso era emergência. Na vida real, esperar poderia custar caro. Vale jogar de novo.</div>' : ""}
  <div class="dra">${foto_("P29_01", "Doutora")}<p>${c.exp}</p></div>
  <div class="card score"><span>Evidências guardadas</span><b>${Math.round(sEv * 25)}/25</b><span>Fio vermelho</span><b>${Math.round(sDec * 25)}/25</b><span>Urgência: ${URG[V.urgE]}${dif === 0 ? "" : ` (ideal: ${URG[c.urg]})`}</span><b>${Math.round(sUrg * 25)}/25</b><span>Conduta</span><b>${sCon * 25}/25</b><span>Aposta de ${n} ${n === 1 ? "lupa" : "lupas"}</span><b class="${delta >= 0 ? "good" : "bad"}">${delta >= 0 ? "+" : ""}${delta}</b>${bonus ? "<span>Caso do dia</span><b class='good'>+2</b>" : ""}</div>
  ${!okC ? `<div class="card"><b>A melhor conduta:</b> ${c.ops[c.c]}</div>` : ""}
  <div class="card"><b style="color:var(--ouro)">A armadilha deste caso</b><br>${c.armadilha}</div><div class="card licao"><b>Guarde esta lição</b><br>${c.licao}</div>
  <details><summary>Pegadinhas (${falsas.length - caiu.length} de ${falsas.length} evitadas)</summary><div><ul class="rev">${falsas.filter(vis).map(item).join("")}</ul></div></details>
  <details><summary>Evidências que importavam (${achou} de ${rel.length})</summary><div><ul class="rev">${rel.map(item).join("")}</ul></div></details>
  ${risc.length ? `<details><summary>Riscos à parte nesta casa (${risc.length})</summary><div><ul class="rev">${risc.map(item).join("")}</ul></div></details>` : ""}
  <div class="bilhete-fim" style="background-image:url(${im("I02_01t")})">“${FRASES[rec][0]}”<br>— O Silencioso</div>
  ${acabou ? '<button class="btn" data-act="saga">▶ Ver o final da história</button>' : passou && prox ? `<button class="btn" data-act="caso" data-id="${prox.id}">Próximo: ${prox.titulo}</button>` : ""}<button class="btn ${passou ? "ghost" : ""}" data-act="soCaso">Tentar de novo</button><button class="btn ghost" data-act="ir" data-r="agencia">Voltar à agência</button></div></div>`);
  barra("mapa"); falar((perigo ? [FRASES.perigo[0]] : []).concat([c.exp, c.licao, FRASES[rec][0]])); conferir();
}
function confeteFim() { const box = $("#shell"), cores = ["#E8C26A", "#8FE3C4", "#F08A70", "#FBF3E0"]; for (let i = 0; i < 24; i++) { const e = document.createElement("i"); e.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:9px;height:14px;border-radius:2px;background:${cores[i % 4]};z-index:7;pointer-events:none;animation:cair ${1.2 + Math.random() * .7}s ease-in ${Math.random() * .4}s forwards`; box.appendChild(e); setTimeout(() => e.remove(), 2400); } }
function saga() { iniciarAudio(); V.c = CASOS[0]; rodarCena(FIM_SAGA, () => { P.saga = true; salvar(); agencia(); }, MUS.fim, 0); }

/* ===== Plantão ===== */
function plantao() {
  parar(); calar(); barra("agencia"); V = { pl: PLANTAO.map((_, i) => i).sort(() => Math.random() - .5).slice(0, 6), k: 0, ok: 0 };
  tela(`<div class="pad stack center">${foto_("C29_01", "", "larga")}<h1>Plantão de Emergência</h1><p>Seis situações. Para cada uma, decida o que fazer.</p><button class="btn" data-act="plComeca">Atender</button><button class="btn ghost" data-act="ir" data-r="agencia">Voltar</button></div>`);
}
function plQ() { const s = PLANTAO[V.pl[V.k]]; tela(`<div class="pad stack"><span class="step">Chamada ${V.k + 1} de 6</span>${foto_(s.i, "", "larga papelb")}<h1>${s.s}</h1><div class="stack">${PLANTAO_OPS.map((o, i) => `<button class="ev com" data-act="plR" data-o="${i}">${foto_(["I30_01c", "I30_03c", "I30_04c"][i])}<b>${o}</b></button>`).join("")}</div></div>`); }
function plR(o) { const s = PLANTAO[V.pl[V.k]], ok = +o === s.r; if (ok) V.ok++; sfx(ok ? "vitoria" : "queda"); vib(ok ? 12 : [30, 40, 30]); tela(`<div class="pad stack center">${foto_(ok ? "P03_06c" : "P04_05c", "", "meio")}<h1>${ok ? "Isso mesmo!" : "Não foi desta vez"}</h1><p><b>${PLANTAO_OPS[s.r]}.</b> ${s.e}</p><button class="btn" data-act="plProx">${V.k < 5 ? "Próxima chamada" : "Ver resultado"}</button></div>`); $("#app .btn").focus(); }
function plProx() {
  if (++V.k < 6) return plQ(); P.st.plantoes++; P.st.plantaoMax = Math.max(P.st.plantaoMax, V.ok); const g = V.ok >= 5 ? 2 : V.ok >= 3 ? 1 : 0; P.lupas += g; P.total += g; salvar();
  tela(`<div class="pad stack center">${foto_(V.ok >= 5 ? "M12_03" : "M09_05", "", "larga")}<h1>${V.ok} de 6 decisões certas</h1><p>${V.ok === 6 ? "Nervos de aço, detetive." : "Cada plantão deixa seu olhar mais rápido."}${g ? ` Você ganhou ${g} ${g === 1 ? "lupa" : "lupas"}.` : ""}</p><button class="btn" data-act="ir" data-r="plantao">Novo plantão</button><button class="btn ghost" data-act="ir" data-r="agencia">Voltar à agência</button></div>`); conferir();
}

/* ===== Rotina ===== */
function chaveRot(id) { const d = new Date(); if (id === "dia") return diaHoje(); if (id === "semana") return "s" + Math.floor((semente() + 3) / 7); if (id === "mes") return d.getFullYear() + "-" + p2(d.getMonth() + 1); return "" + d.getFullYear(); }
function rotina() {
  parar(); calar(); V = {}; musica(MUS.casa, .2); barra("rotina");
  tela(`<div class="pad stack">${foto_("C33_06", "", "larga")}<h1>Rotina do tutor</h1><p class="muted small">Para o seu gato de verdade. Fica salvo neste aparelho.</p>${ROTINA.map((r, i) => { const m = (P.rot[r.id] || {})[chaveRot(r.id)] || {}; return `<section class="card stack"><div class="tit">${foto_("I32_0" + (i + 1) + "c")}<h2>${r.titulo}</h2></div>${r.itens.map((t, k) => `<label class="check ${m[k] ? "ok" : ""}"><input type="checkbox" data-rot="${r.id}" data-k="${k}" ${m[k] ? "checked" : ""}>${foto_(t[1])}<span>${t[0]}</span></label>`).join("")}</section>`; }).join("")}</div>`);
}
function marcarRot(el) {
  const id = el.dataset.rot, ch = chaveRot(id); P.rot[id] = P.rot[id] && P.rot[id][ch] ? P.rot[id] : { [ch]: {} }; const m = P.rot[id][ch]; m[el.dataset.k] = el.checked; el.closest(".check").classList.toggle("ok", el.checked); sfx(el.checked ? "pino" : "papel");
  if (id === "dia" && el.checked && ROTINA[0].itens.every((_, k) => m[k]) && P.rotUlt !== diaHoje()) { P.rotUlt = diaHoje(); P.st.rotinaDias++; P.lupas++; P.total++; toast("Rotina do dia completa! +1 lupa", "R17_01c"); conferir(); } salvar();
}

/* ===== Diário e medalhas ===== */
function diario() {
  parar(); calar(); V = {}; musica(MUS.casa, .2); barra("diario"); const f = feitos();
  tela(`<div class="pad stack">${foto_("C33_07", "", "larga")}<h1>Diário de pistas</h1>${f ? "" : `<div class="card center">${foto_("I42_01", "", "meio")}<p>Seu diário ainda está em branco. Resolva um caso para colar a primeira carta.</p></div>`}<div class="cartas">${CASOS.map(c => { const r = P.casos[c.id]; return r ? `<button class="carta-c" data-act="carta" data-id="${c.id}">${foto_("R27_" + p2(c.n))}<span>${c.gato}</span><i class="selo-n n${r.nota}">${r.nota}</i></button>` : `<div class="carta-c vazia">${foto_("R27_15")}<span>?</span></div>`; }).join("")}</div></div>`);
}
function carta(id) { calar(); const c = caso(id); barra("diario"); tela(`<div class="pad stack"><div class="carta-c grande">${foto_("R27_" + p2(c.n))}<span>${c.gato}</span></div><h1 class="center">${c.titulo}</h1><div class="card licao"><b>Lição</b><br>${c.licao}</div><div class="card"><b>Para o dia a dia</b><ul>${c.dicas.map(d => `<li>${d}</li>`).join("")}</ul></div><button class="btn" data-act="ouvir" data-id="${id}">Ouvir a lição</button><button class="btn ghost" data-act="ir" data-r="diario">Voltar ao diário</button></div>`); }
function conquistas() {
  parar(); calar(); V = {}; barra("conquistas"); const n = CONQ.filter(c => P.conq[c.id]).length;
  tela(`<div class="pad stack">${foto_("C33_05", "", "larga")}<h1>Medalhas · ${n} de ${CONQ.length}</h1><div class="grade2 medal">${CONQ.map((c, k) => `<div class="tile ${P.conq[c.id] ? "on" : ""}">${foto_(P.conq[c.id] ? "R" + p2(k + 1) + "_01c" : "R21_01c", "", P.conq[c.id] ? "" : "apagado")}<b>${c.n}</b><small>${c.d}</small></div>`).join("")}</div></div>`);
}
function ajustes() {
  barra("agencia");
  tela(`<div class="pad stack">${foto_("C33_08", "", "larga")}<h1>Ajustes</h1>${[["som", "Música e efeitos", P.som], ["voz", "Narração (Santa e Dora)", P.voz], ["calma", "Modo sem pressa", P.calma]].concat(PEDE_CALMA ? [["mov", "Ligar animações", P.movimento]] : []).map(a => `<label class="check"><input type="checkbox" data-aj="${a[0]}" ${a[2] ? "checked" : ""}><span>${a[1]}</span></label>`).join("")}${temSW() ? `<button class="btn ghost" data-act="baixar" id="bx">Baixar para jogar sem internet (30 MB)</button>` : ""}<button class="btn ghost" data-act="rever">Rever o tutorial no próximo caso</button><button class="btn ghost" data-act="apagar">Apagar meu progresso</button><p class="small muted">O jogo é educativo e não substitui a consulta com um médico-veterinário. Nenhum dado sai deste aparelho.</p><button class="btn" data-act="ir" data-r="agencia">Voltar à agência</button></div>`);
}

/* ===== Emergência ===== */
function vet() {
  if ($("#em")) return fecharVet(); if (C) pausarVoz(); else calar(); V.emerg = true; P.st.emerg++; salvar(); const e = document.createElement("div"); e.className = "overlay stack"; e.id = "em"; e.setAttribute("role", "dialog"); e.setAttribute("aria-label", "Quando procurar o veterinário"); const li = l => `<ul class="sinais">${l.map(x => `<li>${foto_(x[1])}<span>${x[0]}</span></li>`).join("")}</ul>`, tel = CLINICA.ativo && CLINICA.telefone;
  e.innerHTML = `<button class="btn" data-act="fecharVet">Voltar</button><div class="dra">${foto_("P29_01", "Doutora")}<p>${FRASES.emerg[0]}</p></div>${tel ? `<a class="btn mint" href="tel:${CLINICA.telefone.replace(/[^\d+]/g, "")}">Ligar para ${CLINICA.nome}</a>` : ""}<h2 class="al">Procure atendimento agora</h2>${li(EM.agora)}<h2>Marque consulta em breve</h2>${li(EM.breve)}<h2>O que fazer até chegar</h2>${li(EM.fazer)}<p class="small muted">O jogo fica pausado aqui. Ele orienta, mas não substitui a consulta.</p><button class="btn" data-act="fecharVet">Voltar</button>`; $("#shell").appendChild(e); e.querySelector("button").focus(); if (!C) falar(FRASES.emerg[0]);
}
function fecharVet() { const e = $("#em"); if (e) e.remove(); V.emerg = false; if (C) voltarVoz(); else { calar(); conferir(); } }

/* ===== Eventos ===== */
function alternaSom(b) { P.som = !P.som; salvar(); if (SOM.master) SOM.master.gain.value = P.som ? 1 : 0; if (b) { b.setAttribute("aria-pressed", P.som); b.innerHTML = foto_(P.som ? "I27_03c" : "I27_04c"); } }
function alternaVoz(b) { P.voz = !P.voz; salvar(); if (b) { b.setAttribute("aria-pressed", P.voz); b.innerHTML = foto_(P.voz ? "I27_05c" : "I27_06c"); } if (!P.voz) { calar(); if (C) { C.falou = true; talvezSiga(C.gen); } } }
/* Jogar sem internet: só no site publicado, que tem o manifesto. */
const temSW = () => "serviceWorker" in navigator && !!document.querySelector("link[rel=manifest]") && (location.protocol === "https:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
if (temSW()) { navigator.serviceWorker.register("sw.js").catch(() => {}); navigator.serviceWorker.addEventListener("message", e => { const b = $("#bx"), d = e.data || {}; if (!b) return; if (d.pronto) { b.textContent = "Pronto! O jogo funciona sem internet"; b.disabled = true; } else if (d.erro) { b.textContent = "Não deu para baixar. Tentar de novo"; b.disabled = false; } else b.textContent = `Baixando… ${Math.round(d.baixados / d.total * 100)}%`; }); }
const ROTAS = { agencia, mapa, rotina, diario, conquistas, ajustes, plantao, trajes };
const A = {
  ir: d => { iniciarAudio(); calar(); limparT(); ROTAS[d.r](); if (d.r === "rotina" && !P.ouviuRot) { P.ouviuRot = 1; salvar(); dizer("rotina"); } if (d.r === "plantao") dizerPouco("plantao", 2); }, inicio, entrar: () => { iniciarAudio(); agencia(); }, comecarHist, caso: d => { iniciarAudio(); abrirCaso(d.id, d.dia); }, trancado: () => toast("Resolva o caso anterior para abrir este.", "I29_02c"), verHist, soCaso: comecarInv, saga, tocar: tocarQuadro, pular: pularCena, alternaSom: (d, b) => alternaSom(b), alternaVoz: (d, b) => alternaVoz(b),
  vestir: d => { P.cosm = d.id; salvar(); sfx("pino"); trajes(); }, pista: d => abrir(+d.k), xsheet: () => fecharSheet(), guardar: d => guardar(d.s), sala: d => irSala(+d.r), foto: (d, b) => foto(b), dica, pausar, voltar: () => { const z = $("#pz"); if (z) z.remove(); V.pausa = false; }, fechar: passo1, reabrir: () => { calar(); V.stage = "inv"; musica(MUS.inv, 0); inv(); if (!P.calma) relogio(); },
  ntTocar: (d, b) => { const p = b.querySelector(".pino"); if (p && p.dataset.ignorar) { delete p.dataset.ignorar; return; } ntTocar(d.id); }, p2: () => { calar(); passo2(); }, urg: d => { V.urgE = +d.u; vib(10); sfx("pino"); passo3(); falar(V.c.q); }, op: d => { sfx("pino"); escolherOp(+d.o); }, apostar: d => resultado(+d.n), vet, fecharVet, plComeca: () => { calar(); plQ(); }, plR: d => plR(d.o), plProx, carta: d => carta(d.id), ouvir: d => { iniciarAudio(); falar(caso(d.id).licao); },
  rever: () => { P.tutorial = false; salvar(); toast("O tutorial volta no próximo caso."); }, baixar: (d, b) => { b.disabled = true; b.textContent = "Preparando…"; navigator.serviceWorker.ready.then(r => r.active.postMessage("baixar")); }, apagar: (d, b) => { if (b.dataset.sim) { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); } else { b.dataset.sim = 1; b.textContent = "Toque de novo para apagar tudo"; } }
};
document.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b || b.disabled) return; if (V.moveu && b.classList.contains("spot")) return; const f = A[b.dataset.act]; if (f) f(b.dataset, b); });
document.addEventListener("change", e => {
  const t = e.target; if (t.matches("[data-calma]")) { P.calma = t.checked; salvar(); } if (t.matches("[data-mov]")) { P.movimento = t.checked; salvar(); aplicarMovimento(); } if (t.matches("[data-rot]")) marcarRot(t);
  if (t.matches("[data-aj]")) { const k = t.dataset.aj; if (k === "som") { P.som = !t.checked; alternaSom(); } else if (k === "voz") { P.voz = !t.checked; alternaVoz(); } else if (k === "calma") { P.calma = t.checked; salvar(); } else { P.movimento = t.checked; salvar(); aplicarMovimento(); } }
});
document.addEventListener("keydown", e => { if (e.key === "Escape") { if ($("#em")) fecharVet(); else if ($("#sheet")) fecharSheet(); } });
document.addEventListener("visibilitychange", () => { if (document.hidden) { if (SOM.ctx) SOM.ctx.suspend(); if (!V.emerg) pausarVoz(); } else { if (SOM.ctx) SOM.ctx.resume(); if (!V.emerg) voltarVoz(); } });
inicio();

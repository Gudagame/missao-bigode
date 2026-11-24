/* Missão Bigode: guarda o que já foi aberto e permite baixar tudo para jogar sem internet. */
const VERSAO = "cfd9bf6e", BASE = "bigode-base-" + VERSAO, MIDIA = "bigode-midia-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(l => Promise.all(l.filter(n => n.startsWith("bigode-") && n !== BASE && n !== MIDIA).map(n => caches.delete(n)))).then(() => self.clients.claim())));
const ehMidia = u => /\/(img|voz)\//.test(u.pathname);
async function parte(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get("range") || ""); if (!m) return res;
  const b = await res.arrayBuffer(), tam = b.byteLength, ini = m[1] ? +m[1] : Math.max(0, tam - +m[2]), fim = m[1] && m[2] ? Math.min(+m[2], tam - 1) : tam - 1;
  if (ini >= tam) return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + tam } });
  return new Response(b.slice(ini, fim + 1), { status: 206, headers: { "Content-Type": res.headers.get("Content-Type") || "audio/mpeg", "Content-Range": `bytes ${ini}-${fim}/${tam}`, "Content-Length": String(fim - ini + 1), "Accept-Ranges": "bytes" } });
}
async function midia(req) {
  const c = await caches.open(MIDIA), chave = new URL(req.url).pathname; let r = await c.match(chave);
  /* Imagens: mostra a guardada e busca a nova por trás. Vozes têm nome único e não mudam. */
  if (r && !chave.includes("/voz/")) fetch(chave).then(n => n.ok && c.put(chave, n)).catch(() => {});
  if (!r) { r = await fetch(chave); if (!r.ok) return r; await c.put(chave, r.clone()); }
  return parte(req, r);
}
async function base(req) {
  const c = await caches.open(BASE);
  try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; } catch (e) { const r = (await c.match(req)) || (req.mode === "navigate" ? await c.match(new URL("./", self.registration.scope)) : null); if (r) return r; throw e; }
}
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url); if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(ehMidia(u) ? midia(e.request) : base(e.request));
});
self.addEventListener("message", e => {
  if (e.data !== "baixar") return;
  e.waitUntil((async () => {
    const diz = m => e.source && e.source.postMessage(m);
    try {
      const l = await (await fetch("arquivos.json")).json(), cb = await caches.open(BASE), cm = await caches.open(MIDIA); let n = 0;
      for (let i = 0; i < l.length; i += 6) {
        await Promise.all(l.slice(i, i + 6).map(async p => { const u = new URL(p, self.registration.scope), c = ehMidia(u) ? cm : cb, k = ehMidia(u) ? u.pathname : u.href; if (!(await c.match(k))) { const r = await fetch(u); if (!r.ok) throw Error(p); await c.put(k, r); } n++; }));
        diz({ baixados: n, total: l.length });
      }
      diz({ pronto: true });
    } catch (err) { diz({ erro: true }); }
  })());
});

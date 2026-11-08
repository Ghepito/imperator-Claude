// Fait tourner Imperator.user.js hors jeu (jsdom), avec les données exportées (v2.36).
// Usage : const page = await charger(scriptPath, exportPath, { now })
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

module.exports = async function charger(scriptPath, exportPath, opts = {}) {
  const exp = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
  const store = Object.assign({}, exp.values, opts.valeurs || {}); // opts.valeurs : valeurs GM en plus
  const logs = [];
  const vc = new VirtualConsole();
  ['log', 'info', 'warn', 'error', 'debug'].forEach(k => vc.on(k, (...a) => logs.push(k + ' ' + a.map(String).join(' '))));
  vc.on('jsdomError', e => logs.push('jsdomError ' + (e.stack || e.message)));
  const html = opts.html || '<!doctype html><html><head></head><body id="city"><div id="container"><div id="GF_toolbar"><ul><li class="version">v17.6.1</li></ul></div>' +
    '<div id="header"></div><div id="cityResources"></div><div id="mainview"></div><div id="cityBuildings"></div></div></body></html>';
  const dom = new JSDOM(html, { url: 'https://' + exp.domain + '/index.php?view=city&cityId=' + (opts.cityId || ''),
                                runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  Object.defineProperty(w.document, 'domain', { value: exp.domain, configurable: true }); // absent de jsdom
  if (opts.now) { const N = opts.now; const RD = w.Date; w.eval('(' + function (N) {
      const R = Date; function F(...a) { return a.length ? new R(...a) : new R(N); } F.prototype = R.prototype;
      F.now = () => N; F.UTC = R.UTC; F.parse = R.parse; Date = F; }.toString() + ')(' + N + ')'); }
  w.eval(fs.readFileSync(require.resolve('jquery1/dist/jquery.js'), 'utf8'));
  // Objets du jeu : « attrape-tout » (toute propriété existe, tout appel répond), plus les vraies valeurs utiles
  w.eval(`window.__impAny = function mk(name) {
      var f = function () { return mk(name + '()'); };
      return new Proxy(f, { get: function (t, k) {
        if (k === Symbol.toPrimitive) return function () { return ''; };
        if (k === 'toString' || k === 'valueOf') return function () { return ''; };
        if (k === 'then') return undefined;
        if (!(k in t)) t[k] = mk(name + '.' + String(k));
        return t[k]; } });
    };`);
  w.ikariam = w.__impAny('ikariam');
  w.ajax = { Responder: { changeView: function () {}, updateGlobalData: function () {}, updateTemplateData: function () {},
                          updateBackgroundData: function () {}, addWindow: function () {}, createTemplateView: function () {} } };
  w.ajaxHandlerCall = function () {}; w.ajaxHandlerCallFromForm = function () {};
  // Ville active (comme le jeu la déclare) : première ville de l'empire exporté, ou opts.cityId
  let rel = null;
  try {
    const empKey = Object.keys(exp.values).find(k => /\/empireData\//.test(k));
    const emp = JSON.parse(exp.values[empKey]);
    const order = emp.cityOrder && emp.cityOrder.length ? emp.cityOrder : Object.keys(emp.cities);
    const id = String(opts.cityId || order[0]);
    rel = { selectedCity: 'city_' + id };
    const TG = { wine: '1', marble: '2', glass: '3', sulfur: '4' };
    order.forEach(c => {
      const ci = emp.cities[c] || {};
      rel['city_' + c] = { id: String(c), name: ci.name || '', relationship: ci.type || 'ownCity',
                           coords: ci.islandCoordinates ? '[' + ci.islandCoordinates.join(':') + ']' : '',
                           tradegood: TG[ci.tradeGoodType] || '' };
    });
  } catch (e) { logs.push('ville active introuvable ' + e); }
  w.ikariam.model = Object.assign(w.__impAny('ikariam.model'), { relatedCityData: rel });
  w.dataSetForView = opts.dataSetForView || { relatedCityData: rel }; // la liste des villes vient d'ici
  // Fenêtres du jeu : une boîte <div id=boxId> dans la page, comme ikariam.createTemplateView
  w.ikariam.templateView = { id: null };
  w.ikariam.createTemplateView = function (arg) {
    const old = w.document.getElementById(arg.boxId); if (old) old.remove();
    const box = w.document.createElement('div'); box.id = arg.boxId; box.className = 'templateView';
    box.innerHTML = '<div class="hd">' + (arg.headerElem || '') + '</div><div class="bd">' + arg.contentElem + '</div>';
    w.document.getElementById('container').appendChild(box);
    return {};
  };
  if (opts.ikariam) Object.assign(w.ikariam, opts.ikariam);
  Object.assign(w, {
    GM_getValue: (k, d) => (k in store ? store[k] : d),
    GM_setValue: (k, v) => { store[k] = v; },
    GM_addStyle: css => { const st = w.document.createElement('style'); st.textContent = css; w.document.head.appendChild(st); },
    GM_notification: () => {}, GM_xmlhttpRequest: () => {},
    GM_info: { script: { version: 'banc' } },
  });
  w.unsafeWindow = w;
  const src = fs.readFileSync(scriptPath, 'utf8');
  try { w.eval(src + '\n//# sourceURL=Imperator.user.js'); } catch (e) { logs.push('EXEC ' + (e.stack || e)); }
  await new Promise(r => setTimeout(r, opts.wait || 1500));
  return { dom, window: w, document: w.document, $: w.jQuery, logs, store };
};

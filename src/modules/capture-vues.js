////////////////////////////////////////////////////////////////
// v2.23 : capture des vues du jeu (pages de référence pour les tests)
// Aucune requête au serveur, rien n'est envoyé : tout reste en mémoire
// jusqu'au téléchargement demandé dans Réglages > Debug.
////////////////////////////////////////////////////////////////
(function installViewCapture() {
  'use strict';

  var MAX_VIEWS = 20;
  var RENDER_DELAY_MS = 2500; // après la 2e passe des parseurs (2 s)
  var store = {};
  window.__impCaptures = store;

  // Jetons actionRequest masqués (ils servent à valider les actions du joueur)
  function scrub(text) {
    return String(text == null ? '' : text)
      .replace(/(name=["']?actionRequest["']?[^>]*?value=["'])[^"']*/gi, '$1XXX')
      .replace(/(value=["'])[^"']*(["'][^>]*?name=["']?actionRequest)/gi, '$1XXX$2')
      .replace(/(actionRequest\W{1,4})[0-9a-f]{8,}/gi, '$1XXX');
  }

  function gameVersion() {
    try {
      var t = $('#GF_toolbar li.version').first().text();
      var m = String(t).match(/\d+(?:\.\d+)+/);
      return m ? m[0] : 'inconnue';
    } catch (e) { return 'inconnue'; }
  }

  function imperatorVersion() {
    try { return GM_info.script.version || '?'; } catch (e) { return '?'; }
  }

  function keep(view, entry) {
    store[view] = entry;
    var keys = Object.keys(store);
    if (keys.length > MAX_VIEWS) {
      keys.sort(function (a, b) { return store[a].time - store[b].time; });
      delete store[keys[0]];
    }
  }

  function renderedOf(view) {
    var el = document.getElementById(view);
    return el ? scrub(el.outerHTML) : null;
  }

  function onResponse(response) {
    try {
      var T = IkaTools.Constants.IkariamAjaxResponseType;
      var items = [], templateData = null, background = null;
      IkaTools.Utils.iterateIkariamAjaxResponse(response, function (i, name, data) {
        // v2.26 : données de la vue île (villes, joueurs, alliances)
        if (name === T.UPDATE_BACKGROUND_DATA) {
          background = data;
        } else if (name === T.UPDATE_GLOBAL_DATA && data && !background) {
          background = data['backgroundData'] || data[11] || null;
        }
        if (name === T.CHANGE_VIEW && data && data[0]) {
          items.push({ view: String(data[0]), html: data[1] });
        } else if (name === T.UPDATE_TEMPLATE_DATA) {
          templateData = data;
        } else if ((name === T.ADD_WINDOW || name === T.CREATE_VIEW) && data && data[0]) {
          items.push({ view: String(data[0]), html: data[1] });
        }
      });
      if (background && background.cities) {
        var isle = {
          view: 'island',
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: '',
          templateData: null,
          backgroundData: null,
          rendered: null,
        };
        try { isle.backgroundData = scrub(JSON.stringify(background, null, 1)); } catch (e) {}
        keep('island', isle);
        setTimeout(function () { try { isle.rendered = renderedOf('island'); } catch (e) {} }, RENDER_DELAY_MS);
      } else if (background && background.position) {
        // v2.29 : dernière vue ville (une seule place, pour ne pas évincer les autres vues)
        var town = {
          view: 'cityData',
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: '',
          templateData: null,
          backgroundData: null,
          rendered: null,
        };
        try { town.backgroundData = scrub(JSON.stringify(background, null, 1)); } catch (e) {}
        keep('cityData', town);
      }
      // v2.32 : réponse sans nouvelle vue mais avec des données (ex. le tableau des mouvements du
      // Conseiller militaire, envoyé juste après la page) : rattachée à la dernière vue capturée.
      if (!items.length && templateData) {
        var last = null;
        Object.keys(store).forEach(function (k) {
          if (k !== 'island' && k !== 'cityData' && (!last || store[k].time > last.time)) last = store[k];
        });
        if (last && Date.now() - last.time < 60000) {
          try {
            last.followUps = (last.followUps || []).concat([scrub(JSON.stringify(templateData, null, 1))]).slice(-5);
          } catch (e) {}
        }
      }
      items.forEach(function (it) {
        var entry = {
          view: it.view,
          time: Date.now(),
          game: gameVersion(),
          imperator: imperatorVersion(),
          raw: scrub(it.html),
          templateData: null,
          rendered: null,
        };
        try { if (templateData) entry.templateData = scrub(JSON.stringify(templateData, null, 1)); } catch (e) {}
        keep(it.view, entry);
        setTimeout(function () { try { entry.rendered = renderedOf(it.view); } catch (e) {} }, RENDER_DELAY_MS);
      });
    } catch (e) {
      console.warn('[Imperator] Capture de vue ignorée', e);
    }
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function stamp(t) {
    var d = new Date(t);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '_' + pad(d.getHours()) + 'h' + pad(d.getMinutes());
  }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function fileName(entry) {
    return ('capture_' + entry.view + '_' + stamp(entry.time) + '_v' + entry.game + '.html')
      .replace(/[^A-Za-z0-9_.\-]/g, '_');
  }

  // Contenu inerte : les blocs sont dans des <template> (aucun script exécuté à l'ouverture)
  function buildFile(entry) {
    var noTpl = function (x) { return String(x).replace(/<\/template/gi, '<\\/template'); };
    var json = String(entry.templateData || 'null').replace(/<\/script/gi, '<\\/script');
    var bgJson = String(entry.backgroundData || 'null').replace(/<\/script/gi, '<\\/script'); // v2.26
    var fuJson = '[' + (entry.followUps || []).join(',\n').replace(/<\/script/gi, '<\\/script') + ']'; // v2.32
    return '<!doctype html>\n<html lang="fr"><head><meta charset="utf-8">' +
      '<title>Capture ' + esc(entry.view) + '</title></head><body>\n' +
      '<h1>Capture Imperator : ' + esc(entry.view) + '</h1>\n' +
      '<ul>' +
      '<li>Date : ' + esc(new Date(entry.time).toLocaleString('fr-FR')) + '</li>' +
      '<li>Version du jeu : ' + esc(entry.game) + '</li>' +
      '<li>Version Imperator : ' + esc(entry.imperator) + '</li>' +
      '<li>Page rendue : ' + (entry.rendered ? 'oui' : 'non disponible') + '</li>' +
      '<li>Jetons actionRequest masqués (XXX)</li>' +
      '</ul>\n' +
      '<template id="imp-capture-rendered">\n' + noTpl(entry.rendered || '') + '\n</template>\n' +
      '<template id="imp-capture-raw">\n' + noTpl(entry.raw || '') + '\n</template>\n' +
      '<script type="application/json" id="imp-capture-templateData">\n' + json + '\n</script>\n' +
      '<script type="application/json" id="imp-capture-backgroundData">\n' + bgJson + '\n</script>\n' +
      '<script type="application/json" id="imp-capture-followUps">\n' + fuJson + '\n</script>\n' +
      '</body></html>\n';
  }

  function download(view) {
    var entry = store[view];
    if (!entry) return false;
    if (!entry.rendered) { try { entry.rendered = renderedOf(view); } catch (e) {} }
    var blob = new Blob([buildFile(entry)], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = fileName(entry);
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { try { URL.revokeObjectURL(url); a.remove(); } catch (e) {} }, 1000);
    console.log('[Imperator] Capture téléchargée :', a.download);
    return true;
  }

  function renderList($box) {
    if (!$box || !$box.length) return;
    var keys = Object.keys(store).sort(function (a, b) { return store[b].time - store[a].time; });
    if (!keys.length) {
      $box.html('<span style="font-size:11px">Aucune vue retenue depuis le chargement de la page. ' +
                'Ouvre une vue du jeu (Hôtel de Ville, Sanctuaire...), puis reviens ici.</span>');
      return;
    }
    var rows = keys.map(function (k) {
      var e = store[k];
      var kb = Math.round(((e.raw || '').length + (e.rendered || '').length + (e.templateData || '').length +
                           (e.backgroundData || '').length) / 1024);
      return '<tr><td style="text-align:left">' + esc(k) + '</td>' +
             '<td>' + esc(new Date(e.time).toLocaleTimeString('fr-FR')) + '</td>' +
             '<td>' + kb + ' ko</td>' +
             '<td><a class="button imp-capture-dl" data-view="' + esc(k) + '">Télécharger</a></td></tr>';
    }).join('');
    $box.html('<table style="width:100%;font-size:11px"><tbody>' + rows + '</tbody></table>');
    $box.find('.imp-capture-dl').on('click', function () { download($(this).attr('data-view')); });
  }

  window.__impRenderCaptures = renderList;
  window.__impDownloadCapture = download;
  window.__impBuildCapture = buildFile;   // pour les tests hors jeu
  window.__impScrubCapture = scrub;       // pour les tests hors jeu

  function ready() {
    return typeof IkaTools !== 'undefined' && IkaTools.View &&
           IkaTools.View.registerIkariamAjaxResponseCallback &&
           IkaTools.Utils && IkaTools.Utils.iterateIkariamAjaxResponse && IkaTools.Constants;
  }
  function install() {
    if (!ready()) return false;
    IkaTools.View.registerIkariamAjaxResponseCallback(onResponse, true);
    return true;
  }
  if (install()) return;
  var n = 0, timer = setInterval(function () { n++; if (install() || n > 100) clearInterval(timer); }, 100);
})();


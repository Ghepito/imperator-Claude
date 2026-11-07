// [Patch 1] Bloquer l'évaluation de HTML comme JS (window.jQuery ET unsafeWindow.jQuery)
(function installGlobalEvalGuards() {
    if (window.__imp_eval_guard_installed) return;
    window.__imp_eval_guard_installed = true;

    function hookJQ(jq, label) {
        if (!jq || !jq.globalEval || jq.__imp_eval_hooked) return false;
        jq.__imp_eval_hooked = true;

        const old = jq.globalEval;
        jq.globalEval = function (data) {
            try {
                if (typeof data === 'string' && data.trim().startsWith('<')) {
                    // HTML reçu au lieu de JS : on bloque silencieusement (anti-crash).
                    // (v2.07 : plus de console.warn — bruit inutile.)
                    return;
                }
            } catch (e) {}
            return old.apply(this, arguments);
        };
        return true;
    }

    function tryInstall() {
        let ok = false;
        ok = hookJQ(window.jQuery, 'window.jQuery') || ok;
        try { ok = hookJQ(unsafeWindow && unsafeWindow.jQuery, 'unsafeWindow.jQuery') || ok; } catch(e) {}
        return ok;
    }

    if (tryInstall()) return;
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (tryInstall() || tries > 100) clearInterval(t); // ~10s max
    }, 100);
})();

// [Patch 1b] v2.07 : silencier le bruit console d'une erreur du module pub/layout
// du jeu (bundle Gameforge) qui échoue à créer son widget quand il reçoit du HTML
// au lieu d'un script. Purement cosmétique — le jeu fonctionne normalement.
// Portée volontairement étroite : on ne masque QUE le message exact "reading 'create'"
// ET seulement s'il provient d'un script du CDN jeu (jamais d'Imperator/userscript),
// pour ne dissimuler aucune autre erreur.
// v2.22 : ne dépend plus du domaine du CDN (qui a changé). Deux erreurs connues,
// et elles seules, sont masquées : jamais une erreur venant d'Imperator.
(function installGameCreateErrorSilencer() {
    var w;
    try { w = unsafeWindow; } catch (e) { w = window; }
    if (!w || w.__imp_create_error_silencer) return;
    w.__imp_create_error_silencer = true;
    var masked = 0;
    function isKnownGameNoise(msg, src) {
        if (src.indexOf('userscript') >= 0 || src.indexOf('Imperator') >= 0) return false;
        // 1) le jeu charge ?view=city comme un script et reçoit une page HTML
        if (/Unexpected token '<'/.test(msg) && /[?&]view=city(?:&|$)/.test(src)) return true;
        // 2) conséquence directe dans le code du jeu
        if (msg.indexOf("reading 'create'") >= 0 && /\.js(?:\?|#|$)/.test(src)) return true;
        return false;
    }
    w.addEventListener('error', function (e) {
        try {
            var msg = (e && e.message) ? String(e.message) : '';
            var src = (e && e.filename) ? String(e.filename) : '';
            if (isKnownGameNoise(msg, src)) {
                masked++;
                if (masked === 1) {
                    console.info('[Imperator] Erreurs connues du jeu masquées (view=city reçue en HTML) : sans effet sur le jeu.');
                }
                e.preventDefault();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                return false;
            }
        } catch (err) {}
    }, true);
})();


// [Patch 2 SAFE v2] Ne casse pas view=city.
// - Laisse passer le vrai JS (script).
// - Si on reçoit du HTML à la place d'un script (cas toxique), on NE DONNE PAS ça au jeu.

(function installAjaxPrefilterSafeV2() {
    if (window.__imp_ajax_prefilter_safe_v2_installed) return;
    window.__imp_ajax_prefilter_safe_v2_installed = true;

    function hook(jq, label) {
        if (!jq || !jq.ajaxPrefilter || jq.__imp_prefilter_safe_v2_hooked) return false;
        jq.__imp_prefilter_safe_v2_hooked = true;

        jq.ajaxPrefilter(function (options, originalOptions, jqXHR) {
            try {
                if (!options) return;

                const url = options.url ? String(options.url) : "";
                const isCity = url.indexOf("index.php?view=city") !== -1;
                const dt = (options.dataType ? String(options.dataType).toLowerCase() : "");

                // On ne vise QUE le cas "script" (c'est là que jQuery eval)
                if (!isCity || dt !== "script") return;

                const oldSuccess = options.success;
                const oldError = options.error;

                options.success = function (data, textStatus, xhr) {
                    try {
                        // jQuery peut fournir string (source script). On détecte "HTML"
                        const txt = (typeof data === "string") ? data.trim() : "";
                        if (txt.startsWith("<")) {
                            console.warn("[Imperator][SAFE] view=city attendu SCRIPT mais HTML reçu → succès ignoré (prevent crash). URL=", url);

                            // Optionnel : prévenir l'erreur callback si présent, mais SANS casser le jeu
                            if (typeof oldError === "function") {
                                try { oldError.call(this, xhr || jqXHR, "parsererror", "HTML instead of script"); } catch (e) {}
                            }
                            return; // ⚠️ crucial : ne PAS appeler oldSuccess
                        }
                    } catch (e) {}

                    // Sinon -> comportement normal
                    if (typeof oldSuccess === "function") {
                        return oldSuccess.apply(this, arguments);
                    }
                };

                // Converters : si jamais jQuery passe par "text script", on neutralise uniquement HTML
                const oldConverters = options.converters || {};
                if (!oldConverters.__imp_text_script_safe) {
                    const prev = oldConverters["text script"];
                    options.converters = Object.assign({}, oldConverters, {
                        __imp_text_script_safe: true,
                        "text script": function (text) {
                            try {
                                const t = String(text || "").trim();
                                if (t.startsWith("<")) {
                                    console.warn("[Imperator][SAFE] converter text→script: HTML détecté → script vidé (prevent crash). URL=", url);
                                    return ""; // script vide
                                }
                            } catch (e) {}
                            return prev ? prev(text) : text;
                        }
                    });
                }

            } catch (e) {}
        });

        return true;
    }

    function tryInstall() {
        let ok = false;
        ok = hook(window.jQuery, "window.jQuery") || ok;
        try { ok = hook(unsafeWindow && unsafeWindow.jQuery, "unsafeWindow.jQuery") || ok; } catch(e) {}
        return ok;
    }

    if (tryInstall()) return;
    let tries = 0;
    const t = setInterval(() => {
        tries++;
        if (tryInstall() || tries > 100) clearInterval(t);
    }, 100);
})();

// fin patch 1 & 2

// v2.22 : échappement de tout texte venu du jeu avant insertion dans du HTML
function __impH(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
}



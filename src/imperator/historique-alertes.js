
    // ============================================================
    // v3.1 : historique des alertes de bureau.
    // Chaque alerte envoyée (ou qui n'a pas pu s'afficher) est notée : heure, titre, texte.
    // Les 50 dernières sont gardées. Consultation par l'entrée « Alertes » du menu de gauche.
    // ============================================================
    var IMP_ALERT_HISTORY_MAX = 50;
    var impAlertHistoryData = new IkaTools.Data.Value('alertHistory', [], { version: 1 });
    var impAlertHistoryListeners = [];

    // Relit la valeur sauvegardée : un autre onglet du jeu a pu ajouter des alertes.
    function impAlertHistoryList() {
        var list;
        try { list = impAlertHistoryData.load(); } catch (e) { list = impAlertHistoryData.data; }
        return Array.isArray(list) ? list : [];
    }

    function impAlertHistorySave(list) {
        impAlertHistoryData.data = list;
        try { impAlertHistoryData.save(); } catch (e) {}
        $.each(impAlertHistoryListeners, function(i, f) { try { f(); } catch (e) {} });
    }

    function impAlertHistoryAdd(title, text, shown) {
        try {
            var list = impAlertHistoryList().slice();
            list.unshift({ time: Date.now(), title: String(title || ''), text: String(text || ''),
                           shown: !!shown, read: false });
            if (list.length > IMP_ALERT_HISTORY_MAX) list.length = IMP_ALERT_HISTORY_MAX;
            impAlertHistorySave(list);
        } catch (e) {
            console.warn('[Imperator] Historique des alertes : enregistrement échoué', e);
        }
    }

    function impAlertHistoryUnread() {
        var n = 0;
        $.each(impAlertHistoryList(), function(i, a) { if (a && !a.read) n++; });
        return n;
    }

    function impAlertHistoryMarkRead() {
        var list = impAlertHistoryList(), changed = false;
        $.each(list, function(i, a) { if (a && !a.read) { a.read = true; changed = true; } });
        if (changed) impAlertHistorySave(list);
    }

    function impAlertHistoryClear() {
        impAlertHistorySave([]);
    }

    function impAlertHistoryOnChange(f) {
        impAlertHistoryListeners.push(f);
    }

    function impAlertTimeLabel(time) {
        var d = new Date(time), now = new Date();
        var two = function(n) { return (n < 10 ? '0' : '') + n; };
        var hm = two(d.getHours()) + ':' + two(d.getMinutes());
        if (d.toDateString() === now.toDateString()) return hm;
        return two(d.getDate()) + '/' + two(d.getMonth() + 1) + ' ' + hm;
    }

    // Panneau de consultation (indépendant des fenêtres du jeu).
    function impAlertHistoryShow() {
        impAlertHistoryStyles();
        $('#ImperatorAlertHistory').remove();
        var list = impAlertHistoryList();
        var rows = $.map(list, function(a) {
            if (!a) return null;
            return '<li class="' + (a.read ? '' : 'imp_ah_unread') + '">' +
                '<span class="imp_ah_time">' + __impH(impAlertTimeLabel(a.time)) + '</span>' +
                '<span class="imp_ah_title">' + __impH(a.title) + '</span>' +
                (a.shown ? '' : '<span class="imp_ah_notshown" title="' +
                    __impH(localizer.localize('misc', 'alert_history_not_shown')) + '">⚠</span>') +
                '<div class="imp_ah_text">' + __impH(a.text) + '</div></li>';
        }).join('');
        var panel = $('<div id="ImperatorAlertHistory">' +
            '<div class="imp_ah_head"><span>' + __impH(localizer.localize('misc', 'alert_history_title')) +
            '</span><a class="imp_ah_close" title="×">×</a></div>' +
            (rows ? '<ul>' + rows + '</ul>' :
                '<div class="imp_ah_empty">' + __impH(localizer.localize('misc', 'alert_history_empty')) + '</div>') +
            '<div class="imp_ah_foot"><a class="button imp_ah_clear">' +
            __impH(localizer.localize('misc', 'alert_history_clear')) + '</a></div></div>');
        panel.find('.imp_ah_close').click(function() { panel.remove(); });
        panel.find('.imp_ah_clear').click(function() { impAlertHistoryClear(); impAlertHistoryShow(); });
        $('body').append(panel);
        // Les alertes non lues restent en gras pendant cette consultation, puis passent en « lues ».
        impAlertHistoryMarkRead();
    }

    var impAlertHistoryStyled = false;
    function impAlertHistoryStyles() {
        if (impAlertHistoryStyled) return;
        impAlertHistoryStyled = true;
        GM_addStyle(
            '#ImperatorAlertHistory{position:fixed;left:70px;top:120px;z-index:130000;width:400px;max-height:70vh;' +
            'display:flex;flex-direction:column;background:#FCF5E1;border:1.5px solid #8A6D39;border-radius:8px;' +
            'box-shadow:0 4px 14px rgba(90,62,27,.28);color:#5A3E1B;font:12px Arial,sans-serif}' +
            '#ImperatorAlertHistory .imp_ah_head{display:flex;justify-content:space-between;align-items:center;' +
            'padding:8px 12px;background:#E4C88D;border-radius:6px 6px 0 0;font-weight:bold;font-size:13px}' +
            '#ImperatorAlertHistory .imp_ah_close{cursor:pointer;font-size:18px;line-height:14px;color:#5A3E1B}' +
            '#ImperatorAlertHistory ul{margin:0;padding:0;list-style:none;overflow-y:auto}' +
            '#ImperatorAlertHistory li{padding:6px 12px;border-bottom:1px solid #E8D8B0}' +
            '#ImperatorAlertHistory .imp_ah_time{color:#8A6D39;margin-right:8px;font-size:11px}' +
            '#ImperatorAlertHistory .imp_ah_unread .imp_ah_title,#ImperatorAlertHistory .imp_ah_unread .imp_ah_text{font-weight:bold}' +
            '#ImperatorAlertHistory .imp_ah_notshown{margin-left:6px;color:#B03A2E;cursor:help}' +
            '#ImperatorAlertHistory .imp_ah_text{margin-top:2px}' +
            '#ImperatorAlertHistory .imp_ah_empty{padding:16px 12px;font-style:italic}' +
            '#ImperatorAlertHistory .imp_ah_foot{padding:8px 12px;text-align:right}' +
            '#leftMenu .imp_ah_bell{background:none !important;font-size:24px;line-height:42px;text-align:center;position:relative}' +
            '#leftMenu .imp_ah_badge{position:absolute;top:2px;right:2px;min-width:16px;height:16px;padding:0 3px;' +
            'border-radius:8px;background:#C0392B;color:#fff;font:bold 10px/16px Arial,sans-serif;text-align:center}');
    }

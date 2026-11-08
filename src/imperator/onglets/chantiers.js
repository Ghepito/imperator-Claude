        function makeChantiersTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function renderLines(lines){
                var cells = lines.map(function(l){
                    var ecart = l.deficit>0 ? '<div class="imp-ch-def gr">-'+__impFmt(l.deficit)+'</div>'
                                            : '<div class="imp-ch-okmark gr">\u2713</div>';
                    var incCell = (l.incoming>0) ? '<div class="gc gr imp-ch-inc">+'+__impFmt(l.incoming)+'</div>'
                                                 : '<div class="gc gr gm">\u2014</div>';
                    return '<div class="gc">'+__impEsc(l.label)+'</div>'+
                           '<div class="gc gr">'+__impFmt(l.need)+'</div>'+
                           '<div class="gc gr gm">'+__impFmt(l.stock)+'</div>'+
                           incCell + ecart;
                }).join('');
                return '<div class="imp-ch-grid imp-ch-grid5">'+
                       '<div class="gh">Ressource</div><div class="gh gr">Besoin</div><div class="gh gr">Stock</div><div class="gh gr">En route</div><div class="gh gr">\u00c9cart</div>'+
                       cells + '</div>';
            }

            function renderRoutage(r, b){
                var R = IkaTools.Constants.Resources;
                var order=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR], labels={};
                labels[R.WOOD]='Bois'; labels[R.WINE]='Vin'; labels[R.MARBLE]='Marbre'; labels[R.GLASS]='Cristal'; labels[R.SULFUR]='Soufre';
                var incByRes=(b && b.incomingByRes)?b.incomingByRes:{};
                var html='<div class="imp-ch-rt"><div class="imp-ch-rt-h">ROUTAGE</div>', shown=false;
                order.forEach(function(key){
                    var sent=incByRes[key]||[], todo=r.byResource[key];
                    if (!sent.length && !todo) return;
                    shown=true;
                    var head='<span class="r">'+__impEsc(labels[key])+'</span>';
                    if (todo){
                        var loaded=todo.envois.reduce(function(s,e){return s+e.quantity;},0);
                        head+=' \u00b7 reste '+__impFmt(todo.deficit)+(loaded?(' \u2192 '+__impFmt(loaded)+' charg\u00e9s'):'');
                    } else { head+=' \u00b7 <span class="imp-ch-sent">tout envoy\u00e9</span>'; }
                    html+='<div class="imp-ch-rt-res">'+head+'</div>';
                    sent.forEach(function(e){
                        var arrTxt=''; try{ if(e.arrival!=null){ var m=Math.max(0,Math.round((e.arrival-IkaTools.View.gameTimeNow())/60000)); arrTxt=' \u00b7 arrive dans '+__impFmtDur(m); } }catch(x){}
                        html+='<div class="imp-ch-rt-env imp-ch-sent-line"><span class="imp-ch-sent">\u2713 envoy\u00e9</span> <span class="q">'+__impFmt(e.qty)+'</span> depuis '+__impEsc(e.fromName)+'<span class="meta">'+arrTxt+'</span></div>';
                    });
                    if (todo){
                        todo.envois.forEach(function(e){
                            var distTxt=(e._dist<0.5)?'m\u00eame \u00eele':(Math.round(e._dist*10)/10+' \u00eeles');
                            var src=__impFindCity(e.fromCityId), active=false;
                            try{ active=src && IkaTools.View.isActiveCity(src); }catch(x){}
                            var am=__impAge(src);
                            var ageMeta=(am!=null)?(' <span class="'+((am>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(am)+'</span>'):'';
                            var action=active
                              ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+e.fromCityId+'" data-to="'+e.toCityId+'" data-res="'+e.resource+'" data-qty="'+e.quantity+'" data-ships="'+e._shipsFast+'" data-fleet="fast">Pr\u00e9parer</a>'
                              : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+e.fromCityId+'">Aller \u00e0 '+__impEsc(e._fromName)+'</a>';
                            html+='<div class="imp-ch-rt-env">\u2192 <span class="q">'+__impFmt(e.quantity)+'</span> depuis '+__impEsc(e._fromName)+' <span class="meta">('+e._shipsFast+' nav., '+distTxt+')</span>'+ageMeta+' '+action+'</div>';
                        });
                        if (!todo.covered){
                            if (key===R.WINE && todo.envois.length===0) html+='<div class="imp-ch-rt-warn">Aucune ville de vin avec surplus disponible.</div>';
                            else html+='<div class="imp-ch-rt-warn">Surplus insuffisant pour couvrir le d\u00e9ficit.</div>';
                        }
                    }
                });
                html+='</div>';
                return shown?html:'';
            }

            function renderFlotte(fl){
                var h='<div class="imp-ch-fl"><div class="imp-ch-fl-h">FLOTTE &amp; MAKESPAN (estimation)</div>';
                fl.materials.forEach(function(m){
                    if (m.fleet==='mixte'){
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : mixte \u00b7 '+m.cargoShips+' charge + '+m.fast.totalShips+' rapides \u00b7 ~'+__impFmtDur(m.makespanMin)+
                           ' <span style="color:#3E7D2A">(gain '+__impFmtDur(m.gain)+' vs rapide seul)</span></div>';
                    } else {
                        h+='<div class="imp-ch-fl-line"><b>'+__impEsc(m.label)+'</b> : rapide \u00b7 '+m.fast.totalShips+' nav.'+
                           (m.fast.fits?'':' <span class="imp-ch-fl-warn">('+m.fast.rotations+' rotations)</span>')+' \u00b7 ~'+__impFmtDur(m.makespanMin)+'</div>';
                    }
                    if (!m.covered) h+='<div class="imp-ch-fl-src imp-ch-fl-warn">surplus insuffisant (navires pleins) pour couvrir enti\u00e8rement</div>';
                });
                h+='<div class="imp-ch-fl-line imp-ch-fl-ms">Makespan du chantier : ~'+__impFmtDur(fl.chantierMakespanMin)+' <span style="opacity:.6;font-weight:400">(le plus long des flux \u00b7 trajet de base, hors r\u00e9ductions)</span></div>';
                h+='<div class="imp-ch-fl-line" style="opacity:.8">Flotte libre : '+fl.F+' rapides \u00b7 '+fl.C+' navires de charge</div>';
                h+='</div>';
                return h;
            }

            function renderRow(c){
                var __comp = __impCompletion(c);
                if (__comp.state==='building'){
                    var bb=__impComputeBilan(c);
                    var t=(bb && bb.ok && bb.name)?__impEsc(bb.name):('B\u00e2timent \u00b7 empl. '+__impEsc(c.position));
                    var ct=(bb && bb.ok && bb.cityName)?__impEsc(bb.cityName):('Cit\u00e9 '+__impEsc(c.cityId));
                    return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                             '<div class="imp-ch-t">'+t+'</div>'+
                             '<div class="imp-ch-c">'+ct+' \u00b7 niveau '+__comp.level+' \u2192 '+__comp.target+'</div>'+
                             '<div class="imp-ch-foot2"><span class="imp-ch-sent">Am\u00e9lioration lanc\u00e9e</span> \u2014 en construction. Le chantier se clora \u00e0 la fin des travaux.</div>'+
                           '</div><div class="imp-ch-side">'+
                             '<span class="imp-ch-badge imp-ch-badge-ok">En construction</span>'+
                             '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Archiver</a>'+
                           '</div></div>';
                }
                var b = __impComputeBilan(c);
                var title = (b && b.ok && b.name) ? __impEsc(b.name) : ('B\u00e2timent \u00b7 empl. ' + __impEsc(c.position));
                var lvlTxt = (b && b.ok) ? ('niveau '+b.currentLevel+' \u2192 '+b.targetLevel) : ('niveau vis\u00e9 '+__impEsc(c.level));
                var cityTxt = (b && b.ok && b.cityName) ? __impEsc(b.cityName) : ('Cit\u00e9 '+__impEsc(c.cityId));
                var ageM = (b && b.ok) ? b.ageMin : null;
                var ageTxt = (ageM!=null) ? (' \u00b7 <span class="'+((ageM>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">donn\u00e9es '+__impAgeTxt(ageM)+'</span>') : '';
                var sub = cityTxt + ' \u00b7 ' + lvlTxt + ageTxt;
                var badge, breakdown='', footer, routage='';
                var hasIncoming=false;
                if (b && b.ok && b.incomingByRes){ for (var _k in b.incomingByRes){ if (b.incomingByRes[_k] && b.incomingByRes[_k].length){ hasIncoming=true; break; } } }

                if (b.error){
                    badge='<span class="imp-ch-badge imp-ch-badge-err">donn\u00e9es indispo.</span>';
                    footer='<div class="imp-ch-foot2">Lecture impossible ('+__impEsc(b.error)+') \u2014 rouvre l\u2019aper\u00e7u depuis Buildings.</div>';
                } else if (b.total===0 && !hasIncoming){
                    badge='<span class="imp-ch-badge imp-ch-badge-ok">Couvert localement</span>';
                    breakdown=renderLines(b.lines);
                    footer='<div class="imp-ch-foot2">Tout est en stock \u2014 pr\u00eat \u00e0 construire.'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                } else {
                    breakdown=renderLines(b.lines);
                    var r = __impComputeRoutage(c, b);
                    if (b.total>0){
                        badge='<span class="imp-ch-badge">D\u00e9ficit '+__impFmt(b.total)+'</span>';
                        routage = renderRoutage(r, b) + renderFlotte(__impComputeFlotte(c, b));
                        footer='<div class="imp-ch-foot2">Reste \u00e0 envoyer : '+__impFmt(b.total)+' unit\u00e9s'+(b.estimation?' <span style="opacity:.7">(co\u00fbt estim\u00e9)</span>':'')+'</div>';
                    } else {
                        badge='<span class="imp-ch-badge imp-ch-badge-ok">Tout envoy\u00e9</span>';
                        routage = renderRoutage(r, b);
                        footer='<div class="imp-ch-foot2">Tout est parti \u2014 en attente d\u2019arriv\u00e9e.</div>';
                    }
                }
                return '<div class="imp-ch-row"><div class="imp-ch-main">'+
                         '<div class="imp-ch-t">'+title+'</div><div class="imp-ch-c">'+sub+'</div>'+
                         breakdown + routage + footer +
                       '</div><div class="imp-ch-side">'+badge+
                         '<a class="imperator_link imp-ch-del" href="javascript:void(0)" data-id="'+__impEsc(c.id)+'">Retirer</a>'+
                       '</div></div>';
            }

            function makeTableContent(){
                var list = window.ImperatorChantiers || [];
                (function(){ var kept=[], pruned=false; list.forEach(function(c){ if(__impCompletion(c).state==='done') pruned=true; else kept.push(c); }); if(pruned){ window.ImperatorChantiers=kept; if(window.__impSaveChantiers) window.__impSaveChantiers(); list=kept; } })();
                var header = '<div class="imp-ch-head">Chantiers <span class="imp-ch-count">'+list.length+'</span>'+
                             '<span class="imp-ch-refresh-wrap"><span class="imp-ch-fresh">ressources rafra\u00eechies \u00e0 chaque visite de ville \u00b7 fra\u00eecheur indiqu\u00e9e par source</span></span></div>';
                var body;
                if (!list.length){
                    body='<div class="imp-ch-empty">Aucun chantier.<br>Survole un b\u00e2timent dans l\u2019onglet <b>Buildings</b> et clique <b>Planifier</b>.</div>';
                } else {
                    body='<div class="imp-ch-list">'+list.map(renderRow).join('')+'</div>'+
                         '<div class="imp-ch-foot">Moteur + ex\u00e9cution (2 temps) \u00b7 le clic pr\u00e9-remplit le transport, l\u2019envoi reste manuel.</div>';
                }
                return '<tbody><tr><td><div class="imp-ch-wrap">'+header+__impProtectedPanel()+body+'</div></td></tr></tbody>';
            }

            var tab = new Tab('chantiers', 'Chantiers', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewChantiersTable"/>' +
                '</div>'),
                'ImperatorOverviewChantiersTable',
                function(){ window.__impChantiersRedraw = function(){ tab.maybeRedraw(true); }; },
                makeTableContent);

            return tab.getTab();
        }

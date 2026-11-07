        /* ===== IMPERATOR — Service de boissons (vin) ===== */
        var __IMP_WINE_TARGET = 100000, __IMP_WINE_SRC_FLOOR = 50000;
        window.__impSaveWineTrigger = function(){ try{ GM_setValue('imperator_wine_trigger', String(window.ImperatorWineTrigger)); }catch(e){} };
        window.__impLoadWineTrigger = function(){ var v=85000; try{ v=parseInt(GM_getValue('imperator_wine_trigger','85000'),10); if(isNaN(v)) v=85000; }catch(e){} window.ImperatorWineTrigger=Math.max(0,Math.min(v,__IMP_WINE_TARGET)); };
        window.__impLoadWineTrigger();
        function __impWineTrigger(){ var v=window.ImperatorWineTrigger; return (typeof v==='number' && !isNaN(v))?v:85000; }

        function __impWineGroups(){
            var R=IkaTools.Constants.Resources, cities=[];
            try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            var groups=[], others=[];
            cities.forEach(function(c){
                var isWine=false; try{ isWine=(c.getTradeGoodType && c.getTradeGoodType()===R.WINE); }catch(e){}
                if (isWine) groups.push({source:c, members:[]}); else others.push(c);
            });
            if (!groups.length) return [];
            others.forEach(function(c){
                var best=null, bd=Infinity, cc=null; try{ cc=c.getIslandCoordinates(); }catch(e){}
                groups.forEach(function(g){ var d=__impDist(cc, g.source.getIslandCoordinates()); if(d<bd){ bd=d; best=g; } });
                if (best) best.members.push(c);
            });
            return groups;
        }

        function __impWinePlan(g){
            var R=IkaTools.Constants.Resources, CAP=__IMP_CAP_FAST;
            var srcWine=0; try{ var rr=g.source.getResource(R.WINE); srcWine=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; }catch(e){}
            var availShips=Math.max(0, Math.floor((srcWine-__IMP_WINE_SRC_FLOOR)/CAP));
            var TRIGGER=__impWineTrigger();
            var rows=g.members.map(function(c){
                var wine=0; try{ var r=c.getResource(R.WINE); wine=(r&&r.getCurrent)?Math.floor(r.getCurrent()):0; }catch(e){}
                var needs=(wine<TRIGGER);
                return { city:c, wine:wine, needs:needs, deficit:needs?Math.max(0,__IMP_WINE_TARGET-wine):0, envoiQty:0, envoiShips:0, shortfall:false };
            });
            rows.filter(function(x){return x.needs && x.deficit>0;})
                .sort(function(a,b){return b.deficit-a.deficit;})
                .forEach(function(x){
                    var need=Math.ceil(x.deficit/CAP), take=Math.min(need, availShips);
                    if (take>0){ x.envoiShips=take; x.envoiQty=take*CAP; availShips-=take; }
                    x.shortfall=(take<need);
                });
            return { source:g.source, srcWine:srcWine, distributable:Math.max(0,srcWine-__IMP_WINE_SRC_FLOOR), rows:rows };
        }

        function makeBoissonsTab(){
            __impInjectChantiersCSS();
            __impInitChantiersDelegation();
            __impInitTransportReopen();

            function memberRow(g, x){
                var name=(x.city.getName?x.city.getName():String(x.city.getId()));
                var age=__impAge(x.city);
                var ageTxt=(age!=null)?(' <span class="'+((age>__IMP_STALE_MIN)?'imp-ch-stale':'imp-ch-age')+'">\u00b7 '+__impAgeTxt(age)+'</span>'):'';
                if (x.wine>=__IMP_WINE_TARGET){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-sent">\u2713 \u00e0 niveau</span>'+ageTxt+'</div>';
                }
                if (!x.needs){
                    return '<div class="imp-boisson-mrow"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-age">au-dessus du seuil</span>'+ageTxt+'</div>';
                }
                var src=g.source, srcName=(src.getName?src.getName():String(src.getId())), active=false;
                try{ active=IkaTools.View.isActiveCity(src); }catch(e){}
                var action='';
                if (x.envoiShips>0){
                    action = active
                      ? '<a class="imperator_link imp-ch-prep" href="javascript:void(0)" data-from="'+src.getId()+'" data-to="'+x.city.getId()+'" data-res="wine" data-qty="'+x.envoiQty+'" data-ships="'+x.envoiShips+'" data-fleet="fast" data-reopen="boissons">Pr\u00e9parer</a>'
                      : '<a class="imperator_link imp-ch-goto" href="javascript:void(0)" data-from="'+src.getId()+'" data-reopen="boissons">Aller \u00e0 '+__impEsc(srcName)+'</a>';
                }
                var envoiTxt = (x.envoiShips>0)
                    ? ('<span class="benv">\u2192 '+__impFmt(x.envoiQty)+' ('+x.envoiShips+' nav.)'+(x.shortfall?' <span class="imp-ch-rt-warn">partiel</span>':'')+'</span>')
                    : '<span class="imp-ch-rt-warn">source insuffisante (plancher 50 000)</span>';
                return '<div class="imp-boisson-mrow def"><span class="bnm">'+__impEsc(name)+'</span><span class="blvl">'+__impFmt(x.wine)+' vin</span><span class="imp-ch-def">d\u00e9ficit '+__impFmt(x.deficit)+'</span>'+envoiTxt+ageTxt+' '+action+'</div>';
            }

            function renderGroup(g){
                var plan=__impWinePlan(g);
                var srcName=(g.source.getName?g.source.getName():String(g.source.getId()));
                var nbDef=plan.rows.filter(function(x){return x.deficit>0;}).length;
                return '<div class="imp-boisson-group">'+
                         '<div class="imp-ch-t">Groupe \u00b7 '+__impEsc(srcName)+'</div>'+
                         '<div class="imp-ch-c">'+__impEsc(srcName)+' : '+__impFmt(plan.srcWine)+' vin \u00b7 distribuable '+__impFmt(plan.distributable)+' \u00b7 '+(nbDef?(nbDef+' \u00e0 ravitailler'):'tout \u00e0 niveau')+'</div>'+
                         '<div class="imp-boisson-members">'+plan.rows.map(function(x){return memberRow(g,x);}).join('')+'</div>'+
                       '</div>';
            }

            function makeContent(){
                var groups=__impWineGroups();
                var body = groups.length ? groups.map(renderGroup).join('')
                    : '<div class="imp-ch-empty">Aucune ville productrice de vin d\u00e9tect\u00e9e.</div>';
                return '<tbody><tr><td><div class="imp-ch-wrap">'+
                       '<div class="imp-ch-head">Service de boissons'+
                         '<span class="imp-boisson-cfg">Seuil de r\u00e9appro : <input type="number" class="imp-boisson-trigger" value="'+__impWineTrigger()+'" min="0" max="'+__IMP_WINE_TARGET+'" step="1000"> vin <span class="imp-ch-age">(r\u00e9appro si en-dessous \u00b7 remplissage \u00e0 '+__impFmt(__IMP_WINE_TARGET)+')</span></span>'+
                       '</div>'+
                       body+
                       '<div class="imp-ch-foot">Cible '+__impFmt(__IMP_WINE_TARGET)+' vin/ville \u00b7 les sources gardent '+__impFmt(__IMP_WINE_SRC_FLOOR)+' \u00b7 navires pleins (580). Une visite \u00e0 la ville de vin = tu prépares tous ses envois d\u2019affilée.</div>'+
                       '</div></td></tr></tbody>';
            }

            var tab = new Tab('boissons', 'Service de boissons', $(
                '<div class="imperator_overview">' +
                '<table class="overview" id="ImperatorOverviewBoissonsTable"/>' +
                '</div>'),
                'ImperatorOverviewBoissonsTable',
                function(){
                    window.__impBoissonsRedraw = function(){ tab.maybeRedraw(true); };
                    try{ IkaTools.EmpireData.registerResourcesChangedHandler(function(){
                        var ae=document.activeElement;
                        if (ae && ae.classList && ae.classList.contains('imp-boisson-trigger')) return; // pas de redraw pendant l'\u00e9dition du seuil
                        tab.maybeRedraw(true);
                    }); }catch(e){}
                },
                makeContent);
            return tab.getTab();
        }

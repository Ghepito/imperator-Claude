        // v2.41 : outils communs aux onglets Chantiers et Boissons (calculs de transport, envois,
        // préférences, réouverture après un transport), sortis de chantiers.js et boissons.js.

        var openResourcesTabOnTransportClose = false;
        var openBuildingsTabOnTransportClose = false;
        var openMilitaryTabOnDeploymentClose = false;

        //////////////////
        // Patch BLOC 1 //
        //////////////////

             /* ===== IMPERATOR — Onglet Chantiers (natif) ===== */
        var __IMP_CAP_FAST = 580; // capacité navire marchand (unité de la couche 2)

        function __impEsc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
        function __impFmt(n){ try { return IkaTools.Intl.formatInteger(Math.round(n)); } catch(e){ return String(Math.round(n)); } }

        /* ---- Persistance (survit aux rechargements de page) -------------- */
        window.__impSaveChantiers = function(){
            try{ GM_setValue('imperator_chantiers', JSON.stringify(window.ImperatorChantiers||[])); }catch(e){}
        };
        window.__impLoadChantiers = function(){
            try{ var raw=GM_getValue('imperator_chantiers','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorChantiers=a; }catch(e){}
            if(!window.ImperatorChantiers || window.ImperatorChantiers.length===undefined) window.ImperatorChantiers=[];
        };
        window.__impLoadChantiers();

        /* ---- Villes protégées : on ne puise jamais dans leurs ressources ---- */
        window.__impSaveProtected = function(){
            try{ GM_setValue('imperator_protected', JSON.stringify(window.ImperatorProtected||[])); }catch(e){}
        };
        window.__impLoadProtected = function(){
            try{ var raw=GM_getValue('imperator_protected','[]'); var a=JSON.parse(raw); if(a && a.length!==undefined) window.ImperatorProtected=a; }catch(e){}
            if(!window.ImperatorProtected || window.ImperatorProtected.length===undefined) window.ImperatorProtected=[];
        };
        window.__impLoadProtected();
        function __impIsProtected(cityId){
            var arr=window.ImperatorProtected; if(!arr || !arr.length) return false;
            var id=String(cityId);
            for (var i=0;i<arr.length;i++){ if(String(arr[i])===id) return true; }
            return false;
        }
        /* Réouverture auto de l'onglet Chantiers après un "Aller à" (qui recharge la page). */
        try{
            var __rt = GM_getValue('imperator_reopen_tab','');
            if (__rt){
                GM_setValue('imperator_reopen_tab','');
                setTimeout(function(){ try{ impPopup(); if(__rt==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){} }, 700);
            }
        }catch(e){}

        function __impFindCity(cityId){
            try{
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){ if (String(cities[i].getId())===String(cityId)) return cities[i]; }
            }catch(e){}
            return null;
        }
        function __impDist(a,b){
            if(!a||!b) return Infinity;
            var dx=Number(a[0])-Number(b[0]), dy=Number(a[1])-Number(b[1]);
            return Math.sqrt(dx*dx+dy*dy); // 0 = même île
        }
        function __impSurplus(city, resKey){
            var R = IkaTools.Constants.Resources, stock = 0;
            try{ if (city && __impIsProtected(city.getId())) return 0; }catch(e){} // ville protégée -> pas de surplus
            try { var rr = city.getResource(resKey); stock = (rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){ return 0; }
            if (resKey === R.WINE){
                var isWine=false;
                try { isWine = (city.getTradeGoodType && city.getTradeGoodType()===R.WINE); } catch(e){}
                if (!isWine) return 0;
                return Math.max(0, stock - 100000);
            }
            return Math.max(0, stock);
        }

        /* ---- Contrat d'ENVOI (figé) --------------------------------------- */
        function __impMakeEnvoi(f){
            f = f || {};
            return {
                id:         f.id || ((f.chantierId||'?')+'_'+(f.fromCityId||'?')+'_'+(f.resource||'?')),
                chantierId: f.chantierId, fromCityId: f.fromCityId, toCityId: f.toCityId,
                resource:   f.resource, quantity: f.quantity || 0,
                fleet:      f.fleet || null, ships: (f.ships!=null?f.ships:null),
                etaMinutes: (f.etaMinutes!=null?f.etaMinutes:null),
                status:     f.status || 'planned'
            };
        }
        window.ImperatorMakeEnvoi = __impMakeEnvoi;

        /* ---- Couche 1 : BILAN --------------------------------------------- */
        /* ---- Rapprochement : transports r\u00e9els en route vers une ville ---- */
        function __impIncoming(cityId){
            var R=IkaTools.Constants.Resources, keys=[R.WOOD,R.WINE,R.MARBLE,R.GLASS,R.SULFUR];
            var res={}, byRes={}, soonest=null; keys.forEach(function(k){res[k]=0; byRes[k]=[];});
            try{
                var civ=IkaTools.EmpireData.getCivilizationData();
                var movs=civ?civ.getMovements():[];
                (movs||[]).forEach(function(mv){
                    try{
                        if (!mv || !mv.getMission) return;
                        if (mv.getMission()!==IkaTools.Constants.Movements.Mission.TRANSPORT) return;
                        if (String(mv.getTargetCityId())!==String(cityId)) return;
                        var a=mv.getArrivalTime?mv.getArrivalTime():null;
                        if (a!=null && (soonest==null||a<soonest)) soonest=a;
                        var fromId=mv.getOriginCityId?mv.getOriginCityId():null, fromName='';
                        try{ var fc=__impFindCity(fromId); fromName=(fc&&fc.getName)?fc.getName():(fromId?('ville '+fromId):'?'); }catch(e){}
                        keys.forEach(function(k){
                            var q=mv.getResource?(mv.getResource(k)||0):0;
                            if (q>0){ res[k]+=q; byRes[k].push({ fromId:fromId, fromName:fromName, qty:q, arrival:a }); }
                        });
                    }catch(e){}
                });
            }catch(e){}
            return { res:res, byRes:byRes, soonest:soonest };
        }
        /* ---- Clôture : niveau cible + état d'avancement du chantier ---- */
        function __impTargetLevel(levelText){
            var s=String(levelText||''), i=s.indexOf('\u00bb');
            if (i>-1){ var a=parseInt(s.slice(i+1),10); if(!isNaN(a)) return a; }
            var n=parseInt(s,10); return isNaN(n)?0:n+1;
        }
        function __impCompletion(c){
            try{
                var city=__impFindCity(c.cityId);
                if (!city || !city.getBuildingByPosition) return {state:null};
                var b=city.getBuildingByPosition(parseInt(c.position,10));
                if (!b) return {state:null};
                var target=__impTargetLevel(c.level), lvl=0;
                try{ lvl=b.getLevel(); }catch(e){}
                if (target>0 && lvl>=target) return {state:'done', target:target, level:lvl};           // niveau atteint
                if (b.isUpgrading && b.isUpgrading() && (lvl+1)>=target) return {state:'building', target:target, level:lvl}; // lancé
                return {state:null, target:target, level:lvl};
            }catch(e){ return {state:null}; }
        }
        function __impComputeBilan(ch){
            try{
                var city = __impFindCity(ch.cityId);
                if (!city) return { error:'ville introuvable' };
                var building = city.getBuildingByPosition ? city.getBuildingByPosition(ch.position) : null;
                if (!building) return { error:'b\u00e2timent introuvable' };
                var costs = building.getUpgradeCosts();
                var R = IkaTools.Constants.Resources;
                var defs = [[R.WOOD,'Bois'],[R.WINE,'Vin'],[R.MARBLE,'Marbre'],[R.GLASS,'Cristal'],[R.SULFUR,'Soufre']];
                var inc = __impIncoming(ch.cityId);
                var lines=[], total=0;
                defs.forEach(function(d){
                    var key=d[0], need=Math.ceil(costs[key]||0);
                    if (need<=0) return;
                    var stock=0;
                    try { var rr=city.getResource(key); stock=(rr&&rr.getCurrent)?Math.floor(rr.getCurrent()):0; } catch(e){}
                    var incoming=Math.floor((inc.res[key])||0);
                    var deficit=Math.max(0, need-stock-incoming);
                    total+=deficit;
                    lines.push({ key:key, label:d[1], need:need, stock:stock, incoming:incoming, deficit:deficit });
                });
                var name=''; try { name = localizer.localize('buildings', building.getType()) || ''; } catch(e){}
                var curLvl=0; try { curLvl = building.getLevel(); } catch(e){}
                return { ok:true, estimation:!costs._real, name:name, lines:lines, total:total,
                         currentLevel:curLvl, targetLevel:curLvl+1, ageMin:__impAge(city),
                         incomingSoonest: inc.soonest, incomingByRes: inc.byRes, cityName:(city.getName?city.getName():'') };
            } catch(err){ return { error:'exception', detail:String(err) }; }
        }

        /* ---- Couche 2 : ROUTAGE ------------------------------------------- */
        function __impComputeRoutage(ch, bilan){
            var CAP = __IMP_CAP_FAST;
            var target = __impFindCity(ch.cityId);
            var targetCoords = target ? target.getIslandCoordinates() : null;

            var sources = [];
            try {
                var cities = IkaTools.EmpireData.getOwnCities();
                for (var i=0;i<cities.length;i++){
                    var cc = cities[i];
                    if (String(cc.getId())===String(ch.cityId)) continue; // pas soi-même
                    sources.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(), targetCoords) });
                }
                sources.sort(function(a,b){ return a.dist - b.dist; });
            } catch(e){}

            var result = { byResource:{}, allEnvois:[] };
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var resKey=l.key, D=l.deficit;
                var remainingShips = Math.ceil(D / CAP);
                var envois=[];
                for (var i=0;i<sources.length && remainingShips>0;i++){
                    var s=sources[i];
                    var surplus=__impSurplus(s.city, resKey);
                    var availShips=Math.floor(surplus / CAP);
                    if (availShips<=0) continue;               // pas de quoi remplir un navire
                    var takeShips=Math.min(availShips, remainingShips);
                    var env=__impMakeEnvoi({
                        chantierId:ch.id, fromCityId:s.city.getId(), toCityId:ch.cityId,
                        resource:resKey, quantity:takeShips*CAP
                    });
                    env._shipsFast=takeShips;
                    env._fromName=(s.city.getName?s.city.getName():String(s.city.getId()));
                    env._dist=s.dist;
                    envois.push(env); result.allEnvois.push(env);
                    remainingShips-=takeShips;
                }
                result.byResource[resKey] = { label:l.label, deficit:D, envois:envois,
                                              covered:(remainingShips<=0), missingShips:remainingShips };
            });
            return result;
        }

        var __IMP_CAP_CARGO = 50000, __IMP_SPEED_FAST = 75, __IMP_SPEED_CARGO = 4;
        function __impFreeShips(sel){
            try { var t=$(sel).first().text(); var n=parseInt(String(t).replace(/[^0-9]/g,''),10); return isNaN(n)?0:n; } catch(e){ return 0; }
        }
        function __impFmtDur(min){
            if (min==null || !isFinite(min)) return '?';
            min=Math.round(min);
            if (min<1) return '<1 min';
            if (min<60) return min+' min';
            if (min<1440){ var h=Math.floor(min/60),m=min%60; return h+'h'+(m?(' '+(m<10?'0':'')+m):''); }
            var j=Math.floor(min/1440), hh=Math.round((min%1440)/60); return j+'j '+hh+'h';
        }

        /* ---- Couche 3b : FLOTTE + MAKESPAN + ARBITRAGE (estimation) ------- */
        // Makespan d'une livraison FAST d'une quantité q d'une ressource (navires pleins).
        function __impFastMakespan(target, targetCoords, resKey, q, F){
            var CAP=__IMP_CAP_FAST;
            if (q<=0) return { makespanMin:0, totalShips:0, fits:true, rotations:0, srcs:[], covered:true };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey); if (sp<CAP) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), surplus:sp });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var remShips=Math.ceil(q/CAP), total=0, used=[];
            for (var i=0;i<src.length && remShips>0;i++){
                var o=src[i], av=Math.floor(o.surplus/CAP); if (av<=0) continue;
                var take=Math.min(av,remShips), qty=take*CAP;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=tms/60000;
                used.push({ name:(o.city.getName?o.city.getName():''), ships:take, qty:qty, loadMin:loadMin, travelMin:travelMin, dist:o.dist });
                total+=take; remShips-=take;
            }
            var fits=total<=F, rot=fits?1:Math.ceil(total/Math.max(1,F)), maxArr=0, maxCyc=0;
            used.forEach(function(u){ var a=u.loadMin+u.travelMin, c=u.loadMin+2*u.travelMin; if(a>maxArr)maxArr=a; if(c>maxCyc)maxCyc=c; });
            return { makespanMin:(fits?maxArr:rot*maxCyc), totalShips:total, fits:fits, rotations:rot, srcs:used, covered:(remShips<=0) };
        }
        // Makespan d'une livraison CARGO de k navires (pleins) depuis les sources cargo-eligibles.
        function __impCargoMakespan(target, targetCoords, resKey, k){
            var CAPc=__IMP_CAP_CARGO, RATIO=__IMP_SPEED_FAST/__IMP_SPEED_CARGO;
            if (k<=0) return { makespanMin:0, ok:true, load:0, srcs:[] };
            var src=[]; var cities=IkaTools.EmpireData.getOwnCities();
            for (var i=0;i<cities.length;i++){
                var cc=cities[i]; if (String(cc.getId())===String(target.getId())) continue;
                var sp=__impSurplus(cc,resKey), ca=Math.floor(sp/CAPc); if (ca<=0) continue;
                src.push({ city:cc, dist:__impDist(cc.getIslandCoordinates(),targetCoords), ca:ca });
            }
            src.sort(function(a,b){return a.dist-b.dist;});
            var rem=k, used=[], maxArr=0;
            for (var i=0;i<src.length && rem>0;i++){
                var o=src[i], take=Math.min(o.ca,rem), qty=take*CAPc;
                var ls=0; try{ls=o.city.getLoadingSpeed();}catch(x){}
                var tms=0; try{tms=IkaTools.EmpireData.calculateTravelTime(o.city.getIslandCoordinates(),targetCoords,null,true);}catch(x){}
                var loadMin=(ls>0)?((qty/ls)/60):0, travelMin=(tms/60000)*RATIO, arr=loadMin+travelMin;
                used.push({ name:(o.city.getName?o.city.getName():''), ca:take, qty:qty, dist:o.dist });
                if (arr>maxArr) maxArr=arr; rem-=take;
            }
            return { makespanMin:maxArr, ok:(rem<=0), load:(k-rem)*CAPc, srcs:used };
        }
        // Arbitrage rapide vs mixte pour une matière.
        function __impArbitrage(ch, target, targetCoords, resKey, label, deficit, F, C){
            var CAPf=__IMP_CAP_FAST, CAPc=__IMP_CAP_CARGO;
            var L=Math.ceil(deficit/CAPf)*CAPf;
            var fast=__impFastMakespan(target,targetCoords,resKey,L,F);
            var best={ fleet:'rapide', makespanMin:fast.makespanMin, fast:fast, cargo:null, cargoShips:0, gain:0,
                       label:label, deficit:deficit, loaded:L, fastOnlyMS:fast.makespanMin, covered:fast.covered };
            var maxK=Math.min(C, Math.ceil(L/CAPc));
            for (var k=1;k<=maxK;k++){
                var cargo=__impCargoMakespan(target,targetCoords,resKey,k);
                if (!cargo.ok || cargo.load<=0) break;      // plus assez de surplus cargo-eligible
                var remaining=Math.max(0, L-cargo.load);
                var fastRem=__impFastMakespan(target,targetCoords,resKey,remaining,F);
                var mixedMS=Math.max(cargo.makespanMin, fastRem.makespanMin);
                if (mixedMS < best.makespanMin-0.01){
                    best={ fleet:'mixte', makespanMin:mixedMS, fast:fastRem, cargo:cargo, cargoShips:k,
                           gain:(fast.makespanMin-mixedMS), label:label, deficit:deficit, loaded:L,
                           fastOnlyMS:fast.makespanMin, covered:fast.covered };
                }
            }
            return best;
        }

        function __impComputeFlotte(ch, bilan){
            var F=__impFreeShips('#js_GlobalMenu_freeTransporters');
            var C=__impFreeShips('#js_GlobalMenu_freeFreighters');
            var target=__impFindCity(ch.cityId);
            var targetCoords=target?target.getIslandCoordinates():null;
            var materials=[], chMakespan=0;
            (bilan.lines||[]).forEach(function(l){
                if (l.deficit<=0) return;
                var arb=__impArbitrage(ch,target,targetCoords,l.key,l.label,l.deficit,F,C);
                materials.push(arb);
                if (arb.makespanMin>chMakespan) chMakespan=arb.makespanMin;
            });
            return { F:F, C:C, materials:materials, chantierMakespanMin:chMakespan };
        }
        /* ---- Brique : passage à l'exécution (pré-remplissage, 2 temps) --- */
        function __impFireEvents(el){
            ['input','change','keyup','blur'].forEach(function(t){ try{ el.dispatchEvent(new Event(t,{bubbles:true})); }catch(e){} });
        }
        function __impFillTransport(p){
            try{
                var q=document.getElementById('textfield_'+p.res);
                if (q){ q.value=p.qty; __impFireEvents(q); }
                var sid=(p.fleet==='cargo')?'selectedFreightersInput':'selectedTransportersInput';
                var sh=document.getElementById(sid);
                if (sh){ sh.value=p.ships; __impFireEvents(sh); }
            }catch(e){}
        }
        function __impStartPrefillWatch(){
            var tries=0;
            var iv=setInterval(function(){
                tries++;
                var p=window.__impPendingPrefill;
                if (!p){ clearInterval(iv); return; }
                if (document.getElementById('textfield_'+p.res) && document.getElementById('submit')){
                    __impFillTransport(p); window.__impPendingPrefill=null; clearInterval(iv);
                } else if (tries>24){ clearInterval(iv); } // ~6 s puis abandon silencieux
            },250);
        }
        function __impPrepareEnvoi(env){
            var src=__impFindCity(env.from), ok=false;
            try{ ok = src && IkaTools.View.isActiveCity(src); }catch(e){}
            if (!ok) return; // sécurité absolue : un transport part de la ville active
            window.__impPendingPrefill={ res:env.res, qty:env.qty, fleet:env.fleet||'fast', ships:env.ships };
            window.__impReopenAfterTransport = env.reopen || 'chantiers'; // rouvrir le bon onglet quand le transport se ferme
            try{ impPopup().close(); }catch(e){}
            try{
                IkaTools.View.goToLocalView(IkaTools.Constants.View.TRANSPORT, {
                    templateView: IkaTools.Constants.View.CITY_DETAIL, destinationCityId: env.to
                });
            }catch(e){}
            __impStartPrefillWatch();
        }

        /* ---- Fra\u00eecheur des donn\u00e9es (aucune requ\u00eate) ---------------------
         * L'instantan\u00e9 d'une ville se rafra\u00eechit quand tu la visites (capture
         * opportuniste native). On rend juste l'\u00e2ge des donn\u00e9es visible. */
        var __IMP_STALE_MIN = 30;
        function __impAge(city){
            try{
                if (!city || !city.getLastResourceUpdate) return null;
                if (!city.getLastResourceUpdate()) return null; // jamais mis \u00e0 jour
                var ms = city.getTimeSinceResourceUpdate ? city.getTimeSinceResourceUpdate() : 0;
                return Math.max(0, Math.round(ms/60000));
            }catch(e){ return null; }
        }
        function __impAgeTxt(m){
            if (m==null) return '?';
            if (m<1) return '\u00e0 l\u2019instant';
            if (m<60) return 'il y a '+m+' min';
            var h=Math.floor(m/60); return 'il y a '+h+'h'+((m%60)?(' '+(m%60)+'min'):'');
        }

        function __impInjectChantiersCSS(){
            if (document.getElementById('imp-ch-css')) return;
            var css =
              '#ImperatorOverviewChantiersTable td{padding:0;border:none;background:none;}' +
              '.imp-ch-wrap{font-family:sans-serif;color:#5A3E1B;padding:10px;}' +
              '.imp-ch-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-items:start;}' +
              '.imp-ch-prot-wrap{margin-bottom:9px;padding-bottom:8px;border-bottom:1px solid #E4D3A5;}' +
              '.imp-ch-prot-h{font-size:10px;color:#8A6D39;margin-bottom:5px;}' +
              '.imp-ch-prot-list{display:flex;flex-wrap:wrap;gap:4px;}' +
              '.imp-ch-prot{font-size:11px;padding:2px 9px;border-radius:9px;border:1px solid #C6A85E;background:#F0E2C0;color:#8A6D39;text-decoration:none;}' +
              '.imp-ch-prot.on{background:#F3D0C0;border-color:#C97A54;color:#A34E1D;font-weight:600;}' +
              '#ImperatorOverviewBoissonsTable td{padding:0;border:none;background:none;}' +
              '.imp-boisson-group{border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;padding:10px 12px;margin-bottom:8px;}' +
              '.imp-boisson-members{display:flex;flex-direction:column;gap:3px;margin-top:6px;}' +
              '.imp-boisson-mrow{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;font-size:12px;color:#5A3E1B;}' +
              '.imp-boisson-mrow .bnm{font-weight:600;min-width:92px;} .imp-boisson-mrow .blvl{color:#8A6D39;font-variant-numeric:tabular-nums;min-width:80px;}' +
              '.imp-boisson-mrow.def{background:#FBEFD9;border-radius:4px;padding:2px 5px;}' +
              '.imp-boisson-cfg{font-size:11px;font-weight:400;color:#8A6D39;margin-left:10px;}' +
              '.imp-boisson-trigger{width:82px;font-size:11px;padding:1px 4px;border:1px solid #B4914E;border-radius:4px;background:#FCF5E1;color:#5A3E1B;}' +
              '.imp-ch-head{font-size:14px;font-weight:600;margin-bottom:9px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;}' +
              '.imp-ch-refresh-wrap{margin-left:auto;display:flex;align-items:center;gap:8px;font-weight:400;}' +
              '.imp-ch-refresh{font-size:11px;padding:3px 10px;border-radius:9px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;text-decoration:none;white-space:nowrap;cursor:pointer;}' +
              '.imp-ch-fresh{font-size:10px;color:#8A6D39;opacity:.85;}' +
              '.imp-ch-age{color:#8A6D39;opacity:.75;} .imp-ch-stale{color:#B5651D;font-weight:600;}' +
              '.imp-ch-count{background:#B98F45;color:#FBF4DE;border-radius:10px;font-size:11px;padding:1px 8px;margin-left:6px;}' +
              '.imp-ch-empty{font-size:12px;color:#8A6D39;text-align:center;padding:22px 10px;line-height:1.6;}' +
              '.imp-ch-row{display:flex;align-items:flex-start;gap:11px;padding:10px 12px;border:1px solid #E4D3A5;background:#FCF5E1;border-radius:6px;margin-bottom:6px;}' +
              '.imp-ch-main{flex:1;min-width:0;text-align:left;}' +
              '.imp-ch-t{font-size:13px;font-weight:600;} .imp-ch-c{font-size:11px;color:#8A6D39;margin-bottom:6px;}' +
              '.imp-ch-grid{display:grid;grid-template-columns:auto auto auto auto;column-gap:16px;row-gap:2px;width:max-content;margin:5px 0 7px;font-size:12px;}' +
              '.imp-ch-grid .gh{font-size:10px;font-weight:600;color:#8A6D39;padding-bottom:3px;border-bottom:1px solid #EADFBE;}' +
              '.imp-ch-grid .gc{color:#5A3E1B;} .imp-ch-grid .gr{text-align:right;font-variant-numeric:tabular-nums;} .imp-ch-grid .gm{color:#8A6D39;}' +
              '.imp-ch-grid5{grid-template-columns:auto auto auto auto auto;column-gap:14px;} .imp-ch-inc{color:#2E7D8E;font-weight:600;}' +
              '.imp-ch-enroute{font-size:11px;color:#2E7D8E;margin:4px 0 2px;padding:3px 8px;background:#E4F0F2;border-radius:5px;display:inline-block;}' +
              '.imp-ch-sent{color:#3E7D2A;font-weight:600;} .imp-ch-sent-line{background:#EAF3E0;border-radius:4px;}' +
              '.imp-ch-def{color:#B5651D;font-weight:600;font-variant-numeric:tabular-nums;} .imp-ch-okmark{color:#3E7D2A;font-weight:600;}' +
              '.imp-ch-rt{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-rt-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-rt-res{font-size:12px;margin:4px 0 1px;} .imp-ch-rt-res .r{font-weight:600;}' +
              '.imp-ch-rt-env{font-size:12px;color:#5A3E1B;margin-left:14px;display:flex;flex-wrap:wrap;align-items:baseline;gap:3px 6px;} .imp-ch-rt-env .q{font-weight:600;} .imp-ch-rt-env .meta{color:#8A6D39;}' +
              '.imp-ch-rt-warn{font-size:11px;color:#B5651D;margin-left:14px;}' +
              '.imp-ch-foot2{font-size:11px;color:#8A6D39;padding-top:6px;margin-top:6px;border-top:1px solid #EADFBE;}' +
              '.imp-ch-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;white-space:nowrap;}' +
              '.imp-ch-badge{font-size:11px;padding:3px 9px;border-radius:10px;background:#F0E2C0;color:#8A6D39;border:0.8px solid #C6A85E;}' +
              '.imp-ch-badge-ok{background:#DDE8C4;color:#3E7D2A;border-color:#8FB06A;} .imp-ch-badge-err{background:#F3D9C0;color:#A34E1D;border-color:#C98A5A;}' +
              '.imp-ch-del{font-size:11px;padding:5px 10px;border-radius:5px;border:1px solid #B4914E;background:#EFDEB2;color:#8A6D39;cursor:pointer;text-decoration:none;}' +
              '.imp-ch-prep,.imp-ch-goto{font-size:11px;margin-left:auto;padding:2px 8px;border-radius:9px;border:1px solid #B4914E;text-decoration:none;white-space:nowrap;flex:0 0 auto;}' +
              '.imp-ch-prep{background:#D8B871;color:#5A3E1B;font-weight:600;} .imp-ch-goto{background:#EFDEB2;color:#8A6D39;}' +
              '.imp-ch-fl{margin-top:8px;padding-top:7px;border-top:1px dashed #E4D3A5;}' +
              '.imp-ch-fl-h{font-size:10px;font-weight:700;color:#8A6D39;margin-bottom:5px;letter-spacing:.05em;}' +
              '.imp-ch-fl-line{font-size:12px;color:#5A3E1B;margin:2px 0;}' +
              '.imp-ch-fl-ms{font-weight:600;} .imp-ch-fl-warn{color:#B5651D;}' +
              '.imp-ch-fl-src{font-size:11px;color:#8A6D39;margin-left:14px;}' +
              '.imp-ch-foot{font-size:11px;color:#8A6D39;margin-top:8px;padding-top:8px;border-top:1px solid #E4D3A5;line-height:1.5;}';
            var st=document.createElement('style'); st.id='imp-ch-css'; st.textContent=css; document.head.appendChild(st);
        }

        function __impInitChantiersDelegation(){
            if (window.__impChantiersDelegationDone) return;
            window.__impChantiersDelegationDone = true;
            document.addEventListener('click', function(e){
                var t=e.target;
                var prot = t.closest && t.closest('.imp-ch-prot[data-protect]');
                if (prot){
                    e.preventDefault();
                    var pid=prot.getAttribute('data-protect'), arr=window.ImperatorProtected||[], idx=-1;
                    for (var k=0;k<arr.length;k++){ if(String(arr[k])===String(pid)){ idx=k; break; } }
                    if (idx>-1) arr.splice(idx,1); else arr.push(pid);
                    window.ImperatorProtected=arr;
                    if (window.__impSaveProtected) window.__impSaveProtected();
                    if (window.__impChantiersRedraw) window.__impChantiersRedraw();
                    return;
                }
                var goTo = t.closest && t.closest('.imp-ch-goto[data-from]');
                if (goTo){ e.preventDefault(); try{ GM_setValue('imperator_reopen_tab', goTo.getAttribute('data-reopen')||'chantiers'); }catch(x){} try{ var c=__impFindCity(goTo.getAttribute('data-from')); if(c) IkaTools.View.activateCity(c); }catch(x){} return; }
                var prep = t.closest && t.closest('.imp-ch-prep[data-to]');
                if (prep){ e.preventDefault(); __impPrepareEnvoi({ from:prep.getAttribute('data-from'), to:prep.getAttribute('data-to'), res:prep.getAttribute('data-res'), qty:parseInt(prep.getAttribute('data-qty'),10), ships:parseInt(prep.getAttribute('data-ships'),10), fleet:prep.getAttribute('data-fleet'), reopen:prep.getAttribute('data-reopen')||'chantiers' }); return; }
                var del = t.closest && t.closest('.imp-ch-del[data-id]');
                if (del){ e.preventDefault(); var id=del.getAttribute('data-id'); window.ImperatorChantiers=(window.ImperatorChantiers||[]).filter(function(c){return c.id!==id;}); if(window.__impSaveChantiers) window.__impSaveChantiers(); if(window.__impChantiersRedraw) window.__impChantiersRedraw(); return; }
            }, false);
            document.addEventListener('change', function(e){
                var inp = (e.target && e.target.closest) ? e.target.closest('.imp-boisson-trigger') : null;
                if (!inp) return;
                var v = parseInt(String(inp.value).replace(/[^0-9]/g,''),10);
                if (isNaN(v)) v = __impWineTrigger();
                v = Math.max(0, Math.min(v, __IMP_WINE_TARGET));
                window.ImperatorWineTrigger = v;
                if (window.__impSaveWineTrigger) window.__impSaveWineTrigger();
                if (window.__impBoissonsRedraw) window.__impBoissonsRedraw();
            }, false);
        }

        /* ---- Réouverture auto de Chantiers après un transport (Préparer) ----
         * goToLocalView charge en AJAX : quand le transport se ferme (retour à
         * CITY_DETAIL), on rouvre l'onglet Chantiers -> le statut passe en "envoyé"
         * sans fermer/rouvrir à la main. Écouteur additif, aucun code coeur modifié. */
        function __impInitTransportReopen(){
            if (window.__impTransportReopenInit) return;
            window.__impTransportReopenInit = true;
            try{
                IkaTools.View.registerIkariamAjaxResponseCallback(function(response){
                    try{
                        IkaTools.Utils.iterateIkariamAjaxResponse(response, function(i,name,data){
                            if (name!==IkaTools.Constants.IkariamAjaxResponseType.CHANGE_VIEW) return;
                            var view=data[0];
                            if (view===IkaTools.Constants.View.CITY_DETAIL && window.__impReopenAfterTransport){
                                var which=window.__impReopenAfterTransport; window.__impReopenAfterTransport=null;
                                try{ if(which==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){}
                            }
                            if (view!==IkaTools.Constants.View.TRANSPORT) window.__impReopenAfterTransport=null;
                        });
                    }catch(e){}
                });
                // v2.42 : après l'envoi, le jeu reste sur le port (pas de retour à la ville).
                // On rouvre donc dès que le serveur confirme le transport (même signal que le
                // débit à l'envoi : retour de type 10).
                IkaTools.View.registerAjaxFormSubmitCallback(function(form){
                    try{
                        if (!form || (form.id!=='transport' && form.id!=='transportForm')) return;
                        var which=window.__impReopenAfterTransport;
                        if (!which) return;
                        IkaTools.View.registerNextIkariamAjaxRequestCallback(function(response){
                            try{
                                var success=false;
                                IkaTools.Utils.iterateIkariamAjaxResponse(response, function(i,name,data){
                                    if (name===IkaTools.Constants.IkariamAjaxResponseType.PROVIDE_FEEDBACK &&
                                        data && data[0] && data[0].type==10) success=true;
                                });
                                if (!success) return;
                                window.__impReopenAfterTransport=null;
                                setTimeout(function(){
                                    try{ if(which==='boissons' && window.ImperatorOpenBoissons) window.ImperatorOpenBoissons(); else if(window.ImperatorOpenChantiers) window.ImperatorOpenChantiers(); }catch(e){}
                                }, 300);
                            }catch(e){}
                        });
                    }catch(e){}
                });
            }catch(e){}
        }

        function __impProtectedPanel(){
            var cities=[]; try{ cities=IkaTools.EmpireData.getOwnCities(); }catch(e){}
            if (!cities.length) return '';
            var chips=cities.map(function(c){
                var id=String(c.getId()), name=(c.getName?c.getName():id), on=__impIsProtected(id);
                return '<a class="imperator_link imp-ch-prot'+(on?' on':'')+'" href="javascript:void(0)" data-protect="'+__impEsc(id)+'">'+__impEsc(name)+'</a>';
            }).join('');
            return '<div class="imp-ch-prot-wrap"><div class="imp-ch-prot-h">Villes prot\u00e9g\u00e9es \u2014 clique pour exclure une ville des sources de routage</div>'+
                   '<div class="imp-ch-prot-list">'+chips+'</div></div>';
        }

        /* ===== IMPERATOR — Service de boissons (vin) ===== */
        var __IMP_WINE_TARGET = 100000, __IMP_WINE_SRC_FLOOR = 50000;
        window.__impSaveWineTrigger = function(){ try{ GM_setValue('imperator_wine_trigger', String(window.ImperatorWineTrigger)); }catch(e){} };
        window.__impLoadWineTrigger = function(){ var v=85000; try{ v=parseInt(GM_getValue('imperator_wine_trigger','85000'),10); if(isNaN(v)) v=85000; }catch(e){} window.ImperatorWineTrigger=Math.max(0,Math.min(v,__IMP_WINE_TARGET)); };
        window.__impLoadWineTrigger();
        function __impWineTrigger(){ var v=window.ImperatorWineTrigger; return (typeof v==='number' && !isNaN(v))?v:85000; }


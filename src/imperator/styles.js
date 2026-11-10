    function addStyles() {
        GM_addStyle('\
/*-------------------------main board ----------------------*/ \
\
.imperator_overview { \
width: 100% !important; \
overflow-x: auto !important; \
//margin: 0 auto; \
//padding: 15px 0; \
} \
\
.imperator_overview.ltr, \
.imperator_overview.ltr * { \
direction: ltr; \
} \
\
.imperator_overview.rtl, \
.imperator_overview.rtl * { \
direction: rtl; \
} \
\
/*************************************************************/ \
/* Generic */ \
\
.nowrap { \
white-space: nowrap; \
} \
\
/*************************************************************/ \
/* Main overview table formatting */ \
\
.imperator_overview table.overview { \
width: auto !important; \
min-width: 851px !important; \
margin-bottom: 3px; \
background-color: #FAF3D7 \
border-collapse: collapse; \
border: 1px solid #E4B873; \
color: #542C0F; \
\
height: auto; \
line-height: 12px; \
font-size: 11px; \
min-width: 10px; \
vertical-align: top; \
text-align: right; \
\
cursor:default; \
overflow-x: scroll; \
} \
\
.imperator_overview a, \
.imperator_overview p { \
line-height: 12px; \
font-size: 11px; \
} \
\
.imperator_overview table.overview tbody tr { \
min-height: 22px; \
height: 22px; \
} \
\
.imperator_overview table.overview colgroup { \
border-left: 2px solid #DEC285; \
border-right: 2px solid #DEC285; \
} \
\
.imperator_overview table.overview td { \
padding: 1px 2px; \
min-width: 11px; \
} \
\
.imperator_overview table.overview tbody td { \
vertical-align: top; \
} \
\
.imperator_overview table.overview col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
min-width: 20px; \
} \
\
.imperator_overview table.overview col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
min-width: 20px; \
} \
\
.imperator_overview table.overview col.city_name { \
border-left: none; \
text-align: left; \
width: 95px; \
} \
\
.imperator_overview table.overview td.city_name { \
text-align: left; \
} \
\
.imperator_overview table.overview col.city_tradegood { \
border-right: none; \
width: 20px; \
} \
\
.imperator_overview table.overview td.city_tradegood img { \
height: 12pt; \
} \
\
.imperator_overview table.overview thead { \
background: #F8E7B3 url(/cdn/all/both/input/button.png) repeat-x scroll 0 bottom; \
} \
\
.imperator_overview table.overview tfoot {  \
background: #E7C680 url(/cdn/all/both/input/button.png) repeat-x scroll 0 0; \
border-top: 2px solid #CB9B6A; \
vertical-align: top; \
} \
\
.imperator_overview table.overview tbody tr { \
border-top: 1px solid #ECCF8E; \
} \
\
.imperator_overview table.overview tbody tr:nth-child(odd) { \
background-color: #FAEEC0; \
} \
\
.imperator_overview table.overview td.city_name, \
.imperator_overview table.overview th.city_name { \
width: 95px; \
max-width: 95px; \
overflow: hidden; \
} \
\
.imperator_overview table.overview tbody tr.current { \
background-color: #FAE0BB; \
} \
\
.imperator_overview table.overview tbody tr:hover { \
background-color: #FAF7EB; \
border:1px solid #CB9B6A; \
} \
\
.imperator_overview table.overview tfoot tr {  \
} \
\
.imperator_overview table.overview th { \
height: 22px; \
width: auto; \
padding: 1px; \
padding-bottom: 2px; \
padding-left: 3px; \
text-align: center; \
font-weight: bold; \
} \
\
.imperator_overview table.overview th.city_name, \
.imperator_overview table.overview td.city_name { \
overflow: hidden; \
} \
\
.imperator_overview table.overview td.totals_sigma_cell:after { \
content: url("/cdn/all/both/layout/sigma.png"); \
} \
\
/**************************************************************/ \
/* Tool tip formatting */ \
\
.tool_tip_container { \
background-color: #FAF3D7; \
border: 1px solid #CB9B6A; \
font-size: 11px; \
position: absolute; \
text-align: left; \
z-index: 110000; \
white-space: nowrap; \
} \
\
.tool_tip_container * { \
padding: 2px 3px; \
} \
\
.tool_tip_container thead,  \
.imperator_tool_tip_title { \
background: #F8E7B3 url("/cdn/all/both/input/button.png") repeat-x scroll 0 bottom; \
white-space: nowrap; \
border-bottom: 1px solid #CB9B6A; \
} \
\
.tool_tip_container tfoot { \
background: #E7C680 url("/cdn/all/both/input/button.png") repeat-x scroll 0 0; \
border-top: 1px solid #CB9B6A; \
} \
\
table.building_upgrade_costs { \
width: 100%; \
} \
\
table.building_upgrade_costs td *, \
table.lootable_resources td *, \
table.target_military_garrison tfoot td *, \
table.combat_looted td * { \
padding: 0px 2px; \
} \
\
table.espionage_combats > tbody > tr:nth-child(even), \
table.travel_time tr:nth-child(even) { \
background-color: #FAEEC0; \
} \
\
table.building_upgrade_costs td.resource_icon img, \
table.building_upgrade_costs td.resource_missing img, \
table.lootable_resources td.resource_icon img, \
table.combat_looted td.resource_icon img { \
height: 11px; \
} \
\
table.resource_use_tool_tip, \
table.lootable_resources tbody td.resource_lootable, \
table.target_military_garrison tbody td { \
text-align: right; \
} \
\
table.resource_use_tool_tip col { \
border-left: 1px dashed #ECCF8E; \
border-right: 1px dashed #ECCF8E; \
} \
\
table.resource_use_tool_tip col:first-of-type { \
border-left: none; \
} \
\
table.resource_use_tool_tip col:last-of-type { \
border-right: none; \
} \
\
table.resource_use_tool_tip .imp_growth_full { \
font-size: 10px; \
font-style: italic; \
color: #8A6D39; \
white-space: nowrap; \
} \
\
table.building_upgrade_costs td.resource_missing { \
color: #AA0303; \
text-align: right; \
} \
\
table.building_upgrade_costs td.resource_cost { \
text-align: right; \
} \
\
table.resources_in_transit_tool_tip img, \
table.resource_use_tool_tip img { \
padding: 0px 0px; \
padding-top: 1px; \
} \
\
table.resources_in_transit_tool_tip .resource_count, \
table.training_units_tool_tip .training_count, \
table.deploying_units_tool_tip .deploying_count  \
table.plundering_units_tool_tip .plundering_count{ \
text-align: right; \
} \
\
div.combat_type_blockade, \
div.combat_type_plunder { \
max-width: 25px; \
width: 25px; \
height: 15px; \
max-height: 15px; \
background-size: 25px auto; \
background-position: left top; \
background-repeat: no-repeat; \
background-position: 0px 0px; \
} \
div.combat_type_blockade { \
background-image: url("/cdn/all/both/actions/blockade.jpg"); \
} \
div.combat_type_plunder { \
background-image: url("/cdn/all/both/actions/plunder.jpg"); \
} \
\
/**************************************************************/ \
/* Resource table specific formatting */ \
\
#ImperatorOverviewResourceTable .resource_consumption, \
#ImperatorOverviewResourceTable .resource_consumption a { \
font-size: 9px; \
} \
\
#ImperatorOverviewResourceTable .resources_transporting { \
font-size: 9px; \
line-height: 10px; \
color: #4455EB; \
} \
\
#ImperatorOverviewResourceTable .is_under_safe_limit:before { \
content: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAJCAYAAAD+WDajAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAEFJREFUeNpi/P//PwMIhOrzQhhAsPriZ0YQzYQugcxnQhaE6YABxhA9HhRdyICJAQ/AayzxOtFdzYRuFLIVAAEGANwqFwuukYKqAAAAAElFTkSuQmCC"); \
float: left; \
} \
\
#ImperatorOverviewResourceTable .resource_current { \
white-space: nowrap; \
} \
\
#ImperatorOverviewResourceTable td.research, \
#ImperatorOverviewResourceTable td.population, \
#ImperatorOverviewResourceTable td.population_growth { \
text-align: center;; \
} \
\
/* v3.2 : colonne Recherche */ \
#ImperatorOverviewResourceTable td.research .imp_rs_l1 { \
font-weight: bold; \
white-space: nowrap; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_l2 { \
display: flex; \
justify-content: space-between; \
align-items: center; \
gap: 4px; \
font-size: 10px; \
white-space: nowrap; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_sci { \
display: inline-flex; \
align-items: center; \
gap: 2px; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_ring { \
display: block; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_cost { \
color: #8A5A00; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_cost.imp_rs_negative { \
color: #C0392B; \
font-weight: bold; \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_none { \
color: #B9A27E; \
} \
#ImperatorOverviewResourceTable td.research.imp_rs_stale { \
opacity: 0.55; \
} \
/* v3.5 : voyant experience */ \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp { \
display: inline-block; \
width: 8px; \
height: 8px; \
border-radius: 50%; \
margin-right: 4px; \
vertical-align: middle; \
box-shadow: 0 0 0 1px rgba(0,0,0,0.25); \
} \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_ready { background-color: #2E9E2E; } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_scroll { background-color: #F0A020; } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_blocked { background-color: #D23C3C; } \
@keyframes imp_rs_blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } } \
#ImperatorOverviewResourceTable td.research .imp_rs_lamp_blink { animation: imp_rs_blink 0.8s ease-in-out 10; } \
#ImperatorOverviewResourceTable th.research { \
position: relative; \
} \
#ImperatorOverviewResourceTable th.research .imp_rs_head_count { \
position: absolute; \
right: 2px; \
bottom: 1px; \
font-size: 10px; \
font-weight: bold; \
color: #5A3A1A; \
} \
#ImperatorOverviewResourceTable th.research .imp_rs_head_ready { color: #2E9E2E; } \
#ImperatorOverviewResourceTable th.research .imp_rs_head_scroll { color: #D9822B; } \
.imp_rs_tip tr.imp_rs_xp_ready { color: #2E7D2E; font-weight: bold; } \
.imp_rs_tip tr.imp_rs_xp_scroll { color: #B8650F; font-weight: bold; } \
.imp_rs_tip tr.imp_rs_xp_blocked { color: #C0392B; } \
.imp_rs_tip .imp_rs_tip_title { \
font-weight: bold; \
margin-bottom: 2px; \
} \
.imp_rs_tip td.imp_rs_val { \
text-align: right; \
white-space: nowrap; \
} \
.imp_rs_tip tr.imp_rs_warn { \
color: #C0392B; \
} \
.imp_rs_tip tr.imp_rs_gold { \
color: #8A5A00; \
} \
.imp_rs_tip tr.imp_rs_muted, \
.imp_rs_tip .imp_rs_tip_age { \
color: #8C7355; \
font-size: 10px; \
} \
.imp_rs_tip .imp_rs_tip_alert { \
color: #C0392B; \
font-weight: bold; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon img { \
width: 18px; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon { \
position: relative; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon.imp_museum_incomplete img { \
box-shadow: 0 0 0 2px #E8A33D; \
border-radius: 50%; \
} \
\
#ImperatorOverviewResourceTable td.population_growth_icon.imp_museum_incomplete::after { \
content: attr(data-imp-gap); \
position: absolute; \
right: 1px; \
bottom: 1px; \
min-width: 11px; \
height: 11px; \
padding: 0 2px; \
border-radius: 6px; \
background: #C0392B; \
color: #fff; \
font: bold 9px/11px Arial, sans-serif; \
text-align: center; \
pointer-events: none; \
} \
\
#ImperatorOverviewResourceTable a.transport_goods, \
#ImperatorOverviewResourceTable a.to_town_hall, \
#ImperatorOverviewBuildingsTable a.transport_goods, \
#ImperatorOverviewBuildingsTable a.to_city_view, \
#ImperatorOverviewMilitaryTable a.deploy_army, \
#ImperatorOverviewMilitaryTable a.deploy_navy, \
#ImperatorOverviewMilitaryTable a.to_barracks, \
#ImperatorOverviewMilitaryTable a.to_shipyard, \
#ImperatorOverviewEspionageTable a.spy_mission, \
#ImperatorOverviewEspionageTable a.pillage_mission, \
#ImperatorOverviewEspionageTable a.blockade_mission, \
#ImperatorOverviewEspionageTable a.occupy_mission, \
#ImperatorOverviewEspionageTable a.send_spy_mission, \
#ImperatorOverviewEspionageTable a.remove_espionage_target { \
\
max-width: 25px; \
width: 25px; \
height: 17px; \
display: inline-block; \
background-size: 25px auto; \
background-position: left top; \
background-repeat: no-repeat; \
background-position: 0px 0px; \
} \
\
#ImperatorOverviewResourceTable a.transport_goods, \
#ImperatorOverviewBuildingsTable a.transport_goods { \
background-image: url("/cdn/all/both/actions/transport.jpg"); \
margin-left: 2px; \
} \
\
#ImperatorOverviewResourceTable a.to_town_hall, \
#ImperatorOverviewBuildingsTable a.to_city_view { \
background-image: url("/cdn/all/both/layout/icon-city2.png"); \
} \
\
#ImperatorOverviewResourceTable a.transport_goods:hover, \
#ImperatorOverviewBuildingsTable a.transport_goods:hover, \
#ImperatorOverviewMilitaryTable a.deploy_navy:hover, \
#ImperatorOverviewMilitaryTable a.deploy_army:hover, \
#ImperatorOverviewEspionageTable a.pillage_mission:hover, \
#ImperatorOverviewEspionageTable a.blockade_mission:hover, \
#ImperatorOverviewEspionageTable a.occupy_mission:hover, \
#ImperatorOverviewEspionageTable a.send_spy_mission:hover { \
background-position: 0px -17px; \
} \
\
#ImperatorOverviewResourceTable tr.current a.transport_goods, \
#ImperatorOverviewBuildingsTable tr.current a.transport_goods, \
#ImperatorOverviewMilitaryTable tr.current a.deploy_navy, \
#ImperatorOverviewMilitaryTable tr.current a.deploy_army { \
background-position: 0px -34px; \
} \
\
#ImperatorOverviewResourceTable.city_type_deployedCities a.transport_goods, \
#ImperatorOverviewResourceTable.city_type_occupiedCities a.transport_goods, \
#ImperatorOverviewBuildingsTable.city_type_deployedCities a.transport_goods, \
#ImperatorOverviewBuildingsTable.city_type_occupiedCities a.transport_goods { \
background-position: 0px -34px; \
} \
\
.imperator_overview table.overview td.actions { \
text-align: left; \
} \
\
#ImperatorOverviewResourceTable th.actions, \
#ImperatorOverviewBuildingsTable th.actions, \
#ImperatorOverviewBuildingsTable td.actions, \
#ImperatorOverviewMilitaryTable th.actions { \
width: 52px !important; \
max-width: 52px !important; \
min-width: 52px !important; \
}  \
\
/************************************************************/ \
/* Percent bars and warning indications */ \
\
.imperator_overview .percent_bar { \
border-radius: 2px; \
height: 3px; \
background-color: !transparent; \
border: 1px solid #B07D56; \
overflow: hidden; \
min-width: 45px; \
margin-top: 1px; \
} \
\
.imperator_overview .percent_bar .percent_bar_active {  \
height: 100%; \
border-top-left-radius: 2px; \
border-bottom-left-radius: 2px; \
background-color: #481010; \
} \
\
.imperator_overview .percent_bar.expiration_forseeable .percent_bar_active { \
background-color: #7F1D1A; \
} \
\
.imperator_overview .percent_bar.expiration_soon .percent_bar_active {  \
background-color: #B42521; \
} \
\
.imperator_overview .percent_bar.expiration_imminent .percent_bar_active, \
.imperator_overview .percent_bar.expiration_now .percent_bar_active {  \
background-color: #FF0000; \
} \
\
.imperator_overview .percent_bar.percent_bar_desire_filled.percent_bar_filled \
.percent_bar_active { \
background-color: #285E28; \
} \
\
.imperator_overview .expiration_now, \
.imperator_overview .expiration_imminent { \
font-weight: bold; \
color: red; \
} \
\
.imperator_overview .expiration_soon { \
font-weight: bold; \
color: #B42521; \
} \
\
.imperator_overview .expiration_forseeable { \
color: #8F1D1A; \
} \
\
.imperator_overview .imperator_warning { \
color: red; \
} \
\
/***************************************************************/ \
/* Buildings table specific formatting */ \
\
#ImperatorOverviewBuildingsTable tbody td{ \
vertical-align: middle; \
} \
\
#ImperatorOverviewBuildingsTable th {  \
max-width: 15px; \
width: 15px; \
overflow: hidden;  \
cursor: default; \
height: 36px; \
} \
\
#ImperatorOverviewBuildingsTable td {  \
width: 15px; \
} \
#ImperatorOverviewBuildingsTable th.building[colspan="2"] { max-width: 20px; } \
#ImperatorOverviewBuildingsTable th.building[colspan="3"] { max-width: 35px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="4"] { max-width: 45px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="5"] { max-width: 55px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="6"] { max-width: 65px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="7"] { max-width: 75px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="8"] { max-width: 85px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="9"] { max-width: 95px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="10"] { max-width: 100px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="11"] { max-width: 105px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="12"] { max-width: 110px;} \
#ImperatorOverviewBuildingsTable th.building[colspan="13"] { max-width: 115px;} \
\
\
#ImperatorOverviewBuildingsTable td.building_upgrading a { \
font-weight: bold; \
color: green; \
} \
\
#ImperatorOverviewBuildingsTable col.building.building_additional { \
border-left: none; \
} \
\
#ImperatorOverviewBuildingsTable col.building { \
border-right: none; \
} \
\
/**************************************************************/ \
/* Military table specific formatting */ \
\
#ImperatorOverviewMilitaryTable thead { \
height: 36px; \
cursor: default; \
} \
\
#ImperatorOverviewMilitaryTable th { \
overflow: hidden; \
max-width: 23px; \
} \
\
#ImperatorOverviewMilitaryTable a.deploy_army { \
background-image: url("/cdn/all/both/actions/move_army.jpg"); \
} \
\
#ImperatorOverviewMilitaryTable a.deploy_navy { \
background-image: url("/cdn/all/both/actions/move_fleet.jpg"); \
margin-left: 2px; \
} \
\
#ImperatorOverviewMilitaryTable a.to_barracks { \
background-image:url("/cdn/all/both/img/city/barracks_l.png"); \
background-size: 30px auto; \
background-position: bottom left; \
} \
\
#ImperatorOverviewMilitaryTable a.to_shipyard { \
background-image:url("/cdn/all/both/img/city/shipyard_l.png"); \
} \
\
#ImperatorOverviewMilitaryTable a.to_barracks+a.to_shipyard { \
margin-left: 2px; \
} \
\
#ImperatorOverviewMilitaryTable .military_training { \
font-size: 9px; \
line-height: 10px; \
color: green; \
} \
\
#ImperatorOverviewMilitaryTable .military_deploying { \
font-size: 9px; \
line-height: 10px; \
color: #4455EB; \
} \
\
#ImperatorOverviewMilitaryTable .military_plundering { \
font-size: 9px; \
line-height: 10px; \
color: #8302A3; \
} \
/**************************************************************/ \
/* Espionage table specific formatting */ \
\
#ImperatorOverviewEspionageTable td.city_tradegood { \
width: auto; \
min-width: 50px; \
text-align: left; \
} \
#ImperatorOverviewEspionageTable td.actions { \
min-width: 160px; \
} \
#ImperatorOverviewEspionageTable a.spy_mission { \
/*background-image: url("/cdn/all/both/friends/citymenu.png"); \
background-position: 0px -129px; */\
background-image: url("/cdn/all/both/layout/icon-mission.png"); \
} \
#ImperatorOverviewEspionageTable a.pillage_mission { \
background-image: url("/cdn/all/both/actions/plunder.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.blockade_mission { \
background-image: url("/cdn/all/both/actions/blockade.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.occupy_mission { \
background-image: url("/cdn/all/both/actions/occupy.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.send_spy_mission { \
background-image: url("/cdn/all/both/actions/espionage.jpg"); \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.remove_espionage_target { \
background-image: url("/cdn/all/both/actions/defend.jpg"); \
background-position: 0px -34px; \
margin-left: 2px; \
} \
#ImperatorOverviewEspionageTable a.player_state_inactive { \
color: grey; \
} \
#ImperatorOverviewEspionageTable a.player_state_vacation { \
color: green; \
} \
#ImperatorOverviewEspionageTable tbody td { \
vertical-align: middle; \
} \
#ImperatorOverviewEspionageTable td.player, \
#ImperatorOverviewEspionageTable td.location { \
text-align: left; \
} \
.espionage_blockader, \
.espionage_occupier { \
margin-left: 1pt; \
margin-right: 1pt; \
} \
.target_military_garrison thead th { \
height: 36px; \
cursor: default; \
} \
.target_military_garrison th { \
overflow: hidden; \
max-width: 23px; \
} \
.target_military_garrison th.military { \
background-size: auto 33px; \
} \
.target_military_garrison th.military_phalanx { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
} \
.target_military_garrison th.military_steamgiant { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_steamgiant_faceright.png"); \
} \
.target_military_garrison th.military_spartan { \
background-image:url("/cdn/all/both/ikipedia/319.png"); \
background-size: contain; \
background-repeat: no-repeat; \
background-position: center; \
} \
.target_military_garrison th.military_spearman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_spearman_faceright.png"); \
} \
.target_military_garrison th.military_swordsman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_swordsman_faceright.png"); \
} \
.target_military_garrison th.military_slinger { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_slinger_faceright.png"); \
} \
.target_military_garrison th.military_archer { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_archer_faceright.png"); \
} \
.target_military_garrison th.military_marksman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_marksman_faceright.png"); \
} \
.target_military_garrison th.military_ram { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_ram_faceright.png"); \
background-size: auto 18px; \
} \
.target_military_garrison th.military_catapult { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_catapult_faceright.png"); \
background-size: auto 23px; \
} \
.target_military_garrison th.military_mortar { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_mortar_faceright.png"); \
background-size: auto 22px; \
} \
.target_military_garrison th.military_gyrocopter { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_gyrocopter_faceright.png"); \
background-size: auto 21px; \
} \
.target_military_garrison th.military_bombardier { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_bombardier_faceright.png"); \
} \
.target_military_garrison th.military_cook { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_cook_faceright.png"); \
} \
.target_military_garrison th.military_medic { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_medic_faceright.png"); \
} \
.target_military_garrison th.military_ship_flamethrower { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_flamethrower_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_steamboat { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_steamboat_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ram { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ram_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ballista { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballista_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_catapult { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_catapult_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_mortar { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_mortar_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_submarine { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_submarine_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_paddlespeedship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_paddlespeedship_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_ballooncarrier { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballooncarrier_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_tender { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_tender_faceright.png"); \
background-size: 33px auto; \
} \
.target_military_garrison th.military_ship_rocketship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_rocketship_faceright.png"); \
background-size: 33px auto; \
} \
\
/*****************************************************************/ \
/* Image styling for table headers */ \
\
#ImperatorOverviewBuildingsTable th.building, \
#ImperatorOverviewMilitaryTable th.military, \
.imperator_overview table.overview th.action_points, \
#ImperatorOverviewResourceTable th.population, \
#ImperatorOverviewResourceTable th.population_growth, \
#ImperatorOverviewResourceTable th.research, \
#ImperatorOverviewResourceTable th.resource, \
#ImperatorOverviewEspionageTable th.location, \
#ImperatorOverviewEspionageTable th.travel_time, \
#ImperatorOverviewEspionageTable th.townhall_level, \
#ImperatorOverviewEspionageTable th.wall_level, \
#ImperatorOverviewEspionageTable th.resources_lootable, \
#ImperatorOverviewEspionageTable th.combats, \
#ImperatorOverviewEspionageTable th.military_score, \
.target_military_garrison th.military \
{ \
-webkit-user-select: none; \
-khtml-user-select: none; \
-moz-user-select: none; \
-o-user-select: none; \
user-select: none; \
cursor: default; \
color: transparent; \
background-repeat: no-repeat; \
background-attachment: center; \
background-position: center; \
} \
\
.imperator_overview table.overview td.action_points, \
.imperator_overview table.overview th.action_points { \
max-width: 20px; \
width: 20px; \
overflow: hidden; \
} \
\
.imperator_overview table.overview th.action_points { \
background-image:url("/cdn/all/both/resources/icon_actionpoints.png"); \
max-width: 20px; \
} \
.imperator_overview table.overview td.action_points { \
max-width: 20px; \
} \
\
#ImperatorOverviewResourceTable th.population { \
background-image:url("/cdn/all/both/resources/icon_population.png"); \
} \
\
#ImperatorOverviewResourceTable th.population_growth { \
background-image:url("/cdn/all/both/icons/growth_positive.png"); \
} \
\
#ImperatorOverviewResourceTable th.research { \
background-image:url("/cdn/all/both/layout/bulb-on.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_wood { \
background-image:url("/cdn/all/both/resources/icon_wood.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_wine { \
background-image:url("/cdn/all/both/resources/icon_wine.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_marble { \
background-image:url("/cdn/all/both/resources/icon_marble.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_crystal { \
background-image:url("/cdn/all/both/resources/icon_crystal.png"); \
} \
\
#ImperatorOverviewResourceTable th.resource_sulfur { \
background-image:url("/cdn/all/both/resources/icon_sulfur.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building { \
background-size: 55px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_spots { \
background-image:url("/cdn/all/both/img/city/flag_red.png"); \
background-size: 25px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_townHall { \
background-image:url("/cdn/all/both/img/city/townhall_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_palace { \
background-image:url("/cdn/all/both/img/city/palace_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_palaceColony { \
background-image:url("/cdn/all/both/img/city/palaceColony_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_tavern { \
background-image:url("/cdn/all/both/img/city/taverne_r.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_museum { \
background-image:url("/cdn/all/both/img/city/museum_r.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_academy { \
background-image:url("/cdn/all/both/img/city/academy_l.png"); \
}       \
\
#ImperatorOverviewBuildingsTable th.building_workshop { \
background-image:url("/cdn/all/both/img/city/workshop_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_temple { \
background-image:url("/cdn/all/both/img/city/temple_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_embassy { \
background-image:url("/cdn/all/both/img/city/embassy_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_warehouse { \
background-image:url("/cdn/all/both/img/city/warehouse_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_dump { \
background-image:url("/cdn/all/both/img/city/dump_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_branchOffice { \
background-image:url("/cdn/all/both/img/city/branchoffice_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_blackMarket { \
background-image:url("/cdn/all/both/img/city/blackmarket_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_marineChartArchive { \
background-image:url("/cdn/all/both/img/city/marinechartarchive_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_port { \
background-image:url("/cdn/all/both/img/city/port_l.png"); \
}  \
\
#ImperatorOverviewBuildingsTable th.building_wall { \
background-image:url("/cdn/all/both/img/city/wall.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_safehouse { \
background-image:url("/cdn/all/both/img/city/safehouse_l.png"); \
background-size: 65px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_barracks { \
background-image:url("/cdn/all/both/img/city/barracks_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_shipyard { \
background-image:url("/cdn/all/both/img/city/shipyard_l.png"); \
background-size: 45px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_pirateFortress { \
background-image:url("/cdn/all/both/img/city/pirateFortress_l.png"); \
background-size: 45px; \
} \
\
#ImperatorOverviewBuildingsTable th.building_forester { \
background-image:url("/cdn/all/both/img/city/forester_l.png"); \
}       \
\
#ImperatorOverviewBuildingsTable th.building_carpentering { \
background-image:url("/cdn/all/both/img/city/carpentering_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_winegrower { \
background-image:url("/cdn/all/both/img/city/winegrower_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_vineyard { \
background-image:url("/cdn/all/both/img/city/vineyard_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_stonemason { \
background-image:url("/cdn/all/both/img/city/stonemason_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_architect { \
background-image:url("/cdn/all/both/img/city/architect_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_glassblowing { \
background-image:url("/cdn/all/both/img/city/glassblowing_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_optician { \
background-image:url("/cdn/all/both/img/city/optician_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_alchemist { \
background-image:url("/cdn/all/both/img/city/alchemist_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_fireworker { \
background-image:url("/cdn/all/both/img/city/fireworker_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_dockyard { \
background-image:url("/cdn/all/both/img/city/dockyard_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_shrineOfOlympus { \
background-image:url("/cdn/all/both/img/city/shrineOfOlympus_l.png"); \
} \
\
#ImperatorOverviewBuildingsTable th.building_chronosForge { \
background-image:url("/cdn/all/both/img/city/chronosForge_l.png"); \
} \
\
#ImperatorOverviewMilitaryTable th.military { \
background-size: auto 33px; \
} \
\
#ImperatorOverviewMilitaryTable th.military_phalanx { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_steamgiant { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_steamgiant_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_spartan { \
background-image:url("/cdn/all/both/ikipedia/319.png"); \
background-size: contain; \
background-repeat: no-repeat; \
background-position: center; \
} \
#ImperatorOverviewMilitaryTable th.military_spearman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_spearman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_swordsman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_swordsman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_slinger { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_slinger_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_archer { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_archer_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_marksman { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_marksman_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_ram { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_ram_faceright.png"); \
background-size: auto 18px; \
} \
#ImperatorOverviewMilitaryTable th.military_catapult { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_catapult_faceright.png"); \
background-size: auto 23px; \
} \
#ImperatorOverviewMilitaryTable th.military_mortar { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_mortar_faceright.png"); \
background-size: auto 22px; \
} \
#ImperatorOverviewMilitaryTable th.military_gyrocopter { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_gyrocopter_faceright.png"); \
background-size: auto 21px; \
} \
#ImperatorOverviewMilitaryTable th.military_bombardier { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_bombardier_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_cook { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_cook_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_medic { \
background-image:url("/cdn/all/both/characters/military/x60_y60/y60_medic_faceright.png"); \
} \
#ImperatorOverviewMilitaryTable th.military_ship_flamethrower { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_flamethrower_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_steamboat { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_steamboat_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ram { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ram_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ballista { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballista_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_catapult { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_catapult_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_mortar { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_mortar_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_submarine { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_submarine_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_paddlespeedship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_paddlespeedship_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_ballooncarrier { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_ballooncarrier_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_tender { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_tender_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewMilitaryTable th.military_ship_rocketship { \
background-image:url("/cdn/all/both/characters/fleet/60x60/ship_rocketship_faceright.png"); \
background-size: 33px auto; \
} \
#ImperatorOverviewEspionageTable th.location { \
background-image: url("/cdn/all/both/layout/icon-island.png"); \
} \
#ImperatorOverviewEspionageTable th.travel_time { \
background-image: url("/cdn/all/both/resources/icon_time.png"); \
} \
#ImperatorOverviewEspionageTable th.townhall_level { \
background-image:url("/cdn/all/both/img/city/townhall_l.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.wall_level { \
background-image:url("/cdn/all/both/img/city/wall.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.resources_lootable { \
background-image: url("/cdn/all/both/characters/fleet/40x40/ship_transport_r_40x40.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable th.combats { \
background-image: url("/cdn/all/both/minimized/plunder.png"); \
background-size: auto 120%; \
} \
#ImperatorOverviewEspionageTable th.military_score { \
background-image: url("/cdn/all/both/characters/military/x60_y60/y60_phalanx_faceright.png"); \
background-size: auto 100%; \
} \
#ImperatorOverviewEspionageTable td.location, \
#ImperatorOverviewEspionageTable td.travel_time, \
#ImperatorOverviewEspionageTable td.townhall_level, \
#ImperatorOverviewEspionageTable td.wall_level, \
#ImperatorOverviewEspionageTable td.resources_lootable, \
#ImperatorOverviewEspionageTable td.combats, \
#ImperatorOverviewEspionageTable td.military_score { \
text-align: center; \
} \
#ImperatorOverviewMilitaryTable td.action_points, \
#ImperatorOverviewMilitaryTable td.military { \
text-align: center; \
vertical-align: middle; \
} \
\
/********************** Settings dialog *************************/ \
#options .tabmenu .tab { \
width: auto; \
} \
/* Agrandissement fenêtre principale */ \
#popup_content, \
#templateView, \
.templateView, \
.mainContent { \
width: auto !important; \
max-width: 98vw !important; \
} \
\
.imperator_overview { \
width: 100% !important; \
overflow-x: auto !important; \
} \
\
.imperator_overview table.overview { \
width: 100% !important; \
min-width: 851px !important; \
} \
'
                   );
    }


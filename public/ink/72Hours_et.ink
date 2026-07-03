// 72 TUNDI - Kriisiohje mäng
// 1. VAATUS: ÖÖ

// === MUUTUJAD ===
VAR temperature = -8

// Perekonna koosseis (määrab React FamilySetup overlay)
VAR family_size = 2
VAR elderly_relation = "Vanaema"
VAR has_elderly = true
VAR has_children = false
VAR children_count = 0

// Aja jälgimine (minutites keskööst, nii et 20:00 = 1200, 22:00 = 1320)
VAR current_time = 1200
VAR storm_time = 1320
VAR start_time = 1200
VAR in_preparation = false

// Ettevalmistuskategooriad (0 = tegemata, 1 = põhiline, 2 = põhjalik)
VAR prep_water = 0
VAR prep_food = 0
VAR prep_heat = 0
VAR prep_light = 0
VAR prep_info = 0
VAR prep_medication = 0

// Märgitakse true, kui React WaterCalculation overlay on läbitud
VAR water_quiz_done = false

// Märgitakse PantryCheck overlay poolt
VAR pantry_checked = false
VAR pantry_gaps_count = 0
VAR pantry_use_first_count = 0

// Märgitakse HomeSetup overlay poolt
VAR home_setup_done = false
VAR home_seal_count = 0
VAR home_has_exposed_pipes = false
VAR home_high_heat_loss = false
VAR home_has_stove = false
// Püsivad kodu asjaolud HomeSetupist: building = apartment|detached|terraced|rural; heating = district|electric|wood_gas
VAR home_building = ""
VAR home_heating = ""

// Veekonteinerid täidetud
VAR water_target = 18
VAR water_collected = 0
VAR water_home_measured = 0
VAR water_bottles = false
VAR water_pots = false
VAR water_bathtub = false
VAR water_jerrycan = false

// Toiduained valitud toidupoest
VAR food_canned = false
VAR food_dried = false
VAR food_crackers = false
VAR food_nuts = false
VAR food_energy_bars = false
VAR food_chocolate = false
VAR food_longlife_bread = false
VAR food_honey_jam = false
VAR food_frozen = false
VAR food_fresh_produce = false
VAR food_milk = false
VAR food_yogurt = false

// Ostunimekiri
VAR shop_water = false
VAR shop_water_amount = 0
VAR shop_food = false
VAR shop_batteries = false
VAR shop_meds = false
VAR shop_warm = false
VAR shop_flashlight = false
VAR shop_powerbank = false
VAR shop_headlamp = false
VAR shop_lantern = false
VAR shop_matches = false
VAR shop_visited = false

// Telefonikõne tulemuse jälgimine
VAR call_outcome = ""
VAR dialed_number = ""
VAR heard_broadcast = false
VAR current_call_scenario = ""

// Lõpu jälgimine
VAR total_prep = 0
VAR ending_type = ""


// === LOO ALGUS ===
-> pen_and_paper

=== pen_and_paper ===
<span></span> # CLEAR # FAMILY_SETUP

<span style="font-size:5rem;display:block;text-align:center;margin-bottom:0.5rem">🗒️</span>

<span class="note-hint">Võta <b>pastakas ja paber</b> — sul läheb neid vaja.</span>

* [Olen valmis]
    -> tv_start

=== tv_start ===
# AUDIOLOOP: ../Sound/wind.wav
# BREAKING_NEWS

* [Jätka]
     -> emergency_broadcast

=== emergency_broadcast ===
# CLEAR
# RADIO_BROADCAST
~ heard_broadcast = true

Saade lülitub hädaolukorra infole...

* [Jätka]
     -> living_room


=== living_room ===

# CLEAR
# CLASS: fade-in-scene
# CLASS: room-lit
# BACKGROUND: ../Images/Room.jpg

<i>[Sinu elutuba. Õhtu.]</i>

{
    - has_elderly:
        Sinu {elderly_relation} magab oma toas.

        Tema vererõhuravim on köögis laual.
    - has_children:
        {children_count == 1: Sinu laps magab. | Sinu lapsed magavad.} Hoia vaikust.
    - else:
        Korteris on vaikne. Ainult sina täna õhtul.
}

Sulle tuleb sõnum mobiilile...

* [Vaata sõnumit]
      -> check_text

=== check_text ===
#CLEAR
# SMS: Martin

Loed sõnumit...

* [Jätka]
    -> check_time
=== check_time ===

# CLEAR

<span class="clock-display">🕗 20:00</span>

<span class="clock-subtitle">Torm saabub kell 22:00 — sul on 2 tundi aega.</span>

Saad aru, et aega on vähe. Pead otsustama, mida enne tormi ettevalmistamiseks teha...

* [Alusta ettevalmistustega]
    -> preparation_intro

=== preparation_intro ===

# CLEAR
~ in_preparation = true

Sul on umbes 2 tundi enne tormi saabumist. Mida soovid ette valmistada?

-> preparation_hub

=== preparation_hub ===

# CLEAR

{
    - current_time >= storm_time - 10:
        Tuul tugevneb. Ettevalmistusteks pole enam aega.
        -> preparation_complete
}

Mida soovid ette valmistada?

+ [💧 Vesi{prep_water: ✓}]
    -> category_water

+ [🍞 Toit{prep_food: ✓}]
    -> category_food

+ [🔥 Soojus{prep_heat: ✓}]
    -> category_heat

+ [🔦 Valgus{prep_light: ✓}]
    -> category_light

+ [📻 Info{prep_info: ✓}]
    -> category_info

+ [💊 Ravimid{prep_medication: ✓}]
    -> category_medication

+ {(shop_water || shop_food || shop_batteries || shop_meds || shop_warm || shop_flashlight || shop_powerbank || shop_headlamp || shop_lantern || shop_matches) && not shop_visited} [🛒 Mine poodi]
    -> go_to_store

+ [Ettevalmistused tehtud - oota tormi]
    -> preparation_complete


// ============================================
// VESI KATEGOORIA
// ============================================
=== category_water ===
# CLEAR

{water_quiz_done && prep_water == 0:
    -> water_containers_intro
}

Oled köögis, vaatad kraani.

{
    - prep_water == 0:
        Praegu vesi veel tuleb, aga kui elekter läheb ära, ei tööta elektripump. Peaksid vett varuma.
    - prep_water == 1:
        Oled natuke vett kogunud, aga võib-olla mitte piisavalt.
    - else:
        Oled täitnud piisavalt anumaid. Sellest peaks mitmeks päevaks jätkuma.
}

+ {prep_water == 0 && !water_quiz_done} [Arvuta välja, kui palju vett vaja läheb]
    -> water_calculation

+ {prep_water > 0} [Täida kraanist veel anumaid]
    -> water_containers

+ [← Tagasi]
    -> preparation_hub

// ============================================
// VEEARVUTUSE VIKTORIIN
// ============================================
=== water_calculation ===
# CLEAR

Enne anumade täitmist pead välja arvutama, kui palju vett vaja läheb.

Sinu majapidamises on {family_size} {family_size == 1: inimene | inimest}. Torm võib kesta kuni 3 päeva.

Mõtle, kui palju inimene päevas tavaliselt vajab — seejärel arvuta kõigi peale kokku.

Kui palju vett peaksid varuma?

<span class="note-hint">🗒️ Kirjuta vastus üles — sul võib seda hiljem vaja minna.</span>

+ [9 liitrit]
    -> water_calc_wrong_low

+ [12 liitrit]
    -> water_calc_wrong_low

+ [18 liitrit]
    -> water_calc_correct

+ [24 liitrit]
    -> water_calc_wrong_high

=== water_calc_wrong_low ===
# CLEAR

<b>Mitte päris.</b>

Sellest ei piisa, et {family_size} {family_size == 1: inimene | inimest} 3 päeva üle elaks.

Soovitatav kogus on 3 liitrit inimese kohta päevas — seega 3L × {family_size} {family_size == 1: inimene | inimest} × 3 päeva = <b>vähemalt {water_target} liitrit.</b>

+ [Proovi uuesti]
    -> water_calculation

=== water_calc_wrong_high ===
# CLEAR

<b>See on rohkem kui miinimum — see pole tingimata halb.</b>

Miinimum on 3L × {family_size} {family_size == 1: inimene | inimest} × 3 päeva = <b>{water_target} liitrit.</b>

Lisavesi ei ole kunagi probleem, aga veendu, et vähemalt miinimum on olemas.

+ [Jätka]
    -> water_containers_intro

=== water_calc_correct ===
# CLEAR

<b>Õige!</b>

3L × {family_size} {family_size == 1: inimene | inimest} × 3 päeva = <b>{water_target} liitrit.</b>

See on joogiks vajalik miinimum. Rohkem on alati parem, kui aega on.

+ [Jätka]
    -> water_containers_intro

// ============================================
// VEEKONTEINERID
// ============================================
=== water_containers_intro ===
# CLEAR

{water_home_measured > 0:
    Leidsid kodus juba <b>{water_home_measured} liitrit</b> — see on hea algus.
- else:
    Kontrollid iga kappi ja riiulit. Midagi pole. Alustad nullist.
}

+ [Hakka koguma]
    -> water_containers

=== water_added_to_list ===
# CLEAR

~ shop_water_amount = water_target - water_collected
{shop_water_amount < 0:
    ~ shop_water_amount = 0
}

Paned endale meelde: <b>osta poest {shop_water_amount}L pudelivett.</b>

Sul on kodus {water_collected}L — pood katab ülejäänu.

+ [Jätka]
    -> water_containers

=== water_containers ===
# CLEAR

{shop_water:
    ~ shop_water_amount = water_target - water_collected
    {shop_water_amount < 0:
        ~ shop_water_amount = 0
    }
}

<b>Kogutud vett: {water_collected}L / {water_target}L eesmärk</b>

{water_home_measured > 0: ✓ Kodus leitud vesi ({water_home_measured}L)}
{water_bottles: ✓ Pudelid täidetud kraanist (4L)}
{water_pots: ✓ Keedupotid (6L)}
{water_bathtub: ✓ Vann (mittejoodav)}

+ {not water_bottles} [🚰 Täida tühjad pudelid kraanist (4L) — 5 min]
    ~ water_bottles = true
    ~ water_collected = water_collected + 4
    ~ current_time = current_time + 5
    -> water_container_result_bottles

+ {not water_pots} [🍲 Täida keedupotid kaantega (6L) — 8 min]
    ~ water_pots = true
    ~ water_collected = water_collected + 6
    ~ current_time = current_time + 8
    -> water_container_result_pots

+ {not water_bathtub} [🛁 Täida vann — 10 min]
    ~ water_bathtub = true
    ~ current_time = current_time + 10
    -> water_container_result_bathtub

+ {not shop_water} [🛒 Lisa pudelivesi ostunimekirja]
    ~ shop_water = true
    ~ shop_water_amount = water_target - water_collected
    {shop_water_amount < 0:
        ~ shop_water_amount = 0
    }
    -> water_added_to_list

+ [✓ Vee kogumine lõpetatud]
    -> water_complete

=== water_container_result_bottles ===
# CLEAR

Kogud köögist tühjad pudelid kokku ja täidad need kraanist.

<b>+4 liitrit</b>

Lihtne kanda ja valada — ideaalne joogiveeks. Sulge need tihedalt, et vesi puhas püsiks.

+ [Jätka]
    -> water_containers

=== water_container_result_pots ===
# CLEAR

Täidad suured keedupotid ja katad need kaantega.

<b>+6 liitrit</b>

Neist on raskem valada ja nad võtavad lauapinda, aga hädaolukorras on need usaldusväärne viis lisavett hoida.

+ [Jätka]
    -> water_containers

=== water_container_result_bathtub ===
# CLEAR

Sulgid vanni äravoolu ja lased selle täituda.

<b>+50 liitrit (mittejoodav)</b>

See vesi pole joomiseks — aga see on kasulik tualeti loputamiseks ja käte pesemiseks. Tark käik igas hädaolukorras.

+ [Jätka]
    -> water_containers

=== water_complete ===
# CLEAR

{
    - water_collected >= water_target:
        ~ prep_water = 2
        <b>Hästi tehtud!</b>

        Oled kogunud {water_collected} liitrit joogivett — see katab {water_target}L, mida {family_size} inimest 3 päevaks vajavad.

    - water_collected > 0 && shop_water:
        ~ prep_water = 1
        <b>Sul on kodus praegu {water_collected}L.</b>

        Lisasid pudelivee ostunimekirja — käi poes, et varusid täiendada.

    - water_collected > 0:
        ~ prep_water = 1
        <b>Oled kogunud {water_collected} liitrit.</b>

        See on vähem kui soovitatav {water_target}L, aga midagi see on.

    - else:
        Sa ei kogunud üldse vett. See võib probleemiks saada...
}

<b>Pea meeles:</b>
• Vähemalt 3 liitrit inimese kohta päevas
• Täida anumad ENNE elektrikatkestust
• Vannivesi sobib pesemiseks, mitte joomiseks

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// POETÜKKIMINE
// ============================================
=== go_to_store ===
# CLEAR
# STORE_SHOPPING

~ current_time = current_time + 35
~ shop_visited = true

Haarad mantli ja suundud lähimasse poodi. Tuul tugevneb juba.

Pood on rahvast täis — teistel oli sama mõte.

* [Jätka]
    -> grocery_checkout


// ============================================
// TOIDU KATEGOORIA
// ============================================
=== category_food ===
# CLEAR

Mõtled toiduvarude peale.

{
    - prep_food == 0:
        Kui elekter läheb ära, ei tööta külmkapp ega pliit. Vajad toitu, mida saab kohe süüa.
    - prep_food == 1:
        Oled köögist mõned põhiasjad kokku kogunud. Ehk piisab päevaks-kaheks.
    - else:
        Sul on korralikud hädaolukorra toiduvarud.
}

+ {prep_food == 0} [🔍 Vaata, mis köögis on (10 min)]
    ~ prep_food = 1
    ~ current_time = current_time + 10
    -> food_kitchen_result

+ {not shop_food} [🛒 Lisa hädaolukorra toit ostunimekirja]
    ~ shop_food = true
    ~ prep_food = 1
    -> food_added_to_list

+ [← Tagasi]
    -> preparation_hub

=== food_kitchen_result ===
# CLEAR
# PANTRY_CHECK

{pantry_use_first_count > 0:
    Mõned asjad ei pea tormi vastu — söö need esimesena.
}

{
    - pantry_gaps_count == 0:
        Sinu köök katab põhilise. Poeskäik ei tee siiski paha.
    - pantry_gaps_count == 1:
        Märkad <b>1 puuduse</b>, mille saaks poest täita.
    - else:
        Märkad <b>{pantry_gaps_count} puudust</b>, mille saaks poest täita.
}

+ {pantry_gaps_count > 0 && not shop_food} [🛒 Lisa puuduvad asjad ostunimekirja]
    ~ shop_food = true
    -> food_added_to_list

+ {pantry_gaps_count == 0 && not shop_food} [🛒 Osta poest siiski lisa, igaks juhuks]
    ~ shop_food = true
    -> food_added_to_list

+ [✓ Toiduga valmis — tagasi ettevalmistustesse]
    -> preparation_hub

=== food_added_to_list ===
# CLEAR

Lisad <b>hädaolukorra toidu</b> ostunimekirja.

Valid poes õiged asjad — sellised, mis ei vaja külmkappi ega küpsetamist.

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== grocery_checkout ===
# CLEAR

Maksad ja kiirustad varudega koju. Tuul tugevneb.

{shop_water:
    Ostsid <b>{shop_water_amount}L vett</b> — see täiendab sinu varusid.
}

{shop_batteries:
    Haarasid kaasa <b>uued patareid</b> taskulambi ja raadio jaoks.
}

{shop_flashlight:
    Võtsid kaasa <b>korraliku taskulambi</b> — üks valgus, mida tasub omada üle kõige.
}

{shop_powerbank:
    Haarasid <b>akupanga</b>, et hoida telefon katkestuse ajal elus.
}

{shop_headlamp || shop_lantern:
    Lisasid {shop_headlamp && shop_lantern: <b>pealambi ja laterna</b>|{shop_headlamp: <b>pealambi</b>|<b>laterna</b>}}, et valgustus oleks terviklik.
}

{shop_matches:
    Haarasid <b>tikud</b>, et su küünlad poleks kasutud.
}

{shop_warm:
    Haarasid <b>lisatekid ja soojad tarbed</b>, et külmadel öödel rohkem sooja kinni püüda.
}

{shop_meds:
    Põikad ka apteeki ja täiendad <b>ravimeid</b>, mille märkisid — aegunud asendatud, vähesed juurde ostetud.
}

{food_canned || food_crackers || food_nuts || food_energy_bars || food_chocolate || food_longlife_bread || food_honey_jam:
    <b>Head valikud!</b> Valisid toidu, mis ei vaja külmkappi ega küpsetamist — ideaalne hädaolukorraks.
}

{food_dried:
    Haarasid kaasa kuivtoidu — pasta ja riis säilivad kaua, aga pea meeles, et ilma elektrita ei pruugi saada süüa teha. Helbed sobivad aga hästi!
}

{not food_canned && not food_crackers && not food_nuts && not food_energy_bars && not food_chocolate && not food_longlife_bread && not food_honey_jam && not food_dried && shop_food:
    Sa ei hakanud eriti kasulikku toitu kaasa. Loodetavasti piisab sellest, mis köögis on...
}

<b>Pea meeles päris hädaolukordadeks:</b>
• Konservid (liha, kala, köögivili, puuvili)
• Kreekerid, küpsised, pikasäilivusega leib
• Pähklid, kuivatatud puuviljad, energiabatoonid
• Šokolaad, mesi, moos
• Väldi kõike, mis vajab külmkappi või küpsetamist!

<b>Kulunud aeg: 35 minutit</b>

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// SOOJUSE KATEGOORIA
// ============================================
VAR heat_sealed = false
VAR heat_one_room = false
VAR heat_stove = false
VAR heat_pipes = false
VAR heat_clothing = false

=== category_heat ===
# CLEAR
{not home_setup_done:
    # HOME_SETUP
}

{
    - prep_heat == 0:
        Mõtled ette — kui elekter läheb ära, {home_heating == "electric": sureb su elektriküte täielikult|{home_heating == "wood_gas": maja jahtub, kui sa ahju ei köeta|seiskub kaugkütte pump ja radiaatorid jahtuvad}}. Väljas on {temperature}°C.

        Mis on kõige tähtsam teha ESIMESENA?

        + [Tihenda maja — sulge aknad, ventilatsioon, blokeeri tuuletõmme]
            -> heat_quiz_right

        + [Keera küte kohe maksimaalseks]
            -> heat_quiz_wrong

        + [Ava aknad, et värsket õhku saada]
            -> heat_quiz_wrong

    - else:
        Oled maja külma jaoks ette valmistanud.
}

+ {prep_heat > 0} [Jätka ettevalmistamist]
    -> heat_hub

+ [← Tagasi]
    -> preparation_hub

=== heat_quiz_right ===
# CLEAR

<b>Õige!</b>

Kui küte seiskub, on esimene prioriteet sooja hoidmine sees. Sulge ventilatsioon, tihenda aknad, blokeeri tuuletõmme uste all.

Nüüd valmistame maja ette.

+ [Jätka]
    -> heat_hub

=== heat_quiz_wrong ===
# CLEAR

<b>Mitte päris.</b>

Kütte keeramine või akende avamine ei aita, kui elekter on ära. Esimene prioriteet on <b>maja tihendamine</b> — sulge ventilatsioon, sulge aknad, blokeeri tuuletõmme. Hoia soe õhk SEES.

+ [Jätka]
    -> heat_hub

=== heat_hub ===
# CLEAR
# HEAT_HUB

~ prep_heat = 1

<b>Soojuse ettevalmistused:</b>
{heat_sealed: ✓ Aknad ja ventilatsioon tihendatud}
{heat_one_room: ✓ Soe tuba seatud}
{heat_stove: ✓ Puuahi valmis}
{heat_pipes: ✓ Torud isoleeritud}
{heat_clothing: ✓ Soojad riided kogutud}

Mida soovid teha?

+ {not heat_sealed} [🪟 Tihenda aknad ja ventilatsioon — 3 min]
    ~ heat_sealed = true
    ~ current_time = current_time + 3
    -> heat_result_sealed

+ {not heat_one_room && has_elderly} [🚶 Vii {elderly_relation} elutuppa — 3 min]
    ~ heat_one_room = true
    ~ current_time = current_time + 3
    -> heat_result_one_room

+ {not heat_one_room && not has_elderly} [🛋️ Sea üles soe tuba — 3 min]
    ~ heat_one_room = true
    ~ current_time = current_time + 3
    -> heat_result_one_room

+ {not heat_stove} [🪵 Valmista puuahi ette ja too puid — 10 min]
    ~ heat_stove = true
    ~ current_time = current_time + 10
    -> heat_result_stove

+ {not heat_pipes} [🔧 Isoleeri veetorud — 3 min]
    ~ heat_pipes = true
    ~ current_time = current_time + 3
    -> heat_result_pipes

+ {not heat_clothing} [🧥 Kogu soojad riided ja tekid — 3 min]
    ~ heat_clothing = true
    ~ current_time = current_time + 3
    -> heat_result_clothing

+ {not shop_warm} [🛒 Lisa tekid ja soojad tarbed ostunimekirja]
    ~ shop_warm = true
    -> heat_added_to_list

+ [✓ Soojusega valmis]
    -> heat_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== heat_added_to_list ===
# CLEAR

Lisad <b>lisatekid ja soojad tarbed</b> oma ostunimekirja — rohkem kihte tähendab rohkem kinnipüütud sooja, kui see peab kaua vastu pidama.

+ [← Tagasi soojuse juurde]
    -> heat_hub

=== heat_result_sealed ===
# CLEAR

Lülitad sundventilatsiooni välja, sulged kõik aknad ja topid rätikud tuuletõmbeavade alla uste juures.

<b>Iga tihendatud pilu hoiab väärtuslikku soojust sees.</b>

+ [Jätka]
    -> heat_hub

=== heat_result_one_room ===
# CLEAR

{has_elderly:
    Sead {elderly_relation} jaoks elutuppa mugava koha — padjad, tekk, ravimid käeulatuses. Sulged kõigi teiste tubade uksed.
- else:
    Sead elutoa soojaks toaks — sulged kõigi teiste tubade uksed, et soojust koondada.
}

<b>Ühte tuba on lihtsam soojendada ja iga inimene annab kehhasoojust — koos olemine aitab.</b>

+ [Jätka]
    -> heat_hub

=== heat_result_stove ===
# CLEAR

{home_has_stove:
    Kontrollid korstnasiibrit — see avaneb. Puhstad vana tuha ja tood küünist süles täie puid. Ahi on valmis, et kohe süüdata.

    <b>Kontrolli alati korstnasiibrit enne süütamist. Ära jäta tuld kunagi järelevalveta. Hoia tulekustutustekk lähedal.</b>
- else:
    Sul siin puuahju pole, aga loed põhitõed siiski läbi: kontrolli, et korstnasiiber on puhas ja avaneb, eemalda vana tuhk, hoia kuiv küttepuit lähedal, ära jäta tuld järelevalveta ja hoia tulekustutustekk käepärast.

    <b>Puuahi või kamin on pika voolukatkestuse ajal üks paremaid asju, mida omada — tasub põhitõdesid teada iga koha jaoks, kus võid kunagi viibida.</b>
}

+ [Jätka]
    -> heat_hub

=== heat_result_pipes ===
# CLEAR

{home_has_exposed_pipes:
    Mähid keldris ja välisseina ääres lahtised torud vanade rätikute ja kaltsudega. Pole täiuslik isolatsioon, aga võib ära hoida toru lõhkemise.

    <b>Lõhkenud toru külmunud majas on katastroof katastroofis. Kraanide aeglane tilkumine aitab samuti — liikuv vesi külmub aeglasemalt.</b>
- else:
    Sinu torud kulgevad köetavate seinte sees, nii et maja kaitseb neid juba. Käid mõttes läbi, mida teeksid, kui nii ei oleks — mähiksid need vanade rätikutega ja jätaksid kraanidest aeglase tilkamise, et vesi liikuma jääks.

    <b>Hea teada sugulaste majade, suvekodude või iga koha kohta, kus on lahtised veetorud. Mässitud toru lõhkeb palju vähem tõenäoliselt.</b>
}

+ [Jätka]
    -> heat_hub

=== heat_result_clothing ===
# CLEAR

{has_elderly:
    Kaevad välja villased kampsunid, soojad sokid, {elderly_relation} paksu teki. Soojad riided kõigile, valmis käes.
- else:
    Kaevad välja villased kampsunid, soojad sokid, paksud tekid. Soojad riided valmis.
}

<b>Riietumine kihtidesse: termiline aluspesu, villane/fliis keskmine kiht, tuulekindel pealiskiht. Ära unusta mütsi, kindaid ja pakse sokke.</b>

+ [Jätka]
    -> heat_hub

=== heat_complete ===
# CLEAR

{
    - heat_sealed && heat_one_room && heat_stove && heat_pipes && heat_clothing:
        ~ prep_heat = 2
        <b>Täielikult ettevalmistatud!</b>

        Maja on tihendatud, vanaema on sooja toas, ahi on valmis, torud on isoleeritud ja soojad riided on välja pandud.

    - heat_stove:
        ~ prep_heat = 2
        <b>Hea ettevalmistus.</b>

        Ahi on valmis — see on kõige tähtsam. Oled teinud, mida saad.

    - else:
        ~ prep_heat = 1
        <b>Põhiline ettevalmistus tehtud.</b>

        Oled astunud mõned sammud, aga rohkem saaks teha, et turvaliselt püsida.
}

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// VALGUSE KATEGOORIA
// ============================================
VAR light_flashlight = false
VAR light_batteries = false
VAR light_candles = false
VAR light_headlamp = false
VAR light_lantern = false
VAR light_powerbank = false
VAR light_rationing = false

// Määratud React LightAudit ülekatte poolt
VAR light_audit_done = false
VAR owns_flashlight = false
VAR owns_headlamp = false
VAR owns_lantern = false
VAR owns_candles = false
VAR owns_matches = false
VAR owns_powerbank = false

// Kus taskulampi hoitakse: -1 otsustamata, 0 mitte kusagil/sahtlis, 1 esikus, 2 öökapil
VAR flashlight_spot = -1
// Öine pimedusotsing kriisis (React FlashlightSearch ülekate)
VAR flashlight_search_done = false
VAR search_seconds = 0
VAR search_found = false
VAR search_known_spot = false
// Tõene, kui öö möödus telefoni kui ainsa valgusallikaga — tühjendab selle kriisikõneks
VAR phone_drained = false

=== category_light ===
# CLEAR
{not light_audit_done:
    # LIGHT_AUDIT
}

{
    - prep_light == 0:
        Elekter võib iga hetk ära minna, kui torm pihta hakkab. Oled täielikus pimeduses.

        Mis on kõige turvalisem, mille järele haarata, kui tuled kustuvad?

        + [Telefoni taskulamp]
            -> light_quiz_phone

        + [Küünal]
            -> light_quiz_candle

        + [Taskulamp kindlast kohast]
            -> light_quiz_right

    - else:
        Oled valgusallikad ette valmistanud.
}

+ {prep_light > 0} [Jätka ettevalmistamist]
    -> light_hub

+ [← Tagasi]
    -> preparation_hub

=== light_quiz_phone ===
# CLEAR

<b>Mitte ideaalne.</b>

Telefoni taskulamp töötab, aga see tühjendab akut kiiresti — ja seda akut läheb vaja hädaabikõnedeks. Hoia telefon side jaoks.

<i>Parem lahendus: hoia eraldi taskulamp kohas, mida kõik teavad.</i>

+ [Jätka]
    -> light_hub

=== light_quiz_candle ===
# CLEAR

<b>Riskantne.</b>

Pimedas küünla ja tikkude otsimine on tuleohtlik. Lahtine leek pimedas, tundmatus olukorras võib viia õnnetuseni.

<i>Parem lahendus: haara esmalt taskulamp. Kasuta küünlaid ainult varuplaanina ja ära jäta neid kunagi järelevalveta.</i>

+ [Jätka]
    -> light_hub

=== light_quiz_right ===
# CLEAR

<b>Õige!</b>

Taskulamp on turvaline, kohene ja ei tühjenda telefoni akut. Hoia seda kohas, mida kõik majas teavad — et leiad selle ka pimedas.

+ [Jätka]
    -> light_hub

=== light_hub ===
# CLEAR
# LIGHT_HUB

~ prep_light = 1

<b>Valguse ettevalmistus:</b>
{light_flashlight: ✓ Taskulamp korras}
{light_batteries: ✓ Uued patareid}
{light_headlamp: ✓ Käed-vabad valgus valmis}
{light_lantern: ✓ Ruumivalgus valmis}
{light_candles: ✓ Küünlad valmis (varuks)}
{light_powerbank: ✓ Akupank laetud}
{light_rationing: ✓ Plaan, kuidas see vastu peaks}

Mida soovid teha?

// TASKULAMP — kui omad, otsi ja paiguta; kui ei, lisa ostunimekirja
+ {not light_flashlight && owns_flashlight} [🔦 Otsi taskulamp ja kontrolli — 3 min]
    ~ light_flashlight = true
    ~ current_time = current_time + 3
    -> light_result_flashlight

+ {not light_flashlight && not owns_flashlight && not shop_flashlight} [🛒 Lisa taskulamp ostunimekirja]
    ~ shop_flashlight = true
    -> light_shop_flashlight

// PATAREID — alles siis, kui on taskulamp, mida toita
+ {light_flashlight && not light_batteries && not shop_batteries} [🔋 Otsi varupatareisid kodust — 3 min]
    ~ current_time = current_time + 3
    -> light_result_search_batteries

+ {light_flashlight && not light_batteries && not shop_batteries} [🛒 Lisa patareid ostunimekirja]
    ~ shop_batteries = true
    -> light_result_shop_batteries

// PEALAMP
+ {not light_headlamp && owns_headlamp} [💡 Pane välja käed-vabad valgus — 3 min]
    ~ light_headlamp = true
    ~ current_time = current_time + 3
    -> light_result_headlamp

+ {not light_headlamp && not owns_headlamp && not shop_headlamp} [🛒 Lisa pealamp ostunimekirja]
    ~ shop_headlamp = true
    -> light_shop_headlamp

// LATERN
+ {not light_lantern && owns_lantern} [🏮 Sea üles ruumivalgus — 3 min]
    ~ light_lantern = true
    ~ current_time = current_time + 3
    -> light_result_lantern

+ {not light_lantern && not owns_lantern && not shop_lantern} [🛒 Lisa latern ostunimekirja]
    ~ shop_lantern = true
    -> light_shop_lantern

// KÜÜNLAD (varuks) — sea välja, kui on; lisa tikud, kui muidu kasutud
+ {not light_candles && owns_candles} [🕯️ Sea küünlad välja — 3 min]
    ~ light_candles = true
    ~ current_time = current_time + 3
    -> light_result_candles

+ {owns_candles && not owns_matches && not shop_matches} [🛒 Lisa tikud/välgumihkel ostunimekirja]
    ~ shop_matches = true
    -> light_shop_matches

// AKUPANK — lae olemasolev või lisa nimekirja
+ {not light_powerbank && owns_powerbank} [🔌 Lae telefoni jaoks akupank — 2 min]
    ~ light_powerbank = true
    ~ current_time = current_time + 2
    -> light_result_powerbank

+ {not owns_powerbank && not shop_powerbank} [🛒 Lisa akupank ostunimekirja]
    ~ shop_powerbank = true
    -> light_shop_powerbank

+ {not light_rationing} [🔆 Planeeri, kuidas valgus vastu peaks — 2 min]
    ~ light_rationing = true
    ~ current_time = current_time + 2
    -> light_result_rationing

+ [✓ Valgusega valmis]
    -> light_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== light_shop_flashlight ===
# CLEAR
Lisad <b>korraliku taskulambi</b> oma ostunimekirja — kõige olulisem valgus, mida omada, võimalusel üks inimese kohta.
+ [← Tagasi valguse juurde]
    -> light_hub

=== light_shop_headlamp ===
# CLEAR
Lisad <b>pealambi</b> oma ostunimekirja — käed-vabad valgus toiduvalmistamiseks, esmaabiks või lapse kandmiseks pimedas.
+ [← Tagasi valguse juurde]
    -> light_hub

=== light_shop_lantern ===
# CLEAR
Lisad <b>laterna</b> oma ostunimekirja — üks ruumivalgus täidab kogu toa, et pere saaks koos püsida.
+ [← Tagasi valguse juurde]
    -> light_hub

=== light_shop_matches ===
# CLEAR
Lisad <b>tikud või välgumihkli</b> oma ostunimekirja — ilma nendeta on need küünlad lihtsalt vaha.
+ [← Tagasi valguse juurde]
    -> light_hub

=== light_shop_powerbank ===
# CLEAR
Lisad <b>akupanga</b> oma ostunimekirja — laetud akupank hoiab alertide ja kõnede jaoks vajaliku telefoni päevi elus.
+ [← Tagasi valguse juurde]
    -> light_hub

=== light_result_flashlight ===
# CLEAR

Leiad taskulambi esikukapi seest ja vajutad sisse — kiir on nõrk ja kollakas.

<b>Patareid on peaaegu tühjad.</b> Mõnda aega töötab, aga öö üle ei pea. Vajad uusi patareisid.

Nüüd otsusta, kus see asub — et leiad selle hetkel, kui tuled kustuvad.

+ [🛏️ Öökapil — voodist käeulatuses]
    ~ flashlight_spot = 2
    -> light_spot_result
+ [🚪 Esiku ukse juures]
    ~ flashlight_spot = 1
    -> light_spot_result
+ [🗄️ Viska lihtsalt tagasi kräbusahtlisse]
    ~ flashlight_spot = 0
    -> light_spot_result

=== light_spot_result ===
# CLEAR

{
    - flashlight_spot == 2:
        Paned selle öökapile. Kui elekter öösel kaob, leiab käsi selle enne, kui jalad põrandat puudutavad.

        <b>Parim koht üldse — valgus, mille saad kätte ilma pimedas püsti tõusmata, on see, mis hoiab ära kukkumised.</b>
    - flashlight_spot == 1:
        Jätad selle esiku riiulile ukse juurde, kust kogu pere möödub ja kõik selle üles leiavad.

        <b>Jagatud, teadaolev koht on parem kui peidetud. Veel parem, kui hoiad teist valgust voodi juures.</b>
    - else:
        Pillad selle tagasi kräbusahtlisse teibi ja vanade juhtmete sekka.

        <b>Silmist, südamest — päris elektrikatkestuse ajal tuhniksid pilkases pimeduses prügi seas. Vali üks koht, mida kõik teavad.</b>
}

+ [Jätka]
    -> light_hub

=== light_result_search_batteries ===
# CLEAR

Tuhnid köögi sahtlites ja esiku kräbukarpi...

~ light_batteries = true

Leiad pakikese AA-patareisid, mis on peidetud vana teibi taha. Näevad kasutamata välja — vahetad need sisse ja kiir on ere ja tugev.

<b>Patareitarkus: tea, milliseid suurusi su seadmed kasutavad (enamik lampe on AA või AAA), hoia varupakk igast ja vaheta vana varu välja, et see poleks vajaduse hetkel tühi.</b>

+ [Jätka]
    -> light_hub

=== light_result_shop_batteries ===
# CLEAR

Lisad <b>patareid</b> ostunimekirja — õiged suurused taskulambile ja teistele seadmetele.

<b>Osta varupakk igast suurusest, mida su seadmed kasutavad, ja kontrolli kuupäevi, et ei hoiaks juba pooltühje patareisid.</b>

+ [Jätka]
    -> light_hub

=== light_result_headlamp ===
# CLEAR

{owns_headlamp:
    Otsid välja pealambi, kontrollid, et see töötab, ja jätad selle taskulambi kõrvale.
- else:
    Sul pole veel pealampi, aga paned tähele — isegi odav tasub end ära.
}

<b>Pealamp jätab mõlemad käed vabaks — toidu valmistamiseks, esmaabiks, asjade parandamiseks või lapse kandmiseks pimedas. Kui see kord olemas, on see tavaliselt esimene lamp, mille järele haarad.</b>

+ [Jätka]
    -> light_hub

=== light_result_lantern ===
# CLEAR

{owns_lantern:
    Paned latern köögilauale, kus see valgustab kogu tuba.
- else:
    Sul pole laternat, aga paned tähele, kui kasulik see oleks. Hädas annab taskulamp veeklaasis seistes või valge lae poole suunatuna pehmema, kogu tuba katva kuma.
}

<b>Kaks valgusliiki teevad kaht tööd: taskulamp või pealamp on punktkiir liikumiseks ja töödeks; latern on ruumivalgus, mis täidab toa, et kogu pere saaks koos istuda. Püüa omada mõlemat.</b>

+ [Jätka]
    -> light_hub

=== light_result_candles ===
# CLEAR

Kogud majast küünlad kokku ja leiad köögisahtlist tikud. Paned need stabiilsetele, vabadele pindadele elutuppa ja kööki.

<b>Küünlad on varuvalgus, mitte põhiplaan — lahtine leek on üks sagedasi tulekahju põhjusi elektrikatkestuste ajal. Ära jäta põlevat küünalt kunagi järelevalveta ega kardinate, paberi lähedale või sinna, kus laps või lemmikloom selle ümber lükkab, ja kustuta kõik enne magamaminekut.</b>

+ [Jätka]
    -> light_hub

=== light_result_powerbank ===
# CLEAR

Laed akupanga täis ja jätad selle laadimisjuhtmega ukse juurde. Samal ajal laed kõik teised seadmed 100%-ni — elekter on praegu veel olemas.

<b>Su telefon on su elujoon hoiatuste ja hädaabikõnede jaoks. Laetud akupank hoiab seda päevi elus — lae kõik enne tormi täis.</b>

+ [Jätka]
    -> light_hub

=== light_result_rationing ===
# CLEAR

Mõtled tänasest ööst kaugemale — elekter võib olla väljas kolm päeva, mitte kolm tundi.

Teed plaani: kasuta <b>madalaimat heledust</b>, mis on piisav, valgusta <b>ainult tuba, kus oled</b>, ja lülita välja kohe, kui lahkud. Akunäljased tööd — toidu valmistamine, vee toomine, koristamine — teed <b>seni, kuni veel päevavalgus on</b>, hoides valgustid pimeda jaoks.

<b>Valgusallikas on väärt vaid niikaua, kui see vastu peab. Säästmine võib muuta ühe öö elektri kolmeks.</b>

Varuks, mis kunagi tühjaks ei saa, paned tähele kaht võimalust: su <b>auto saab telefone laadida</b> USB-pesa kaudu ja <b>vända- või päikesevalgusti</b> ei vaja patareisid üldse. Ja hoiad valgust mitmes kohas — magamistoas, köögis ja väljapääsu juures.

+ [Jätka]
    -> light_hub

=== light_complete ===
# CLEAR

{
    - light_flashlight && (light_batteries || shop_batteries) && (light_headlamp || light_lantern) && light_powerbank && light_rationing:
        ~ prep_light = 2
        <b>Täielikult ettevalmistatud!</b>

        Taskulamp uute patareidega, käed-vabad või ruumivalgus, laetud akupank — ja plaan, kuidas see kõik kolm ööd vastu peaks. Pimedus ei üllata sind.

    - light_flashlight && (light_batteries || shop_batteries) && (light_headlamp || light_lantern) && light_powerbank:
        ~ prep_light = 2
        <b>Hästi ettevalmistatud!</b>

        Taskulamp uute patareidega, käed-vabad või ruumivalgus valmis ja laetud akupank telefonile. Üks asi jääb veel mõelda: kuidas panna see kõik vastu pidama kolm ööd, mitte kolm tundi.

    - light_flashlight && (light_batteries || shop_batteries):
        ~ prep_light = 2
        <b>Hea ettevalmistus.</b>

        Toimiv taskulamp koos toitega on selle tuum. Pealamp, latern ja laetud akupank teeksid pildi täielikuks.

    - light_flashlight:
        <b>Põhiline ettevalmistus.</b>

        Sul on taskulamp, aga {light_batteries == false && not shop_batteries: patareid on nõrgad — sea see enne tormi korda.}{light_batteries || shop_batteries: ka varuvalgus kuluks ära.}

    - else:
        <b>Sa pole veel valgusallikat korraldanud.</b>

        Ilma usaldusväärse valguseta on pimedas majas liikumine ohtlik.
}

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// INFO KATEGOORIA
// ============================================
VAR info_radio = false
VAR info_radio_batteries = false
VAR info_phone_charged = false
VAR info_contact_plan = false
// Määratud React RumorSort ülekatte poolt
VAR info_drill_done = false
VAR info_drill_score = 0

=== category_info ===
# CLEAR
{not info_drill_done:
    -> info_drill
}

{
    - prep_info == 0:
        Kui elekter läheb ära, kaotad Wi-Fi, TV ja lõpuks ka telefonilevi. Kuidas sa infot saad?

        Telefoni aku on 70%. Elekter võib iga hetk ära minna. Mis on parim viis tormi ajal uudiseid jälgida?

        + [Vaata pidevalt sotsiaalmeediast telefonist]
            -> info_quiz_social

        + [Lülita sisse patareidega raadio]
            -> info_quiz_right

        + [Helista sõbrale ja küsi, mis toimub]
            -> info_quiz_call

    - else:
        Oled oma sideplaani üles seadnud.
}

+ {prep_info > 0} [Jätka ettevalmistamist]
    -> info_hub

+ [← Tagasi]
    -> preparation_hub

=== info_quiz_social ===
# CLEAR

<b>Halb mõte.</b>

Sotsiaalmeedia kerimine tühjendab telefoni akut kiiresti. Ja kui mobiilimast kukub, pole internetti üldse. Seda akut läheb vaja hädaabikõnedeks.

<i>Parem lahendus: patareidega raadio ei vaja internetti ega telefonilevi. See võtab vastu hädaolukorra teated otse.</i>

+ [Jätka]
    -> info_hub

=== info_quiz_right ===
# CLEAR

<b>Õige!</b>

Patareidega raadio töötab ilma interneti, telefonilevi ja elektrita. See on sinu eluliin ametlike hädaolukorra uudiste ja juhiste jaoks.

+ [Jätka]
    -> info_hub

=== info_quiz_call ===
# CLEAR

<b>Mitte ideaalne.</b>

Telefonikõned kulutavad akut ja sinu sõber teab ilmselt sama palju kui sina. Kriisis hoia telefoni akut hädaabikõnede jaoks — 112, 1220, 1247.

<i>Parem lahendus: kasuta patareidega raadiot uudiste jaoks. Hoia telefon selleks ajaks, kui seda tõesti vaja läheb.</i>

+ [Jätka]
    -> info_hub

=== info_hub ===
# CLEAR

~ prep_info = 1

{info_radio: ✓ Raadio leitud}
{info_radio_batteries: ✓ Raadio patareid}
{info_phone_charged: ✓ Telefon laetud ja valmis}
{info_drill_done: ✓ Harjutasid kuulujuttude äratundmist}
{info_contact_plan: ✓ Sidepidamise plaan kokku lepitud}

+ {not info_radio} [📻 Otsi patareiraadio — 3 min]
    ~ info_radio = true
    ~ current_time = current_time + 3
    -> info_result_radio

+ {info_radio && not info_radio_batteries && not shop_batteries} [🔋 Otsi varupatareisid — 3 min]
    ~ current_time = current_time + 3
    -> info_result_search_batteries

+ {info_radio && not info_radio_batteries && not shop_batteries} [🛒 Lisa patareid ostunimekirja]
    ~ shop_batteries = true
    -> info_result_shop_batteries

+ {not info_phone_charged} [📱 Lae telefon ja lülita energiasääst sisse — 2 min]
    ~ info_phone_charged = true
    ~ current_time = current_time + 2
    -> info_result_phone

+ {not info_contact_plan} [📋 Leppige kokku, kuidas üksteiseni jõuda — 2 min]
    ~ info_contact_plan = true
    ~ current_time = current_time + 2
    -> info_result_contact_plan

+ [✓ Infoga valmis]
    -> info_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== info_drill ===
# CLEAR
# RUMOR_SORT
-> info_drill_result

=== info_drill_result ===
# CLEAR

{
    - info_drill_score >= 5:
        <b>Terav silm.</b> Erisid ametlikud hoiatused paanikast peaaegu eksimatult.
    - info_drill_score >= 3:
        <b>Pole paha.</b> Tabasid enamiku kuulujuttudest — paar libises läbi.
    - else:
        <b>Keeruline, eks?</b> Mitu kuulujuttu pääses läbi. Päris kriisis just nii paanika levibki.
}

Reegel, mis peab: <b>usalda ametlikke allikaid, kontrolli kõike kinnitamata enne tegutsemist ja ära kunagi edasta seda, mille taga sa seista ei saa.</b> Rahulik pea on osa valmisolekust.

+ [Jätka]
    -> category_info

=== info_result_radio ===
# CLEAR

Tuhnid esikukapis ja leiad vana patareiraadio. Keerad nuppu — kõigepealt staatiline müra, siis nõrgad hääled. Hädaolukorra teade tuleb ikka läbi.

<b>Patareid on aga nõrgad. Ehk peab vastu paar tundi.</b>

Raadio on su elujoon, kui internet ja mobiililevi kaovad. Eestis edastatakse ametlikku hädainfot <b>Vikerraadios</b>, lisaks <b>EE-ALARM</b> hoiatused telefoni ja uuendused <b>kriis.ee</b> lehel — tasub teada, kuhu pöörduda, enne kui vaja läheb.

+ [Jätka]
    -> info_hub

=== info_result_search_batteries ===
# CLEAR

~ info_radio_batteries = true

Kontrollid köögisahtlit — seal on raadiosse sobivad patareid. Vahetad need sisse ja testid.

<b>Selge signaal. Raadio on valmis.</b>

+ [Jätka]
    -> info_hub

=== info_result_shop_batteries ===
# CLEAR

Lisad <b>patareid</b> ostunimekirja. Uued patareid poest katavad nii taskulambi kui raadio vajaduse.

+ [Jätka]
    -> info_hub

=== info_result_phone ===
# CLEAR

Paned telefoni laadima, kuni elekter veel on.

Laadimise ajal lülitad sisse energiasäästurežiimi ja sulged taustarakendused.

<b>Nõuanded kriisiks:</b>
• Lülita Wi-Fi, Bluetooth ja asukoht välja, kui pole vaja
• Vähenda ekraani heledust
• Kasuta telefoni ainult hädaabikõnedeks
• Pea meeles — sa kirjutasid hädaabinumbrid üles, eks? Kui telefon tühjeneb, on see paber sinu varuplaan.

+ [Jätka]
    -> info_hub

=== info_result_contact_plan ===
# CLEAR

Võtad kaks minutit, et leppida kokku, kuidas püsite ühenduses, kui torm teid lahutab või võrk ummistub.

<b>Teie plaan:</b>
• <b>Saada sõnum, ära helista</b> — lühikesed sõnumid jõuavad kohale ka siis, kui ülekoormatud võrk kõnesid blokeerib, ja kulutavad palju vähem akut.
• Valige <b>üks väljaspool piirkonda asuv kontakt</b>, kellele kõik sõnumi saadavad ja kes uudiseid edastab — sageli kergem tabada kui üksteist.
• Leppige kokku lihtne <b>kohtumispaik</b> ja kes keda kontrollib.

Kes täpselt nimekirjas on, sõltub teie perest — oluline on, et kõik teaksid plaani enne, kui seda vaja läheb.

+ [Jätka]
    -> info_hub

=== info_complete ===
# CLEAR

{
    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged && info_drill_done:
        ~ prep_info = 2
        <b>Täielikult ettevalmistatud!</b>

        Raadio patareidega valmis, telefon laetud ja energiasäästurežiimis — ja selge pea, et eristada päris hoiatusi kuulujuttudest. Sa oled informeeritud olenemata olukorrast.

    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged:
        ~ prep_info = 2
        <b>Hästi ettevalmistatud.</b>

        Raadio valmis, telefon laetud. {info_drill_done: | Üks asi jääb: harjuta eristama ametlikke hoiatusi kuulujuttudest, mis kriisis lendavad.}

    - info_radio:
        <b>Põhiline ettevalmistus.</b>

        Sul on raadio, aga {info_radio_batteries == false: patareid on nõrgad — see ei pruugi kaua vastu pidada.}{info_radio_batteries: võiksid ka telefoni laadida, kuni elekter veel on.}

    - else:
        <b>Raadiot ei leitud.</b>

        Ilma raadiota oled täielikult telefoni peale pandud — ja see aku ei kesta igavesti.
}

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// RAVIMITE KATEGOORIA
// ============================================

VAR med_pills_counted = false
VAR med_organized = false
VAR med_first_aid = false
VAR med_fridge = false
VAR med_card = false
// Määratud React CabinetCheck ülekatte poolt
VAR med_cabinet_done = false
VAR med_cabinet_score = 0
VAR med_cabinet_total = 0

=== category_medication ===
# CLEAR
{not med_cabinet_done:
    -> med_cabinet
}

{
    - prep_medication == 0:
        {
            - has_elderly:
                {elderly_relation} võtab iga päev vererõhuravimit. Kui apteegid suletakse, ei saa rohkem hankida.
            - has_children:
                {children_count == 1: Sinu laps võib vajada | Sinu lapsed võivad vajada} palavikualandajat või retseptiravimit.
            - else:
                Kontrolli oma isiklikke ravimeid ja esmaabikomplekti.
        }

        Kriisis võivad apteegid olla päevi suletud. Mida on kõige olulisem hästi varuda?

        + [Valuvaigistid]
            -> med_quiz_pain

        + [Retseptiravimid]
            -> med_quiz_right

        + [Esmaabikomplekt]
            -> med_quiz_firstaid

    - else:
        {has_elderly:
            Oled alustanud {elderly_relation} ravimite ettevalmistamist.
        - else:
            Oled alustanud oma ravimvarude ettevalmistamist.
        }
}

+ {prep_medication > 0} [Jätka ettevalmistamist]
    -> medication_hub

+ [← Tagasi]
    -> preparation_hub

=== med_cabinet ===
# CLEAR
# MED_CABINET
-> med_cabinet_result

=== med_cabinet_result ===
# CLEAR

~ med_pills_counted = true
~ med_first_aid = true

{
    - med_cabinet_score >= med_cabinet_total:
        <b>Terav silm.</b> Märkasid aegunud pakid ja väikese varu probleemideta.
    - med_cabinet_score >= med_cabinet_total - 1:
        <b>Korralik kontroll.</b> Tabasid enamiku — otsus või paar läks mööda.
    - else:
        <b>Tasub lähemalt vaadata.</b> Mõni aegunud või vähene ese libises läbi — kerge märkamata jätta, kerge parandada.
}

{shop_meds: Lüngad on nüüd su ostunimekirjas. }<b>Kontrolli kuupäevi kaks korda aastas, hoia igast retseptiravimist 7-päevane varu ja vii vanad ravimid apteeki — mitte kunagi prügikasti.</b>

+ [Jätka]
    -> category_medication

=== med_quiz_pain ===
# CLEAR

<b>Oluline, aga mitte esimene prioriteet.</b>

Valuvaigistid ja palavikualandajad on kasulikud, aga ilma nendeta saab hakkama. Vanaema vererõhuravim on kriitiline — isegi ühe annuse vahelejätmine võib olla ohtlik.

<i>Kontrolli alati esmalt retseptiravimeid.</i>

+ [Jätka]
    -> medication_hub

=== med_quiz_right ===
# CLEAR

<b>Õige!</b>

Retseptiravimid on esimene prioriteet. Vererõhuravimi annuste vahelejätmine võib olla eluohtlik. Veendu, et kodus on alati vähemalt 7-päevane varu.

+ [Jätka]
    -> medication_hub

=== med_quiz_firstaid ===
# CLEAR

<b>Hea mõte, aga mitte esimene prioriteet.</b>

Esmaabikomplekt on oluline, aga vanaema igapäevane retseptiravim on kriitiline. Ilma selleta võib tervis kiiresti halveneda.

<i>Kontrolli esmalt retseptiravimeid, siis esmaabikomplekti.</i>

+ [Jätka]
    -> medication_hub

=== medication_hub ===
# CLEAR

~ prep_medication = 1

{med_cabinet_done: ✓ Kapp kontrollitud}
{med_organized: ✓ Tabletid päevade kaupa sorteeritud}
{med_fridge: ✓ Külmkapi-ravimite plaan}
{med_card: ✓ Hädaolukorra ravimikaart}

+ {not med_organized} [🗂️ Sorteeri tabletid päevade kaupa — 3 min]
    ~ med_organized = true
    ~ current_time = current_time + 3
    -> med_result_organize

+ {not med_fridge} [🧊 Tee plaan külmkapis hoitavatele ravimitele — 2 min]
    ~ med_fridge = true
    ~ current_time = current_time + 2
    -> med_result_fridge

+ {not med_card} [📝 Kirjuta hädaolukorra ravimikaart — 3 min]
    ~ med_card = true
    ~ current_time = current_time + 3
    -> med_result_card

+ [✓ Ravimitega valmis]
    -> medication_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== med_result_fridge ===
# CLEAR

{has_elderly:
    Mõtled kõigele, mis külmkapis hoitakse — {elderly_relation} ravimid, insuliin, mõned silmatilgad.
- else:
    Mõtled kõigele, mis külmkapis hoitakse — insuliin, mõned antibiootikumid, teatud silmatilgad.
}

Voolu puudumisel püsib külmkapp külm umbes <b>4 tundi, kui ust ei avata</b>. Pärast seda tõstaksid külmad ravimid <b>külmakotti jääkottidega</b> ja hoiaksid külmkapi ust võimalikult kinni.

<b>Tea, millised su ravimid peavad külmas püsima ja kui kaua nad väljas olla tohivad — su apteeker oskab öelda. Mõnel on paar sooja tundi okei, teisel mitte.</b>

+ [Jätka]
    -> medication_hub

=== med_result_card ===
# CLEAR

Kirjutad iga kodus oleva inimese kohta lihtsa kaardi: tema <b>ravimid ja annused</b>, võimalikud <b>allergiad</b>, kestvad <b>haigused</b> ning <b>arsti ja apteegi</b> numbrid.

Üks koopia läheb esmaabikomplekti ja teed sellest telefoniga foto.

<b>Kui sa ise rääkida ei saa — või keegi peab aitama pereliiget — ütleb see kaart sekunditega kõik olulise. See on üks kasulikemaid asju igas hädaolukorra komplektis.</b>

+ [Jätka]
    -> medication_hub

=== med_result_organize ===
# CLEAR

{has_elderly:
    Sorteerid {elderly_relation} tabletid väikesesse karpi, päevade kaupa. Hommikune annus, õhtune annus — selgelt eraldatud.

    Paned karbi voodi kõrvale koos klaasi vee, lugemisprillidega ja väikese kellukesega, mida nad saavad helistada, kui sind vaja on.

    <b>Kõik on käeulatuses, isegi pimedas.</b>
- else:
    Sorteerid tabletid väikesesse karpi, päevade kaupa. Hommikune annus, õhtune annus — selgelt eraldatud.

    Paned karbi käeulatusse koos klaasi veega.

    <b>Kõik käeulatuses, isegi pimedas.</b>
}

+ [Jätka]
    -> medication_hub

=== medication_complete ===
# CLEAR

{
    - med_cabinet_done && med_organized && med_fridge && med_card:
        ~ prep_medication = 2
        {has_elderly: {elderly_relation} ravimid on sorteeritud, kehtivad ja käeulatuses. | Su ravimid on sorteeritud, kehtivad ja käeulatuses.} Külmkapi-plaan ja hädaolukorra kaart tehtud. Oled hästi ettevalmistatud.
    - med_cabinet_done && (med_organized || med_card):
        ~ prep_medication = 2
        <b>Hästi ettevalmistatud.</b> Kapp on kontrollitud ja põhiasjad korras. {not med_fridge: Plaan külmkapi-ravimitele teeks pildi täielikuks.}
    - med_cabinet_done:
        ~ prep_medication = 1
        <b>Põhiasjad tehtud.</b> Oled kapi kontrollinud — tablettide sorteerimine päevade kaupa ja ravimikaardi kirjutamine teeksid raskel hetkel tõelist vahet.
    - else:
        ~ prep_medication = 1
        Oled ravimitele mõelnud, aga palju pole veel teinud.
}

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== preparation_complete ===

# CLEAR
~ in_preparation = false

Oled teinud, mida saad.

{current_time >= storm_time - 10:
    Tuul ulub väljas. Torm on kohal.
- else:
    Torm saabub peagi.
}

Aeg puhata enne, kui hullem tuleb.

* [Maga]
    -> blackout

=== blackout ===
# AUDIOLOOP:
# CLEAR
# SLEEP_FADE

* [Ärka üles]
    -> wake_up

=== wake_up ===

# CLEAR
# WEATHER_STAGE: 2
# STORM_ARRIVAL
# CLASS: fade-in-scene
# CLASS: room-dark
# BACKGROUND: ../Images/Room.jpg
# AUDIOLOOP: ../Sound/wind.wav

Ärkad üles. Torm on kohal — tuul tagub seinu, aknad ragisevad. Maja hääled on vaikinud. Ei kütet. Ei elektrit.

* [Vaata kellaaega]
    -> check_time_again

=== check_time_again ===
#CLEAR

<span class="clock-display">3:47</span>

Elekter on ära. Torm pidi liinid maha võtma.

* [Ulatu valgusallika poole]
    -> reach_for_light

=== reach_for_light ===
# CLEAR
{not flashlight_search_done:
    # FLASHLIGHT_SEARCH
}
-> crisis_night

// ============================================
// KRIIS — ÖÖ
// ============================================
=== crisis_night ===
# CLEAR
# CONSEQUENCE: light

{not search_found:
    ~ phone_drained = true
}

{
    - not search_found && not light_flashlight:
        Käsi haarab tühjust. Sa ei pannud taskulampi kõrvale — pole valgust, mille järele sirutada. Telefon saab ainsaks lambiks, ekraan põleb, kui kannad seda toast tuppa. Hommikuks on see 9% juures.
    - not search_found:
        Sa ei saagi korralikku valgust kätte. Telefoni ekraan valgustab teed — piisavalt hele, aga pole selleks mõeldud. Hommikuks on aku 23% juures.
    - search_known_spot:
        Käsi leiab taskulambi täpselt sealt, kuhu selle panid — pimedusest välja {search_seconds} sekundiga. {light_batteries || shop_batteries: Tugev ja ere.| Kiir on nõrk — patareid on peaaegu tühjad — aga töötab.} Telefon jääb taskusse.
    - else:
        Leiad selle lõpuks — aga alles pärast {search_seconds} pikka, ärevat sekundit pilkases pimeduses sahtlites tuhnimist. {light_batteries || shop_batteries: Vähemalt on kiir tugev.| Ja kiir on nõrk; patareid on peaaegu tühjad.}
}

{search_found:
    {light_rationing:
        Hoiad seda madalaimal kasulikul seadel ja lülitad välja alati, kui seda vaja pole — see peab vastu pidama päevi, mitte tunde.
    - else:
        Jätad selle eredalt põlema, mõtlemata veel, mitu ööd see valgus peab venima.
    }
}

{light_flashlight:
    <b>Taskulamp kohas, mille saad voodist kätte, muudab hirmutava pimedas rabelemise mõneks sekundiks. Otsusta koht — ja veendu, et kõik teavad seda.</b>
}

* [Jätka]
    -> night_heat

=== night_heat ===
# CLEAR
# CONSEQUENCE: heat

{
    - prep_heat == 0:
        {home_heating == "electric": Su elektriküte sureb samal hetkel kui elekter.|{home_heating == "wood_gas": Ahju pole köetud ja maja jahtub kiiresti.|Kaugkütte pump seiskub ja radiaatorid jahtuvad.}} Tunni jooksul näed oma hingeõhku.{home_high_heat_loss:  Avatud seinad annavad sooja veelgi kiiremini ära.} Koidu ajaks{has_elderly: ei lõpeta {elderly_relation} värisemist — nad vajavad soojust, mida sa praegu anda ei saa.| on sõrmed tuimad ja külm on halastamatu.}
    - prep_heat == 1:
        Tõmbad kõik tekid kokku ja tihendad halvimad tuuletõmbed. Külm, aga ellujäädav. {has_elderly: {elderly_relation} magab rahutult.| Tukkud vaheldumisi.} Hommikuks näed oma hingeõhku.
    - else:
        Süütad puuahju, enne kui tuba rohkem jaheneb. {has_elderly: {elderly_relation} magab rahulikult kogu öö.| Tuba hoiab sooja kogu öö.}
}

* [Hommik tuleb...]
    -> crisis_morning

// ============================================
// KRIIS — HOMMIK
// ============================================
=== crisis_morning ===
# CLEAR
# CONSEQUENCE: water

Kraanid jooksevad tühjaks. Külmkapp soojeneb. Pliit ei sütti.

{
    - prep_water == 0:
        Kontrollid iga kappi. Üks poolik pudel. {has_elderly: {elderly_relation} saab selle. Sina jääd ilma.| Jaotad seda ettevaatlikult — pole piisavalt.}
    - prep_water == 1:
        Sul on natuke vett varutud. Väikesed tassid, mitte tilkagi raisku. See peab vastu pidama.
    - else:
        Valad täie klaasi. {has_elderly: Üks {elderly_relation} jaoks, üks endale.| Kõigile piisavalt.} Varud kestavad päevi.
}

* [Jätka]
    -> morning_food

=== morning_food ===
# CLEAR
# CONSEQUENCE: food

{
    - prep_food == 0:
        Avad iga kapi ukse. Karp kreekerit, purk sardine. See on kõik — ilma elektrita ei saa süüa teha.
    - prep_food == 1:
        Leib ja mõned sahvri põhiasjad. Tänaseks piisab, aga leib ei säili ja midagi sooja teha ei saa.
    - else:
        Konservid, kreekerid, energiabatoonid. Küpsetamist pole vaja. Sööd muretult.
}

* [Jätka]
    -> morning_info

=== morning_info ===
# CLEAR
# CONSEQUENCE: info

{
    - prep_info == 0:
        Raadiot pole. Telefoni aku on peaaegu tühi. Sul pole aimugi, mis väljas toimub ega millal see lõppeb. Vaikus surub peale.
    - prep_info == 1:
        Lülitad patareiraadio sisse. Signaal tuleb ja kaob — katkeid. "...elekter taastatud...staatiline müra...36 tundi..." Kuuled piisavalt, et abi on tulemas. Lõpuks.
    - else:
        Patareiraadio tuleb selgelt sisse. Elekter taastatakse 36 tunni jooksul. Kirjutad selle üles ja hingad kergendatult.
}

* [Jätka]
    -> morning_medication_check

=== morning_medication_check ===
-> morning_medication

=== morning_medication ===
# CLEAR
# CONSEQUENCE: medication

{
    - prep_medication == 0:
        {has_elderly:
            Otsid pimedas {elderly_relation} ravimeid. Pudelid on segamini — silte on võimatu lugeda. Pakud annuse ja loodad, et on õige.
        - else:
            Otsid pimedas ravimikapi. Pudelid on segamini — silte on võimatu lugeda. Pakud annuse ja loodad, et on õige.
        }
    - prep_medication == 1:
        {has_elderly:
            Leiad {elderly_relation} tabletid, aga need on lahtiselt kotis. Hämaras on raske silte lugeda. Üks tablett või kaks? Teed parima.
        - else:
            Leiad tabletid, aga need on lahtiselt kotis. Hämaras on raske silte lugeda. Üks tablett või kaks? Teed parima.
        }
    - else:
        {has_elderly:
            {elderly_relation} tabletid on sorteeritud voodikõrval karbis — hommikused ja õhtused annused selgelt eraldatud. Nad võtavad need ilma abita.
        - else:
            Sinu ravimid on päevade kaupa sorteeritud. Võtad õige annuse ilma pimedas kobamata.
        }
}

* [Jätka]
    -> crisis_culmination

// ============================================
// KRIIS: HARIPUNKT
// ============================================
=== crisis_culmination ===
# CLEAR

~ total_prep = prep_water + prep_food + prep_heat + prep_light + prep_info + prep_medication

{
    - total_prep >= 10:
        Saad hakkama. Piisavalt soe, söönud, joodetud, informeeritud. Olukord on kontrolli all.

    - total_prep >= 6:
        Mõned asjad on tehtud, teised mitte. Saad hakkama — aga raskemalt, kui vaja oleks.

    - total_prep >= 3:
        Külm, näljane, ebakindel. Ellu jääd, aga vaevalt.

    - else:
        Jäätunud. Süüa ega juua pole. Aimugi pole, mis väljas toimub.
}

{
    - has_elderly && has_children:
        {elderly_relation} on tõsises hädas. Teed on blokeeritud ja sa ei saa lahkuda —
        {children_count == 1: sinu laps vajab sind siin. | sinu lapsed vajavad sind siin.} Keegi peab sinu juurde tulema.
        <span class="note-hint">🗒️ Vaata oma märkmeid — milline number saadab abi sinu juurde?</span>
    - has_elderly:
        {elderly_relation} hüüab — nõrgalt, pingul. Pearinglus. Vererõhk tundub vale.
        Nad vajavad arstiabi. Mitte eluohtlik, aga abi on vaja. Teed on blokeeritud.
        <span class="note-hint">🗒️ Vaata oma märkmeid — milline number sobib sellesse olukorda?</span>
    - has_children:
        Sinu lapsel on tekkinud lööve ja kõri paisub. See on tõsine.
        See võib olla eluohtlik. Teed on blokeeritud.
        <span class="note-hint">🗒️ Vaata oma märkmeid — millisele numbrile helistad eluohtliku hädaolukorra puhul?</span>
    - else:
        Elekter on olnud üle 12 tunni ära. Sa pole kindel, kas sellest on teatatud.
        Hakkad end halvasti tundma — pearinglus ja külmatunne.
        <span class="note-hint">🗒️ Vaata oma märkmeid — milline number tegeleb elektrikatkestustega?</span>
}

+ {has_elderly && has_children} [Võta telefon]
    -> call_rescue_scenario

+ {has_elderly && not has_children} [Võta telefon]
    -> call_elderly_medical

+ {not has_elderly && has_children} [Võta telefon]
    -> call_child_emergency

+ {not has_elderly && not has_children} [Võta telefon]
    -> call_power_outage

// ============================================
// TELEFONIKÕNE SÕLMED
// ============================================
=== call_elderly_medical ===
# CLEAR
~ current_call_scenario = "elderly_medical"
# PHONE_KEYPAD: elderly_medical

Võtad telefoni. Aku näitab 23%.

{elderly_relation} vajab abi. Pearinglus, pinges — vererõhk tundub vale. Mitte eluohtlik, aga vajab arstiabi ja sa ei saa autoga välja sõita. Teed on blokeeritud.

{heard_broadcast:
    Mäletad, et raadioülekandes mainiti erinevaid numbreid erinevateks olukordadeks...
- else:
    Sa ei kuulnud hädaabinumbreid. Pead arvama või üritama meelde tuletada, mis need võiksid olla...
}

<span class="note-hint">🗒️ Vaata oma märkmeid — milline number sobib sellesse olukorda?</span>

+ [Jätka]
    -> call_result

=== call_rescue_scenario ===
# CLEAR
~ current_call_scenario = "rescue_coordination"
# PHONE_KEYPAD: rescue_coordination

Võtad telefoni. Aku näitab 23%.

{elderly_relation} on tõsises hädas. {children_count == 1: Sinu laps vajab sind siin | Sinu lapsed vajavad sind siin} — sa ei saa lahkuda. Vajad kedagi, kes sinu juurde tuleks. Teed on blokeeritud.

{heard_broadcast:
    Mäletad, et raadioülekandes mainiti erinevaid numbreid erinevateks olukordadeks...
- else:
    Sa ei kuulnud hädaabinumbreid. Pead arvama või üritama meelde tuletada, mis need võiksid olla...
}

<span class="note-hint">🗒️ Vaata oma märkmeid — milline number saadab abi otse sinu juurde?</span>

+ [Jätka]
    -> call_result

=== call_child_emergency ===
# CLEAR
~ current_call_scenario = "child_emergency"
# PHONE_KEYPAD: child_emergency

Võtad telefoni. Aku näitab 23%.

Sinu lapsel on raske reaktsioon — lööve levib, kõri paisub. See on eluohtlik. Teed on blokeeritud ja iga sekund loeb.

{heard_broadcast:
    Mäletad, et raadioülekandes mainiti erinevaid numbreid erinevateks olukordadeks...
- else:
    Sa ei kuulnud hädaabinumbreid. Pead arvama või üritama meelde tuletada, mis need võiksid olla...
}

<span class="note-hint">🗒️ Vaata oma märkmeid — millisele numbrile helistad eluohtliku hädaolukorra puhul?</span>

+ [Jätka]
    -> call_result

=== call_power_outage ===
# CLEAR
~ current_call_scenario = "power_outage"
# PHONE_KEYPAD: power_outage

Võtad telefoni. Aku näitab {phone_drained: vaid 9% — kasutasid seda terve öö valgusena| 23%}.

Elekter on olnud üle 12 tunni ära. Peas käib ringi ja on külm. Pead sellest teatama ja abi saama.

{phone_drained:
    Ekraan tumeneb, et säästa, mis veel alles. Ehk on selles üks kõne, enne kui see sureb.
}

{heard_broadcast:
    Mäletad, et raadioülekandes mainiti erinevaid numbreid erinevateks olukordadeks...
- else:
    Sa ei kuulnud hädaabinumbreid. Pead arvama või üritama meelde tuletada, mis need võiksid olla...
}

<span class="note-hint">🗒️ Vaata oma märkmeid — milline number tegeleb elektrikatkestustega?</span>

+ [Jätka]
    -> call_result

// Varukoopia tagasiühilduvuse jaoks
=== call_for_help ===
#CLEAR
# PHONE_KEYPAD: grandmother_emergency

Võtad telefoni. Aku näitab 23%.

Vanaema vajab abi. Mitte eluohtlik hädaolukord, aga ta vajab arstiabi ja sa ei saa autoga välja sõita — teed on blokeeritud.

{heard_broadcast:
    Mäletad, et raadioülekandes mainiti erinevaid numbreid erinevateks olukordadeks...
- else:
    Sa ei kuulnud hädaabinumbreid. Pead arvama või üritama meelde tuletada, mis need võiksid olla...
}

<span class="note-hint">🗒️ Vaata oma märkmeid — milline number sobib sellesse olukorda?</span>

+ [Jätka]
    -> call_result

=== call_result ===
#CLEAR

{call_outcome == "help_success":
    -> ending_good
}
{call_outcome == "help_partial":
    -> ending_partial
}
{call_outcome == "help_delayed":
    -> ending_delayed
}
{call_outcome == "wrong_number":
    {current_call_scenario == "elderly_medical":   -> call_elderly_medical}
    {current_call_scenario == "rescue_coordination": -> call_rescue_scenario}
    {current_call_scenario == "child_emergency":   -> call_child_emergency}
    {current_call_scenario == "power_outage":      -> call_power_outage}
    -> call_for_help
}
{call_outcome == "no_help":
    -> ending_bad
}

-> ending_bad

=== ending_good ===
~ ending_type = "good"
#CLEAR

{
    - has_elderly && has_children:
        Tunni jooksul saabub päästemeeskond. Nad stabiliseerivad {elderly_relation} kohapeal ja kontrollivad {children_count == 1: last. | lapsi.}

        "Tegid õige otsuse — 1247-le helistamine tõi meeskonna otse sinu juurde."

    - has_elderly:
        Tunni jooksul saabub meditsiinimeeskond.

        Nad kontrollivad {elderly_relation} põhjalikult. "Nad on dehüdreerunud, aga stabiilsed," ütlevad nad. "Tegid täpselt õigesti, et helistasid tervisenõuande liinile."

        Kui nad aitavad olukorda stabiliseerida, tunned kergendust.

    - has_children:
        Kiirabi saabub minutitega. Parameedikud süstivad kohe adrenaliini.

        "Helistasid õigele numbrile. Veel paar minutit ja see oleks olnud palju hullem."

        Sinu laps stabiliseerub. Hingad taas.

    - else:
        Elektrifirma registreerib sinu teate prioriteetsena. Pärastlõunaks saabub heaolukontrolli meeskond.

        "Hea, et kasutasid 1343 — täpselt selleks see ongi."

        Elekter tuleb õhtuks tagasi.
}

Olid ettevalmistatud. Panid tähele. Ja kui see tähtsust omas, teadsid täpselt, mida teha.

* [Vaata tulemusi]
    -> ending_summary

=== ending_partial ===
~ ending_type = "partial"
#CLEAR

Abi saabub, kuigi see võttis vajalikust kauem.

{has_elderly:
    "Nad saavad korda," ütlevad nad. "Kuigi oleksid võinud helistada spetsiifilisemale numbrile selle olukorra jaoks — oleks olnud kiirem."

    {elderly_relation} stabiliseerub. Tegid mõistliku valiku, isegi kui mitte ideaalse.
- else:
    Abi saabub. Tegid mõistliku valiku — see jõudis kohale, lihtsalt mitte nii kiiresti, kui oleks saanud.
}

* [Vaata tulemusi]
    -> ending_summary

=== ending_delayed ===
~ ending_type = "delayed"
#CLEAR

Abi saabub, aga see võttis kauem, kui oleks pidanud.

{has_elderly:
    "Peame {elderly_relation} haiglasse viima," ütlevad nad. "112-le helistamine mitte-eluohtliku olukorra puhul hõivas kriitilisi ressursse ja viivitas sinu kõne käsitlemist."
- else:
    112-le helistamine, kui see polnud eluohtlik hädaolukord, hõivas kriitilisi ressursse ja viivitas sinu olukorra lahendamist.
}

* [Vaata tulemusi]
    -> ending_summary

=== ending_bad ===
~ ending_type = "bad"
#CLEAR

Ootad. Tunnid mööduvad.

{
    - has_elderly:
        Lõpuks kontrollib naaber töötava autoga ja viib {elderly_relation} haiglasse.

        Nad paranevad, aga oli napilt.
    - has_children:
        Lõpuks viib naaber sind ja lapse lähimasse kliinikusse.

        Oli napilt.
    - else:
        Lõpuks leiab sind ringi käiv sotsiaaltöötaja.

        Paranete, aga see võttis liiga kaua.
}

Kui oleksid ainult teadnud õiget numbrit, kuhu helistada...

* [Vaata tulemusi]
    -> ending_summary

=== ending_summary ===
# CLEAR
# ENDING_SCREEN
-> END

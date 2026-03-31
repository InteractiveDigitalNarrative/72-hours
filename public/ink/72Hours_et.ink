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

+ {(shop_water || shop_food || shop_batteries) && not shop_visited} [🛒 Mine poodi]
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

Kontrollid sahvrit ja külmkappi.

On natuke leiba, mis läheb päevaga kuivaks, paar purki ube, pool pakki kreekerit ja mõned õunad.

Hädaolukorraks mitte ideaalne, aga midagi on. Leib ja õunad ei säili kaua...

+ {not shop_food} [🛒 Lisa hädaolukorra toit ostunimekirja]
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

{
    - prep_heat == 0:
        Mõtled ette — kui elekter läheb ära, seiskub keskküte. Väljas on {temperature}°C.

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

+ [✓ Soojusega valmis]
    -> heat_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

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

Kontrollid korstnasiibrit — see avaneb. Puhstad vana tuha ja tood küünist süles täie puid. Ahi on valmis, et kohe süüdata.

<b>Kontrolli alati korstnasiibrit enne süütamist. Ära jäta tuld kunagi järelevalveta. Hoia tulekustutustekk lähedal.</b>

+ [Jätka]
    -> heat_hub

=== heat_result_pipes ===
# CLEAR

Mähid lahtised torud vanade rätikute ja kaltsudega. Pole täiuslik isolatsioon, aga võib ära hoida toru lõhkemise.

<b>Lõhkenud toru külmunud majas on katastroof katastroofis. Kraanide aeglane tilkumine aitab samuti — liikuv vesi külmub aeglasemalt.</b>

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

=== category_light ===
# CLEAR

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

~ prep_light = 1

{light_flashlight: ✓ Taskulamp leitud}
{light_batteries: ✓ Uued patareid}
{light_candles: ✓ Küünlad ja tikud}

+ {not light_flashlight} [🔦 Otsi taskulamp — 3 min]
    ~ light_flashlight = true
    ~ current_time = current_time + 3
    -> light_result_flashlight

+ {light_flashlight && not light_batteries && not shop_batteries} [🔋 Otsi varupatareisid kodust — 3 min]
    ~ current_time = current_time + 3
    -> light_result_search_batteries

+ {light_flashlight && not light_batteries && not shop_batteries} [🛒 Lisa patareid ostunimekirja]
    ~ shop_batteries = true
    -> light_result_shop_batteries

+ {not light_candles} [🕯️ Kogu küünlad ja tikud — 3 min]
    ~ light_candles = true
    ~ current_time = current_time + 3
    -> light_result_candles

+ [✓ Valgusega valmis]
    -> light_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== light_result_flashlight ===
# CLEAR

Leiad taskulambi esikukapi seest. Vajutad sisse — kiir on nõrk ja kollakas.

<b>Patareid on peaaegu tühjad.</b> Mõnda aega töötab, aga öö üle ei pea.

Vajad uusi patareisid.

+ [Jätka]
    -> light_hub

=== light_result_search_batteries ===
# CLEAR

Tuhnid köögi sahtlites ja esiku kräbukarpi...

~ light_batteries = true

Leiad pakikese AA-patareisid, mis on peidetud vana teibi taha. Näevad kasutamata välja.

<b>Vahetad need sisse — kiir on ere ja tugev.</b>

+ [Jätka]
    -> light_hub

=== light_result_shop_batteries ===
# CLEAR

Lisad <b>patareid</b> ostunimekirja. Ostad poest uued.

+ [Jätka]
    -> light_hub

=== light_result_candles ===
# CLEAR

Kogud majast küünlad kokku ja leiad köögisahtlist tikud. Paned need elutuppa ja kööki — valmis süütamiseks.

<b>Küünlad on hea varuvalgusti, aga ära jäta neid kunagi järelevalveta. Hoia need kardinatest ja paberist eemal. Tikud olgu alati käepärast.</b>

+ [Jätka]
    -> light_hub

=== light_complete ===
# CLEAR

{
    - light_flashlight && (light_batteries || shop_batteries) && light_candles:
        ~ prep_light = 2
        <b>Hästi ettevalmistatud!</b>

        Taskulamp valmis, patareid korras, küünlad varuks. Pimedus ei üllata sind.

    - light_flashlight:
        <b>Põhiline ettevalmistus.</b>

        Sul on taskulamp, aga {light_batteries == false: patareid on nõrgad.}{light_batteries: varuvalgusti oleks kasulik.}

    - else:
        <b>Sa pole veel valgusallikat leidnud.</b>

        Ilma valguseta on pimedas majas liikumine ohtlik.
}

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub


// ============================================
// INFO KATEGOORIA
// ============================================
VAR info_radio = false
VAR info_radio_batteries = false
VAR info_phone_charged = false

=== category_info ===
# CLEAR

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

+ [✓ Infoga valmis]
    -> info_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== info_result_radio ===
# CLEAR

Tuhnid esikukapis ja leiad vana patareiraadio. Keerad nuppu — kõigepealt staatiline müra, siis nõrgad hääled. Hädaolukorra sagedus töötab veel.

<b>Patareid on aga nõrgad. Ehk peab vastu paar tundi.</b>

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

=== info_complete ===
# CLEAR

{
    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged:
        ~ prep_info = 2
        <b>Täielikult ettevalmistatud!</b>

        Raadio patareidega valmis, telefon laetud ja energiasäästurežiimis. Sa oled informeeritud olenemata olukorrast.

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

=== category_medication ===
# CLEAR

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

        Kriisis võivad apteegid olla päevi suletud. Mida peaksid esimesena kontrollima?

        + [Valuvaigistite varu]
            -> med_quiz_pain

        + [Retseptiravimite varu]
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

{med_pills_counted: ✓ Tabletid loetud}
{med_organized: ✓ Ravimid sorteeritud}
{med_first_aid: ✓ Esmaabikomplekt kontrollitud}

+ {not med_pills_counted && has_elderly} [💊 Loe {elderly_relation} tabletid — 2 min]
    ~ med_pills_counted = true
    ~ current_time = current_time + 2
    -> med_result_count

+ {not med_pills_counted && not has_elderly} [💊 Loe retseptiravimid — 2 min]
    ~ med_pills_counted = true
    ~ current_time = current_time + 2
    -> med_result_count

+ {med_pills_counted && not med_organized} [🗂️ Sorteeri ravimid päevade kaupa — 3 min]
    ~ med_organized = true
    ~ current_time = current_time + 3
    -> med_result_organize

+ {not med_first_aid} [➕ Kontrolli esmaabikomplekti — 2 min]
    ~ med_first_aid = true
    ~ current_time = current_time + 2
    -> med_result_firstaid

+ [✓ Ravimitega valmis]
    -> medication_complete

+ [← Tagasi ettevalmistustesse]
    -> preparation_hub

=== med_result_count ===
# CLEAR

{has_elderly:
    Leiad {elderly_relation} vererõhutabletid köögilaualt ja loed need hoolikalt.
- else:
    Loed oma retseptiravimid hoolikalt üle.
}

<b>5 päeva varu.</b> Peaks tormist piisama — aga napilt.

<i>Eksperdid soovitavad hoida kodus alati vähemalt 7-päevast retseptiravimite varu.</i>

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

=== med_result_firstaid ===
# CLEAR

Kaevad esmaabikomplekti vannitoakapist välja ja kontrollid sisu.

Sidemed, antiseptik, valuvaigistid, palavikualandajad... enamasti korras. Valuvaigistid aegusid eelmisel aastal.

<b>Mitte täiuslik, aga piisab.</b>

<i>Hea hädaolukorra komplekt peaks sisaldama: sidemed, antiseptik, valuvaigistid, palavikualandajad, allergia ravimid ja kõik retseptiravimid.</i>

+ [Jätka]
    -> medication_hub

=== medication_complete ===
# CLEAR

{
    - med_pills_counted && med_organized && med_first_aid:
        ~ prep_medication = 2
        {has_elderly: {elderly_relation} ravimid on sorteeritud ja käeulatuses. | Ravimid on sorteeritud ja käeulatuses.} Esmaabikomplekt on kontrollitud. Oled hästi ettevalmistatud.
    - med_pills_counted || med_first_aid:
        ~ prep_medication = 1
        Põhiasjad on tehtud. {not med_organized: {has_elderly: Tablettide sorteerimine päevade kaupa teeks asjad {elderly_relation} jaoks pimedas lihtsamaks. | Tablettide sorteerimine päevade kaupa teeks asjad pimedas lihtsamaks.}}
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
    -> crisis_night

// ============================================
// KRIIS — ÖÖ
// ============================================
=== crisis_night ===
# CLEAR
# CONSEQUENCE: light

{
    - prep_light == 0:
        Kobad pimedas telefoni. Ekraan süttib — piisavalt hele, aga pole selleks mõeldud. Hommikuks on aku 23% juures.
    - prep_light == 1:
        Leiad taskulambi mälu järgi ja vajutad sisse. Kiir on nõrk, vilgub — patareid on peaaegu tühjad. Kasutad seda säästvalt.
    - else:
        Käsi leiab taskulambi täpselt sealt, kuhu selle panid. Tugev, ere valgus. Telefon jääb taskusse.
}

* [Jätka]
    -> night_heat

=== night_heat ===
# CLEAR
# CONSEQUENCE: heat

{
    - prep_heat == 0:
        Küte sureb koos elektriga. Tunni jooksul näed oma hingeõhku. Koidu ajaks{has_elderly: ei lõpeta {elderly_relation} värisemist — nad vajavad soojust, mida sa praegu anda ei saa.| on sõrmed tuimad ja külm on halastamatu.}
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

Võtad telefoni. Aku näitab 23%.

Elekter on olnud üle 12 tunni ära. Peas käib ringi ja on külm. Pead sellest teatama ja abi saama.

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

// 72 HOURS - Disaster Management Game
// ACT 1: THE NIGHT

// === VARIABLES ===
VAR temperature = -8

// Family composition (set by React FamilySetup overlay)
VAR family_size = 2
VAR elderly_relation = "Grandmother"
VAR has_elderly = true
VAR has_children = false
VAR children_count = 0

// Time tracking (in minutes from midnight, so 20:00 = 1200, 22:00 = 1320)
VAR current_time = 1200
VAR storm_time = 1320
VAR start_time = 1200
VAR in_preparation = false

// Preparation categories (0 = not done, 1 = basic, 2 = thorough)
VAR prep_water = 0
VAR prep_food = 0
VAR prep_heat = 0
VAR prep_light = 0
VAR prep_info = 0
VAR prep_medication = 0

// Set to true by the React WaterCalculation overlay so the Ink quiz is skipped
VAR water_quiz_done = false

// Set by the React PantryCheck overlay
VAR pantry_checked = false
VAR pantry_gaps_count = 0
VAR pantry_use_first_count = 0

// Set by the React HomeSetup overlay
VAR home_setup_done = false
VAR home_seal_count = 0
VAR home_has_exposed_pipes = false
VAR home_high_heat_loss = false
VAR home_has_stove = false
// Fixed dwelling facts from HomeSetup: building = apartment|detached|terraced|rural; heating = district|electric|wood_gas
VAR home_building = ""
VAR home_heating = ""

// Water containers filled
VAR water_target = 18
VAR water_collected = 0
VAR water_home_measured = 0
VAR water_bottles = false
VAR water_pots = false
VAR water_bathtub = false
VAR water_jerrycan = false

// Food items picked at grocery store
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

// Shopping list
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

// Phone call outcome tracking
VAR call_outcome = ""
VAR dialed_number = ""
VAR heard_broadcast = false
VAR current_call_scenario = ""

// Ending tracking
VAR total_prep = 0
VAR ending_type = ""


// === STORY START ===
-> pen_and_paper

=== pen_and_paper ===
<span></span> # CLEAR # FAMILY_SETUP

<span style="font-size:5rem;display:block;text-align:center;margin-bottom:0.5rem">🗒️</span>

<span class="note-hint">Grab a <b>pen and paper</b> — you'll need to note things down.</span>

* [I'm ready]
    -> tv_start

=== tv_start ===
# AUDIOLOOP: ../Sound/wind.wav
# BREAKING_NEWS

* [Continue]
     -> emergency_broadcast

=== emergency_broadcast ===
# CLEAR
# RADIO_BROADCAST
# NOTE_PROMPT: numbers
~ heard_broadcast = true

The broadcast switches to emergency information...

* [Continue]
     -> living_room


=== living_room ===

# CLEAR
# CLASS: fade-in-scene
# CLASS: room-lit
# BACKGROUND: ../Images/Room.jpg

<i>[Your living room. Evening.]</i>

{
    - has_elderly:
        Your {elderly_relation} is asleep in their room.

        Their blood pressure medication is on the kitchen counter.
    - has_children:
        {children_count == 1: Your child is asleep. | Your children are asleep.} Keep things quiet.
    - else:
        The flat is quiet. Just you tonight.
}

A text appear on your mobile...

* [Check text]
      -> check_text

=== check_text ===
#CLEAR
# SMS: Martin

You read the message...

* [Continue]
    -> check_time
=== check_time ===

# CLEAR

<span class="clock-display">🕗 20:00</span>

<span class="clock-subtitle">Storm arrives at 22:00 — you have 2 hours.</span>

You realize time is limited. You'll need to prioritize what to prepare before the storm hits...

* [Start Preparation]
    -> preparation_intro

=== preparation_intro ===

# CLEAR
~ in_preparation = true

You have about 2 hours before the storm hits. What do you want to prepare?

-> preparation_hub

=== preparation_hub ===

# CLEAR

{
    - current_time >= storm_time - 10:
        The wind is picking up. No more time to prepare.
        -> preparation_complete
}

What do you want to prepare?

+ [💧 Water{prep_water: ✓}]
    -> category_water

+ [🍞 Food{prep_food: ✓}]
    -> category_food

+ [🔥 Heat{prep_heat: ✓}]
    -> category_heat

+ [🔦 Light{prep_light: ✓}]
    -> category_light

+ [📻 Information{prep_info: ✓}]
    -> category_info

+ [💊 Medication{prep_medication: ✓}]
    -> category_medication

+ {(shop_water || shop_food || shop_batteries || shop_meds || shop_warm || shop_flashlight || shop_powerbank || shop_headlamp || shop_lantern || shop_matches) && not shop_visited} [🛒 Go to Store]
    -> go_to_store

+ [Done preparing - wait for storm]
    -> preparation_complete


// ============================================
// WATER CATEGORY
// ============================================
=== category_water ===
# CLEAR

{water_quiz_done && prep_water == 0:
    -> water_containers_intro
}

You're in the kitchen, looking at the tap.

{
    - prep_water == 0:
        The water is still running now, but if the power goes out, the electric pump won't work. You should store some water.
    - prep_water == 1:
        You've collected some water, but maybe not enough.
    - else:
        You've filled plenty of containers. You should be good for days.
}

+ {prep_water == 0 && !water_quiz_done} [Figure out how much water you need]
    -> water_calculation

+ {prep_water > 0} [Fill more containers from tap]
    -> water_containers

+ [← Back]
    -> preparation_hub

// ============================================
// WATER CALCULATION QUIZ
// ============================================
=== water_calculation ===
# CLEAR

Before you start filling containers, you need to figure out how much water you'll need.

There are {family_size} {family_size == 1: person | people} in your household. The storm is expected to last up to 3 days.

Think about how much a person typically needs each day — then work out the total for everyone.

How much water should you aim for?

<span class="note-hint">🗒️ Write down your answer — you may need to refer to it later.</span>

+ [9 liters]
    -> water_calc_wrong_low

+ [12 liters]
    -> water_calc_wrong_low

+ [18 liters]
    -> water_calc_correct

+ [24 liters]
    -> water_calc_wrong_high

=== water_calc_wrong_low ===
# CLEAR

<b>Not quite.</b>

That's not enough to last {family_size} {family_size == 1: person | people} through 3 days.

The recommended amount is 3 liters per person per day — so 3L × {family_size} {family_size == 1: person | people} × 3 days = <b>{water_target} liters minimum.</b>

+ [Try again]
    -> water_calculation

=== water_calc_wrong_high ===
# CLEAR

<b>That's more than the minimum — not necessarily a bad thing.</b>

The minimum is 3L × {family_size} {family_size == 1: person | people} × 3 days = <b>{water_target} liters.</b>

Extra water is never a problem, but let's make sure you hit at least that.

+ [Continue]
    -> water_containers_intro

=== water_calc_correct ===
# CLEAR

<b>Correct!</b>

3L × {family_size} {family_size == 1: person | people} × 3 days = <b>{water_target} liters.</b>

That's the minimum for drinking. More is always better if you have the time.

+ [Continue]
    -> water_containers_intro

// ============================================
// WATER CONTAINERS
// ============================================
=== water_containers_intro ===
# CLEAR

{water_home_measured > 0:
    You counted <b>{water_home_measured} litres</b> already in your home — that's a head start.
- else:
    You check every cupboard and shelf. Nothing. You're starting from zero.
}

+ [Start collecting more]
    -> water_containers

=== water_added_to_list ===
# CLEAR

~ shop_water_amount = water_target - water_collected
{shop_water_amount < 0:
    ~ shop_water_amount = 0
}

You make a mental note: <b>buy {shop_water_amount}L of bottled water at the store.</b>

You have {water_collected}L at home — the store can cover the rest.

+ [Continue]
    -> water_containers

=== water_containers ===
# CLEAR

{shop_water:
    ~ shop_water_amount = water_target - water_collected
    {shop_water_amount < 0:
        ~ shop_water_amount = 0
    }
}

<b>Water collected: {water_collected}L / {water_target}L target</b>

{water_home_measured > 0: ✓ Water found at home ({water_home_measured}L)}
{water_bottles: ✓ Bottles filled from tap (4L)}
{water_pots: ✓ Cooking pots (6L)}
{water_bathtub: ✓ Bathtub (non-drinking)}

+ {not water_bottles} [🚰 Fill empty bottles from the tap (4L) — 5 min]
    ~ water_bottles = true
    ~ water_collected = water_collected + 4
    ~ current_time = current_time + 5
    -> water_container_result_bottles

+ {not water_pots} [🍲 Fill cooking pots with lids (6L) — 8 min]
    ~ water_pots = true
    ~ water_collected = water_collected + 6
    ~ current_time = current_time + 8
    -> water_container_result_pots

+ {not water_bathtub} [🛁 Fill the bathtub — 10 min]
    ~ water_bathtub = true
    ~ current_time = current_time + 10
    -> water_container_result_bathtub

+ {not shop_water} [🛒 Add bottled water to shopping list]
    ~ shop_water = true
    ~ shop_water_amount = water_target - water_collected
    {shop_water_amount < 0:
        ~ shop_water_amount = 0
    }
    -> water_added_to_list

+ [✓ Done collecting water]
    -> water_complete

=== water_container_result_bottles ===
# CLEAR

You gather empty bottles from around the kitchen and fill them from the tap.

<b>+4 liters</b>

Easy to carry and pour from — ideal for drinking water. Seal them tight to keep the water clean.

+ [Continue]
    -> water_containers

=== water_container_result_pots ===
# CLEAR

You fill the large cooking pots and cover them with lids.

<b>+6 liters</b>

Harder to pour from and takes up counter space, but a reliable way to store extra water in a pinch.

+ [Continue]
    -> water_containers

=== water_container_result_bathtub ===
# CLEAR

You plug the bathtub drain and let it fill.

<b>+50 liters (non-drinking)</b>

This water isn't for drinking — but it's useful for flushing toilets and washing hands. A smart move in any emergency.

+ [Continue]
    -> water_containers

=== water_complete ===
# CLEAR

{
    - water_collected >= water_target:
        ~ prep_water = 2
        <b>Well done!</b>

        You've collected {water_collected} liters of drinking water — that covers the {water_target}L needed for {family_size} people over 3 days.

    - water_collected > 0 && shop_water:
        ~ prep_water = 1
        <b>You have {water_collected}L at home so far.</b>

        You've added bottled water to your shopping list — visit the store to top up.

    - water_collected > 0:
        ~ prep_water = 1
        <b>You've collected {water_collected} liters.</b>

        That's less than the {water_target}L recommended, but it's something.

    - else:
        You didn't collect any water. That could be a problem...
}

<b>Remember:</b>
• 3 liters per person per day minimum
• Fill containers BEFORE the power goes out
• Bathtub water is good for washing, not drinking

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// STORE TRIP
// ============================================
=== go_to_store ===
# CLEAR
# STORE_SHOPPING

~ current_time = current_time + 35
~ shop_visited = true

You grab your coat and head to the nearby shop. The wind is already picking up.

The store is busy — others had the same idea.

* [Continue]
    -> grocery_checkout


// ============================================
// FOOD CATEGORY
// ============================================
=== category_food ===
# CLEAR

You think about food supplies.

{
    - prep_food == 0:
        If the power goes out, the fridge won't work and you can't cook. You need food that's ready to eat.
    - prep_food == 1:
        You've gathered some basics from the kitchen. It might last a day or two.
    - else:
        You've got proper emergency food supplies.
}

+ {prep_food == 0} [🔍 Check what's in the kitchen (10 min)]
    ~ prep_food = 1
    ~ current_time = current_time + 10
    -> food_kitchen_result

+ {not shop_food} [🛒 Add emergency food to shopping list]
    ~ shop_food = true
    ~ prep_food = 1
    -> food_added_to_list

+ [← Back]
    -> preparation_hub

=== food_kitchen_result ===
# CLEAR
# PANTRY_CHECK

{pantry_use_first_count > 0:
    A few things in there won't survive the storm — note them as eat-first.
}

{
    - pantry_gaps_count == 0:
        Your kitchen actually covers the basics. A trip to the store still wouldn't hurt.
    - pantry_gaps_count == 1:
        You spot <b>1 gap</b> to fill on the store run.
    - else:
        You spot <b>{pantry_gaps_count} gaps</b> to fill on the store run.
}

+ {pantry_gaps_count > 0 && not shop_food} [🛒 Add the missing items to shopping list]
    ~ shop_food = true
    -> food_added_to_list

+ {pantry_gaps_count == 0 && not shop_food} [🛒 Grab extra supplies from the store, just in case]
    ~ shop_food = true
    -> food_added_to_list

+ [✓ Done with food — back to preparation]
    -> preparation_hub

=== food_added_to_list ===
# CLEAR

You add <b>emergency food</b> to your shopping list.

You'll pick the right items at the store — things that don't need refrigeration or cooking.

+ [← Back to preparation]
    -> preparation_hub

=== grocery_checkout ===
# CLEAR

You pay and hurry home with your supplies.

{shop_water:
    You bought <b>{shop_water_amount}L of water</b> — that tops up your supply.
}

{shop_batteries:
    You grabbed <b>fresh batteries</b> for the flashlight and radio.
}

{shop_flashlight:
    You picked up a <b>dedicated flashlight</b> — the one light worth having above all others.
}

{shop_powerbank:
    You grabbed a <b>power bank</b> to keep your phone alive through the outage.
}

{shop_headlamp || shop_lantern:
    You added {shop_headlamp && shop_lantern: a <b>headlamp and a lantern</b>|{shop_headlamp: a <b>headlamp</b>|a <b>lantern</b>}} to round out your lighting.
}

{shop_matches:
    You grabbed <b>matches</b> so your candles aren't dead weight.
}

{shop_warm:
    You grabbed <b>extra blankets and warm supplies</b> to trap more heat through the cold nights.
}

{shop_meds:
    You stop by the pharmacy too and restock the <b>medicines</b> you flagged — the expired ones replaced, the low ones topped up.
}

{food_canned || food_crackers || food_nuts || food_energy_bars || food_chocolate || food_longlife_bread || food_honey_jam:
    <b>Good picks!</b> You chose food that doesn't need refrigeration or cooking — perfect for an emergency.
}

{food_dried:
    You grabbed dried foods — pasta and rice last long, but remember you might not be able to cook without power. Cereals are fine though!
}

{not food_canned && not food_crackers && not food_nuts && not food_energy_bars && not food_chocolate && not food_longlife_bread && not food_honey_jam && not food_dried && shop_food:
    You didn't grab much useful food. Hopefully what's in the kitchen will be enough...
}

<b>Remember for real emergencies:</b>
• Canned food (meat, fish, vegetables, fruit)
• Crackers, biscuits, long-life bread
• Nuts, dried fruit, energy bars
• Chocolate, honey, jam
• Avoid anything that needs refrigeration or cooking!

<b>Time spent: 35 minutes</b>

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// HEAT CATEGORY
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
        You think ahead — when the power goes out, {home_heating == "electric": your electric heating dies completely|{home_heating == "wood_gas": the house cools unless you keep the stove fed|the district heating pump stops and the radiators go cold}}. It's {temperature}°C outside.

        What's the most important thing to do FIRST?

        + [Seal the house — close windows, ventilation, block drafts]
            -> heat_quiz_right

        + [Turn the heating up as high as possible now]
            -> heat_quiz_wrong

        + [Open windows to let fresh air circulate]
            -> heat_quiz_wrong

    - else:
        You've been preparing the house for the cold.
}

+ {prep_heat > 0} [Continue preparing]
    -> heat_hub

+ [← Back]
    -> preparation_hub

=== heat_quiz_right ===
# CLEAR

<b>Correct!</b>

When heating fails, your first priority is to stop heat from escaping. Close ventilation, seal windows, block drafts under doors.

Now let's prepare the house.

+ [Continue]
    -> heat_hub

=== heat_quiz_wrong ===
# CLEAR

<b>Not quite.</b>

Cranking the heating or opening windows won't help when the power's out. The first priority is to <b>seal the house</b> — close ventilation, shut windows, block drafts. Keep the warm air IN.

+ [Continue]
    -> heat_hub

=== heat_hub ===
# CLEAR
# HEAT_HUB

~ prep_heat = 1

<b>Heat preparation:</b>
{heat_sealed: ✓ Windows & ventilation sealed}
{heat_one_room: ✓ Warm room set up}
{heat_stove: ✓ Wood stove ready}
{heat_pipes: ✓ Pipes insulated}
{heat_clothing: ✓ Warm clothes gathered}

What do you want to do?

+ {not heat_sealed} [🪟 Seal windows & ventilation — 3 min]
    ~ heat_sealed = true
    ~ current_time = current_time + 3
    -> heat_result_sealed

+ {not heat_one_room && has_elderly} [🚶 Move {elderly_relation} to living room — 3 min]
    ~ heat_one_room = true
    ~ current_time = current_time + 3
    -> heat_result_one_room

+ {not heat_one_room && not has_elderly} [🛋️ Set up warm room — 3 min]
    ~ heat_one_room = true
    ~ current_time = current_time + 3
    -> heat_result_one_room

+ {not heat_stove} [🪵 Prepare wood stove & bring firewood — 10 min]
    ~ heat_stove = true
    ~ current_time = current_time + 10
    -> heat_result_stove

+ {not heat_pipes} [🔧 Insulate water pipes — 3 min]
    ~ heat_pipes = true
    ~ current_time = current_time + 3
    -> heat_result_pipes

+ {not heat_clothing} [🧥 Gather warm clothes & blankets — 3 min]
    ~ heat_clothing = true
    ~ current_time = current_time + 3
    -> heat_result_clothing

+ {not shop_warm} [🛒 Add blankets & warm supplies to shopping list]
    ~ shop_warm = true
    -> heat_added_to_list

+ [✓ Done with heat]
    -> heat_complete

+ [← Back to preparation]
    -> preparation_hub

=== heat_added_to_list ===
# CLEAR

You add <b>extra blankets and warm supplies</b> to your shopping list — more layers mean more trapped heat when the warmth has to last.

+ [← Back to heat]
    -> heat_hub

=== heat_result_sealed ===
# CLEAR

You switch off the forced ventilation, shut every window, and stuff towels along drafty gaps under doors.

<b>Every sealed gap keeps precious warmth inside.</b>

+ [Continue]
    -> heat_hub

=== heat_result_one_room ===
# CLEAR

{has_elderly:
    You set up a comfortable spot for {elderly_relation} in the living room — pillows, their blanket, medication nearby. You close the doors to all other rooms.
- else:
    You set up the living room as the warm room — close the doors to all other rooms to concentrate heat.
}

<b>One room is easier to heat, and every person gives off body heat — staying together helps.</b>

+ [Continue]
    -> heat_hub

=== heat_result_stove ===
# CLEAR

{home_has_stove:
    You check the flue — it opens. You clear old ash and haul armloads of firewood from the shed. The stove is ready to light at a moment's notice.

    <b>Always check the flue before lighting. Never leave a fire unattended. Keep a fire blanket nearby.</b>
- else:
    You don't have a wood stove here, but you read through the basics: check the flue is clear and opens, sweep out old ash, keep dry firewood close by, never leave a fire unattended, and keep a fire blanket nearby.

    <b>A wood stove or fireplace is one of the best things to have in a long outage — worth knowing the basics for anywhere you might stay that has one.</b>
}

+ [Continue]
    -> heat_hub

=== heat_result_pipes ===
# CLEAR

{home_has_exposed_pipes:
    You wrap the exposed pipes in the basement and along the outside wall with old towels and rags. Not perfect insulation, but it could prevent a burst pipe.

    <b>A burst pipe in a frozen house is a disaster on top of a disaster. A slow drip from taps also helps — moving water freezes slower.</b>
- else:
    Your pipes run inside heated walls, so the house already protects them. You walk through what you'd do if they didn't — wrap them in old towels and rags, leave a slow drip from the taps so the water keeps moving.

    <b>Good to know for relatives' homes, summer cottages, or any place with exposed plumbing. A wrapped pipe is far less likely to crack.</b>
}

+ [Continue]
    -> heat_hub

=== heat_result_clothing ===
# CLEAR

{has_elderly:
    You dig out wool sweaters, thermal socks, {elderly_relation}'s thick quilts. Warm clothes for everyone, ready to go.
- else:
    You dig out wool sweaters, thermal socks, thick quilts. Warm clothes ready to go.
}

<b>Layer up: thermal base, wool/fleece middle, windproof outer. Don't forget hat, gloves, and thick socks.</b>

+ [Continue]
    -> heat_hub

=== heat_complete ===
# CLEAR

{
    - heat_sealed && heat_one_room && heat_stove && heat_pipes && heat_clothing:
        ~ prep_heat = 2
        <b>Fully prepared!</b>

        The house is sealed, grandmother is in the warm room, the stove is ready, pipes are insulated, and warm clothes are laid out.

    - heat_stove:
        ~ prep_heat = 2
        <b>Good preparation.</b>

        The stove is ready — that's the most important part. You've done what you can.

    - else:
        ~ prep_heat = 1
        <b>Basic preparation done.</b>

        You've taken some steps, but there's more you could do to stay safe.
}

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// LIGHT CATEGORY
// ============================================
VAR light_flashlight = false
VAR light_batteries = false
VAR light_candles = false
VAR light_headlamp = false
VAR light_lantern = false
VAR light_powerbank = false
VAR light_rationing = false

// Set by the React LightAudit overlay
VAR light_audit_done = false
VAR owns_flashlight = false
VAR owns_headlamp = false
VAR owns_lantern = false
VAR owns_candles = false
VAR owns_matches = false
VAR owns_powerbank = false

// Where the flashlight is kept: -1 undecided, 0 nowhere/drawer, 1 hallway, 2 bedside
VAR flashlight_spot = -1
// Crisis-night dark search (React FlashlightSearch overlay)
VAR flashlight_search_done = false
VAR search_seconds = 0
VAR search_found = false
VAR search_known_spot = false
// True when the night was spent using the phone as the only light — drains it for the crisis call
VAR phone_drained = false

=== category_light ===
# CLEAR
{not light_audit_done:
    # LIGHT_AUDIT
}

{
    - prep_light == 0:
        The power could go out any moment once the storm hits. You'll be in complete darkness.

        What's the safest thing to reach for first when the lights go out?

        + [Your phone flashlight]
            -> light_quiz_phone

        + [A candle]
            -> light_quiz_candle

        + [A flashlight kept in a known spot]
            -> light_quiz_right

    - else:
        You've prepared your light sources.
}

+ {prep_light > 0} [Continue preparing]
    -> light_hub

+ [← Back]
    -> preparation_hub

=== light_quiz_phone ===
# CLEAR

<b>Not ideal.</b>

Your phone flashlight works, but it drains the battery fast — and you'll need that battery for emergency calls. Save your phone for communication.

<i>Better approach: Keep a dedicated flashlight in a spot everyone knows.</i>

+ [Continue]
    -> light_hub

=== light_quiz_candle ===
# CLEAR

<b>Risky.</b>

Stumbling around in the dark looking for a candle and matches is a fire hazard. An open flame in a dark, unfamiliar situation can lead to accidents.

<i>Better approach: Reach for a flashlight first. Use candles only as backup, and never leave them unattended.</i>

+ [Continue]
    -> light_hub

=== light_quiz_right ===
# CLEAR

<b>Correct!</b>

A flashlight is safe, instant, and doesn't drain your phone. Keep it somewhere everyone in the house knows — so you can find it in the dark.

+ [Continue]
    -> light_hub

=== light_hub ===
# CLEAR
# LIGHT_HUB

~ prep_light = 1

<b>Light preparation:</b>
{light_flashlight: ✓ Flashlight sorted}
{light_batteries: ✓ Fresh batteries}
{light_headlamp: ✓ Hands-free light ready}
{light_lantern: ✓ Area light ready}
{light_candles: ✓ Candles ready (backup)}
{light_powerbank: ✓ Power bank charged}
{light_rationing: ✓ Plan to make it last}

What do you want to do?

// FLASHLIGHT — own it: find & position it; don't: add to shopping list
+ {not light_flashlight && owns_flashlight} [🔦 Find & check the flashlight — 3 min]
    ~ light_flashlight = true
    ~ current_time = current_time + 3
    -> light_result_flashlight

+ {not light_flashlight && not owns_flashlight && not shop_flashlight} [🛒 Add a flashlight to shopping list]
    ~ shop_flashlight = true
    -> light_shop_flashlight

// BATTERIES — only relevant once you have a flashlight to power
+ {light_flashlight && not light_batteries && not shop_batteries} [🔋 Search for spare batteries at home — 3 min]
    ~ current_time = current_time + 3
    -> light_result_search_batteries

+ {light_flashlight && not light_batteries && not shop_batteries} [🛒 Add batteries to shopping list]
    ~ shop_batteries = true
    -> light_result_shop_batteries

// HEADLAMP
+ {not light_headlamp && owns_headlamp} [💡 Set out a hands-free light — 3 min]
    ~ light_headlamp = true
    ~ current_time = current_time + 3
    -> light_result_headlamp

+ {not light_headlamp && not owns_headlamp && not shop_headlamp} [🛒 Add a headlamp to shopping list]
    ~ shop_headlamp = true
    -> light_shop_headlamp

// LANTERN
+ {not light_lantern && owns_lantern} [🏮 Set up an area light — 3 min]
    ~ light_lantern = true
    ~ current_time = current_time + 3
    -> light_result_lantern

+ {not light_lantern && not owns_lantern && not shop_lantern} [🛒 Add a lantern to shopping list]
    ~ shop_lantern = true
    -> light_shop_lantern

// CANDLES (backup) — set out if you have them; add matches if they'd be useless without
+ {not light_candles && owns_candles} [🕯️ Set out your candles — 3 min]
    ~ light_candles = true
    ~ current_time = current_time + 3
    -> light_result_candles

+ {owns_candles && not owns_matches && not shop_matches} [🛒 Add matches/lighter to shopping list]
    ~ shop_matches = true
    -> light_shop_matches

// POWER BANK — charge the one you own, or add one to the list
+ {not light_powerbank && owns_powerbank} [🔌 Charge a power bank for your phone — 2 min]
    ~ light_powerbank = true
    ~ current_time = current_time + 2
    -> light_result_powerbank

+ {not owns_powerbank && not shop_powerbank} [🛒 Add a power bank to shopping list]
    ~ shop_powerbank = true
    -> light_shop_powerbank

+ {not light_rationing} [🔆 Plan how to make your light last — 2 min]
    ~ light_rationing = true
    ~ current_time = current_time + 2
    -> light_result_rationing

+ [✓ Done with light]
    -> light_complete

+ [← Back to preparation]
    -> preparation_hub

=== light_shop_flashlight ===
# CLEAR
You add a <b>dedicated flashlight</b> to your shopping list — the single most important light to own, one per person if you can.
+ [← Back to light]
    -> light_hub

=== light_shop_headlamp ===
# CLEAR
You add a <b>headlamp</b> to your shopping list — hands-free light for cooking, first aid, or carrying a child in the dark.
+ [← Back to light]
    -> light_hub

=== light_shop_lantern ===
# CLEAR
You add a <b>lantern</b> to your shopping list — one area light fills a whole room so the family can stay together.
+ [← Back to light]
    -> light_hub

=== light_shop_matches ===
# CLEAR
You add <b>matches or a lighter</b> to your shopping list — without them those candles are just wax.
+ [← Back to light]
    -> light_hub

=== light_shop_powerbank ===
# CLEAR
You add a <b>power bank</b> to your shopping list — a charged one keeps the phone you need for alerts and calls alive for days.
+ [← Back to light]
    -> light_hub

=== light_result_flashlight ===
# CLEAR

You find the flashlight in the hall closet and click it on — the beam is weak and yellowish.

<b>The batteries are low.</b> It'll work for a while, but won't last the night. You need fresh batteries.

Now decide where it lives — so you can find it the moment the lights go out.

+ [🛏️ On the bedside table — within reach of bed]
    ~ flashlight_spot = 2
    -> light_spot_result
+ [🚪 By the front door / in the hallway]
    ~ flashlight_spot = 1
    -> light_spot_result
+ [🗄️ Just toss it back in the junk drawer]
    ~ flashlight_spot = 0
    -> light_spot_result

=== light_spot_result ===
# CLEAR

{
    - flashlight_spot == 2:
        You set it on the bedside table. If the power dies at night, your hand finds it before your feet hit the floor.

        <b>Best spot of all — a light you can reach without standing up in the dark is the one that prevents falls.</b>
    - flashlight_spot == 1:
        You leave it on the hallway shelf by the door, where the whole household passes and everyone can find it.

        <b>A shared, known spot beats a hidden one. Even better if you keep a second light by the bed.</b>
    - else:
        You drop it back in the junk drawer with the tape and old cables.

        <b>Out of sight, out of mind — in a real blackout you'd be digging through clutter in the pitch dark. Pick one spot everyone knows.</b>
}

+ [Continue]
    -> light_hub

=== light_result_search_batteries ===
# CLEAR

You rummage through kitchen drawers and the junk box in the hallway...

~ light_batteries = true

You find a pack of AA batteries tucked behind some old tape. They look unused — you swap them in and the beam is bright and strong.

<b>Battery sense: know which sizes your devices use (most lights are AA or AAA), keep a spare pack of each, and rotate old stock so it's never flat when you need it.</b>

+ [Continue]
    -> light_hub

=== light_result_shop_batteries ===
# CLEAR

You add <b>batteries</b> to your shopping list — the right sizes for your flashlight and any other devices.

<b>Buy a spare pack of each size your devices use, and check the dates so you're not storing batteries that are already half-dead.</b>

+ [Continue]
    -> light_hub

=== light_result_headlamp ===
# CLEAR

{owns_headlamp:
    You dig out the headlamp, check that it works, and leave it next to the flashlight.
- else:
    You don't have a headlamp yet, but you note it down — even a cheap one is worth it.
}

<b>A headlamp keeps both hands free — for cooking, first aid, fixing things, or carrying a child in the dark. Once you own one, it's usually the first light you'll reach for.</b>

+ [Continue]
    -> light_hub

=== light_result_lantern ===
# CLEAR

{owns_lantern:
    You set the lantern on the kitchen table where it can light the whole room.
- else:
    You don't have a lantern, but you note how useful one would be. In a pinch, standing a flashlight in a glass of water or aiming it at a white ceiling throws a softer, room-wide glow.
}

<b>Two kinds of light do two jobs: a flashlight or headlamp is a spot beam for moving and tasks; a lantern is area light that fills a room so the whole family can sit together. Aim to have both.</b>

+ [Continue]
    -> light_hub

=== light_result_candles ===
# CLEAR

You gather candles from around the house and find a box of matches in the kitchen drawer. You set them on stable, clear surfaces in the living room and kitchen.

<b>Candles are backup light, not your main plan — open flame is a leading cause of fires during power cuts. Never leave one burning unattended or near curtains, paper, or where a child or pet could knock it over, and blow them all out before sleep.</b>

+ [Continue]
    -> light_hub

=== light_result_powerbank ===
# CLEAR

You top up the power bank to full and set it by the door with a charging cable. While you're at it, you charge every other device to 100% — the power's still on for now.

<b>Your phone is your lifeline for alerts and emergency calls. A charged power bank can keep it alive for days — charge everything before the storm hits.</b>

+ [Continue]
    -> light_hub

=== light_result_rationing ===
# CLEAR
# NOTE_PROMPT: home

You think past tonight — the power could be out for three days, not three hours.

You make a plan: use the <b>lowest brightness</b> that's enough, light <b>only the room you're in</b>, and switch off the moment you leave. The battery-hungry jobs — cooking, fetching water, tidying — you'll do <b>while there's still daylight</b>, saving your lights for the dark.

<b>A light source is only as good as how long it lasts. Rationing can turn one night of power into three.</b>

For backup that never runs flat, you note two options: your <b>car can charge phones</b> through its USB port, and a <b>hand-crank or solar light</b> needs no batteries at all. And you keep a light in more than one place — bedroom, kitchen, and by an exit.

+ [Continue]
    -> light_hub

=== light_complete ===
# CLEAR

{
    - light_flashlight && (light_batteries || shop_batteries) && (light_headlamp || light_lantern) && light_powerbank && light_rationing:
        ~ prep_light = 2
        <b>Fully prepared!</b>

        A flashlight with fresh batteries, a hands-free or area light, a charged power bank — and a plan to make it all last three nights. You won't be caught in the dark.

    - light_flashlight && (light_batteries || shop_batteries) && (light_headlamp || light_lantern) && light_powerbank:
        ~ prep_light = 2
        <b>Well prepared!</b>

        A flashlight with fresh batteries, a hands-free or area light ready, and a charged power bank for your phone. One thing left to think about: how to make it all last three nights, not three hours.

    - light_flashlight && (light_batteries || shop_batteries):
        ~ prep_light = 2
        <b>Good preparation.</b>

        A working flashlight with power is the core of it. A headlamp, a lantern, and a charged power bank would round things out.

    - light_flashlight:
        <b>Basic preparation.</b>

        You have a flashlight, but {light_batteries == false && not shop_batteries: the batteries are weak — sort that before the storm.}{light_batteries || shop_batteries: it could use some backup light too.}

    - else:
        <b>You haven't sorted a light source yet.</b>

        Without reliable light, moving around the house at night will be dangerous.
}

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// INFORMATION CATEGORY
// ============================================
VAR info_radio = false
VAR info_radio_batteries = false
VAR info_phone_charged = false
VAR info_contact_plan = false
// Set by the React RumorSort overlay
VAR info_drill_done = false
VAR info_drill_score = 0

=== category_info ===
# CLEAR
{not info_drill_done:
    -> info_drill
}

{
    - prep_info == 0:
        When the power goes out, you lose Wi-Fi, TV, and eventually phone signal. How will you stay informed?

        Your phone battery is at 70%. The power could go out any time. What's the best way to get updates during the storm?

        + [Keep checking social media on your phone]
            -> info_quiz_social

        + [Turn on a battery-powered radio]
            -> info_quiz_right

        + [Call a friend to ask what's happening]
            -> info_quiz_call

    - else:
        You've set up your communication plan.
}

+ {prep_info > 0} [Continue preparing]
    -> info_hub

+ [← Back]
    -> preparation_hub

=== info_quiz_social ===
# CLEAR

<b>Bad idea.</b>

Scrolling social media drains your phone battery fast. And once the mobile network goes down, you'll have no internet at all. You need that battery for emergency calls.

<i>Better approach: A battery-powered radio doesn't need internet or phone signal. It receives emergency broadcasts directly.</i>

+ [Continue]
    -> info_hub

=== info_quiz_right ===
# CLEAR

<b>Correct!</b>

A battery-powered radio works without internet, phone signal, or electricity. It's your lifeline for official emergency updates and instructions.

+ [Continue]
    -> info_hub

=== info_quiz_call ===
# CLEAR

<b>Not ideal.</b>

Phone calls drain battery, and your friend probably knows as much as you do. In a crisis, save your phone battery for emergency calls — 112, 1220, 1247.

<i>Better approach: Use a battery-powered radio for updates. Save your phone for when you really need it.</i>

+ [Continue]
    -> info_hub

=== info_hub ===
# CLEAR

~ prep_info = 1

{info_radio: ✓ Radio found}
{info_radio_batteries: ✓ Radio batteries}
{info_phone_charged: ✓ Phone charged & ready}
{info_drill_done: ✓ Practised spotting rumors}
{info_contact_plan: ✓ Contact plan agreed}

+ {not info_radio} [📻 Find the battery radio — 3 min]
    ~ info_radio = true
    ~ current_time = current_time + 3
    -> info_result_radio

+ {info_radio && not info_radio_batteries && not shop_batteries} [🔋 Search for spare batteries — 3 min]
    ~ current_time = current_time + 3
    -> info_result_search_batteries

+ {info_radio && not info_radio_batteries && not shop_batteries} [🛒 Add batteries to shopping list]
    ~ shop_batteries = true
    -> info_result_shop_batteries

+ {not info_phone_charged} [📱 Charge phone & set up power saving — 2 min]
    ~ info_phone_charged = true
    ~ current_time = current_time + 2
    -> info_result_phone

+ {not info_contact_plan} [📋 Agree how to reach each other — 2 min]
    ~ info_contact_plan = true
    ~ current_time = current_time + 2
    -> info_result_contact_plan

+ [✓ Done with information]
    -> info_complete

+ [← Back to preparation]
    -> preparation_hub

=== info_drill ===
# CLEAR
# RUMOR_SORT
-> info_drill_result

=== info_drill_result ===
# CLEAR

{
    - info_drill_score >= 5:
        <b>Sharp eye.</b> You sorted the official alerts from the panic with barely a slip.
    - info_drill_score >= 3:
        <b>Not bad.</b> You caught most of the rumors — a couple slipped past.
    - else:
        <b>Tricky, isn't it?</b> Several rumors got past you. In a real crisis that's how panic spreads.
}

The rule that holds up: <b>trust official sources, verify anything unconfirmed before you act, and never forward what you can't stand behind.</b> A calm head is part of being prepared.

+ [Continue]
    -> category_info

=== info_result_radio ===
# CLEAR

You dig through the hall closet and find the old battery radio. You turn the dial — static, then faint voices. The emergency broadcast still comes through.

<b>The batteries are low though. It might last a few hours at most.</b>

A radio is your lifeline when the internet and mobile network go down. In Estonia, official emergency information goes out over <b>Vikerraadio</b>, alongside <b>EE-ALARM</b> alerts to your phone and updates on <b>kriis.ee</b> — worth knowing where to turn before you need it.

+ [Continue]
    -> info_hub

=== info_result_search_batteries ===
# CLEAR

~ info_radio_batteries = true

You check the kitchen drawer — there's a set of batteries that fit the radio. You swap them in and test it.

<b>Clear signal. The radio is ready to go.</b>

+ [Continue]
    -> info_hub

=== info_result_shop_batteries ===
# CLEAR

You add <b>batteries</b> to your shopping list. Fresh ones from the store will cover both the flashlight and radio.

+ [Continue]
    -> info_hub

=== info_result_phone ===
# CLEAR

You plug your phone in to charge while the power is still on.

While it charges, you switch on power saving mode and turn off background apps.

<b>Tips for a crisis:</b>
• Turn off Wi-Fi, Bluetooth, and location when not needed
• Lower screen brightness
• Only use your phone for emergency calls
• Remember — you wrote down the emergency numbers, right? If your phone dies, that paper is your backup.

+ [Continue]
    -> info_hub

=== info_result_contact_plan ===
# CLEAR

You take two minutes to agree how you'll stay in touch if the storm separates you or the network jams.

<b>Your plan:</b>
• <b>Text, don't call</b> — short messages get through when congested networks block voice calls, and they sip far less battery.
• Pick <b>one out-of-area contact</b> everyone messages to relay news — often easier to reach than each other.
• Agree a simple <b>meeting point</b>, and who checks on whom.

Exactly who's on the list is up to your household — the point is that everyone knows the plan before they need it.

+ [Continue]
    -> info_hub

=== info_complete ===
# CLEAR

{
    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged && info_drill_done:
        ~ prep_info = 2
        <b>Fully prepared!</b>

        Radio ready with batteries, phone charged and in power-save mode — and a clear head for telling real alerts from rumors. You'll stay informed no matter what.

    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged:
        ~ prep_info = 2
        <b>Well prepared.</b>

        Radio ready, phone charged. {info_drill_done: | One thing left: practise telling official alerts from the rumors that fly in a crisis.}

    - info_radio:
        <b>Basic preparation.</b>

        You have the radio, but {info_radio_batteries == false: the batteries are weak — it might not last.}{info_radio_batteries: you could also charge your phone while there's still power.}

    - else:
        <b>No radio found.</b>

        Without a radio, you'll be relying entirely on your phone — and that battery won't last forever.
}

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// MEDICATION CATEGORY
// ============================================

VAR med_pills_counted = false
VAR med_organized = false
VAR med_first_aid = false
VAR med_fridge = false
VAR med_card = false
// Set by the React CabinetCheck overlay
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
                {elderly_relation} takes blood pressure medication daily. If pharmacies close, they can't get more.
            - has_children:
                {children_count == 1: Your child may need | Your children may need} fever reducers or prescription medication.
            - else:
                Check your personal medication supply and first-aid kit.
        }

        In a crisis, pharmacies may be closed for days. Which is most critical to keep well-stocked?

        + [Pain medication]
            -> med_quiz_pain

        + [Prescription medicine]
            -> med_quiz_right

        + [First-aid kit]
            -> med_quiz_firstaid

    - else:
        {has_elderly:
            You've started preparing {elderly_relation}'s medication.
        - else:
            You've started preparing your medication supplies.
        }
}

+ {prep_medication > 0} [Continue preparing]
    -> medication_hub

+ [← Back]
    -> preparation_hub

=== med_cabinet ===
# CLEAR
# MED_CABINET
-> med_cabinet_result

=== med_cabinet_result ===
# CLEAR
# NOTE_PROMPT: meds

~ med_pills_counted = true
~ med_first_aid = true

{
    - med_cabinet_score >= med_cabinet_total:
        <b>Sharp eye.</b> You spotted the expired boxes and the low stock without trouble.
    - med_cabinet_score >= med_cabinet_total - 1:
        <b>Decent check.</b> You caught most of it — a call or two was off.
    - else:
        <b>Worth a closer look.</b> A few expired or low items slipped past — easy to miss, easy to fix.
}

{shop_meds: The gaps are on your shopping list now. }<b>Check dates twice a year, keep a 7-day buffer of any prescription, and return old medicines to a pharmacy — never the bin.</b>

+ [Continue]
    -> category_medication

=== med_quiz_pain ===
# CLEAR

<b>Important, but not the priority.</b>

Painkillers and fever reducers are useful, but you can survive without them. Grandmother's blood pressure medication is critical — missing even one dose could be dangerous.

<i>Always check prescription medicines first.</i>

+ [Continue]
    -> medication_hub

=== med_quiz_right ===
# CLEAR

<b>Correct!</b>

Prescription medicines are the top priority. Missing doses of blood pressure medication can be life-threatening. Always ensure at least a 7-day supply.

+ [Continue]
    -> medication_hub

=== med_quiz_firstaid ===
# CLEAR

<b>Good idea, but not the first priority.</b>

A first-aid kit is important, but grandmother's daily prescription medication is critical. Without it, her health could deteriorate fast.

<i>Check prescription medicines first, then the first-aid kit.</i>

+ [Continue]
    -> medication_hub

=== medication_hub ===
# CLEAR

~ prep_medication = 1

{med_cabinet_done: ✓ Cabinet checked}
{med_organized: ✓ Pills organized by day}
{med_fridge: ✓ Fridge-medicine plan}
{med_card: ✓ Emergency medicine card}

+ {not med_organized} [🗂️ Organize pills by day — 3 min]
    ~ med_organized = true
    ~ current_time = current_time + 3
    -> med_result_organize

+ {not med_fridge} [🧊 Plan for refrigerated medicines — 2 min]
    ~ med_fridge = true
    ~ current_time = current_time + 2
    -> med_result_fridge

+ {not med_card} [📝 Write an emergency medicine card — 3 min]
    ~ med_card = true
    ~ current_time = current_time + 3
    -> med_result_card

+ [✓ Done with medication]
    -> medication_complete

+ [← Back to preparation]
    -> preparation_hub

=== med_result_fridge ===
# CLEAR

{has_elderly:
    You think about anything that lives in the fridge — {elderly_relation}'s medicines, insulin, certain eye drops.
- else:
    You think about anything that lives in the fridge — insulin, some antibiotics, certain eye drops.
}

With the power out, a fridge stays cold for about <b>4 hours unopened</b>. Beyond that, you'd move cold medicines into a <b>cool bag with ice packs</b> and keep the fridge door shut as much as possible.

<b>Know which of your medicines must stay cold and how long they can be out — your pharmacist can tell you. For some, a few warm hours is fine; for others it isn't.</b>

+ [Continue]
    -> medication_hub

=== med_result_card ===
# CLEAR

You write a simple card for each person at home: their <b>medicines and doses</b>, any <b>allergies</b>, ongoing <b>conditions</b>, and the numbers for your <b>doctor and pharmacy</b>.

One copy goes in the first-aid kit, and you snap a photo of it on your phone.

<b>If you can't speak for yourself — or someone has to help a family member — this card tells them what matters in seconds. It's one of the most useful things in any emergency kit.</b>

+ [Continue]
    -> medication_hub

=== med_result_organize ===
# CLEAR

{has_elderly:
    You sort {elderly_relation}'s pills into a small box, organized by day. Morning dose, evening dose — clearly separated.

    You place the box by their bed with a glass of water, their reading glasses, and a small bell they can ring if they need you.

    <b>They'll have everything within reach, even in the dark.</b>
- else:
    You sort the pills into a small box, organized by day. Morning dose, evening dose — clearly separated.

    You place the box within easy reach with a glass of water.

    <b>Everything within reach, even in the dark.</b>
}

+ [Continue]
    -> medication_hub

=== medication_complete ===
# CLEAR

{
    - med_cabinet_done && med_organized && med_fridge && med_card:
        ~ prep_medication = 2
        {has_elderly: {elderly_relation}'s medicines are sorted, in date, and within reach. | Your medicines are sorted, in date, and within reach.} Fridge plan and emergency card done. You're well prepared.
    - med_cabinet_done && (med_organized || med_card):
        ~ prep_medication = 2
        <b>Well prepared.</b> The cabinet's checked and the essentials are sorted. {not med_fridge: A plan for any fridge medicines would round it off.}
    - med_cabinet_done:
        ~ prep_medication = 1
        <b>Basics done.</b> You've checked the cabinet — organizing the pills by day and writing a medicine card would make a real difference if things get hard.
    - else:
        ~ prep_medication = 1
        You've thought about medication, but haven't done much yet.
}

+ [← Back to preparation]
    -> preparation_hub

=== preparation_complete ===

# CLEAR
~ in_preparation = false

You've done what you can.

{current_time >= storm_time - 10:
    The wind is howling outside. The storm is here.
- else:
    The storm will arrive soon.
}

Time to rest before the worst of it hits.

* [Sleep]
    -> blackout

=== blackout ===
# AUDIOLOOP:
# CLEAR
# SLEEP_FADE

* [Wake up]
    -> wake_up

=== wake_up ===

# CLEAR
# WEATHER_STAGE: 2
# STORM_ARRIVAL
# CLASS: fade-in-scene
# CLASS: room-dark
# BACKGROUND: ../Images/Room.jpg
# AUDIOLOOP: ../Sound/wind.wav

You wake up. The storm has arrived — wind hammering the walls, rattling the windows. The house hum is gone. No heating. No electricity.

* [Look at the time]
    -> check_time_again

=== check_time_again ===
#CLEAR

<span class="clock-display">3:47 AM</span>

The power is out. The storm must have taken down the lines.

* [Reach for a light]
    -> reach_for_light

=== reach_for_light ===
# CLEAR
{not flashlight_search_done:
    # FLASHLIGHT_SEARCH
}
-> crisis_night

// ============================================
// CRISIS — NIGHT
// ============================================
=== crisis_night ===
# CLEAR
# CONSEQUENCE: light

{not search_found:
    ~ phone_drained = true
}

{
    - not search_found && not light_flashlight:
        Your hand closes on nothing. You never set a flashlight aside — there's no light to reach for. Your phone becomes the only lamp, screen blazing as you carry it room to room. By morning it's down to 9%.
    - not search_found:
        You never get a proper light in your hands. Your phone screen lights the way — bright enough, but not made for this. By morning, the battery is at 23%.
    - search_known_spot:
        Your hand finds the flashlight exactly where you left it — out of the dark in {search_seconds} seconds. {light_batteries || shop_batteries: Steady and bright.| The beam is weak — the batteries are nearly gone — but it works.} Your phone stays in your pocket.
    - else:
        You find it eventually — but only after {search_seconds} long, anxious seconds of fumbling through drawers in the pitch black. {light_batteries || shop_batteries: At least the beam is strong.| And the beam is weak; the batteries are nearly gone.}
}

{search_found:
    {light_rationing:
        You keep it on its lowest useful setting and switch it off whenever you don't need it — this has to last for days, not hours.
    - else:
        You leave it burning bright, not yet thinking about how many more nights this light has to stretch.
    }
}

{light_flashlight:
    <b>A flashlight in a spot you can reach from bed turns a frightening scramble in the dark into a few seconds. Decide the spot — and make sure everyone knows it.</b>
}

* [Continue]
    -> night_heat

=== night_heat ===
# CLEAR
# CONSEQUENCE: heat

{
    - prep_heat == 0:
        {home_heating == "electric": Your electric heating dies the moment the power does.|{home_heating == "wood_gas": No fire is lit, and the house cools fast.|The district heating pump stops and the radiators go cold.}} Within an hour you can see your breath.{home_high_heat_loss:  The exposed walls give up heat even faster.} By dawn{has_elderly: , {elderly_relation} won't stop shivering — they need warmth you can't give them right now.| , your fingers are numb and the cold is relentless.}
    - prep_heat == 1:
        You pull every blanket you own and seal the worst of the drafts. Cold, but survivable. {has_elderly: {elderly_relation} sleeps fitfully.| You drift in and out of sleep.} By dawn you can see your breath.
    - else:
        You light the wood stove before the room drops more than a few degrees. {has_elderly: {elderly_relation} sleeps soundly through the night.| The room holds its warmth all night.}
}

* [Morning comes...]
    -> crisis_morning

// ============================================
// CRISIS — MORNING
// ============================================
=== crisis_morning ===
# CLEAR
# CONSEQUENCE: water

The taps run dry. The fridge is warming. The stove won't light.

{
    - prep_water == 0:
        You check every cupboard. One half-empty bottle. {has_elderly: {elderly_relation} gets it. You go without.| You ration it carefully — there's not enough.}
    - prep_water == 1:
        You have some water stored. Small cups, no waste. It has to last.
    - else:
        You pour a full glass. {has_elderly: One for {elderly_relation}, one for you.| Enough for everyone.} The supply will last days.
}

* [Continue]
    -> morning_food

=== morning_food ===
# CLEAR
# CONSEQUENCE: food

{
    - prep_food == 0:
        You open every cupboard. A box of crackers, a tin of sardines. That's it — no power means no cooking.
    - prep_food == 1:
        Bread and a few pantry basics. It'll do for today, but the bread won't last and there's nothing you can heat.
    - else:
        Canned food, crackers, energy bars. No cooking needed. You eat without worry.
}

* [Continue]
    -> morning_info

=== morning_info ===
# CLEAR
# CONSEQUENCE: info

{
    - prep_info == 0:
        No radio. Your phone battery is nearly gone. You have no idea what's happening outside or when this ends. The silence is pressing in.
    - prep_info == 1:
        You switch on the battery radio. Signal drifts in and out — fragments. "...power restored to...static...36 hours..." You catch enough to know help is coming. Eventually.
    - else:
        The battery radio comes on clearly. Power restored within 36 hours. You write it down and breathe a little easier.
}

* [Continue]
    -> morning_medication_check

=== morning_medication_check ===
-> morning_medication

=== morning_medication ===
# CLEAR
# CONSEQUENCE: medication

{
    - prep_medication == 0:
        {has_elderly:
            You search in the dark for {elderly_relation}'s medication. The bottles are jumbled together — labels impossible to read. You guess at the dose and hope it's right.
        - else:
            You search for the medication cabinet in the dark. The bottles are jumbled together — labels impossible to read. You guess at the dose and hope it's right.
        }
    - prep_medication == 1:
        {has_elderly:
            You find {elderly_relation}'s pills but they're loose in a bag. Hard to read the labels in low light. One pill or two? You do your best.
        - else:
            You find the pills but they're loose in a bag. Hard to read the labels in low light. One pill or two? You do your best.
        }
    - else:
        {has_elderly:
            {elderly_relation}'s pills are sorted in the bedside box — morning and evening doses clearly separated. They take them without needing help.
        - else:
            Your medication is organized by day. You take the right dose without scrambling in the dark.
        }
}

* [Continue]
    -> crisis_culmination

// ============================================
// CRISIS: CULMINATION
// ============================================
=== crisis_culmination ===
# CLEAR

~ total_prep = prep_water + prep_food + prep_heat + prep_light + prep_info + prep_medication

{
    - total_prep >= 10:
        You're managing. Warm enough, fed, hydrated, informed. You're in control.

    - total_prep >= 6:
        Some things handled, others not. You're getting by — harder than it should be.

    - total_prep >= 3:
        Cold, hungry, uncertain. Surviving, but barely.

    - else:
        Freezing. Nothing to eat or drink. No idea what's happening outside.
}

{
    - has_elderly && has_children:
        {elderly_relation} is in serious distress. The roads are blocked and you can't leave —
        {children_count == 1: your child needs you here. | your children need you here.} They need someone to come to you.
        <span class="note-hint">🗒️ Check your notes — which number sends help to you?</span>
    - has_elderly:
        {elderly_relation} calls out — weak, strained. Dizzy. Blood pressure feels wrong.
        They need medical attention. Not life-threatening, but they need help. The roads are blocked.
        <span class="note-hint">🗒️ Check your notes — which number fits this situation?</span>
    - has_children:
        Your child has broken out in hives and their throat is swelling. This is serious.
        This could be life-threatening. The roads are blocked.
        <span class="note-hint">🗒️ Check your notes — which number do you call for a life-threatening emergency?</span>
    - else:
        The power has been out for over 12 hours. You're not sure if it's been reported.
        You're starting to feel unwell — lightheaded and cold.
        <span class="note-hint">🗒️ Check your notes — which number handles power outages?</span>
}

+ {has_elderly && has_children} [Get your phone]
    -> call_rescue_scenario

+ {has_elderly && not has_children} [Get your phone]
    -> call_elderly_medical

+ {not has_elderly && has_children} [Get your phone]
    -> call_child_emergency

+ {not has_elderly && not has_children} [Get your phone]
    -> call_power_outage

// ============================================
// PHONE CALL KNOTS
// ============================================
=== call_elderly_medical ===
# CLEAR
~ current_call_scenario = "elderly_medical"
# PHONE_KEYPAD: elderly_medical

You pick up your phone. The battery shows 23%.

{elderly_relation} needs help. They're dizzy, strained — blood pressure feels wrong. Not life-threatening, but they need medical attention and you can't drive out. The roads are blocked.

{heard_broadcast:
    You remember the radio broadcast mentioned different numbers for different situations...
- else:
    You never heard the emergency numbers. You'll have to guess or try to remember what they might be...
}

<span class="note-hint">🗒️ Check your notes — which number fits this situation?</span>

+ [Continue]
    -> call_result

=== call_rescue_scenario ===
# CLEAR
~ current_call_scenario = "rescue_coordination"
# PHONE_KEYPAD: rescue_coordination

You pick up your phone. The battery shows 23%.

{elderly_relation} is in serious distress. {children_count == 1: Your child needs you here | Your children need you here} — you can't leave. You need someone to come to you. The roads are blocked.

{heard_broadcast:
    You remember the radio broadcast mentioned different numbers for different situations...
- else:
    You never heard the emergency numbers. You'll have to guess or try to remember what they might be...
}

<span class="note-hint">🗒️ Check your notes — which number sends help directly to you?</span>

+ [Continue]
    -> call_result

=== call_child_emergency ===
# CLEAR
~ current_call_scenario = "child_emergency"
# PHONE_KEYPAD: child_emergency

You pick up your phone. The battery shows 23%.

Your child is having a severe reaction — hives spreading, throat swelling. This is life-threatening. The roads are blocked and every second counts.

{heard_broadcast:
    You remember the radio broadcast mentioned different numbers for different situations...
- else:
    You never heard the emergency numbers. You'll have to guess or try to remember what they might be...
}

<span class="note-hint">🗒️ Check your notes — which number do you call for a life-threatening emergency?</span>

+ [Continue]
    -> call_result

=== call_power_outage ===
# CLEAR
~ current_call_scenario = "power_outage"
# PHONE_KEYPAD: power_outage

You pick up your phone. The battery shows {phone_drained: just 9% — you used it for light all night| 23%}.

The power has been out for over 12 hours. You're lightheaded and cold. You need to report this and get help.

{phone_drained:
    The screen dims to save what's left. You might have one call in it before it dies.
}

{heard_broadcast:
    You remember the radio broadcast mentioned different numbers for different situations...
- else:
    You never heard the emergency numbers. You'll have to guess or try to remember what they might be...
}

<span class="note-hint">🗒️ Check your notes — which number handles power outages?</span>

+ [Continue]
    -> call_result

// Legacy knot kept for compatibility
=== call_for_help ===
#CLEAR
# PHONE_KEYPAD: grandmother_emergency

You pick up your phone. The battery shows 23%.

Grandmother needs help. Not a life-threatening emergency, but she needs medical attention and you can't drive out - the roads are blocked.

{heard_broadcast:
    You remember the radio broadcast mentioned different numbers for different situations...
- else:
    You never heard the emergency numbers. You'll have to guess or try to remember what they might be...
}

<span class="note-hint">🗒️ Check your notes — which number fits this situation?</span>

+ [Continue]
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
        Within the hour, a rescue team arrives. They stabilize {elderly_relation} on site and check on {children_count == 1: the child. | the children.}

        "You did the right thing — calling 1247 brought a team directly to you."

    - has_elderly:
        Within the hour, a medical team arrives.

        They check on {elderly_relation} thoroughly. "They're dehydrated but stable," they say. "You did exactly the right thing calling the health advice line."

        As they help stabilize them, you feel a sense of relief.

    - has_children:
        The ambulance arrives in minutes. The paramedics administer epinephrine immediately.

        "You called the right number. A few more minutes and this could have been much worse."

        Your child stabilizes. You breathe again.

    - else:
        The power company logs your report as a priority area. By afternoon, a welfare check team arrives.

        "Good call using 1343 — that's exactly what it's for."

        The power comes back on by evening.
}

You were prepared. You paid attention. And when it mattered, you knew exactly what to do.

* [See your results]
    -> ending_summary

=== ending_partial ===
~ ending_type = "partial"
#CLEAR

Help arrives, though it took a bit longer than necessary.

{has_elderly:
    "They'll be fine," they say. "Though you could have called a more specific number for this situation — it would have been faster."

    {elderly_relation} is stabilized. You made a reasonable choice, even if not the perfect one.
- else:
    Help arrives. You made a reasonable choice — it got there, just not as fast as it could have been.
}

* [See your results]
    -> ending_summary

=== ending_delayed ===
~ ending_type = "delayed"
#CLEAR

Help arrives, but it took longer than it should have.

{has_elderly:
    "We need to take {elderly_relation} in," they say. "Calling 112 for a non-emergency tied up critical resources and delayed your call."
- else:
    Calling 112 when it wasn't a life-threatening emergency tied up critical resources and delayed your situation being handled.
}

* [See your results]
    -> ending_summary

=== ending_bad ===
~ ending_type = "bad"
#CLEAR

You wait. Hours pass.

{
    - has_elderly:
        Eventually, a neighbor with a working car checks on you and takes {elderly_relation} to the hospital.

        They recover, but it was close.
    - has_children:
        Eventually, a neighbor drives you and your child to the nearest clinic.

        It was close.
    - else:
        Eventually, a welfare worker doing rounds finds you.

        You recover, but it took far too long.
}

If only you had known the right number to call...

* [See your results]
    -> ending_summary

=== ending_summary ===
# CLEAR
# ENDING_SCREEN
-> END

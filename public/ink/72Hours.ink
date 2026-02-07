// 72 HOURS - Disaster Management Game
// ACT 1: THE NIGHT

// === VARIABLES ===
VAR temperature = -18

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

// Water containers filled
VAR water_target = 18
VAR water_collected = 0
VAR water_bottles = false
VAR water_pots = false
VAR water_bathtub = false
VAR water_jerrycan = false
VAR water_extra_bottles = false

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
VAR shop_visited = false

// Phone call outcome tracking
VAR call_outcome = ""
VAR dialed_number = ""
VAR heard_broadcast = false


// === STORY START ===
-> pen_and_paper

=== pen_and_paper ===
# CLEAR

<span style="font-size:4rem">✏️</span>

Grab a <b>pen and paper</b> — you'll need to note things down.

* [I'm ready]
    -> tv_start

=== tv_start ===
# AUDIOLOOP: ../Sound/wind.wav
# CLASS: tv-scene
# BACKGROUND: https://images.unsplash.com/photo-1552858725-2758b5fb1286?w=800
* [⚠ BREAKING NEWS]
    -> tv_news

=== tv_news ===

# CLEAR
# CLASS: tv-scene

  Severe storm warning for coastal Estonia.

  Wind speeds up to 120 km/h expected tonight.

  Storm arrives at 22:00.

* [Continue]
     -> emergency_broadcast

=== emergency_broadcast ===
# CLEAR
# RADIO_BROADCAST
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

Your grandmother is asleep in her room.

Her blood pressure medication is on the kitchen counter.

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

+ {(shop_water || shop_food || shop_batteries) && not shop_visited} [🛒 Go to Store]
    -> go_to_store

+ [Done preparing - wait for storm]
    -> preparation_complete


// ============================================
// WATER CATEGORY
// ============================================
=== category_water ===
# CLEAR

You're in the kitchen, looking at the tap.

{
    - prep_water == 0:
        The water is still running now, but if the power goes out, the electric pump won't work. You should store some water.
    - prep_water == 1:
        You've collected some water, but maybe not enough.
    - else:
        You've filled plenty of containers. You should be good for days.
}

+ {prep_water == 0} [Figure out how much water you need]
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

The rule is: <b>3 liters per person per day</b>

You live here with grandmother. That's 2 people.
The storm could last up to 3 days.

How much water do you need in total?

<span class="note-hint">📝 Remember the formula — it could help later.</span>

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

<b>Not quite...</b>

That's not enough for 2 people over 3 days.

Remember: 3L × 2 people × 3 days = <b>18 liters minimum</b>

+ [Try again]
    -> water_calculation

=== water_calc_wrong_high ===
# CLEAR

<b>That's more than the minimum!</b>

The calculation is: 3L × 2 people × 3 days = <b>18 liters</b>

Having extra water isn't bad, but 18 liters is the minimum you need. Let's aim for at least that.

+ [Continue]
    -> water_containers_intro

=== water_calc_correct ===
# CLEAR

<b>Correct!</b>

3L × 2 people × 3 days = <b>18 liters</b>

That's the minimum you need for drinking. More is always better if you have time.

+ [Continue]
    -> water_containers_intro

// ============================================
// WATER CONTAINERS
// ============================================
=== water_containers_intro ===
# CLEAR

You look around the house for containers...

You spot a few water bottles in the fridge and cupboard.

~ water_bottles = true
~ water_collected = water_collected + 4

<b>+4 liters found (existing bottles)</b>

What else can you do?

+ [Continue]
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

{water_bottles: ✓ Water bottles (4L)}
{water_pots: ✓ Cooking pots (6L)}
{water_extra_bottles: ✓ Extra bottles from around the house (6L)}
{water_bathtub: ✓ Bathtub (non-drinking)}

+ {not water_bottles} [Fill empty bottles from the tap (4L) — 5 min]
    ~ water_bottles = true
    ~ water_collected = water_collected + 4
    ~ current_time = current_time + 5
    -> water_container_result_bottles

+ {not water_pots} [Fill cooking pots with lids (6L) — 8 min]
    ~ water_pots = true
    ~ water_collected = water_collected + 6
    ~ current_time = current_time + 8
    -> water_container_result_pots

+ {not water_extra_bottles} [Search house for more bottles & fill them (6L) — 10 min]
    ~ water_extra_bottles = true
    ~ water_collected = water_collected + 6
    ~ current_time = current_time + 10
    -> water_container_result_extra_bottles

+ {not water_bathtub} [Fill the bathtub — 10 min]
    ~ water_bathtub = true
    ~ current_time = current_time + 10
    -> water_container_result_bathtub

+ {not shop_water} [Add bottled water to shopping list instead]
    ~ shop_water = true
    ~ shop_water_amount = water_target - water_collected
    {shop_water_amount < 0:
        ~ shop_water_amount = 0
    }
    -> water_added_to_list

+ [Done collecting water]
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

=== water_container_result_extra_bottles ===
# CLEAR

You search the whole house — closets, garage, grandmother's room. You find old juice bottles, a thermos, and some glass jars.

You rinse them out and fill them from the tap.

<b>+6 liters</b>

It took a while, but every container counts. Label them so you know it's drinking water.

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

        You've collected {water_collected} liters of drinking water — that covers the {water_target}L needed for 2 people over 3 days.

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

+ {prep_food == 0} [Check what's in the kitchen (10 min)]
    ~ prep_food = 1
    ~ current_time = current_time + 10
    -> food_kitchen_result

+ {not shop_food} [Add emergency food to shopping list]
    ~ shop_food = true
    -> food_added_to_list

+ [← Back]
    -> preparation_hub

=== food_kitchen_result ===
# CLEAR

You check the pantry and fridge.

There's some bread that will go stale in a day, a few cans of beans, half a pack of crackers, and some apples.

Not ideal for an emergency, but it's something. The bread and apples won't last long though...

+ {not shop_food} [Add emergency food to shopping list]
    ~ shop_food = true
    -> food_added_to_list

+ [← Back to preparation]
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

{
    - prep_heat == 0:
        You think ahead — when the power goes out, the central heating stops. It's -18°C outside.

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

+ {prep_heat > 0} [← Back]
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

~ prep_heat = 1

<b>Heat preparation:</b>
{heat_sealed: ✓ Windows & ventilation sealed}
{heat_one_room: ✓ Warm room set up}
{heat_stove: ✓ Wood stove ready}
{heat_pipes: ✓ Pipes insulated}
{heat_clothing: ✓ Warm clothes gathered}

What do you want to do?

+ {not heat_sealed} [Seal windows & ventilation — 3 min]
    ~ heat_sealed = true
    ~ current_time = current_time + 3
    -> heat_result_sealed

+ {not heat_one_room} [Move grandmother to living room — 3 min]
    ~ heat_one_room = true
    ~ current_time = current_time + 3
    -> heat_result_one_room

+ {not heat_stove} [Prepare wood stove & bring firewood — 10 min]
    ~ heat_stove = true
    ~ current_time = current_time + 10
    -> heat_result_stove

+ {not heat_pipes} [Insulate water pipes — 3 min]
    ~ heat_pipes = true
    ~ current_time = current_time + 3
    -> heat_result_pipes

+ {not heat_clothing} [Gather warm clothes & blankets — 3 min]
    ~ heat_clothing = true
    ~ current_time = current_time + 3
    -> heat_result_clothing

+ [Done with heat]
    -> heat_complete

=== heat_result_sealed ===
# CLEAR

You switch off the forced ventilation, shut every window, and stuff towels along drafty gaps under doors.

<b>Every sealed gap keeps precious warmth inside.</b>

+ [Continue]
    -> heat_hub

=== heat_result_one_room ===
# CLEAR

You set up a comfortable spot for grandmother in the living room — pillows, her blanket, medication nearby. You close the doors to all other rooms.

<b>One room is easier to heat, and every person gives off body heat — staying together helps.</b>

+ [Continue]
    -> heat_hub

=== heat_result_stove ===
# CLEAR

You check the flue — it opens. You clear old ash and haul armloads of firewood from the shed. The stove is ready to light at a moment's notice.

<b>Always check the flue before lighting. Never leave a fire unattended. Keep a fire blanket nearby.</b>

+ [Continue]
    -> heat_hub

=== heat_result_pipes ===
# CLEAR

You wrap exposed pipes with old towels and rags. Not perfect insulation, but it could prevent a burst pipe.

<b>A burst pipe in a frozen house is a disaster on top of a disaster. A slow drip from taps also helps — moving water freezes slower.</b>

+ [Continue]
    -> heat_hub

=== heat_result_clothing ===
# CLEAR

You dig out wool sweaters, thermal socks, grandmother's thick quilts. Warm clothes for both of you, ready to go.

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

=== category_light ===
# CLEAR

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

+ {prep_light > 0} [← Back]
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

~ prep_light = 1

{light_flashlight: ✓ Flashlight found}
{light_batteries: ✓ Fresh batteries}
{light_candles: ✓ Candles & matches}

+ {not light_flashlight} [Find the flashlight — 3 min]
    ~ light_flashlight = true
    ~ current_time = current_time + 3
    -> light_result_flashlight

+ {light_flashlight && not light_batteries && not shop_batteries} [Search for spare batteries at home — 3 min]
    ~ current_time = current_time + 3
    -> light_result_search_batteries

+ {light_flashlight && not light_batteries && not shop_batteries} [Add batteries to shopping list]
    ~ shop_batteries = true
    -> light_result_shop_batteries

+ {not light_candles} [Gather candles & matches — 3 min]
    ~ light_candles = true
    ~ current_time = current_time + 3
    -> light_result_candles

+ [Done with light]
    -> light_complete

=== light_result_flashlight ===
# CLEAR

You find the flashlight in the hall closet. You click it on — the beam is weak and yellowish.

<b>The batteries are low.</b> It'll work for a while, but won't last the night.

You need fresh batteries.

+ [Continue]
    -> light_hub

=== light_result_search_batteries ===
# CLEAR

You rummage through kitchen drawers and the junk box in the hallway...

~ light_batteries = true

You find a pack of AA batteries tucked behind some old tape. They look unused.

<b>You swap them in — the beam is bright and strong.</b>

+ [Continue]
    -> light_hub

=== light_result_shop_batteries ===
# CLEAR

You add <b>batteries</b> to your shopping list. You'll grab fresh ones at the store.

+ [Continue]
    -> light_hub

=== light_result_candles ===
# CLEAR

You gather candles from around the house and find a box of matches in the kitchen drawer. You place them in the living room and kitchen — ready to light if needed.

<b>Candles are good backup light, but never leave them unattended. Keep them away from curtains and paper. Always have matches nearby.</b>

+ [Continue]
    -> light_hub

=== light_complete ===
# CLEAR

{
    - light_flashlight && (light_batteries || shop_batteries) && light_candles:
        ~ prep_light = 2
        <b>Well prepared!</b>

        Flashlight ready, batteries sorted, candles as backup. You won't be caught in the dark.

    - light_flashlight:
        <b>Basic preparation.</b>

        You have a flashlight, but {light_batteries == false: the batteries are weak.}{light_batteries: it could use some backup.}

    - else:
        <b>You haven't found a light source yet.</b>

        Without light, navigating the house at night will be dangerous.
}

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// INFORMATION CATEGORY
// ============================================
VAR info_radio = false
VAR info_radio_batteries = false
VAR info_phone_charged = false

=== category_info ===
# CLEAR

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

+ {prep_info > 0} [← Back]
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

+ {not info_radio} [Find the battery radio — 3 min]
    ~ info_radio = true
    ~ current_time = current_time + 3
    -> info_result_radio

+ {info_radio && not info_radio_batteries && not shop_batteries} [Search for spare batteries — 3 min]
    ~ current_time = current_time + 3
    -> info_result_search_batteries

+ {info_radio && not info_radio_batteries && not shop_batteries} [Add batteries to shopping list]
    ~ shop_batteries = true
    -> info_result_shop_batteries

+ {not info_phone_charged} [Charge phone & set up power saving — 2 min]
    ~ info_phone_charged = true
    ~ current_time = current_time + 2
    -> info_result_phone

+ [Done with information]
    -> info_complete

=== info_result_radio ===
# CLEAR

You dig through the hall closet and find the old battery radio. You turn the dial — static, then faint voices. The emergency broadcast frequency still works.

<b>The batteries are low though. It might last a few hours at most.</b>

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

=== info_complete ===
# CLEAR

{
    - info_radio && (info_radio_batteries || shop_batteries) && info_phone_charged:
        ~ prep_info = 2
        <b>Fully prepared!</b>

        Radio ready with batteries, phone charged and in power-save mode. You'll stay informed no matter what.

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

=== category_medication ===
# CLEAR

{
    - prep_medication == 0:
        Grandmother takes blood pressure medication daily. If pharmacies close, she can't get more.

        In a crisis, pharmacies may be closed for days. What should you check first?

        + [Pain medication stock]
            -> med_quiz_pain

        + [Prescription medicine supply]
            -> med_quiz_right

        + [First-aid kit]
            -> med_quiz_firstaid

    - else:
        You've started preparing grandmother's medication.
}

+ {prep_medication > 0} [Continue preparing]
    -> medication_hub

+ {prep_medication > 0} [← Back]
    -> preparation_hub

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

{med_pills_counted: ✓ Pills counted}
{med_organized: ✓ Medication organized}
{med_first_aid: ✓ First-aid kit checked}

+ {not med_pills_counted} [Count grandmother's pills — 2 min]
    ~ med_pills_counted = true
    ~ current_time = current_time + 2
    -> med_result_count

+ {med_pills_counted && not med_organized} [Organize medication by day — 3 min]
    ~ med_organized = true
    ~ current_time = current_time + 3
    -> med_result_organize

+ {not med_first_aid} [Check first-aid kit — 2 min]
    ~ med_first_aid = true
    ~ current_time = current_time + 2
    -> med_result_firstaid

+ [Done with medication]
    -> medication_complete

=== med_result_count ===
# CLEAR

You find grandmother's blood pressure pills on the kitchen counter and count them carefully.

<b>5 days' worth left.</b> That should last through the storm — but just barely.

<i>Experts recommend keeping at least a 7-day supply of prescription medicines at home.</i>

+ [Continue]
    -> medication_hub

=== med_result_organize ===
# CLEAR

You sort grandmother's pills into a small box, organized by day. Morning dose, evening dose — clearly separated.

You place the box by her bed with a glass of water, her reading glasses, and a small bell she can ring if she needs you.

<b>She'll have everything within reach, even in the dark.</b>

+ [Continue]
    -> medication_hub

=== med_result_firstaid ===
# CLEAR

You dig out the first-aid kit from the bathroom cabinet and check inside.

Bandages, antiseptic, painkillers, fever reducers... mostly intact. The painkillers expired last year.

<b>Not perfect, but it'll do.</b>

<i>A good emergency kit should include: bandages, antiseptic, painkillers, fever reducers, allergy medication, and any prescription medicines.</i>

+ [Continue]
    -> medication_hub

=== medication_complete ===
# CLEAR

{
    - med_pills_counted && med_organized && med_first_aid:
        ~ prep_medication = 2
        Grandmother's medication is sorted and within reach. First-aid kit is checked. You're well prepared.
    - med_pills_counted || med_first_aid:
        ~ prep_medication = 1
        You've done the basics. {not med_organized: Organizing the pills by day would make things easier for grandmother in the dark.}
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
# CLASS: blackout-scene
# BACKGROUND:

<div class="blackout-overlay"></div>

<i>Sound: Silence. Then a click. The hum of electronics stopping.</i>

<i>[Beat of darkness]</i>

* [Wake up]
    -> wake_up

=== wake_up ===

# CLEAR
# CLASS: fade-in-scene
# CLASS: room-dark
# BACKGROUND: ../Images/Room.jpg
# AUDIOLOOP: ../Sound/wind.wav

You wake up.

* [Look at the time]
    -> check_time_again

=== check_time_again ===
#CLEAR
3:47 AM

* [Turn on the light]
    -> turn_on_light

=== turn_on_light ===
#CLEAR
It is not working!

The power is out.

* [Check on grandmother]
    -> check_grandmother

=== check_grandmother ===
#CLEAR

You make your way through the dark house.

{prep_light >= 1:
    Your flashlight lights the way. You find grandmother quickly.
- else:
    You use your phone's flashlight. The battery indicator drops to 47%.
}

Grandmother is awake, confused by the darkness.

"What's happening?" she asks, her voice weak.

* [Reassure her]
    -> grandmother_condition

=== grandmother_condition ===
#CLEAR

Hours pass. The storm rages outside.

{prep_heat >= 2:
    The wood stove keeps the house warm. Grandmother rests comfortably.
- else:
    {prep_heat == 1:
        The blankets help, but the house is still cold. You huddle together for warmth.
    - else:
        Without heat, the temperature inside drops dangerously. You pile every blanket you can find on grandmother.
    }
}

{prep_water >= 1:
    You give her water with her medication.
- else:
    You realize you have nothing to drink. The taps don't work without the electric pump.
}

By morning, grandmother's condition has worsened. She's weak and needs medical attention.

The power is still out. You need to call for help.

* [Get your phone]
    -> call_for_help

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

<span class="note-hint">📝 Check your notes — which number fits this situation?</span>

What number do you dial?

* [Continue]
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
    -> call_for_help
}
{call_outcome == "no_help":
    -> ending_bad
}

-> ending_bad

=== ending_good ===
#CLEAR

Within the hour, a medical team arrives.

They check on grandmother thoroughly. "She's dehydrated but stable," they say. "You did exactly the right thing calling the health advice line."

As they help stabilize her, you feel a sense of relief.

You were prepared. You paid attention. And when it mattered, you knew exactly what to do.

<b>THE END</b>

<i>You successfully navigated the crisis by preparing well and remembering the correct number: 1220 for family doctor and health advice.</i>

-> END

=== ending_partial ===
#CLEAR

Help arrives, though it took a bit longer than necessary.

The rescue team checks on grandmother. "She'll be fine," they say. "Though for medical situations like this, the health advice line 1220 would have been faster. We're mainly handling rescue operations during the storm."

Grandmother is stabilized. You made a reasonable choice, even if not the perfect one.

<b>THE END</b>

<i>You called 1247 (Rescue Coordination) - they helped, but 1220 (Family Doctor / Health Advice) would have been the ideal choice for a medical situation.</i>

-> END

=== ending_delayed ===
#CLEAR

Help arrives, but it took longer than it should have.

The paramedics check on grandmother. "She's dehydrated and her blood pressure is concerning," they say. "We need to take her in."

Calling 112 for a non-life-threatening emergency tied up critical resources and delayed your call being processed.

<b>THE END</b>

<i>Remember: 112 is for life-threatening emergencies only. For health advice and non-emergency medical situations, call 1220.</i>

-> END

=== ending_bad ===
#CLEAR

You wait. Hours pass.

Eventually, a neighbor with a working car checks on you and takes grandmother to the hospital.

She recovers, but it was close.

If only you had known the right number to call...

<b>THE END</b>

<i>In an emergency, knowing the right numbers can save lives:
• 112 - Life-threatening emergencies
• 1220 - Family doctor / health advice
• 1247 - Rescue coordination
• 1343 - Power outage reporting</i>

-> END

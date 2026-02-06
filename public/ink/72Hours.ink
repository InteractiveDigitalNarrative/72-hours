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

+ {(shop_water || shop_food) && not shop_visited} [🛒 Go to Store]
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

<b>Water collected: {water_collected}L / {water_target}L target</b>

{water_bottles: ✓ Water bottles (4L)}
{water_pots: ✓ Cooking pots (6L)}
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

~ current_time = current_time + 35
~ shop_visited = true

You grab your coat and head to the nearby shop. The wind is already picking up.

The store is busy — others had the same idea.

{shop_water:
    You grab several large bottles of water — <b>{shop_water_amount} liters</b>.
    ~ water_collected = water_collected + shop_water_amount
    ~ prep_water = 2
}

{shop_food:
    Now for food. You grab a basket and head to the aisles.
    + [Start picking food]
        -> grocery_shopping
}

{not shop_food:
    You hurry back home with your supplies.

    <b>Time spent: 35 minutes</b>

    + [← Back to preparation]
        -> preparation_hub
}


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

=== grocery_shopping ===
# CLEAR

<b>Your basket:</b>
{food_canned: Canned food (meat, fish, vegetables) ✓}
{food_dried: Dried foods (pasta, rice, cereals) ✓}
{food_crackers: Crackers and biscuits ✓}
{food_nuts: Nuts and dried fruit ✓}
{food_energy_bars: Energy bars ✓}
{food_chocolate: Chocolate ✓}
{food_longlife_bread: Long-life bread ✓}
{food_honey_jam: Honey and jam ✓}
{food_frozen: Frozen meals ✓}
{food_fresh_produce: Fresh vegetables ✓}
{food_milk: Fresh milk ✓}
{food_yogurt: Yogurt ✓}

+ {not food_canned} [Add canned food (meat, fish, vegetables)]
    ~ food_canned = true
    -> grocery_feedback_good

+ {not food_dried} [Add dried foods (pasta, rice, cereals)]
    ~ food_dried = true
    -> grocery_feedback_okay

+ {not food_crackers} [Add crackers and biscuits]
    ~ food_crackers = true
    -> grocery_feedback_good

+ {not food_nuts} [Add nuts and dried fruit]
    ~ food_nuts = true
    -> grocery_feedback_good

+ {not food_energy_bars} [Add energy bars]
    ~ food_energy_bars = true
    -> grocery_feedback_good

+ {not food_chocolate} [Add chocolate]
    ~ food_chocolate = true
    -> grocery_feedback_good

+ {not food_longlife_bread} [Add long-life bread]
    ~ food_longlife_bread = true
    -> grocery_feedback_good

+ {not food_honey_jam} [Add honey and jam]
    ~ food_honey_jam = true
    -> grocery_feedback_good

+ {not food_frozen} [Add frozen meals]
    ~ food_frozen = true
    -> grocery_feedback_bad_frozen

+ {not food_fresh_produce} [Add fresh vegetables]
    ~ food_fresh_produce = true
    -> grocery_feedback_bad_fresh

+ {not food_milk} [Add fresh milk]
    ~ food_milk = true
    -> grocery_feedback_bad_milk

+ {not food_yogurt} [Add yogurt]
    ~ food_yogurt = true
    -> grocery_feedback_bad_yogurt

+ [Done shopping - head home]
    -> grocery_checkout

=== grocery_feedback_good ===
# CLEAR

<b>Good choice!</b>

This doesn't need refrigeration and is ready to eat. Perfect for an emergency.

+ [Continue shopping]
    -> grocery_shopping

=== grocery_feedback_okay ===
# CLEAR

<b>Okay choice.</b>

Dried foods last long, but remember - you might not be able to cook pasta or rice without power. Cereals are good though!

+ [Continue shopping]
    -> grocery_shopping

=== grocery_feedback_bad_frozen ===
# CLEAR

<b>Not ideal...</b>

Frozen meals will thaw and spoil when the power goes out. They'll only last a few hours.

You put it back on the shelf.
~ food_frozen = false

+ [Continue shopping]
    -> grocery_shopping

=== grocery_feedback_bad_fresh ===
# CLEAR

<b>Not ideal...</b>

Fresh vegetables will wilt and spoil within days without refrigeration. For a 72-hour emergency, they're not the best choice.

You put them back.
~ food_fresh_produce = false

+ [Continue shopping]
    -> grocery_shopping

=== grocery_feedback_bad_milk ===
# CLEAR

<b>Bad choice!</b>

Fresh milk spoils quickly without refrigeration - within hours in a warm house. It could make you sick.

You put it back.
~ food_milk = false

+ [Continue shopping]
    -> grocery_shopping

=== grocery_feedback_bad_yogurt ===
# CLEAR

<b>Bad choice!</b>

Yogurt needs to stay cold. Without power, it will spoil and could cause food poisoning.

You put it back.
~ food_yogurt = false

+ [Continue shopping]
    -> grocery_shopping

=== grocery_checkout ===
# CLEAR
~ prep_food = 2

You pay and hurry home with your supplies.

{food_canned || food_crackers || food_nuts || food_energy_bars || food_chocolate || food_longlife_bread:
    You've got good emergency food — things that don't need refrigeration or cooking.
- else:
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
=== category_heat ===
# CLEAR

The old wood stove sits in the corner of the living room.

{
    - prep_heat == 0:
        You haven't used it in years. If the heating goes out, it could get dangerously cold.
    - prep_heat == 1:
        You've gathered blankets and warm clothes.
    - else:
        The wood stove is ready and you have plenty of firewood inside.
}

+ {prep_heat == 0} [Gather blankets and warm clothes (10 min)]
    ~ prep_heat = 1
    ~ current_time = current_time + 10
    -> heat_result_basic

+ {prep_heat < 2} [Prepare wood stove and bring firewood (40 min)]
    ~ prep_heat = 2
    ~ current_time = current_time + 40
    -> heat_result_thorough

+ [← Back]
    -> preparation_hub

=== heat_result_basic ===
# CLEAR

You gather every blanket and warm item you can find.

Wool sweaters, thick socks, grandmother's old quilts. Layering will help if it gets cold.

+ [← Back to preparation]
    -> preparation_hub

=== heat_result_thorough ===
# CLEAR

You check the stove's flue, clear old ash, and haul armloads of firewood from the shed.

Your back protests with each trip, but now you have enough wood stacked inside to heat the house for days. The stove is ready to light at a moment's notice.

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// LIGHT CATEGORY
// ============================================
=== category_light ===
# CLEAR

You think about light sources.

{
    - prep_light == 0:
        Your phone has a flashlight, but the battery won't last forever.
    - prep_light == 1:
        You found the flashlight. Batteries seem okay.
    - else:
        You have the flashlight with fresh batteries, plus candles and matches.
}

+ {prep_light == 0} [Find the flashlight (10 min)]
    ~ prep_light = 1
    ~ current_time = current_time + 10
    -> light_result_basic

+ {prep_light < 2} [Fresh batteries + gather candles (20 min)]
    ~ prep_light = 2
    ~ current_time = current_time + 20
    -> light_result_thorough

+ [← Back]
    -> preparation_hub

=== light_result_basic ===
# CLEAR

You find the flashlight in the closet. The beam is a bit dim, but it works.

You click it on and off a few times. The batteries might last a night or two.

+ [← Back to preparation]
    -> preparation_hub

=== light_result_thorough ===
# CLEAR

You replace the flashlight batteries with fresh ones. The beam is bright and strong.

You also gather candles and matches, placing them strategically around the house - living room, kitchen, grandmother's room. You won't be left in the dark.

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// INFORMATION CATEGORY
// ============================================
=== category_info ===
# CLEAR

You need a way to get information if the power goes out.

{
    - prep_info == 0:
        Your phone works now, but batteries drain fast. And cell towers might go down.
    - prep_info == 1:
        You found the old radio. Batteries are low, but it works.
    - else:
        The radio has fresh batteries and you've tested it. You're ready to stay informed.
}

+ {prep_info == 0} [Find the battery radio (15 min)]
    ~ prep_info = 1
    ~ current_time = current_time + 15
    -> info_result_basic

+ {prep_info < 2} [Radio with fresh batteries (25 min)]
    ~ prep_info = 2
    ~ current_time = current_time + 25
    -> info_result_thorough

+ [← Back]
    -> preparation_hub

=== info_result_basic ===
# CLEAR

You dig through the closet and find the old radio.

You turn the dial and hear static, then voices - the emergency broadcast station. Batteries are low, but it works. This could be your lifeline to the outside world.

+ [← Back to preparation]
    -> preparation_hub

=== info_result_thorough ===
# CLEAR

You find the radio and replace the batteries with fresh ones.

You tune it to the emergency broadcast frequency and test it. Crystal clear. If anything happens, you'll know about it. You set it on the kitchen table, ready to go.

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// MEDICATION CATEGORY
// ============================================
=== category_medication ===
# CLEAR

Grandmother takes blood pressure medication daily.

{
    - prep_medication == 0:
        Her pills are on the kitchen counter, but you haven't checked how many are left.
    - prep_medication == 1:
        You checked - there's about 5 days worth left.
    - else:
        You've checked the supply and organized everything she needs within reach.
}

+ {prep_medication == 0} [Check medication supply (5 min)]
    ~ prep_medication = 1
    ~ current_time = current_time + 5
    -> medication_result_basic

+ {prep_medication < 2} [Organize all her medical needs (15 min)]
    ~ prep_medication = 2
    ~ current_time = current_time + 15
    -> medication_result_thorough

+ [← Back]
    -> preparation_hub

=== medication_result_basic ===
# CLEAR

You count the pills. Five days left. Should be enough... you hope.

You make a mental note of where they are. Grandmother will need them in the morning.

+ [← Back to preparation]
    -> preparation_hub

=== medication_result_thorough ===
# CLEAR

You check all her medications and organize them by day in a small box.

You place the box with a glass of water by her bed, along with her reading glasses and a small bell she can ring if she needs you in the night. She'll have everything within reach.

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

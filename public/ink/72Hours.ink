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

// Phone call outcome tracking
VAR call_outcome = ""
VAR dialed_number = ""
VAR heard_broadcast = false


// === STORY START ===
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
Martin: "Power's going to be out for days.

  Water. Light. Heat. Meds.

  Check everything NOW."
* [Check time]
    -> check_time
=== check_time ===

# CLEAR

* [20:00]
    -> hurry
=== hurry ===
#CLEAR
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
        The water is still running, but if the power goes out, the electric pump won't work.
    - prep_water == 1:
        You've filled a couple of bottles. Is that enough?
    - else:
        You've filled plenty of containers. You should be good for days.
}

+ {prep_water == 0} [Fill 2 bottles (10 min)]
    ~ prep_water = 1
    ~ current_time = current_time + 10
    -> water_result_basic

+ {prep_water < 2} [Fill many containers (25 min)]
    ~ prep_water = 2
    ~ current_time = current_time + 25
    -> water_result_thorough

+ [← Back]
    -> preparation_hub

=== water_result_basic ===
# CLEAR

You fill two large bottles. Quick and easy.

The water sloshes as you set them aside. It's something, but will it be enough for days?

+ [← Back to preparation]
    -> preparation_hub

=== water_result_thorough ===
# CLEAR

You find every container you can - bottles, pots, even the bathtub.

Heavy work, but now you have water for days. Your arms ache, but it's worth it.

+ [← Back to preparation]
    -> preparation_hub


// ============================================
// FOOD CATEGORY
// ============================================
=== category_food ===
# CLEAR

You're in the kitchen, checking the pantry.

{
    - prep_food == 0:
        If the power goes out, the fridge won't work. You need food that doesn't require cooking or refrigeration.
    - prep_food == 1:
        You've gathered some basics - bread, crackers, fruit.
    - else:
        You've organized a proper supply of long-lasting food.
}

+ {prep_food == 0} [Grab bread and crackers (5 min)]
    ~ prep_food = 1
    ~ current_time = current_time + 5
    -> food_result_basic

+ {prep_food < 2} [Organize proper emergency food (20 min)]
    ~ prep_food = 2
    ~ current_time = current_time + 20
    -> food_result_thorough

+ [← Back]
    -> preparation_hub

=== food_result_basic ===
# CLEAR

You grab bread, crackers, and some fruit. It'll do for a day or two.

You place them on the counter where they're easy to reach in the dark.

+ [← Back to preparation]
    -> preparation_hub

=== food_result_thorough ===
# CLEAR

You gather canned food, dried goods, nuts, and chocolate. Nothing that needs cooking or refrigeration.

You organize everything in a box - enough for a week if needed. Grandmother always said to be prepared.

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

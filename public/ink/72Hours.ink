// 72 HOURS - Disaster Management Game
// ACT 1: THE NIGHT

// === VARIABLES ===
VAR temperature = -18

VAR action_slots_used = 0
VAR action_slots_max = 4

// Preparation items
VAR has_torch = false
VAR has_water = false
VAR has_stove = false
VAR has_firewood = false
VAR has_medication = false
VAR has_radio = false
VAR has_emergency_numbers = false
VAR has_gate_release = false

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
You realize that you don't have enough time to prepare for everything. You can only choose 3-5 actions at most...
* [Start Preparation]
    -> preparation_intro 

=== preparation_intro ===

# CLEAR

You mentally go through what needs to be done...

* [Think of actions]
    -> preparation_phase
    
=== preparation_phase ===

  Actions Chosen {action_slots_used} of 4

  + {not has_torch} [🔦 Collect batteries for torch]
      ~ has_torch = true
      ~ action_slots_used++
      You check the torch. Fresh batteries. Good.
      -> next_action

  + {not has_water} [💧 Fill bottles with tap water]
      ~ has_water = true
      ~ action_slots_used++
      You fill several bottles. Heavy to carry, but essential.
      -> next_action

  + {not has_stove} [🔥 Check the wood stove works]
      ~ has_stove = true
      ~ action_slots_used++
      The old wood stove in the corner. You haven't used it in years. You check the flue, clear the ash. It works.
      -> next_action

  + {not has_firewood} [🪵 Bring extra firewood inside]
      ~ has_firewood = true
      ~ action_slots_used++
      You haul armload after armload from the shed. Your back protests, but now you have enough for days.
      -> next_action

  + {not has_medication} [💊 Check you have grandmother's medication supply]
      ~ has_medication = true
      ~ action_slots_used++
      You check Helgi's medication. Five days left. That should be enough... you hope.
      -> next_action

  + {not has_radio} [📻 Find the battery-powered radio]
      ~ has_radio = true
      ~ action_slots_used++
      You dig through the closet and find the old radio. Batteries are low, but it works. This will be your connection to the outside world if the power goes out.
      -> next_action

  + {not has_emergency_numbers} [📝 Write down emergency numbers]
      ~ has_emergency_numbers = true
      ~ action_slots_used++
      You copy the emergency numbers from the fridge magnet onto paper. Phone batteries don't last forever.
      -> next_action

  + {not has_gate_release} [🔧 Check the manual release on the front gate]
      ~ has_gate_release = true
      ~ action_slots_used++
      The electric gate won't work without power. You test the manual release mechanism. Stiff, but functional.
      -> next_action

  === next_action ===

  {action_slots_used < 4:
      -> preparation_phase
  - else:                                                        
      * [Continue]                                               
          -> preparation_complete
  }

=== preparation_complete ===

  # CLEAR

  You've done what you can. 

  The storm will be here in less than an hour.

  Time to rest before it hits.


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

{has_torch:
    Your torch lights the way. You find grandmother quickly.
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

{has_stove && has_firewood:
    The wood stove keeps the house warm. Grandmother rests comfortably.
- else:
    Without heat, the temperature inside drops steadily. You bundle grandmother in blankets.
}

{has_water:
    You give her water with her medication.
- else:
    You realize you have nothing to drink. The taps don't work without the electric pump.
}

By morning, grandmother's condition has worsened. She's weak, dehydrated, and needs medical attention.

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

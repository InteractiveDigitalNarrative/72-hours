// CallResult.jsx - Shows the consequence of the emergency call

import { useEffect } from 'react';
import './PhoneKeypad.css';
import { useAudioContext } from '../context/AudioContext';

// Define consequences for different numbers in different scenarios
const CALL_CONSEQUENCES = {
  // ── Legacy scenario (kept for compatibility) ───────────────────────────
  grandmother_emergency: {
    '112': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Emergency Line',
      message: `"112, what is your emergency?"

You explain grandmother's condition.

"Sir, this line is for life-threatening emergencies. Your grandmother's situation, while concerning, is not immediately life-threatening. You're tying up resources needed for critical cases."

They transfer you, but it takes extra time. Help will arrive, but delayed.`,
      outcome: 'help_delayed'
    },
    '1220': {
      type: 'success',
      icon: '✓',
      title: 'Family Doctor Advice Line',
      message: `"Health advice line, how can I help?"

You explain grandmother's condition - weak, dehydrated, needs medical attention but stable.

"You did the right thing calling. Based on what you're describing, she needs fluids and monitoring. I'm connecting you with crisis medical support who can send someone to check on her."

Within the hour, a medical team arrives. They stabilize grandmother and praise your quick thinking.

You called the right number for the right situation.`,
      outcome: 'help_success'
    },
    '1247': {
      type: 'partial',
      icon: '◐',
      title: 'Rescue Coordination',
      message: `"Rescue coordination, how can we help?"

You explain grandmother's condition.

"We can dispatch assistance, but for medical advice you should call 1220 - the family doctor line. They can better assess her condition. We'll still send someone, but it may take longer as we're prioritizing rescue operations."

Help arrives, but a direct call to 1220 would have been faster and more appropriate.`,
      outcome: 'help_partial'
    },
    '1343': {
      type: 'wrong',
      icon: '📞',
      title: 'Power Outage Line',
      message: `"Power outage reporting line. Please hold..."

[Automated menu plays]

"Press 1 to report an outage. Press 2 to check restoration status..."

This isn't what you need. You hang up and lose precious time.

What was the health advice number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    'default': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

That number doesn't exist. You need one of the real emergency lines.`,
      outcome: 'wrong_number',
      allowRetry: true
    }
  },

  // ── Scenario: Elderly relative needs medical advice ────────────────────
  // Correct number: 1220
  elderly_medical: {
    '1220': {
      type: 'success',
      icon: '✓',
      title: 'Family Doctor Advice Line',
      message: `"Health advice line, how can I help?"

You explain the situation — your relative is weak, dizzy, blood pressure feels wrong. Not life-threatening, but they need help and the roads are blocked.

"You did the right thing calling. Based on what you're describing, they need fluids and monitoring. I'm connecting you with crisis medical support who can send someone directly to you."

Within the hour, a medical team arrives. They stabilize your relative and check on you both.

You called the right number for the right situation.`,
      outcome: 'help_success'
    },
    '112': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Emergency Line',
      message: `"112, what is your emergency?"

You explain the situation.

"This line is for life-threatening emergencies. Your relative's condition, while concerning, is not immediately life-threatening. You're tying up resources needed for critical cases."

They transfer you, but it takes time. Help will arrive, but delayed.`,
      outcome: 'help_delayed'
    },
    '1247': {
      type: 'partial',
      icon: '◐',
      title: 'Rescue Coordination',
      message: `"Rescue coordination, how can we help?"

You explain the situation.

"We can dispatch assistance, but for medical advice you should call 1220 — the family doctor line. They can better assess your relative's condition. We'll still send someone, but it may take longer."

Help arrives eventually. A direct call to 1220 would have been faster.`,
      outcome: 'help_partial'
    },
    '1343': {
      type: 'wrong',
      icon: '📞',
      title: 'Power Outage Line',
      message: `"Power outage reporting line. Please hold..."

[Automated menu plays]

"Press 1 to report an outage. Press 2 to check restoration status..."

This isn't what you need. You hang up and lose precious time.

What was the health advice number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    'default': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

That number doesn't exist. Try one of the real emergency lines.`,
      outcome: 'wrong_number',
      allowRetry: true
    }
  },

  // ── Scenario: Elderly + children — need rescue to come to you ──────────
  // Correct number: 1247
  rescue_coordination: {
    '1247': {
      type: 'success',
      icon: '✓',
      title: 'Rescue Coordination',
      message: `"Rescue coordination, how can we help?"

You explain the situation — your relative is in distress, the children need you there, the roads are blocked. You need someone to come to you.

"Understood. We handle exactly this — coordinating rescue when people can't leave. We're dispatching a team to your address now."

A rescue team arrives within the hour. They help stabilize your relative on site and confirm your address is safe.

You called the right number.`,
      outcome: 'help_success'
    },
    '112': {
      type: 'partial',
      icon: '◐',
      title: 'Emergency Line',
      message: `"112, what is your emergency?"

You explain the situation.

"We can try to help. For coordinating a rescue team to come to you, 1247 is actually the right number — but we'll pass this along."

It takes longer than it should. Help eventually arrives, but the coordination wasn't ideal.`,
      outcome: 'help_partial'
    },
    '1220': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Family Doctor Advice Line',
      message: `"Health advice line, how can I help?"

You explain the situation — your relative is in serious distress, you can't leave because of the children, you need someone to come.

"I can give medical advice, but coordinating a physical rescue is outside what we do. You need to call 1247 — rescue coordination. They can send a team directly to you."

You lose precious time. What was the rescue number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    '1343': {
      type: 'wrong',
      icon: '📞',
      title: 'Power Outage Line',
      message: `"Power outage reporting line. Please hold..."

[Automated menu plays]

"Press 1 to report an outage. Press 2 to check restoration status..."

This isn't what you need at all. You hang up, frustrated.

What was the rescue coordination number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    'default': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

That number doesn't exist. You need the line that sends help directly to you.`,
      outcome: 'wrong_number',
      allowRetry: true
    }
  },

  // ── Scenario: Child severe allergic reaction — life-threatening ─────────
  // Correct number: 112
  child_emergency: {
    '112': {
      type: 'success',
      icon: '✓',
      title: 'Emergency Services',
      message: `"112, what is your emergency?"

You describe the situation — your child has broken out in hives, throat is swelling, can't breathe properly.

"This is anaphylaxis. Keep them calm and upright. Do you have an EpiPen? An ambulance is on the way — keep this line open."

The paramedics arrive and administer epinephrine immediately. Your child stabilizes.

112 was exactly the right call for a life-threatening emergency.`,
      outcome: 'help_success'
    },
    '1220': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Family Doctor Advice Line',
      message: `"Health advice line, how can I help?"

You describe the swelling throat, the hives.

"This sounds like anaphylaxis — this is a life-threatening emergency. You need to call 112 immediately. Every second counts. Hang up and call 112 now."

You lose precious seconds. What was the emergency number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    '1247': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Rescue Coordination',
      message: `"Rescue coordination, how can we help?"

You describe your child's condition.

"This is a medical emergency — you need 112 immediately. We coordinate logistics, not medical emergencies. Call 112 now."

You lose precious time. What was the emergency number again?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    '1343': {
      type: 'wrong',
      icon: '📞',
      title: 'Power Outage Line',
      message: `"Power outage reporting line. Please hold..."

[Automated menu plays]

You hang up immediately. Wrong number entirely.

Your child needs emergency help. What was that number?`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    'default': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

Your child needs help right now. That number doesn't exist — try the right emergency line.`,
      outcome: 'wrong_number',
      allowRetry: true
    }
  },

  // ── Scenario: Solo — power out 12+ hrs, feeling unwell ────────────────
  // Correct number: 1343
  power_outage: {
    '1343': {
      type: 'success',
      icon: '✓',
      title: 'Power Outage Reporting',
      message: `"Power outage reporting. What's your address?"

You report the outage and mention you've been without power for over 12 hours. You're starting to feel the cold — lightheaded and numb.

"Thank you. We're logging this area as a priority — there's been widespread outage. We also have a welfare check team. I'm noting your address."

Within hours, a welfare check arrives. The power comes back on by evening.

1343 was exactly the right number.`,
      outcome: 'help_success'
    },
    '112': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Emergency Line',
      message: `"112, what is your emergency?"

You explain you've had no power for 12 hours, feeling lightheaded and cold.

"For power outages, please call 1343 — that's the dedicated line. If your condition worsens to a medical emergency, call back here. For now, keep warm and call 1343."

They log the call but it adds to their load. You need to try 1343.`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    '1220': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Family Doctor Advice Line',
      message: `"Health advice line, how can I help?"

You explain the situation — power out, feeling lightheaded.

"For power outages, you need to call 1343. If you're feeling faint, that could be from cold — keep warm, drink water. But the outage itself should be reported to 1343."

Not the right number for this. Try 1343.`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    '1247': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Rescue Coordination',
      message: `"Rescue coordination, how can we help?"

You explain the situation.

"For power outages, please call 1343 — the power company's emergency line. If you need physical rescue, call back. For now, contact 1343."

Not the right number. Try 1343.`,
      outcome: 'wrong_number',
      allowRetry: true
    },
    'default': {
      type: 'wrong',
      icon: '⚠️',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

That number doesn't exist. Try one of the real emergency lines.`,
      outcome: 'wrong_number',
      allowRetry: true
    }
  },
};

function CallResult({ dialedNumber, scenario, attempts = 0, onContinue, onRetry }) {
  const scenarioConsequences = CALL_CONSEQUENCES[scenario] || CALL_CONSEQUENCES.grandmother_emergency;
  const consequence = scenarioConsequences[dialedNumber] || scenarioConsequences['default'];

  const attemptsUsed = attempts + 1;        // current attempt number (1-based)
  const canRetry = consequence.allowRetry && attempts < 2;
  const isLastChance = consequence.allowRetry && attempts === 1; // next wrong = final

  const { playSfx } = useAudioContext();
  useEffect(() => {
    if (consequence.type === 'success') {
      playSfx('success');
    } else {
      playSfx('fail');
    }
  }, [consequence.type, playSfx]);

  return (
    <div className="call-result-overlay">
      <div className={`call-result ${consequence.type}`}>
        <div className="call-result-icon">{consequence.icon}</div>
        <h3>{consequence.title}</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{consequence.message}</p>

        {consequence.allowRetry && (
          <p className="call-attempt-counter">
            Attempt {attemptsUsed} / 3
            {isLastChance && <span className="last-chance"> — last chance</span>}
          </p>
        )}

        {canRetry ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="continue-btn" onClick={() => { playSfx('click'); onRetry(); }}>
              Try Again
            </button>
            <button className="continue-btn secondary-btn" onClick={() => { playSfx('close'); onContinue('no_help'); }}>
              Give Up
            </button>
          </div>
        ) : consequence.allowRetry ? (
          // attempts >= 2: third wrong dial — no more retries
          <button className="continue-btn" onClick={() => { playSfx('click'); onContinue('no_help'); }}>
            Continue
          </button>
        ) : (
          <button className="continue-btn" onClick={() => { playSfx('click'); onContinue(consequence.outcome); }}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default CallResult;

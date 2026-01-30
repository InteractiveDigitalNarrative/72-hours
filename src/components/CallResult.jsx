// CallResult.jsx - Shows the consequence of the emergency call

import './PhoneKeypad.css';

// Define consequences for different numbers in different scenarios
const CALL_CONSEQUENCES = {
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
      type: 'critical',
      icon: '✗',
      title: 'Number Not Recognized',
      message: `Beep... beep... beep...

"The number you have dialed is not in service."

You don't know the right number to call. Without paying attention to the emergency broadcast, you never learned the correct numbers.

You'll have to wait and hope someone comes to check on you.`,
      outcome: 'no_help'
    }
  }
};

function CallResult({ dialedNumber, scenario, onContinue, onRetry }) {
  // Get the consequence for this number and scenario
  const scenarioConsequences = CALL_CONSEQUENCES[scenario] || CALL_CONSEQUENCES.grandmother_emergency;
  const consequence = scenarioConsequences[dialedNumber] || scenarioConsequences['default'];

  return (
    <div className="call-result-overlay">
      <div className={`call-result ${consequence.type}`}>
        <div className="call-result-icon">{consequence.icon}</div>
        <h3>{consequence.title}</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{consequence.message}</p>

        {consequence.allowRetry ? (
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button className="continue-btn" onClick={onRetry}>
              Try Again
            </button>
            <button className="continue-btn" onClick={() => onContinue(consequence.outcome)}>
              Give Up
            </button>
          </div>
        ) : (
          <button className="continue-btn" onClick={() => onContinue(consequence.outcome)}>
            Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default CallResult;

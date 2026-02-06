// TimeBar.jsx - Visual time remaining indicator for preparation phase

import './TimeBar.css';

function TimeBar({ currentTime, stormTime, startTime }) {
  // Calculate time remaining
  const totalMinutes = (stormTime - startTime);
  const remainingMinutes = stormTime - currentTime;

  // Calculate percentage remaining (bar shrinks as time passes)
  const percentRemaining = Math.max(0, Math.min(100, (remainingMinutes / totalMinutes) * 100));

  // Format time for display (e.g., "20:45")
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Determine urgency level for color
  const getUrgencyClass = () => {
    if (percentRemaining > 50) return 'time-safe';
    if (percentRemaining > 25) return 'time-warning';
    return 'time-critical';
  };

  return (
    <div className="time-bar-container">
      <span className="current-time">🕐 {formatTime(currentTime)}</span>
      <div className="time-bar-track">
        <div
          className={`time-bar-fill ${getUrgencyClass()}`}
          style={{ width: `${percentRemaining}%` }}
        />
      </div>
      <span className="time-remaining">{remainingMinutes} min left</span>
    </div>
  );
}

export default TimeBar;

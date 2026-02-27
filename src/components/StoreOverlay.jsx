import { useState, useCallback, useMemo, useEffect } from 'react';
import './StoreOverlay.css';
import { useAudioContext } from '../context/AudioContext';

const STORE_ITEMS = [
  // ── ESSENTIALS ──────────────────────────────────────────────
  { id: 'water',         name: 'Bottled Water',       emoji: '💧', category: 'essentials', quality: 'good', description: 'Several litres' },
  { id: 'batteries',     name: 'AA Batteries',         emoji: '🔋', category: 'essentials', quality: 'good', description: 'Pack of 8 — powers everything' },
  { id: 'candles',       name: 'Emergency Candles',    emoji: '🕯️', category: 'essentials', quality: 'good', description: 'Burns 8 hrs each' },
  { id: 'first_aid',     name: 'First Aid Kit',        emoji: '🩹', category: 'essentials', quality: 'good', description: 'Bandages, antiseptic' },
  { id: 'blanket',       name: 'Emergency Blanket',    emoji: '🛏️', category: 'essentials', quality: 'good', description: 'Retains 90% body heat' },
  { id: 'matches',       name: 'Waterproof Matches',   emoji: '🔥', category: 'essentials', quality: 'okay', description: 'Strike anywhere', feedback: 'Handy backup, but a lighter does the same job for less. Worth having if you have no lighter.' },
  { id: 'power_bank',    name: 'Power Bank',           emoji: '📱', category: 'essentials', quality: 'okay', description: '20,000 mAh', feedback: 'Gives your phone a few extra charges, but AA batteries last far longer for radios and torches.' },
  { id: 'hand_sanitizer',name: 'Hand Sanitizer',       emoji: '🧴', category: 'essentials', quality: 'okay', description: 'No running water needed', feedback: 'Useful when the tap is dry, but stored water and soap does the same job and costs less.' },
  { id: 'radio_manual',  name: 'Hand-crank Radio',     emoji: '📻', category: 'essentials', quality: 'okay', description: 'No batteries needed', feedback: 'Works without batteries — a genuine backup. But if you already have AA batteries, a standard battery radio is lighter and easier.' },
  { id: 'whistle',       name: 'Emergency Whistle',    emoji: '🔔', category: 'essentials', quality: 'okay', description: 'Signal for help', feedback: 'Vital if you might need outdoor rescue, but low priority if you\'re sheltering at home.' },
  { id: 'scented_candle',name: 'Scented Candle',       emoji: '🪔', category: 'essentials', quality: 'okay', description: 'Decorative candle', feedback: 'It gives some light, but melts faster than proper emergency candles and won\'t last the night.' },

  // ── FOOD & WATER ─────────────────────────────────────────────
  { id: 'canned',        name: 'Canned Food',          emoji: '🥫', category: 'food', quality: 'good', description: 'Meat, fish, veg' },
  { id: 'crackers',      name: 'Crackers & Biscuits',  emoji: '🍪', category: 'food', quality: 'good', description: 'Long shelf life' },
  { id: 'nuts',          name: 'Nuts & Dried Fruit',   emoji: '🥜', category: 'food', quality: 'good', description: 'High energy' },
  { id: 'energy_bars',   name: 'Energy Bars',          emoji: '🍫', category: 'food', quality: 'good', description: 'Ready to eat' },
  { id: 'chocolate',     name: 'Chocolate',            emoji: '🍫', category: 'food', quality: 'good', description: 'Quick energy boost' },
  { id: 'bread',         name: 'Long-life Bread',      emoji: '🍞', category: 'food', quality: 'good', description: "Won't go stale" },
  { id: 'honey_jam',     name: 'Honey & Jam',          emoji: '🍯', category: 'food', quality: 'good', description: 'Lasts indefinitely' },
  { id: 'peanut_butter', name: 'Peanut Butter',        emoji: '🥜', category: 'food', quality: 'good', description: 'High protein & calories' },
  { id: 'dried',         name: 'Dried Foods',          emoji: '🍝', category: 'food', quality: 'okay', description: 'Pasta, rice, oats', feedback: 'Pasta and rice need cooking — oats are fine as-is.' },
  { id: 'instant_noodles',name: 'Instant Noodles',     emoji: '🍜', category: 'food', quality: 'okay', description: 'Just add water', feedback: 'You\'ll need a heat source and water to prepare these.' },
  { id: 'frozen',        name: 'Frozen Meals',         emoji: '🧊', category: 'food', quality: 'bad',  description: 'Microwave meals', feedback: 'No power = no freezer. These will spoil within hours.' },
  { id: 'milk',          name: 'Fresh Milk',           emoji: '🥛', category: 'food', quality: 'bad',  description: '1 litre carton', feedback: 'Spoils fast without a fridge. Buy UHT milk instead.' },
  { id: 'fresh',         name: 'Fresh Vegetables',     emoji: '🥬', category: 'food', quality: 'bad',  description: 'Salad, tomatoes', feedback: 'Will wilt and rot without refrigeration.' },
  { id: 'yogurt',        name: 'Yogurt',               emoji: '🥣', category: 'food', quality: 'bad',  description: 'Dairy cups', feedback: 'Needs to stay cold — it won\'t last.' },
  { id: 'sushi',         name: 'Fresh Sushi',          emoji: '🍣', category: 'food', quality: 'bad',  description: 'Ready-made rolls', feedback: 'Raw fish spoils dangerously fast without refrigeration.' },
  { id: 'deli',          name: 'Deli Meats',           emoji: '🥩', category: 'food', quality: 'bad',  description: 'Sliced ham & turkey', feedback: 'Spoils in hours without refrigeration.' },
  { id: 'birthday_cake', name: 'Birthday Cake',        emoji: '🎂', category: 'food', quality: 'bad',  description: 'Cream frosted cake', feedback: 'Perishable, heavy, and not exactly survival food.' },

  // ── LUXURY & IMPULSE BUYS ─────────────────────────────────────
  { id: 'playing_cards', name: 'Playing Cards',        emoji: '🃏', category: 'luxury', quality: 'good', description: 'No power needed!' },
  { id: 'board_game',    name: 'Board Game',           emoji: '🎲', category: 'luxury', quality: 'okay', description: 'Pass the time', feedback: 'Fair enough — at least it doesn\'t need electricity.' },
  { id: 'book',          name: 'Paperback Book',       emoji: '📚', category: 'luxury', quality: 'okay', description: 'Something to read', feedback: 'Not a bad choice — books work in the dark with a candle.' },
  { id: 'cigarettes',    name: 'Cigarettes',           emoji: '🚬', category: 'luxury', quality: 'okay', description: 'Pack of 20', feedback: 'A fire hazard and health risk — the last thing you need right now.' },
  { id: 'alcohol',       name: 'Beer & Wine',          emoji: '🍺', category: 'luxury', quality: 'okay', description: 'Mixed selection', feedback: 'Alcohol impairs judgment exactly when you need it most. And it dehydrates you.' },
  { id: 'energy_drink',  name: 'Energy Drinks',        emoji: '🥤', category: 'luxury', quality: 'okay', description: 'Crate of cans', feedback: 'Loaded with sugar and caffeine — will spike and crash your energy.' },
  { id: 'video_games',   name: 'Video Games',          emoji: '🎮', category: 'luxury', quality: 'bad',  description: 'Console + games', feedback: 'No power, no gaming. This stays on the shelf.' },
  { id: 'tv',            name: 'New Television',       emoji: '📺', category: 'luxury', quality: 'bad',  description: '55-inch smart TV', feedback: 'You can\'t carry this, and there\'s no power anyway.' },
  { id: 'fashion',       name: 'Fashion Clothes',      emoji: '👗', category: 'luxury', quality: 'bad',  description: 'Seasonal collection', feedback: 'Style won\'t keep you warm when the heating dies.' },
  { id: 'perfume',       name: 'Luxury Perfume',       emoji: '💐', category: 'luxury', quality: 'bad',  description: 'Designer fragrance', feedback: 'Smelling great won\'t help you survive the storm.' },
  { id: 'espresso',      name: 'Espresso Machine',     emoji: '☕', category: 'luxury', quality: 'bad',  description: 'Premium coffee maker', feedback: 'Needs electricity and running water. Leave it.' },
  { id: 'flowers',       name: 'Fresh Flowers',        emoji: '🌹', category: 'luxury', quality: 'bad',  description: 'Bouquet of roses', feedback: 'These will wilt before the storm even hits.' },
  { id: 'sunglasses',    name: 'Designer Sunglasses',  emoji: '🕶️', category: 'luxury', quality: 'bad',  description: 'Limited edition', feedback: 'Hard to see the appeal when there\'s a storm coming.' },
  { id: 'gym_weights',   name: 'Dumbbells',            emoji: '🏋️', category: 'luxury', quality: 'bad',  description: 'Heavy iron set', feedback: 'Great in normal life — completely useless right now.' },
];

const CATEGORIES = [
  { id: 'essentials', label: 'Essentials', emoji: '🛡️', description: 'Some are must-haves — others depend on what you already have' },
  { id: 'food',       label: 'Food & Drink', emoji: '🍽️', description: 'Choose non-perishables that don\'t need refrigeration' },
  { id: 'luxury',     label: 'Luxury',     emoji: '🛍️', description: 'Is this really the time?' },
];

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function StoreOverlay({ shopWater, shopFood, shopBatteries, shopWaterAmount, onClose, onTimeCostChange }) {
  const [showWarning, setShowWarning] = useState(true);
  const [basket, setBasket] = useState([]);
  const [badClicks, setBadClicks] = useState([]);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [shakingItem, setShakingItem] = useState(null);

  const { playSfx } = useAudioContext();

  // Shuffle items once per store open — keeps order stable across re-renders
  const shuffledItems = useMemo(() => shuffle(STORE_ITEMS), []);

  const handleItemClick = useCallback((item) => {
    // Click again to collapse feedback
    if (expandedFeedback === item.id) {
      setExpandedFeedback(null);
      return;
    }

    // Already in basket — allow toggling feedback for okay items
    if (basket.includes(item.id)) {
      if (item.feedback) setExpandedFeedback(item.id);
      return;
    }

    if (item.quality === 'bad') {
      setShakingItem(item.id);
      setTimeout(() => setShakingItem(null), 500);
      setBadClicks(prev => prev.includes(item.id) ? prev : [...prev, item.id]);
      setExpandedFeedback(item.id);
      playSfx('fail');
      return;
    }

    if (item.quality === 'okay') {
      setBasket(prev => [...prev, item.id]);
      setExpandedFeedback(item.id);
      playSfx('purchase');
      return;
    }

    // good items — just add
    setBasket(prev => [...prev, item.id]);
    playSfx('purchase');
  }, [basket, expandedFeedback, playSfx]);

  const BASE_VISIT_COST = 20; // minutes to travel to the store and back
  const timeCost = BASE_VISIT_COST + basket.length + badClicks.length; // +1 minute per item (good or bad)

  useEffect(() => {
    onTimeCostChange?.(timeCost);
  }, [timeCost, onTimeCostChange]);

  const handleCheckout = () => { playSfx('close'); onClose(basket, timeCost); };

  // Which items are available based on shop flags + category rules
  const isAvailable = (item) => {
    if (item.category === 'luxury') return true; // always stocked
    if (item.category === 'essentials') {
      if (item.id === 'water')    return shopWater;
      if (item.id === 'batteries') return shopBatteries;
      return true; // other essentials always available
    }
    if (item.category === 'food') return true;
    return false;
  };

  const getDescription = (item) => {
    if (item.id === 'water') return shopWaterAmount ? `${shopWaterAmount}L` : item.description;
    return item.description;
  };

  if (showWarning) {
    return (
      <div className="store-overlay">
        <div className="store-warning-panel">
          <span className="store-warning-icon">⚠️</span>
          <h2 className="store-warning-title">Every second counts</h2>
          <p className="store-warning-body">
            The storm is closing in. You don't have time to browse — grab only what you
            genuinely need and get out.
          </p>
          <p className="store-warning-rule">
            <strong>The trip to the store and back costs 20 minutes.</strong> Each item you pick up costs 1 more. Choose wisely.
          </p>
          <button className="store-warning-btn" onClick={() => { playSfx('open'); setShowWarning(false); }}>
            Enter the store →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-overlay">
      <div className="store-container">

        {/* Header */}
        <div className="store-header">
          <span className="store-title">Emergency Shopping</span>
          <span className="store-subtitle">Grab what you need before the storm hits</span>
        </div>

        {/* Categorised shelves */}
        <div className="store-shelves">
          {CATEGORIES.map(cat => {
            const items = shuffledItems.filter(i => i.category === cat.id && isAvailable(i));
            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="store-category">
                <div className={`store-category-header store-category-${cat.id}`}>
                  <span className="store-category-emoji">{cat.emoji}</span>
                  <div>
                    <span className="store-category-name">{cat.label}</span>
                    <span className="store-category-desc">{cat.description}</span>
                  </div>
                </div>

                <div className="store-items-grid">
                  {items.map(item => {
                    const inBasket   = basket.includes(item.id);
                    const isShaking  = shakingItem === item.id;
                    const isExpanded = expandedFeedback === item.id;

                    const selectedClass = inBasket
                      ? item.quality === 'okay' ? 'store-item-selected-okay' : 'store-item-selected'
                      : '';
                    const expandedBadClass = isExpanded && item.quality === 'bad' ? 'store-item-expanded-bad' : '';

                    return (
                      <button
                        key={item.id}
                        className={[
                          'store-item',
                          `store-item-${item.quality}`,
                          selectedClass,
                          expandedBadClass,
                          isShaking ? 'store-item-shake' : '',
                        ].join(' ')}
                        onClick={() => handleItemClick(item)}
                        disabled={inBasket && item.quality === 'good'}
                      >
                        <span className="store-item-emoji">{item.emoji}</span>
                        <span className="store-item-name">{item.name}</span>
                        <span className="store-item-desc">{getDescription(item)}</span>
                        {inBasket && (
                          <span className={`store-item-check${item.quality === 'okay' ? ' store-item-check-okay' : ''}`}>
                            &#10003;
                          </span>
                        )}
                        {isExpanded && item.feedback && (
                          <span className={`store-item-feedback store-item-feedback-${item.quality}`}>
                            {item.feedback}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Basket */}
        <div className="store-basket">
          <div className="store-basket-header">
            <span className="store-basket-label">🛒 Basket</span>
            <span className="store-basket-time">⏱ +{timeCost} min</span>
          </div>
          <div className="store-basket-items">
            {basket.length === 0 && (
              <span className="store-basket-empty">Click items to add them</span>
            )}
            {basket.map(id => {
              const item = STORE_ITEMS.find(i => i.id === id);
              return (
                <span
                  key={id}
                  className={`store-basket-chip${item.quality === 'okay' ? ' store-basket-chip-okay' : ''}`}
                >
                  {item.emoji} {item.name}
                </span>
              );
            })}
          </div>
        </div>

        <button className="store-checkout-btn" onClick={handleCheckout}>
          Checkout
        </button>
      </div>

    </div>
  );
}

export default StoreOverlay;

import { useState, useCallback, useMemo, useEffect } from 'react';
import './StoreOverlay.css';
import { useAudioContext } from '../context/AudioContext';
import { useTranslation } from '../hooks/useTranslation';

// Structural data only — translatable text comes from t()
const STORE_ITEMS = [
  // essentials
  { id: 'water',          emoji: '💧', category: 'essentials', quality: 'good' },
  { id: 'batteries',      emoji: '🔋', category: 'essentials', quality: 'good' },
  { id: 'candles',        emoji: '🕯️', category: 'essentials', quality: 'good' },
  { id: 'first_aid',      emoji: '🩹', category: 'essentials', quality: 'good' },
  { id: 'blanket',        emoji: '🛏️', category: 'essentials', quality: 'good' },
  { id: 'matches',        emoji: '🔥', category: 'essentials', quality: 'okay' },
  { id: 'power_bank',     emoji: '📱', category: 'essentials', quality: 'okay' },
  { id: 'hand_sanitizer', emoji: '🧴', category: 'essentials', quality: 'okay' },
  { id: 'radio_manual',   emoji: '📻', category: 'essentials', quality: 'okay' },
  { id: 'whistle',        emoji: '🔔', category: 'essentials', quality: 'okay' },
  { id: 'scented_candle', emoji: '🪔', category: 'essentials', quality: 'okay' },
  // food
  { id: 'canned',         emoji: '🥫', category: 'food', quality: 'good' },
  { id: 'crackers',       emoji: '🍪', category: 'food', quality: 'good' },
  { id: 'nuts',           emoji: '🥜', category: 'food', quality: 'good' },
  { id: 'energy_bars',    emoji: '🍫', category: 'food', quality: 'good' },
  { id: 'chocolate',      emoji: '🍫', category: 'food', quality: 'good' },
  { id: 'bread',          emoji: '🍞', category: 'food', quality: 'good' },
  { id: 'honey_jam',      emoji: '🍯', category: 'food', quality: 'good' },
  { id: 'peanut_butter',  emoji: '🥜', category: 'food', quality: 'good' },
  { id: 'dried',          emoji: '🍝', category: 'food', quality: 'okay' },
  { id: 'instant_noodles',emoji: '🍜', category: 'food', quality: 'okay' },
  { id: 'frozen',         emoji: '🧊', category: 'food', quality: 'bad' },
  { id: 'milk',           emoji: '🥛', category: 'food', quality: 'bad' },
  { id: 'fresh',          emoji: '🥬', category: 'food', quality: 'bad' },
  { id: 'yogurt',         emoji: '🥣', category: 'food', quality: 'bad' },
  { id: 'sushi',          emoji: '🍣', category: 'food', quality: 'bad' },
  { id: 'deli',           emoji: '🥩', category: 'food', quality: 'bad' },
  { id: 'birthday_cake',  emoji: '🎂', category: 'food', quality: 'bad' },
  // luxury
  { id: 'playing_cards',  emoji: '🃏', category: 'luxury', quality: 'good' },
  { id: 'board_game',     emoji: '🎲', category: 'luxury', quality: 'okay' },
  { id: 'book',           emoji: '📚', category: 'luxury', quality: 'okay' },
  { id: 'cigarettes',     emoji: '🚬', category: 'luxury', quality: 'okay' },
  { id: 'alcohol',        emoji: '🍺', category: 'luxury', quality: 'okay' },
  { id: 'energy_drink',   emoji: '🥤', category: 'luxury', quality: 'okay' },
  { id: 'video_games',    emoji: '🎮', category: 'luxury', quality: 'bad' },
  { id: 'tv',             emoji: '📺', category: 'luxury', quality: 'bad' },
  { id: 'fashion',        emoji: '👗', category: 'luxury', quality: 'bad' },
  { id: 'perfume',        emoji: '💐', category: 'luxury', quality: 'bad' },
  { id: 'espresso',       emoji: '☕', category: 'luxury', quality: 'bad' },
  { id: 'flowers',        emoji: '🌹', category: 'luxury', quality: 'bad' },
  { id: 'sunglasses',     emoji: '🕶️', category: 'luxury', quality: 'bad' },
  { id: 'gym_weights',    emoji: '🏋️', category: 'luxury', quality: 'bad' },
];

const CATEGORY_IDS = ['essentials', 'food', 'luxury'];
const CATEGORY_EMOJIS = { essentials: '🛡️', food: '🍽️', luxury: '🛍️' };

// Maps a pantry-derived gap to the store item ids that can fill it.
const GAP_ITEM_MAP = {
  shelf_stable_protein: ['canned', 'nuts', 'peanut_butter'],
  no_cook_food:         ['canned', 'nuts', 'peanut_butter', 'energy_bars', 'crackers', 'chocolate', 'honey_jam'],
  kid_snack:            ['energy_bars', 'chocolate', 'crackers', 'peanut_butter'],
  soft_food:            ['honey_jam', 'peanut_butter', 'bread'],
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function StoreOverlay({ shopWater, shopFood, shopBatteries, shopWaterAmount, shoppingGaps = [], onClose, onTimeCostChange }) {
  const { t } = useTranslation();
  const [showWarning, setShowWarning] = useState(true);
  const [basket, setBasket] = useState([]);
  const [badClicks, setBadClicks] = useState([]);
  const [expandedFeedback, setExpandedFeedback] = useState(null);
  const [shakingItem, setShakingItem] = useState(null);

  const { playSfx } = useAudioContext();

  const shuffledItems = useMemo(() => shuffle(STORE_ITEMS), []);

  const getItemText = useCallback((item) => {
    const data = t(`store.items.${item.id}`);
    return {
      name: data?.name ?? item.id,
      description: data?.description ?? '',
      feedback: data?.feedback ?? null,
    };
  }, [t]);

  const handleItemClick = useCallback((item) => {
    if (expandedFeedback === item.id) {
      setExpandedFeedback(null);
      return;
    }

    const { feedback } = getItemText(item);

    if (basket.includes(item.id)) {
      if (feedback) setExpandedFeedback(item.id);
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

    setBasket(prev => [...prev, item.id]);
    playSfx('purchase');
  }, [basket, expandedFeedback, playSfx, getItemText]);

  const BASE_VISIT_COST = 20;
  const timeCost = BASE_VISIT_COST + basket.length + badClicks.length;

  const gapStatus = useMemo(() => shoppingGaps.map(gap => {
    const itemIds = GAP_ITEM_MAP[gap] || [];
    return { gap, covered: itemIds.some(id => basket.includes(id)) };
  }), [shoppingGaps, basket]);
  const gapsCovered = gapStatus.filter(g => g.covered).length;

  useEffect(() => {
    onTimeCostChange?.(timeCost);
  }, [timeCost, onTimeCostChange]);

  const handleCheckout = () => { playSfx('close'); onClose(basket, timeCost); };

  const isAvailable = (item) => {
    if (item.category === 'luxury') return true;
    if (item.category === 'essentials') {
      if (item.id === 'water')    return shopWater;
      if (item.id === 'batteries') return shopBatteries;
      return true;
    }
    if (item.category === 'food') return true;
    return false;
  };

  const getDescription = (item) => {
    const { description } = getItemText(item);
    if (item.id === 'water') return shopWaterAmount ? `${shopWaterAmount}L` : description;
    return description;
  };

  if (showWarning) {
    return (
      <div className="store-overlay">
        <div className="store-warning-panel">
          <span className="store-warning-icon">⚠️</span>
          <h2 className="store-warning-title">{t('store.warningTitle')}</h2>
          <p className="store-warning-body">{t('store.warningBody')}</p>
          <p className="store-warning-rule">
            <strong>{t('store.warningRule')}</strong>
          </p>
          <button className="store-warning-btn" onClick={() => { playSfx('open'); setShowWarning(false); }}>
            {t('store.warningBtn')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="store-overlay">
      <div className="store-container">

        <div className="store-header">
          <span className="store-title">{t('store.headerTitle')}</span>
          <span className="store-subtitle">{t('store.headerSubtitle')}</span>
        </div>

        {shoppingGaps.length > 0 && (
          <div className="store-note">
            <div className="store-note-header">
              <span className="store-note-title">📝 {t('storeNote.title')}</span>
              <span className="store-note-progress">
                {gapsCovered} / {shoppingGaps.length} {t('storeNote.covered')}
              </span>
            </div>
            <div className="store-note-chips">
              {gapStatus.map(({ gap, covered }) => (
                <span
                  key={gap}
                  className={`store-note-chip ${covered ? 'store-note-chip-covered' : ''}`}
                >
                  <span className="store-note-check">{covered ? '✓' : '○'}</span>
                  {t(`storeNote.labels.${gap}`)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="store-shelves">
          {CATEGORY_IDS.map(catId => {
            const items = shuffledItems.filter(i => i.category === catId && isAvailable(i));
            if (items.length === 0) return null;

            const catText = t(`store.categories.${catId}`);

            return (
              <div key={catId} className="store-category">
                <div className={`store-category-header store-category-${catId}`}>
                  <span className="store-category-emoji">{CATEGORY_EMOJIS[catId]}</span>
                  <div>
                    <span className="store-category-name">{catText.label}</span>
                    <span className="store-category-desc">{catText.description}</span>
                  </div>
                </div>

                <div className="store-items-grid">
                  {items.map(item => {
                    const inBasket   = basket.includes(item.id);
                    const isShaking  = shakingItem === item.id;
                    const isExpanded = expandedFeedback === item.id;
                    const { name, feedback } = getItemText(item);

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
                        <span className="store-item-name">{name}</span>
                        <span className="store-item-desc">{getDescription(item)}</span>
                        {inBasket && (
                          <span className={`store-item-check${item.quality === 'okay' ? ' store-item-check-okay' : ''}`}>
                            &#10003;
                          </span>
                        )}
                        {isExpanded && feedback && (
                          <span className={`store-item-feedback store-item-feedback-${item.quality}`}>
                            {feedback}
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

        <div className="store-basket">
          <div className="store-basket-header">
            <span className="store-basket-label">{t('store.basketLabel')}</span>
            <span className="store-basket-time">⏱ +{timeCost} min</span>
          </div>
          <div className="store-basket-items">
            {basket.length === 0 && (
              <span className="store-basket-empty">{t('store.basketEmpty')}</span>
            )}
            {basket.map(id => {
              const item = STORE_ITEMS.find(i => i.id === id);
              const { name } = getItemText(item);
              return (
                <span
                  key={id}
                  className={`store-basket-chip${item.quality === 'okay' ? ' store-basket-chip-okay' : ''}`}
                >
                  {item.emoji} {name}
                </span>
              );
            })}
          </div>
        </div>

        <button className="store-checkout-btn" onClick={handleCheckout}>
          {t('store.checkout')}
        </button>
      </div>

    </div>
  );
}

export default StoreOverlay;

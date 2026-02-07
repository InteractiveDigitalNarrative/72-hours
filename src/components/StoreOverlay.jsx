import { useState, useCallback } from 'react';
import './StoreOverlay.css';

const STORE_ITEMS = [
  // Essentials (shown based on shopping list flags)
  { id: 'water', name: 'Bottled Water', emoji: '💧', category: 'essentials', quality: 'good', description: '' },
  { id: 'batteries', name: 'AA Batteries', emoji: '🔋', category: 'essentials', quality: 'good', description: 'Pack of 8' },
  // Food items - shuffled so bad choices are mixed in
  { id: 'canned', name: 'Canned Food', emoji: '🥫', category: 'food', quality: 'good', description: 'Meat, fish, vegetables' },
  { id: 'frozen', name: 'Frozen Meals', emoji: '🧊', category: 'food', quality: 'bad', description: 'Quick microwave meals', feedback: 'Will thaw and spoil without power!' },
  { id: 'crackers', name: 'Crackers & Biscuits', emoji: '🍪', category: 'food', quality: 'good', description: 'Long shelf life' },
  { id: 'milk', name: 'Fresh Milk', emoji: '🥛', category: 'food', quality: 'bad', description: '1 liter carton', feedback: 'Spoils fast without a fridge!' },
  { id: 'nuts', name: 'Nuts & Dried Fruit', emoji: '🥜', category: 'food', quality: 'good', description: 'High energy' },
  { id: 'fresh', name: 'Fresh Vegetables', emoji: '🥬', category: 'food', quality: 'bad', description: 'Salad, tomatoes', feedback: 'Will wilt without refrigeration!' },
  { id: 'energy_bars', name: 'Energy Bars', emoji: '🍫', category: 'food', quality: 'good', description: 'Ready to eat' },
  { id: 'smoothie', name: 'Fresh Smoothies', emoji: '🥤', category: 'food', quality: 'bad', description: 'Refrigerated bottles', feedback: 'Goes bad within hours without a fridge!' },
  { id: 'chocolate', name: 'Chocolate', emoji: '🍫', category: 'food', quality: 'good', description: 'Quick energy' },
  { id: 'yogurt', name: 'Yogurt', emoji: '🥣', category: 'food', quality: 'bad', description: 'Dairy cups', feedback: 'Needs to stay cold!' },
  { id: 'bread', name: 'Long-life Bread', emoji: '🍞', category: 'food', quality: 'good', description: "Won't go stale" },
  { id: 'deli', name: 'Deli Meats', emoji: '🥩', category: 'food', quality: 'bad', description: 'Sliced ham & turkey', feedback: 'Spoils in hours without refrigeration!' },
  { id: 'honey_jam', name: 'Honey & Jam', emoji: '🍯', category: 'food', quality: 'good', description: 'Lasts forever' },
  { id: 'sushi', name: 'Fresh Sushi', emoji: '🍣', category: 'food', quality: 'bad', description: 'Ready-made rolls', feedback: 'Raw fish spoils dangerously fast!' },
  { id: 'dried', name: 'Dried Foods', emoji: '🍝', category: 'food', quality: 'okay', description: 'Pasta, rice, cereals', feedback: 'Needs cooking — cereals are fine though!' },
];

function StoreOverlay({ shopWater, shopFood, shopBatteries, shopWaterAmount, onClose }) {
  const [basket, setBasket] = useState([]);
  const [toast, setToast] = useState(null);
  const [shakingItem, setShakingItem] = useState(null);

  // Filter items based on shopping list
  const availableItems = STORE_ITEMS.filter(item => {
    if (item.category === 'essentials') {
      if (item.id === 'water') return shopWater;
      if (item.id === 'batteries') return shopBatteries;
    }
    if (item.category === 'food') return shopFood;
    return false;
  });

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleItemClick = useCallback((item) => {
    // Already in basket
    if (basket.includes(item.id)) return;

    if (item.quality === 'bad') {
      // Shake animation + red toast, don't add
      setShakingItem(item.id);
      showToast(item.feedback, 'bad');
      setTimeout(() => setShakingItem(null), 500);
      return;
    }

    if (item.quality === 'okay') {
      // Add but show warning
      showToast(item.feedback, 'okay');
    }

    setBasket(prev => [...prev, item.id]);
  }, [basket, showToast]);

  const handleCheckout = () => {
    onClose(basket);
  };

  // Build water description dynamically
  const getItemDescription = (item) => {
    if (item.id === 'water') return `${shopWaterAmount}L`;
    return item.description;
  };

  return (
    <div className="store-overlay">
      <div className="store-container">
        {/* Header */}
        <div className="store-header">
          <span className="store-title">Emergency Shopping</span>
          <span className="store-subtitle">Grab what you need for the storm</span>
        </div>

        {/* Shelves / Item Grid */}
        <div className="store-shelves">
          {availableItems.map(item => {
            const inBasket = basket.includes(item.id);
            const isShaking = shakingItem === item.id;
            const qualityClass = `store-item-${item.quality}`;

            return (
              <button
                key={item.id}
                className={`store-item ${qualityClass} ${inBasket ? 'store-item-selected' : ''} ${isShaking ? 'store-item-shake' : ''}`}
                onClick={() => handleItemClick(item)}
                disabled={inBasket}
              >
                <span className="store-item-emoji">{item.emoji}</span>
                <span className="store-item-name">{item.name}</span>
                <span className="store-item-desc">{getItemDescription(item)}</span>
                {inBasket && <span className="store-item-check">&#10003;</span>}
              </button>
            );
          })}
        </div>

        {/* Basket */}
        <div className="store-basket">
          <span className="store-basket-label">Basket:</span>
          <div className="store-basket-items">
            {basket.length === 0 && (
              <span className="store-basket-empty">Click items to add them</span>
            )}
            {basket.map(id => {
              const item = STORE_ITEMS.find(i => i.id === id);
              return (
                <span key={id} className="store-basket-chip">
                  {item.emoji} {item.name}
                </span>
              );
            })}
          </div>
        </div>

        {/* Checkout */}
        <button className="store-checkout-btn" onClick={handleCheckout}>
          Checkout
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`store-toast store-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default StoreOverlay;

import { useState } from 'react';
import './ShoppingList.css';
import { useTranslation } from '../hooks/useTranslation';

// Live shopping list shown during prep. Reads the shop_* Ink vars and lists
// each flagged item by name, so adding something gives immediate feedback.
// Order roughly matches the prep flow.
const ROWS = [
  { flag: 'shop_water',      key: 'water'      },
  { flag: 'shop_food',       key: 'food'       },
  { flag: 'shop_flashlight', key: 'flashlight' },
  { flag: 'shop_batteries',  key: 'batteries'  },
  { flag: 'shop_powerbank',  key: 'powerbank'  },
  { flag: 'shop_headlamp',   key: 'headlamp'   },
  { flag: 'shop_lantern',    key: 'lantern'    },
  { flag: 'shop_matches',    key: 'matches'    },
  { flag: 'shop_warm',       key: 'warm'       },
  { flag: 'shop_meds',       key: 'meds'       },
];

function ShoppingList({ vars, inStore = false }) {
  const { t } = useTranslation();
  // Manual "bought it" ticks — independent of any game state, purely so the
  // player can cross off items as they physically grab them in the store.
  const [checked, setChecked] = useState({});

  if (!vars) return null;

  // Once the store run is done, the list has served its purpose — hide it.
  if (vars.shop_visited) return null;

  const items = ROWS.filter(r => vars[r.flag]).map(r => {
    if (r.key === 'water') {
      const amt = vars.shop_water_amount || 0;
      const label = amt > 0
        ? t('shoppingList.items.water_amount').replace('{n}', amt)
        : t('shoppingList.items.water');
      return { key: r.key, label };
    }
    return { key: r.key, label: t(`shoppingList.items.${r.key}`) };
  });

  if (items.length === 0) return null;

  const toggleChecked = (key) => {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const remaining = items.filter(item => !checked[item.key]).length;

  return (
    <div className={`shopping-list${inStore ? ' shopping-list-in-store' : ''}`} aria-live="polite">
      <div className="shopping-list-header">
        <span className="shopping-list-title">🛒 {t('shoppingList.title')}</span>
        <span className="shopping-list-count">{remaining}</span>
      </div>
      <ul className="shopping-list-items">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className={`shopping-list-item${checked[item.key] ? ' shopping-list-item-checked' : ''}`}
              onClick={() => toggleChecked(item.key)}
            >
              <span className="shopping-list-bullet">{checked[item.key] ? '✓' : '▢'}</span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="shopping-list-hint">
        {t(inStore ? 'shoppingList.hintInStore' : 'shoppingList.hint')}
      </div>
    </div>
  );
}

export default ShoppingList;

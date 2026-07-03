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

function ShoppingList({ vars }) {
  const { t } = useTranslation();
  if (!vars) return null;

  // Once the store run is done, the list has served its purpose — hide it.
  if (vars.shop_visited) return null;

  const items = ROWS.filter(r => vars[r.flag]).map(r => {
    if (r.key === 'water') {
      const amt = vars.shop_water_amount || 0;
      return amt > 0
        ? t('shoppingList.items.water_amount').replace('{n}', amt)
        : t('shoppingList.items.water');
    }
    return t(`shoppingList.items.${r.key}`);
  });

  if (items.length === 0) return null;

  return (
    <div className="shopping-list" aria-live="polite">
      <div className="shopping-list-header">
        <span className="shopping-list-title">🛒 {t('shoppingList.title')}</span>
        <span className="shopping-list-count">{items.length}</span>
      </div>
      <ul className="shopping-list-items">
        {items.map((label, i) => (
          <li key={i} className="shopping-list-item">
            <span className="shopping-list-bullet">▢</span>
            {label}
          </li>
        ))}
      </ul>
      <div className="shopping-list-hint">{t('shoppingList.hint')}</div>
    </div>
  );
}

export default ShoppingList;

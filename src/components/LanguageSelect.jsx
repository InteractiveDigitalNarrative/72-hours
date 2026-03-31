import './LanguageSelect.css';

const BASE_URL = import.meta.env.BASE_URL;

function LanguageSelect({ onSelect }) {
  return (
    <div
      className="lang-screen"
      style={{ backgroundImage: `url(${BASE_URL}Images/winter-storm.jpg)` }}
    >
      <div className="lang-overlay" />
      <div className="lang-vignette" />

      <div className="lang-card">
        <h1 className="lang-title">Choose your language</h1>
        <p className="lang-subtitle">Valige keel</p>

        <div className="lang-buttons">
          <button className="lang-btn" onClick={() => onSelect('en')}>
            <span className="lang-flag">🇬🇧</span>
            <span className="lang-label">English</span>
          </button>
          <button className="lang-btn" onClick={() => onSelect('et')}>
            <span className="lang-flag">🇪🇪</span>
            <span className="lang-label">Eesti keel</span>
          </button>
        </div>
      </div>

      <div className="lang-eu-logo">
        <img src={`${BASE_URL}Images/EULogo.jpg`} alt="Co-funded by the European Union" />
      </div>
    </div>
  );
}

export default LanguageSelect;

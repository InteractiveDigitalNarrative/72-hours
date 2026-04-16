import { useState } from 'react';
import './Demography.css';
import { useTranslation } from '../hooks/useTranslation';

const BASE_URL = import.meta.env.BASE_URL;

const AGE_BRACKETS = ['under_18', '18_24', '25_34', '35_44', '45_54', '55_64', '65_plus'];
const GENDERS = ['male', 'female', 'non_binary', 'prefer_not_say'];
const PREP_LEVELS = ['fully', 'somewhat', 'never'];

function Demography({ onSubmit, onSkip }) {
  const { t } = useTranslation();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [prep, setPrep] = useState('');

  const canContinue = age && gender && prep;

  const handleContinue = () => {
    if (!canContinue) return;
    onSubmit({ age, gender, prep });
  };

  return (
    <div
      className="demo-screen"
      style={{ backgroundImage: `url(${BASE_URL}Images/winter-storm.jpg)` }}
    >
      <div className="demo-overlay" />
      <div className="demo-vignette" />

      <div className="demo-card">
        <h1 className="demo-title">{t('demography.title')}</h1>
        <p className="demo-subtitle">{t('demography.subtitle')}</p>

        {/* Age */}
        <div className="demo-field">
          <label className="demo-label">{t('demography.ageLabel')}</label>
          <select
            className="demo-select"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          >
            <option value="">{t('demography.selectPlaceholder')}</option>
            {AGE_BRACKETS.map((key) => (
              <option key={key} value={key}>
                {t(`demography.ageOptions.${key}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div className="demo-field">
          <label className="demo-label">{t('demography.genderLabel')}</label>
          <div className="demo-pills">
            {GENDERS.map((key) => (
              <button
                key={key}
                type="button"
                className={`demo-pill ${gender === key ? 'is-active' : ''}`}
                onClick={() => setGender(key)}
              >
                {t(`demography.genderOptions.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Prior preparedness */}
        <div className="demo-field">
          <label className="demo-label">{t('demography.prepLabel')}</label>
          <div className="demo-pills">
            {PREP_LEVELS.map((key) => (
              <button
                key={key}
                type="button"
                className={`demo-pill ${prep === key ? 'is-active' : ''}`}
                onClick={() => setPrep(key)}
              >
                {t(`demography.prepOptions.${key}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="demo-actions">
          <button className="demo-skip" type="button" onClick={onSkip}>
            {t('demography.skip')}
          </button>
          <button
            className="demo-continue"
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            {t('demography.continue')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Demography;

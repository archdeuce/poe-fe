import './Settings.style.scss';
import { useState, useEffect } from 'react';
import { LANGUAGES } from '@/utils/constants';

const Settings = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    LANGUAGES.RUS,
  );
  const [isNeedOpenUrl, setlsNeedOpenUrl] = useState<boolean>(false);
  const [isNeedPriceCheck, setlsNeedPriceCheck] = useState<boolean>(false);

  useEffect(() => {
    setSelectedLanguage(localStorage.getItem('language') || LANGUAGES.RUS);
    setlsNeedOpenUrl(localStorage.getItem('openUrl') === 'true');
    setlsNeedPriceCheck(localStorage.getItem('checkPrice') === 'true');
  }, []);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSelectedLanguage(value);
    localStorage.setItem('language', value);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    switch (name) {
      case 'auto-open-checkbox':
        setlsNeedOpenUrl(checked);
        localStorage.setItem('openUrl', String(checked));
        break;
      case 'auto-get-price-checkbox':
        setlsNeedPriceCheck(checked);
        localStorage.setItem('checkPrice', String(checked));
        break;
      default:
        break;
    }
  };

  return (
    <section className="settings-page">
      <h1>Конфигурация</h1>
      <ul>
        <li>
          <span>Укажите язык клиента</span>
          <div className="language-switcher">
            <input
              type="radio"
              name="language"
              id={LANGUAGES.RUS}
              value={LANGUAGES.RUS}
              checked={selectedLanguage === LANGUAGES.RUS}
              onChange={handleLanguageChange}
            />
            <label htmlFor={LANGUAGES.RUS}>{LANGUAGES.RUS}</label>
            <input
              type="radio"
              name="language"
              id={LANGUAGES.ENG}
              value={LANGUAGES.ENG}
              checked={selectedLanguage === LANGUAGES.ENG}
              onChange={handleLanguageChange}
            />
            <label htmlFor={LANGUAGES.ENG}>{LANGUAGES.ENG}</label>
          </div>
        </li>
        <li>
          <span>Открывать полученную ссылку автоматически</span>
          <input
            type="checkbox"
            id="auto-open-checkbox"
            name="auto-open-checkbox"
            className="custom-checkbox"
            checked={isNeedOpenUrl}
            onChange={handleCheckboxChange}
          />
        </li>
        <li>
          <span>Получать цены на предметы автоматически</span>
          <input
            type="checkbox"
            id="auto-get-price-checkbox"
            name="auto-get-price-checkbox"
            className="custom-checkbox"
            checked={isNeedPriceCheck}
            onChange={handleCheckboxChange}
          />
        </li>
      </ul>
    </section>
  );
};

export default Settings;

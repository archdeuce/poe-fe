import './Header.style.scss';

import { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { fetchOnlineData } from '@/services/api';

const Header = () => {
  const [onlinePlayers, setOnlinePlayers] = useState<number | null>(null);

  const getOnlinePlayers = async () => {
    const data = await fetchOnlineData();
    if (data) {
      const { online } = data;
      setOnlinePlayers(online || 0);
      localStorage.setItem('online', String(online || 0));
    }
  };

  useEffect(() => {
    setOnlinePlayers(Number(localStorage.getItem('online')) || null);
    getOnlinePlayers();
  }, []);

  return (
    <header className="header">
      <ul className="header-menu">
        <li className="header-menu-item">
          <Link to="/">Главная</Link>
        </li>
        <li className="header-menu-item">
          <Link to={ROUTES.OCR_GEMS.URL}>{ROUTES.OCR_GEMS.NAME}</Link>
        </li>
      </ul>
      <div className="header-players">
        <span className="header-players-label">Онлайн:</span>
        <a
          className="header-players-count"
          href="https://steamcharts.com/app/238960"
          target="_blank"
        >
          {onlinePlayers !== null ? onlinePlayers : '........'}
        </a>
      </div>
    </header>
  );
};

export default Header;

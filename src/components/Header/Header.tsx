import './Header.style.scss';

import { useEffect, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';
import { fetchOnlineData } from '@/services/api';

const Header = () => {
  const [onlinePlayers, setOnlinePlayers] = useState<number | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

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
        {token && (
          <>
            <li className="header-menu-item">
              <Link to={ROUTES.LAB.URL}>{ROUTES.LAB.NAME}</Link>
            </li>
            <li className="header-menu-item">
              <Link to={ROUTES.HEIST.URL}>{ROUTES.HEIST.NAME}</Link>
            </li>
            <li className="header-menu-item">
              <Link to={ROUTES.MEMORY.URL}>{ROUTES.MEMORY.NAME}</Link>
            </li>
            <li className="header-menu-item">
              <Link to={ROUTES.SETTINGS.URL}>{ROUTES.SETTINGS.NAME}</Link>
            </li>
          </>
        )}
        {!token ? (
          <li className="header-menu-item">
            <Link to={ROUTES.LOGIN.URL}>{ROUTES.LOGIN.NAME}</Link>
          </li>
        ) : (
          <>
            {(localStorage.getItem('role') || '').toLowerCase() === 'admin' && (
              <li className="header-menu-item">
                <Link to={ROUTES.ADMIN.URL}>{ROUTES.ADMIN.NAME}</Link>
              </li>
            )}
            <li className="header-menu-item">
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Выход
              </a>
            </li>
          </>
        )}
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

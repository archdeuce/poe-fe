import './styles/normalize.scss';
import './styles/common.scss';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LoadingProvider } from './context/LoadingContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <LoadingProvider>
        <App />
      </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

import '@mantine/core/styles.css';
import './styles/normalize.scss';
import './styles/common.scss';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LoadingProvider } from './context/LoadingContext';
import { MantineProvider } from '@mantine/core';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <LoadingProvider>
          <App />
        </LoadingProvider>
      </BrowserRouter>
    </MantineProvider>
  </React.StrictMode>,
);

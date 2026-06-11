import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ConfirmProvider } from './contexts/ConfirmContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);

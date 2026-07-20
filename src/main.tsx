import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import '@/configs/i18n';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

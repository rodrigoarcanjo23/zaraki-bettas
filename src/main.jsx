import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Contador de visitas da Vercel (Web Analytics). Só carrega no site publicado.
// Para ver os números: painel da Vercel → projeto → Analytics → Enable.
if (import.meta.env.PROD && !/^(localhost|127\.)/.test(window.location.hostname)) {
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  const s = document.createElement('script');
  s.defer = true;
  s.src = '/_vercel/insights/script.js';
  s.onerror = () => {}; // fora da Vercel o arquivo não existe; ignora
  document.head.appendChild(s);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

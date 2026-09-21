import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './styles/index.css';
import './styles/home.css';
import './styles/shop.css';
import './styles/product.css';
import './styles/admin.css';

// Hide the initial loading screen once React is ready
const hideLoader = () => {
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 450);
  }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);

// Remove loader after first paint
requestAnimationFrame(() => requestAnimationFrame(hideLoader));
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

// Hide the initial loading screen once the store settings (name/theme) are
// ready, not just once React has mounted — otherwise the app shell briefly
// renders with hardcoded fallback branding before swapping to the real one.
// StoreContext calls window.__hideAppLoader() once its fetch settles.
let loaderHidden = false;
const hideLoader = () => {
  if (loaderHidden) return;
  loaderHidden = true;
  const loader = document.getElementById('app-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 450);
  }
};
window.__hideAppLoader = hideLoader;
// Failsafe: never block the app forever if the settings request hangs.
setTimeout(hideLoader, 6000);

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
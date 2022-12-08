import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/index.scss";
import App from './components/App';
import { BrowserRouter, } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));

// Removes console errors in prod
if (process.env.NODE_ENV !== "development")
    console.log = () => {};

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

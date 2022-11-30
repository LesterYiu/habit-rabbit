import React from 'react';
import ReactDOM from 'react-dom/client';
import "./styles/index.scss";
import App from './components/App';
import { BrowserRouter, } from "react-router-dom";

App.use(express.static(__dirname));

App.get("/*", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

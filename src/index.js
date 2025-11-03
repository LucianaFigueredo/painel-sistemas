import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Coleta from "./coleta"; // importa sua tela nova

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Tela principal (menus) */}
        <Route path="/" element={<App />} />
        
        {/* Tela de Coleta (iframe acessará essa rota) */}
        <Route path="/coleta" element={<Coleta />} />
      </Routes>
    </Router>
  </React.StrictMode>
);

import React from "react";
import "./Subpagina.css";

const Subpagina = ({ titulo, botoes, onVoltar }) => {
  return (
    <div className="subpagina-container">
      <button className="voltar-btn" onClick={onVoltar}>← Voltar</button>
      <h2>{titulo}</h2>

      <div className="subpagina-grid">
        {botoes.map((b, i) => (
          <a key={i} href={b.link} target="_blank" rel="noreferrer" className="sub-btn">
            <img src={b.img} alt={b.titulo} />
            <p>{b.titulo}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Subpagina;

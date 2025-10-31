import { useEffect, useState, useCallback } from "react";
import { Info, Search, ChevronLeft } from "lucide-react";
import "./App.css";

function App() {
  const [dados, setDados] = useState([]);
  const [pilhaPaginas, setPilhaPaginas] = useState([]);
  const [busca, setBusca] = useState("");

  // ✅ Corrigido: função "fixada" com useCallback
  const ordenarAlfabeticamente = useCallback((lista) =>
    lista
      .map((item) => ({
        ...item,
        filhos: item.filhos ? ordenarAlfabeticamente(item.filhos) : undefined,
      }))
      .sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
      )
  , []);

  // ✅ Agora o ESLint não reclama mais da dependência
  useEffect(() => {
    fetch("/links.json")
      .then((res) => res.json())
      .then((data) => {
        const ordenados = ordenarAlfabeticamente(data);
        setDados(ordenados);
      })
      .catch((err) => console.error("Erro ao carregar links:", err));
  }, [ordenarAlfabeticamente]);

  const paginaAtual =
    pilhaPaginas.length === 0
      ? dados
      : pilhaPaginas[pilhaPaginas.length - 1].filhos;

  const itemAtual =
    pilhaPaginas.length > 0
      ? pilhaPaginas[pilhaPaginas.length - 1]
      : null;

  const itensFiltrados = (paginaAtual || []).filter((item) =>
    item.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const abrirItem = (item) => {
    if (item.tipo === "pagina" && item.filhos) {
      setPilhaPaginas([...pilhaPaginas, item]);
    } else if (item.tipo === "link" && item.link) {
      window.open(item.link, "_blank");
    } else if (item.tipo === "html" && item.html) {
      setPilhaPaginas([...pilhaPaginas, item]); // entra na tela de iframe
    }
  };

  const voltar = () => {
    setPilhaPaginas(pilhaPaginas.slice(0, -1));
  };

  const tituloAtual =
    pilhaPaginas.length === 0
      ? "Benassi One"
      : pilhaPaginas[pilhaPaginas.length - 1].nome;

  const subtituloAtual =
    pilhaPaginas.length === 0
      ? "Acesso rápido aos sistemas corporativos"
      : "Selecione uma opção";

  // ================== 📊 TELA DE RELATÓRIO EMBUTIDO (HTML) ==================
  if (itemAtual && itemAtual.tipo === "html") {
  return (
    <div className="iframe-container">
      <div className="iframe-header-duo">
        <div className="iframe-left-duo">
          <h2 className="iframe-title-duo">{itemAtual.titulo || itemAtual.nome}</h2>
          <span className="iframe-voltar-duo" onClick={voltar}>
            <ChevronLeft size={18} strokeWidth={2.5} /> Voltar
          </span>
        </div>

        <img src="/B.png" alt="Logo Benassi" className="iframe-logo-right" />
      </div>

      <div
        className="iframe-content"
        dangerouslySetInnerHTML={{ __html: itemAtual.html }}
      />
    </div>
  );
}


  // ================== 🏠 TELAS NORMAIS (home e subpáginas) ==================
  return (
    <div className={pilhaPaginas.length > 0 ? "subpage" : ""}>
      {/* ======== Cabeçalho ======== */}
      <div className="header">
        <div className="header-content">
          <img src="/B.png" alt="Logo Benassi" className="logo" />
          <div className="header-text">
            <h1>{tituloAtual}</h1>
            <p>{subtituloAtual}</p>
          </div>
        </div>
      </div>

      {/* ======== “< Voltar” ======== */}
      {pilhaPaginas.length > 0 && (
        <div
          style={{
            width: "100%",
            marginTop: "10px",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingLeft: "50px",
          }}
        >
          <span
            onClick={voltar}
            style={{
              color: "#0e6f5c",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "0.95rem",
              fontWeight: "500",
              userSelect: "none",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0c5f4b")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#0e6f5c")}
          >
            <ChevronLeft size={18} strokeWidth={2.5} style={{ marginRight: "3px" }} />
            Voltar
          </span>
        </div>
      )}

      {/* ======== Barra de busca ======== */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: pilhaPaginas.length > 0 ? "15px" : "25px",
        }}
      >
        <div
          className="search-bar"
          style={{
            flex: 1,
            maxWidth:
              "calc(var(--cols) * var(--card-w) + (var(--cols) - 1) * var(--gap))",
          }}
        >
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {/* ======== Grid ======== */}
      <div className="grid">
        {itensFiltrados.map((item) => (
          <div key={item.nome} className="card-wrapper">
            <button
              onClick={() => abrirItem(item)}
              className="card"
              style={{ cursor: "pointer" }}
            >
              <img src={item.logo} alt={item.nome} />
              <p>{item.nome}</p>
            </button>

            {item.descricao && (
              <div className="info-wrapper">
                <Info size={15} strokeWidth={2} className="info-icon" />
                <div className="info-tooltip">{item.descricao}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

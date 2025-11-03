import { useEffect, useState, useCallback } from "react";
import { Info, Search, ChevronLeft, Copy } from "lucide-react";
import "./App.css";


function App() {
  const [dados, setDados] = useState([]);
  const [pilhaPaginas, setPilhaPaginas] = useState([]);
  const [busca, setBusca] = useState("");
  const [mensagemLinkCopiado, setMensagemLinkCopiado] = useState(false);

  // âœ… Corrigido: funÃ§Ã£o "fixada" com useCallback
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

  // Função para buscar recursivamente em filhos
  const buscarRecursivo = useCallback((item, termoBusca) => {
    if (!termoBusca) return true; // Se não tem busca, mostra tudo
    
    const termo = termoBusca.toLowerCase();
    
    // Verifica se o próprio item corresponde à busca
    if (item.nome.toLowerCase().includes(termo)) {
      return true;
    }
    
    // Se tem descrição, verifica também
    if (item.descricao && item.descricao.toLowerCase().includes(termo)) {
      return true;
    }
    
    // Se tem filhos, verifica recursivamente
    if (item.filhos && item.filhos.length > 0) {
      // Se encontrar em QUALQUER filho, mostra o pai
      return item.filhos.some(filho => buscarRecursivo(filho, termo));
    }
    
    return false;
  }, []);

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
    buscarRecursivo(item, busca)
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

  const copiarLink = (item, event) => {
    event.stopPropagation(); // Impede que o card seja clicado
    const linkParaCopiar = item.link || item.html || "";
    
    if (linkParaCopiar) {
      navigator.clipboard.writeText(linkParaCopiar)
        .then(() => {
          setMensagemLinkCopiado(true);
          setTimeout(() => {
            setMensagemLinkCopiado(false);
          }, 2500);
        })
        .catch(() => {
          alert("Não foi possível copiar o link");
        });
    }
  };

  const tituloAtual =
    pilhaPaginas.length === 0
      ? "Benassi One"
      : pilhaPaginas[pilhaPaginas.length - 1].nome;

  const subtituloAtual =
    pilhaPaginas.length === 0
      ? "Acesso rápido aos sistemas corporativos"
      : "Selecione uma opção";

  // ================== ðŸ“Š TELA DE RELATÃ“RIO EMBUTIDO (HTML) ==================
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


  // ================== ðŸ  TELAS NORMAIS (home e subpÃ¡ginas) ==================
  return (
    <div className={pilhaPaginas.length > 0 ? "subpage" : ""}>
      {/* ======== CabeÃ§alho ======== */}
      {/* ======== Mensagem de Link Copiado ======== */}
      {mensagemLinkCopiado && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#e6f9ec',
          color: '#10693e',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 400,
          fontSize: '0.95rem',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✅</span>
          Link copiado com sucesso!
        </div>
      )}

      <div className="header">
        <div className="header-content">
          <img src="/B.png" alt="Logo Benassi" className="logo" />
          <div className="header-text">
            <h1>{tituloAtual}</h1>
            <p>{subtituloAtual}</p>
          </div>
        </div>
      </div>

      {/* ======== "< Voltar" ======== */}
      {pilhaPaginas.length > 0 && (
        <div
        className="voltar-wrapper"
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

            {(item.link || item.html) && (
              <div className="copy-wrapper">
                <Copy 
                  size={15} 
                  strokeWidth={2} 
                  className="copy-icon"
                  onClick={(e) => copiarLink(item, e)}
                />
                <div className="copy-tooltip">
                  {item.link || "Link do relatório"}
                </div>
              </div>
            )}

            {item.descricao && (
              <div className="info-wrapper">
                <Info size={15} strokeWidth={2} className="info-icon" />
                <div className="info-tooltip">{item.descricao}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ======== ðŸ“Œ RodapÃ© fixo (sÃ³ aparece no mobile) ======== */}
      <footer className="footer">
       
      </footer>
    </div>
  );
}

export default App;
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Coleta.module.css";
import "./ColetaOverride.css";
import { Search, Save, Edit2, X, ChevronDown } from "lucide-react";

function Coleta() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [buscaDepartamento, setBuscaDepartamento] = useState("");
  const [buscaFuncionario, setBuscaFuncionario] = useState("");
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState("");
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [mostrarListaDepartamentos, setMostrarListaDepartamentos] = useState(false);
  const [mostrarListaFuncionarios, setMostrarListaFuncionarios] = useState(false);
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  // Refs para detectar clique fora
  const departamentoRef = React.useRef(null);
  const funcionarioRef = React.useRef(null);

  // Detecta clique fora dos dropdowns
  useEffect(() => {
    const handleClickFora = (event) => {
      // Fecha dropdown de departamento se clicar fora
      if (departamentoRef.current && !departamentoRef.current.contains(event.target)) {
        setMostrarListaDepartamentos(false);
      }
      
      // Fecha dropdown de funcionário se clicar fora
      if (funcionarioRef.current && !funcionarioRef.current.contains(event.target)) {
        setMostrarListaFuncionarios(false);
      }
    };

    // Adiciona o listener
    document.addEventListener('mousedown', handleClickFora);
    
    // Remove o listener quando o componente desmontar
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, []);

  // Esconde elementos do App.js nesta página
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'coleta-hide-app';
    style.textContent = `
      /* Esconde TODOS os elementos do App */
      
      /* Botão Voltar - PRIORIDADE MÁXIMA */
      .voltar-wrapper,
      body .voltar-wrapper,
      div .voltar-wrapper {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
      
      /* Header verde */
      body > div:first-child > .header,
      body > div > div > .header,
      .header:not([class*="Coleta"]) {
        display: none !important;
      }
      
      /* Barra de busca do App */
      body > div:first-child > .search-bar,
      body > div > div > .search-bar,
      .search-bar:not([class*="Coleta"]) {
        display: none !important;
      }
      
      /* Grid de cards */
      body > div:first-child > .grid,
      body > div > div > .grid {
        display: none !important;
      }
      
      @media (max-width: 768px) {
        body::before {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      const styleElement = document.getElementById('coleta-hide-app');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  // Carrega todos os funcionários
  useEffect(() => {
    axios
      .get("http://localhost:3001/funcionarios/todos")
      .then((res) => {
        setFuncionarios(res.data);
        
        // Extrai departamentos únicos
        const depts = [...new Set(res.data.map(f => f.departamento).filter(Boolean))];
        setDepartamentos(depts.sort());
      })
      .catch((err) => console.error("Erro ao buscar funcionários:", err));
  }, []);

  // Filtra funcionários baseado no departamento e busca
  const funcionariosFiltrados = funcionarios.filter((f) => {
    // Se tem departamento selecionado, mostra APENAS daquele departamento
    if (departamentoSelecionado && f.departamento !== departamentoSelecionado) {
      return false;
    }
    
    // Se não tem busca, mostra todos do departamento (ou todos se não tiver departamento)
    if (!buscaFuncionario) {
      return true;
    }
    
    // Se tem busca, filtra por nome, código ou CPF
    const termoBusca = buscaFuncionario.toLowerCase();
    const matchNome = f.nome && f.nome.toLowerCase().includes(termoBusca);
    const matchCodigo = f.codigo && f.codigo.toString().toLowerCase().includes(termoBusca);
    const matchCpf = f.cpf && f.cpf.includes(buscaFuncionario);
    
    return matchNome || matchCodigo || matchCpf;
  });

  // Filtra departamentos baseado na busca
  const departamentosFiltrados = departamentos.filter((d) =>
    d.toLowerCase().includes(buscaDepartamento.toLowerCase())
  );

  const selecionarDepartamento = (dept) => {
    setDepartamentoSelecionado(dept);
    setBuscaDepartamento(dept);
    setMostrarListaDepartamentos(false);
    // Limpa a seleção de funcionário ao trocar de departamento
    limparSelecao();
    // Mostra automaticamente a lista de funcionários daquele departamento
    setMostrarListaFuncionarios(false);
  };

  const limparDepartamento = () => {
    setDepartamentoSelecionado("");
    setBuscaDepartamento("");
    limparSelecao();
  };

  const selecionarFuncionario = (func) => {
    setFuncionarioSelecionado(func);
    setBuscaFuncionario(func.nome);
    setMostrarListaFuncionarios(false);
    
    // Se o funcionário já tem email e telefone, entra em modo edição
    if (func.email && func.telefone) {
      setEmail(func.email);
      setTelefone(func.telefone);
      setModoEdicao(true);
    } else {
      setEmail("");
      setTelefone("");
      setModoEdicao(false);
    }
  };

  const limparSelecao = () => {
    setFuncionarioSelecionado(null);
    setBuscaFuncionario("");
    setEmail("");
    setTelefone("");
    setModoEdicao(false);
    setMensagem("");
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    
    if (numeros.length <= 10) {
      return numeros.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    } else {
      return numeros.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
    }
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSalvar = () => {
    if (!funcionarioSelecionado) {
      setMensagem("⚠️ Selecione um funcionário antes de salvar!");
      return;
    }

    if (!email || !telefone) {
      setMensagem("⚠️ Preencha e-mail e telefone antes de salvar!");
      return;
    }

    if (!validarEmail(email)) {
      setMensagem("⚠️ Digite um e-mail válido!");
      return;
    }

    setAtualizando(true);
    setMensagem("");

    axios
      .post("http://localhost:3001/coleta", {
        id: funcionarioSelecionado.id,
        email: email,
        telefone: telefone,
      })
      .then(() => {
        setMensagem(`✅ Dados ${modoEdicao ? 'atualizados' : 'salvos'} com sucesso!`);
        
        // Atualiza a lista local
        setFuncionarios((prev) =>
          prev.map((f) =>
            f.id === funcionarioSelecionado.id
              ? { ...f, email: email, telefone: telefone }
              : f
          )
        );

        setTimeout(() => {
          limparSelecao();
        }, 2000);
      })
      .catch((err) => {
        console.error("Erro ao salvar:", err);
        setMensagem("❌ Erro ao salvar. Tente novamente.");
      })
      .finally(() => setAtualizando(false));
  };

  return (
    <div className={styles.coletaContainer}>
      <div className={styles.header}>
        <h1>📋 Cadastro de Contatos</h1>
        <p>Selecione um funcionário e preencha os dados de contato</p>
      </div>

      {mensagem && (
        <div className={mensagem.includes("✅") ? styles.mensagemSucesso : styles.mensagemErro}>
          {mensagem}
        </div>
      )}

      <div className={styles.formulario}>
        {/* Campo Departamento */}
        <div className={styles.formGroup} ref={departamentoRef}>
          <label>
            Departamento <span className={styles.opcional}>(opcional)</span>
          </label>
          <div className={styles.inputWrapper}>
            <Search className={styles.iconeInput} size={18} />
            <input
              type="text"
              placeholder="Digite para buscar departamento..."
              value={buscaDepartamento}
              onChange={(e) => {
                setBuscaDepartamento(e.target.value);
                setMostrarListaDepartamentos(true);
              }}
              onFocus={() => setMostrarListaDepartamentos(true)}
              className={styles.input}
            />
            {departamentoSelecionado && (
              <X
                className={styles.iconeLimpar}
                size={18}
                onClick={limparDepartamento}
              />
            )}
            <ChevronDown className={styles.iconeDropdown} size={18} />
          </div>

          {mostrarListaDepartamentos && departamentosFiltrados.length > 0 && (
            <div className={styles.dropdown}>
              {departamentosFiltrados.map((dept, idx) => (
                <div
                  key={idx}
                  className={`${styles.dropdownItem} ${
                    dept === departamentoSelecionado ? styles.selecionado : ""
                  }`}
                  onClick={() => selecionarDepartamento(dept)}
                >
                  {dept}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campo Funcionário */}
        <div className={styles.formGroup} ref={funcionarioRef}>
          <label>
            Funcionário <span className={styles.obrigatorio}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <Search className={styles.iconeInput} size={18} />
            <input
              type="text"
              placeholder="Digite o nome, código ou CPF..."
              value={buscaFuncionario}
              onChange={(e) => {
                setBuscaFuncionario(e.target.value);
                setMostrarListaFuncionarios(true);
                if (!e.target.value) limparSelecao();
              }}
              onFocus={() => setMostrarListaFuncionarios(true)}
              className={styles.input}
            />
            {funcionarioSelecionado && (
              <X
                className={styles.iconeLimpar}
                size={18}
                onClick={limparSelecao}
              />
            )}
            <ChevronDown className={styles.iconeDropdown} size={18} />
          </div>

          {mostrarListaFuncionarios && funcionariosFiltrados.length > 0 && (
            <div className={styles.dropdown}>
              {departamentoSelecionado && (
                <div className={styles.dropdownInfo}>
                  📁 {funcionariosFiltrados.length} funcionário(s) em {departamentoSelecionado}
                </div>
              )}
              {funcionariosFiltrados.slice(0, 10).map((func) => (
                <div
                  key={func.id}
                  className={`${styles.dropdownItem} ${
                    funcionarioSelecionado?.id === func.id ? styles.selecionado : ""
                  }`}
                  onClick={() => selecionarFuncionario(func)}
                >
                  <div className={styles.funcionarioInfo}>
                    <span className={styles.funcionarioNome}>{func.nome}</span>
                    <span className={styles.funcionarioDados}>
                      {func.codigo && `Cód: ${func.codigo}`}
                      {func.departamento && ` • ${func.departamento}`}
                    </span>
                  </div>
                  {func.email && func.telefone && (
                    <span className={styles.badgePreenchido}>✓</span>
                  )}
                </div>
              ))}
              {funcionariosFiltrados.length > 10 && (
                <div className={styles.dropdownRodape}>
                  Mostrando 10 de {funcionariosFiltrados.length} resultados
                </div>
              )}
            </div>
          )}

          {mostrarListaFuncionarios && 
           buscaFuncionario && 
           funcionariosFiltrados.length === 0 && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownVazio}>
                Nenhum funcionário encontrado
              </div>
            </div>
          )}
        </div>

        {/* Informações do funcionário selecionado */}
        {funcionarioSelecionado && (
          <div className={styles.infoSelecionado}>
            <div className={styles.infoHeader}>
              <span className={styles.infoTitulo}>Funcionário selecionado:</span>
              {modoEdicao && (
                <span className={styles.badgeModoEdicao}>
                  <Edit2 size={14} /> Modo Edição
                </span>
              )}
            </div>
            <div className={styles.infoDetalhes}>
              <p><strong>Nome:</strong> {funcionarioSelecionado.nome}</p>
              {funcionarioSelecionado.codigo && (
                <p><strong>Código:</strong> {funcionarioSelecionado.codigo}</p>
              )}
              {funcionarioSelecionado.cpf && (
                <p><strong>CPF:</strong> {funcionarioSelecionado.cpf}</p>
              )}
              {funcionarioSelecionado.departamento && (
                <p><strong>Departamento:</strong> {funcionarioSelecionado.departamento}</p>
              )}
            </div>
          </div>
        )}

        {/* Campos de contato */}
        {funcionarioSelecionado && (
          <>
            <div className={styles.formGroup}>
              <label>
                E-mail <span className={styles.obrigatorio}>*</span>
              </label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputSimples}
              />
            </div>

            <div className={styles.formGroup}>
              <label>
                Telefone <span className={styles.obrigatorio}>*</span>
              </label>
              <input
                type="text"
                placeholder="(31) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                maxLength="15"
                className={styles.inputSimples}
              />
            </div>

            <button
              onClick={handleSalvar}
              disabled={atualizando}
              className={styles.botaoSalvar}
            >
              <Save size={18} />
              {atualizando ? "Salvando..." : modoEdicao ? "Salvar Alterações" : "Salvar Contato"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Coleta;
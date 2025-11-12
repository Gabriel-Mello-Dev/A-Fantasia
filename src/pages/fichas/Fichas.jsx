import React, { useState, useEffect } from 'react';
import styles from './Fichas.module.css';

const Fichas = () => {
  const [fichas, setFichas] = useState([]);
  const [editando, setEditando] = useState(null);

  // Carregar fichas do localStorage ao iniciar
  useEffect(() => {
    const fichasSalvas = localStorage.getItem('fichasParanormal');
    if (fichasSalvas) {
      setFichas(JSON.parse(fichasSalvas));
    } else {
      // Ficha inicial de exemplo
      setFichas([
        {
          id: 1,
          nome: 'Mariana Noturno',
          subtitulo: 'Aguiar mente pra si mesmo que voa a noite...',
          imagem: '',
          simbolo: 'mariana',
          habilidades: [
            { nome: 'ATAQUE ESPECIAL', custo: '3 PD', descricao: 'Causa dano em um inimigo ao redor de até 3 metros de distância' },
            { nome: 'PREDADOR DE SANGUE', custo: '3 PD', descricao: 'Recupera 1D6 pontos de Sanidade e 1D2 pontos de vida ao sugar o sangue de um alvo' },
            { nome: 'TRANSFORMAÇÃO NOTURNA', custo: '', descricao: 'Quando a noite cai, pode se transformar em um morcego gigante. Ganha +2D6 em testes de Agilidade e +1D6 em testes de dano de Energia' }
          ]
        }
      ]);
    }
  }, []);

  // Salvar fichas no localStorage sempre que houver mudança
  useEffect(() => {
    if (fichas.length > 0) {
      localStorage.setItem('fichasParanormal', JSON.stringify(fichas));
    }
  }, [fichas]);

  const adicionarFicha = () => {
    const novaFicha = {
      id: Date.now(),
      nome: 'Nova Ficha',
      subtitulo: 'Descrição...',
      imagem: '',
      simbolo: 'default',
      habilidades: [
        { nome: 'HABILIDADE 1', custo: '3 PD', descricao: 'Descrição da habilidade' }
      ]
    };
    setFichas([...fichas, novaFicha]);
    setEditando(novaFicha.id);
  };

  const removerFicha = (id) => {
    if (window.confirm('Tem certeza que deseja remover esta ficha?')) {
      setFichas(fichas.filter(f => f.id !== id));
    }
  };

  const atualizarFicha = (id, campo, valor) => {
    setFichas(fichas.map(f => 
      f.id === id ? { ...f, [campo]: valor } : f
    ));
  };

  // Converter imagem para Base64
  const handleImageUpload = (fichaId, event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificar tamanho do arquivo (máx 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        atualizarFicha(fichaId, 'imagem', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removerImagem = (fichaId) => {
    atualizarFicha(fichaId, 'imagem', '');
  };

  const adicionarHabilidade = (fichaId) => {
    setFichas(fichas.map(f => {
      if (f.id === fichaId) {
        return {
          ...f,
          habilidades: [...f.habilidades, { nome: 'NOVA HABILIDADE', custo: '3 PD', descricao: 'Descrição' }]
        };
      }
      return f;
    }));
  };

  const atualizarHabilidade = (fichaId, habIndex, campo, valor) => {
    setFichas(fichas.map(f => {
      if (f.id === fichaId) {
        const novasHabilidades = [...f.habilidades];
        novasHabilidades[habIndex] = { ...novasHabilidades[habIndex], [campo]: valor };
        return { ...f, habilidades: novasHabilidades };
      }
      return f;
    }));
  };

  const removerHabilidade = (fichaId, habIndex) => {
    setFichas(fichas.map(f => {
      if (f.id === fichaId) {
        return {
          ...f,
          habilidades: f.habilidades.filter((_, i) => i !== habIndex)
        };
      }
      return f;
    }));
  };

  const exportarFichas = () => {
    const dataStr = JSON.stringify(fichas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fichas-paranormal.json';
    link.click();
  };

  const importarFichas = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fichasImportadas = JSON.parse(e.target.result);
          setFichas(fichasImportadas);
          alert('Fichas importadas com sucesso!');
        } catch (error) {
          alert('Erro ao importar fichas. Verifique o arquivo.');
        }
      };
      reader.readAsText(file);
    }
  };

  const limparTudo = () => {
    if (window.confirm('Tem certeza que deseja limpar todas as fichas? Esta ação não pode ser desfeita.')) {
      localStorage.removeItem('fichasParanormal');
      setFichas([]);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button className={styles.btnAdicionar} onClick={adicionarFicha}>
          + Adicionar Ficha
        </button>
        <button className={styles.btnExportar} onClick={exportarFichas}>
          📥 Exportar
        </button>
        <label className={styles.btnImportar}>
          📤 Importar
          <input 
            type="file" 
            accept=".json" 
            onChange={importarFichas}
            style={{ display: 'none' }}
          />
        </label>
        <button className={styles.btnLimpar} onClick={limparTudo}>
          🗑️ Limpar Tudo
        </button>
      </div>

      <div className={styles.fichasGrid}>
        {fichas.map((ficha) => (
          <div key={ficha.id} className={styles.fichaCard}>
            <div className={styles.fichaHeader}>
              <div className={styles.fichaImagem}>
                {ficha.imagem ? (
                  <>
                    <img src={ficha.imagem} alt={ficha.nome} />
                    {editando === ficha.id && (
                      <button 
                        className={styles.btnRemoverImagem}
                        onClick={() => removerImagem(ficha.id)}
                        title="Remover imagem"
                      >
                        ×
                      </button>
                    )}
                  </>
                ) : (
                  <div className={styles.imagemPlaceholder}>
                    {editando === ficha.id ? (
                      <label className={styles.uploadLabel}>
                        📷 Adicionar Foto
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(ficha.id, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    ) : (
                      'Sem imagem'
                    )}
                  </div>
                )}
              </div>

              <div className={styles.fichaInfo}>
                {editando === ficha.id ? (
                  <>
                    <input
                      type="text"
                      className={styles.inputNome}
                      value={ficha.nome}
                      onChange={(e) => atualizarFicha(ficha.id, 'nome', e.target.value)}
                      placeholder="Nome do personagem"
                    />
                    <textarea
                      className={styles.inputSubtitulo}
                      value={ficha.subtitulo}
                      onChange={(e) => atualizarFicha(ficha.id, 'subtitulo', e.target.value)}
                      placeholder="Descrição ou frase do personagem"
                      rows="2"
                    />
                    {ficha.imagem && (
                      <label className={styles.btnTrocarImagem}>
                        🔄 Trocar Foto
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(ficha.id, e)}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </>
                ) : (
                  <>
                    <h2 className={styles.fichaNome}>{ficha.nome}</h2>
                    <p className={styles.fichaSubtitulo}>{ficha.subtitulo}</p>
                  </>
                )}
              </div>

              <div className={styles.simbolo}>
                <svg viewBox="0 0 200 200" className={styles.simboloSvg}>
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#ff0000" strokeWidth="3" />
                  <circle cx="100" cy="40" r="15" fill="#ff0000" />
                  <circle cx="60" cy="80" r="15" fill="#ff0000" />
                  <circle cx="140" cy="80" r="15" fill="#ff0000" />
                  <circle cx="60" cy="140" r="15" fill="#ff0000" />
                  <circle cx="140" cy="140" r="15" fill="#ff0000" />
                  <circle cx="100" cy="160" r="15" fill="#ff0000" />
                  <circle cx="100" cy="100" r="20" fill="#8b0000" />
                </svg>
              </div>
            </div>

            <div className={styles.habilidadesContainer}>
              {ficha.habilidades.map((hab, index) => (
                <div key={index} className={styles.habilidade}>
                  {editando === ficha.id ? (
                    <>
                      <div className={styles.habilidadeHeader}>
                        <input
                          type="text"
                          className={styles.inputHabNome}
                          value={hab.nome}
                          onChange={(e) => atualizarHabilidade(ficha.id, index, 'nome', e.target.value)}
                          placeholder="Nome da habilidade"
                        />
                        <input
                          type="text"
                          className={styles.inputHabCusto}
                          value={hab.custo}
                          onChange={(e) => atualizarHabilidade(ficha.id, index, 'custo', e.target.value)}
                          placeholder="PD"
                        />
                        <button 
                          className={styles.btnRemoverHab}
                          onClick={() => removerHabilidade(ficha.id, index)}
                          title="Remover habilidade"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        className={styles.inputHabDesc}
                        value={hab.descricao}
                        onChange={(e) => atualizarHabilidade(ficha.id, index, 'descricao', e.target.value)}
                        placeholder="Descrição da habilidade"
                      />
                    </>
                  ) : (
                    <>
                      <div className={styles.habilidadeHeader}>
                        <span className={styles.habilidadeNome}>{hab.nome}</span>
                        {hab.custo && <span className={styles.habilidadeCusto}>{hab.custo}</span>}
                      </div>
                      <p className={styles.habilidadeDesc}>{hab.descricao}</p>
                    </>
                  )}
                </div>
              ))}

              {editando === ficha.id && (
                <button 
                  className={styles.btnAdicionarHab}
                  onClick={() => adicionarHabilidade(ficha.id)}
                >
                  + Adicionar Habilidade
                </button>
              )}
            </div>

            <div className={styles.fichaFooter}>
              <span className={styles.marca}>ORDEM PARANORMAL</span>
              <div className={styles.footerButtons}>
                {editando === ficha.id ? (
                  <button 
                    className={styles.btnSalvar}
                    onClick={() => setEditando(null)}
                  >
                    ✓ Salvar
                  </button>
                ) : (
                  <button 
                    className={styles.btnEditar}
                    onClick={() => setEditando(ficha.id)}
                  >
                    ✏️ Editar
                  </button>
                )}
                <button 
                  className={styles.btnRemover}
                  onClick={() => removerFicha(ficha.id)}
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {fichas.length === 0 && (
        <div className={styles.emptyState}>
          <p>Nenhuma ficha criada ainda.</p>
          <p>Clique em "Adicionar Ficha" para começar!</p>
        </div>
      )}
    </div>
  );
};

export { Fichas };
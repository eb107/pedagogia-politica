import { useEffect, useState } from 'react';
import { politicsService } from './services/api';
import type { Poder } from './types/politics';

function App() {
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instituicaoExpandida, setInstituicaoExpandida] = useState<number | null>(null);

  // NOVOS ESTADOS: Controle de Busca e Filtros
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [partidoSelecionado, setPartidoSelecionado] = useState<string>('');
  const [listaPartidos, setListaPartidos] = useState<string[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const dados = await politicsService.getArvorePoderes();
        setPoderes(dados);

        // Extrai dinamicamente todos os partidos únicos existentes no banco para alimentar o filtro
        const partidosUnicos = new Set<string>();
        dados.forEach(p => {
          p.instituicoes.forEach(i => {
            i.agentes.forEach(a => {
              if (a.partido && a.partido !== 'Sem Partido') {
                partidosUnicos.add(a.partido);
              }
            });
          });
        });
        setListaPartidos(Array.from(partidosUnicos).sort());

      } catch (err: any) {
        setError(err.message || 'Erro ao conectar com o ecossistema.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  const alternarInstituicao = (id: number) => {
    setInstituicaoExpandida(instituicaoExpandida === id ? null : id);
  };

  const obterCorPoder = (nome: string) => {
    switch (nome) {
      case 'EXECUTIVO': return 'border-blue-500 bg-blue-50/30 text-blue-800';
      case 'LEGISLATIVO': return 'border-emerald-500 bg-emerald-50/30 text-emerald-800';
      case 'JUDICIARIO': return 'border-amber-500 bg-amber-50/30 text-amber-800';
      default: return 'border-slate-500 bg-slate-50/30';
    }
  };

  // LÓGICA PROFISSIONAL DE FILTRAGEM DINÂMICA
  // Filtra a árvore de dados em memória mantendo a imutabilidade do estado original
  const poderesFiltrados = poderes.map(poder => {
    const instituicoesFiltradas = poder.instituicoes.map(inst => {
      const agentesFiltrados = inst.agentes.filter(agente => {
        const bateNome = agente.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
          (agente.nome_eleitoral && agente.nome_eleitoral.toLowerCase().includes(termoBusca.toLowerCase()));
        const batePartido = partidoSelecionado === '' || agente.partido === partidoSelecionado;
        return bateNome && batePartido;
      });

      return { ...inst, agentes: agentesFiltrados };
    });

    return { ...poder, instituicoes: instituicoesFiltradas };
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Carregando a estrutura política...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-xl bg-white p-6 shadow-md border border-red-100 text-center">
          <div className="text-red-500 text-5xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Falha na Conexão</h2>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-slate-200 py-8 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Portal de Pedagogia Política
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
            Explore e filtre a árvore constitucional do Brasil em tempo real [3.4].
          </p>
        </div>
      </header>

      {/* PAINEL DE FILTROS E BUSCA AVANÇADA */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Buscar por Nome</label>
            <input
              type="text"
              placeholder="Ex: Alexandre de Moraes, Lula, Fernando Haddad..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Filtrar por Partido</label>
            <select
              value={partidoSelecionado}
              onChange={(e) => setPartidoSelecionado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="">Todos os Partidos</option>
              {listaPartidos.map(partido => (
                <option key={partido} value={partido}>{partido}</option>
              ))}
              <option value="Sem Partido">Sem Partido (Técnicos / Judiciário)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Principal dos Três Poderes */}
      <main className="max-w-7xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {poderesFiltrados.map((poder) => (
            <section key={poder.id} className="flex flex-col rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
              <div className={`rounded-xl border-l-4 p-4 mb-6 ${obterCorPoder(poder.nome)}`}>
                <h2 className="text-lg font-bold tracking-wide uppercase">
                  {poder.nome === 'EXECUTIVO' ? '🏛️ Executivo' : poder.nome === 'LEGISLATIVO' ? '📊 Legislativo' : '⚖️ Judiciário'}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {poder.descricao_pedagogica}
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Instituições e Órgãos
                </h3>

                {poder.instituicoes.map((inst) => {
                  const isExpandida = instituicaoExpandida === inst.id;
                  return (
                    <div key={inst.id} className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                      <button onClick={() => alternarInstituicao(inst.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors focus:outline-hidden">
                        <div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-800 mr-2">
                            {inst.sigla}
                          </span>
                          <span className="text-sm font-semibold text-slate-900">{inst.nome}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                          ({inst.agentes.length}) ▼
                        </span>
                      </button>

                      {isExpandida && (
                        <div className="border-t border-slate-100 bg-white p-4 space-y-4">
                          <p className="text-xs text-slate-600 leading-relaxed">{inst.descricao_pedagogica}</p>

                          <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                            {inst.agentes.length === 0 ? (
                              <p className="col-span-2 text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg">
                                Nenhum agente corresponde aos filtros nesta instituição.
                              </p>
                            ) : (
                              inst.agentes.map((agente) => (
                                <div key={agente.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                  {agente.foto_url ? (
                                    <img src={agente.foto_url} alt={agente.nome_completo} className="h-9 w-9 rounded-full object-cover border border-slate-200 bg-white" loading="lazy" />
                                  ) : (
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                                      {agente.nome_completo.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 truncate">{agente.nome_completo}</p>
                                    <p className="text-xs text-slate-500 truncate">
                                      {agente.partido ? `${agente.cargo} · ${agente.partido}` : agente.cargo}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
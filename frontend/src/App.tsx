import { useEffect, useState } from "react";
import { politicsService } from "./services/api";
import type { Poder, Instituição } from "./types/politics";
import './index.css'

function App() {
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [instituicaoExpandida, setInstituicaoExpandida] = useState<number | null>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const dados = await politicsService.getArvorePoderes();
        setPoderes(dados);
        console.log('Dados da API carregados com sucesso no React!', dados);
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido ao carregar dados.');
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  const alternarInstituicao = (id: number) => {
    setInstituicaoExpandida(instituicaoExpandida === id ? null : id);
  };

  // Função auxiliar para pintar as bordas de cada poder de acordo com o padrão institucional
  const obterCorPoder = (nome: string) => {
    switch (nome) {
      case 'EXECUTIVO': return 'border-blue-500 bg-blue-50/30 text-blue-800';
      case 'LEGISLATIVO': return 'border-emerald-500 bg-emerald-50/30 text-emerald-800';
      case 'JUDICIARIO': return 'border-amber-500 bg-amber-50/30 text-amber-800';
      default: return 'border-slate-500 bg-slate-50/30';
    };
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto">
            <p className="mt-4 text-slate-600 font-medium">Carregando a estrutura do Estado brasileiro...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-xl bg-white p-6 shadow-md border border-red-100 text-center">
          <div className="text-red-500 text-5xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Falha na Conexão</h2>
          <p className="text-slate-600 text-sm mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors" >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/*Cabeçalho Pedagógico*/}
      <header className="bg-white border-b border-slate-200 py-8 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Portal de Pedagogia Política
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl mx-auto">
            Explore a árvore constitucional do Brasil. Clique nas instituições para abrir os galhos e visualizar os agentes políticos em exercício [3.4]
          </p>
        </div>
      </header>

      {/* Grid Principal dos Três Poderes */}
      <main className="max-w-7xl mx-auto px-4 mt-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {poderes.map((poder) => (
            <section key={poder.id} className="flex flex-col rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
              {/* Header do Poder */}
              <div className={`rounded-xl border-l-4 p-4 mb-6 ${obterCorPoder(poder.nome)}`}>
                <h2 className="text-lg font-bold tracking-wide uppercase">
                  {poder.nome === 'EXECUTIVO' ? '🏛️ Executivo' : poder.nome === 'LEGISLATIVO' ? '📊 Legislativo' : '⚖️ Judiciário'}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {poder.descricao_pedagogica}
                </p>
              </div>

              {/* Lista de Instituições (Os Galhos) */}
              <div className="flex-1 space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Instituições e Órgãos
                </h3>

                {poder.instituicoes.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum órgão cadastrado.</p>
                ) : (
                  poder.instituicoes.map((inst) => {
                    const isExpandida = instituicaoExpandida === inst.id;
                    return (
                      <div key={inst.id} className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden transition-all duration-200">
                        {/* Botão de Disparo da Sanfona */}
                        <button onClick={() => alternarInstituicao(inst.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors focus:outline-hidden">
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-800 mr-2">
                              {inst.sigla}
                            </span>
                            <span className="text-sm font-semibold text-slate-900">{inst.nome}</span>
                          </div>
                          <span className={`text-slate-400 transition-transform duration-200 ${isExpandida ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>

                        {/* Conteúdo Expandido */}
                        {isExpandida && (
                          <div className="border-t border-slate-100 bg-white p-4 space-y-4">
                            <div>
                              <h4 className="text-xs font-medium text-slate-400 uppercase mb-1">O que faz?</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">{inst.descricao_pedagogica}</p>
                            </div>

                            {inst.site_oficial && (
                              <a href={inst.site_oficial} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-500">
                                Visitar site oficial da instituição →
                              </a>
                            )}

                            {/* Galeria de Agentes Políticos (As Folhas da Árvore) */}
                            <div>
                              <h4 className="text-xs font-medium text-slate-400 uppercase mb-2">
                                Membros e Ocupantes ({inst.agentes.length})
                              </h4>
                              {inst.agentes.length === 0 ? (
                                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg">
                                  Nenhum agente listado no momento. (Aguardando carga ou atualização).
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                  {inst.agentes.map((agente) => (
                                    <div key={agente.id} className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                      {agente.foto_url ? (
                                        <img src={agente.foto_url} alt={agente.nome_completo} className="h-9 w-9 rounded-full object-cover border border-slate-200 bg-white" loading="lazy" />
                                      ) : (
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs text-slate-500 font-bold">
                                          {agente.nome_completo.charAt(0)}
                                        </div>
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-semibold text-slate-800 truncate" title={agente.nome_completo}>
                                          {agente.nome_completo}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate">
                                          {agente.partido ? `${agente.cargo} · ${agente.partido}` : agente.cargo}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
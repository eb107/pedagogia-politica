import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { politicsService } from './services/api';
import type { Poder } from './types/politics';

// Helper para normalizar URLs de fotos vindas do backend/public
function formatarFotoUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^\/public\//, '/');
}

// Configurações visuais sutis e elegantes para cada poder (sem brilhos fortes)
const PODERES_META: Record<
  string,
  {
    cor: string;
    tagBorder: string;
    tagBg: string;
    tagText: string;
    lineAccent: string;
    label: string;
  }
> = {
  EXECUTIVO: {
    cor: '#38bdf8', // sky-400
    tagBorder: 'border-sky-500/30',
    tagBg: 'bg-sky-500/10',
    tagText: 'text-sky-300',
    lineAccent: 'from-sky-500 to-blue-600',
    label: 'Administra & Executa',
  },
  LEGISLATIVO: {
    cor: '#34d399', // emerald-400
    tagBorder: 'border-emerald-500/30',
    tagBg: 'bg-emerald-500/10',
    tagText: 'text-emerald-300',
    lineAccent: 'from-emerald-500 to-teal-600',
    label: 'Cria & Fiscaliza',
  },
  JUDICIARIO: {
    cor: '#fbbf24', // amber-400
    tagBorder: 'border-amber-500/30',
    tagBg: 'bg-amber-500/10',
    tagText: 'text-amber-300',
    lineAccent: 'from-amber-500 to-orange-600',
    label: 'Julga & Garante a CF',
  },
};

function App() {
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Índice do Poder ativo no Carrossel (0 = Executivo, 1 = Legislativo, 2 = Judiciário)
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Filtros
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [partidoSelecionado, setPartidoSelecionado] = useState<string>('');
  const [listaPartidos, setListaPartidos] = useState<string[]>([]);

  // Órgão selecionado dentro do card do poder ativo
  const [instituicaoSelecionada, setInstituicaoSelecionada] = useState<number | null>(null);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const dados = await politicsService.getArvorePoderes();
        setPoderes(dados);

        // Coleta de partidos únicos
        const partidosUnicos = new Set<string>();
        dados.forEach((p) => {
          p.instituicoes.forEach((i) => {
            i.agentes.forEach((a) => {
              if (a.partido && a.partido !== 'Sem Partido') {
                partidosUnicos.add(a.partido);
              }
            });
          });
        });
        setListaPartidos(Array.from(partidosUnicos).sort());

        // Define a primeira instituição do poder ativo inicial
        if (dados[0]?.instituicoes[0]) {
          setInstituicaoSelecionada(dados[0].instituicoes[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Erro de comunicação de barramento.');
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, []);

  // Dados filtrados por busca e partido
  const poderesFiltrados = poderes.map((poder) => ({
    ...poder,
    instituicoes: poder.instituicoes.map((inst) => ({
      ...inst,
      agentes: inst.agentes.filter((agente) => {
        const bateNome =
          agente.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
          (agente.nome_eleitoral && agente.nome_eleitoral.toLowerCase().includes(termoBusca.toLowerCase()));
        const batePartido = partidoSelecionado === '' || agente.partido === partidoSelecionado;
        return bateNome && batePartido;
      }),
    })),
  }));

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : poderesFiltrados.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < poderesFiltrados.length - 1 ? prev + 1 : 0));
  };

  // Quando troca o poder ativo, atualiza a instituição selecionada padrão
  const mudarPoder = (novoIndex: number) => {
    setActiveIndex(novoIndex);
    const poderAtual = poderesFiltrados[novoIndex];
    if (poderAtual?.instituicoes[0]) {
      setInstituicaoSelecionada(poderAtual.instituicoes[0].id);
    }
  };

  // ── LOADING ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 text-white">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-9 w-9 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center animate-pulse">
            <span className="text-xs font-black tracking-widest text-white/80">BR</span>
          </div>
          <p className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
            Carregando estrutura constitucional...
          </p>
        </div>
      </div>
    );
  }

  // ── ERROR ─────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950 px-4 text-white">
        <div className="max-w-sm w-full rounded-2xl bg-neutral-900/80 border border-red-500/20 p-8 text-center backdrop-blur-xl">
          <div className="text-4xl mb-3 text-red-400/80">⚠</div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Erro de Carregamento</h2>
          <p className="text-white/40 text-xs mb-6 font-light">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-xs font-medium transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white overflow-x-hidden selection:bg-white/10">
      {/* Grade de fundo discreta e estática (sem neons) */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* ── HEADER DISCRETO ───────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#090a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-neutral-800/90 border border-white/10 flex items-center justify-center">
              <span className="text-[10px] font-black text-white/90">BR</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white/90 leading-none">Pedagogia Política</h1>
              <p className="text-[9px] text-white/35 uppercase tracking-wider leading-none mt-1">
                Estrutura de Estado
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2.5 w-full max-w-sm">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar agente ou cargo..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-900/80 border border-white/[0.08] rounded-lg text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
              />
              <svg
                className="w-3.5 h-3.5 text-white/30 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={partidoSelecionado}
              onChange={(e) => setPartidoSelecionado(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-900 border border-white/[0.08] rounded-lg text-xs text-white/60 focus:outline-none focus:border-white/20 transition-colors cursor-pointer"
            >
              <option value="">Todos Partidos</option>
              {listaPartidos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="Sem Partido">Sem Partido</option>
            </select>
          </div>
        </div>
      </header>

      {/* ── CONTEÚDO PRINCIPAL ─────────────────────────────── */}
      <main className="relative max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-16">
        {/* Título & Descrição Superior */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold tracking-[0.25em] text-white/30 uppercase mb-1.5">
            Organização dos Três Poderes
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Poderes Constitucionais da República
          </h2>
          <p className="text-xs text-white/40 font-light mt-1.5 max-w-md mx-auto">
            O Executivo sobrepõe o Legislativo, que sobrepõe o Judiciário. Arraste, use as setas ou clique no card para trazer à frente.
          </p>
        </div>

        {/* ── CONTROLES DO CARROSSEL DE PODERES ────────────────── */}
        <div className="flex items-center justify-between max-w-xl mx-auto mb-6 px-2">
          {/* Navegação por Pílulas Segmentadas */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900/90 border border-white/[0.07]">
            {poderesFiltrados.map((poder, idx) => {
              const isSelected = activeIndex === idx;
              const meta = PODERES_META[poder.nome] || PODERES_META.EXECUTIVO;

              return (
                <button
                  key={poder.id}
                  type="button"
                  onClick={() => mudarPoder(idx)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: meta.cor }}
                    />
                    {poder.nome}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Botões Setas Anterior / Próximo */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Poder anterior"
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-neutral-900/80 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Próximo poder"
              className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-neutral-900/80 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── STAGE DO CARROSSEL: CARDS DOS 3 PODERES SOBREPOSTOS ── */}
        <div
          ref={carouselRef}
          className="relative w-full h-[640px] flex items-center justify-center overflow-visible select-none"
        >
          {poderesFiltrados.map((poder, idx) => {
            const meta = PODERES_META[poder.nome] || PODERES_META.EXECUTIVO;

            // Cálculo do offset em relação ao card ativo
            // Offset: 0 = ativo (frente)
            // Offset > 0: atrás à direita
            // Offset < 0: atrás à esquerda
            const offset = idx - activeIndex;
            const isCenter = offset === 0;

            // Configuração física de sobreposição (Executivo sobrepõe Legislativo sobrepõe Judiciário)
            // Se o usuário clica em um card qualquer, ele vem à frente com zIndex 30
            let xOffset = 0;
            let scale = 1;
            let zIndex = 30;
            let opacity = 1;
            let rotateY = 0;

            if (offset === 0) {
              xOffset = 0;
              scale = 1;
              zIndex = 30;
              opacity = 1;
              rotateY = 0;
            } else if (offset === 1 || (activeIndex === 2 && idx === 0)) {
              // Card imediatamente à direita/atrás
              xOffset = 90;
              scale = 0.94;
              zIndex = 20;
              opacity = 0.65;
              rotateY = -2;
            } else if (offset === 2) {
              // Terceiro card mais ao fundo à direita
              xOffset = 175;
              scale = 0.88;
              zIndex = 10;
              opacity = 0.45;
              rotateY = -4;
            } else if (offset === -1 || (activeIndex === 0 && idx === 2)) {
              // Card imediatamente à esquerda/atrás
              xOffset = -90;
              scale = 0.94;
              zIndex = 20;
              opacity = 0.65;
              rotateY = 2;
            } else if (offset === -2) {
              // Terceiro card mais ao fundo à esquerda
              xOffset = -175;
              scale = 0.88;
              zIndex = 10;
              opacity = 0.45;
              rotateY = 4;
            }

            // Conta total de membros neste poder
            const totalMembros = poder.instituicoes.reduce((acc, i) => acc + i.agentes.length, 0);

            // Instituição atualmente selecionada no card do poder ativo
            const instituicaoAtiva =
              poder.instituicoes.find((i) => i.id === instituicaoSelecionada) || poder.instituicoes[0];

            return (
              <motion.div
                key={poder.id}
                onClick={() => mudarPoder(idx)}
                drag={isCenter ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -40) handleNext();
                  if (info.offset.x > 40) handlePrev();
                }}
                animate={{
                  x: xOffset,
                  scale,
                  zIndex,
                  opacity,
                  rotateY,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 26,
                }}
                className={`absolute w-full max-w-[500px] h-[580px] rounded-3xl border transition-colors duration-300 flex flex-col justify-between p-6 md:p-7 ${
                  isCenter
                    ? 'border-white/[0.14] bg-[#11131a] shadow-[0_20px_50px_rgba(0,0,0,0.85)] cursor-default'
                    : 'border-white/[0.06] bg-[#0d0e14] shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer hover:border-white/10'
                }`}
                style={{
                  transformPerspective: 1000,
                }}
              >
                {/* Linha discreta de acento de cor no topo do card (substitui o brilho excessivo) */}
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full"
                  style={{ backgroundColor: meta.cor, opacity: isCenter ? 0.7 : 0.25 }}
                />

                {/* ── PARTE SUPERIOR DO CARD: TÍTULO DO PODER ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold tracking-wider text-white/30 uppercase">
                        0{idx + 1} / 03
                      </span>
                      <span className="text-white/20">•</span>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${meta.tagBorder} ${meta.tagBg} ${meta.tagText}`}
                      >
                        {meta.label}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-white/30">
                      {totalMembros} membros
                    </span>
                  </div>

                  {/* Nome do Poder com cor discreta */}
                  <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    {poder.nome}
                  </h3>

                  {/* Descrição pedagógica clara e legível */}
                  <p className="text-xs text-white/50 leading-relaxed font-light mt-2 line-clamp-3">
                    {poder.descricao_pedagogica}
                  </p>
                </div>

                {/* ── PARTE INTERMEDIÁRIA: ÓRGÃOS DO PODER ── */}
                <div className="my-4 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-3">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">
                      Órgãos Constitucionais
                    </span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {poder.instituicoes.length} órgãos
                    </span>
                  </div>

                  {/* Lista de Órgãos em formato de pílulas/tabs */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {poder.instituicoes.map((inst) => {
                      const isInstActive = instituicaoAtiva?.id === inst.id;
                      return (
                        <button
                          key={inst.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInstituicaoSelecionada(inst.id);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                            isInstActive
                              ? 'border-white/20 bg-white/10 text-white font-semibold'
                              : 'border-white/5 bg-white/[0.02] text-white/40 hover:text-white/70 hover:border-white/10'
                          }`}
                        >
                          <span className="text-[10px] font-bold">{inst.sigla}</span>
                          <span className="text-[9px] opacity-40 font-mono">({inst.agentes.length})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Visão do Órgão Selecionado e seus Atores */}
                  {instituicaoAtiva && (
                    <div className="flex-1 rounded-2xl bg-black/30 border border-white/[0.05] p-3.5 flex flex-col min-h-0 overflow-hidden">
                      <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.04]">
                        <div>
                          <h4 className="text-xs font-bold text-white/90 leading-tight">
                            {instituicaoAtiva.nome}
                          </h4>
                          <p className="text-[10px] text-white/40 line-clamp-1 mt-0.5">
                            {instituicaoAtiva.descricao_pedagogica}
                          </p>
                        </div>
                        {instituicaoAtiva.site_oficial && (
                          <a
                            href={instituicaoAtiva.site_oficial}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[9px] text-white/30 hover:text-white/70 underline underline-offset-2 shrink-0 ml-2"
                          >
                            Site
                          </a>
                        )}
                      </div>

                      {/* Lista de Atores Políticos do Órgão */}
                      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                        {instituicaoAtiva.agentes.length === 0 ? (
                          <p className="text-[10px] text-white/30 italic text-center py-4">
                            Nenhum agente para os filtros ativos.
                          </p>
                        ) : (
                          instituicaoAtiva.agentes.map((agente) => {
                            const fotoUrl = formatarFotoUrl(agente.foto_url);
                            return (
                              <div
                                key={agente.id}
                                className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {fotoUrl ? (
                                    <img
                                      src={fotoUrl}
                                      alt={agente.nome_completo}
                                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/10"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div
                                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                      style={{ backgroundColor: `${meta.cor}33` }}
                                    >
                                      {agente.nome_completo.charAt(0)}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-white/90 truncate leading-tight">
                                      {agente.nome_eleitoral || agente.nome_completo}
                                    </p>
                                    <p className="text-[10px] text-white/35 truncate">
                                      {agente.cargo}
                                    </p>
                                  </div>
                                </div>

                                <div className="shrink-0 text-right">
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5 text-white/60">
                                    {agente.partido || 'Indep.'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── RODAPÉ DO CARD ── */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/30 font-light">
                  <span>Constituição de 1988</span>
                  {isCenter ? (
                    <span className="text-white/60 font-medium">Poder em Foco</span>
                  ) : (
                    <span className="text-white/30">Clique para focar</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Indicador de cards na base */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {poderesFiltrados.map((poder, i) => (
            <button
              key={poder.id}
              type="button"
              onClick={() => mudarPoder(i)}
              aria-label={`Ir para ${poder.nome}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-8 bg-white/70' : 'w-2 bg-white/15 hover:bg-white/30'
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
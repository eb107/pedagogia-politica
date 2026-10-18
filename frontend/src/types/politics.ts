export interface AgentePolitico {
    id: number;
    nome_completo: string;
    nome_eleitoral: string | null;
    cargo: string;
    partido: string | null;
    foto_url: string | null;
    data_inicio_mandato: string | null;
}

export interface Instituição {
    id: number;
    nome: string;
    sigla: string;
    descricao_pedagogica: string;
    site_oficial: string | null;
    agentes: AgentePolitico[];
}

export interface Poder {
    id: number;
    nome: 'EXECUTIVO' | 'LEGISLATIVO' | 'JUDICIARIO';
    descricao_pedagogica: string;
    instituicoes: Instituição[];
}
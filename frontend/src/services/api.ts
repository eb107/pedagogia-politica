import type { Poder } from '../types/politics';

// O Vite injeta automaticamente a variável definida no docekr-compose
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const politicsService = {
    /**
     * Busca a árvore completa dos três poderes com suas instituições e agentes aninhados
     */
    getArvorePoderes: async (): Promise<Poder[]> => {
        const response = await fetch(`${API_URL}/arvore/`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar a árvore de poderes: ${response.statusText}`);
        }

        return response.json();
    }
}



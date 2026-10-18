import { useEffect, useState } from "react";
import { politicsService } from "./services/api";
import type { Poder } from "./types/politics";

function App() {
  const [poderes, setPoderes] = useState<Poder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null> (null);
  
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

  if (loading) return <div style={{padding: '20px'}}>Carregando estrutura política...</div>;
  if (error) return <div style={{padding: '20px', color: 'red'}}>Erro: {error}</div>;
  
  return (
    <div style={{padding: '20px', fontFamily: 'sans-serif'}}>
      <h1>Portal de Pedagogia Política</h1>
      <p>Aqui está o teste de conexão. Verifique o console do desenvolvedor (F12) para inspecionar a árvore!</p>

      <ul>
        {poderes.map((poder) => (
          <li key={poder.nome}>
            <strong>{poder.nome}</strong>: {poder.descricao_pedagogica}
            <ul>
              {poder.instituicoes.map((inst) => (
                <li key={inst.id}>{inst.sigla} - {inst.nome}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App;
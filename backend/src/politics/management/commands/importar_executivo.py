from django.core.management.base import BaseCommand, CommandError
from politics.models import Poder, Instituicao, AgentePolitico

class Command(BaseCommand):
    help = 'Mapeia e importa a estrutura atual do poder Executivo Federal, incluindo Presidência e Ministérios de Estado.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando o mapeamento do Poder Executivo Federal...'))

        # 1. Garante a existência do Poder Executivo no banco
        executivo, _ = Poder.objects.get_or_create(
            nome = 'EXECUTIVO',
            defaults={'descricao_pedagogica': 'Poder responsável por administrar o Estado, aplicar as leis vigentes e propor políticas públicas. É chefiado pelo Presidente da República.'}
        )

        # 2. Garante a existência da instituição Presidência da República (PR)
        pr, _ = Instituicao.objects.get_or_create(
            sigla = 'PR',
            defaults={
                'nome': 'Presidência da República',
                'poder': executivo,
                'descricao_pedagogica': 'Órgão central do Poder Executivo Federal, onde o Presidente e seus Ministérios de Estado tomam decisões sobre a gestão do país.',
                'site_oficial': 'https://www.gov.br/planalto/pt-br'
            }
        )

        # 3. Dados consolidados e atualizados do topo do Executivo Federal (Composição de Governo)
        # Nota de Engenharia: Dados curados para garantir consistência e evitar quebras de layouts
        agentes_presidencia = [
            {
                "nome_completo": "Luiz Inácio Lula da Silva",
                "nome_eleitoral": "Lula",
                "cargo": "Presidente da República",
                "partido": "PT",
                "foto_url": "/public/images/executivo/Lula.jpg"
            },
            {
                "nome_completo": "Geraldo José Rodrigues Alckmin Filho",
                "nome_eleitoral": "Geraldo Alckmin",
                "cargo": "Vice-Presidente da República",
                "partido": "PSB",
                "foto_url": "/public/images/executivo/Alckmin.jpg"
            }
        ]

        for ag in agentes_presidencia:
            AgentePolitico.objects.update_or_create(
                nome_completo=ag['nome_completo'],
                instituicao=pr,
                defaults={
                    "nome_eleitoral": ag["nome_eleitoral"],
                    "cargo": ag["cargo"],
                    "partido": ag["partido"][:20],
                    "foto_url": ag["foto_url"]
                }
            )

        # 4. Mapeamento Pedagógico dos Principais Ministérios de Estado (A Esplanada)
        # Cadastrados como Instituições vinculadas ao Poder Executivo
        ministerios = [
            {
                "sigla": "MF",
                "nome": "Ministério da Fazenda",
                "desc": "Responsável pela formulação e execução da política econômica nacional, administração fazendária e equilíbrio das contas públicas.",
                "site": "https://www.gov.br",
                "ministro": "Fernando Haddad",
                "foto_url": "/public/images/executivo/Haddad.jpg"
            },
            {
                "sigla": "MS",
                "nome": "Ministério da Saúde",
                "desc": "Responsável pela organização e gestão do Sistema Único de Saúde (SUS), políticas de vigilância, prevenção e assistência à saúde da população.",
                "site": "https://www.gov.br",
                "ministro": "Nísia Trindade",
                "foto_url": "/public/images/executivo/Nisia_Trindade.jpg"
            },
            {
                "sigla": "MEC",
                "nome": "Ministério da Educação",
                "desc": "Responsável pela formulação e execução da Política Nacional de Educação, desde a educação infantil até o ensino superior e técnico.",
                "site": "https://www.gov.br",
                "ministro": "Camilo Santana",
                "foto_url": "/public/images/executivo/Camilo_Santana.jpg"
            },
            {
                "sigla": "MRE",
                "nome": "Ministério das Relações Exteriores",
                "desc": "Conhecido como Itamaraty, é o órgão responsável por auxiliar o Presidente na formulação e execução da política externa brasileira.",
                "site": "https://www.gov.br",
                "ministro": "Mauro Vieira",
                "foto_url": "/public/images/executivo/Mauro_Vieira.jpg"
            },
            {
                "sigla": "MJSP",
                "nome": "Ministério da Justiça e Segurança Pública",
                "desc": "Responsável pela defesa da ordem jurídica, direitos constitucionais, garantias individuais, além da coordenação da segurança pública federal.",
                "site": "https://www.gov.br",
                "ministro": "Welliton Cesar",
                "foto_url": "/public/images/executivo/Welliton_Cesar.jpg"
            },
            {
                "sigla": "MCC",
                "nome": "Ministério da Casa Civil",
                "desc": "Responsável por assessorar diretamente o presidente da República na coordenação, monitoramento e integração de todas as ações, ministérios e políticas públicas do governo federal.",
                "site": "https://www.gov.br",
                "ministro": "Miriam Belchior",
                "foto_url": "/public/images/executivo/Miriam_Belchior.jpg"
            },
            {
                "sigla": "MPO",
                "nome": "Ministério do Planejamento e Orçamento",
                "desc": "Responsável por planejar o desenvolvimento estratégico do país, elaborar e gerenciar o orçamento federal e coordenar as políticas de gestão da administração pública.",
                "site": "https://www.gov.br",
                "ministro": "Simone Tebet",
                "foto_url": "/public/images/executivo/Simone_Tebet.jpg"
            },
            {
                "sigla": "Secom",
                "nome": "Secretaria de Comunicação Social",
                "desc": "Responsável por planejar, coordenar e executar a política de comunicação, a publicidade institucional e as relações com a imprensa do Governo Federal.",
                "site": "https://www.gov.br",
                "ministro": "Paulo Pimenta",
                "foto_url": "/public/images/executivo/Paulo_Pimenta.jpg"
            },
            {
                "sigla": "GSI",
                "nome": "Gabinete de Segurança Institucional",
                "desc": "Responsável por assessorar o Presidente da República na definição de diretrizes da política de segurança institucional e pela coordenação das atividades de inteligência e de salvaguarda de altos funcionários do Governo Federal.",
                "site": "https://www.gov.br",
                "ministro": "Marcos Antônio Amaro dos Santos",
                "foto_url": "/public/images/executivo/Marcos_Antonio.jpg"
            }
        ]

        for min_dado in ministerios:
            # Cria o Ministério como um 'Galho' do Executivo
            inst_min, _ = Instituicao.objects.get_or_create(
                sigla=min_dado['sigla'],
                defaults={
                    'nome': min_dado['nome'],
                    'poder': executivo,
                    'descricao_pedagogica': min_dado['desc'],
                    'site_oficial': min_dado['site']
                }
            )

            # Injeta o respectivo Ministro como a 'Folha' desse Ministério
            AgentePolitico.objects.update_or_create(
                cargo="Ministro de Estado",
                instituicao=inst_min,
                defaults={
                    "nome_completo": min_dado['ministro'],
                    "nome_eleitoral": min_dado["ministro"],
                    "partido": "Sem Partido", # Ministros atuam tecnicamente pelo governo
                    "foto_url": min_dado["foto_url"]
                }
            )

        self.stdout.write(self.style.SUCCESS('Poder Executivo Federal estruturado e atualizado com sucesso no banco!'))
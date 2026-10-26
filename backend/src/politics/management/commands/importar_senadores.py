import requests
from django.core.management.base import BaseCommand, CommandError
from politics.models import Instituicao, AgentePolitico

class Command(BaseCommand):
    help = 'Consome a API de Dados Abertos do Senado e importa 81 senadores atuais em exercício.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando o pipeline de ETL dos senadores...'))

        # Código profissional auto-sustentável: localiza ou cria o Senado Federal na hora
        # Primeiro, precisamos garantir que o Poder Legislativo (PK=2 do loaddata ou criado dinamicamente) exista
        from politics.models import Poder
        poder_legislativo, _ = Poder.objects.get_or_create(
            nome="LEGISLATIVO",
            defaults={"descricao_pedagogica": "Poder encarregado de criar, alterar e revogar leis, além de fiscalizar as ações do Poder Executivo."}
        )

        # Encontra ou cria a instituição vinculando-a ao Legislativo
        senado, criado_agora = Instituicao.objects.get_or_create(
            sigla="SF",
            defaults={
                "nome": "Senado Federal",
                "poder": poder_legislativo,
                "descricao_pedagogica": "Representa os Estados da federação e o Distrito Federal. É composto por 81 senadores que revisam projetos de lei e julgam crimes de responsabilidade.",
                "site_oficial": "https://legis.senado.leg.br"
              }
        )

        if criado_agora:
            self.stdout.write(self.style.SUCCESS("A instituição 'Senado Federal (SF)' não existia e foi criada automaticamente pelo robô!"))

        # 2. Requisição para a API oficial do Senado Federal (Parlamentares em exercício)
        url = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual"
        headers = {
            "Accept": "application/json"   # Força a API do Senado a responder em JSON puro em vez de XML
        }

        try:
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()

            # Navega na estrutura profunda do JSON do Senado
            lista_parlamentar = response.json().get('ListaParlamentarEmExercicio', {})
            dados_api = lista_parlamentar.get('Parlamentares', {}).get('Parlamentar', [])
        except (requests.RequestException, KeyError, AttributeError) as e:
            raise CommandError(f'Erro ao conectar ou decifrar a API do Senado: {e}')

        if not dados_api:
            self.stdout.write(self.style.WARNING("Nenhum senador retornado pela API."))
            return

        self.stdout.write(f"Processando {len(dados_api)} senadores encontrados...")

        # 3. Processamento e Carga Idempotente (update_or_create)
        cont_criados = 0
        cont_atualizados = 0

        for sen in dados_api:
            identificacao = sen.get("IdentificacaoParlamentar", {})
            nome_completo = identificacao.get("NomeCompletoParlamentar")
            
            if not nome_completo:
                continue

            # Tratamento de segurança para o tamanho limite da coluna partido (max_length=20)
            partido_cru = identificacao.get("SiglaPartidoParlamentar", "S/Partid")
            partido_limpo = partido_cru[:20] if partido_cru else "S/Partid"

            agente, criado = AgentePolitico.objects.update_or_create(
                nome_completo=nome_completo,
                instituicao=senado,
                defaults={
                    "nome_eleitoral": identificacao.get("NomeParlamentar"),
                    "cargo": "Senador",
                    "partido": partido_limpo,
                    "foto_url": identificacao.get("UrlFotoParlamentar"),
                }
            )

            if criado:
                cont_criados += 1
            else:
                cont_atualizados += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"ETL do Senado concluído! Criados: {cont_criados} | Atualizados: {cont_atualizados}"
            )
        )

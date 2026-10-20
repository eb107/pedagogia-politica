import requests
from django.core.management.base import BaseCommand, CommandError
from politics.models import Instituicao, AgentePolitico

class Command(BaseCommand):
    help = 'Consome a API de Dados Abertos da Câmara e importa os deputados federais atuais.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Iniciando o pipeline de ETL dos deputados.'))

        # 1. Localiza a instituição 'Câmara dos Deputados' criada no nosso seed
        try:
            camara = Instituicao.objects.get(sigla='CD')
        except Instituicao.DoesNotExist:
            raise CommandError(
                "A instituição 'Câmara dos Deputados' (Sigla CD) não foi encontrada no banco. Rode o loaddata primeiro."
            )

        # 2. Requisição para a API oficial de Dados Abertos da Câmara (Filtrando por Deputados em exercício).
        url = 'https://dadosabertos.camara.leg.br/api/v2/deputados'
        params = {
            'ordem': 'ASC',
            'ordenarPor': 'nome'
        }

        headers = {
            'Accept': 'application/json'
        }

        try:
            response = requests.get(url, params=params, headers=headers, timeout=15)
            response.raise_for_status()
            dados_api = response.json().get('dados', [])
        except requests.RequestException as e:
            raise CommandError(f"Erro ao conectar com a API da Câmara: {e}")

        if not dados_api:
            self.stdout.write(self.style.WARNING('Nenhum deputado retornado pela API.'))
            return

        self.stdout.write(f'Processando {len(dados_api)} deputados encontrados...')

        # 3. Processamento e Carga (Idempotente com update_or_create)
        cont_criados = 0
        cont_atualizados = 0

        for dep in dados_api:
            # O padrão update_or_create evita duplicidade caso o script rode mais de uma vez
            agente, criado = AgentePolitico.objects.update_or_create(
                # Chave única de busca (nome completo na mesma instituição)
                nome_completo = dep.get('nome'),
                instituicao = camara,
                defaults = {
                    'nome_eleitoral': dep.get('nome'),
                    'cargo': 'Deputado Federal',
                    'partido': dep.get('siglaPartido'),
                    'foto_url': dep.get('urlFoto'),
                }
            )

            if criado:
                cont_criados += 1
            else:
                cont_atualizados += 1

        self.stdout.write(self.style.SUCCESS(f'ETL concluído com sucesso! Criados: {cont_criados} | Atualizados: {cont_atualizados}'))
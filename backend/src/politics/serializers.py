from rest_framework import serializers
from .models import Poder, Instituicao, AgentePolitico

class AgentePoliticoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AgentePolitico
        fields = ['id', 'nome_completo', 'nome_eleitoral', 'cargo', 'partido', 'foto_url', 'data_inicio_mandato']

class InstituicaoSerializer(serializers.ModelSerializer):
    # Aninha os agentes políticos diretamente dentro da instituição correspondente
    agentes = AgentePoliticoSerializer(many=True, read_only=True)

    class Meta:
        model = Instituicao
        fields = ['id', 'nome', 'sigla', 'descricao_pedagogica', 'site_oficial', 'agentes']

class ArvorePoderesSerializer(serializers.ModelSerializer):
    # Aninha as instituições diretamente dentro do poder correspondente
    instituicoes = InstituicaoSerializer(many=True, read_only=True)

    class Meta:
        model = Poder
        fields = ['id', 'nome', 'descricao_pedagogica', 'instituicoes']
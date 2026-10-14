from rest_framework import viewsets
from django.db.models import Prefetch
from .models import Poder, Instituicao, AgentePolitico
from .serializers import ArvorePoderesSerializer, InstituicaoSerializer, AgentePoliticoSerializer

class ArvorePoderesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que expõe a árvore completa dos poderes políticos do Brasil.
    Sendo ReadOnly, impede que usuários externos alterem os dados institucionais via API.
    """
    # Buscamos as instituições já trazendo os agentes de dentro delas de forma otimizada
    instituicoes_com_agentes = Instituicao.objects.prefetch_related('agentes')
    
    # Injetamos essa consulta aninhada dentro da busca principal de Poderes
    queryset = Poder.objects.prefetch_related(
        Prefetch('instituicoes', queryset=instituicoes_com_agentes)
    ).all()
    
    serializer_class = ArvorePoderesSerializer

class InstituicaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer

class AgentePoliticoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AgentePolitico.objects.all()
    serializer_class = AgentePoliticoSerializer
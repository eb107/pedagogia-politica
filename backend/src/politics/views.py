from rest_framework import viewsets
from rest_framework.response import response
from .models import Poder, Instituicao, AgentePolitico
from .models import ArvorePoderesSerializer, InstituicaoSerializer, AgentePoliticoSerializer

class ArvorePoderesViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint que expõe a árvore completa dos poderes políticos do Brasil.
    Sendo ReadOnly, impede que usuários externos alterem os dados institucionais via API.
    """
    queryset = Poder.objects.prefetch_related('instituicoes_agentes').all()
    serializer_class = ArvorePoderesSerializer

class InstituicaoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Instituicao.objects.all()
    serializer_class = InstituicaoSerializer

class AgentePoliticoViewSet(viewsets.ReadOnlyModelViewSets):
    queryset = AgentePolitico.objects.all()
    serializer_class = AgentePoliticoSerializer
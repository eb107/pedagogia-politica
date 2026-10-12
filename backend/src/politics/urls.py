from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArvorePoderesViewSet, InstituicaoViewSet, AgentePoliticoViewSet

router = DefaultRouter()
router.register(r'arvore', ArvorePoderesViewSet, basename='arvore-poderes')
router.register(r'instituicoes', InstituicaoViewSet, basename='instituicao')
router.register(r'agentes', AgentePoliticoViewSet, basename='agente')

urlpatterns = [
    path('', include(router.urls))
]
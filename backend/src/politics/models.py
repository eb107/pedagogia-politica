from django.db import models

# Create your models here.
class Poder(models.Model):
    """Representa Executivo, Legislativo e Judiciário"""
    NOME_CHOICES = [
        ('EXECUTIVO', 'Executivo'),
        ('LEGISLATIVO', 'Legislativo'),
        ('JUDICIARIO', 'Judiciário'),
    ]
    nome = models.CharField(max_length=20, choices=NOME_CHOICES, unique=True)
    descricao_pedagogica = models.TextField(help_text="Explicação simples sobre o papel constitucional deste poder")

    def __str__(self):
        return self.get_nome_display()

class Instituicao(models.Model):
    """Representa instituições como STF, Senado, Presidência da República, etc."""
    poder = models.ForeignKey(Poder, on_delete=models.CASCADE, related_name='instituicoes')
    nome = models.CharField(max_length=100, unique=True)
    sigla = models.CharField(max_length=10)
    descricao_pedagogica = models.TextField(help_text="O que este orgão faz na prática")
    site_oficial = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.sigla} - {self.nome}"

class AgentePolitico(models.Model):
    """Representa os ocupantes dos cargos: Presidente, Ministros, Senadores, Deputados"""
    instituicao = models.ForeignKey(Instituicao, on_delete=models.CASCADE, related_name='agentes')
    nome_completo = models.CharField(max_length=150)
    nome_eleitoral = models.CharField(max_length=100, blank=True, null=True)
    cargo = models.CharField(max_length=100)
    partido = models.CharField(max_length=20, blank=True, null=True)
    foto_url = models.URLField(blank=True, null=True)
    data_inicio_mandato = models.DateField(blank=True, null=True)
    atualizado_em = models.DateField(auto_now=True)

    def __str__(self):
        return f"{self.nome_completo} ({self.cargo})"
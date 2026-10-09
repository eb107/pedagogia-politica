FROM python:3.11-slim

# Instala o uv diretamente do repositório oficial
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copia os arquivos de configuração de pacotes primeiro (otimização de cache do Docker)
COPY pyproject.toml uv.lock ./

# Instala as dependências do projeto no ambiente global do container de forma rápida
RUN uv pip install --system -r pyproject.toml

# Copia o restante do código
COPY . .

EXPOSE 8000

CMD ["python", "src/manage.py", "runserver", "0.0.0.0:8000"]

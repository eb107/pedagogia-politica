FROM node:22-alpine

WORKDIR /app

# Copia apenas o manifesto para aproveitar o cache de camadas do Docker
COPY package.json ./

# Instala as dependências baixando os binários nativos corretos para Linux
RUN npm install --supportedCpu=x64 --supportedOS=linux

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
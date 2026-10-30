FROM node:22-alpine

WORKDIR /app

# Copia apenas o manifesto para aproveitar o cache de camadas do Docker
COPY package.json ./

# Força o npm a aceitar os peer dependencies do React 19 com o Framer Motion
RUN npm install --supportedCpu=x64 --supportedOS=linux --legacy-peer-deps

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
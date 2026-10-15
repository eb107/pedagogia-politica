FROM node:20-alpine

WORKDIR /app

# Copia os arquivos de definição de dependências
COPY package.json package-lock.json* ./

RUN npm install

COPY . .

EXPOSE 5173

# Roda o servidor de desenvolvimento do Vite liberando o host para conexôes externas
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
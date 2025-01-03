# Escolher uma imagem base (Node.js 14)
FROM node:14

# Definir diretório de trabalho no container
WORKDIR /app

# Copiar o package.json e o package-lock.json para o container
COPY package*.json ./

# Instalar as dependências do projeto
RUN npm install

# Copiar o restante do código da aplicação
COPY . .

# Expor a porta onde o app vai rodar (porta padrão do NestJS)
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]

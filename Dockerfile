# Estágio 1: Build da aplicação React
# Usamos a imagem oficial do Bun, que é otimizada e já inclui o 'bun'.
FROM oven/bun:1-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de manifesto de pacotes
COPY package.json ./
COPY bun.lockb ./

# Instala as dependências usando o bun.
# A flag --frozen-lockfile foi removida para permitir que o bun
# instale as dependências do package.json mesmo que o lockfile esteja desatualizado.
RUN bun install

# Copia todo o código-fonte da aplicação
COPY . .

# Executa o build de produção, gerando a pasta 'dist'
RUN bun run build

# Estágio 2: Servidor de produção com Nginx
# Usamos uma imagem Nginx leve para servir os arquivos estáticos.
FROM nginx:stable-alpine

# Copia a configuração customizada do Nginx para dentro do container.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos da pasta 'dist' (gerada no estágio de build)
# para o diretório padrão do Nginx.
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx.
EXPOSE 80

# O comando padrão da imagem Nginx ('nginx -g "daemon off;"') será executado
# para iniciar o servidor quando o container for iniciado.
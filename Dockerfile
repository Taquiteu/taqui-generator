# Etapa 1: Construção
FROM oven/bun:latest as builder

WORKDIR /app

# Copia todos os arquivos para o contêiner
COPY . .

# Instala as dependências e constrói o projeto para produção
RUN bun install && bun run build

# Etapa 2: Contêiner final para produção
FROM oven/bun:latest

RUN apt-get update && apt-get install -y \
    git \
    libvips-dev \
    libfontconfig1

WORKDIR /app

# Copia os arquivos necessários do builder para o contêiner final
COPY --from=builder /app /app

# Expor a porta usada pelo servidor Remix
EXPOSE 3000

# Comando para iniciar o servidor Remix
CMD ["bun", "run", "start"]

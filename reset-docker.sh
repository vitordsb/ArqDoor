#!/bin/bash

# Script para resetar o Docker do Frontend Local
# Uso: bash reset-docker.sh

echo "🔄 Resetando Docker do Frontend Local..."

# 1. Parar todos os containers relacionados
echo "📦 Parando containers..."
docker stop $(docker ps -a -q --filter ancestor=arqdoor-frontend) 2>/dev/null || echo "Nenhum container rodando"

# 2. Remover containers antigos
echo "🗑️  Removendo containers antigos..."
docker rm $(docker ps -a -q --filter ancestor=arqdoor-frontend) 2>/dev/null || echo "Nenhum container para remover"

# 3. Remover imagem antiga
echo "🗑️  Removendo imagem antiga..."
docker rmi arqdoor-frontend 2>/dev/null || echo "Nenhuma imagem para remover"

# 4. Limpar cache do Docker
echo "🧹 Limpando cache..."
docker builder prune -f

# 5. Rebuild da imagem (development)
echo "🔨 Reconstruindo imagem de desenvolvimento..."
docker build --target development -t arqdoor-frontend .

# 6. Iniciar container
echo "🚀 Iniciando container..."
docker run -d \
  --name arqdoor-frontend-dev \
  -p 5173:5173 \
  -v $(pwd)/src:/app/src \
  -v $(pwd)/public:/app/public \
  --env-file .env \
  arqdoor-frontend

echo ""
echo "✅ Docker resetado com sucesso!"
echo "📱 Frontend rodando em: http://localhost:5173"
echo ""
echo "Para ver os logs: docker logs -f arqdoor-frontend-dev"
echo "Para parar: docker stop arqdoor-frontend-dev"

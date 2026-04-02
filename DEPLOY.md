# Deploy do Frontend na VPS

O frontend e o backend do ArqDoor rodam separados na VPS.

- Frontend: `/var/www/arqdoor`
- Backend: `/var/www/arqdoor-backend`

O `nginx` serve o frontend como arquivos estaticos, enquanto o backend roda em um container Docker proprio. Por isso, publicar arquivos do frontend nao altera o backend, e alterar o codigo-fonte do backend na VPS nao garante que a API em execucao mudou.

## Estrutura atual

### Frontend
- Build local: `npm run build`
- Publicacao: `/var/www/arqdoor/.releases/<release>`
- Diretorio ao vivo: `/var/www/arqdoor`
- Servico: `nginx`

### Backend
- Codigo publicado em releases proprias dentro de `/var/www/arqdoor-backend/releases/<release>`
- Runtime real vindo de imagem Docker
- Container principal: `arqdoor-backend-prod`

## Fluxo recomendado

O deploy recomendado do frontend continua sendo pela VPS via GitHub Actions.

Workflow:
- `.github/workflows/deploy-vps.yml`

Segredos necessarios no GitHub:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_FRONTEND_PATH` opcional, padrao `/var/www/arqdoor`
- `VITE_GOOGLE_CLIENT_ID` se o build precisar dessa variavel

## O que esse deploy faz

1. Executa `npm ci`
2. Executa `npm run build`
3. Empacota o conteudo de `dist/`
4. Envia para a VPS
5. Publica a release do frontend
6. Atualiza os arquivos servidos pelo `nginx`

## Limites importantes

- Esse processo atualiza apenas o frontend.
- Alteracoes de API, contratos, pagamentos ou regras de negocio do backend exigem deploy separado do projeto `arqdoor-backend`.
- O backend nao deve ser tratado como "codigo solto em `/var/www/arqdoor-backend`", porque a API em producao roda a partir da imagem Docker publicada.

## Deploy manual

Se precisar publicar o frontend manualmente na VPS, use as instrucoes em [DEPLOY_MANUAL.md](/home/vitordsb/Desktop/Startup/services/ArqDoorApp/ArqDoor/DEPLOY_MANUAL.md).

## Legado

Os trechos antigos de Hostinger/FTP nao sao mais o caminho principal do projeto. Se algum workflow antigo ainda existir, trate como legado e nao como fluxo oficial.

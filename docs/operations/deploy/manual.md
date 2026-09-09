# Deploy Manual do Frontend na VPS

Este guia serve para publicar apenas o frontend do ArqDoor na VPS atual.

## Quando usar

- Quando voce quiser publicar o frontend sem esperar pipeline
- Quando precisar validar rapidamente um build em producao
- Quando a alteracao for apenas no projeto `ArqDoor`

Se houver mudancas no backend, faca o deploy separado no projeto `arqdoor-backend`.

## Estrutura atual da VPS

- Frontend vivo: `/var/www/arqdoor`
- Releases do frontend: `/var/www/arqdoor/.releases`
- Upload temporario: `/var/www/arqdoor/.deploy`
- Backend separado: `/var/www/arqdoor-backend`

## Passo a passo

### 1. Gerar o build

```bash
cd ArqDoor
npm ci
npm run build
```

Confirme que a pasta `dist/` foi gerada.

### 2. Criar um identificador de release

```bash
export RELEASE_ID="$(date -u +%Y%m%d-%H%M%S)"
```

### 3. Empacotar o frontend

```bash
tar -czf "frontend-deploy-${RELEASE_ID}.tar.gz" -C dist .
```

### 4. Enviar para a VPS

```bash
scp "frontend-deploy-${RELEASE_ID}.tar.gz" root@SEU_HOST:/var/www/arqdoor/.deploy/
```

### 5. Publicar a release na VPS

```bash
ssh root@SEU_HOST
export RELEASE_ID=20260330-120000

mkdir -p /var/www/arqdoor/.releases/"$RELEASE_ID"
tar -xzf /var/www/arqdoor/.deploy/frontend-deploy-"$RELEASE_ID".tar.gz -C /var/www/arqdoor/.releases/"$RELEASE_ID"
rm -f /var/www/arqdoor/.deploy/frontend-deploy-"$RELEASE_ID".tar.gz
test -f /var/www/arqdoor/.releases/"$RELEASE_ID"/index.html

cd /var/www/arqdoor
find . -mindepth 1 -maxdepth 1 ! -name '.releases' ! -name '.deploy' ! -name '.well-known' -exec rm -rf {} +
cp -a /var/www/arqdoor/.releases/"$RELEASE_ID"/. /var/www/arqdoor/
ln -sfn /var/www/arqdoor/.releases/"$RELEASE_ID" /var/www/arqdoor/.current-release
chmod -R a+rX /var/www/arqdoor
```

## Verificacao

Depois da publicacao:

```bash
curl -I https://arqdoor.com
```

Se quiser confirmar os arquivos da release:

```bash
ls -lah /var/www/arqdoor/.releases
readlink -f /var/www/arqdoor/.current-release
```

## Limpeza de releases antigas

Mantenha algumas releases recentes para rollback rapido:

```bash
cd /var/www/arqdoor/.releases
ls -1dt */ | tail -n +6 | xargs -r rm -rf
```

## Observacoes importantes

- Preserve `.well-known` se o dominio usar verificacoes ou certificados.
- Esse processo nao reinicia `nginx`; como o frontend e estatico, basta atualizar os arquivos.
- Esse processo nao atualiza o backend.
- Se a mudanca depender de nova API, publique tambem o projeto `arqdoor-backend`.

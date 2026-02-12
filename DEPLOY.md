# 🚀 Deploy (VPS / Web Hosting)

Hoje o `arqdoor.com` está servido pela **VPS** (nginx servindo arquivos estáticos do build). Este arquivo também mantém o caminho antigo (Web Hosting via FTP), se você ainda quiser usar.

## ✅ Opção A (Recomendado): Deploy para VPS (GitHub Actions)

Workflow: `.github/workflows/deploy-vps.yml`

### Secrets necessários no GitHub

Em **Settings → Secrets and variables → Actions**, crie:

- `VPS_HOST` (ex.: `89.116.225.129`)
- `VPS_USER` (ex.: `root`)
- `VPS_SSH_KEY` (chave privada SSH, ex.: conteúdo do `~/.ssh/id_ed25519`)
- `VPS_FRONTEND_PATH` (opcional; padrão: `/var/www/arqdoor`)
- `VITE_GOOGLE_CLIENT_ID` (obrigatório se quiser login com Google no frontend)

### Como deploya

1. Push na branch `master` (ou `main`)
2. O Actions faz `npm ci`, `npm run build`, empacota o `dist/` e envia para a VPS
3. Extrai em `VPS_FRONTEND_PATH` (ou `/var/www/arqdoor`)

## 🅱️ Opção B: Deploy para Web Hosting (FTP)

### Como funciona

1. Você faz `git push` na branch `master` (ou `main`)
2. GitHub Actions detecta o push
3. Instala as dependências do projeto
4. Faz o build (`npm run build`)
5. Envia os arquivos da pasta `dist/` para a Hostinger via FTP
6. Seu site é atualizado automaticamente! 🎉

### 🔐 Configuração Inicial (IMPORTANTE!)

### Passo 1: Adicionar a senha FTP nos Secrets do GitHub

Para que o deploy funcione, você precisa adicionar a senha FTP como um secret no GitHub:

1. Acesse seu repositório no GitHub
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Preencha:
   - **Name**: `FTP_PASSWORD`
   - **Secret**: (sua senha FTP)
6. Clique em **Add secret**

### Passo 2: Fazer o primeiro push

Depois de configurar o secret, faça:

```bash
git add .
git commit -m "feat: adiciona deploy automático"
git push origin master
```

### Passo 3: Acompanhar o deploy

1. Vá até a aba **Actions** no seu repositório do GitHub
2. Você verá o workflow "Deploy to Hostinger" rodando
3. Clique nele para ver o progresso em tempo real
4. Quando aparecer ✅ verde, seu site foi atualizado!

### 📋 Informações da Configuração

- **Servidor FTP**: `ftp.arqdoor.com`
- **Usuário FTP**: `vitinho`
- **Pasta destino**: `/public_html/`
- **Pasta local**: `./dist/` (gerada pelo build)
- **Branch de deploy**: `master` (ou `main`)

### 🔧 Personalizações

### Mudar a branch de deploy

Edite o arquivo `.github/workflows/deploy.yml` e altere:

```yaml
on:
  push:
    branches:
      - master  # Mude para a branch desejada
```

### Mudar a pasta de destino

Altere o `server-dir` no arquivo de workflow:

```yaml
server-dir: /public_html/sua-pasta/
```

### 🐛 Troubleshooting

### Deploy falhou?

1. Verifique se o secret `FTP_PASSWORD` foi configurado corretamente
2. Confirme que o usuário FTP `vitinho` tem permissões de escrita
3. Verifique os logs na aba **Actions** do GitHub

### Arquivos não aparecem no site?

- Confirme que a pasta destino está correta (`/public_html/`)
- Verifique se o build gerou os arquivos em `./dist/`

### 📝 Notas de Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite a senha FTP no código
- Use sempre GitHub Secrets para credenciais
- A senha está segura e criptografada no GitHub

### 🎯 Próximos Passos

Agora toda vez que você fizer push na branch `master` (ou `main`), seu site será atualizado automaticamente! 

Não precisa mais fazer upload manual via FTP! 🎊

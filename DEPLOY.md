# 🚀 Deploy Automático - GitHub para Hostinger

Este projeto está configurado para fazer deploy automático na Hostinger sempre que você fizer push na branch `main`.

## ⚙️ Como funciona

1. Você faz `git push` na branch `main`
2. GitHub Actions detecta o push
3. Instala as dependências do projeto
4. Faz o build (`npm run build`)
5. Envia os arquivos da pasta `dist/` para a Hostinger via FTP
6. Seu site é atualizado automaticamente! 🎉

## 🔐 Configuração Inicial (IMPORTANTE!)

### Passo 1: Adicionar a senha FTP nos Secrets do GitHub

Para que o deploy funcione, você precisa adicionar a senha FTP como um secret no GitHub:

1. Acesse seu repositório no GitHub
2. Vá em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**
4. Clique em **New repository secret**
5. Preencha:
   - **Name**: `FTP_PASSWORD`
   - **Secret**: `988685156@Qaz`
6. Clique em **Add secret**

### Passo 2: Fazer o primeiro push

Depois de configurar o secret, faça:

```bash
git add .
git commit -m "feat: adiciona deploy automático"
git push origin main
```

### Passo 3: Acompanhar o deploy

1. Vá até a aba **Actions** no seu repositório do GitHub
2. Você verá o workflow "Deploy to Hostinger" rodando
3. Clique nele para ver o progresso em tempo real
4. Quando aparecer ✅ verde, seu site foi atualizado!

## 📋 Informações da Configuração

- **Servidor FTP**: `ftp.arqdoor.com`
- **Usuário FTP**: `vitinho`
- **Pasta destino**: `/public_html/`
- **Pasta local**: `./dist/` (gerada pelo build)
- **Branch de deploy**: `main`

## 🔧 Personalizações

### Mudar a branch de deploy

Edite o arquivo `.github/workflows/deploy.yml` e altere:

```yaml
on:
  push:
    branches:
      - main  # Mude para a branch desejada
```

### Mudar a pasta de destino

Altere o `server-dir` no arquivo de workflow:

```yaml
server-dir: /public_html/sua-pasta/
```

## 🐛 Troubleshooting

### Deploy falhou?

1. Verifique se o secret `FTP_PASSWORD` foi configurado corretamente
2. Confirme que o usuário FTP `vitinho` tem permissões de escrita
3. Verifique os logs na aba **Actions** do GitHub

### Arquivos não aparecem no site?

- Confirme que a pasta destino está correta (`/public_html/`)
- Verifique se o build gerou os arquivos em `./dist/`

## 📝 Notas de Segurança

⚠️ **IMPORTANTE**: 
- Nunca commite a senha FTP no código
- Use sempre GitHub Secrets para credenciais
- A senha está segura e criptografada no GitHub

## 🎯 Próximos Passos

Agora toda vez que você fizer push na branch `main`, seu site será atualizado automaticamente! 

Não precisa mais fazer upload manual via FTP! 🎊

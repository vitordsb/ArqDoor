# 🚀 Deploy Manual para Hostinger

Infelizmente, a Hostinger bloqueia conexões FTP/SFTP vindas do GitHub Actions por questões de segurança.

## Solução: Deploy Local Automatizado

### Pré-requisitos

Instale o `lftp` (cliente FTP avançado):

```bash
# Ubuntu/Debian
sudo apt-get install lftp

# Arch Linux
sudo pacman -S lftp

# macOS
brew install lftp
```

### Como fazer deploy

Sempre que quiser atualizar o site:

```bash
./deploy.sh
```

Isso vai:
1. ✅ Fazer o build do projeto
2. ✅ Enviar automaticamente para a Hostinger via FTP
3. ✅ Remover arquivos antigos
4. ✅ Atualizar o site

## Alternativas para Deploy Automático

Se você quiser deploy 100% automático, considere migrar para:

- **Vercel** (recomendado para React/Vite) - Deploy automático grátis
- **Netlify** - Deploy automático grátis
- **GitHub Pages** - Deploy automático grátis
- **Cloudflare Pages** - Deploy automático grátis

Todas essas plataformas têm integração nativa com GitHub e fazem deploy automático a cada push!

## Manter o workflow do GitHub

O workflow ainda está configurado, caso a Hostinger libere as portas no futuro ou você migre para VPS.

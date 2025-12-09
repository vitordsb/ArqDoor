# Avaliação de Segurança - ArqDoor (front-end)

## Contexto
Aplicação React/Vite que consome APIs em `https://api.arqdoor.com`. Autenticação feita com JWT guardado no `sessionStorage`; existe painel administrativo com autenticação Basic feita no cliente.

## Principais riscos identificados

### 1) Armazenamento e manuseio de tokens JWT
- O token JWT e o timestamp de expiração são salvos em `sessionStorage`, o que permite acesso direto via console, extensões ou XSS, além de não oferecer isolamento entre abas/sessões.
- O token é considerado válido apenas comparando um timestamp local e decodificando o payload via `parseJwt`, sem qualquer verificação de assinatura ou revogação, abrindo espaço para tokens forjados/expirados serem aceitos se `tokenExpiry` for manipulado no storage.
- `login` expõe objetos de resposta no console (`console.log`) com potencial de registrar credenciais/tokens em logs de navegador compartilhados.

**Recomendações**
- Armazenar tokens em cookies `HttpOnly`, `Secure`, `SameSite=Lax/Strict` emitidos pelo backend. Isso mitiga XSS e impede leitura direta pelo front-end.
- Validar expiração e assinatura do JWT no backend a cada requisição; não confiar em timestamps/client-side para decidir se o usuário está autenticado.
- Remover logs de resposta que possam conter tokens/credenciais e acrescentar tratamento de erro padronizado.
- Implementar renovação de sessão (refresh tokens de curta duração + rotação) e logout servidor-side para revogar sessões comprometidas.

### 2) Painel administrativo autenticado apenas no cliente
- O login do administrador gera um header Basic (`btoa(email:senha)`) e o mantém em memória; qualquer pessoa com acesso ao código pode forjar o header e chamar diretamente as rotas `/admin/**`, sem verificação de origem.
- Operações críticas (exclusão de contratos, envio de mensagens em nome da equipe) dependem de prompts e do header Basic criado no cliente, sem MFA, rate limit ou proteção CSRF.
- Não há isolamento de permissões: qualquer usuário que descubra a tela `/admin` pode tentar credenciais e, se obtiver sucesso, ganha acesso a dados sensíveis e comandos privilegiados diretamente pelo front-end.

**Recomendações**
- Migrar autenticação administrativa para fluxo separado no backend: login que retorna sessão/HJWT com `role=admin`, guardada em cookie `HttpOnly` + políticas de expiração curta e rotação.
- Exigir MFA e rate limiting para endpoints administrativos; validar origem (CORS estrito) e habilitar proteção CSRF quando usar cookies.
- Implementar checagem de permissão no backend e bloquear o bundle de expor rotas administrativas para usuários comuns (feature flag + proteção server-side).
- Evitar `prompt` para ações destrutivas; use confirmações in-app com reautenticação curta (revalidar token ou pedir senha usando canal seguro).

### 3) Transporte e headers
- `apiRequest` reutiliza o token em qualquer requisição sem verificar se o `path` é absoluto ou relativo, permitindo que valores externos de `path` (se algum ponto passar um URL completo) causem vazamento de credenciais para domínios não confiáveis.
- Upload/download de PDF reusa o token lido do storage para chamadas diretas ao `API_BASE_URL` e a URLs fornecidas pela API, sem sanitização ou validação de origem.

**Recomendações**
- Garantir que `apiRequest` só aceite caminhos relativos ao host esperado; validar/sanitizar URLs antes de fetch para evitar SSRF/leak de bearer tokens.
- Para downloads, preferir endpoints autenticados que façam proxy do arquivo em vez de confiar em URLs retornadas pelo backend.

### 4) Proteções de interface e UX
- Ausência de política de tempo de inatividade/idle logout: `tokenExpiry` é fixo (10h) e não zera ao fechar o navegador.
- Falta de feedback claro para erros de autenticação (por exemplo, estados de bloqueio após múltiplas tentativas).

**Recomendações**
- Implementar controle de inatividade, bloqueio após tentativas falhas e mensagens de erro genéricas para reduzir enumeração de credenciais.
- Padronizar fluxos de erro e loading para evitar exposição de estados internos ou dados parciais em falhas de rede.

## Prioridades sugeridas
1. **Migrar armazenamento e validação de tokens para cookies HttpOnly com verificação server-side** (proteção imediata contra XSS/token forging).
2. **Reforçar o painel administrativo**: autenticação robusta (MFA), autorização server-side e remoção do Basic Auth no cliente.
3. **Restringir destinos de requisições** no helper `apiRequest` e no fluxo de downloads/upload de PDFs.
4. **Higienizar logs e mensagens** para evitar vazamento de credenciais e dados sensíveis.

## Próximos passos rápidos
- Engajar o backend para ajustar o modelo de sessão e expor rotas com proteção adequada (roles + cookies).
- Adicionar middleware front-end para validar contexto de rota administrativa e esconder entradas até que o backend libere um `role` seguro.
- Criar testes de segurança automatizados (lint de dependências, varredura de XSS no bundle, testes de CORS/CSRF) e pipeline de CI.

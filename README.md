# ArqDoor frontend – visão geral

Guia curto dos principais blocos do projeto, onde ficam e para que servem. Ajuste as rotas conforme o backend em uso.

## Estrutura de pastas (essencial)
- `src/main.tsx` — ponto de entrada; injeta `QueryClientProvider`, `AuthProvider`, `GoogleOAuthProvider`.
- `src/hooks` — lógica compartilhada (auth, messaging, assinatura, etc.). Destaque para `use-auth.tsx`.
- `src/components` — UI reutilizável e modais (AuthModals, PortfolioModal, propostas, assinatura).
- `src/pages` — telas principais (auth-page, Messages, perfil, etc.).
- `src/lib` — utilitários, cliente HTTP (`queryClient.ts`), tipos (`Interfaces.ts`).
- `public/` — assets estáticos.

## Autenticação
- Modais: `src/components/modals/AuthModals.tsx` (login/registro).
- Email/senha: `use-auth.tsx` chama `/auth/login` e `/users`.
- Google: `loginWithGoogleRequest` envia `mode` (`login`/`register`) para `/auth/google`. Se já existir conta, mostra aviso e abre modal de login; se criar, pede login.
- Sessão: JWT em `sessionStorage` (`token`, `tokenExpiry`), decodificado com `parseJwt`.

## Cliente HTTP e dados
- `src/lib/queryClient.ts`: `apiRequest` compõe URL com `VITE_API_BASE_URL`, injeta Authorization, envia JSON ou FormData. Base para `@tanstack/react-query`.
- Cache e revalidação configurados em `queryClient` (retry desativado por padrão).

## Registro e perfil
- Fluxo de cadastro no modal: valida campos obrigatórios (nome, email, gênero, nascimento, senha, termos) e `type` (contratante/prestador). Prestador é criado no backend junto ao `ServiceProvider`.
- Perfil e avaliações: componentes em `src/features/profile` e modais de portfólio em `src/components/modals/PortfolioModal.tsx`.

## Portfólio
- Criar/editar/exibir portfólios e engajamento (likes/comentários) via `PortfolioModal` e seções de perfil.
- Requer usuário autenticado; chamadas via `apiRequest` para as rotas de portfólio do backend.

## Mensagens, tickets e etapas
- Hooks em `src/hooks/use-messaging.tsx`; telas em `src/pages/Messages.tsx`.
- Modais para propostas/contratos/assinatura: `NewProposalDialog`, `ProposalDetailsDialog`, `SignatureDialog`.
- Rotas alinhadas ao backend (`/conversation`, `/message`, `/ticket`, `/step`, etc.).

## Uploads
- Envio com `FormData` usando `apiRequest`; arquivos acessíveis via `/uploads` no backend.

## Variáveis de ambiente (frontend)
- `VITE_GOOGLE_CLIENT_ID` — client_id do OAuth Google.
- `VITE_API_BASE_URL` — base da API (ex.: `http://localhost:8080` em dev, `https://api.arqdoor.com` em prod).

## Como rodar em dev
1) Crie `ArqDoor/.env` com as variáveis acima.
2) `npm install` e `npm run dev`.
3) Mantenha o backend ativo na URL configurada em `VITE_API_BASE_URL`.

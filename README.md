# ArqDoor frontend - visão rápida

Guia curto dos fluxos principais no front e onde encontrar o código. Ajuste conforme o backend que você está rodando; use as rotas reais do seu servidor (ex.: `/auth`, `/users`, `/portfolio`, etc.).

## Autenticação
- Modais: `src/components/modals/AuthModals.tsx` (login e registro).
- Email/senha: `use-auth.tsx` chama `apiRequest` para `/auth/login` e `/users` (cadastro).
- Google: botões nos modais chamam `loginWithGoogleRequest` com `mode` (`login` ou `register`). Se já existir conta, retorna aviso e troca para o modal de login; se criar, pede para logar.
- Persistência: JWT no `sessionStorage` (`token`, `tokenExpiry`), decodificado com `parseJwt`.
- Providers: `src/main.tsx` envolve a árvore com `AuthProvider` e `GoogleOAuthProvider` (usa `VITE_GOOGLE_CLIENT_ID`).

## Cliente HTTP
- `src/lib/queryClient.ts`: `apiRequest` usa `VITE_API_BASE_URL` (padrão `http://localhost:8080`), injeta Authorization do `sessionStorage` e envia JSON ou FormData. Base do `@tanstack/react-query`.

## Registro e perfil
- Registro trata `type` (contratante/prestador) e `termos_aceitos`. Campos validados no front antes de enviar.
- Ao registrar prestador, o backend cria o `ServiceProvider` (já tratado no serviço de criação).

## Portfólio
- Componentes/modais em `src/components/modals/PortfolioModal.tsx` e `src/features/profile`. Curtir/comentar/publicar exigem usuário autenticado. Chamadas via `apiRequest` para as rotas de portfólio do backend.

## Mensagens, tickets e etapas
- Hooks e telas em `src/hooks/use-messaging.tsx` e `src/pages/Messages.tsx`. Inclui propostas/contratos e assinatura de PDF via modais `NewProposalDialog`, `ProposalDetailsDialog`, `SignatureDialog`. Alinhe os endpoints com seu backend (`/conversation`, `/message`, `/ticket`, `/step`, etc.).

## Uploads
- Envio com `FormData` usando `apiRequest`; arquivos estáticos servidos pelo backend em `/uploads`.

## Variáveis de ambiente (frontend)
- `VITE_GOOGLE_CLIENT_ID` — client_id do OAuth Google.
- `VITE_API_BASE_URL` — base da API (ex.: `http://localhost:8080` em dev, `https://api.arqdoor.com` em prod).

## Rodando em dev
1) Crie `ArqDoor/.env` com as variáveis acima.
2) `npm install` e `npm run dev`.
3) Backend deve estar rodando na `VITE_API_BASE_URL` configurada.

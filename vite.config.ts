import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Para apontar pro backend da VPS (api.arqdoor.com) rodando localmente, o
// frontend precisa estar em HTTPS — caso contrário browsers modernos bloqueiam
// os cookies de autenticação cross-site (Secure + SameSite=None).
// Ativar via env: VITE_DEV_HTTPS=true npm run dev
// Browser vai mostrar warning de cert auto-assinado na primeira vez (aceitar
// uma vez e tudo funciona depois).
const useHttps = process.env.VITE_DEV_HTTPS === "true";

export default defineConfig({
  plugins: [
    react(),
    themePlugin(),
    // basic-ssl gera cert auto-assinado quando rodar com VITE_DEV_HTTPS=true
    ...(useHttps ? [basicSsl()] : []),
  ],
  server: {
    port: 5173,
    host: "localhost",
    // Proxy /api/* → https://api.arqdoor.com/*
    // Permite que o frontend local apareça como "mesma origem" do backend,
    // contornando bloqueio de cookies cross-site do Chrome 120+. Sem o proxy
    // o login até completa, mas o cookie de sessão não é aceito.
    // Usado quando VITE_API_URL="/api" no .env.local.
    proxy: {
      "/api": {
        target: "https://api.arqdoor.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Cookies do backend vêm com domain=api.arqdoor.com (implícito) ou
        // sem domain. Em ambos os casos rewriteamos pra localhost pra o
        // browser aceitar como first-party.
        cookieDomainRewrite: {
          "*": "localhost",
          "api.arqdoor.com": "localhost",
          "": "localhost",
        },
        // Logs verbosos pra debugar Set-Cookie e status em dev.
        // Aparecem no terminal do `npm run dev`.
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            console.log(`[vite-proxy] → ${req.method} ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            const setCookie = proxyRes.headers["set-cookie"];
            const cookiePreview = Array.isArray(setCookie)
              ? setCookie.map((c) => c.split(";")[0]).join(", ")
              : "(nenhum)";
            console.log(
              `[vite-proxy] ← ${proxyRes.statusCode} ${req.method} ${req.url}` +
                ` | Set-Cookie: ${cookiePreview}`
            );
          });
          proxy.on("error", (err, req) => {
            console.error(`[vite-proxy] ERRO ${req.method} ${req.url}:`, err.message);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  root: path.resolve(__dirname, "."),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    minify: "esbuild",
    // Code splitting: isola libs pesadas em chunks próprios. Só são baixadas
    // quando a rota que as usa é acessada, em vez de virem no bundle inicial.
    // Reduz JS inicial em ~40-50% nas rotas que não usam essas libs (landing, auth).
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-pdf": ["pdfjs-dist", "react-pdf", "pdf-lib"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-sentry": ["@sentry/react"],
        },
      },
    },
  },
  esbuild: {
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
    pure: process.env.NODE_ENV === "production"
      ? ["console.log", "console.debug", "console.info"]
      : [],
  },
});

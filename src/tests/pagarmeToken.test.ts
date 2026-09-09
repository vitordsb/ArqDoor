/**
 * O que estes testes protegem.
 *
 * O site cobrava cartao SEM token ate 2026-09-09, e cartao sem token cai no checkout
 * hospedado, que aceita o campo de divisao e o ignora em silencio: o cliente pagava, a
 * tela confirmava, e o profissional recebia zero. A tokenizacao e o que fecha esse
 * buraco, entao ela precisa de rede de protecao propria.
 *
 * O caso mais caro nao e o cartao invalido. E a chave errada: com uma `sk_` aqui, o
 * segredo que autoriza mover dinheiro iria embutido no bundle publico.
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import {
  numeroCartaoValido,
  parseValidade,
  mascaraNumero,
  mascaraValidade,
  soDigitos,
  tokenizarCartao,
} from "@/lib/pagarme";

const comChave = (valor: string | undefined) => {
  vi.stubEnv("VITE_PAGARME_PUBLIC_KEY", valor as string);
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("validacao local, antes de gastar uma ida a rede", () => {
  it("aceita numero valido e recusa digito trocado", () => {
    expect(numeroCartaoValido("4000 0000 0000 0010")).toBe(true);
    expect(numeroCartaoValido("4000 0000 0000 0011")).toBe(false);
  });

  it("recusa cartao vencido, que seria recusa certa na operadora", () => {
    expect(parseValidade("01/20")).toBeNull();
    const daquiUns10Anos = String(new Date().getFullYear() + 10).slice(-2);
    expect(parseValidade(`12/${daquiUns10Anos}`)).toEqual({
      mes: 12,
      ano: 2000 + Number(daquiUns10Anos),
    });
  });

  it("aceita MM/AA e MM/AAAA, porque o cliente digita dos dois jeitos", () => {
    const ano = new Date().getFullYear() + 5;
    const curto = parseValidade(`06/${String(ano).slice(-2)}`);
    const longo = parseValidade(`06/${ano}`);
    expect(curto).toEqual(longo);
  });

  it("mascara agrupa de 4 em 4 e a validade ganha a barra sozinha", () => {
    expect(mascaraNumero("4000000000000010")).toBe("4000 0000 0000 0010");
    expect(mascaraValidade("1230")).toBe("12/30");
    expect(soDigitos("12/30")).toBe("1230");
  });
});

describe("a chave que vai para o navegador", () => {
  it("recusa tokenizar com chave SECRETA, mesmo que alguem a coloque na env", async () => {
    // Este e o teste caro. Uma sk_ aqui vaza no bundle publico: qualquer visitante
    // poderia mover dinheiro da conta. Melhor o cartao ficar indisponivel.
    comChave("sk_esta_e_secreta_nao_pode_vazar");
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);

    await expect(
      tokenizarCartao({ numero: "4000000000000010", nome: "FULANO DE TAL", validade: "12/35", cvv: "123" }),
    ).rejects.toThrow(/PIX/);
    expect(chamou).not.toHaveBeenCalled();
  });

  it("sem chave nenhuma, oferece PIX em vez de cobrar sem token", async () => {
    comChave("");
    const chamou = vi.fn();
    vi.stubGlobal("fetch", chamou);

    await expect(
      tokenizarCartao({ numero: "4000000000000010", nome: "FULANO DE TAL", validade: "12/35", cvv: "123" }),
    ).rejects.toMatchObject({ campo: "config" });
    expect(chamou).not.toHaveBeenCalled();
  });
});

describe("conversa com a Pagar.me", () => {
  it("manda a chave publica na query e devolve o token", async () => {
    comChave("pk_test_abc123");
    const fetchFalso = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "token_123", card: { last_four_digits: "0010", brand: "visa" } }),
    });
    vi.stubGlobal("fetch", fetchFalso);

    const r = await tokenizarCartao({
      numero: "4000 0000 0000 0010",
      nome: "FULANO DE TAL",
      validade: "12/35",
      cvv: "123",
    });

    expect(r).toEqual({ token: "token_123", ultimos4: "0010", bandeira: "visa" });

    const [url, opcoes] = fetchFalso.mock.calls[0];
    expect(url).toContain("appId=pk_test_abc123");
    const enviado = JSON.parse(opcoes.body);
    // Numero sem espaco e validade quebrada em mes/ano: e o que a API espera.
    expect(enviado.card.number).toBe("4000000000000010");
    expect(enviado.card.exp_month).toBe(12);
    expect(enviado.card.exp_year).toBe(2035);
  });

  it("queda de rede nao vira 'Failed to fetch' na cara do cliente", async () => {
    comChave("pk_test_abc123");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Failed to fetch")));

    await expect(
      tokenizarCartao({ numero: "4000000000000010", nome: "FULANO DE TAL", validade: "12/35", cvv: "123" }),
    ).rejects.toMatchObject({ campo: "rede" });
  });

  it("recusa da operadora vira texto em portugues, com o cru so no detalhe", async () => {
    comChave("pk_test_abc123");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ message: "invalid card number" }) }),
    );

    await expect(
      tokenizarCartao({ numero: "4000000000000010", nome: "FULANO DE TAL", validade: "12/35", cvv: "123" }),
    ).rejects.toMatchObject({ detalhe: "invalid card number" });
  });
});

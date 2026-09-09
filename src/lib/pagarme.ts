/**
 * Tokenização de cartão na Pagar.me, direto do navegador.
 *
 * Espelha `arqdoor-mobile/src/api/cardToken.ts` de propósito: as duas pontas conversam
 * com a mesma API e recusam pelos mesmos motivos. Divergir aqui significaria um cartão
 * aceito no app e recusado no site, ou vice-versa, sem ninguém entender por quê.
 *
 * POR QUE DIRETO DAQUI, e não pelo nosso backend:
 *   O número do cartão nunca pode passar pelo servidor da ArqDoor. É o que mantém a
 *   plataforma fora do escopo de PCI-DSS: o dado sensível vai do navegador para a
 *   Pagar.me, e o que volta é um token de uso único, inútil para quem o interceptar.
 *
 * POR QUE ISSO PASSOU A SER OBRIGATÓRIO:
 *   Produção passou a cobrar pela Pagar.me. Cartão sem token cai no checkout hospedado,
 *   que aceita o campo de divisão e o IGNORA em silêncio: o cliente pagaria, a tela
 *   confirmaria, e o profissional receberia zero. Por isso o backend recusa cartão sem
 *   token (`CARD_TOKEN_REQUIRED`), e por isso o site não vendia no cartão até aqui.
 */

const TOKENS_URL = "https://api.pagar.me/core/v5/tokens";

export interface DadosCartao {
  numero: string;
  nome: string;
  /** MM/AA ou MM/AAAA */
  validade: string;
  cvv: string;
}

export interface CartaoTokenizado {
  token: string;
  /** Últimos 4 dígitos, para a UI confirmar qual cartão foi usado. */
  ultimos4: string;
  bandeira: string;
}

export const soDigitos = (v: string) => (v ?? "").replace(/\D/g, "");

/** Só `pk_` pode viver no navegador. `sk_` autoriza mover dinheiro e nunca sai do servidor. */
export const chavePublicaPagarme = () =>
  String(import.meta.env.VITE_PAGARME_PUBLIC_KEY || "").trim();

export const cartaoDisponivel = () => chavePublicaPagarme().startsWith("pk_");

/** Luhn: pega dígito trocado antes de gastar uma ida à rede. */
export function numeroCartaoValido(numero: string): boolean {
  const d = soDigitos(numero);
  if (d.length < 13 || d.length > 19) return false;
  let soma = 0;
  let dobra = false;
  for (let i = d.length - 1; i >= 0; i -= 1) {
    let n = Number(d[i]);
    if (dobra) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobra = !dobra;
  }
  return soma % 10 === 0;
}

/** "12/30" ou "12/2030" → { mes: 12, ano: 2030 }. Null quando inválido ou vencido. */
export function parseValidade(validade: string): { mes: number; ano: number } | null {
  const d = soDigitos(validade);
  if (d.length !== 4 && d.length !== 6) return null;
  const mes = Number(d.slice(0, 2));
  if (mes < 1 || mes > 12) return null;
  const anoBruto = Number(d.slice(2));
  const ano = d.length === 4 ? 2000 + anoBruto : anoBruto;

  // Cartão vencido é recusa certa: melhor dizer aqui do que gastar a ida e voltar.
  const agora = new Date();
  const ultimoDia = new Date(ano, mes, 0, 23, 59, 59);
  if (ultimoDia < agora) return null;

  return { mes, ano };
}

export interface ErroCartao extends Error {
  /**
   * `numero`/`validade`/`cvv`/`nome` marcam o campo do formulário em vermelho.
   * `config` e `rede` não são campo: o problema não está no que o cliente digitou,
   * e a tela precisa oferecer outra forma de pagar em vez de pedir correção.
   */
  campo?: "numero" | "validade" | "cvv" | "nome" | "config" | "rede";
  /**
   * Texto cru da operadora, em inglês. Fica FORA da tela de propósito: serve para
   * log e suporte. O cliente lê `message`, escrito para ele.
   */
  detalhe?: string;
}

const erro = (mensagem: string, campo?: ErroCartao["campo"], detalhe?: string): ErroCartao => {
  const e = new Error(mensagem) as ErroCartao;
  e.campo = campo;
  if (detalhe) e.detalhe = detalhe;
  return e;
};

/**
 * Troca os dados do cartão por um token de uso único.
 *
 * ATENÇÃO: o token vale para UMA cobrança. Se o pagamento falhar e o cliente tentar de
 * novo, é preciso tokenizar outra vez. Reaproveitar devolve "Token not found".
 */
export async function tokenizarCartao(dados: DadosCartao): Promise<CartaoTokenizado> {
  const pk = chavePublicaPagarme();
  if (!pk.startsWith("pk_")) {
    throw erro(
      "Não é possível pagar com cartão neste momento. Use PIX para concluir agora.",
      "config",
    );
  }

  const numero = soDigitos(dados.numero);
  if (!numeroCartaoValido(numero)) {
    throw erro("Número do cartão inválido. Confira os dígitos impressos no cartão.", "numero");
  }

  const nome = (dados.nome ?? "").trim();
  if (nome.length < 3) throw erro("Informe o nome como está impresso no cartão.", "nome");

  const val = parseValidade(dados.validade);
  if (!val) {
    throw erro(
      "Validade inválida ou cartão vencido. Confira o mês e o ano impressos, ou use outro cartão.",
      "validade",
    );
  }

  const cvv = soDigitos(dados.cvv);
  if (cvv.length < 3 || cvv.length > 4) {
    throw erro(
      "CVV inválido. Digite os 3 dígitos do verso do cartão, ou os 4 da frente no Amex.",
      "cvv",
    );
  }

  let resposta: Response;
  try {
    resposta = await fetch(`${TOKENS_URL}?appId=${encodeURIComponent(pk)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "card",
        card: {
          number: numero,
          holder_name: nome,
          exp_month: val.mes,
          exp_year: val.ano,
          cvv,
        },
      }),
    });
  } catch (falhaDeRede) {
    // Sem este catch, queda de rede vira "Failed to fetch" em inglês dentro do bloco
    // vermelho do formulário, como se o cartão tivesse sido recusado. Nada foi enviado
    // nem cobrado aqui, e a mensagem precisa dizer isso e dar uma saída.
    throw erro(
      "Não foi possível falar com a operadora do cartão. Confira sua internet e tente de novo. Você não foi cobrado.",
      "rede",
      (falhaDeRede as Error)?.message,
    );
  }

  const corpo = await resposta.json().catch(() => null);

  if (!resposta.ok || !corpo?.id) {
    const detalhe =
      corpo?.message ||
      (corpo?.errors ? Object.values(corpo.errors).flat().join(" ") : "") ||
      "";
    throw erro(
      "Não foi possível validar este cartão. Confira número, validade e CVV, use outro cartão, ou pague com PIX.",
      undefined,
      detalhe,
    );
  }

  return {
    token: corpo.id,
    ultimos4: corpo.card?.last_four_digits ?? numero.slice(-4),
    bandeira: corpo.card?.brand ?? "",
  };
}

/** Máscaras dos campos, para o formulário não precisar reimplementar. */
export const mascaraNumero = (v: string) =>
  soDigitos(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const mascaraValidade = (v: string) => {
  const d = soDigitos(v).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

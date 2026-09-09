/**
 * O diálogo de assinatura.
 *
 * Até 2026-09-09 conta criada pelo Google simplesmente NÃO conseguia assinar: ela nasce
 * com uma senha aleatória que o usuário nunca vê, e a tela pedia "sua senha de
 * assinatura". O bloqueio ainda se baseava em `signature_password_set`, que o backend liga
 * sozinho em todo login e nunca significou "definiu senha de assinatura".
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignatureDialog } from "@/components/modals/SignatureDialog";

const base = {
  open: true,
  onOpenChange: vi.fn(),
  ackChecked: true,
  setAckChecked: vi.fn(),
  signaturePassword: "",
  setSignaturePassword: vi.fn(),
  showPasswordField: true,
  signingDocument: false,
  onAgree: vi.fn(),
  onConfirm: vi.fn(),
};

describe("conta Google", () => {
  it("mostra as três opções em vez de pedir senha direto", () => {
    render(
      <SignatureDialog
        {...base}
        isGoogleAccount
        signaturePasswordConfigured={false}
        onConfirmWithGoogle={vi.fn()}
      />
    );

    expect(screen.getByText(/Confirmar com minha conta Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Confirmar com senha/i)).toBeInTheDocument();
    expect(screen.getByText(/^Cancelar$/i)).toBeInTheDocument();
    // O campo de senha não pode aparecer antes da escolha.
    expect(screen.queryByPlaceholderText(/Digite sua senha/i)).not.toBeInTheDocument();
  });

  it("o botão da conta Google dispara a assinatura sem senha", () => {
    const comGoogle = vi.fn();
    render(
      <SignatureDialog {...base} isGoogleAccount onConfirmWithGoogle={comGoogle} />
    );

    fireEvent.click(screen.getByText(/Confirmar com minha conta Google/i));
    expect(comGoogle).toHaveBeenCalledTimes(1);
  });

  it("sem senha cadastrada, 'com senha' manda cadastrar em vez de abrir o campo", () => {
    // Abrir o campo aqui seria cruel: a senha que existe no banco é aleatória e o usuário
    // nunca a viu, então ele digitaria qualquer coisa e levaria "senha incorreta".
    render(
      <SignatureDialog
        {...base}
        isGoogleAccount
        signaturePasswordConfigured={false}
        onConfirmWithGoogle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Confirmar com senha/i));
    expect(screen.getByText(/ainda não tem senha de assinatura/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Digite sua senha/i)).not.toBeInTheDocument();
  });

  it("com senha cadastrada, 'com senha' abre o campo", () => {
    render(
      <SignatureDialog
        {...base}
        isGoogleAccount
        signaturePasswordConfigured
        onConfirmWithGoogle={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Confirmar com senha/i));
    expect(screen.getByPlaceholderText(/Digite sua senha/i)).toBeInTheDocument();
  });
});

describe("conta com e-mail e senha", () => {
  it("NAO ve a escolha: assina com a senha de login, como sempre", () => {
    render(<SignatureDialog {...base} isGoogleAccount={false} signaturePasswordConfigured={false} />);

    expect(screen.queryByText(/Confirmar com minha conta Google/i)).not.toBeInTheDocument();
    // E não é bloqueada por não ter senha SÓ de assinatura: a de login serve.
    expect(screen.queryByText(/ainda não tem senha de assinatura/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Digite sua senha/i)).toBeInTheDocument();
  });
});

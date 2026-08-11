import React, { useEffect, useState } from "react";
import {
  Barcode,
  Banknote,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/utils";
import type { PaymentDialogState, PaymentMethod } from "@/features/messages/types";
import { CreditCardInstallmentPicker } from "@/features/messages/components/CreditCardInstallmentPicker";

type StepPaymentDialogProps = {
  dialog: PaymentDialogState | null;
  onOpenChange: (open: boolean) => void;
  onChangeMethod: (method: PaymentMethod) => void;
  onGeneratePayment: (installmentCount?: number) => void;
  onCopyPaymentCode: (value?: string, toastMessage?: string) => void;
};

const paymentOptions = [
  { value: "PIX", title: "PIX", description: "QR Code e copia e cola", icon: QrCode },
  { value: "BOLETO", title: "Boleto", description: "Linha digitável e PDF", icon: Barcode },
  { value: "CREDIT_CARD", title: "Crédito", description: "Checkout seguro Asaas", icon: CreditCard },
  { value: "DEBIT_CARD", title: "Débito", description: "Checkout seguro Asaas", icon: Banknote },
] as const;

export function StepPaymentDialog({
  dialog,
  onOpenChange,
  onChangeMethod,
  onGeneratePayment,
  onCopyPaymentCode,
}: StepPaymentDialogProps) {
  const isAdditionalPaymentDialog = dialog?.type === "additional";
  const [installmentCount, setInstallmentCount] = useState<number | null>(null);
  const isCreditCard = dialog?.method === "CREDIT_CARD";

  useEffect(() => {
    setInstallmentCount(null);
  }, [dialog?.step?.id, dialog?.method]);

  return (
    <Dialog open={!!dialog} onOpenChange={onOpenChange}>
      <DialogContent
        onInteractOutside={(event) => {
          if (isAdditionalPaymentDialog) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isAdditionalPaymentDialog) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {dialog?.type === "deposit" 
              ? "Depósito em garantia" 
              : dialog?.type === "additional"
              ? "Pagamento adicional"
              : "Pagamento da etapa"}
            {dialog?.step?.title ? ` - ${dialog.step.title}` : ""}
          </DialogTitle>
          <DialogDescription>
            Escolha a forma de pagamento e gere a cobrança diretamente pelo Asaas.
          </DialogDescription>
        </DialogHeader>
        {dialog && (
          <div className="space-y-4">
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Forma de pagamento</span>
                {(() => {
                  const amountToShow = dialog.data?.amount ?? dialog.step?.price;
                  if (typeof amountToShow !== "number" || amountToShow <= 0) return null;
                  return (
                    <span className="text-gray-600">
                      Valor: {formatPrice(amountToShow || 0)}
                    </span>
                  );
                })()}
              </div>
              <RadioGroup
                value={dialog.method}
                onValueChange={(v) => onChangeMethod(v as PaymentMethod)}
                className="grid gap-2 sm:grid-cols-2"
              >
                {paymentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      htmlFor={`payment-${option.value}`}
                      className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:border-orange-500"
                    >
                      <RadioGroupItem value={option.value} id={`payment-${option.value}`} />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4 text-orange-600" />
                          {option.title}
                        </div>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
              {isCreditCard ? (
                <CreditCardInstallmentPicker
                  amount={dialog.data?.amount ?? dialog.amount ?? dialog.step?.price}
                  onChange={setInstallmentCount}
                />
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => onGeneratePayment(installmentCount ?? undefined)}
                  disabled={dialog.loading || (isCreditCard && installmentCount == null)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {dialog.loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="mr-2 h-4 w-4" />
                  )}
                  {dialog.data ? "Atualizar cobrança" : "Gerar cobrança"}
                </Button>
                {dialog.data?.invoice_url && (
                  <Button asChild variant="outline">
                    <a href={dialog.data.invoice_url} target="_blank" rel="noreferrer">
                      Abrir no Asaas
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {(() => {
              const paymentData = dialog.data;
              const activeMethod = (paymentData?.method as PaymentMethod) || dialog.method;

              if (!paymentData) {
                return (
                  <p className="text-sm text-gray-600">
                    Clique em &quot;Gerar cobrança&quot; para ver os dados de pagamento.
                  </p>
                );
              }

              const pixData = paymentData?.pix;
              const boletoData = paymentData?.boleto;
              const checkoutUrl = paymentData?.checkout_url || paymentData?.invoice_url;

              if (activeMethod === "PIX") {
                const enc = pixData?.qr_code_image;
                const src = enc
                  ? enc.startsWith("data:image")
                    ? enc
                    : `data:image/png;base64,${enc}`
                  : null;
                return (
                  <div className="space-y-3">
                    {src && (
                      <div className="flex flex-col items-center gap-2">
                        <img src={src} alt="QR Code PIX" className="w-44 h-44 object-contain" />
                        <span className="text-xs text-gray-500">Escaneie para pagar</span>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-1">Código copia e cola</p>
                      <div className="bg-gray-100 rounded-md p-2 text-xs break-all">
                        {pixData?.copy_and_paste || "Não disponível"}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onCopyPaymentCode(pixData?.copy_and_paste, "Código PIX copiado")
                          }
                          disabled={!pixData?.copy_and_paste}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" /> Copiar código
                        </Button>
                        {paymentData?.invoice_url && (
                          <Button asChild size="sm" variant="outline">
                            <a href={paymentData.invoice_url} target="_blank" rel="noreferrer">
                              <QrCode className="h-3.5 w-3.5 mr-1" /> Abrir no Asaas
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {pixData?.expires_at && (
                      <p className="text-xs text-gray-500">
                        Expira em {new Date(pixData.expires_at).toLocaleString("pt-BR")}
                      </p>
                    )}
                  </div>
                );
              }

              if (activeMethod === "BOLETO") {
                return (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Use a linha digitável ou abra o boleto para finalizar o pagamento.
                    </p>
                    <div className="bg-gray-100 rounded-md p-2 text-xs break-all">
                      {boletoData?.digitable_line || "Não disponível"}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onCopyPaymentCode(
                            boletoData?.digitable_line,
                            "Linha digitável copiada"
                          )
                        }
                        disabled={!boletoData?.digitable_line}
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copiar código
                      </Button>
                      {(boletoData?.pdf_url || paymentData?.invoice_url) && (
                        <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                          <a
                            href={boletoData?.pdf_url || paymentData?.invoice_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Barcode className="h-3.5 w-3.5 mr-1" /> Abrir boleto
                          </a>
                        </Button>
                      )}
                    </div>
                    {boletoData?.due_date && (
                      <p className="text-xs text-gray-500">
                        Vencimento em{" "}
                        {new Date(boletoData.due_date).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {paymentData?.credit_card_installment && (
                    <div className="flex items-center justify-between rounded-md bg-orange-50 px-3 py-2 text-sm">
                      <span className="font-medium text-orange-700">
                        {paymentData.credit_card_installment.installment_count}x de {formatPrice(paymentData.credit_card_installment.installment_value)}
                      </span>
                      <span className="flex flex-col items-end text-xs text-gray-600">
                        {paymentData.credit_card_installment.last_installment_value != null ? (
                          <span>Última {formatPrice(paymentData.credit_card_installment.last_installment_value)}</span>
                        ) : null}
                        <span>Total {formatPrice(paymentData.credit_card_installment.total_amount)}</span>
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Você será direcionado ao checkout seguro do Asaas para inserir os dados do cartão.
                  </p>
                  {checkoutUrl && (
                    <Button asChild className="bg-orange-600 hover:bg-orange-700">
                      <a href={checkoutUrl} target="_blank" rel="noreferrer">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Abrir checkout do cartão
                      </a>
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

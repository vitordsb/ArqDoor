import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrice, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Clock, DollarSign, Loader2, RefreshCcw } from "lucide-react";
import type { AdditionalPayment } from "@/lib/Interfaces";
import type { PaymentMethod } from "@/features/messages/types";

const PAID_PAYMENT_STATUSES = [
  "PAID",
  "RECEIVED",
  "RECEIVED_IN_CASH",
  "RECEIVED_MANUALLY",
  "CONFIRMED",
  "DUNNING_RECEIVED",
  "COMPENSATED",
];

const isPaidPaymentStatus = (status?: string) =>
  !!status && PAID_PAYMENT_STATUSES.includes(status.toUpperCase());

type AdditionalPaymentCardProps = {
  payment: AdditionalPayment;
  userType?: "prestador" | "contratante";
  onAccept?: (id: number, method: PaymentMethod) => Promise<void>;
  onRefuse?: (id: number, reason: string) => Promise<void>;
  onResume?: (payment: AdditionalPayment) => Promise<void>;
  onRefreshStatus?: (id: number) => Promise<void>;
  isProcessing?: boolean;
};

const STATUS_CONFIG: Record<
  AdditionalPayment["status"],
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }
> = {
  PENDING: {
    label: "Pendente",
    variant: "outline",
    icon: Clock,
  },
  ACCEPTED: {
    label: "Aguardando pagamento",
    variant: "default",
    icon: CheckCircle,
  },
  REFUSED: {
    label: "Recusada",
    variant: "destructive",
    icon: XCircle,
  },
  PAID: {
    label: "Paga",
    variant: "default",
    icon: DollarSign,
  },
  CANCELLED: {
    label: "Cancelada",
    variant: "secondary",
    icon: XCircle,
  },
};

export function AdditionalPaymentCard({
  payment,
  userType,
  onAccept,
  onRefuse,
  onResume,
  onRefreshStatus,
  isProcessing = false,
}: AdditionalPaymentCardProps) {
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [refuseReason, setRefuseReason] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");
  const refuseReasonId = `refuse-reason-${payment.id}`;
  const paymentMethodGroupName = `payment-method-${payment.id}`;

  const normalizedStatus = (payment.status || "PENDING") as AdditionalPayment["status"];
  const statusConfig = STATUS_CONFIG[normalizedStatus] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;
  const isClient = userType === "contratante";
  const canRespond = isClient && normalizedStatus === "PENDING" && !isProcessing;
  const paymentStatus = (payment.payment?.status || "").toUpperCase();
  const canResumePayment =
    isClient &&
    normalizedStatus === "ACCEPTED" &&
    !!payment.payment &&
    !isPaidPaymentStatus(paymentStatus) &&
    !isProcessing;

  const handleRefuse = async () => {
    if (!refuseReason.trim()) return;
    await onRefuse?.(payment.id, refuseReason.trim());
    setShowRefuseModal(false);
    setRefuseReason("");
  };

  const handleAccept = async () => {
    await onAccept?.(payment.id, selectedMethod);
    setShowAcceptModal(false);
  };

  return (
    <>
      <div className="rounded-lg border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm">{payment.title}</h4>
              <Badge variant={statusConfig.variant} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{payment.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-orange-600">
              {formatPrice(payment.amount)}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(payment.created_at)}
            </p>
          </div>
        </div>

        {payment.refusal_reason && normalizedStatus === "REFUSED" && (
          <div className="rounded-md bg-red-50 border border-red-200 p-2">
            <p className="text-xs font-medium text-red-800">Motivo da recusa:</p>
            <p className="text-xs text-red-700">{payment.refusal_reason}</p>
          </div>
        )}

        {canRespond && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => setShowRefuseModal(true)}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Recusar
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => setShowAcceptModal(true)}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Aceitar
            </Button>
          </div>
        )}

        {canResumePayment && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => onResume?.(payment)}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Continuar pagamento
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onRefreshStatus?.(payment.id)}
              disabled={isProcessing}
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Verificar
            </Button>
          </div>
        )}
      </div>

      {/* Modal de Recusar */}
      <Dialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Recusar Cobrança Adicional</DialogTitle>
            <DialogDescription>
              Informe o motivo da recusa desta cobrança.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={refuseReasonId}>
                Motivo da recusa <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id={refuseReasonId}
                placeholder="Explique o motivo da recusa..."
                value={refuseReason}
                onChange={(e) => setRefuseReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRefuseModal(false);
                  setRefuseReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRefuse}
                disabled={!refuseReason.trim() || isProcessing}
                variant="destructive"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Confirmar Recusa"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aceitar */}
      <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aceitar Cobrança Adicional</DialogTitle>
            <DialogDescription>
              Escolha a forma de pagamento para esta cobrança.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 bg-gray-50">
              <p className="text-sm font-medium mb-1">{payment.title}</p>
              <p className="text-xs text-gray-600 mb-2">{payment.description}</p>
              <p className="text-lg font-bold text-orange-600">
                {formatPrice(payment.amount)}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <div className="grid gap-2">
                {[
                  { value: "PIX", label: "PIX" },
                  { value: "BOLETO", label: "Boleto" },
                  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
                  { value: "DEBIT_CARD", label: "Cartão de Débito" },
                ].map((method) => (
                  <label
                    key={method.value}
                    className="flex items-center gap-2 p-3 rounded-md border cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={paymentMethodGroupName}
                      value={method.value}
                      checked={selectedMethod === method.value}
                      onChange={(e) =>
                        setSelectedMethod(e.target.value as PaymentMethod)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAcceptModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAccept}
                disabled={isProcessing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Aceitar e Gerar Pagamento"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

type InstallmentOption = {
  installment_count: number;
  installment_value: number;
  last_installment_value?: number;
  total_amount: number;
};

type CreditCardInstallmentPickerProps = {
  amount?: number;
  onChange: (installmentCount: number | null) => void;
};

export function CreditCardInstallmentPicker({
  amount,
  onChange,
}: CreditCardInstallmentPickerProps) {
  const [options, setOptions] = useState<InstallmentOption[]>([]);
  const [selectedCount, setSelectedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!amount || amount <= 0) {
        setOptions([]);
        setSelectedCount(null);
        onChange(null);
        return;
      }

      setLoading(true);
      setFailed(false);
      setSelectedCount(null);
      onChange(null);
      try {
        const response = await apiRequest("POST", "/payments/credit-card-installments", { amount });
        const payload = await response.json().catch(() => ({}));
        const nextOptions = Array.isArray(payload?.data?.options) ? payload.data.options : [];
        if (!response.ok || !nextOptions.length) throw new Error("Simulação indisponível");
        if (cancelled) return;

        setOptions(nextOptions);
        const firstCount = Number(nextOptions[0].installment_count);
        setSelectedCount(firstCount);
        onChange(firstCount);
      } catch {
        if (!cancelled) {
          setOptions([]);
          setFailed(true);
          onChange(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [amount, onChange]);

  return (
    <div className="rounded-md border border-orange-100 bg-orange-50/40 p-3">
      <p className="text-sm font-medium text-gray-900">Parcelamento no cartão</p>
      <p className="mb-3 text-xs text-gray-600">Valores finais para pagamento no cartão</p>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-orange-600" /></div>
      ) : failed ? (
        <p className="text-xs text-red-600">Não foi possível calcular as parcelas agora.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const active = option.installment_count === selectedCount;
            return (
              <Button
                key={option.installment_count}
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedCount(option.installment_count);
                  onChange(option.installment_count);
                }}
                className={active ? "h-auto justify-between border-orange-500 bg-orange-50 px-3 py-2 text-left" : "h-auto justify-between px-3 py-2 text-left"}
              >
                <span>{option.installment_count}x de {formatPrice(option.installment_value)}</span>
                <span className="flex flex-col items-end text-xs font-normal text-gray-500">
                  {option.last_installment_value != null ? <span>Última {formatPrice(option.last_installment_value)}</span> : null}
                  <span>Total {formatPrice(option.total_amount)}</span>
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

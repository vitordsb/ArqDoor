import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check, X, AlertCircle } from "lucide-react";
import { Step, StepStatus } from "@/lib/Interfaces";
import { formatPrice } from "@/lib/utils";
import { isSignatureContractStep } from "@/constants/contracts";

export interface ContractStepProps {
  step: Step;
  currentStep: number;
  isLastStep: boolean;
  isProvider: boolean;
  onAccept: (stepId: number) => Promise<void>;
  onReject: (stepId: number, reason?: string) => Promise<void>;
  onComplete: (stepId: number) => Promise<void>;
}

export function ContractStep({
  step,
  currentStep,
  isLastStep,
  isProvider,
  onAccept,
  onReject,
  onComplete,
}: ContractStepProps) {
  const isActive = step.id === currentStep;
  const isCompleted = step.status === 'Concluido';
  const isRejected = step.status === 'Recusado';
  const isPending = step.status === 'Pendente';
  const isAwaitingConfirmation = step.status === 'Pendente';

  const canInteract = isActive && !isCompleted && !isRejected;
  const showProviderActions = isProvider && (isPending || isAwaitingConfirmation);
  const showClientActions = !isProvider && isAwaitingConfirmation;

  const isSignatureStep = isSignatureContractStep(step);
  return (
    <Card className={`mb-4 ${isActive ? 'border-2 border-primary' : ''}`}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{step.title}</h3>
            <p className="text-sm text-muted-foreground">
              {isSignatureStep ? "Contrato PDF (sem custo)" : formatPrice(Number(step.price))}
            </p>
            {step.status && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                step.status === 'Concluido' ? 'bg-green-100 text-green-800' :
                step.status === 'Recusado' ? 'bg-red-100 text-red-800' :
                step.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {step.status === 'Concluido' ? 'Concluído' :
                 step.status === 'Recusado' ? 'Recusado' :
                 step.status === 'Pendente' ? 'Pendente' : 'Aguardando Confirmação'}
              </span>
            )}
          </div>
          
          {isCompleted && (
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-4 w-4 text-green-600" />
            </div>
          )}
          {isRejected && (
            <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
              <X className="h-4 w-4 text-red-600" />
            </div>
          )}
        </div>

        {isRejected && step.rejection_reason && (
          <div className="mt-2 p-2 bg-red-50 rounded-md text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>Rejection reason: {step.rejection_reason}</span>
          </div>
        )}
      </CardContent>

      {canInteract && (
        <CardFooter className="flex gap-2 pt-0">
          {(showProviderActions || showClientActions) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(step.id, 'Step was rejected')}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          )}
          
          {showProviderActions && (
            <Button
              size="sm"
              onClick={() => onComplete(step.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" /> Mark as Complete
            </Button>
          )}
          
          {showClientActions && (
            <Button
              size="sm"
              onClick={() => onAccept(step.id)}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

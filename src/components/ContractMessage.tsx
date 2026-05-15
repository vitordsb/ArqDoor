import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { Check, Clock, DollarSign, File, Shield, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Step } from "@/lib/Interfaces";
import { ContractStep } from "./ContractStep";
import { useState, useEffect } from "react";
import { SIGNATURE_STEP_TITLE, isSignatureContractStep } from "@/constants/contracts";

export interface ContractMessageProps {
  contract: {
    id: string;
    ticketId: number;
    serviceDescription: string;
    price: number;
    terms: string;
    status: 'pending' | 'accepted' | 'rejected' | 'paid' | 'in_progress' | 'completed' | 'canceled';
    steps: Step[];
    currentStep: number;
    createdAt: Date | string;
    isFromCurrentUser: boolean;
    isProvider: boolean;
  };
  onAccept?: (contractId: string) => Promise<void>;
  onReject?: (contractId: string, reason?: string) => Promise<void>;
  onPay?: (contractId: string) => Promise<void>;
  onStepAccept?: (stepId: number) => Promise<void>;
  onStepReject?: (stepId: number, reason?: string) => Promise<void>;
  onStepComplete?: (stepId: number) => Promise<void>;
}

export function ContractMessage({ 
  contract, 
  onAccept, 
  onReject, 
  onPay, 
  onStepAccept, 
  onStepReject, 
  onStepComplete 
}: ContractMessageProps) {
  const { 
    id, 
    ticketId,
    serviceDescription, 
    price, 
    terms, 
    status, 
    steps = [],
    currentStep = 1,
    createdAt, 
    isFromCurrentUser,
    isProvider
  } = contract;
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAccept = async () => {
    if (onAccept) {
      await onAccept(id);
    }
  };
  
  const handleReject = async (reason?: string) => {
    if (onReject) {
      await onReject(id, reason);
    }
  };
  
  const handlePay = async () => {
    if (onPay) {
      await onPay(id);
    }
  };

  const handleSignContract = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }
    
    try {
      setIsSigning(true);
      setError('');
      
      // Call the API to sign the contract
      const res = await fetch(`/api/ticket/signature/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: true, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to sign contract');
      }
      
      // Refresh the contract data
      if (onAccept) {
        await onAccept(id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign contract');
    } finally {
      setIsSigning(false);
    }
  };
  
  const totalPrice = steps
    .filter((step) => !isSignatureContractStep(step))
    .reduce((sum, step) => sum + Number(step.price || 0), 0);
  const isContractSigned = status !== 'pending';
  const isContractRejected = status === 'rejected';
  const isContractCompleted = status === 'completed';
  const isContractCanceled = status === 'canceled';
  const isContractInProgress = status === 'in_progress';
  
  return (
    <Card className="w-full max-w-2xl shadow-md border-2 border-muted">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold flex items-center gap-1">
            <File className="h-4 w-4" /> 
            Service Contract
          </CardTitle>
          <div className={`px-2 py-1 rounded-full text-xs ${
            status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
            status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
            status === 'rejected' || status === 'canceled' ? 'bg-red-100 text-red-700' : 
            status === 'completed' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {status === 'pending' && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending Signature</span>}
            {status === 'accepted' && <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Signed</span>}
            {status === 'rejected' && <span className="flex items-center gap-1"><X className="h-3 w-3" /> Rejected</span>}
            {status === 'paid' && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Paid</span>}
            {status === 'in_progress' && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> In Progress</span>}
            {status === 'completed' && <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Completed</span>}
            {status === 'canceled' && <span className="flex items-center gap-1"><X className="h-3 w-3" /> Canceled</span>}
          </div>
        </div>
        <CardDescription>{formatRelativeTime(createdAt.toString())}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Service</h4>
            <p className="text-sm">{serviceDescription}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Total Price</h4>
            <p className="text-base font-bold">{formatPrice(totalPrice || price)}</p>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium">Terms & Conditions</h4>
            <div className="text-xs whitespace-pre-line bg-muted/50 p-2 rounded mt-1">
              {terms || 'No additional terms specified.'}
            </div>
          </div>
          
          {steps.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Project Steps</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 text-xs"
                >
                  {isExpanded ? 'Hide' : 'Show'} Steps
                </Button>
              </div>
              
              {isExpanded && (
                <div className="space-y-2 mt-2">
                  {steps.map((step, index) => (
                    <ContractStep
                      key={step.id}
                      step={step}
                      currentStep={currentStep}
                      isLastStep={index === steps.length - 1}
                      isProvider={isProvider}
                      onAccept={onStepAccept || (() => Promise.resolve())}
                      onReject={onStepReject || (() => Promise.resolve())}
                      onComplete={onStepComplete || (() => Promise.resolve())}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      {!isFromCurrentUser && (
        <CardFooter className="pt-0 flex flex-col gap-2">
          {status === 'pending' && !isSigning && (
            <div className="w-full space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Please enter your password to sign this contract
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleReject('Contract rejected by user')}
                  disabled={isSigning}
                >
                  <X className="h-4 w-4 mr-1" /> Decline
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSignContract}
                  disabled={isSigning || !password}
                >
                  {isSigning ? 'Signing...' : (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Sign Contract
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
            </div>
          )}
          
          {isSigning && (
            <div className="w-full text-center py-2">
              <p className="text-sm text-muted-foreground">Processing your signature...</p>
            </div>
          )}
          
          {isContractRejected && (
            <p className="text-sm text-red-500 text-center w-full py-2">
              This contract has been rejected.
            </p>
          )}
          
          {isContractCanceled && (
            <p className="text-sm text-red-500 text-center w-full py-2">
              This contract has been canceled.
            </p>
          )}
          
          {isContractCompleted && (
            <p className="text-sm text-green-600 text-center w-full py-2">
              This contract has been successfully completed!
            </p>
          )}
          
          {isContractInProgress && (
            <p className="text-sm text-blue-600 text-center w-full py-2">
              Contract in progress - {currentStep} of {steps.length} steps completed
            </p>
          )}
          
          {status === 'accepted' && (
            <Button 
              size="sm" 
              className="w-full mt-2" 
              onClick={handlePay}
            >
              <DollarSign className="h-4 w-4 mr-1" /> Make Payment
            </Button>
          )}
        </CardFooter>
      )}
      
      {contract.isFromCurrentUser && (
        <CardFooter className="pt-0">
          <div className="w-full text-xs text-center text-muted-foreground flex items-center justify-center">
            <Shield className="h-3 w-3 mr-1" /> 
            {contract.isFromCurrentUser ? 'Waiting for response' : 'Secured by Z Platform'}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

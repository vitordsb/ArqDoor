import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Loader2 } from 'lucide-react'

interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ackChecked: boolean
  setAckChecked: (checked: boolean) => void
  signaturePassword: string
  setSignaturePassword: (password: string) => void
  showPasswordField: boolean
  signingDocument: boolean
  onAgree: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  agreeLabel?: string
  passwordPlaceholder?: string
  requireAck?: boolean
}

export function SignatureDialog({
  open,
  onOpenChange,
  ackChecked,
  setAckChecked,
  signaturePassword,
  setSignaturePassword,
  showPasswordField,
  signingDocument,
  onAgree,
  onConfirm,
  title = 'Assinatura Digital',
  description = 'Confirme os termos e insira sua senha.',
  confirmLabel = 'Assinar',
  agreeLabel = 'Prosseguir',
  passwordPlaceholder = 'Digite sua senha',
  requireAck = true,
}: SignatureDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {requireAck && (
            <div className="flex items-center gap-2">
              <Checkbox checked={ackChecked} onCheckedChange={c => setAckChecked(!!c)} id="ack" />
              <label htmlFor="ack" className="text-sm">
                Eu aceito os{' '}
                <a href="/termos-de-uso" className="underline cursor-pointer">
                  Termos de uso
                </a>{' '}
                da plataforma
              </label>
            </div>
          )}

          {!showPasswordField ? (
            <Button
              onClick={onAgree}
              disabled={requireAck ? !ackChecked : false}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {agreeLabel}
            </Button>
          ) : (
            <>
              <Input
                type="password"
                placeholder={passwordPlaceholder}
                value={signaturePassword}
                onChange={e => setSignaturePassword(e.target.value)}
              />
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={onConfirm}
                disabled={signingDocument || !signaturePassword.trim()}
              >
                {signingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Shield className="h-4 w-4 mr-1" />
                )}
                {confirmLabel}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

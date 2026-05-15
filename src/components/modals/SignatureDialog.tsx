import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Loader2, AlertTriangle } from 'lucide-react'
import { useLocation } from 'wouter'

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
  /** Se false, mostra aviso ao invés do input de senha. */
  signaturePasswordConfigured?: boolean
  /** Para mostrar mensagem específica para contas Google. */
  isGoogleAccount?: boolean
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
  signaturePasswordConfigured = true,
  isGoogleAccount = false,
}: SignatureDialogProps) {
  const [, navigate] = useLocation()
  const blocked = !signaturePasswordConfigured

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {blocked ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold">Você ainda não tem senha de assinatura.</p>
                <p className="mt-1">
                  {isGoogleAccount
                    ? "Como sua conta entrou pelo Google, precisamos de uma senha específica para assinar contratos com segurança."
                    : "Para assinar contratos com segurança, defina uma senha de assinatura no seu perfil."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Voltar
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  onOpenChange(false)
                  navigate("/profile?tab=security")
                }}
              >
                Ir para o perfil
              </Button>
            </div>
          </div>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  )
}

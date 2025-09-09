import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Shield, Loader2 } from 'lucide-react'

export function SignatureDialog({
  open, onOpenChange,
  ackChecked, setAckChecked,
  signaturePassword, setSignaturePassword,
  showPasswordField, setShowPasswordField,
  signingDocument, onAgree, onConfirm
}: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assinatura Digital</DialogTitle>
          <DialogDescription>Confirme os termos e insira sua senha.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox checked={ackChecked} onCheckedChange={(c) => setAckChecked(!!c)} id="ack" />
            <label htmlFor="ack" className="text-sm">Eu aceito os termos.</label>
          </div>

          {!showPasswordField ? (
            <Button onClick={onAgree} disabled={!ackChecked} className="w-full bg-purple-600 hover:bg-purple-700">
              Prosseguir
            </Button>
          ) : (
            <>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={signaturePassword}
                onChange={(e) => setSignaturePassword(e.target.value)}
              />
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={onConfirm}
                disabled={signingDocument || !signaturePassword.trim()}
              >
                {signingDocument ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4 mr-1" />}
                Assinar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

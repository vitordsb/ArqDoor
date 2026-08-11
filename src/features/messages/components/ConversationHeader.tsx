import { Conversation } from '@/lib/Interfaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { getInitials } from '@/lib/utils';

interface ConversationHeaderProps {
  conversation: Conversation;
  canCreateProposal: boolean;
  canViewProfile?: boolean;
  onOpenProposal: () => void;
  onViewProfile: () => void;
  onBack?: () => void;
}

export function ConversationHeader({
  conversation,
  canCreateProposal,
  canViewProfile = true,
  onOpenProposal,
  onViewProfile,
  onBack,
}: ConversationHeaderProps) {
  return (
    <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-1"
            onClick={onBack}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.otherUser.avatar || conversation.otherUser.perfil || undefined} />
          <AvatarFallback className="bg-orange-100 text-orange-700">
            {getInitials(conversation.otherUser.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-gray-900">
            {conversation.otherUser.name}
          </h2>
          <Badge
            variant={
              conversation.otherUser.type === 'prestador'
                ? 'default'
                : 'secondary'
            }
            className="text-xs"
          >
            {conversation.otherUser.type === 'prestador'
              ? 'Prestador'
              : 'Cliente'}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {canViewProfile && (
          <Button variant="outline" onClick={onViewProfile}>
            Ver perfil
          </Button>
        )}
        {canCreateProposal && (
          <Button
            onClick={onOpenProposal}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Nova Proposta
          </Button>
        )}
      </div>
    </div>
  );
}

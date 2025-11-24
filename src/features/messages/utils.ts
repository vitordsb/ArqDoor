import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatMessageTime = (date?: string) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  } catch {
    return '';
  }
};

export const formatConversationTime = (date?: string) => {
  if (!date) return '';
  try {
    const conversationDate = new Date(date);
    const now = new Date();
    const hoursDiff = (now.getTime() - conversationDate.getTime()) / 36e5;
    return hoursDiff < 24
      ? format(conversationDate, 'HH:mm', { locale: ptBR })
      : format(conversationDate, 'dd/MM', { locale: ptBR });
  } catch {
    return '';
  }
};

export const sortTicketsDesc = (a: any, b: any) => {
  const aT = new Date(a?.updated_at || a?.created_at || 0).getTime();
  const bT = new Date(b?.updated_at || b?.created_at || 0).getTime();
  if (!isNaN(aT) && !isNaN(bT) && aT !== bT) return bT - aT;
  return (b?.id || 0) - (a?.id || 0);
};

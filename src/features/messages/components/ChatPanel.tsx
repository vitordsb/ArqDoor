import { MutableRefObject, FormEvent, ReactNode } from 'react';
import { Message } from '@/lib/Interfaces';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { formatMessageTime } from '../utils';

interface ChatPanelProps {
  messages: Message[];
  currentUserId?: number;
  newMessage: string;
  sendingMessage: boolean;
  onMessageChange: (value: string) => void;
  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;
  messagesEndRef: MutableRefObject<HTMLDivElement | null>;
  composerAction?: ReactNode;
}

export function ChatPanel({
  messages,
  currentUserId,
  newMessage,
  sendingMessage,
  onMessageChange,
  onSendMessage,
  messagesEndRef,
  composerAction,
}: ChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {messages.map((m, idx) => (
              <div
                key={m.id ?? m.tempId ?? `msg-${idx}`}
                className={`flex ${
                  m.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    m.sender_id === currentUserId
                      ? 'bg-orange-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{m.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      m.sender_id === currentUserId
                        ? 'text-orange-100'
                        : 'text-gray-500'
                    }`}
                  >
                    {formatMessageTime(m.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div
              ref={node => {
                if (!messagesEndRef) return;
                messagesEndRef.current = node;
              }}
            />
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={onSendMessage} className="flex gap-2 items-center">
          {composerAction ? <div className="shrink-0">{composerAction}</div> : null}
          <Input
            value={newMessage}
            onChange={e => onMessageChange(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            disabled={sendingMessage}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || sendingMessage}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {sendingMessage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

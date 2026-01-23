import { Clock } from 'lucide-react';
import { useElapsedTime } from '@/hooks/useElapsedTime';
import { cn } from '@/lib/utils';

interface TimerProps {
  startDate: string | Date | null;
  endDate?: string | Date | null;
  label?: string;
  variant?: 'default' | 'compact' | 'badge';
  showIcon?: boolean;
  className?: string;
}

export function Timer({ 
  startDate, 
  endDate, 
  label = 'Tempo decorrido',
  variant = 'default',
  showIcon = true,
  className 
}: TimerProps) {
  const elapsed = useElapsedTime(startDate);
  
  if (!startDate) return null;

  // Se já foi concluído, mostrar tempo total
  if (endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    let totalTime = '';
    if (days > 0) totalTime = `${days}d ${hours}h ${minutes}m`;
    else if (hours > 0) totalTime = `${hours}h ${minutes}m`;
    else totalTime = `${minutes}m`;

    return (
      <div className={cn(
        "flex items-center gap-2 text-sm text-gray-600",
        variant === 'badge' && "bg-gray-100 px-2 py-1 rounded-md",
        className
      )}>
        {showIcon && <Clock className="h-4 w-4" />}
        <span className="font-medium">Concluído em: {totalTime}</span>
      </div>
    );
  }

  // Cronômetro ativo
  return (
    <div className={cn(
      "flex items-center gap-2",
      variant === 'default' && "text-sm text-blue-600",
      variant === 'compact' && "text-xs text-gray-500",
      variant === 'badge' && "bg-blue-50 px-3 py-1.5 rounded-md text-blue-700",
      className
    )}>
      {showIcon && <Clock className={cn(
        variant === 'default' && "h-4 w-4",
        variant === 'compact' && "h-3 w-3",
        variant === 'badge' && "h-4 w-4"
      )} />}
      <div className="flex flex-col">
        {variant !== 'compact' && (
          <span className="text-xs text-gray-500">{label}</span>
        )}
        <span className={cn(
          "font-mono font-semibold",
          variant === 'badge' && "text-base"
        )}>
          {elapsed}
        </span>
      </div>
    </div>
  );
}

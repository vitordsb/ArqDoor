import { useState, useEffect } from 'react';

export function useElapsedTime(startDate: string | Date | null) {
  const [elapsed, setElapsed] = useState<string>('');

  useEffect(() => {
    if (!startDate) {
      setElapsed('Não iniciado');
      return;
    }

    const updateElapsed = () => {
      const start = new Date(startDate);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      
      // Calcular dias, horas, minutos, segundos
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (days > 0) {
        setElapsed(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setElapsed(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setElapsed(`${minutes}m ${seconds}s`);
      } else {
        setElapsed(`${seconds}s`);
      }
    };

    // Atualizar imediatamente
    updateElapsed();

    // Atualizar a cada segundo
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  return elapsed;
}

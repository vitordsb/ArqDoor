
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return "Data inválida";
  }
};
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}
export function formatTotalDurationFromDays(totalDays: number | null | undefined): string | null {
  if (totalDays == null || totalDays <= 0 || isNaN(totalDays)) {
    return null; // Retorna nulo se não houver dias válidos
  }

  // Arredonda para o inteiro mais próximo, caso venha quebrado
  const daysInt = Math.round(totalDays);

  const years = Math.floor(daysInt / 365);
  const remainingDaysAfterYears = daysInt % 365;
  const months = Math.floor(remainingDaysAfterYears / 30); // Aproximação: mês = 30 dias
  const days = remainingDaysAfterYears % 30;

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} ano${years > 1 ? 's' : ''}`);
  }
  if (months > 0) {
    parts.push(`${months} ${months > 1 ? 'meses' : 'mês'}`);
  }
  // Só mostra dias se for a única unidade ou se houver anos/meses também
  if (days > 0 || (years === 0 && months === 0 && daysInt > 0)) {
    // Se for exatamente 1 dia e não tiver anos/meses, mostra só "1 dia"
    if (daysInt === 1 && years === 0 && months === 0) {
      parts.push(`1 dia`);
    } else if (days > 0) { // Senão, mostra os dias restantes normalmente
      parts.push(`${days} dia${days > 1 ? 's' : ''}`);
    }
  }


  if (parts.length === 0) {
    // Se por algum motivo deu 0 dias após arredondar e calcular
    return daysInt === 1 ? "1 dia" : `${daysInt} dias`;
  } else if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return parts.join(" e ");
  } else {
    // Para 3 partes (anos, meses e dias)
    return `${parts[0]}, ${parts[1]} e ${parts[2]}`;
  }
}
export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
export function formatCEP(cep: string): string {
  return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
}
export function formatEmail(email: string): string {
  return email.replace(/(.*)@(.*)/, "$1***@$2");
}
export function parseJwt<T = any>(token: string): T | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const normalized = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
    const base64 = normalized + padding;
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Retorna as iniciais de um nome. Se `name` for vazio ou não definido, retorna string vazia.
 */
export function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name
    .split(" ")
    .filter((n) => n.length > 0);
  if (parts.length === 0) return "";
  // Pega a primeira letra de cada parte (até 2 partes)
  const initials = parts
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
  return initials;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}

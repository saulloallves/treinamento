/**
 * Formata uma string de valor para o formato de moeda BRL (R$).
 * @param value A string a ser formatada.
 * @returns A string formatada como moeda, ou uma string vazia se a entrada for inválida.
 */
export const formatCurrency = (value: string): string => {
  // Remove todos os caracteres que não são dígitos
  const numericValue = value.replace(/\D/g, '');

  // Se não houver valor numérico, retorna uma string vazia
  if (!numericValue) {
    return '';
  }

  // Converte a string de dígitos para um número, tratando como centavos
  const numberValue = parseFloat(numericValue) / 100;

  // Usa a API Intl.NumberFormat para formatar como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numberValue);
};